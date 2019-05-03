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

import { IHandlerParameters, AbstractSession, ITaskWithStatus, TaskStage, TaskProgress, Logger } from "@zowe/imperative";
import { List, ZosmfSession, SshSession, Shell, Upload, IUploadOptions, ZosFilesAttributes, Create } from "@zowe/cli";
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
  private defaultRemoteNodehomeCmd = "export PATH=\"$PATH:/usr/lpp/IBM/cnj/IBM/node-latest-os390-s390x/bin\"";

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

    // The targetdir may contain escaped slashes, get rid of them
    this.params.arguments.targetdir = this.path.posix.normalize(this.params.arguments.targetdir);

    // Set an initial bundledir value for validation purposes (we'll replace it with a better value shortly)
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

    // If the bundle has an id, use it in the target directory name
    if (bundle.getId() !== undefined) {
      this.params.arguments.bundledir = this.path.posix.join(this.params.arguments.targetdir, bundle.getId()) +
                                        "_" + bundle.getVersion();
    }

    // Create a zOSMF session
    const zosMFSession = await this.createZosMFSession();
    // Create an SSH session
    const sshSession = await this.createSshSession();

    // Start a progress bar (but only in non-verbose mode)
    this.progressBar = { percentComplete: 0,
                         statusMessage: "Starting Push operation",
                         stageName: TaskStage.IN_PROGRESS };
    this.startProgressBar();

    // Attempt to make the target bundledir
    await this.makeBundleDir(zosMFSession);

    // Check that the remote bundledir is suitable.
    await this.validateBundleDirExistsAndIsEmpty(zosMFSession);

    // If --overwrite is set then undeploy any existing bundle from CICS
    if (this.params.arguments.overwrite) {
      await this.undeployExistingBundle(zosMFSession, bd);
    }

    // Find all of the package.json files in the Bundle
    const packageJsonFiles: string[] = [];
    this.findAllPackageJSONDirs(this.localDirectory, this.params.arguments.bundledir, packageJsonFiles);

    // If --overwrite is set then empty the remote directory structure
    if (this.params.arguments.overwrite) {
     // Run 'npm uninstall' for each package.json file that exists in the bundle.
     // This is a courtesy to give npm a chance to clean up itself, we have seen
     // things get installed that are difficult to remove simply by deleting the
     // directory.
     try {
       await this.runAllNpmUninstalls(sshSession, packageJsonFiles);
     }
     catch (error) {
      // Something went wrong, but never mind, we'll destroy the entire directory in
      // a moment.
     }

     // Now delete the directory
     await this.deleteBundleDirContents(sshSession);
    }

    // Upload the bundle
    await this.uploadBundle(zosMFSession);

    // Run 'npm install' for each package.json file that exists in the bundle
    await this.runAllNpmInstalls(sshSession, packageJsonFiles);

    // Run DFHDPLOY to install the bundle
    await this.deployBundle(zosMFSession, bd);

    // Complete the progress bar
    this.progressBar.percentComplete = TaskProgress.ONE_HUNDRED_PERCENT;
    this.endProgressBar();
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
    // Create an SSH session
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
    this.updateStatus("Undeploying bundle '" + this.params.arguments.name + "' from CICS");
    this.endProgressBar();

    const targetstateLocal = this.params.arguments.targetstate;
    this.params.arguments.targetstate = "DISCARDED";
    await bd.undeployBundle(zosMFSession);
    this.params.arguments.targetstate = targetstateLocal;

    // Resume the current progress bar
    this.endProgressBar();
    this.updateStatus("Undeploy complete");
    this.startProgressBar();
  }

  private async deployBundle(zosMFSession: AbstractSession, bd: BundleDeployer) {
    // End the current progress bar so that DEPLOY can create its own
    this.updateStatus("Deploying bundle '" + this.params.arguments.name + "' to CICS");
    this.endProgressBar();

    await bd.deployBundle(zosMFSession);
    // Resume the current progress bar
    this.endProgressBar();
    this.updateStatus("Deploy complete");
    this.startProgressBar();
  }

  private sshOutput(data: string) {
    // If verbose output is requested then log SSH output directly to the console
    if (this.params.arguments.verbose) {
      this.params.response.console.log(Buffer.from(data));
    }
    this.sshOutputText += data;
  }

  private async makeBundleDir(zosMFSession: AbstractSession) {
    if (this.params.arguments.verbose) {
      this.updateStatus("Making remote bundle directory '" + this.params.arguments.bundledir + "'");
    }
    else {
      this.updateStatus("Making remote bundle directory");
    }

    const WARNING = 4;
    const ALREADY_EXISTS = 19;
    const EIGHT = 8;
    const TARGET_DIR_NOT_EXIST = 93651005;
    const NO_PERMISSION = -276865003;
    try {
      await Create.uss(zosMFSession, this.params.arguments.bundledir, "directory");
    }
    catch (error) {
      if (error.causeErrors !== undefined)
      {
        let cause;
        if (typeof error.causeErrors !== "object")
        {
          try {
            cause = JSON.parse(error.causeErrors);
          }
          catch (error) {
            // whatever we received here it wasn't JSON. Oh well, never mind.
          }
        }
        else {
          cause = error.causeErrors;
        }

        // Special case some known errors
        if (cause !== undefined) {
          if (cause.category === 1 &&
              cause.rc === WARNING &&
              cause.reason === ALREADY_EXISTS) {
            // if it already exists, no worries
            return;
          }
          if (cause.category === EIGHT &&
              cause.rc === -1 &&
              cause.reason === TARGET_DIR_NOT_EXIST) {
            throw new Error("The target directory does not exist, consider creating it by issuing: \n" +
                            "zowe zos-uss issue ssh \"mkdir -p " + this.params.arguments.targetdir + "\"");
          }
          if (cause.category === EIGHT &&
              cause.rc === -1 &&
              cause.reason === NO_PERMISSION) {
            throw new Error("You are not authorized to create the target bundle directory '" + this.params.arguments.bundledir + "'.");
          }
        }
      }
      throw new Error("A problem occurred attempting to create directory '" + this.params.arguments.bundledir + "'. " +
                      "Problem is: " + error.message);
    }
  }

  private async deleteBundleDirContents(sshSession: SshSession) {
    this.updateStatus("Removing contents of remote bundle directory");
    await this.runSshCommandInRemoteDirectory(sshSession, this.params.arguments.bundledir, "rm -r *");
  }

  private async runSingleNpmInstall(sshSession: SshSession, remoteDirectory: string) {
    if (this.params.arguments.verbose) {
      this.updateStatus("Running 'npm install' in '" + remoteDirectory + "'");
    }
    else {
      this.updateStatus("Running 'npm install' in remote directory");
    }

    await this.runSshCommandInRemoteDirectory(sshSession, remoteDirectory, this.defaultRemoteNodehomeCmd + " && npm install");
  }

  private async runSingleNpmUninstall(sshSession: SshSession, remoteDirectory: string) {
    if (this.params.arguments.verbose) {
      this.updateStatus("Running 'npm uninstall *' in '" + remoteDirectory + "'");
    }
    else {
      this.updateStatus("Running 'npm uninstall *' in remote directory");
    }

    // uninstall each module individually
    await this.runSshCommandInRemoteDirectory(sshSession, remoteDirectory, this.defaultRemoteNodehomeCmd + " && " +
                                              "npm uninstall `ls -1 node_modules | tr '/\n' ' '`");
  }

  private async runSshCommandInRemoteDirectory(sshSession: SshSession, directory: string, sshCommand: string) {
    try {
      if (this.params.arguments.verbose) {
        this.updateStatus("Issuing SSH command '" + sshCommand + "' in remote directory '" + directory + "'");
      }

      this.sshOutputText = "";
      const shell = await Shell.executeSshCwd(sshSession, sshCommand, directory, this.sshOutput.bind(this));
      const upperCaseOutputText = this.sshOutputText.toUpperCase();

      // Did the SSH command work? It's unclear how to tell, but for starters let's look for common
      // signifiers in the output text. Note that FSUM9195 can imply that we've tried to delete the
      // contents of an empty directory - that's not a problem.

      // If there any FSUM messages other than FSUM9195 then that's a problem
      let otherFSUMMessages = false;
      const countFSUM = (upperCaseOutputText.match(/FSUM/g) || []).length;
      const countFSUM9195 = (upperCaseOutputText.match(/FSUM9195/g) || []).length;
      if (countFSUM > countFSUM9195) {
        otherFSUMMessages = true;
      }

      // Now check for other common error signifiers
      if (otherFSUMMessages ||
          upperCaseOutputText.indexOf("ERROR ") > -1 ||
          upperCaseOutputText.indexOf("ERR!") > -1 ) {

        // if we've not already logged the output, log it now
        if (this.params.arguments.verbose !== true)
        {
          this.params.response.console.log(Buffer.from(this.sshOutputText));
        }
        throw new Error("The output from the remote command implied that an error occurred.");
      }
    }
    catch (error) {
      throw new Error("A problem occurred attempting to run '" + sshCommand + "' in remote directory '" + directory +
                       "'. Problem is: " + error.message);
    }
  }

  private async uploadBundle(zosMFSession: AbstractSession) {
    this.updateStatus("Uploading bundle contents to remote directory");

    const uploadOptions: IUploadOptions = { recursive: true };
    uploadOptions.attributes = this.findZosAttributes();

    try {
      await Upload.dirToUSSDirRecursive(zosMFSession, this.localDirectory, this.params.arguments.bundledir, uploadOptions);
    }
    catch (error) {
      throw new Error("A problem occurred uploading the bundle contents to the remote directory '" + this.params.arguments.bundledir +
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

    // A project specific .zosattributes has not been found, so use a default
    const warningMsg = "WARNING: No .zosAttributes file found in the bundle directory, default values will be applied.";
    this.endProgressBar();
    this.params.response.console.log(Buffer.from(warningMsg));
    if (this.params.arguments.silent === undefined) {
      const logger = Logger.getAppLogger();
      logger.warn(warningMsg);
    }
    this.startProgressBar();
    return new ZosFilesAttributes(Bundle.getTemplateZosAttributesFile());
  }

  private updateStatus(status: string) {
    const PERCENT5 = 5;
    const MAX_PROGRESS_BAR_MESSAGE = 60;
    this.progressBar.percentComplete += PERCENT5;

    if (status.length > MAX_PROGRESS_BAR_MESSAGE)
    {
      this.progressBar.statusMessage = status.substring(0, MAX_PROGRESS_BAR_MESSAGE) + "...";
    }
    else {
      this.progressBar.statusMessage = status;
    }

    if (this.params.arguments.verbose) {
      this.params.response.console.log(Buffer.from(status + "\n"));
    }

    if (this.params.arguments.silent === undefined) {
      const logger = Logger.getAppLogger();
      logger.debug(status);
    }
  }

  private startProgressBar() {
    if (this.params.arguments.verbose !== true) {
      this.params.response.progress.startBar({task: this.progressBar});
    }
  }

  private endProgressBar() {
    if (this.params.arguments.verbose !== true) {
      this.params.response.progress.endBar();
    }
  }

  private findAllPackageJSONDirs(directoryNameLocal: string, directoryNameRemote: string, found: string[]) {
    // accumulate an array of all directories / sub-directories that contain a package.json file
    const files = this.fs.readdirSync(directoryNameLocal);
    for (const currentFile of files) {
      const localFileName = this.path.join(directoryNameLocal, currentFile);
      const remoteFileName = this.path.posix.join(directoryNameRemote, currentFile);
      const stat = this.fs.lstatSync(localFileName);

      if (stat.isDirectory() && currentFile !== "node_modules") {
        // If we've found a sub-directory, and it's not the special node_modules directory, scan it too.
        this.findAllPackageJSONDirs(localFileName, remoteFileName, found);
      }
      else if (currentFile === "package.json") {
        // The current directory has a package.json
        found.push(directoryNameRemote);
      }
    }
  }

  private async runAllNpmInstalls(sshSession: SshSession, packageJsonFiles: string[]) {
    for (const remoteDirectory of packageJsonFiles) {
      await this.runSingleNpmInstall(sshSession, remoteDirectory);
    }
  }

  private async runAllNpmUninstalls(sshSession: SshSession, packageJsonFiles: string[]) {
    for (const remoteDirectory of packageJsonFiles) {
      await this.runSingleNpmUninstall(sshSession, remoteDirectory);
    }
  }
}
