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

import {IHandlerParameters, ImperativeError} from "@brightside/imperative";
import * as PushBundleDefinition from "../../../../src/cli/push/bundle/PushBundle.definition";
import * as PushBundleHandler from "../../../../src/cli/push/bundle/PushBundle.handler";

process.env.FORCE_COLOR = "0";

const DEFAULT_PARAMETERS: IHandlerParameters = {
    arguments: {
        $0: "bright",
        _: ["zowe-cli-cics-deploy-plugin", "push", "bundle"],
        silent: true
    },
    profiles: {
        get: (type: string) => {
            if (type === "cics-deploy") {
              return undefined;
            }
            if (type === "zosmf") {
              return undefined;
            }
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
    definition: PushBundleDefinition.PushBundleDefinition,
    fullDefinition: PushBundleDefinition.PushBundleDefinition,
};

describe("bundle Handler", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it("should complain with missing parameters", async () => {
        const params = getCommonParms();
        await testError(params, "--name parameter is not set");
    });
});

function getCommonParms(): IHandlerParameters {
  const parms = Object.assign({}, ...[DEFAULT_PARAMETERS]);
  parms.arguments.name = undefined;
  parms.arguments.targetdir = undefined;
  parms.arguments["cics-deploy-profile"] = undefined;
  parms.arguments.cicsplex = undefined;
  parms.arguments.scope = undefined;
  parms.arguments.resgroup = undefined;
  parms.arguments.csdgroup = undefined;
  parms.arguments.timeout = undefined;
  parms.arguments.cicshlq = undefined;
  parms.arguments.cpsmhlq = undefined;
  parms.arguments.targetstate = undefined;
  parms.arguments.jobcard = undefined;
  parms.arguments.verbose = undefined;

  return parms;
}

async function testError(parms: IHandlerParameters, result: string) {

  const currentDir = process.cwd();
  process.chdir("__tests__/__resources__/ExampleBundle01");

  let err: Error;
  try {
    const handler = new PushBundleHandler.default();
    await handler.process(parms);
  } catch (e) {
    err = e;
  }
  process.chdir(currentDir);
  expectImperativeErrorWithMessage(err, result);
}

function expectImperativeErrorWithMessage(err: any, message: string) {
  expect(err).toBeDefined();
  expect(err).toBeInstanceOf(ImperativeError);
  expect(err.message).toContain(message);
}
