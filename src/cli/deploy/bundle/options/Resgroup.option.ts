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
    name: "resgroup",
    aliases: ["rg"],
    type: "string",
    stringLengthRange: [1, MAX_LENGTH],
    conflictsWith: [ "csdgroup", "cics-deploy-profile" ],
    description: "Specifies the BAS resource group (up to 8 characters) to add the bundle resource to. " +
                 "The bundle resource is defined in BAS. The --resgroup and --csdgroup options are mutually " +
                 "exclusive, one of them must be set if --scope is specified."
};

