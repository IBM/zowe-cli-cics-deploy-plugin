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

import {CheckStatus, ZosmfSession} from "@brightside/core";
import {IHandlerParameters, Imperative, ImperativeError} from "@zowe/imperative";
import * as GenerateBundleDefinition from "../../../../src/cli/generate/bundle/GenerateBundle.definition";
import * as GenerateBundleHandler from "../../../../src/cli/generate/bundle/GenerateBundle.handler";
import * as fs from "fs";

process.env.FORCE_COLOR = "0";

const DEFAULT_PARAMTERS: IHandlerParameters = {
    arguments: {
        $0: "bright",
        _: ["zowe-cli-cics-deploy-plugin", "generate", "bundle"],
        silent: true
    },
    profiles: {
        get: (type: string) => {
            return {};
        }
    } as any,
    response: {
        data: {
            setMessage: jest.fn((setMsgArgs) => {
                expect("" + setMsgArgs).toMatch("NO RESPONSE MESSAGE IS EXPECTED");
            }),
            setObj: jest.fn((setObjArgs) => {
                expect(setObjArgs).toMatch("NO RESPONSE OBJECT IS EXPECTED");
            })
        },
        console: {
            log: jest.fn((logs) => {
                expect("" + logs).toContain("CICS Bundle");
                expect("" + logs).toContain("generated");
            }),
            error: jest.fn((errors) => {
                expect("" + errors).toMatch("NO ERROR MESSAGE IS EXPECTED");
            }),
            errorHeader: jest.fn(() => undefined)
        },
        progress: {
            startBar: jest.fn((parms) => undefined),
            endBar: jest.fn(() => undefined)
        }
    } as any,
    definition: GenerateBundleDefinition.GenerateBundleDefinition,
    fullDefinition: GenerateBundleDefinition.GenerateBundleDefinition,
};

describe("bundle Handler", () => {
    afterEach(() => {
        jest.resetAllMocks();
    });
    it("should process the current directory", async () => {
        DEFAULT_PARAMTERS.arguments.nosave = "true";

        let error;
        try {
          const handler = new GenerateBundleHandler.default();
          // The handler should succeed
          const params = Object.assign({}, ...[DEFAULT_PARAMTERS]);
          await handler.process(params);
        } catch (e) {
            error = e;
            Imperative.console.error(`Error experienced: ${e.message}`);
        }
        expect(error).toBeUndefined();
    });
    it("should cope with an empty directory", async () => {
        DEFAULT_PARAMTERS.arguments.nosave = "true";

        const currentDir = process.cwd();
        if (!fs.existsSync("__tests__/__resources__/EmptyBundle01")) {
            fs.mkdirSync("__tests__/__resources__/EmptyBundle01");
        }
        process.chdir("__tests__/__resources__/EmptyBundle01");

        let error;
        try {
          const handler = new GenerateBundleHandler.default();
          // The handler should succeed
          const params = Object.assign({}, ...[DEFAULT_PARAMTERS]);
          await handler.process(params);
        } catch (e) {
            error = e;
            Imperative.console.error(`Error experienced: ${e.message}`);
        }
        process.chdir(currentDir);
        expect(error).toBeUndefined();
    });
    it("should process a directory with package.json", async () => {
        DEFAULT_PARAMTERS.arguments.nosave = "true";

        const currentDir = process.cwd();
        process.chdir("__tests__/__resources__/ExampleBundle04");

        let error;
        try {
          const handler = new GenerateBundleHandler.default();
          // The handler should succeed
          const params = Object.assign({}, ...[DEFAULT_PARAMTERS]);
          await handler.process(params);
        } catch (e) {
            error = e;
            Imperative.console.error(`Error experienced: ${e.message}`);
        }
        process.chdir(currentDir);
        expect(error).toBeUndefined();
    });
});
