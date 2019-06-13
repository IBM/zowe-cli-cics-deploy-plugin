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

import { IHandlerParameters, IProfile } from "@brightside/imperative";


/**
 * Class to implement CMCI configuration.
 *
 * @export
 * @class CmciConfig
 */
export class CmciConfig {

  /**
   * Merge command line overrides together with the optional cmciProfile into a
   * composite whole
   */
  public static mergeProfile(cmciProfile: IProfile, params: IHandlerParameters) {

    if (params.arguments.ch !== undefined) {
      cmciProfile.host = params.arguments.ch;
      cmciProfile.H = params.arguments.ch;
    }

    if (params.arguments.cpo !== undefined) {
      cmciProfile.port = params.arguments.cpo;
      cmciProfile.P = params.arguments.cpo;
    }

    if (params.arguments.cu !== undefined) {
      cmciProfile.user = params.arguments.cu;
      cmciProfile.u = params.arguments.cu;
    }

    if (params.arguments.cpw !== undefined) {
      cmciProfile.password = params.arguments.cpw;
      cmciProfile.pw = params.arguments.cpw;
    }

    if (params.arguments.cru !== undefined) {
      cmciProfile.rejectUnauthorized = params.arguments.cru;
      cmciProfile.ru = params.arguments.cru;
    }

    if (params.arguments.cpr !== undefined) {
      cmciProfile.protocol = params.arguments.cpr;
      cmciProfile.o = params.arguments.cpr;
    }

    // The CICS profile is optional, only validate it further if there is some content
    if (Object.keys(cmciProfile).length > 0) {
      CmciConfig.validateRequired(cmciProfile);
    }
  }

  private static DEFAULT_CMCI_PORT = 1490;
  private static validateRequired(cmciProfile: IProfile) {
    this.checkValueFound(cmciProfile.host, "cics-host");
    this.checkValueFound(cmciProfile.user, "cics-user");
    this.checkValueFound(cmciProfile.password, "cics-password");

    // Now implement the default value for the port
    if (cmciProfile.port === undefined) {
       cmciProfile.port = CmciConfig.DEFAULT_CMCI_PORT;
       cmciProfile.P = CmciConfig.DEFAULT_CMCI_PORT;
    }

    // Note, default values for protocol and rejectUnauthorized are implemented
    // in the underlying cics-plugin.
  }

  private static checkValueFound(value: string, parm: string) {
    if (value === undefined) {
      throw new Error("Partial cics plug-in configuration encountered, --" + parm  + " is not set.");
    }
  }
}
