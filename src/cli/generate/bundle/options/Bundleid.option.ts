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
export const BundleidOption: ICommandOptionDefinition = {
    name: "bundleid",
    aliases: ["b", "id", "bid"],
    type: "string",
    description: "The ID for the generated CICS bundle, up to 64 characters. If no value is " +
                 "specified then a default value is created from the 'name' property " +
                 "in the package.json file in the current working directory." +
                 "If the value is too long it will be truncated. If it contains characters " +
                 "not supported by CICS, each one will be replaced by an X."
};

