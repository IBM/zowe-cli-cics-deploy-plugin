/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
* Copyright IBM Corp, 2019
*
*/

"use strict";

import { IHandlerParameters, AbstractSession, ITaskWithStatus, TaskStage } from "@zowe/imperative";
import { List, ZosmfSession, SshSession, Shell, Upload, IUploadOptions, ZosFilesAttributes } from "@zowe/cli";
import { BundleDeployer } from "../BundleDeploy/BundleDeployer";
import { Bundle } from "../BundleContent/Bundle";


/**
 * Class to represent a CICS Bundle Pusher.
 *
 * @export
 * @class BundlePusher
 */
export class BundlePusher {

  private params: IHandlerParameters;
  private localDirectory: string;
  private sshOutputText: string = "";
  private path = require("path");
  private fs = require("fs");
  private progressBar: ITaskWithStatus;

  /**
   * Constructor for a BundlePusher.
   * @param {IHandlerParameters} params - The Imperative handler parameters
   * @param {string} localDirectory - The bundle directory.
   * @throws ImperativeError
   * @memberof BundlePusher
   */
  constructor(params: IHandlerParameters, localDirectory: string) {
    this.params = params;
    this.localDirectory = localDirectory;
    this.validateParameters();

    // Construct a bundledir from the targetdir and bundle name
    this.params.arguments.bundledir = this.path.posix.join(this.params.arguments.targetdir, this.params.arguments.name);
  }

  public async performPush(): Promise<string> {
    // Start by validating any parameters that will be used by the deploy action,
    // this should flush out most input errors before we go on to attempt upload
    // of the bundle
    const bd = new BundleDeployer(this.params);
    bd.validateDeployParms();

    // Check that the current working directory is a CICS bundle
    const bundle = new Bundle(this.localDirectory, true, true);
    bundle.validate();

    // Create a zOSMF session
    const zosMFSession = await this.createZosMFSession();
    // Create an SSH session
    const sshSession = await this.createSshSession();

    // Start a progress bar
    this.progressBar = { percentComplete: 0,
                         statusMessage: "Starting Push operation",
                         stageName: TaskStage.IN_PROGRESS };
    this.params.response.progress.startBar({task: this.progressBar});

    // Attempt to make the target bundledir
    await this.makeBundleDir(sshSession);

    // Check that the remote bundledir is suitable.
    await this.validateBundleDirExistsAndIsEmpty(zosMFSession);

    // If --overwrite is set then undeploy any existing bundle from CICS
    if (this.params.arguments.overwrite) {
      await this.undeployExistingBundle(zosMFSession, bd);
    }

    // If --overwrite is set then empty the remote directory structure
    if (this.params.arguments.overwrite) {
     await this.deleteBundleDirContents(sshSession);
    }

    // Upload the bundle
    await this.uploadBundle(zosMFSession);

    // If there's a package.json file in the root of the bundle then run npm install
    if (bundle.contains("package.json")) {
      await this.runNpmInstall(sshSession);
    }

    // Run DFHDPLOY to install the bundle
    await this.deployBundle(zosMFSession, bd);

    this.params.response.progress.endBar();
    return "PUSH operation completed.";
  }

  private validateParameters() {
    // Most of the parameters are validated by the bundle deployer, but we have
    // to check the --name and --targetdir parameters here, as they are used
    // to construct one of the values used by the BundleDeployer.
    this.validateName();
    this.validateTargetdir();
  }

  private validateName() {
    // Name is mandatory
    if (this.params.arguments.name === undefined) {
      throw new Error("--name parameter is not set");
    }

    if (typeof this.params.arguments.name !== "string") {
      throw new Error("--name parameter is not a string");
    }

    const MAX_LEN = 8;
    if (this.params.arguments.name.length > MAX_LEN) {
      throw new Error("--name parameter is too long");
    }

    if (this.params.arguments.name === "") {
      throw new Error("--name parameter is empty");
    }
  }

  private validateTargetdir() {
    // targetdir is mandatory
    if (this.params.arguments.targetdir === undefined) {
      throw new Error("--targetdir parameter is not set");
    }

    if (typeof this.params.arguments.targetdir !== "string") {
      throw new Error("--targetdir parameter is not a string");
    }

    const MAX_LEN = 255;
    if (this.params.arguments.targetdir.length > MAX_LEN) {
      throw new Error("--targetdir parameter is too long");
    }

    if (this.params.arguments.targetdir === "") {
      throw new Error("--targetdir parameter is empty");
    }
  }

  private async createZosMFSession(): Promise<AbstractSession> {
    // Create a zosMF session
    const zosmfProfile = this.params.profiles.get("zosmf");

    if (zosmfProfile === undefined) {
      throw new Error("No zosmf profile found");
    }
    return ZosmfSession.createBasicZosmfSession(zosmfProfile);
  }

  private async createSshSession(): Promise<SshSession> {
    // Create a zosMF session
    const sshProfile = this.params.profiles.get("ssh");

    if (sshProfile === undefined) {
      throw new Error("No ssh profile found");
    }
    return SshSession.createBasicSshSession(sshProfile);
  }

  private async validateBundleDirExistsAndIsEmpty(zosMFSession: AbstractSession) {
    try {
      this.updateStatus("Accessing contents of remote bundle directory");

      const fileListResponse = await List.fileList(zosMFSession, this.params.arguments.bundledir, {});

      if (!fileListResponse.success) {
        throw new Error("Command Failed.");
      }

      if (fileListResponse.apiResponse === undefined) {
        throw new Error("Command response is empty.");
      }

      if (fileListResponse.apiResponse.items === undefined) {
        throw new Error("Command response items are missing.");
      }

      // There are always at least two files in all directories: . and ..
      const MIN_FILES = 2;

      // Check that if there are files in the directory, one of them is called META-INF
      let foundMETAINF = false;
      if (fileListResponse.apiResponse.items.length > MIN_FILES) {
        for (const file of fileListResponse.apiResponse.items) {
          if (file.name === "META-INF") {
            foundMETAINF = true;
          }
        }
        if (!foundMETAINF) {
          throw new Error("The remote directory is already populated and does not contain a bundle.");
        }
      }

      // Check that --overwrite is set if the directory is not empty
      if (fileListResponse.apiResponse.items.length > MIN_FILES && this.params.arguments.overwrite !== true) {
        throw new Error("The remote directory has existing content and --overwrite has not been set.");
      }
    }
    catch (error) {
      throw new Error("A problem occurred accessing remote bundle directory '" + this.params.arguments.bundledir +
                       "'. Problem is: " + error.message);
    }
  }

  private async undeployExistingBundle(zosMFSession: AbstractSession, bd: BundleDeployer) {
    // End the current progress bar so that UNDEPLOY can create its own
    this.updateStatus("Undeploying any existing bundle from CICS");
    this.params.response.progress.endBar();

    const targetstateLocal = this.params.arguments.targetstate;
    this.params.arguments.targetstate = "DISCARDED";
    await bd.undeployBundle(zosMFSession);
    this.params.arguments.targetstate = targetstateLocal;

    // Resume the current progress bar
    this.params.response.progress.endBar();
    this.updateStatus("Undeployed existing bundle from CICS");
    this.params.response.progress.startBar({task: this.progressBar});
  }

  private async deployBundle(zosMFSession: AbstractSession, bd: BundleDeployer) {
    // End the current progress bar so that DEPLOY can create its own
    this.updateStatus("Deploying the bundle to CICS");
    this.params.response.progress.endBar();

    await bd.deployBundle(zosMFSession);
    // Resume the current progress bar
    this.params.response.progress.endBar();
    this.updateStatus("Deployed existing bundle to CICS");
    this.params.response.progress.startBar({task: this.progressBar});
  }

  private sshOutput(data: string) {
    this.sshOutputText += data;
  }

  private async makeBundleDir(sshSession: SshSession) {
    this.updateStatus("Making remote bundle directory");
    await this.runSshCommandInRemoteDirectory(sshSession, this.params.arguments.targetdir, "mkdir " + this.params.arguments.name);
  }

  private async deleteBundleDirContents(sshSession: SshSession) {
    this.updateStatus("Removing the contents of the remote bundle directory");
    await this.runSshCommandInRemoteDirectory(sshSession, this.params.arguments.bundledir, "rm -r *");
  }

  private async runNpmInstall(sshSession: SshSession) {
    this.updateStatus("Running npm install for the remote bundle");
    await this.runSshCommandInRemoteDirectory(sshSession, this.params.arguments.bundledir, "npm install");
  }

  private async runSshCommandInRemoteDirectory(sshSession: SshSession, directory: string, sshCommand: string) {
    try {
      this.sshOutputText = "";
      const shell = await Shell.executeSshCwd(sshSession, sshCommand, directory, this.sshOutput.bind(this));
    }
    catch (error) {
      throw new Error("A problem occurred attempting to run '" + sshCommand + "' in remote directory '" + directory +
                       "'. Problem is: " + error.message);
    }
  }

  private async uploadBundle(zosMFSession: AbstractSession) {
    this.updateStatus("Uploading the bundle to the remote bundle directory");

    const uploadOptions: IUploadOptions = { recursive: true };
    uploadOptions.attributes = this.findZosAttributes();

    try {
      await Upload.dirToUSSDirRecursive(zosMFSession, this.localDirectory, this.params.arguments.bundledir, uploadOptions);
    }
    catch (error) {
      throw new Error("A problem occurred uploading the bundle to the remote directory '" + this.params.arguments.bundledir +
                       "'. Problem is: " + error.message);
    }
  }

  private findZosAttributes(): ZosFilesAttributes {
    const attributesFileName = this.path.join(this.localDirectory, ".zosattributes");
    if (this.fs.existsSync(attributesFileName)) {
      try {
        const attributesFileContents = this.fs.readFileSync(attributesFileName).toString();
        return new ZosFilesAttributes(attributesFileContents, this.localDirectory);
      }
      catch (error) {
        throw new Error("A problem occurred reading the local .zosattributes file '" + attributesFileName +
                       "'. Problem is: " + error.message);
      }
    }
    return undefined;
  }

  private updateStatus(status: string) {
    const PERCENT3 = 3;
    this.progressBar.percentComplete += PERCENT3;
    this.progressBar.statusMessage = status;

    if (this.params.arguments.verbose) {
      this.params.response.console.log(status);
    }
  }
}
