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
const MAX_TARGETDIR_LENGTH = 255;

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
            "cicsplex": {
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
            "scope": {
              optionDefinition: {
                description: "Specifies the name of the CICS System, or CICS System Group " +
                             "(up to 8 characters) to target.",
                type: "string",
                name: "scope",
                aliases: ["sc"],
                stringLengthRange: [1, MAX_LENGTH],
                required: true
              },
              type: "string"
            },
            "csd-group": {
              optionDefinition: {
                description: "Specifies the CSD group (up to 8 characters) for the bundle resource. If a bundle is " +
                             "deployed then a definition is added to this group; if a bundle is undeployed then the " +
                             "definition is removed from this group. The CSD group is changed for each CICS system " +
                             "that is specified by the --scope option. The --csd-group and --res-group options are " +
                             "mutually exclusive.",
                type: "string",
                name: "csd-group",
                aliases: ["cg", "csdgroup"],
                stringLengthRange: [1, MAX_LENGTH]
              },
              type: "string"
            },
            "res-group": {
              optionDefinition: {
                description: "Specifies the BAS resource group (up to 8 characters) for the bundle resource. If a bundle is " +
                             "deployed then a resource is defined in the BAS data repository; if a bundle is undeployed then the " +
                             "definition is removed. The --csd-group and --res-group options are mutually exclusive.",
                type: "string",
                name: "res-group",
                aliases: ["rg", "resgroup"],
                stringLengthRange: [1, MAX_LENGTH],
                conflictsWith: [ "csd-group" ],
              },
              type: "string"
            },
            "cics-hlq": {
              optionDefinition: {
                description: "Specifies the High Level Qualifier (up to 35 characters) at which the CICS " +
                             "datasets can be found in the target environment.",
                type: "string",
                name: "cics-hlq",
                aliases: ["cq", "cicshlq"],
                stringLengthRange: [1, MAX_HLQ_LENGTH],
                required: true
              },
              type: "string"
            },
            "cpsm-hlq": {
              optionDefinition: {
                description: "Specifies the High Level Qualifier (up to 35 characters) at which the CPSM " +
                             "datasets can be found in the target environment.",
                type: "string",
                name: "cpsm-hlq",
                aliases: ["cph", "cpsmhlq"],
                stringLengthRange: [1, MAX_HLQ_LENGTH],
                required: true
              },
              type: "string"
            },
            "target-directory": {
              optionDefinition: {
                description: "Specifies the target zFS location to which CICS bundles should be uploaded (up to 255 characters).",
                type: "string",
                name: "target-directory",
                aliases: ["td", "targetdir", "target-dir"],
                stringLengthRange: [1, MAX_TARGETDIR_LENGTH],
                required: false
              },
              type: "string"
            },
            "job-card": {
              optionDefinition: {
                description: "Specifies the job card to use with any generated DFHDPLOY JCL.",
                type: "string",
                name: "job-card",
                defaultValue: "//DFHDPLOY JOB DFHDPLOY,CLASS=A,MSGCLASS=X,TIME=NOLIMIT",
                aliases: ["jc", "jobcard"],
                required: true
              },
              type: "string"
            }
          },
          required: ["cicsplex", "scope", "cics-hlq", "cpsm-hlq", "job-card"]
        },
        createProfileExamples: [
          {
            options: "example1 --cicsplex PLEX1 --scope TESTGRP1 --cics-hlq CICSTS55.CICS720 --cpsm-hlq CICSTS55.CPSM550",
            description: "Create a cics-deploy profile called 'example1' to connect to a CPSM managed group of CICS regions " +
                         "within the TESTGRP1 scope of a cicsplex named PLEX1"
          },
          {
            options: "example2 --cicsplex PLEX1 --scope TESTGRP1 --cics-hlq CICSTS55.CICS720 --cpsm-hlq CICSTS55.CPSM550 --res-group BUNDGRP1",
            description: "Create a cics-deploy profile called 'example2' to connect to the same CPSM managed group of regions, " +
                         "and identify a BAS resource group BUNDGRP1 in which to store resource definitions"
          },
          {
            options: "example3 --cicsplex PLEX1 --scope TESTGRP1 --cics-hlq CICSTS55.CICS720 " +
                     "--cpsm-hlq CICSTS55.CPSM550 --target-directory /var/cicsts/bundles",
            description: "Create a cics-deploy profile called 'example3' to connect to the same CPSM managed group of regions, " +
                         "and identify the default USS directory to which bundles should be uploaded"
          }
        ]
      }
    ]
};

export = config;
