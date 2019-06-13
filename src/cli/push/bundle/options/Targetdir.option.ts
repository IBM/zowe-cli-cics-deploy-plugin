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

const MAX_LENGTH = 255;

/**
 * Imperative option for the "targetdir" parameter
 *
 */
export const TargetdirOption: ICommandOptionDefinition = {
    name: "target-directory",
    aliases: ["td", "targetdir", "target-dir"],
    type: "string",
    required: true,
    stringLengthRange: [1, MAX_LENGTH],
    group: "cics-deploy Options",
    description: "Specifies the target zFS location in which the CICS bundle is to be created (up to 255 characters)"
};

