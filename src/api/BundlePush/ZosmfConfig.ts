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
 * Class to implement zosMF configuration.
 *
 * @export
 * @class ZosmfConfig
 */
export class ZosmfConfig {

  /**
   * Merge command line overrides together with the optional zosmfProfile into a
   * composite whole
   */
  public static mergeProfile(zosmfProfile: IProfile, params: IHandlerParameters) {

    if (params.arguments.zh !== undefined) {
      zosmfProfile.host = params.arguments.zh;
      zosmfProfile.H = params.arguments.zh;
    }

    if (params.arguments.zp !== undefined) {
      zosmfProfile.port = params.arguments.zp;
      zosmfProfile.P = params.arguments.zp;
    }

    if (params.arguments.zu !== undefined) {
      zosmfProfile.user = params.arguments.zu;
      zosmfProfile.u = params.arguments.zu;
    }

    if (params.arguments.zpw !== undefined) {
      zosmfProfile.password = params.arguments.zpw;
      zosmfProfile.pass = params.arguments.zpw;
      zosmfProfile.pw = params.arguments.zpw;
    }

    if (params.arguments.zru !== undefined) {
      zosmfProfile.rejectUnauthorized = params.arguments.zru;
      zosmfProfile.ru = params.arguments.zru;
    }

    if (params.arguments.zbp !== undefined) {
      zosmfProfile.basePath = params.arguments.zbp;
      zosmfProfile.bp = params.arguments.zbp;
    }

    ZosmfConfig.validateRequired(zosmfProfile);
  }

  private static DEFAULT_ZOSMF_PORT = 443;
  private static validateRequired(zosmfProfile: IProfile) {
    this.checkValueFound(zosmfProfile.host, "zosmf-host");
    this.checkValueFound(zosmfProfile.user, "zosmf-user");
    this.checkValueFound(zosmfProfile.password, "zosmf-password");

    // Now implement the default value for the port
    if (zosmfProfile.port === undefined) {
       zosmfProfile.port = ZosmfConfig.DEFAULT_ZOSMF_PORT;
       zosmfProfile.P = ZosmfConfig.DEFAULT_ZOSMF_PORT;
    }

    // And for reject-unauthorized
    if (zosmfProfile.rejectUnauthorized === undefined) {
       zosmfProfile.rejectUnauthorized = true;
       zosmfProfile.ru = true;
    }
  }

  private static checkValueFound(value: string, parm: string) {
    if (value === undefined) {
      throw new Error("Required parameter --" + parm  + " is not set.");
    }
  }
}
