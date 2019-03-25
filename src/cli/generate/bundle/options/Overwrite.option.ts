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
 * Imperative option for the "overwrite" parameter
 *
 */
export const OverwriteOption: ICommandOptionDefinition = {
    name: "overwrite",
    aliases: ["ow"],
    type: "boolean",
    defaultValue: false,
    required: false,
    description: "Enable or disable the ability to replace existing files within a CICS bundle."
};

