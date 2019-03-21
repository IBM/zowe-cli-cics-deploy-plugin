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
import { DeployBundleDefinition } from "./bundle/DeployBundle.definition";
/**
 * Imperative command to "deploy" a Bundle, etc.
 *
 */
const DeployDefinition: ICommandDefinition = {
    name: "deploy",
    aliases: ["d", "dep"],
    summary: "Deploy a CICS bundle to one or more CICS regions within a CICSplex",
    description: "Deploy a CICS bundle from zFS to one or more CICS regions within a CICSplex. " +
                 "A BUNDLE resource is installed, ENABLED and made AVAILABLE in the " +
                 "target scope of the CICSplex.",
    type: "group",
    children: [DeployBundleDefinition],
};

export = DeployDefinition;
