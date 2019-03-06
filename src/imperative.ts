/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
* Copyright Contributors to the Zowe Project.
* Copyright IBM Corp, 2019
*
*/

import {IImperativeConfig} from "@brightside/imperative";

const MAX_LENGTH = 8;
const MAX_HLQ_LENGTH = 35;

const config: IImperativeConfig = {
    commandModuleGlobs: ["**/cli/*/*.definition!(.d).*s"],
    pluginHealthCheck: __dirname + "/healthCheck.handler",
    pluginSummary: "Generate and deploy IBM CICS bundle resources",
    pluginAliases: ["cdep"],
    rootCommandDescription: "CICS bundle deployment plugin.",
    productDisplayName: "Zowe cics-deploy plug-in",
    name: "cics-deploy",
    profiles: [
      {
        type: "cics-deploy",
        schema: {
          type: "object",
          title: "The cics-deploy-profile schema",
          description: "Specifies the target environment for the cics-deploy deploy and undeploy actions.",
          properties: {
            cicsplex: {
              optionDefinition: {
                description: "Specifies the CICSplex (up to 8 characters) to target.",
                type: "string",
                name: "cicsplex",
                aliases: ["cp"],
                stringLengthRange: [1, MAX_LENGTH],
                required: true
              },
              type: "string"
            },
            scope: {
              optionDefinition: {
                description: "Specifies the name of the CICS System, or CICS System Group " +
                             "(up to 8 characters) to target.",
                type: "string",
                name: "scope",
                aliases: ["sc"],
                stringLengthRange: [1, MAX_LENGTH],
                impliesOneOf: ["csdgroup", "resgroup"],
                required: true
              },
              type: "string"
            },
            csdgroup: {
              optionDefinition: {
                description: "Specifies the CSD group (up to 8 characters) for the bundle resource. If a bundle is " +
                             "deployed then a definition is added to this group; if a bundle is undeployed then the " +
                             "definition is removed from this group. The CSD group is changed for each CICS system " +
                             "that is specified by the --scope option. The --csdgroup and --resgroup options are " +
                             "mutually exclusive.",
                type: "string",
                name: "csdgroup",
                aliases: ["cg"],
                stringLengthRange: [1, MAX_LENGTH]
              },
              type: "string"
            },
            resgroup: {
              optionDefinition: {
                description: "Specifies the BAS resource group (up to 8 characters) for the bundle resource. If a bundle is " +
                             "deployed then a resource is defined in the BAS data repository; if a bundle is undeployed then the " +
                             "definition is removed. The --csdgroup and --resgroup options are mutually exclusive.",
                type: "string",
                name: "resgroup",
                aliases: ["rg"],
                stringLengthRange: [1, MAX_LENGTH],
                conflictsWith: [ "csdgroup" ],
              },
              type: "string"
            },
            cicshlq: {
              optionDefinition: {
                description: "Specifies the High Level Qualifier (up to 35 characters) at which the CICS " +
                             "datasets can be found in the target environment.",
                type: "string",
                name: "cicshlq",
                aliases: ["hlq"],
                stringLengthRange: [1, MAX_HLQ_LENGTH],
                required: true
              },
              type: "string"
            },
            jobcard: {
              optionDefinition: {
                description: "Specifies the job card to use with any generated DFHDPLOY JCL.",
                type: "string",
                name: "jobcard",
                defaultValue: "//DFHDPLOY JOB DFHDPLOY,CLASS=A,MSGCLASS=X,TIME=NOLIMIT",
                aliases: ["jc"],
                required: true
              },
              type: "string"
            }
          },
          required: ["cicsplex", "scope", "cicshlq", "jobcard"]
        }
      }
    ]
};

export = config;
