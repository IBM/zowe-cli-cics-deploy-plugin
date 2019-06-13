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

const DEFAULT_PARAMETERS: IHandlerParameters = {
    arguments: {
        $0: "bright",
        _: ["zowe-cli-cics-deploy-plugin", "undeploy", "bundle"],
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
        jest.restoreAllMocks();
    });
    it("should complain with no parameters", async () => {

        let err: Error;
        const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
        try {
          const handler = new UndeployBundleHandler.default();
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--name parameter is not set");
    });

    // Note we don't need to duplicate all the input validation tests from
    // Deploy as it's shared code. Just adding a few  to ensure that
    // code coverage is sufficient.

    it("should complain with no targetstate parameter UNDEPLOY", async () => {
        await testTargetStateUndeployError(undefined, "--targetstate parameter is not set");
    });
    it("should complain with invalid type for targetstate parameter UNDEPLOY", async () => {

        const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
        setCommonParmsForTargetStateTests(params);
        params.arguments.targetstate = 50;

        let err: Error;
        try {
          const handler = new UndeployBundleHandler.default();
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--targetstate parameter is not a string");
    });
    it("should complain with empty targetstate parameter UNDEPLOY", async () => {
        await testTargetStateUndeployError("", "--targetstate parameter is empty");
    });
    it("should complain with invalid targetstate parameter UNDEPLOY", async () => {
        await testTargetStateUndeployError("Wibble", "--targetstate has invalid value. Found WIBBLE but expected one of UNAVAILABLE, DISABLED or DISCARDED.");
    });
});

function setCommonParmsForTargetStateTests(parms: IHandlerParameters) {
  parms.arguments.name = "WIBBLE";
  parms.arguments["cics-deploy-profile"] = undefined;
  parms.arguments.cicsplex = "Wibble";
  parms.arguments.scope = "wibblE";
  parms.arguments.resgroup = "wiBBle";
  parms.arguments.csdgroup = undefined;
  parms.arguments.timeout = undefined;
  parms.arguments.cicshlq = "WIBB.LE";
  parms.arguments.cpsmhlq = "WIBB.LE";
  parms.arguments.targetstate = undefined;
  parms.arguments.jobcard = undefined;
}

async function testTargetStateUndeployError(targetstate: string, result: string) {
  const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
  setCommonParmsForTargetStateTests(params);
  params.arguments.targetstate = targetstate;

  let err: Error;
  try {
    const handler = new UndeployBundleHandler.default();
    await handler.process(params);
  } catch (e) {
    err = e;
  }
  expect(err).toBeDefined();
  expect(err).toBeInstanceOf(ImperativeError);
  expect(err.message).toContain(result);
}
