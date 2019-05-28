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

import { ICommandDefinition } from "@zowe/imperative";
import { BundleidOption } from "./options/Bundleid.option";
import { BundleversionOption } from "./options/Bundleversion.option";
import { NodejsappOption } from "./options/Nodejsapp.option";
import { StartscriptOption } from "./options/Startscript.option";
import { PortOption } from "./options/Port.option";
import { OverwriteOption } from "./options/Overwrite.option";
import { MergeOption } from "./options/Merge.option";

/**
 * Imperative command for the Bundle sub-option of Generate.
 *
 */
export const GenerateBundleDefinition: ICommandDefinition = {
    name: "bundle",
    aliases: ["b", "bun", "bund"],
    summary: "Generate a CICS bundle",
    description: "Generate a CICS bundle in the working directory. " +
                 "The associated data is constructed from a combination of the " +
                 "command-line options and the contents of package.json. If package.json exists, " +
                 "no options are required. If package.json does not exist, both --startscript and --nodejsapp are required.\n " +
                 "Once generated, you can change some or all of these files yourself by using the --overwrite parameter to replace " + 
                 "existing files or the --merge parameter to merge new resources into the existing CICS bundle.",
    type: "command",
    handler: __dirname + "/GenerateBundle.handler",
    options: [ BundleidOption, BundleversionOption, NodejsappOption, StartscriptOption, PortOption,
               OverwriteOption, MergeOption ],
    examples: [
        {
            description: "Generate a CICS bundle in the working directory, taking information from package.json",
            options: ``
        },
        {
            description: "Generate a CICS bundle in the working directory, based on package.json but using a bundle ID of \"mybundle\"",
            options: `--bundleid mybundle`
        },
        {
            description: "Generate a CICS bundle in the working directory in which a package.json does not exist",
            options: `--bundleid mybundle --nodejsapp myapp --startscript server.js`
        }
    ]
};
