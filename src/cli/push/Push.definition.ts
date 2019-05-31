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
import { PushBundleDefinition } from "./bundle/PushBundle.definition";
/**
 * Imperative command to "push" a Bundle, etc.
 *
 */
const PushDefinition: ICommandDefinition = {
    name: "push",
    aliases: ["p"],
    summary: "Push a CICS bundle from the working directory to one or more CICS regions within a CICSplex",
    description: "Push combines several actions for deploying a bundle to CICS into a single command. It uploads the " +
                 "bundle to z/OS, optionally runs an 'npm install' command on the remote system, then uses " +
                 "DFHDPLOY to install and enable the bundle in a target CICS environment.",
    type: "group",
    children: [PushBundleDefinition]
};

export = PushDefinition;
