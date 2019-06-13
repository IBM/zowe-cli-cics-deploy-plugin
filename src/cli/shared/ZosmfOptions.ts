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
import { ZosmfSession } from "@brightside/core";

/**
 * zosMF command line options, derived from zowe-cli equivalents
 */
export class ZosmfOptions {

  public static CICS_DEPLOY_ZOSMF_OPTION_HOST: ICommandOptionDefinition = {
        name: "zosmf-host",
        aliases: ["zh"],
        description: ZosmfSession.ZOSMF_OPTION_HOST.description,
        type: ZosmfSession.ZOSMF_OPTION_HOST.type,
        required: false,
        group: ZosmfSession.ZOSMF_CONNECTION_OPTION_GROUP
  };

  public static CICS_DEPLOY_ZOSMF_OPTION_PORT: ICommandOptionDefinition = {
        name: "zosmf-port",
        aliases: ["zp"],
        description: ZosmfSession.ZOSMF_OPTION_PORT.description,
        type: ZosmfSession.ZOSMF_OPTION_PORT.type,
        required: false,
        group: ZosmfSession.ZOSMF_CONNECTION_OPTION_GROUP
  };

  public static CICS_DEPLOY_ZOSMF_OPTION_USER: ICommandOptionDefinition = {
        name: "zosmf-user",
        aliases: ["zu"],
        description: ZosmfSession.ZOSMF_OPTION_USER.description,
        type: ZosmfSession.ZOSMF_OPTION_USER.type,
        required: false,
        group: ZosmfSession.ZOSMF_CONNECTION_OPTION_GROUP
  };

  public static CICS_DEPLOY_ZOSMF_OPTION_PASSWORD: ICommandOptionDefinition = {
        name: "zosmf-password",
        aliases: ["zpw"],
        description: ZosmfSession.ZOSMF_OPTION_PASSWORD.description,
        type: ZosmfSession.ZOSMF_OPTION_PASSWORD.type,
        required: false,
        group: ZosmfSession.ZOSMF_CONNECTION_OPTION_GROUP
  };

  public static CICS_DEPLOY_ZOSMF_OPTION_REJECT_UNAUTHORIZED: ICommandOptionDefinition = {
        name: "zosmf-reject-unauthorized",
        aliases: ["zru"],
        description: ZosmfSession.ZOSMF_OPTION_REJECT_UNAUTHORIZED.description,
        type: ZosmfSession.ZOSMF_OPTION_REJECT_UNAUTHORIZED.type,
        required: false,
        group: ZosmfSession.ZOSMF_CONNECTION_OPTION_GROUP
  };

  public static CICS_DEPLOY_ZOSMF_OPTION_BASE_PATH: ICommandOptionDefinition = {
        name: "zosmf-base-path",
        aliases: ["zbp"],
        description: ZosmfSession.ZOSMF_OPTION_BASE_PATH.description,
        type: ZosmfSession.ZOSMF_OPTION_BASE_PATH.type,
        required: false,
        group: ZosmfSession.ZOSMF_CONNECTION_OPTION_GROUP
  };

  /**
   * Options related to connecting to z/OSMF
   */
  public static CICS_DEPLOY_ZOSMF_CONNECTION_OPTIONS: ICommandOptionDefinition[] = [
      ZosmfOptions.CICS_DEPLOY_ZOSMF_OPTION_HOST,
      ZosmfOptions.CICS_DEPLOY_ZOSMF_OPTION_PORT,
      ZosmfOptions.CICS_DEPLOY_ZOSMF_OPTION_USER,
      ZosmfOptions.CICS_DEPLOY_ZOSMF_OPTION_PASSWORD,
      ZosmfOptions.CICS_DEPLOY_ZOSMF_OPTION_REJECT_UNAUTHORIZED,
      ZosmfOptions.CICS_DEPLOY_ZOSMF_OPTION_BASE_PATH
  ];
}
