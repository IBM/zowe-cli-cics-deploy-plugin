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

import { ICommandOptionDefinition } from "@zowe/imperative";

/**
 * Imperative option for the "bundleid" parameter
 *
 */
export const PortOption: ICommandOptionDefinition = {
    name: "port",
    aliases: ["p"],
    type: "string",
    description: "An optional TCP/IP port number that the Node.js application expects to use. " +
                 "If a value is specified, it is stored within the generated NODEJSAPP's profile " +
                 "and the associated value can be referenced programmatically by using the 'PORT' " +
                 "environment variable."
};

