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

import { BundleDeployer } from "../../../src/api/BundleDeploy/BundleDeployer";
import { IHandlerParameters, TaskStage } from "@zowe/imperative";
import * as DeployBundleDefinition from "../../../src/cli/deploy/bundle/DeployBundle.definition";
import { ZosmfSession, SubmitJobs, List } from "@zowe/cli";


const DEFAULT_PARAMTERS: IHandlerParameters = {
    arguments: {
        $0: "bright",
        _: ["zowe-cli-cics-deploy-plugin", "deploy", "bundle"],
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
    definition: DeployBundleDefinition.DeployBundleDefinition,
    fullDefinition: DeployBundleDefinition.DeployBundleDefinition,
};


let createSpy = jest.spyOn(ZosmfSession, "createBasicZosmfSession").mockImplementation(() => ({}));
let listSpy = jest.spyOn(List, "allMembers").mockImplementation(() => ({}));
let submitSpy = jest.spyOn(SubmitJobs, "submitJclString").mockImplementation(() => ({}));


describe("BundleDeployer01", () => {

    beforeEach(() => {
        createSpy = jest.spyOn(ZosmfSession, "createBasicZosmfSession").mockImplementation(() => ({}));
        listSpy = jest.spyOn(List, "allMembers").mockImplementation(() => ( { val: "DFHDPLOY EYU9ABSI" }));
        submitSpy = jest.spyOn(SubmitJobs, "submitJclString").mockImplementation(() => ({}));
    });
    afterEach(() => {
        jest.restoreAllMocks();
        (DEFAULT_PARAMTERS.response.progress.startBar as jest.Mock).mockReset();
        (DEFAULT_PARAMTERS.response.progress.endBar as jest.Mock).mockReset();

    });
    it("should complain with missing zOSMF profile for deploy", async () => {
        createSpy.mockImplementationOnce(() => { throw new Error( "Injected Create error" ); });
        await runDeployTestWithError();

        expect(createSpy).toHaveBeenCalledTimes(1);
    });
    it("should complain with missing zOSMF profile for undeploy", async () => {
        createSpy.mockImplementationOnce(() => { throw new Error( "Injected Create error" ); });
        await runUndeployTestWithError();

        expect(createSpy).toHaveBeenCalledTimes(1);
    });
    it("should complain if cicshlq not found", async () => {
        listSpy.mockImplementationOnce(() => { throw new Error( "Injected CICSHLQ error" ); });
        await runDeployTestWithError();

        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
    });
    it("should complain if cicshlq not found2", async () => {
        listSpy.mockImplementationOnce(() => ( { val1: "wibble"}));
        await runDeployTestWithError();

        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
    });
    it("should complain if cpsmhlq not found", async () => {
        listSpy = jest.spyOn(List, "allMembers").mockImplementationOnce(() => ( { val1: "DFHDPLOY"}))
                                                .mockImplementationOnce(() => { throw new Error( "Injected CPSMHLQ error" ); });
        await runDeployTestWithError();

        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(2);
    });
    it("should complain if cpsmhlq not found2", async () => {
        listSpy = jest.spyOn(List, "allMembers").mockImplementationOnce(() => ( { val: "DFHDPLOY" }))
                                                .mockImplementationOnce(() => ( { val: "wibble" }));
        await runDeployTestWithError();

        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(2);
    });
    it("should handle failure during submitjobs processing", async () => {
        submitSpy = jest.spyOn(SubmitJobs, "submitJclString").mockImplementationOnce(() => { throw new Error( "Injected Submit error" ); });
        await runDeployTestWithError();

        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(2);
        expect(submitSpy).toHaveBeenCalledTimes(1);
    });
    it("should update the progress bar", async () => {
        submitSpy = jest.spyOn(SubmitJobs, "submitJclString").mockImplementationOnce((session: any, jcl: string, parms: any) => {
                parms.task.statusMessage = "Waiting for JOB12345 to enter OUTPUT";
                parms.task.stageName = TaskStage.IN_PROGRESS;
                const expectedMsg = "Running DFHDPLOY (DEPLOY), jobid JOB12345";
                // wait 1.5 seconds
                return new Promise((resolve, reject) => {
                  setTimeout(() => {
                    // Now check that the status message has been updated by the progress bar processing
                    if (parms.task.statusMessage !== expectedMsg) {
                      throw new Error("Failed to find the expected message. Got: '" + parms.task.statusMessage + "' expected '" +
                      expectedMsg + "'");
                    }
                    resolve();
                  }, 1500);
                });
              });
        await runDeployTestWithError();

        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(2);
        expect(submitSpy).toHaveBeenCalledTimes(1);
    });
    it("should include the JOBID in an error", async () => {
        submitSpy = jest.spyOn(SubmitJobs, "submitJclString").mockImplementationOnce((session: any, jcl: string, parms: any) => {
                parms.task.statusMessage = "Waiting for JOB12345 to enter OUTPUT";
                parms.task.stageName = TaskStage.IN_PROGRESS;
                // wait 1.5 seconds
                return new Promise((resolve, reject) => {
                  setTimeout(() => {
                    reject(new Error("Injected submit error"));
                  }, 1500);
                });
              });
        await runDeployTestWithError();

        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(2);
        expect(submitSpy).toHaveBeenCalledTimes(1);
    });
    it("should complain if SYSTSPRT not found", async () => {
        submitSpy.mockImplementationOnce(() => [{}] );
        await runDeployTestWithError();

        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(2);
        expect(submitSpy).toHaveBeenCalledTimes(1);
    });
    it("should failover to JESMSGLG if SYSTSPRT not found", async () => {
        submitSpy.mockImplementationOnce(() => [{ddName: "JESMSGLG", stepName: "DFHDPLOY"}] );
        await runDeployTestWithError();

        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(2);
        expect(submitSpy).toHaveBeenCalledTimes(1);
    });
    it("should tolerate empty output from DFHDPLOY", async () => {
        submitSpy.mockImplementationOnce(() => [{ddName: "SYSTSPRT", stepName: "DFHDPLOY"}] );
        await runDeployTestWithError();

        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(2);
        expect(submitSpy).toHaveBeenCalledTimes(1);
    });
    it("should complain if status can't be determined", async () => {
        submitSpy.mockImplementationOnce(() => [{ddName: "SYSTSPRT", stepName: "DFHDPLOY", data: " "}] );
        await runDeployTestWithError();

        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(2);
        expect(submitSpy).toHaveBeenCalledTimes(1);
    });
    it("should complain if DFHDPLOY ends with an error", async () => {
        submitSpy.mockImplementationOnce(() => [{ddName: "SYSTSPRT", stepName: "DFHDPLOY", data: "DFHRL2055I"}] );
        await runDeployTestWithError();

        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(2);
        expect(submitSpy).toHaveBeenCalledTimes(1);
    });
    it("should complete with warnings ", async () => {
        submitSpy.mockImplementationOnce(() => [{ddName: "SYSTSPRT", stepName: "DFHDPLOY", data: "DFHRL2043I"}] );

        await runDeployTest();

        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(2);
        expect(submitSpy).toHaveBeenCalledTimes(1);
    });
    it("should deploy successfully", async () => {
        submitSpy.mockImplementationOnce(() => [{ddName: "SYSTSPRT", stepName: "DFHDPLOY", data: "DFHRL2012I"}] );

        await runDeployTest();

        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(2);
        expect(submitSpy).toHaveBeenCalledTimes(1);
    });
    it("should undeploy successfully", async () => {
        submitSpy.mockImplementationOnce(() => [{ddName: "SYSTSPRT", stepName: "DFHDPLOY", data: "DFHRL2037I"}] );

        await runUndeployTest();

        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(2);
        expect(submitSpy).toHaveBeenCalledTimes(1);
    });
    it("should generate deploy JCL with neither csdgroup nor resgroup", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        await testDeployJCL(parms);
    });
    it("should generate deploy JCL for csdgroup", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.csdgroup = "12345678";
        await testDeployJCL(parms);
    });
    it("should generate deploy JCL for csdgroup with timeout", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.csdgroup = "12345678";
        parms.arguments.timeout = 1500;
        await testDeployJCL(parms);
    });
    it("should generate deploy JCL for resgroup", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.resgroup = "12345678";
        await testDeployJCL(parms);
    });
    it("should generate deploy JCL for resgroup with timeout", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.resgroup = "12345678";
        parms.arguments.timeout = 1500;
        await testDeployJCL(parms);
    });
    it("should support multi-line jobcard", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.resgroup = "12345678";
        parms.arguments.jobcard = "//DFHDPLOY JOB DFHDPLOY,CLASS=A,\n" +
                                  "//         MSGCLASS=X,TIME=NOLIMIT";
        await testDeployJCL(parms);
    });
    it("should support multi-line jobcard with embedded new lines", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.resgroup = "12345678";
        parms.arguments.jobcard = "//DFHDPLOY JOB DFHDPLOY,CLASS=A,\\n//         MSGCLASS=X,TIME=NOLIMIT";
        await testDeployJCL(parms);
    });
    it("should support long line jobcard", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.resgroup = "12345678";
        parms.arguments.jobcard = "//DFHDPLOY JOB DFHDPLOY,CLASS=A,MSGCLASS=X,TIME=NOLIMIT,NOEL=ABCDEFGHIJKMNOPQRSTUVWXYZ";
        await testDeployJCL(parms);
    });
    it("should support really long line jobcard", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.resgroup = "12345678";
        parms.arguments.jobcard = "//DFHDPLOY JOB DFHDPLOY,CLASS=A,MSGCLASS=X,TIME=NOLIMIT,NOEL=ABCDEFGHIJKMNOPQRSTUVWXYZ," +
                                  "72CHARS=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz," +
                                  "ALPHABETIC=ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        await testDeployJCL(parms);
    });
    it("should fail with overlong jobcard", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.resgroup = "12345678";
        parms.arguments.jobcard = "//DFHDPLOY JOB DFHDPLOY,CLASS=A,MSGCLASS=X,TIME=NOLIMIT,NOEL=ABCDEFGHIJKMNOPQRSTUVWXYZ," +
                                  "ALPHABETIC=ABCDEFGHIJKLMNOPQRSTUVWXYZ," +
                                  "73CHARS=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1";
        let err: Error;
        try {
          await testDeployJCL(parms);
        } catch (e) {
          err = e;
        }
        expect(err).toBeDefined();
        expect(err.message).toMatchSnapshot();
    });
    it("should support long bundledir", async () => {
        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.resgroup = "12345678";
        parms.arguments.bundledir = "12345678901234567890123456789012345678901234567890" +
                                    "12345678901234567890123456789012345678901234567890" +
                                    "12345678901234567890123456789012345678901234567890" +
                                    "12345678901234567890123456789012345678901234567890" +
                                    "1234567890123456789012345678901234567890123456789012345";
        await testDeployJCL(parms);
    });
    it("should tolerate bundledir with extra slasshes", async () => {
        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.bundledir = "//bundledir/with/extra//slashes";
        await testDeployJCL(parms);
    });
    it("should generate deploy JCL for AVAILABLE", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.targetstate = "AVAILABLE";
        parms.arguments.resgroup = "12345678";
        await testDeployJCL(parms);
    });
    it("should generate deploy JCL for ENABLED", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.targetstate = "ENABLED";
        parms.arguments.resgroup = "12345678";
        await testDeployJCL(parms);
    });
    it("should generate deploy JCL for DISABLED", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.targetstate = "DISABLED";
        parms.arguments.resgroup = "12345678";
        await testDeployJCL(parms);
    });
    it("should generate deploy JCL for mixed case", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.targetstate = "disabled";
        parms.arguments.resgroup = "12345678";
        await testDeployJCL(parms);
    });
    it("should support verbose=true output for deploy", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.targetstate = "disabled";
        parms.arguments.resgroup = "12345678";
        parms.arguments.verbose = true;
        await testDeployJCL(parms);
    });
    it("should support verbose=false output for deploy", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.targetstate = "disabled";
        parms.arguments.resgroup = "12345678";
        parms.arguments.verbose = false;
        await testDeployJCL(parms);
    });
    it("should support long description", async () => {
        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.description = "1234567890123456789012345678901234567890123456789012345678";
        await testDeployJCL(parms);
    });

    // ** UNDEPLOY TESTS **
    it("should generate undeploy JCL with neither csdgroup nor resgroup", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForUndeployTests(parms);
        await testUndeployJCL(parms);
    });
    it("should generate undeploy JCL for csdgroup", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForUndeployTests(parms);
        parms.arguments.csdgroup = "12345678";
        await testUndeployJCL(parms);
    });
    it("should generate undeploy JCL for csdgroup with timeout", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForUndeployTests(parms);
        parms.arguments.csdgroup = "12345678";
        parms.arguments.timeout = 1500;
        await testUndeployJCL(parms);
    });
    it("should generate undeploy JCL for resgroup", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForUndeployTests(parms);
        parms.arguments.resgroup = "12345678";
        await testUndeployJCL(parms);
    });
    it("should generate undeploy JCL for resgroup with timeout", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForUndeployTests(parms);
        parms.arguments.resgroup = "12345678";
        parms.arguments.timeout = 1500;
        await testUndeployJCL(parms);
    });
    it("should generate undeploy JCL for UNAVAILABLE", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForUndeployTests(parms);
        parms.arguments.targetstate = "UNAVAILABLE";
        parms.arguments.resgroup = "12345678";
        await testUndeployJCL(parms);
    });
    it("should generate undeploy JCL for DISABLED", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForUndeployTests(parms);
        parms.arguments.targetstate = "DISABLED";
        parms.arguments.resgroup = "12345678";
        await testUndeployJCL(parms);
    });
    it("should generate undeploy JCL for DISCARDED", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForUndeployTests(parms);
        parms.arguments.targetstate = "DISCARDED";
        parms.arguments.resgroup = "12345678";
        await testUndeployJCL(parms);
    });
    it("should generate undeploy JCL for mixed case", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForUndeployTests(parms);
        parms.arguments.targetstate = "discarded";
        parms.arguments.resgroup = "12345678";
        await testUndeployJCL(parms);
    });
    it("should support verbose=true output for undeploy", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForUndeployTests(parms);
        parms.arguments.targetstate = "disabled";
        parms.arguments.resgroup = "12345678";
        parms.arguments.verbose = true;
        await testUndeployJCL(parms);
    });
    it("should support verbose=false output for undeploy", async () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForUndeployTests(parms);
        parms.arguments.targetstate = "disabled";
        parms.arguments.resgroup = "12345678";
        parms.arguments.verbose = false;
        await testUndeployJCL(parms);
    });

    it("should use task passed as parameter on deploy", async () => {
        submitSpy.mockImplementationOnce(() => [{ddName: "SYSTSPRT", stepName: "DFHDPLOY", data: "DFHRL2012I"}] );

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.csdgroup = "12345678";

        const bd = new BundleDeployer(parms);
        const task = { percentComplete: 0, stageName: TaskStage.NOT_STARTED, statusMessage: ""};
        const response = await bd.deployBundle(undefined, task);
        expect(task.stageName).toEqual(TaskStage.COMPLETE);
        expect(task.statusMessage).toEqual("Completed DFHDPLOY");
        expect(parms.response.progress.startBar).toHaveBeenCalledTimes(0);
        expect(parms.response.progress.endBar).toHaveBeenCalledTimes(0);

    });
});

async function runDeployTestWithError() {
  let parms: IHandlerParameters;
  parms = DEFAULT_PARAMTERS;
  setCommonParmsForDeployTests(parms);
  parms.arguments.csdgroup = "12345678";

  const bd = new BundleDeployer(parms);

  let err: Error;
  try {
    const response = await bd.deployBundle();
  } catch (e) {
    err = e;
  }
  expect(err).toBeDefined();
  expect(err.message).toMatchSnapshot();
}

async function runUndeployTestWithError() {
  let parms: IHandlerParameters;
  parms = DEFAULT_PARAMTERS;
  setCommonParmsForUndeployTests(parms);
  parms.arguments.csdgroup = "12345678";

  const bd = new BundleDeployer(parms);

  let err: Error;
  try {
    const response = await bd.undeployBundle();
  } catch (e) {
    err = e;
  }
  expect(err).toBeDefined();
  expect(err.message).toMatchSnapshot();
}

async function runDeployTest() {
  let parms: IHandlerParameters;
  parms = DEFAULT_PARAMTERS;
  setCommonParmsForDeployTests(parms);
  parms.arguments.csdgroup = "12345678";

  const bd = new BundleDeployer(parms);
  const response = await bd.deployBundle();
  expect(response).toMatchSnapshot();
}

async function runUndeployTest() {
  let parms: IHandlerParameters;
  parms = DEFAULT_PARAMTERS;
  setCommonParmsForUndeployTests(parms);
  parms.arguments.csdgroup = "12345678";

  const bd = new BundleDeployer(parms);
  const response = await bd.undeployBundle();
  expect(response).toMatchSnapshot();
}

function setCommonParmsForDeployTests(parms: IHandlerParameters) {
  setCommonParmsForUndeployTests(parms);
  parms.arguments.bundledir = "1234567890";
  parms.arguments.targetstate = "ENABLED";
}

function setCommonParmsForUndeployTests(parms: IHandlerParameters) {
  parms.arguments.cicshlq = "12345678901234567890123456789012345";
  parms.arguments.cpsmhlq = "abcde12345abcde12345abcde12345abcde";
  parms.arguments.cicsplex = "12345678";
  parms.arguments.scope = "12345678";
  parms.arguments.csdgroup = undefined;
  parms.arguments.resgroup = undefined;
  parms.arguments.timeout = undefined;
  parms.arguments.name = "12345678";
  parms.arguments.jobcard = "//DFHDPLOY JOB DFHDPLOY,CLASS=A,MSGCLASS=X,TIME=NOLIMIT";
  parms.arguments.targetstate = "DISCARDED";
  parms.arguments.description = undefined;
}

async function testDeployJCL(parms: IHandlerParameters) {
  submitSpy.mockImplementationOnce(() => [{ddName: "SYSTSPRT", stepName: "DFHDPLOY", data: "DFHRL2012I"}] );

  const bd = new BundleDeployer(parms);
  const response = await bd.deployBundle();

  // Check the generated JCL
  expect(submitSpy.mock.calls[submitSpy.mock.calls.length - 1][1]).toMatchSnapshot();
}

async function testUndeployJCL(parms: IHandlerParameters) {
  submitSpy.mockImplementationOnce(() => [{ddName: "SYSTSPRT", stepName: "DFHDPLOY", data: "DFHRL2037I"}] );

  const bd = new BundleDeployer(parms);
  const response = await bd.undeployBundle();

  // Check the generated JCL
  expect(submitSpy.mock.calls[submitSpy.mock.calls.length - 1][1]).toMatchSnapshot();
}
