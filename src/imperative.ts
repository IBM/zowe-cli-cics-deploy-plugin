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

const config: IImperativeConfig = {
    commandModuleGlobs: ["**/cli/*/*.definition!(.d).*s"],
    pluginHealthCheck: __dirname + "/healthCheck.handler",
    pluginSummary: "Generate and deploy IBM CICS bundle resources",
    pluginAliases: ["cdep"],
    rootCommandDescription: "CICS bundle deployment plugin.",
    productDisplayName: "Zowe cics-deploy plug-in",
    name: "cics-deploy"
};

export = config;
