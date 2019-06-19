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
 * Imperative option for the "startscript" parameter
 *
 */
export const StartscriptOption: ICommandOptionDefinition = {
    name: "start-script",
    aliases: ["s", "ss", "startscript"],
    type: "string",
    group: "cics-deploy Options",
    description: "Up to 255 character path to the Node.js start script that runs when " +
                 "the associated bundle is enabled in CICS. If a value is not " +
                 "specified, a default value is created from either the 'scripts.start' property " +
                 "of the package.json file in the current working directory, or from the 'main' property."
};

