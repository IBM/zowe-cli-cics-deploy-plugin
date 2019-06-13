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
 * Imperative option for the "jobcard" parameter
 *
 */
export const JobcardOption: ICommandOptionDefinition = {
    name: "job-card",
    aliases: ["jc", "jobcard"],
    type: "string",
    description: "Specifies the job card to use with any generated DFHDPLOY JCL. Use this parameter " +
                 "if you need to tailor the job card and you have not set the --cics-deploy-profile " +
                 "option. You can separate multiple lines of the jobcard with \\n.",
    defaultValue: "//DFHDPLOY JOB DFHDPLOY,CLASS=A,MSGCLASS=X,TIME=NOLIMIT",
    group: "cics-deploy Options",
    required: false
};

