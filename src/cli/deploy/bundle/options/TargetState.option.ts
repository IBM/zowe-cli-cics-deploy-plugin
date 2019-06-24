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
 * Imperative option for the "targetstate" parameter
 *
 */
export const TargetStateOption: ICommandOptionDefinition = {
    name: "target-state",
    aliases: ["ts", "targetstate"],
    type: "string",
    required: false,
    defaultValue: "ENABLED",
    allowableValues: {
      values: ["DISABLED", "ENABLED", "AVAILABLE"],
      caseSensitive: false
    },
    group: "cics-deploy Options",
    description: "Specifies the target state for the deployed bundle."
};

