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

import { IHandlerParameters } from "@zowe/imperative";
import { BundleDeployer } from "../BundleDeploy/BundleDeployer";


/**
 * Class to represent a CICS Bundle Pusher.
 *
 * @export
 * @class BundlePusher
 */
export class BundlePusher {

  private params: IHandlerParameters;

  /**
   * Constructor for a BundlePusher.
   * @param {IHandlerParameters} params - The Imperative handler parameters
   * @throws ImperativeError
   * @memberof BundlePusher
   */
  constructor(params: IHandlerParameters) {
    this.params = params;
  }

  public async performPush(): Promise<string> {
    // Start by validating any parameters that will be used by the deploy action,
    // this should flush out most input errors before we go on to attempt upload
    // of the bundle
    const dp = new BundleDeployer(this.params);
    dp.validateDeployParms();

    // Check that the current working directory is a CICS bundle
    // TODO

    // Check that the remote bundledir is accessible. If it already exists and is
    // populated then complain if --overwrite is not set

    // If --overwrite is set then undeploy any existing bundle from CICS
    // TODO

    // If --overwrite is set the flush the remote directory structure
    // TODO

    // Upload the bundle
    // TODO

    // If there's a package.json file in the root of the bundle then run npm install
    // TODO

    // Run DFHDPLOY to install the bundle
    // TODO

    return "Null PUSH operation performed.";
  }
}
