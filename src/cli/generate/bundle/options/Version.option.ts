/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
* Copyright IBM, 2019
*
*/

import { ICommandOptionDefinition } from "@brightside/imperative";

/**
 * Imperative option for the "version" parameter
 *
 */
export const VersionOption: ICommandOptionDefinition = {
    name: "version",
    aliases: ["v", "ver"],
    type: "string",
    description: "The major.minor.micro version number for the generated CICS Bundle. If no value is " +
                 "specified then a default value of 1.0.0 is used."
};

