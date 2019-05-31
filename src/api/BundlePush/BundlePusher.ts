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

import { IHandlerParameters, AbstractSession, ITaskWithStatus, TaskStage, TaskProgress, Logger, IProfile, Session } from "@zowe/imperative";
import { List, ZosmfSession, SshSession, Shell, Upload, IUploadOptions, ZosFilesAttributes, Create } from "@zowe/cli";
import { getResource, IResourceParms } from "@zowe/cics";
import { BundleDeployer } from "../BundleDeploy/BundleDeployer";
import { Bundle } from "../BundleContent/Bundle";
import { SubtaskWithStatus } from "./SubtaskWithStatus";


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

    // Get the profiles
    const zosMFProfile = this.getProfile("zosmf", true);
    const sshProfile = this.getProfile("ssh", true);
    const cicsProfile = this.getProfile("cics", false);
    this.validateProfiles(zosMFProfile, sshProfile, cicsProfile);

    // Create a zOSMF session
    const zosMFSession = await this.createZosMFSession(zosMFProfile);
    // Create an SSH session
    const sshSession = await this.createSshSession(sshProfile);
    // If relevant, start a CICS session
    const cicsSession = await this.createCicsSession(cicsProfile);

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
    await this.deployBundle(zosMFSession, bd, cicsSession, bundle);

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

  private getProfile(type: string, required: boolean): IProfile {
    const profile =  this.params.profiles.get(type);

    if (required && profile === undefined) {
      throw new Error("No " + type + " profile found");
    }

    return profile;
  }

  private issueWarning(msg: string) {
    const warningMsg = "WARNING: " + msg + "\n";
    this.issueMessage(warningMsg);
  }

  private issueMessage(msg: string) {
    this.endProgressBar();
    this.params.response.console.log(Buffer.from(msg));
    if (this.params.arguments.silent === undefined) {
      const logger = Logger.getAppLogger();
      logger.warn(msg);
    }
    this.startProgressBar();
  }

  private validateProfiles(zosmfProfile: IProfile, sshProfile: IProfile, cicsProfile: IProfile) {
    // Do the required profiles share the same host name?
    if (zosmfProfile.host !== sshProfile.host) {
      this.issueWarning("ssh profile --host value '" + sshProfile.host + "' does not match zosmf value '" + zosmfProfile.host + "'.");
    }
    // Do the required profiles share the same user name?
    if (zosmfProfile.user.toUpperCase() !== sshProfile.user.toUpperCase()) {
      this.issueWarning("ssh profile --user value '" + sshProfile.user + "' does not match zosmf value '" + zosmfProfile.user + "'.");
    }

    // Is the optional CICS profile compatible?
    if (cicsProfile !== undefined) {
      if (zosmfProfile.host !== cicsProfile.host) {
        this.issueWarning("cics profile --host value '" + cicsProfile.host + "' does not match zosmf value '" + zosmfProfile.host + "'.");
      }
      if (zosmfProfile.user.toUpperCase() !== cicsProfile.user.toUpperCase()) {
        this.issueWarning("cics profile --user value '" + cicsProfile.user + "' does not match zosmf value '" + zosmfProfile.user + "'.");
      }

      // Do the cics-plexes match?
      if (cicsProfile.cicsPlex !== undefined && this.params.arguments.cicsplex !== cicsProfile.cicsPlex) {
        this.issueWarning("cics profile --cics-plex value '" + cicsProfile.cicsPlex +
          "' does not match --cicsplex value '" + this.params.arguments.cicsplex + "'.");
      }
    }
  }

  private async createZosMFSession(zosmfProfile: IProfile): Promise<AbstractSession> {
    try {
      return ZosmfSession.createBasicZosmfSession(zosmfProfile);
    }
    catch (error) {
      throw new Error("Failure occurred creating a zosmf session: " + error.message);
    }
  }

  private async createSshSession(sshProfile: IProfile): Promise<SshSession> {
    try {
      return SshSession.createBasicSshSession(sshProfile);
    }
    catch (error) {
      throw new Error("Failure occurred creating an ssh session: " + error.message);
    }
  }

  private async createCicsSession(cicsProfile: IProfile): Promise<AbstractSession> {
    if (cicsProfile === undefined) {
      return undefined;
    }

    // At time of writing, the CicsSession object in the @zowe/cics project isn't
    // accessible, so the following code is copied out of CicsSession.createBasicCicsSession().
    try {
      return new Session({
          type: "basic",
          hostname: cicsProfile.host,
          port: cicsProfile.port,
          user: cicsProfile.user,
          password: cicsProfile.password,
          basePath: cicsProfile.basePath,
          protocol: cicsProfile.protocol || "http",
          rejectUnauthorized: cicsProfile.rejectUnauthorized
      });
    }
    catch (error) {
      throw new Error("Failure occurred creating a cics session: " + error.message);
    }
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

    const targetstateLocal = this.params.arguments.targetstate;
    this.params.arguments.targetstate = "DISCARDED";
    const subtask = new SubtaskWithStatus(this.progressBar, TaskProgress.THIRTY_PERCENT);
    await bd.undeployBundle(zosMFSession, subtask);
    this.params.arguments.targetstate = targetstateLocal;

    // Resume the current progress bar
    this.endProgressBar();
    this.updateStatus("Undeploy complete");
    this.startProgressBar();
  }

  private async deployBundle(zosMFSession: AbstractSession, bd: BundleDeployer, cicsSession: AbstractSession, bundle: Bundle) {
    // End the current progress bar so that DEPLOY can create its own
    this.updateStatus("Deploying bundle '" + this.params.arguments.name + "' to CICS");
    const subtask = new SubtaskWithStatus(this.progressBar, TaskProgress.THIRTY_PERCENT);

    let deployError: Error;
    let dfhdployOutput = "";
    try {
      await bd.deployBundle(zosMFSession, subtask);
    }
    catch (error) {
      // temporarily ignore the error as we might want to generate additional resource
      // specific diagnostics even if something went wrong.
      deployError = error;
    }
    dfhdployOutput = bd.getJobOutput();

    // Resume the current progress bar
    this.endProgressBar();
    if (deployError === undefined) {
      this.updateStatus("Deploy complete");
    }
    else {
      this.updateStatus("Deploy ended with errors");
    }
    this.startProgressBar();

    // Collect general information about the regions in the CICSplex scope
    const diagnosticsWorking = await this.outputGeneralDiagnostics(cicsSession);
    if (diagnosticsWorking && bundle.containsDefinitionsOfType("http://www.ibm.com/xmlns/prod/cics/bundle/NODEJSAPP")) {
      // Generate additional diagnostic output for Node.js
      await this.outputNodejsSpecificDiagnostics(cicsSession);
    }

    // Now rethrow the original error, if there was one.
    if (deployError !== undefined) {
      throw deployError;
    }
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
    await this.runSshCommandInRemoteDirectory(sshSession, this.params.arguments.bundledir, "if [ \"$(ls)\" ]; then rm -r *; fi");
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
          "if [ -d \"node_modules\" ] && [ \"$(ls node_modules)\" ]; then npm uninstall `ls -1 node_modules | tr '/\n' ' '`; fi");
  }

  private async runSshCommandInRemoteDirectory(sshSession: SshSession, directory: string, sshCommand: string) {
    try {
      if (this.params.arguments.verbose) {
        this.updateStatus("Issuing SSH command '" + sshCommand + "' in remote directory '" + directory + "'");
      }

      this.sshOutputText = "";
      const sshReturnCode = await Shell.executeSshCwd(sshSession, sshCommand, directory, this.sshOutput.bind(this));
      const upperCaseOutputText = this.sshOutputText.toUpperCase();

      // Note that FSUM9195 can imply that we've tried to delete the
      // contents of an empty directory - that's not a problem.
      // Check if FSUM9195 is the only FSUM error
      let isOnlyFSUM9195 = false;
      const countFSUM = (upperCaseOutputText.match(/FSUM/g) || []).length;
      const countFSUM9195 = (upperCaseOutputText.match(/FSUM9195/g) || []).length;
      if (countFSUM9195 !== 0 &&
          countFSUM === countFSUM9195 &&
          sshReturnCode === 1) {
        isOnlyFSUM9195 = true;
      }

      // Now check
      // A. If exit code is non zero
      // B. FSUM9195 is not the only FSUM error
      if (sshReturnCode !== 0 && !isOnlyFSUM9195) {
        // if we've not already logged the output, log it now
        if (this.params.arguments.verbose !== true) {
          this.params.response.console.log(Buffer.from(this.sshOutputText));
        }
        throw new Error("The output from the remote command implied that an error occurred, return code " + sshReturnCode + ".");
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
    uploadOptions.task = new SubtaskWithStatus(this.progressBar, TaskProgress.TEN_PERCENT);

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
    this.issueWarning("No .zosAttributes file found in the bundle directory, default values will be applied.");
    return new ZosFilesAttributes(Bundle.getTemplateZosAttributesFile());
  }

  private updateStatus(status: string, percentageIncrease = 3) {
    const MAX_PROGRESS_BAR_MESSAGE = 60;
    this.progressBar.percentComplete += percentageIncrease;

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
    if (this.params.arguments.verbose !== true && this.progressBar !== undefined) {
      this.params.response.progress.startBar({task: this.progressBar});
    }
  }

  private endProgressBar() {
    if (this.params.arguments.verbose !== true && this.progressBar !== undefined) {
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

  private async outputGeneralDiagnostics(cicsSession: AbstractSession): Promise<boolean> {
    let scopeFound = false;
    try {
      if (cicsSession !== undefined) {
        // Attempt to gather additional Node.js specific information from CICS
        this.updateStatus("Gathering Scope information");
        scopeFound = await this.gatherGeneralDiagnosticsFromCics(cicsSession);
      }
    }
    catch (diagnosticsError) {
      // Something went wrong generating scope info. Don't trouble the user
      // with what might be an exotic error message (e.g. hex dump of an entire HTML page),
      // just log the failure.
      if (this.params.arguments.silent === undefined) {
        const logger = Logger.getAppLogger();
        logger.debug(diagnosticsError.message);
      }
    }
    return scopeFound;
  }

  private async outputNodejsSpecificDiagnostics(cicsSession: AbstractSession) {
    let diagnosticsIssued = false;
    try {
      // Attempt to gather additional Node.js specific information from CICS
      this.updateStatus("Gathering Node.js diagnostics");
      diagnosticsIssued = await this.gatherNodejsDiagnosticsFromCics(cicsSession);
    }
    catch (diagnosticsError) {
      // Something went wrong generating diagnostic info. Don't trouble the user
      // with what might be an exotic error message (e.g. hex dump of an entire HTML page),
      // just log the failure.
      if (this.params.arguments.silent === undefined) {
        const logger = Logger.getAppLogger();
        logger.debug(diagnosticsError.message);
      }
    }

    // We must have a cics profile in order to have got this far, so suggest a command that can be run to figure out more.
    if (diagnosticsIssued === false) {
      const msg = "For further information on the state of your NODEJSAPP resources, consider running the following command:\n\n" +
            "zowe cics get resource CICSNodejsapp --region-name " + this.params.arguments.scope +
            " --criteria \"BUNDLE=" + this.params.arguments.name + "\" --cics-plex " + this.params.arguments.cicsplex + "\n";
      this.issueMessage(msg);
    }
  }

  private async gatherGeneralDiagnosticsFromCics(cicsSession: AbstractSession): Promise<boolean> {
    // Issue a CMCI get to the target CICSplex
    try {
      this.updateStatus("Querying Regions in Scope over CMCI");
      const regionData: IResourceParms = { name: "CICSRegion",
                                           regionName: this.params.arguments.scope,
                                           cicsPlex: this.params.arguments.cicsplex };
      const cmciRegionResponse = await getResource(cicsSession, regionData);
      if (cmciRegionResponse === undefined ||
          cmciRegionResponse.response === undefined ||
          cmciRegionResponse.response.records === undefined ||
          cmciRegionResponse.response.records.cicsregion === undefined) {
        throw new Error("CICSRegion CMCI output record not found.");
      }
      const outputRegionRecords = cmciRegionResponse.response.records.cicsregion;
      const msg = "CICS Regions in Scope '" + this.params.arguments.scope + "' of CICSplex '" + this.params.arguments.cicsplex + "':\n";
      this.issueMessage(msg);

      // We may have an array of records if there was more than one Region in the scope
      if (Array.isArray(outputRegionRecords)) {
        for (const record of outputRegionRecords) {
          this.reportRegionData(record);
        }
      }
      else {
        this.reportRegionData(outputRegionRecords);
      }
    }
    catch (error) {
      throw new Error("Failure collecting diagnostics for Bundle " + this.params.arguments.name + ": " + error.message);
    }

    return true;
  }

  private async gatherNodejsDiagnosticsFromCics(cicsSession: AbstractSession): Promise<boolean> {
    try {
      // Process each NODEJSAPP in the Scope
      this.updateStatus("Querying NODEJSAPP resources over CMCI");
      const nodejsData: IResourceParms = { name: "CICSNodejsapp",
                                           criteria: "BUNDLE=" + this.params.arguments.name,
                                           regionName: this.params.arguments.scope,
                                           cicsPlex: this.params.arguments.cicsplex };
      const cmciNodejsResponse = await getResource(cicsSession, nodejsData);
      if (cmciNodejsResponse === undefined ||
          cmciNodejsResponse.response === undefined ||
          cmciNodejsResponse.response.records === undefined ||
          cmciNodejsResponse.response.records.cicsnodejsapp === undefined) {
        throw new Error("CICSNodejsapp CMCI output record not found.");
      }
      const outputNodejsRecords = cmciNodejsResponse.response.records.cicsnodejsapp;

      const msg = "\nNODEJSAPP resources for Bundle '" + this.params.arguments.name + "' in Scope '" + this.params.arguments.scope + "':\n";
      this.issueMessage(msg);

      // We may have an array of records if there was more than one NODEJSAPP in the bundle
      if (Array.isArray(outputNodejsRecords)) {
        for (const record of outputNodejsRecords) {
          this.reportNODEJSAPPData(record);
        }
      }
      else {
        this.reportNODEJSAPPData(outputNodejsRecords);
      }
    }
    catch (error) {
      throw new Error("Failure collecting diagnostics for Bundle " + this.params.arguments.name + ": " + error.message);
    }

    return true;
  }

  private reportRegionData(outputRecord: any) {
    const MAX_LENGTH = 8;
    const applid = outputRecord.applid.padEnd(MAX_LENGTH, " ");
    const jobid = outputRecord.jobid.padEnd(MAX_LENGTH, " ");
    const jobname = outputRecord.jobname.padEnd(MAX_LENGTH, " ");

    const msg = "   Applid: " + applid + "   jobname: " + jobname + "   jobid: " + jobid + "\n";
    this.issueMessage(msg);
  }

  private reportNODEJSAPPData(outputRecord: any) {
    const name = outputRecord.name;
    const enablestatus = outputRecord.enablestatus;
    const pid = outputRecord.pid;
    const region = outputRecord.eyu_cicsname;
    let stdout = outputRecord.stdout;
    let stderr = outputRecord.stderr;

    if (stdout === "") {
      stdout = "<not available>";
    }
    if (stderr === "") {
      stderr = "<not available>";
    }

    const msg = "CICS NODEJSAPP resource '" + name + "' is in '" + enablestatus + "' state in region '" +
                region + "' with process id '" + pid + "'.\n" +
                "  stdout: " + stdout + "\n" +
                "  stderr: " + stderr + "\n";
    this.issueMessage(msg);
  }
}
