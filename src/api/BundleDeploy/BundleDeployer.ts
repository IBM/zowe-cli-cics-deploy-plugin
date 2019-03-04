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
import { ZosmfSession, SubmitJobs } from "@brightside/core";
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

    // Create a zosMF session
    const session = ZosmfSession.createBasicZosmfSession(zosmfProfile);

    // Submit some JCL
    await SubmitJobs.submitJclString(session, "test", { jclSource: "" });

    return "Deployment NO-OP";
  }
}
