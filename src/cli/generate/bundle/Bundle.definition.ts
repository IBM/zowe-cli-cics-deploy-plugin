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

import { ICommandDefinition } from "@brightside/imperative";
import { BundleidOption } from "./options/Bundleid.option";
import { BundleversionOption } from "./options/Bundleversion.option";
import { NodejsappOption } from "./options/Nodejsapp.option";
import { StartscriptOption } from "./options/Startscript.option";
import { PortOption } from "./options/Port.option";

/**
 * Imperative command for the Bundle sub-option of Generate.
 *
 */
export const BundleDefinition: ICommandDefinition = {
    name: "bundle",
    aliases: ["b", "bun", "bund"],
    summary: "Generates a Bundle",
    description: "CICS Bundle meta-data is generated within the working directory. " +
                 "The associated data is constructed from a combination of the " +
                 "input options and the contents of package.json.",
    type: "command",
    handler: __dirname + "/Bundle.handler",
    options: [ BundleidOption, BundleversionOption, NodejsappOption, StartscriptOption, PortOption ]
};
