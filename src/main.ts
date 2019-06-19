#!/usr/bin/env node
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


import { Imperative } from "@brightside/imperative";
// init imperative & parse the CLI input.
Imperative.init().then(() => {
    Imperative.api.imperativeLogger.info("Imperative Initialized the cics-deploy CLI!");
    Imperative.parse();
    Imperative.api.imperativeLogger.info("Parsed the input command!");
}).catch((error) => {
    Imperative.console.error(`An error occured during imperative initalization:\n${error}`);
});
