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
 * Imperative option for the "verbose" parameter
 *
 */
export const VerboseOption: ICommandOptionDefinition = {
    name: "verbose",
    aliases: ["v"],
    type: "boolean",
    defaultValue: false,
    required: false,
    group: "cics-deploy Options",
    description: "Enable or suppress verbose output from the DFHDPLOY tool."
};

