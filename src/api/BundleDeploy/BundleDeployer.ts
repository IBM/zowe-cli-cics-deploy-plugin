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

import { IHandlerParameters, Logger, ImperativeError } from "@brightside/imperative";
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
    let zosmfProfile;
    try {
      zosmfProfile = this.params.profiles.get("zosmf");
    }
    catch (error) {
      // Unit tests tend to cause an exception here
      throw new Error("No zosmf profile found");
    }
    if (zosmfProfile === undefined) {
      throw new Error("No zosmf profile found");
    }
    const session = ZosmfSession.createBasicZosmfSession(zosmfProfile);

    // Check that the CICS dataset value looks valid and can be viewed
    // Access errors will trigger an Exception
    const pds = this.params.arguments.cicshlq + ".SDFHLOAD";
    let listResp;
    try {
      listResp = await List.allMembers(session, pds, {});
    }
    catch (error) {
      throw new Error("Validation of --cicshlq dataset failed: " + error.message);
    }
    if (JSON.stringify(listResp).indexOf("DFHDPLOY") === -1) {
      throw new Error("DFHDPLOY not found in SDFHLOAD within the --cicshlq dataset: " + pds);
    }

    // Submit some JCL
    // await SubmitJobs.submitJclString(session, this.getJCL(pds, this.params.arguments.jobcard), { jclSource: "" });

    return "Deployment NO-OP";
  }

  // yeah, I know... this JCL runs a trace job. I'm just playing
  public getJCL(cicspds: string, jobcard: string): string {
    return jobcard + "\n" +
           "//DFHDPLOY EXEC PGM=DFHTU730,REGION=3000K\n" +
           "//STEPLIB  DD DISP=SHR,DSN=" + cicspds + "\n" +
           "//DFHAUXT  DD DSN=P9COOPR.CICSP2.RHOB.AUXA,DISP=SHR\n" +
           "//DFHAXPRT DD SYSOUT=A\n" +
           "//SYSABEND DD SYSOUT=A\n" +
           "//DFHAXPRM DD *\n" +
           "FULL\n" +
           "//\n";
  }
}
