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
export const BundleidOption: ICommandOptionDefinition = {
    name: "bundleid",
    aliases: ["b", "id", "bid"],
    type: "string",
    description: "Up to 64 character identity for the CICS Bundle. If no value is " +
                 "specified then a default value is created from the 'name' property " +
                 "in the package.json file in the current working directory."
};

