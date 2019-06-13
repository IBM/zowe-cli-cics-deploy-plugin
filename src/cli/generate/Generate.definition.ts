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
import { GenerateBundleDefinition } from "./bundle/GenerateBundle.definition";
/**
 * Imperative command to "generate" a Bundle, etc.
 *
 */
const GenerateDefinition: ICommandDefinition = {
    name: "generate",
    aliases: ["g", "gen"],
    summary: "Transform the working directory into a CICS bundle",
    description: "Generate a CICS bundle and associated metadata files in the current working directory. " +
                 "This allows the application in the current working directory to be deployed to CICS.",
    type: "group",
    children: [GenerateBundleDefinition]
};

export = GenerateDefinition;
