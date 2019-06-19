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

const MAX_LENGTH = 35;

/**
 * Imperative option for the "cpsmhlq" parameter
 *
 */
export const CpsmhlqOption: ICommandOptionDefinition = {
    name: "cpsm-hlq",
    aliases: ["cph", "cpsmhlq"],
    type: "string",
    required: false,
    stringLengthRange: [1, MAX_LENGTH],
    group: "cics-deploy Options",
    description: "Specifies the high-level qualifier (up to 35 characters) at which the CPSM " +
                 "datasets can be found in the target environment. Use this parameter if you have not set " +
                 "the --cics-deploy-profile option."
};

