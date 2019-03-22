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
import * as DeployBundleDefinition from "../../../../src/cli/deploy/bundle/DeployBundle.definition";
import * as DeployBundleHandler from "../../../../src/cli/deploy/bundle/DeployBundle.handler";
import * as fs from "fs";

process.env.FORCE_COLOR = "0";

const DEFAULT_PARAMETERS: IHandlerParameters = {
    arguments: {
        $0: "bright",
        _: ["zowe-cli-cics-deploy-plugin", "deploy", "bundle"],
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
    definition: DeployBundleDefinition.DeployBundleDefinition,
    fullDefinition: DeployBundleDefinition.DeployBundleDefinition,
};

describe("bundle Handler", () => {
    afterEach(() => {
        jest.resetAllMocks();
    });
    it("should complain with no name parameter", async () => {
        await testNameError(undefined, "--name parameter is not set");
    });
    it("should complain with invalid type for name parameter", async () => {

        const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
        setCommonParmsForNameTests(params);
        params.arguments.name = 50;

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--name parameter is not a string");
    });
    it("should complain with overlong name parameter", async () => {
        await testNameError("123456789", "--name parameter is too long");
    });
    it("should complain with empty name parameter", async () => {
        await testNameError("", "--name parameter is empty");
    });
    it("should complain with no bundledir parameter", async () => {
        await testBundledirError(undefined, "--bundledir parameter is not set");
    });
    it("should complain with invalid type for bundledir parameter", async () => {

        const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
        setCommonParmsForBundledirTests(params);
        params.arguments.bundledir = 50;

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--bundledir parameter is not a string");
    });
    it("should complain with overlong bundledir parameter", async () => {
        const dir = "12345678901234567890123456789012345678901234567890" +
                    "12345678901234567890123456789012345678901234567890" +
                    "12345678901234567890123456789012345678901234567890" +
                    "12345678901234567890123456789012345678901234567890" +
                    "12345678901234567890123456789012345678901234567890123456";
        await testBundledirError(dir, "--bundledir parameter is too long");
    });
    it("should complain with empty bundledir parameter", async () => {
        await testBundledirError("", "--bundledir parameter is empty");
    });
    it("should complain if profile, cicsplex and scope not set", async () => {
        await testBundledirError("wibble", "either --cics-deploy-profile or both --cicsplex and --scope must be set");
    });
    it("should complain if profile not found", async () => {
        await testProfileError("wibble", "cics-deploy-profile \"wibble\" not found");
    });
    it("should complain if profile is not a string", async () => {

        const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
        setCommonParmsForProfileTests(params);
        params.arguments["cics-deploy-profile"] = 0;

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--cics-deploy-profile parameter is not a string");
    });
    it("should complain if profile is empty", async () => {
        await testProfileError("", "--cics-deploy-profile parameter is empty");
    });
    it("should complain with invalid type for cicsplex parameter", async () => {

        const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
        setCommonParmsForCicsplexTests(params);
        params.arguments.cicsplex = 1;

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--cicsplex parameter is not a string");
    });
    it("should complain with overlong cicsplex parameter", async () => {
        await testCicsplexError("123456789", "--cicsplex parameter is too long");
    });
    it("should complain with empty cicsplex parameter", async () => {
        await testCicsplexError("", "--cicsplex parameter is empty");
    });
    it("should complain with invalid type for scope parameter", async () => {

        const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
        setCommonParmsForScopeTests(params);
        params.arguments.scope = 1;

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--scope parameter is not a string");
    });
    it("should complain with overlong scope parameter", async () => {
        await testScopeError("123456789", "--scope parameter is too long");
    });
    it("should complain with empty scope parameter", async () => {
        await testScopeError("", "--scope parameter is empty");
    });
    it("should complain with missing csdgroup/resgroup", async () => {
        await testCsdgroupError(undefined, "--scope parameter requires either --csdgroup or --resgroup to be set");
    });
    it("should complain with invalid type for csdgroup parameter", async () => {

        const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
        setCommonParmsForCsdgroupTests(params);
        params.arguments.csdgroup = -4;

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--csdgroup parameter is not a string");
    });
    it("should complain with overlong csdgroup parameter", async () => {
        await testCsdgroupError("123456789", "--csdgroup parameter is too long");
    });
    it("should complain with empty csdgroup parameter", async () => {
        await testCsdgroupError("", "--csdgroup parameter is empty");
    });
    it("should complain with both csdgroup and resgroup set", async () => {

        const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
        setCommonParmsForCsdgroupTests(params);
        params.arguments.csdgroup = "a";
        params.arguments.resgroup = "b";

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--csdgroup and --resgroup cannot both be set");
    });
    it("should complain with invalid type for resgroup parameter", async () => {

        const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
        setCommonParmsForResgroupTests(params);
        params.arguments.resgroup = -4;

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--resgroup parameter is not a string");
    });
    it("should complain with overlong resgroup parameter", async () => {
        await testResgroupError("123456789", "--resgroup parameter is too long");
    });
    it("should complain with empty resgroup parameter", async () => {
        await testResgroupError("", "--resgroup parameter is empty");
    });
    it("should complain with non-numeric timeout", async () => {

        const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
        setCommonParmsForTimeoutTests(params);
        params.arguments.timeout = "WiBbLe";

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--timeout parameter is not an integer");
    });
    it("should complain with non-integer timeout", async () => {
        await testTimeoutError(1.1, "--timeout parameter is not an integer");
    });
    it("should complain with too large timeout", async () => {
        await testTimeoutError(1801, "--timeout parameter is too large");
    });
    it("should complain with too small timeout", async () => {
        await testTimeoutError(0, "--timeout parameter is too small");
    });
    it("should complain with no cicshlq parameter", async () => {
        await testCicsHLQError(undefined, "--cicshlq parameter is not set");
    });
    it("should complain with invalid type for cicshlq parameter", async () => {

        const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
        setCommonParmsForCicsHLQTests(params);
        params.arguments.cicshlq = 7;

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--cicshlq parameter is not a string");
    });
    it("should complain with overlong cicshlq parameter", async () => {
        await testCicsHLQError("123456789012345678901234567890123456", "--cicshlq parameter is too long");
    });
    it("should complain with empty cicshlq parameter", async () => {
        await testCicsHLQError("", "--cicshlq parameter is empty");
    });
    it("should complain with no cpsmhlq parameter", async () => {
        await testCpsmHLQError(undefined, "--cpsmhlq parameter is not set");
    });
    it("should complain with invalid type for cpsmhlq parameter", async () => {

        const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
        setCommonParmsForCpsmHLQTests(params);
        params.arguments.cpsmhlq = 7;

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--cpsmhlq parameter is not a string");
    });
    it("should complain with overlong cpsmhlq parameter", async () => {
        await testCpsmHLQError("123456789012345678901234567890123456", "--cpsmhlq parameter is too long");
    });
    it("should complain with empty cpsmhlq parameter", async () => {
        await testCpsmHLQError("", "--cpsmhlq parameter is empty");
    });
    it("should complain with no jobcard parameter", async () => {
        await testJobcardError(undefined, "--jobcard parameter is not set");
    });
    it("should complain with invalid type for jobcard parameter", async () => {

        const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
        setCommonParmsForJobcardTests(params);
        params.arguments.jobcard = 5.1;

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--jobcard parameter is not a string");
    });
    it("should complain with empty jobcard parameter", async () => {
        await testJobcardError("", "--jobcard parameter is empty");
    });
    it("should complain if jobcard doesn't start //", async () => {
        await testJobcardError("wibble", "--jobcard parameter does not start with //");
    });
    it("should complain if jobname too long", async () => {
        await testJobcardError("//123456789", "--jobcard parameter does not start with a suitable jobname: '//123456789 '");
    });
    it("should complain if jobname too short", async () => {
        await testJobcardError("//", "--jobcard parameter does not start with a suitable jobname: '// '");
    });
    it("should complain if jobcard omits JOB ", async () => {
        await testJobcardError("//wibble boj", "--jobcard parameter does not have JOB keyword after the jobname. Expected 'JOB' but found 'boj'");
    });
    it("should complain if jobcard omits JOB 2", async () => {
        await testJobcardError("//wibble", "--jobcard parameter does not have JOB keyword after the jobname.");
    });
    it("should complain with no targetstate parameter", async () => {
        await testTargetStateDeployError(undefined, "--targetstate parameter is not set");
    });
    it("should complain with invalid type for targetstate parameter", async () => {

        const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
        setCommonParmsForTargetStateTests(params);
        params.arguments.targetstate = 50;

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--targetstate parameter is not a string");
    });
    it("should complain with empty targetstate parameter", async () => {
        await testTargetStateDeployError("", "--targetstate parameter is empty");
    });
    it("should complain with invalid targetstate parameter", async () => {
        await testTargetStateDeployError("Wibble", "--targetstate has invalid value. Found WIBBLE but expected one of DISABLED, ENABLED or AVAILABLE.");
    });
    it("should complain if zosmf profile not found", async () => {

        const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
        setCommonParmsForJobcardTests(params);
        params.arguments.jobcard = "//DFHDPLOY JOB DFHDPLOY,CLASS=A,MSGCLASS=X,TIME=NOLIMIT";
        params.arguments.targetstate = "AVAILABLE";

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("No zosmf profile found");
    });
});

function setCommonParmsForNameTests(parms: IHandlerParameters) {
  parms.arguments.name = undefined;
  parms.arguments.bundledir = undefined;
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
}

async function testNameError(name: string, result: string) {
  const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
  setCommonParmsForNameTests(params);
  params.arguments.name = name;

  let err: Error;
  try {
    const handler = new DeployBundleHandler.default();
    await handler.process(params);
  } catch (e) {
    err = e;
  }
  expect(err).toBeDefined();
  expect(err).toBeInstanceOf(ImperativeError);
  expect(err.message).toContain(result);
}

function setCommonParmsForBundledirTests(parms: IHandlerParameters) {
  parms.arguments.name = "WIBBLE";
  parms.arguments.bundledir = undefined;
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
}

async function testBundledirError(bundledir: string, result: string) {
  const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
  setCommonParmsForBundledirTests(params);
  params.arguments.bundledir = bundledir;

  let err: Error;
  try {
    const handler = new DeployBundleHandler.default();
    await handler.process(params);
  } catch (e) {
    err = e;
  }
  expect(err).toBeDefined();
  expect(err).toBeInstanceOf(ImperativeError);
  expect(err.message).toContain(result);
}

function setCommonParmsForProfileTests(parms: IHandlerParameters) {
  parms.arguments.name = "WIBBLE";
  parms.arguments.bundledir = "wibble";
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
}

async function testProfileError(profile: string, result: string) {
  const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
  setCommonParmsForProfileTests(params);
  params.arguments["cics-deploy-profile"] = profile;

  let err: Error;
  try {
    const handler = new DeployBundleHandler.default();
    await handler.process(params);
  } catch (e) {
    err = e;
  }
  expect(err).toBeDefined();
  expect(err).toBeInstanceOf(ImperativeError);
  expect(err.message).toContain(result);
}

function setCommonParmsForCicsplexTests(parms: IHandlerParameters) {
  parms.arguments.name = "WIBBLE";
  parms.arguments.bundledir = "wibble";
  parms.arguments["cics-deploy-profile"] = undefined;
  parms.arguments.cicsplex = undefined;
  parms.arguments.scope = "wibblE";
  parms.arguments.resgroup = undefined;
  parms.arguments.csdgroup = undefined;
  parms.arguments.timeout = undefined;
  parms.arguments.cicshlq = undefined;
  parms.arguments.cpsmhlq = undefined;
  parms.arguments.targetstate = undefined;
  parms.arguments.jobcard = undefined;
}

async function testCicsplexError(cicsplex: string, result: string) {
  const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
  setCommonParmsForCicsplexTests(params);
  params.arguments.cicsplex = cicsplex;

  let err: Error;
  try {
    const handler = new DeployBundleHandler.default();
    await handler.process(params);
  } catch (e) {
    err = e;
  }
  expect(err).toBeDefined();
  expect(err).toBeInstanceOf(ImperativeError);
  expect(err.message).toContain(result);
}

function setCommonParmsForScopeTests(parms: IHandlerParameters) {
  parms.arguments.name = "WIBBLE";
  parms.arguments.bundledir = "wibble";
  parms.arguments["cics-deploy-profile"] = undefined;
  parms.arguments.cicsplex = "Wibble";
  parms.arguments.scope = undefined;
  parms.arguments.resgroup = undefined;
  parms.arguments.csdgroup = undefined;
  parms.arguments.timeout = undefined;
  parms.arguments.cicshlq = undefined;
  parms.arguments.cpsmhlq = undefined;
  parms.arguments.targetstate = undefined;
  parms.arguments.jobcard = undefined;
}

async function testScopeError(scope: string, result: string) {
  const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
  setCommonParmsForScopeTests(params);
  params.arguments.scope = scope;

  let err: Error;
  try {
    const handler = new DeployBundleHandler.default();
    await handler.process(params);
  } catch (e) {
    err = e;
  }
  expect(err).toBeDefined();
  expect(err).toBeInstanceOf(ImperativeError);
  expect(err.message).toContain(result);
}

function setCommonParmsForCsdgroupTests(parms: IHandlerParameters) {
  parms.arguments.name = "WIBBLE";
  parms.arguments.bundledir = "wibble";
  parms.arguments["cics-deploy-profile"] = undefined;
  parms.arguments.cicsplex = "Wibble";
  parms.arguments.scope = "wibblE";
  parms.arguments.resgroup = undefined;
  parms.arguments.csdgroup = undefined;
  parms.arguments.timeout = undefined;
  parms.arguments.cicshlq = undefined;
  parms.arguments.cpsmhlq = undefined;
  parms.arguments.targetstate = undefined;
  parms.arguments.jobcard = undefined;
}

async function testCsdgroupError(csdgroup: string, result: string) {
  const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
  setCommonParmsForResgroupTests(params);
  params.arguments.csdgroup = csdgroup;

  let err: Error;
  try {
    const handler = new DeployBundleHandler.default();
    await handler.process(params);
  } catch (e) {
    err = e;
  }
  expect(err).toBeDefined();
  expect(err).toBeInstanceOf(ImperativeError);
  expect(err.message).toContain(result);
}

function setCommonParmsForResgroupTests(parms: IHandlerParameters) {
  parms.arguments.name = "WIBBLE";
  parms.arguments.bundledir = "wibble";
  parms.arguments["cics-deploy-profile"] = undefined;
  parms.arguments.cicsplex = "Wibble";
  parms.arguments.scope = "wibblE";
  parms.arguments.resgroup = undefined;
  parms.arguments.csdgroup = undefined;
  parms.arguments.timeout = undefined;
  parms.arguments.cicshlq = undefined;
  parms.arguments.cpsmhlq = undefined;
  parms.arguments.targetstate = undefined;
  parms.arguments.jobcard = undefined;
}

async function testResgroupError(resgroup: string, result: string) {
  const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
  setCommonParmsForResgroupTests(params);
  params.arguments.resgroup = resgroup;

  let err: Error;
  try {
    const handler = new DeployBundleHandler.default();
    await handler.process(params);
  } catch (e) {
    err = e;
  }
  expect(err).toBeDefined();
  expect(err).toBeInstanceOf(ImperativeError);
  expect(err.message).toContain(result);
}

function setCommonParmsForTimeoutTests(parms: IHandlerParameters) {
  parms.arguments.name = "WIBBLE";
  parms.arguments.bundledir = "wibble";
  parms.arguments["cics-deploy-profile"] = undefined;
  parms.arguments.cicsplex = "Wibble";
  parms.arguments.scope = "wibblE";
  parms.arguments.resgroup = "wiBBle";
  parms.arguments.csdgroup = undefined;
  parms.arguments.timeout = undefined;
  parms.arguments.cicshlq = undefined;
  parms.arguments.cpsmhlq = undefined;
  parms.arguments.targetstate = undefined;
  parms.arguments.jobcard = undefined;
}

async function testTimeoutError(timeout: number, result: string) {
  const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
  setCommonParmsForTimeoutTests(params);
  params.arguments.timeout = timeout;

  let err: Error;
  try {
    const handler = new DeployBundleHandler.default();
    await handler.process(params);
  } catch (e) {
    err = e;
  }
  expect(err).toBeDefined();
  expect(err).toBeInstanceOf(ImperativeError);
  expect(err.message).toContain(result);
}

function setCommonParmsForCicsHLQTests(parms: IHandlerParameters) {
  parms.arguments.name = "WIBBLE";
  parms.arguments.bundledir = "wibble";
  parms.arguments["cics-deploy-profile"] = undefined;
  parms.arguments.cicsplex = "Wibble";
  parms.arguments.scope = "wibblE";
  parms.arguments.resgroup = "wiBBle";
  parms.arguments.csdgroup = undefined;
  parms.arguments.timeout = undefined;
  parms.arguments.cicshlq = undefined;
  parms.arguments.cpsmhlq = undefined;
  parms.arguments.targetstate = undefined;
  parms.arguments.jobcard = undefined;
}

async function testCicsHLQError(cicshlq: string, result: string) {
  const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
  setCommonParmsForCicsHLQTests(params);
  params.arguments.cicshlq = cicshlq;

  let err: Error;
  try {
    const handler = new DeployBundleHandler.default();
    await handler.process(params);
  } catch (e) {
    err = e;
  }
  expect(err).toBeDefined();
  expect(err).toBeInstanceOf(ImperativeError);
  expect(err.message).toContain(result);
}

function setCommonParmsForCpsmHLQTests(parms: IHandlerParameters) {
  parms.arguments.name = "WIBBLE";
  parms.arguments.bundledir = "wibble";
  parms.arguments["cics-deploy-profile"] = undefined;
  parms.arguments.cicsplex = "Wibble";
  parms.arguments.scope = "wibblE";
  parms.arguments.resgroup = "wiBBle";
  parms.arguments.csdgroup = undefined;
  parms.arguments.timeout = undefined;
  parms.arguments.cicshlq = "WIBB.LE";
  parms.arguments.cpsmhlq = undefined;
  parms.arguments.targetstate = undefined;
  parms.arguments.jobcard = undefined;
}

async function testCpsmHLQError(cpsmhlq: string, result: string) {
  const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
  setCommonParmsForCpsmHLQTests(params);
  params.arguments.cpsmhlq = cpsmhlq;

  let err: Error;
  try {
    const handler = new DeployBundleHandler.default();
    await handler.process(params);
  } catch (e) {
    err = e;
  }
  expect(err).toBeDefined();
  expect(err).toBeInstanceOf(ImperativeError);
  expect(err.message).toContain(result);
}

function setCommonParmsForJobcardTests(parms: IHandlerParameters) {
  setCommonParmsForCpsmHLQTests(parms);
  parms.arguments.cpsmhlq = "WI.BBLE";
  parms.arguments.targetstate = "ENABLED";
}

async function testJobcardError(jobcard: string, result: string) {
  const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
  setCommonParmsForJobcardTests(params);
  params.arguments.jobcard = jobcard;

  let err: Error;
  try {
    const handler = new DeployBundleHandler.default();
    await handler.process(params);
  } catch (e) {
    err = e;
  }
  expect(err).toBeDefined();
  expect(err).toBeInstanceOf(ImperativeError);
  expect(err.message).toContain(result);
}

function setCommonParmsForTargetStateTests(parms: IHandlerParameters) {
  parms.arguments.name = "WIBBLE";
  parms.arguments.bundledir = "wibble";
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

async function testTargetStateDeployError(targetstate: string, result: string) {
  const params = Object.assign({}, ...[DEFAULT_PARAMETERS]);
  setCommonParmsForTargetStateTests(params);
  params.arguments.targetstate = targetstate;

  let err: Error;
  try {
    const handler = new DeployBundleHandler.default();
    await handler.process(params);
  } catch (e) {
    err = e;
  }
  expect(err).toBeDefined();
  expect(err).toBeInstanceOf(ImperativeError);
  expect(err.message).toContain(result);
}
