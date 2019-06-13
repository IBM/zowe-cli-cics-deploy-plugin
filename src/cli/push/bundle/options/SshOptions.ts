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

import { ICommandOptionDefinition } from "@brightside/imperative";
import { SshSession } from "@brightside/core";

/**
 * ssh command line options, derived from zowe-cli equivalents
 */
export class SshOptions {

  public static CICS_DEPLOY_SSH_OPTION_HOST: ICommandOptionDefinition = {
        name: "ssh-host",
        aliases: ["sh"],
        description: SshSession.SSH_OPTION_HOST.description,
        type: SshSession.SSH_OPTION_HOST.type,
        required: false,
        group: SshSession.SSH_CONNECTION_OPTION_GROUP
  };

  public static CICS_DEPLOY_SSH_OPTION_PORT: ICommandOptionDefinition = {
        name: "ssh-port",
        aliases: ["sp"],
        description: SshSession.SSH_OPTION_PORT.description,
        type: SshSession.SSH_OPTION_PORT.type,
        required: false,
        group: SshSession.SSH_CONNECTION_OPTION_GROUP
  };

  public static CICS_DEPLOY_SSH_OPTION_USER: ICommandOptionDefinition = {
        name: "ssh-user",
        aliases: ["su"],
        description: SshSession.SSH_OPTION_USER.description,
        type: SshSession.SSH_OPTION_USER.type,
        required: false,
        group: SshSession.SSH_CONNECTION_OPTION_GROUP
  };

  public static CICS_DEPLOY_SSH_OPTION_PASSWORD: ICommandOptionDefinition = {
        name: "ssh-password",
        aliases: ["spw"],
        description: SshSession.SSH_OPTION_PASSWORD.description,
        type: SshSession.SSH_OPTION_PASSWORD.type,
        required: false,
        group: SshSession.SSH_CONNECTION_OPTION_GROUP
  };

  public static CICS_DEPLOY_SSH_OPTION_PRIVATEKEY: ICommandOptionDefinition = {
        name: "ssh-private-key",
        aliases: ["spk"],
        description: SshSession.SSH_OPTION_PRIVATEKEY.description,
        type: SshSession.SSH_OPTION_PRIVATEKEY.type,
        required: false,
        group: SshSession.SSH_CONNECTION_OPTION_GROUP
  };

  public static CICS_DEPLOY_SSH_OPTION_KEYPASSPHRASE: ICommandOptionDefinition = {
        name: "ssh-key-passphrase",
        aliases: ["skp"],
        description: SshSession.SSH_OPTION_KEYPASSPHRASE.description,
        type: SshSession.SSH_OPTION_KEYPASSPHRASE.type,
        required: false,
        group: SshSession.SSH_CONNECTION_OPTION_GROUP
  };

  public static CICS_DEPLOY_SSH_OPTION_HANDSHAKETIMEOUT: ICommandOptionDefinition = {
        name: "ssh-handshake-timeout",
        aliases: ["sht"],
        description: SshSession.SSH_OPTION_HANDSHAKETIMEOUT.description,
        type: SshSession.SSH_OPTION_HANDSHAKETIMEOUT.type,
        required: false,
        group: SshSession.SSH_CONNECTION_OPTION_GROUP
  };

  /**
   * Options related to connecting to SSH
   */
  public static CICS_DEPLOY_SSH_CONNECTION_OPTIONS: ICommandOptionDefinition[] = [
      SshOptions.CICS_DEPLOY_SSH_OPTION_HOST,
      SshOptions.CICS_DEPLOY_SSH_OPTION_PORT,
      SshOptions.CICS_DEPLOY_SSH_OPTION_USER,
      SshOptions.CICS_DEPLOY_SSH_OPTION_PASSWORD,
      SshOptions.CICS_DEPLOY_SSH_OPTION_PRIVATEKEY,
      SshOptions.CICS_DEPLOY_SSH_OPTION_KEYPASSPHRASE,
      SshOptions.CICS_DEPLOY_SSH_OPTION_HANDSHAKETIMEOUT
  ];
}
