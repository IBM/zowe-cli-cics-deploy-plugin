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
import { NameOption } from "../../shared/Name.option";
import { BundledirOption } from "./options/Bundledir.option";
import { CicsplexOption } from "../../shared/Cicsplex.option";
import { ScopeOption } from "../../shared/Scope.option";
import { CsdgroupOption } from "../../shared/Csdgroup.option";
import { ResgroupOption } from "../../shared/Resgroup.option";
import { CicshlqOption } from "../../shared/Cicshlq.option";
import { CpsmhlqOption } from "../../shared/Cpsmhlq.option";
import { JobcardOption } from "../../shared/Jobcard.option";
import { TimeoutOption } from "../../shared/Timeout.option";
import { TargetStateOption } from "./options/TargetState.option";
import { VerboseOption } from "../../shared/Verbose.option";
import { DescriptionOption } from "./options/Description.option";
import { ZosmfOptions } from "../../shared/ZosmfOptions";


/**
 * Imperative command for the Bundle sub-option of Deploy.
 *
 */
export const DeployBundleDefinition: ICommandDefinition = {
    name: "bundle",
    aliases: ["b", "bun", "bund"],
    summary: "Deploy a CICS bundle",
    description: "Deploy a CICS bundle from zFS to one or more CICS regions within a CICSplex. " +
                 "The DFHDPLOY utility is used to install and make available a BUNDLE resource " +
                 "in the target group of CICS regions.",
    type: "command",
    handler: __dirname + "/DeployBundle.handler",
    options: [ NameOption, BundledirOption, CicsplexOption, ScopeOption, CsdgroupOption , ResgroupOption,
               CicshlqOption, CpsmhlqOption, DescriptionOption, JobcardOption, TimeoutOption, TargetStateOption, VerboseOption]
             .concat(ZosmfOptions.CICS_DEPLOY_ZOSMF_CONNECTION_OPTIONS),
    profile: { optional: ["cics-deploy", "zosmf"] },
    examples: [
        {
            description: "Deploy a CICS bundle with a specific name and location to a default set of target regions",
            options: `--name EXAMPLE --bundle-directory /u/example/bundleDir`
        },
        {
            description: "Deploy a CICS bundle, but declare a timeout if the processing takes too long",
            options: `--name EXAMPLE --bundle-directory /u/example/bundleDir --timeout 60`
        },
        {
            description: "Deploy a CICS bundle to a specific target environment by using specific zosmf & cics-deploy profiles",
            options: `--name EXAMPLE --bundle-directory /u/example/bundleDir --cicsplex TESTPLEX --scope SCOPE --res-group BUNDGRP ` +
                     `--cics-hlq CICSTS55.CICS720 --cpsm-hlq CICSTS55.CPSM550 --zosmf-profile testplex --cics-deploy-profile devcics`
        }
    ]
};
