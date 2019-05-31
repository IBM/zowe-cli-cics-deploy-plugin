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

const MAX_LENGTH = 58;

/**
 * Imperative option for the "description" parameter
 *
 */
export const DescriptionOption: ICommandOptionDefinition = {
    name: "description",
    aliases: ["desc"],
    type: "string",
    required: false,
    stringLengthRange: [1, MAX_LENGTH],
    group: "cics-deploy Options",
    description: "An optional value that specifies a description of the bundle definition (up to 58 characters)."
};

