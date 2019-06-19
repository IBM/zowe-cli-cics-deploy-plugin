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

const MAX_VALUE = 1800;

/**
 * Imperative option for the "timeout" parameter
 *
 */
export const TimeoutOption: ICommandOptionDefinition = {
    name: "timeout",
    aliases: ["to"],
    type: "number",
    numericValueRange: [1, MAX_VALUE],
    group: "cics-deploy Options",
    description: "An optional numerical value that specifies the maximum amount of time in seconds " +
                 "(1 - " + MAX_VALUE + " inclusive) for the DFHDPLOY command to complete. If not specified " +
                 "DFHDPLOY will use its default of 300 seconds."
};
