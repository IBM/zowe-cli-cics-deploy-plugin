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

import { BundlePusher } from "../../../src/api/BundlePush/BundlePusher";
import { IHandlerParameters } from "@zowe/imperative";
import * as PushBundleDefinition from "../../../src/cli/push/bundle/PushBundle.definition";
import * as fse from "fs-extra";
import * as fs from "fs";
import { ZosmfSession, SshSession, SubmitJobs, Shell, List, Upload } from "@zowe/cli";


const DEFAULT_PARAMTERS: IHandlerParameters = {
    arguments: {
        $0: "bright",
        _: ["zowe-cli-cics-deploy-plugin", "push", "bundle"],
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
    definition: PushBundleDefinition.PushBundleDefinition,
    fullDefinition: PushBundleDefinition.PushBundleDefinition,
};

describe("BundlePusher01", () => {

    afterEach(() => {
        jest.resetAllMocks();
    });
    it("should complain with missing name", async () => {
        const parms = getCommonParmsForPushTests();
        parms.arguments.name = undefined;

        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
                                   "--name parameter is not set", parms);
    });
    it("should complain with empty name", async () => {
        const parms = getCommonParmsForPushTests();
        parms.arguments.name = "";

        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
                                   "--name parameter is empty", parms);
    });
    it("should complain with bad type for name", async () => {
        const parms = getCommonParmsForPushTests();
        parms.arguments.name = 0;

        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
                                   "--name parameter is not a string", parms);
    });
    it("should complain with over long name", async () => {
        const parms = getCommonParmsForPushTests();
        parms.arguments.name = "123456789";

        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
                                   "--name parameter is too long", parms);
    });
    it("should complain with missing targetdir", async () => {
        const parms = getCommonParmsForPushTests();
        parms.arguments.targetdir = undefined;

        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
                                   "--targetdir parameter is not set", parms);
    });
    it("should complain with empty targetdir", async () => {
        const parms = getCommonParmsForPushTests();
        parms.arguments.targetdir = "";

        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
                                   "--targetdir parameter is empty", parms);
    });
    it("should complain with bad type for targetdir", async () => {
        const parms = getCommonParmsForPushTests();
        parms.arguments.targetdir = 0;

        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
                                   "--targetdir parameter is not a string", parms);
    });
    it("should complain with over long targetdir", async () => {
        const parms = getCommonParmsForPushTests();
        parms.arguments.targetdir = "12345678901234567890123456789012345678901234567890" +
                                    "12345678901234567890123456789012345678901234567890" +
                                    "12345678901234567890123456789012345678901234567890" +
                                    "12345678901234567890123456789012345678901234567890" +
                                    "12345678901234567890123456789012345678901234567890123456";

        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
                                   "--targetdir parameter is too long", parms);
    });
    it("should complain with bad manifest file", async () => {
        await runPushTestWithError("__tests__/__resources__/BadManifestBundle01", false,
                                   "Existing CICS Manifest file found with unparsable content.");
    });
    it("should complain with missing manifest file", async () => {
        await runPushTestWithError("__tests__/__resources__/EmptyBundle02", false,
                                   "No bundle manifest file found:");
    });
    it("should complain with missing zOSMF profile for push", async () => {
        const zosMFSpy = jest.spyOn(ZosmfSession, "createBasicZosmfSession").mockImplementationOnce(() => { throw new Error( "Injected zOSMF Create error" ); });
        await runPushTestWithError("__tests__/__resources__/ExampleBundle01",  false, "Injected zOSMF Create error");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
    });
    it("should complain with missing SSH profile for push", async () => {
        const zosMFSpy = jest.spyOn(ZosmfSession, "createBasicZosmfSession").mockImplementationOnce(() => ({}));
        const sshSpy = jest.spyOn(SshSession, "createBasicSshSession").mockImplementationOnce(() => { throw new Error( "Injected SSH Create error" ); });
        await runPushTestWithError("__tests__/__resources__/ExampleBundle01",  false, "Injected SSH Create error");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
    });
    it("should complain if remote bundle dir mkdir fails", async () => {
        const zosMFSpy = jest.spyOn(ZosmfSession, "createBasicZosmfSession").mockImplementationOnce(() => ({}));
        const sshSpy = jest.spyOn(SshSession, "createBasicSshSession").mockImplementationOnce(() => ({}));
        const shellSpy = jest.spyOn(Shell, "executeSshCwd").mockImplementationOnce(() =>
                                              { throw new Error( "Injected Shell error" ); });
        await runPushTestWithError("__tests__/__resources__/ExampleBundle01",  false,
              "A problem occurred attempting to run 'mkdir 12345678' in remote directory '/u/ThisDoesNotExist'. Problem is: Injected Shell error");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(1);
    });
    it("should complain if remote bundle dir error", async () => {
        const zosMFSpy = jest.spyOn(ZosmfSession, "createBasicZosmfSession").mockImplementationOnce(() => ({}));
        const sshSpy = jest.spyOn(SshSession, "createBasicSshSession").mockImplementationOnce(() => ({}));
        const shellSpy = jest.spyOn(Shell, "executeSshCwd").mockImplementationOnce(() => ({}));
        const listSpy = jest.spyOn(List, "fileList").mockImplementationOnce(() => { throw new Error( "Injected List error" ); });
        await runPushTestWithError("__tests__/__resources__/ExampleBundle01",  false, "Injected List error");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
    });
    it("should complain if remote bundledir list fails", async () => {
        const zosMFSpy = jest.spyOn(ZosmfSession, "createBasicZosmfSession").mockImplementationOnce(() => ({}));
        const sshSpy = jest.spyOn(SshSession, "createBasicSshSession").mockImplementationOnce(() => ({}));
        const shellSpy = jest.spyOn(Shell, "executeSshCwd").mockImplementationOnce(() => ({}));
        const listSpy = jest.spyOn(List, "fileList").mockImplementationOnce(() => ( { success: false } ));
        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
              "A problem occurred accessing remote bundle directory '/u/ThisDoesNotExist/12345678'. Problem is: Command Failed.");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
    });
    it("should complain if remote bundledir list returns empty response", async () => {
        const zosMFSpy = jest.spyOn(ZosmfSession, "createBasicZosmfSession").mockImplementationOnce(() => ({}));
        const sshSpy = jest.spyOn(SshSession, "createBasicSshSession").mockImplementationOnce(() => ({}));
        const shellSpy = jest.spyOn(Shell, "executeSshCwd").mockImplementationOnce(() => ({}));
        const listSpy = jest.spyOn(List, "fileList").mockImplementationOnce(() => ( { success: true, apiResponse: undefined } ));
        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
              "A problem occurred accessing remote bundle directory '/u/ThisDoesNotExist/12345678'. Problem is: Command response is empty.");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
    });
    it("should complain if remote bundledir list returns empty items", async () => {
        const zosMFSpy = jest.spyOn(ZosmfSession, "createBasicZosmfSession").mockImplementationOnce(() => ({}));
        const sshSpy = jest.spyOn(SshSession, "createBasicSshSession").mockImplementationOnce(() => ({}));
        const shellSpy = jest.spyOn(Shell, "executeSshCwd").mockImplementationOnce(() => ({}));
        const listSpy = jest.spyOn(List, "fileList").mockImplementationOnce(() => ( { success: true, apiResponse: {} } ));
        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
              "A problem occurred accessing remote bundle directory '/u/ThisDoesNotExist/12345678'. Problem is: Command response items are missing.");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
    });
    it("should complain if remote bundledir exists and is not a Bundle", async () => {
        const zosMFSpy = jest.spyOn(ZosmfSession, "createBasicZosmfSession").mockImplementationOnce(() => ({}));
        const sshSpy = jest.spyOn(SshSession, "createBasicSshSession").mockImplementationOnce(() => ({}));
        const shellSpy = jest.spyOn(Shell, "executeSshCwd").mockImplementationOnce(() => ({}));
        const listSpy = jest.spyOn(List, "fileList").mockImplementationOnce(() =>
              ( { success: true, apiResponse: { items: [ {name: "."}, {name: ".."}, {name: "wibble"} ] } } ));
        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
              "A problem occurred accessing remote bundle directory '/u/ThisDoesNotExist/12345678'. Problem is: " +
              "The remote directory is already populated and does not contain a bundle.");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
    });
    it("should complain if remote bundledir is not empty and --overwrite not set", async () => {
        const zosMFSpy = jest.spyOn(ZosmfSession, "createBasicZosmfSession").mockImplementationOnce(() => ({}));
        const sshSpy = jest.spyOn(SshSession, "createBasicSshSession").mockImplementationOnce(() => ({}));
        const shellSpy = jest.spyOn(Shell, "executeSshCwd").mockImplementationOnce(() => ({}));
        const listSpy = jest.spyOn(List, "fileList").mockImplementationOnce(() =>
              ( { success: true, apiResponse: { items: [ {name: "."}, {name: ".."}, {name: "META-INF"} ] } } ));
        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
              "A problem occurred accessing remote bundle directory '/u/ThisDoesNotExist/12345678'. Problem is: " +
              "The remote directory has existing content and --overwrite has not been set.");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
    });
    it("should handle error undeploying existing bundle", async () => {
        const zosMFSpy = jest.spyOn(ZosmfSession, "createBasicZosmfSession").mockImplementationOnce(() => ({}));
        const sshSpy = jest.spyOn(SshSession, "createBasicSshSession").mockImplementationOnce(() => ({}));
        const shellSpy = jest.spyOn(Shell, "executeSshCwd").mockImplementationOnce(() => ({}));
        const listSpy = jest.spyOn(List, "fileList").mockImplementationOnce(() =>
              ( { success: true, apiResponse: { items: [ ".", ".." ] } } ));

        const membersSpy = jest.spyOn(List, "allMembers").mockImplementation(() => ( { val: "DFHDPLOY, EYU9ABSI" }));
        const submitSpy = jest.spyOn(SubmitJobs, "submitJclString").mockImplementationOnce(() =>
                                              { throw new Error( "Injected Submit error" ); });

        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", true,
              "Submitting DFHDPLOY JCL for the UNDEPLOY action");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
        expect(membersSpy).toHaveBeenCalledTimes(2);
        expect(submitSpy).toHaveBeenCalledTimes(1);
    });
    it("should cope with error during delete of existing bundledir contents", async () => {
        const zosMFSpy = jest.spyOn(ZosmfSession, "createBasicZosmfSession").mockImplementationOnce(() => ({}));
        const sshSpy = jest.spyOn(SshSession, "createBasicSshSession").mockImplementationOnce(() => ({}));
        const shellSpy = jest.spyOn(Shell, "executeSshCwd").mockImplementationOnce(() => ({}))
                                                           .mockImplementationOnce(() =>
                                                             { throw new Error( "Injected Shell error" ); });
        const listSpy = jest.spyOn(List, "fileList").mockImplementationOnce(() =>
              ( { success: true, apiResponse: { items: [ ".", ".." ] } } ));

        const membersSpy = jest.spyOn(List, "allMembers").mockImplementation(() => ( { val: "DFHDPLOY, EYU9ABSI" }));
        const submitSpy = jest.spyOn(SubmitJobs, "submitJclString").mockImplementationOnce(() =>
                                              [{ddName: "SYSTSPRT", stepName: "DFHDPLOY", data: "DFHRL2012I"}] );

        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", true,
              "A problem occurred attempting to run 'rm -r *' in remote directory '/u/ThisDoesNotExist/12345678'. Problem is: Injected Shell error");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(2);
        expect(membersSpy).toHaveBeenCalledTimes(2);
        expect(submitSpy).toHaveBeenCalledTimes(1);
    });
    it("should handle error with attribs file", async () => {
        const zosMFSpy = jest.spyOn(ZosmfSession, "createBasicZosmfSession").mockImplementationOnce(() => ({}));
        const sshSpy = jest.spyOn(SshSession, "createBasicSshSession").mockImplementationOnce(() => ({}));
        const shellSpy = jest.spyOn(Shell, "executeSshCwd").mockImplementation(() => ({}));
        const listSpy = jest.spyOn(List, "fileList").mockImplementationOnce(() =>
              ( { success: true, apiResponse: { items: [ ".", ".." ] } } ));

        const membersSpy = jest.spyOn(List, "allMembers").mockImplementation(() => ( { val: "DFHDPLOY, EYU9ABSI" }));
        const submitSpy = jest.spyOn(SubmitJobs, "submitJclString").mockImplementationOnce(() =>
                                              [{ddName: "SYSTSPRT", stepName: "DFHDPLOY", data: "DFHRL2012I"}] );
        const existsSpy = jest.spyOn(fs, "existsSync").mockImplementation((data: string) => {
          if (data.indexOf(".zosattributes") > -1) {
            return true;
          }
        });
        const readSpy = jest.spyOn(fs, "readFileSync").mockImplementation((data: string) => {
          if (data.indexOf(".zosattributes") > -1) {
            throw new Error("Injected Read File error");
          }
          else if (data.indexOf("cics.xml") > -1) {
            return "<manifest xmlns=\"http://www.ibm.com/xmlns/prod/cics/bundle\"></manifest>";
          }
        });

        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", true,
              "Problem is: Injected Read File error");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(2);
        expect(membersSpy).toHaveBeenCalledTimes(2);
        expect(submitSpy).toHaveBeenCalledTimes(1);
        expect(existsSpy).toHaveBeenCalledTimes(1);
        expect(readSpy).toHaveBeenCalledTimes(2);
    });
    it("should handle error with bundle upload", async () => {
        const zosMFSpy = jest.spyOn(ZosmfSession, "createBasicZosmfSession").mockImplementationOnce(() => ({}));
        const sshSpy = jest.spyOn(SshSession, "createBasicSshSession").mockImplementationOnce(() => ({}));
        const shellSpy = jest.spyOn(Shell, "executeSshCwd").mockImplementation(() => ({}));
        const listSpy = jest.spyOn(List, "fileList").mockImplementationOnce(() =>
              ( { success: true, apiResponse: { items: [ ".", ".." ] } } ));

        const membersSpy = jest.spyOn(List, "allMembers").mockImplementation(() => ( { val: "DFHDPLOY, EYU9ABSI" }));
        const submitSpy = jest.spyOn(SubmitJobs, "submitJclString").mockImplementationOnce(() =>
                                              [{ddName: "SYSTSPRT", stepName: "DFHDPLOY", data: "DFHRL2012I"}] );
        const existsSpy = jest.spyOn(fs, "existsSync").mockImplementation((data: string) => {
          if (data.indexOf(".zosattributes") > -1) {
            return false;
          }
        });
        const readSpy = jest.spyOn(fs, "readFileSync").mockImplementation((data: string) => {
          if (data.indexOf("cics.xml") > -1) {
            return "<manifest xmlns=\"http://www.ibm.com/xmlns/prod/cics/bundle\"></manifest>";
          }
        });
        const uploadSpy = jest.spyOn(Upload, "dirToUSSDirRecursive").mockImplementationOnce(() => { throw new Error("Injected upload error"); });

        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
              "A problem occurred uploading the bundle to the remote directory '/u/ThisDoesNotExist/12345678'. Problem is: Injected upload error");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(1);
        expect(membersSpy).toHaveBeenCalledTimes(0);
        expect(submitSpy).toHaveBeenCalledTimes(0);
        expect(existsSpy).toHaveBeenCalledTimes(1);
        expect(readSpy).toHaveBeenCalledTimes(1);
        expect(uploadSpy).toHaveBeenCalledTimes(1);
    });
    it("should handle error with remote npm install", async () => {
        const zosMFSpy = jest.spyOn(ZosmfSession, "createBasicZosmfSession").mockImplementationOnce(() => ({}));
        const sshSpy = jest.spyOn(SshSession, "createBasicSshSession").mockImplementationOnce(() => ({}));
        const shellSpy = jest.spyOn(Shell, "executeSshCwd").mockImplementation((session: any, cmd: string) => {
          if (cmd.indexOf("npm install") > -1) {
            throw new Error("Injected NPM error");
          }
          else {
            return true;
          }
        });
        const listSpy = jest.spyOn(List, "fileList").mockImplementationOnce(() =>
              ( { success: true, apiResponse: { items: [ ".", ".." ] } } ));

        const membersSpy = jest.spyOn(List, "allMembers").mockImplementation(() => ( { val: "DFHDPLOY, EYU9ABSI" }));
        const submitSpy = jest.spyOn(SubmitJobs, "submitJclString").mockImplementationOnce(() =>
                                              [{ddName: "SYSTSPRT", stepName: "DFHDPLOY", data: "DFHRL2012I"}] );
        const existsSpy = jest.spyOn(fs, "existsSync").mockImplementation((data: string) => {
          if (data.indexOf(".zosattributes") > -1) {
            return false;
          }
          if (data.indexOf("package.json") > -1) {
            return true;
          }
        });
        const readSpy = jest.spyOn(fs, "readFileSync").mockImplementation((data: string) => {
          if (data.indexOf("cics.xml") > -1) {
            return "<manifest xmlns=\"http://www.ibm.com/xmlns/prod/cics/bundle\"></manifest>";
          }
        });
        const uploadSpy = jest.spyOn(Upload, "dirToUSSDirRecursive").mockImplementationOnce(() => ({}));

        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
              "Problem is: Injected NPM error");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(2);
        expect(membersSpy).toHaveBeenCalledTimes(0);
        expect(submitSpy).toHaveBeenCalledTimes(0);
        expect(existsSpy).toHaveBeenCalledTimes(2);
        expect(readSpy).toHaveBeenCalledTimes(1);
        expect(uploadSpy).toHaveBeenCalledTimes(1);
    });
    it("should handle error with remote bundle deploy", async () => {
        const zosMFSpy = jest.spyOn(ZosmfSession, "createBasicZosmfSession").mockImplementationOnce(() => ({}));
        const sshSpy = jest.spyOn(SshSession, "createBasicSshSession").mockImplementationOnce(() => ({}));
        const shellSpy = jest.spyOn(Shell, "executeSshCwd");
        const listSpy = jest.spyOn(List, "fileList").mockImplementationOnce(() =>
              ( { success: true, apiResponse: { items: [ ".", ".." ] } } ));

        const membersSpy = jest.spyOn(List, "allMembers").mockImplementation(() => ( { val: "DFHDPLOY, EYU9ABSI" }));
        const submitSpy = jest.spyOn(SubmitJobs, "submitJclString").mockImplementationOnce(() =>
                                              { throw new Error("Injected deploy error"); });
        const existsSpy = jest.spyOn(fs, "existsSync").mockReturnValue(false);
        const readSpy = jest.spyOn(fs, "readFileSync").mockImplementation((data: string) => {
          if (data.indexOf("cics.xml") > -1) {
            return "<manifest xmlns=\"http://www.ibm.com/xmlns/prod/cics/bundle\"></manifest>";
          }
        });
        const uploadSpy = jest.spyOn(Upload, "dirToUSSDirRecursive");

        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
              "Failure occurred submitting DFHDPLOY JCL: 'Injected deploy error'. " +
              "Most recent status update: 'Submitting DFHDPLOY JCL for the DEPLOY action'.");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(1);
        expect(membersSpy).toHaveBeenCalledTimes(2);
        expect(submitSpy).toHaveBeenCalledTimes(1);
        expect(existsSpy).toHaveBeenCalledTimes(2);
        expect(readSpy).toHaveBeenCalledTimes(1);
        expect(uploadSpy).toHaveBeenCalledTimes(1);
    });
    it("should run to completion", async () => {
        const zosMFSpy = jest.spyOn(ZosmfSession, "createBasicZosmfSession").mockImplementationOnce(() => ({}));
        const sshSpy = jest.spyOn(SshSession, "createBasicSshSession").mockImplementationOnce(() => ({}));
        const shellSpy = jest.spyOn(Shell, "executeSshCwd");
        const listSpy = jest.spyOn(List, "fileList").mockImplementationOnce(() =>
              ( { success: true, apiResponse: { items: [ ".", ".." ] } } ));

        const membersSpy = jest.spyOn(List, "allMembers").mockImplementation(() => ( { val: "DFHDPLOY, EYU9ABSI" }));
        const submitSpy = jest.spyOn(SubmitJobs, "submitJclString").mockImplementationOnce(() =>
                                              [{ddName: "SYSTSPRT", stepName: "DFHDPLOY", data: "DFHRL2012I"}] );
        const existsSpy = jest.spyOn(fs, "existsSync").mockReturnValue(false);
        const readSpy = jest.spyOn(fs, "readFileSync").mockImplementation((data: string) => {
          if (data.indexOf("cics.xml") > -1) {
            return "<manifest xmlns=\"http://www.ibm.com/xmlns/prod/cics/bundle\"></manifest>";
          }
        });
        const uploadSpy = jest.spyOn(Upload, "dirToUSSDirRecursive");

        await runPushTest("__tests__/__resources__/ExampleBundle01", false, "PUSH operation completed.");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(1);
        expect(membersSpy).toHaveBeenCalledTimes(2);
        expect(submitSpy).toHaveBeenCalledTimes(1);
        expect(existsSpy).toHaveBeenCalledTimes(2);
        expect(readSpy).toHaveBeenCalledTimes(1);
        expect(uploadSpy).toHaveBeenCalledTimes(1);
    });
});

async function runPushTestWithError(localBundleDir: string, overwrite: boolean, errorText: string, parmsIn?: IHandlerParameters) {
  let parms: IHandlerParameters;
  if (parmsIn === undefined) {
    parms = getCommonParmsForPushTests();
  }
  else {
    parms = parmsIn;
  }
  parms.arguments.overwrite = overwrite;

  let err: Error;
  try {
    const bp = new BundlePusher(parms, localBundleDir);
    const response = await bp.performPush();
  } catch (e) {
    err = e;
  }
  expect(err).toBeDefined();
  expect(err.message).toContain(errorText);
}

async function runPushTest(localBundleDir: string, overwrite: boolean, expectedResponse: string) {
  const parms = getCommonParmsForPushTests();
  parms.arguments.overwrite = overwrite;

  let err: Error;
  let response: string;
  try {
    const bp = new BundlePusher(parms, localBundleDir);
    response = await bp.performPush();
  } catch (e) {
    err = e;
  }
  expect(err).toBeUndefined();
  expect(response).toContain(expectedResponse);
}

function getCommonParmsForPushTests(): IHandlerParameters {
  let parms: IHandlerParameters;
  parms = DEFAULT_PARAMTERS;
  parms.arguments.cicshlq = "12345678901234567890123456789012345";
  parms.arguments.cpsmhlq = "abcde12345abcde12345abcde12345abcde";
  parms.arguments.cicsplex = "12345678";
  parms.arguments.scope = "12345678";
  parms.arguments.csdgroup = undefined;
  parms.arguments.resgroup = undefined;
  parms.arguments.timeout = undefined;
  parms.arguments.name = "12345678";
  parms.arguments.jobcard = "//DFHDPLOY JOB DFHDPLOY,CLASS=A,MSGCLASS=X,TIME=NOLIMIT";
  parms.arguments.targetstate = "ENABLED";
  parms.arguments.targetdir = "/u/ThisDoesNotExist";
  parms.arguments.overwrite = undefined;
  return parms;
}
