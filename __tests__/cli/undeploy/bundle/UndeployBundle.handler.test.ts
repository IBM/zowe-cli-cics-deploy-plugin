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
import {IHandlerParameters, Imperative, ImperativeError} from "@brightside/imperative";
import * as UndeployBundleDefinition from "../../../../src/cli/undeploy/bundle/UndeployBundle.definition";
import * as UndeployBundleHandler from "../../../../src/cli/undeploy/bundle/UndeployBundle.handler";
import * as fs from "fs";

process.env.FORCE_COLOR = "0";

const DEFAULT_PARAMTERS: IHandlerParameters = {
    arguments: {
        $0: "bright",
        _: ["zowe-cli-cics-deploy-plugin", "undeploy", "bundle"],
    },
    profiles: {
        get: (type: string) => {
            return {};
        }
    } as any,
    response: {
        data: {
            setMessage: jest.fn((setMsgArgs) => {
                expect("" + setMsgArgs).toMatchSnapshot();
            }),
            setObj: jest.fn((setObjArgs) => {
                expect(setObjArgs).toMatchSnapshot();
            })
        },
        console: {
            log: jest.fn((logs) => {
                expect("" + logs).toMatchSnapshot();
            }),
            error: jest.fn((errors) => {
                expect("" + errors).toMatchSnapshot();
            }),
            errorHeader: jest.fn(() => undefined)
        },
        progress: {
            startBar: jest.fn((parms) => undefined),
            endBar: jest.fn(() => undefined)
        }
    } as any,
    definition: UndeployBundleDefinition.UndeployBundleDefinition,
    fullDefinition: UndeployBundleDefinition.UndeployBundleDefinition,
};

describe("bundle Handler", () => {
    afterEach(() => {
        jest.resetAllMocks();
    });
    it("should complain with no parameters", async () => {

        let error: Error;
        try {
          const handler = new UndeployBundleHandler.default();
          const params = Object.assign({}, ...[DEFAULT_PARAMTERS]);
          await handler.process(params);
        } catch (e) {
            error = e;
        }
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(ImperativeError);
    });
});
