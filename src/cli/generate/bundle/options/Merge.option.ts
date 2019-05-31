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
 * Imperative option for the "merge" parameter
 *
 */
export const MergeOption: ICommandOptionDefinition = {
    name: "merge",
    aliases: ["me"],
    type: "boolean",
    defaultValue: false,
    required: false,
    implies: ["overwrite"],
    description: "Enable or disable the ability to merge new resources into an existing CICS bundle manifest." +
                 "Requires --overwrite to be specified."
};

