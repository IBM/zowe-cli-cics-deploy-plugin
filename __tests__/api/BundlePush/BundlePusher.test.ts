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
import { ZosmfSession, SshSession, SubmitJobs, Shell, List, Upload, Create } from "@zowe/cli";

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
                throw new Error("Unexpected use of setMessage in Mock: " + setMsgArgs.toString());
            }),
            setObj: jest.fn((setObjArgs) => {
                throw new Error("Unexpected use of setObj in Mock: " + setObjArgs.toString());
            })
        },
        console: {
            log: jest.fn((logs) => {
                consoleText += logs.toString();
            }),
            error: jest.fn((errors) => {
                throw new Error("Unexpected use of error log in Mock: " + errors.toString());
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
let consoleText = "";

// Initialise xml2json before mocking anything
const parser = require("xml2json");

let zosMFSpy = jest.spyOn(ZosmfSession, "createBasicZosmfSession").mockImplementation(() => ({}));
let sshSpy = jest.spyOn(SshSession, "createBasicSshSession").mockImplementation(() => ({}));
let createSpy = jest.spyOn(Create, "uss").mockImplementation(() => ({}));
let listSpy = jest.spyOn(List, "fileList").mockImplementation(() => ({}));
let membersSpy = jest.spyOn(List, "allMembers").mockImplementation(() => ({}));
let submitSpy = jest.spyOn(SubmitJobs, "submitJclString").mockImplementation(() => ({}));
let shellSpy = jest.spyOn(Shell, "executeSshCwd").mockImplementation(() => ({}));
let existsSpy = jest.spyOn(fs, "existsSync").mockImplementation(() => ({}));
let readSpy = jest.spyOn(fs, "readFileSync").mockImplementation(() => ({}));
let uploadSpy = jest.spyOn(Upload, "dirToUSSDirRecursive").mockImplementation(() => ({}));

describe("BundlePusher01", () => {

    beforeEach(() => {
        zosMFSpy = jest.spyOn(ZosmfSession, "createBasicZosmfSession").mockImplementation(() => ({}));
        sshSpy = jest.spyOn(SshSession, "createBasicSshSession").mockImplementation(() => ({}));
        createSpy = jest.spyOn(Create, "uss").mockImplementation(() => ({}));
        listSpy = jest.spyOn(List, "fileList").mockImplementation(() =>
                  ( { success: true, apiResponse: { items: [ ".", ".." ] } } ));
        membersSpy = jest.spyOn(List, "allMembers").mockImplementation(() => ( { val: "DFHDPLOY, EYU9ABSI" }));
        submitSpy = jest.spyOn(SubmitJobs, "submitJclString").mockImplementation(() =>
                  [{ddName: "SYSTSPRT", stepName: "DFHDPLOY", data: "DFHRL2012I"}] );
        shellSpy = jest.spyOn(Shell, "executeSshCwd").mockImplementation(() => ({}));
        existsSpy = jest.spyOn(fs, "existsSync").mockReturnValue(false);
        readSpy = jest.spyOn(fs, "readFileSync").mockImplementation((data: string) => {
          if (data.indexOf("cics.xml") > -1) {
            return "<manifest xmlns=\"http://www.ibm.com/xmlns/prod/cics/bundle\"></manifest>";
          }
        });
        uploadSpy = jest.spyOn(Upload, "dirToUSSDirRecursive").mockImplementation(() => ({}));
        consoleText = "";
    });
    afterEach(() => {
        jest.restoreAllMocks();
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
        existsSpy.mockReturnValue(true);
        readSpy.mockImplementation((data: string) => ("wibble"));
        await runPushTestWithError("__tests__/__resources__/BadManifestBundle01", false,
                                   "Existing CICS Manifest file found with unparsable content.");
    });
    it("should complain with missing manifest file", async () => {
        readSpy.mockImplementationOnce(() => {
          const e: any = new Error( "Injected read error" );
          e.code = "ENOENT";
          throw e;
        });
        await runPushTestWithError("__tests__/__resources__/EmptyBundle02", false,
                                   "No bundle manifest file found:");
    });
    it("should complain with missing zOSMF profile for push", async () => {
        zosMFSpy.mockImplementationOnce(() => { throw new Error( "Injected zOSMF Create error" ); });
        await runPushTestWithError("__tests__/__resources__/ExampleBundle01",  false, "Injected zOSMF Create error");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
    });
    it("should complain with missing SSH profile for push", async () => {
        sshSpy.mockImplementationOnce(() => { throw new Error( "Injected SSH Create error" ); });
        await runPushTestWithError("__tests__/__resources__/ExampleBundle01",  false, "Injected SSH Create error");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
    });
    it("should complain if remote bundle dir mkdir fails", async () => {
        createSpy.mockImplementationOnce(() => { throw new Error( "Injected Create error" ); });
        await runPushTestWithError("__tests__/__resources__/ExampleBundle01",  false,
              "A problem occurred attempting to create directory '/u/ThisDoesNotExist/12345678'. Problem is: Injected Create error");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledTimes(1);
    });
    it("should complain if remote bundle dir error", async () => {
        listSpy.mockImplementationOnce(() => { throw new Error( "Injected List error" ); });
        await runPushTestWithError("__tests__/__resources__/ExampleBundle01",  false, "Injected List error");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
    });
    it("should complain if remote bundledir list fails", async () => {
        listSpy.mockImplementationOnce(() => ( { success: false } ));
        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
              "A problem occurred accessing remote bundle directory '/u/ThisDoesNotExist/12345678'. Problem is: Command Failed.");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
    });
    it("should complain if remote bundledir list returns empty response", async () => {
        listSpy.mockImplementationOnce(() => ( { success: true, apiResponse: undefined } ));
        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
              "A problem occurred accessing remote bundle directory '/u/ThisDoesNotExist/12345678'. Problem is: Command response is empty.");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
    });
    it("should complain if remote bundledir list returns empty items", async () => {
        listSpy.mockImplementationOnce(() => ( { success: true, apiResponse: {} } ));
        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
              "A problem occurred accessing remote bundle directory '/u/ThisDoesNotExist/12345678'. Problem is: Command response items are missing.");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
    });
    it("should complain if remote bundledir exists and is not a Bundle", async () => {
        listSpy.mockImplementationOnce(() =>
              ( { success: true, apiResponse: { items: [ {name: "."}, {name: ".."}, {name: "wibble"} ] } } ));
        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
              "A problem occurred accessing remote bundle directory '/u/ThisDoesNotExist/12345678'. Problem is: " +
              "The remote directory is already populated and does not contain a bundle.");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
    });
    it("should complain if remote bundledir is not empty and --overwrite not set", async () => {
        listSpy.mockImplementationOnce(() =>
              ( { success: true, apiResponse: { items: [ {name: "."}, {name: ".."}, {name: "META-INF"} ] } } ));
        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
              "A problem occurred accessing remote bundle directory '/u/ThisDoesNotExist/12345678'. Problem is: " +
              "The remote directory has existing content and --overwrite has not been set.");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
    });
    it("should handle error undeploying existing bundle", async () => {
        submitSpy.mockImplementationOnce(() => { throw new Error( "Injected Submit error" ); });

        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", true,
              "Submitting DFHDPLOY JCL for the UNDEPLOY action");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
        expect(membersSpy).toHaveBeenCalledTimes(2);
        expect(submitSpy).toHaveBeenCalledTimes(1);
    });
    it("should cope with error during delete of existing bundledir contents", async () => {
        shellSpy.mockImplementationOnce(() => { throw new Error( "Injected Shell error" ); });

        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", true,
              "A problem occurred attempting to run 'rm -r *' in remote directory '/u/ThisDoesNotExist/12345678'. Problem is: Injected Shell error");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(1);
        expect(membersSpy).toHaveBeenCalledTimes(2);
        expect(submitSpy).toHaveBeenCalledTimes(1);
    });
    it("should tolerate delete of empty directory", async () => {
        shellSpy.mockImplementation((session: any, cmd: string, dir: string, stdoutHandler: (data: string) => void) => {
          stdoutHandler("Injected FSUM9195 empty directory message");
        });

        await runPushTest("__tests__/__resources__/ExampleBundle01", true,
              "PUSH operation completed.");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(1);
        expect(membersSpy).toHaveBeenCalledTimes(2);
        expect(submitSpy).toHaveBeenCalledTimes(2);
    });
    it("should handle error with attribs file", async () => {
        existsSpy.mockImplementation((data: string) => {
          if (data.indexOf(".zosattributes") > -1) {
            return true;
          }
        });
        readSpy.mockImplementation((data: string) => {
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
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(1);
        expect(membersSpy).toHaveBeenCalledTimes(2);
        expect(submitSpy).toHaveBeenCalledTimes(1);
        expect(existsSpy).toHaveBeenCalledTimes(1);
        expect(readSpy).toHaveBeenCalledTimes(2);
    });
    it("should handle error with bundle upload", async () => {
        uploadSpy.mockImplementationOnce(() => { throw new Error("Injected upload error"); });

        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
              "A problem occurred uploading the bundle to the remote directory '/u/ThisDoesNotExist/12345678'. Problem is: Injected upload error");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(0);
        expect(membersSpy).toHaveBeenCalledTimes(0);
        expect(submitSpy).toHaveBeenCalledTimes(0);
        expect(existsSpy).toHaveBeenCalledTimes(1);
        expect(readSpy).toHaveBeenCalledTimes(1);
        expect(uploadSpy).toHaveBeenCalledTimes(1);
    });
    it("should handle custom bundle id", async () => {
        uploadSpy.mockImplementationOnce(() => { throw new Error("Injected upload error"); });
        readSpy = jest.spyOn(fs, "readFileSync").mockImplementation((data: string) => {
          if (data.indexOf("cics.xml") > -1) {
            return "<manifest xmlns=\"http://www.ibm.com/xmlns/prod/cics/bundle\" id=\"InjectedBundleId\" ></manifest>";
          }
        });

        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
              "A problem occurred uploading the bundle to the remote directory '/u/ThisDoesNotExist/InjectedBundleId_1.0.0'. Problem is: Injected upload error");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(0);
        expect(membersSpy).toHaveBeenCalledTimes(0);
        expect(submitSpy).toHaveBeenCalledTimes(0);
        expect(existsSpy).toHaveBeenCalledTimes(1);
        expect(readSpy).toHaveBeenCalledTimes(1);
        expect(uploadSpy).toHaveBeenCalledTimes(1);
    });
    it("should handle custom bundle id and version", async () => {
        uploadSpy.mockImplementationOnce(() => { throw new Error("Injected upload error"); });
        readSpy = jest.spyOn(fs, "readFileSync").mockImplementation((data: string) => {
          if (data.indexOf("cics.xml") > -1) {
            return "<manifest xmlns=\"http://www.ibm.com/xmlns/prod/cics/bundle\" id=\"InjectedBundleId\" " +
                   " bundleMajorVer=\"33\" bundleMinorVer=\"22\" bundleMicroVer=\"11\"></manifest>";
          }
        });

        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
              "A problem occurred uploading the bundle to the remote directory '/u/ThisDoesNotExist/InjectedBundleId_33.22.11'. Problem is: Injected upload error");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(0);
        expect(membersSpy).toHaveBeenCalledTimes(0);
        expect(submitSpy).toHaveBeenCalledTimes(0);
        expect(existsSpy).toHaveBeenCalledTimes(1);
        expect(readSpy).toHaveBeenCalledTimes(1);
        expect(uploadSpy).toHaveBeenCalledTimes(1);
    });
    it("should handle error with remote npm install", async () => {
        shellSpy.mockImplementation((session: any, cmd: string) => {
          if (cmd.indexOf("npm install") > -1) {
            throw new Error("Injected NPM error");
          }
          else {
            return true;
          }
        });
        existsSpy.mockImplementation((data: string) => {
          if (data.indexOf(".zosattributes") > -1) {
            return false;
          }
          if (data.indexOf("package.json") > -1) {
            return true;
          }
        });

        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
              "Problem is: Injected NPM error");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(1);
        expect(membersSpy).toHaveBeenCalledTimes(0);
        expect(submitSpy).toHaveBeenCalledTimes(0);
        expect(existsSpy).toHaveBeenCalledTimes(2);
        expect(readSpy).toHaveBeenCalledTimes(1);
        expect(uploadSpy).toHaveBeenCalledTimes(1);
    });
    it("should handle failure of remote npm install", async () => {
        shellSpy.mockImplementation((session: any, cmd: string, dir: string, stdoutHandler: (data: string) => void) => {
          if (cmd.indexOf("npm install") > -1) {
            stdoutHandler("Injected stdout error message");
          }
          else {
            return true;
          }
        });
        existsSpy.mockImplementation((data: string) => {
          if (data.indexOf(".zosattributes") > -1) {
            return false;
          }
          if (data.indexOf("package.json") > -1) {
            return true;
          }
        });

        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
              "A problem occurred attempting to run 'export PATH=\"$PATH:/usr/lpp/IBM/cnj/IBM/node-latest-os390-s390x/bin\" " +
              "&& npm install' in remote directory '/u/ThisDoesNotExist/12345678'. " +
              "Problem is: The output from the remote command implied that an error occurred.");

        expect(consoleText).toContain("Injected stdout error message");
        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(1);
        expect(membersSpy).toHaveBeenCalledTimes(0);
        expect(submitSpy).toHaveBeenCalledTimes(0);
        expect(existsSpy).toHaveBeenCalledTimes(2);
        expect(readSpy).toHaveBeenCalledTimes(1);
        expect(uploadSpy).toHaveBeenCalledTimes(1);
    });
    it("should handle failure of remote npm install with FSUM message", async () => {
        shellSpy.mockImplementation((session: any, cmd: string, dir: string, stdoutHandler: (data: string) => void) => {
          if (cmd.indexOf("npm install") > -1) {
            stdoutHandler("Injected FSUM7351 not found message");
          }
          else {
            return true;
          }
        });
        existsSpy.mockImplementation((data: string) => {
          if (data.indexOf(".zosattributes") > -1) {
            return false;
          }
          if (data.indexOf("package.json") > -1) {
            return true;
          }
        });

        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
              "A problem occurred attempting to run 'export PATH=\"$PATH:/usr/lpp/IBM/cnj/IBM/node-latest-os390-s390x/bin\" " +
              "&& npm install' in remote directory '/u/ThisDoesNotExist/12345678'. " +
              "Problem is: The output from the remote command implied that an error occurred.");

        expect(consoleText).toContain("Injected FSUM7351 not found message");
        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(1);
        expect(membersSpy).toHaveBeenCalledTimes(0);
        expect(submitSpy).toHaveBeenCalledTimes(0);
        expect(existsSpy).toHaveBeenCalledTimes(2);
        expect(readSpy).toHaveBeenCalledTimes(1);
        expect(uploadSpy).toHaveBeenCalledTimes(1);
    });
    it("should handle failure of remote npm install with node error", async () => {
        shellSpy.mockImplementation((session: any, cmd: string, dir: string, stdoutHandler: (data: string) => void) => {
          if (cmd.indexOf("npm install") > -1) {
            stdoutHandler("Injected npm ERR! Exit status 1 message");
          }
          else {
            return true;
          }
        });
        existsSpy.mockImplementation((data: string) => {
          if (data.indexOf(".zosattributes") > -1) {
            return false;
          }
          if (data.indexOf("package.json") > -1) {
            return true;
          }
        });

        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
              "A problem occurred attempting to run 'export PATH=\"$PATH:/usr/lpp/IBM/cnj/IBM/node-latest-os390-s390x/bin\" " +
              "&& npm install' in remote directory '/u/ThisDoesNotExist/12345678'. " +
              "Problem is: The output from the remote command implied that an error occurred.");

        expect(consoleText).toContain("Injected npm ERR! Exit status 1 message");
        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(1);
        expect(membersSpy).toHaveBeenCalledTimes(0);
        expect(submitSpy).toHaveBeenCalledTimes(0);
        expect(existsSpy).toHaveBeenCalledTimes(2);
        expect(readSpy).toHaveBeenCalledTimes(1);
        expect(uploadSpy).toHaveBeenCalledTimes(1);
    });
    it("should handle error with remote bundle deploy", async () => {
        submitSpy.mockImplementationOnce(() => { throw new Error("Injected deploy error"); });

        await runPushTestWithError("__tests__/__resources__/ExampleBundle01", false,
              "Failure occurred submitting DFHDPLOY JCL for JOBID UNKNOWN: 'Injected deploy error'. " +
              "Most recent status update: 'Submitting DFHDPLOY JCL for the DEPLOY action'.");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(0);
        expect(membersSpy).toHaveBeenCalledTimes(2);
        expect(submitSpy).toHaveBeenCalledTimes(1);
        expect(existsSpy).toHaveBeenCalledTimes(2);
        expect(readSpy).toHaveBeenCalledTimes(1);
        expect(uploadSpy).toHaveBeenCalledTimes(1);
    });
    it("should run to completion", async () => {

        await runPushTest("__tests__/__resources__/ExampleBundle01", false, "PUSH operation completed.");

        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(shellSpy).toHaveBeenCalledTimes(0);
        expect(membersSpy).toHaveBeenCalledTimes(2);
        expect(submitSpy).toHaveBeenCalledTimes(1);
        expect(existsSpy).toHaveBeenCalledTimes(2);
        expect(readSpy).toHaveBeenCalledTimes(1);
        expect(uploadSpy).toHaveBeenCalledTimes(1);
    });
    it("should run to completion with verbose output", async () => {
        const parms = getCommonParmsForPushTests();
        parms.arguments.verbose = true;
        shellSpy.mockImplementation((session: any, cmd: string, dir: string, stdoutHandler: (data: string) => void) => {
          stdoutHandler("Injected stdout shell message");
        });
        existsSpy.mockImplementation((data: string) => {
          if (data.indexOf(".zosattributes") > -1) {
            return false;
          }
          if (data.indexOf("package.json") > -1) {
            return true;
          }
        });

        await runPushTest("__tests__/__resources__/ExampleBundle01", false, "PUSH operation completed.", parms);

        expect(consoleText).toContain("Making remote bundle directory");
        expect(consoleText).toContain("Accessing contents of remote bundle directory");
        expect(consoleText).toContain("Uploading the bundle to the remote bundle directory");
        expect(consoleText).toContain("Running npm install for the remote bundle");
        expect(consoleText).toContain("Injected stdout shell message");
        expect(consoleText).toContain("Deploying the bundle to CICS");
        expect(consoleText).toContain("Deployed existing bundle to CICS");
        expect(zosMFSpy).toHaveBeenCalledTimes(1);
        expect(sshSpy).toHaveBeenCalledTimes(1);
        expect(listSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledTimes(1);
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

async function runPushTest(localBundleDir: string, overwrite: boolean, expectedResponse: string, parmsIn?: IHandlerParameters) {
  let parms: IHandlerParameters;
  if (parmsIn === undefined) {
    parms = getCommonParmsForPushTests();
  }
  else {
    parms = parmsIn;
  }
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
