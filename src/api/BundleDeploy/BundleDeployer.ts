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

import { IHandlerParameters, Logger, ImperativeError, AbstractSession, ITaskWithStatus,
         TaskStage , TaskProgress} from "@zowe/imperative";
import { ZosmfSession, SubmitJobs, List } from "@zowe/cli";
import { ParmValidator } from "./ParmValidator";
import * as path from "path";

/**
 * Class to represent a CICS Bundle Deployer.
 *
 * @export
 * @class BundleDeployer
 */
export class BundleDeployer {

  private params: IHandlerParameters;
  private PROGRESS_BAR_INTERVAL = 375;         // milliseconds
  private PROGRESS_BAR_INCREMENT = 0.25;       // percent
  private PROGRESS_BAR_MAX = 67;               // percent
  private parmsValidated: boolean = false;
  private hlqsValidated: boolean = false;
  private jobId: string;
  private progressBar: ITaskWithStatus;
  private useResponseProgressBar = true;
  private jobOutput: string = "";

  /**
   * Constructor for a BundleDeployer.
   * @param {IHandlerParameters} params - The Imperative handler parameters
   * @throws ImperativeError
   * @memberof BundleDeployer
   */
  constructor(params: IHandlerParameters) {
    this.params = params;
    this.progressBar = { percentComplete: 0,
                         stageName: TaskStage.NOT_STARTED,
                         statusMessage: ""};
  }

  /**
   * Deploy a CICS Bundle
   * @param {AbstractSession} session - An optional zOSMF session
   * @returns {Promise<string>}
   * @throws ImperativeError
   * @memberof BundleDeployer
   */
  public async deployBundle(session?: AbstractSession, task?: ITaskWithStatus): Promise<string> {

    // Validate that the parms are valid for Deploy
    this.validateDeployParms();

    // Create a zosMF session
    if (session === undefined) {
      session = await this.createZosMFSession();
    }

    // Check that the CICS dataset value looks valid and can be viewed
    await this.checkHLQDatasets(session);

    // Generate some DFHDPLOY JCL
    const jcl = this.getDeployJCL();

    // Submit it
    return this.submitJCL(jcl, "DEPLOY", session, task);
  }

  /**
   * Undeploy a CICS Bundle
   * @param {AbstractSession} session - An optional zOSMF session
   * @returns {Promise<string>}
   * @throws ImperativeError
   * @memberof BundleDeployer
   */
  public async undeployBundle(session?: AbstractSession, task?: ITaskWithStatus): Promise<string> {

    // Validate that the parms are valid for Undeploy
    this.validateUndeployParms();

    // Create a zosMF session
    if (session === undefined) {
      session = await this.createZosMFSession();
    }

    // Check that the CICS dataset value looks valid and can be viewed
    await this.checkHLQDatasets(session);

    // Generate some DFHDPLOY JCL
    const jcl = this.getUndeployJCL();

    // Submit it
    return this.submitJCL(jcl, "UNDEPLOY", session, task);
  }

  /**
   * Validate the input parameters are suitable for the DEPLOY action
   * @returns {Promise<string>}
   * @throws ImperativeError
   * @memberof BundleDeployer
   */
  public validateDeployParms() {
    if (this.parmsValidated === false) {
      ParmValidator.validateDeploy(this.params);
      this.parmsValidated = true;
    }
  }

  /**
   * Validate the input parameters are suitable for the UNDEPLOY action
   * @returns {Promise<string>}
   * @throws ImperativeError
   * @memberof BundleDeployer
   */
  public validateUndeployParms() {
    if (this.parmsValidated === false) {
      ParmValidator.validateUndeploy(this.params);
      this.parmsValidated = true;
    }
  }

  /**
   * Retrieves the output from the most recently completed DFHDPLOY JCL job.
   * @returns {string}
   * @throws ImperativeError
   * @memberof BundleDeployer
   */
  public getJobOutput() {
    return this.jobOutput;
  }

  private wrapLongLineForJCL(lineOfText: string): string {
    const MAX_LINE_LEN = 71;

    let tempVal = lineOfText;
    let returnVal = "";
    while (tempVal.length > MAX_LINE_LEN) {
      returnVal = returnVal + tempVal.substring(0, MAX_LINE_LEN) + "\n";
      tempVal = "        " + tempVal.substring(MAX_LINE_LEN);
    }
    returnVal = returnVal + tempVal;
    return returnVal;
  }

  /**
   * Construct the DFHDPLOY DEPLOY BUNDLE JCL.
   * @returns {string}
   * @throws ImperativeError
   * @memberof BundleDeployer
   */
  private getDeployJCL(): string {
    // Get rid of any extra slashes which may be needed on git-bash to avoid path munging
    const bundledir = path.posix.normalize(this.params.arguments.bundledir);

    let jcl = this.generateCommonJCLHeader() +
      this.wrapLongLineForJCL("DEPLOY BUNDLE(" + this.params.arguments.name + ")\n") +
      this.wrapLongLineForJCL("       BUNDLEDIR(" + bundledir + ")\n");
    if (this.params.arguments.description !== undefined) {
      jcl += this.wrapLongLineForJCL("       DESCRIPTION(" + this.params.arguments.description + ")\n");
    }
    jcl += this.generateCommonJCLFooter();

    return jcl;
  }

  /**
   * Construct the DFHDPLOY UNDEPLOY BUNDLE JCL.
   * @returns {string}
   * @throws ImperativeError
   * @memberof BundleDeployer
   */
  private getUndeployJCL(): string {
    const jcl = this.generateCommonJCLHeader() +
      this.wrapLongLineForJCL("UNDEPLOY BUNDLE(" + this.params.arguments.name + ")\n") +
      this.generateCommonJCLFooter();

    return jcl;
  }

  private generateCommonJCLHeader(): string {
    const jcl = this.params.arguments.jobcard + "\n" +
          "//DFHDPLOY EXEC PGM=DFHDPLOY,REGION=100M\n" +
          "//STEPLIB  DD DISP=SHR,DSN=" + this.params.arguments.cicshlq + ".SDFHLOAD\n" +
          "//         DD DISP=SHR,DSN=" + this.params.arguments.cpsmhlq + ".SEYUAUTH\n" +
          "//SYSTSPRT DD SYSOUT=*\n" +
          "//SYSIN    DD *\n" +
          "*\n" +
          this.wrapLongLineForJCL("SET CICSPLEX(" + this.params.arguments.cicsplex + ");\n") +
          this.wrapLongLineForJCL("*\n");

    return jcl;
  }

  private generateCommonJCLFooter(): string {
    let jcl =
      this.wrapLongLineForJCL("       SCOPE(" + this.params.arguments.scope + ")\n") +
      this.wrapLongLineForJCL("       STATE(" + this.params.arguments.targetstate + ")\n");

    if (this.params.arguments.timeout !== undefined) {
      jcl = jcl + this.wrapLongLineForJCL("       TIMEOUT(" + this.params.arguments.timeout + ")\n");
    }
    if (this.params.arguments.csdgroup !== undefined) {
      jcl = jcl + this.wrapLongLineForJCL("       CSDGROUP(" + this.params.arguments.csdgroup + ");\n");
    }
    if (this.params.arguments.resgroup !== undefined) {
      jcl = jcl + this.wrapLongLineForJCL("       RESGROUP(" + this.params.arguments.resgroup + ");\n");
    }

    // finally add a terminator
    jcl = jcl + "/*\n";

    return jcl;
  }

  private async createZosMFSession(): Promise<AbstractSession> {
    // Create a zosMF session
    const zosmfProfile = this.params.profiles.get("zosmf");

    if (zosmfProfile === undefined) {
      throw new Error("No zosmf profile found");
    }
    return ZosmfSession.createBasicZosmfSession(zosmfProfile);
  }

  private async checkHLQDatasets(session: any) {

    // No need to revalidate multiple times during a push command
    if (this.hlqsValidated === true) {
      return;
    }

    // Check that the CICS dataset value looks valid and can be viewed
    // Access errors will trigger an Exception
    const cicspds = this.params.arguments.cicshlq + ".SDFHLOAD";
    let listResp;
    try {
      listResp = await List.allMembers(session, cicspds, {});
    }
    catch (error) {
      throw new Error("Validation of --cicshlq dataset failed: " + error.message);
    }
    if (JSON.stringify(listResp).indexOf("DFHDPLOY") === -1) {
      throw new Error("DFHDPLOY not found in SDFHLOAD within the --cicshlq dataset: " + cicspds);
    }

    // Check that the CPSM dataset value looks valid and can be viewed
    // Access errors will trigger an Exception
    const cpsmpds = this.params.arguments.cpsmhlq + ".SEYUAUTH";
    try {
      listResp = await List.allMembers(session, cpsmpds, {});
    }
    catch (error) {
      throw new Error("Validation of --cpsmhlq dataset failed: " + error.message);
    }
    if (JSON.stringify(listResp).indexOf("EYU9ABSI") === -1) {
      throw new Error("EYU9ABSI not found in SEYUAUTH within the --cpsmhlq dataset: " + cpsmpds);
    }

    this.hlqsValidated = true;
  }

  private updateProgressBar(action: string) {
    // Increment the progress bar. This will refresh what the user sees on the console.
    this.progressBar.percentComplete += this.PROGRESS_BAR_INCREMENT;

    // Have a look at the status message for the progress bar, has it been updated with
    // the jobid yet? If so, parse it out and refresh the message.
    if (this.jobId === "UNKNOWN" && this.progressBar.statusMessage) {
      const statusWords = this.progressBar.statusMessage.split(" ");
      if (statusWords.length >= 2) {
        if (statusWords[2] !== undefined && statusWords[2].indexOf("JOB") === 0) {
           this.jobId = statusWords[2];
           this.progressBar.statusMessage = "Running DFHDPLOY (" + action + "), jobid " + this.jobId;

           this.endProgressBar();
           // log the jobid for posterity
           if (this.params.arguments.verbose) {
             this.params.response.console.log(this.progressBar.statusMessage + "\n");
           }
           if (this.params.arguments.silent === undefined) {
             const logger = Logger.getAppLogger();
             logger.debug(this.progressBar.statusMessage);
           }
           this.startProgressBar();
        }
      }
    }

    // Continue iterating on progress updates until we've reached the max value,
    // or until the processing has completed.
    if (this.progressBar.percentComplete < this.PROGRESS_BAR_MAX &&
        this.progressBar.stageName === TaskStage.IN_PROGRESS) {
      setTimeout(this.updateProgressBar.bind(this), this.PROGRESS_BAR_INTERVAL, action);
    }
  }

  private async submitJCL(jcl: string, action: string, session: any, task?: ITaskWithStatus): Promise<string> {
    let spoolOutput: any;
    if (task) {
        this.progressBar = task;
        this.useResponseProgressBar = false;
    }

    this.progressBar.percentComplete = TaskProgress.TEN_PERCENT;
    this.progressBar.statusMessage = "Submitting DFHDPLOY JCL for the " + action + " action";
    this.progressBar.stageName = TaskStage.IN_PROGRESS;

    this.startProgressBar();
    this.jobId = "UNKNOWN";
    this.jobOutput = "";

    // Refresh the progress bar by 1% every second or so up to a max of 67%.
    // SubmitJobs will initialise it to 30% and set it to 70% when it
    // completes, we tweak it every so often until then for purely cosmetic purposes.
    setTimeout(this.updateProgressBar.bind(this), this.PROGRESS_BAR_INTERVAL, action);

    try {
      spoolOutput = await SubmitJobs.submitJclString(session, jcl, {
                             jclSource: "",
                             task: this.progressBar,
                             viewAllSpoolContent: true
                           });
    }
    catch (error) {
      this.progressBar.stageName = TaskStage.FAILED;
      throw new Error("Failure occurred submitting DFHDPLOY JCL for jobid " + this.jobId + ": '" + error.message +
                      "'. Most recent status update: '" + this.progressBar.statusMessage + "'.");
    }

    // Find the output
    for (const file of spoolOutput) {
      // we're looking for the SYSTSPRT output from the DFHDPLOY step.
      if (file.ddName === "SYSTSPRT" && file.stepName === "DFHDPLOY") {

        if (file.data === undefined || file.data.length === 0) {
          this.progressBar.stageName = TaskStage.FAILED;
          throw new Error("DFHDPLOY did not generate any output for jobid " + this.jobId +
            ". Most recent status update: '" + this.progressBar.statusMessage + "'.");
        }

        // log the full output for serviceability to the log
        if (this.params.arguments.silent === undefined) {
          const logger = Logger.getAppLogger();
          logger.debug(file.data);
        }
        this.jobOutput = file.data;

        // Finish the progress bar
        this.progressBar.statusMessage = "Completed DFHDPLOY";
        this.endProgressBar();

        // Did DFHDPLOY fail?
        if (file.data.indexOf("DFHRL2055I") > -1) {
          this.progressBar.stageName = TaskStage.FAILED;
          // log the error output to the console
          this.params.response.console.log(file.data);
          throw new Error("DFHDPLOY stopped processing for jobid " + this.jobId + " due to an error.");
        }
        if (file.data.indexOf("DFHRL2043I") > -1) {
          this.progressBar.stageName = TaskStage.COMPLETE;
          // log the error output to the console
          this.params.response.console.log(file.data);
          return "DFHDPLOY completed with warnings.";
        }
        if (file.data.indexOf("DFHRL2012I") > -1) {
          this.progressBar.stageName = TaskStage.COMPLETE;
          // only log the output to the console if verbose output is enabled
          if (this.params.arguments.verbose) {
            this.params.response.console.log(file.data);
          }
          return "Bundle deployment successful.";
        }
        if (file.data.indexOf("DFHRL2037I") > -1) {
          this.progressBar.stageName = TaskStage.COMPLETE;
          // only log the output to the console if verbose output is enabled
          if (this.params.arguments.verbose) {
            this.params.response.console.log(file.data);
          }
          return "Bundle undeployment successful.";
        }

        this.progressBar.stageName = TaskStage.FAILED;
        // log the error output to the console
        this.params.response.console.log(file.data);
        throw new Error("DFHDPLOY command completed for jobid " + this.jobId + ", but status cannot be determined.");
      }
    }

    // If we haven't found SYSTSPRT then echo JESMSGLG instead
    for (const file of spoolOutput) {
      if (file.ddName === "JESMSGLG") {
        this.progressBar.stageName = TaskStage.FAILED;
        // log the error output to the console
        this.params.response.console.log(file.data);
        throw new Error("DFHDPLOY command completed in error for jobid " + this.jobId + " without generating SYSTSPRT output.");
      }
    }

    this.progressBar.stageName = TaskStage.FAILED;
    throw new Error("SYSTSPRT and JESMSGLG output from DFHDPLOY not found for jobid " + this.jobId +
                    ". Most recent status update: '" + this.progressBar.statusMessage + "'.");
  }

  private startProgressBar() {
    if (this.params.arguments.verbose !== true && this.useResponseProgressBar === true) {
      this.params.response.progress.startBar({task: this.progressBar});
    }
  }

  private endProgressBar() {
    if (this.params.arguments.verbose !== true && this.useResponseProgressBar === true) {
      this.params.response.progress.endBar();
    }
  }
}
