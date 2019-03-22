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
         TaskStage , TaskProgress} from "@brightside/imperative";
import { ZosmfSession, SubmitJobs, List } from "@brightside/core";
import { ParmValidator } from "./ParmValidator";

/**
 * Class to represent a CICS Bundle Deployer.
 *
 * @export
 * @class BundleDeployer
 */
export class BundleDeployer {

  private params: IHandlerParameters;
  private PROGRESS_BAR_INTERVAL = 1500; // milliseconds
  private PROGRESS_BAR_MAX = 67;

  /**
   * Constructor for a BundleDeployer.
   * @param {IHandlerParameters} params - The Imperative handler parameters
   * @throws ImperativeError
   * @memberof BundleDeployer
   */
  constructor(params: IHandlerParameters) {
    this.params = params;
  }

  /**
   * Deploy a CICS Bundle
   * @returns {Promise<string>}
   * @throws ImperativeError
   * @memberof BundleDeployer
   */
  public async deployBundle(): Promise<string> {

    // Validate that the parms are valid for Deploy
    ParmValidator.validateDeploy(this.params);

    // Create a zosMF session
    const session = await this.createZosMFSession();

    // Check that the CICS dataset value looks valid and can be viewed
    await this.checkHLQDatasets(session);

    // Generate some DFHDPLOY JCL
    const jcl = this.getDeployJCL();

    // Submit it
    return this.submitJCL(jcl, session);
  }

  /**
   * Undeploy a CICS Bundle
   * @returns {Promise<string>}
   * @throws ImperativeError
   * @memberof BundleDeployer
   */
  public async undeployBundle(): Promise<string> {

    // Validate that the parms are valid for Deploy
    ParmValidator.validateUndeploy(this.params);

    // Create a zosMF session
    const session = await this.createZosMFSession();

    // Check that the CICS dataset value looks valid and can be viewed
    await this.checkHLQDatasets(session);

    // Generate some DFHDPLOY JCL
    const jcl = this.getUndeployJCL();

    // Submit it
    return this.submitJCL(jcl, session);
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
    const jcl = this.generateCommonJCLHeader() +
      this.wrapLongLineForJCL("DEPLOY BUNDLE(" + this.params.arguments.name + ")\n") +
      this.wrapLongLineForJCL("       BUNDLEDIR(" + this.params.arguments.bundledir + ")\n") +
      this.generateCommonJCLFooter();

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

  private async createZosMFSession(): Promise<any> {
    // Create a zosMF session
    const zosmfProfile = this.params.profiles.get("zosmf");

    if (zosmfProfile === undefined) {
      throw new Error("No zosmf profile found");
    }
    return ZosmfSession.createBasicZosmfSession(zosmfProfile);
  }

  private async checkHLQDatasets(session: any) {
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
  }

  private updateProgressBar(status: ITaskWithStatus) {
    // Increment the progress by 1%. This will refresh what the user sees
    // on the console.
    status.percentComplete = status.percentComplete + 1;

    // Continue iterating on progress updates until we've reached the max value,
    // or until the processing has completed.
    if (status.percentComplete < this.PROGRESS_BAR_MAX &&
        status.stageName === TaskStage.IN_PROGRESS) {
      setTimeout(this.updateProgressBar.bind(this), this.PROGRESS_BAR_INTERVAL, status);
    }
  }

  private async submitJCL(jcl: string, session: any): Promise<string> {
    let spoolOutput: any;
    const status: ITaskWithStatus = { percentComplete: TaskProgress.TEN_PERCENT,
                                      statusMessage: "Submitting DFHDPLOY JCL",
                                      stageName: TaskStage.IN_PROGRESS };
    this.params.response.progress.startBar({task: status});

    // Refresh the progress bar by 1% every second or so up to a max of 67%.
    // SubmitJobs will initialise it to 30% and set it to 70% when it
    // completes, we tweak it every so often until then for purely cosmetic purposes.
    setTimeout(this.updateProgressBar.bind(this), this.PROGRESS_BAR_INTERVAL, status);

    try {
      spoolOutput = await SubmitJobs.submitJclString(session, jcl, {
                             jclSource: "",
                             task: status,
                             viewAllSpoolContent: true
                           });
    }
    catch (error) {
      status.stageName = TaskStage.FAILED;
      throw new Error("Failure occurred submitting DFHDPLOY JCL: '" + error.message +
                      "'. Most recent status update: '" + status.statusMessage + "'.");
    }

    // Find the output
    for (const file of spoolOutput) {
      // we're looking for the SYSTSPRT output from the DFHDPLOY step.
      if (file.ddName === "SYSTSPRT" && file.stepName === "DFHDPLOY") {

        // log the full output for serviceability to the log
        const logger = Logger.getAppLogger();
        if (file.data === undefined || file.data.length === 0) {
          status.stageName = TaskStage.FAILED;
          throw new Error("DFHDPLOY did not generate any output. Most recent status update: '" + status.statusMessage + "'.");
        }
        logger.debug(file.data);

        // Finish the progress bar
        status.statusMessage = "Completed DFHDPLOY";
        this.params.response.progress.endBar();

        // Did DFHDPLOY fail?
        if (file.data.indexOf("DFHRL2055I") > -1) {
          status.stageName = TaskStage.FAILED;
          // log the error output to the console
          this.params.response.console.log(file.data);
          throw new Error("DFHDPLOY stopped processing due to an error.");
        }
        if (file.data.indexOf("DFHRL2043I") > -1) {
          status.stageName = TaskStage.COMPLETE;
          // log the error output to the console
          this.params.response.console.log(file.data);
          return "DFHDPLOY completed with warnings.";
        }
        if (file.data.indexOf("DFHRL2012I") > -1) {
          status.stageName = TaskStage.COMPLETE;
          // only log the output to the console if verbose output is enabled
          if (this.params.arguments.verbose) {
            this.params.response.console.log(file.data);
          }
          return "Bundle deployment successful.";
        }
        if (file.data.indexOf("DFHRL2037I") > -1) {
          status.stageName = TaskStage.COMPLETE;
          // only log the output to the console if verbose output is enabled
          if (this.params.arguments.verbose) {
            this.params.response.console.log(file.data);
          }
          return "Bundle undeployment successful.";
        }

        status.stageName = TaskStage.FAILED;
        // log the error output to the console
        this.params.response.console.log(file.data);
        throw new Error("DFHDPLOY command completed, but status cannot be determined.");
      }
    }

    status.stageName = TaskStage.FAILED;
    throw new Error("SYSTSPRT output from DFHDPLOY not found. Most recent status update: '" + status.statusMessage + "'.");
  }
}
