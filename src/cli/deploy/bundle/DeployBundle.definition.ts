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
import { TimeoutOption } from "../../shared/Timeout.option";

/**
 * Imperative command for the Bundle sub-option of Deploy.
 *
 */
export const DeployBundleDefinition: ICommandDefinition = {
    name: "bundle",
    aliases: ["b", "bun", "bund"],
    summary: "Deploy a CICS bundle",
    description: "Deploy a CICS bundle from zFS to a CPSM managed group of CICS regions. " +
                 "The DFHDPLOY utility is used to install and make available a BUNDLE resource " +
                 "in the target group of CICS regions.",
    type: "command",
    handler: __dirname + "/DeployBundle.handler",
    options: [ NameOption, BundledirOption, CicsplexOption, ScopeOption, CsdgroupOption , ResgroupOption, TimeoutOption],
    profile: { optional: ["cics-deploy"] },
    examples: [
        {
            description: "Deploy a CICS bundle with a specific name and location to a default set of target regions",
            options: `--name EXAMPLE --bundledir /u/example/bundleDir --cics-deploy-profile default`
        },
        {
            description: "Deploy a CICS bundle, but declare a timeout should the processing take too long",
            options: `--name EXAMPLE --bundledir /u/example/bundleDir --cics-deploy-profile default --timeout 60`
        },
        {
            description: "Deploy a CICS bundle to a specific target environment",
            options: `--name EXAMPLE --bundledir /u/example/bundleDir --cicsplex TESTPLEX --scope SCOPE --resgroup BUNDGRP`
        }
    ]
};
