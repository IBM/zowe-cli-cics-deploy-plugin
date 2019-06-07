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

import { IHandlerParameters, IProfile } from "@zowe/imperative";


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

  private static validateRequired(zosmfProfile: IProfile) {
    if (zosmfProfile.host === undefined) {
      throw new Error("Required parameter --zosmf-host is not set.");
    }
    if (zosmfProfile.port === undefined) {
      throw new Error("Required parameter --zosmf-port is not set.");
    }
    if (zosmfProfile.user === undefined) {
      throw new Error("Required parameter --zosmf-user is not set.");
    }
    if (zosmfProfile.password === undefined) {
      throw new Error("Required parameter --zosmf-password is not set.");
    }
    if (zosmfProfile.rejectUnauthorized === undefined) {
      throw new Error("Required parameter --zosmf-reject-unauthorized is not set.");
    }
  }

}
