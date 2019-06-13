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
    name: "bundle-id",
    aliases: ["b", "id", "bundleid"],
    type: "string",
    group: "cics-deploy Options",
    description: "The ID for the generated CICS bundle, up to 64 characters. If no value is " +
                 "specified, a default value is created from the 'name' property " +
                 "in the package.json file in the current working directory. " +
                 "If the value is too long, it is truncated. If it contains characters " +
                 "that are not supported by CICS, each character is replaced by an X."
};

