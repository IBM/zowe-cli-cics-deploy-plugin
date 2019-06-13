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
 * Imperative option for the "bundleid" parameter
 *
 */
export const PortOption: ICommandOptionDefinition = {
    name: "port",
    aliases: ["p"],
    type: "string",
    group: "cics-deploy Options",
    description: "The TCP/IP port number the Node.js application should use for clients to connect to. " +
                 "If a value is specified, it is set within the generated NODEJSAPP's profile. " +
                 "The Node.js application can reference this value by accessing the PORT environment variable, " +
                 "for example using process.env.PORT. " +
                 "Additional environment variables can be set by manually editing the profile."
};
