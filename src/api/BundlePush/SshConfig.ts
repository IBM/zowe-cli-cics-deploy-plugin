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
 * Class to implement SSH configuration.
 *
 * @export
 * @class SshConfig
 */
export class SshConfig {

  /**
   * Merge command line overrides together with the optional sshProfile into a
   * composite whole
   */
  public static mergeProfile(sshProfile: IProfile, params: IHandlerParameters) {

    if (params.arguments.sh !== undefined) {
      sshProfile.host = params.arguments.sh;
      sshProfile.H = params.arguments.sh;
    }

    if (params.arguments.sp !== undefined) {
      sshProfile.port = params.arguments.sp;
      sshProfile.P = params.arguments.sp;
    }

    if (params.arguments.su !== undefined) {
      sshProfile.user = params.arguments.su;
      sshProfile.u = params.arguments.su;
    }

    if (params.arguments.spw !== undefined) {
      sshProfile.password = params.arguments.spw;
      sshProfile.pass = params.arguments.spw;
      sshProfile.pw = params.arguments.spw;
    }

    if (params.arguments.spk !== undefined) {
      sshProfile.privateKey = params.arguments.spk;
      sshProfile.key = params.arguments.spk;
      sshProfile.pk = params.arguments.spk;
    }

    if (params.arguments.skp !== undefined) {
      sshProfile.keyPassphrase = params.arguments.skp;
      sshProfile.passphrase = params.arguments.skp;
      sshProfile.kp = params.arguments.skp;
    }

    if (params.arguments.sht !== undefined) {
      sshProfile.handshakeTimeout = params.arguments.sht;
      sshProfile.timeout = params.arguments.sht;
      sshProfile.to = params.arguments.sht;
    }

    SshConfig.validateRequired(sshProfile);
  }

  private static DEFAULT_SSH_PORT = 22;
  private static validateRequired(sshProfile: IProfile) {
    this.checkValueFound(sshProfile.host, "ssh-host");
    this.checkValueFound(sshProfile.user, "ssh-user");

    // Now implement the default value for the port
    if (sshProfile.port === undefined) {
       sshProfile.port = SshConfig.DEFAULT_SSH_PORT;
       sshProfile.P = SshConfig.DEFAULT_SSH_PORT;
    }
  }

  private static checkValueFound(value: string, parm: string) {
    if (value === undefined) {
      throw new Error("Required parameter --" + parm  + " is not set.");
    }
  }
}
