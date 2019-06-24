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

const MAX_LENGTH = 8;

/**
 * Imperative option for the "resgroup" parameter
 *
 */
export const ResgroupOption: ICommandOptionDefinition = {
    name: "res-group",
    aliases: ["rg", "resgroup"],
    type: "string",
    stringLengthRange: [1, MAX_LENGTH],
    conflictsWith: [ "csdgroup" ],
    group: "cics-deploy Options",
    description: "Specifies the BAS resource group (up to 8 characters) for the bundle resource. If a bundle is " +
                 "deployed, a resource is defined in the BAS data repository. If a bundle is undeployed, the " +
                 "definition is removed. The --csd-group and --res-group options are " +
                 "mutually exclusive."
};

