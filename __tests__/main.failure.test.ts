/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
* Copyright Contributors to the Zowe Project.
*
*/

import { Imperative } from "@brightside/imperative";
// The main tests exist in seperate files because of module resolution in Jest,
// we want to require the main module a few times to perform different tests
describe("main failure", () => {
    it("should log an imperative init failure", (done) => {
        let logMsgs: string = "";

        // Mock imperative init
        Imperative.init = jest.fn((args): Promise<void> => {
            return new Promise<void>((fulfill, reject) => {
                reject("Imperative init failed!");
            });
        });

        // Mock the console error
        Imperative.console.error = jest.fn((msg) => {
            logMsgs += msg;
            expect(logMsgs).toMatchSnapshot();
            done();
        });

        // Require should run the init
        const main = require("../src/main");
    });
});
