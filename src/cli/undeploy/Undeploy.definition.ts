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
import { UndeployBundleDefinition } from "./bundle/UndeployBundle.definition";
/**
 * Imperative command to "undeploy" a Bundle, etc.
 *
 */
const UndeployDefinition: ICommandDefinition = {
    name: "undeploy",
    aliases: ["u", "udep"],
    summary: "Undeploy a CICS bundle from one or more CICS regions within a CICSplex",
    description: "Undeploy a CICS bundle from one or more CICS regions within a CICSplex. " +
                 "A BUNDLE resource is made UNAVAILABLE, it is then DISABLED and " +
                 "DISCARDED from the target scope with the CICSplex.",
    type: "group",
    children: [UndeployBundleDefinition]
};

export = UndeployDefinition;
