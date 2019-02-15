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
describe("main success", () => {
    it("should log initialization messages", (done) => {
        let logMsgs: string = "";
        let callCount: number = 0;

        // "Mock" the api object - which is a readonly static within Imperative
        Object.defineProperty(Imperative, "api", {
            value: {
                imperativeLogger: {
                    info: jest.fn((msg) => {
                        logMsgs += " " + msg;
                        callCount++;
                        if (callCount === 2) {
                            expect(logMsgs).toMatchSnapshot();
                            done();
                        }
                    })
                }
            }
        });

        // Mock imperative init
        Imperative.init = jest.fn((args): Promise<void> => {
            return new Promise<void>((fulfill, reject) => {
                fulfill();
            });
        });

        // Mock imperative parse
        Imperative.parse = jest.fn(() => {
            // Do nothing
        });

        // Require should run the init/parse
        const main = require("../src/main");
    });
});
