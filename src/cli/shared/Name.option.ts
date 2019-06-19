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

const MAX_LENGTH = 8;

/**
 * Imperative option for the "name" parameter
 *
 */
export const NameOption: ICommandOptionDefinition = {
    name: "name",
    aliases: ["n"],
    type: "string",
    required: true,
    stringLengthRange: [1, MAX_LENGTH],
    group: "cics-deploy Options",
    description: "Specifies the name of the CICS BUNDLE resource (up to 8 characters) to deploy or undeploy."
};

