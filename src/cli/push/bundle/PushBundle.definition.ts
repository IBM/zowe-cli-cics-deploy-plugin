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
import { TargetdirOption } from "./options/Targetdir.option";
import { CicsplexOption } from "../../shared/Cicsplex.option";
import { ScopeOption } from "../../shared/Scope.option";
import { CsdgroupOption } from "../../shared/Csdgroup.option";
import { ResgroupOption } from "../../shared/Resgroup.option";
import { CicshlqOption } from "../../shared/Cicshlq.option";
import { CpsmhlqOption } from "../../shared/Cpsmhlq.option";
import { JobcardOption } from "../../shared/Jobcard.option";
import { TimeoutOption } from "../../shared/Timeout.option";
import { TargetStateOption } from "../../deploy/bundle/options/TargetState.option";
import { DescriptionOption } from "../../deploy/bundle/options/Description.option";
import { VerboseOption } from "../../shared/Verbose.option";
import { OverwriteOption } from "./options/Overwrite.option";
import { ZosmfOptions } from "../../shared/ZosmfOptions";
import { SshOptions } from "./options/SshOptions";
import { CmciOptions } from "./options/CmciOptions";

/**
 * Imperative command for the Bundle sub-option of Push.
 *
 */
export const PushBundleDefinition: ICommandDefinition = {
    name: "bundle",
    aliases: ["b", "bun", "bund"],
    summary: "Push a CICS bundle",
    description: "Push a CICS bundle from the working directory to a target CICSplex.",
    type: "command",
    handler: __dirname + "/PushBundle.handler",
    options: [ NameOption, TargetdirOption, CicsplexOption, ScopeOption, CsdgroupOption , ResgroupOption,
               CicshlqOption, CpsmhlqOption, DescriptionOption, JobcardOption, TimeoutOption, TargetStateOption,
               VerboseOption, OverwriteOption ]
               .concat(ZosmfOptions.CICS_DEPLOY_ZOSMF_CONNECTION_OPTIONS)
               .concat(SshOptions.CICS_DEPLOY_SSH_CONNECTION_OPTIONS)
               .concat(CmciOptions.CICS_DEPLOY_CMCI_CONNECTION_OPTIONS),
    profile: { optional: ["cics-deploy", "zosmf", "ssh", "cics"] },
    examples: [
        {
            description: "Push a CICS bundle from the working directory by using default cics-deploy, cics, ssh and zosmf profiles",
            options: `--name EXAMPLE --target-directory /u/example/bundles`
        },
        {
            description: "Push a CICS bundle from the working directory by using specific zosmf, ssh & cics-deploy profiles",
            options: `--name EXAMPLE --target-directory /u/example/bundles --zosmf-profile testplex --cics-deploy-profile devcics --ssh-profile ssh`
        },
        {
            description: "Push a CICS bundle from the working directory replacing any bundle of the same name that is already deployed",
            options: `--name EXAMPLE --target-directory /u/example/bundles --overwrite`
        }
    ]
};
