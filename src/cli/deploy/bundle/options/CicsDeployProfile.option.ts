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

/**
 * Imperative option for the "cics-deploy-profile" parameter
 *
 */
export const CicsDeployProfileOption: ICommandOptionDefinition = {
    name: "cics-deploy-profile",
    aliases: ["profile", "cdp", "p"],
    type: "string",
    absenceImplications: [ "cicsplex", "scope" ],
    description: "Specifies the profile in which the default target environment is configured. If this " +
                 "parameter is not set then the --cicsplex and --scope parameters are required, as is " +
                 "either the --csdgroup or --resgroup parameter."
};

