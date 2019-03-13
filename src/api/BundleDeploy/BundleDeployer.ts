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

import { IHandlerParameters, Logger, ImperativeError, Session } from "@brightside/imperative";
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

  /**
   * Construct the DFHDPLOY DEPLOY BUNDLE JCL.
   * @returns {string}
   * @throws ImperativeError
   * @memberof BundleDeployer
   */
  public getDeployJCL(): string {
    // Deploy actions begin by first undeploying any former version of the
    // Bundle that may still be installed, so generate an undeploy statement
    // first.
    let jcl = this.generateUndeployJCLWithoutTerminator();

    jcl = jcl + "*\n";

    // Now generate the deploy statement.
    jcl = jcl + "DEPLOY BUNDLE(" + this.params.arguments.name + ")\n" +
                "       BUNDLEDIR(" + this.params.arguments.bundledir + ")\n" +
                "       SCOPE(" + this.params.arguments.scope + ")\n" +
                "       STATE(AVAILABLE)\n";

    if (this.params.arguments.timeout !== undefined) {
      jcl = jcl + "       TIMEOUT(" + this.params.arguments.timeout + ")\n";
    }
    if (this.params.arguments.csdgroup !== undefined) {
      jcl = jcl + "       CSDGROUP(" + this.params.arguments.csdgroup + ");\n";
    }
    if (this.params.arguments.resgroup !== undefined) {
      jcl = jcl + "       RESGROUP(" + this.params.arguments.resgroup + ");\n";
    }

    // finally add a terminator
    jcl = jcl + "/*\n";

    return jcl;
  }

  /**
   * Construct the DFHDPLOY UNDEPLOY BUNDLE JCL.
   * @returns {string}
   * @throws ImperativeError
   * @memberof BundleDeployer
   */
  public getUndeployJCL(): string {
    // Get the basicundeploy JCL
    let jcl = this.generateUndeployJCLWithoutTerminator();

    // finally add a terminator
    jcl = jcl + "/*\n";

    return jcl;
  }

  // Generate the JCL for undeploy, but without terminating the stream
  private generateUndeployJCLWithoutTerminator(): string {
    let jcl = this.params.arguments.jobcard + "\n" +
          "//DFHDPLOY EXEC PGM=DFHDPLOY,REGION=100M\n" +
          "//STEPLIB  DD DISP=SHR,DSN=" + this.params.arguments.cicshlq + ".SDFHLOAD\n" +
          "//         DD DISP=SHR,DSN=" + this.params.arguments.cpsmhlq + ".SEYUAUTH\n" +
          "//SYSTSPRT DD SYSOUT=*\n" +
          "//SYSIN    DD *\n" +
          "*\n" +
          "SET CICSPLEX(" + this.params.arguments.cicsplex + ");\n" +
          "*\n" +
          "UNDEPLOY BUNDLE(" + this.params.arguments.name + ")\n" +
          "       SCOPE(" + this.params.arguments.scope + ")\n" +
          "       STATE(DISCARDED)\n";

    if (this.params.arguments.timeout !== undefined) {
      jcl = jcl + "       TIMEOUT(" + this.params.arguments.timeout + ")\n";
    }
    if (this.params.arguments.csdgroup !== undefined) {
      jcl = jcl + "       CSDGROUP(" + this.params.arguments.csdgroup + ");\n";
    }
    if (this.params.arguments.resgroup !== undefined) {
      jcl = jcl + "       RESGROUP(" + this.params.arguments.resgroup + ");\n";
    }

    return jcl;
  }


  private async createZosMFSession(): Promise<Session> {
    // Create a zosMF session
    const zosmfProfile = this.params.profiles.get("zosmf");

    if (zosmfProfile === undefined) {
      throw new Error("No zosmf profile found");
    }
    return ZosmfSession.createBasicZosmfSession(zosmfProfile);
  }

  private async checkHLQDatasets(session: Session) {
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

  private async submitJCL(jcl: string, session: Session): Promise<string> {
    let spoolOutput: any;
    spoolOutput = await SubmitJobs.submitJclString(session, jcl,
                           { jclSource: "", viewAllSpoolContent: true });

    // Find the output
    for (const file of spoolOutput) {
      // we're looking for the SYSTSPRT output from the DFHDPLOY step.
      if (file.ddName === "SYSTSPRT" && file.stepName === "DFHDPLOY") {

        // log the output
        const logger = Logger.getAppLogger();
        this.params.response.console.log(file.data);
        logger.debug(file.data);

        // Did DFHDPLOY fail?
        if (file.data.indexOf("DFHRL2055I") > -1) {
          throw new Error("DFHDPLOY stopped processing due to an error.");
        }
        if (file.data.indexOf("DFHRL2043I") > -1) {
          return "DFHDPLOY completed with warnings.";
        }
        if (file.data.indexOf("DFHRL2012I") > -1) {
          return "DFHDPLOY DEPLOY command successful.";
        }
        if (file.data.indexOf("DFHRL2037I") > -1) {
          return "DFHDPLOY UNDEPLOY command successful.";
        }

        return "DFHDPLOY command completed, but status cannot be determined.";
      }
    }

    throw new Error("SYSTSPRT output from DFHDPLOY not found.");
  }
}
