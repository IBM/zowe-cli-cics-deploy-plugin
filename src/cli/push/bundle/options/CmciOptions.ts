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

import { ICommandOptionDefinition } from "@zowe/imperative";

/**
 * scmci command line options, derived from zowe-cics equivalents
 */
export class CmciOptions {
  public static GROUP = "CICS Connection Options";

  public static CICS_DEPLOY_CMCI_OPTION_HOST: ICommandOptionDefinition = {
        name: "cics-host",
        aliases: ["ch"],
        description: "The CMCI server host name.",
        type: "string",
        required: false,
        group: CmciOptions.GROUP
  };

  public static CICS_DEPLOY_CMCI_OPTION_PORT: ICommandOptionDefinition = {
        name: "cics-port",
        aliases: ["cpo"],
        description: "The CICS server port.",
        type: "number",
        required: false,
        group: CmciOptions.GROUP
  };

  public static CICS_DEPLOY_CMCI_OPTION_USER: ICommandOptionDefinition = {
        name: "cics-user",
        aliases: ["cu"],
        description: "Mainframe (CICS) user name, which can be the same as your TSO login.",
        type: "string",
        required: false,
        group: CmciOptions.GROUP
  };

  public static CICS_DEPLOY_CMCI_OPTION_PASSWORD: ICommandOptionDefinition = {
        name: "cics-password",
        aliases: ["cpw"],
        description: "Mainframe (CICS) password, which can be the same as your TSO password.",
        type: "string",
        required: false,
        group: CmciOptions.GROUP
  };

  public static CICS_DEPLOY_CMCI_OPTION_REJECT_UNAUTHORIZED: ICommandOptionDefinition = {
        name: "cics-reject-unauthorized",
        aliases: ["cru"],
        description: "Reject self-signed certificates.",
        type: "boolean",
        required: false,
        group: CmciOptions.GROUP
  };

  public static CICS_DEPLOY_CMCI_OPTION_PROTOCOL: ICommandOptionDefinition = {
        name: "cics-protocol",
        aliases: ["cpr"],
        description: "Specifies CMCI protocol (http or https).",
        type: "string",
        required: false,
        allowableValues: {values: ["http", "https"], caseSensitive: false},
        group: CmciOptions.GROUP
  };


  /**
   * Options related to connecting to CMCI
   */
  public static CICS_DEPLOY_CMCI_CONNECTION_OPTIONS: ICommandOptionDefinition[] = [
      CmciOptions.CICS_DEPLOY_CMCI_OPTION_HOST,
      CmciOptions.CICS_DEPLOY_CMCI_OPTION_PORT,
      CmciOptions.CICS_DEPLOY_CMCI_OPTION_USER,
      CmciOptions.CICS_DEPLOY_CMCI_OPTION_PASSWORD,
      CmciOptions.CICS_DEPLOY_CMCI_OPTION_REJECT_UNAUTHORIZED,
      CmciOptions.CICS_DEPLOY_CMCI_OPTION_PROTOCOL
  ];

}
