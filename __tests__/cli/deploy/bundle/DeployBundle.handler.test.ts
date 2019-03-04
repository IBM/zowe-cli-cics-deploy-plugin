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

const DEFAULT_PARAMTERS: IHandlerParameters = {
    arguments: {
        $0: "bright",
        _: ["zowe-cli-cics-deploy-plugin", "deploy", "bundle"],
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

describe("bundle Handler", () => {
    afterEach(() => {
        jest.resetAllMocks();
    });
    it("should complain with no name parameter", async () => {

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[DEFAULT_PARAMTERS]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--name parameter is not set");
    });
    it("should complain with invalid type for name parameter", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = 50;

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--name parameter is not a string");
    });
    it("should complain with overlong name parameter", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "123456789";

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--name parameter is too long");
    });
    it("should complain with empty name parameter", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "";

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--name parameter is empty");
    });
    it("should complain with no bundledir parameter", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--bundledir parameter is not set");
    });
    it("should complain with invalid type for bundledir parameter", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = 50;

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--bundledir parameter is not a string");
    });
    it("should complain with overlong bundledir parameter", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "12345678901234567890123456789012345678901234567890" +
                                    "12345678901234567890123456789012345678901234567890" +
                                    "12345678901234567890123456789012345678901234567890" +
                                    "12345678901234567890123456789012345678901234567890" +
                                    "12345678901234567890123456789012345678901234567890123456";

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--bundledir parameter is too long");
    });
    it("should complain with empty bundledir parameter", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "";

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--bundledir parameter is empty");
    });
    it("should complain if profile, cicsplex and scope not set", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "wibble";

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("either --cics-deploy-profile or both --cicsplex and --scope must be set");
    });
    it("should complain if profile not found", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "wibble";
        parms.arguments["cics-deploy-profile"] = "wibble";

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("cics-deploy-profile \"wibble\" not found");
    });
    it("should complain if profile is not a string", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "wibble";
        parms.arguments["cics-deploy-profile"] = 0;

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--cics-deploy-profile parameter is not a string");
    });
    it("should complain if profile is empty", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "wibble";
        parms.arguments["cics-deploy-profile"] = "";

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--cics-deploy-profile parameter is empty");
    });
    it("should complain with invalid type for cicsplex parameter", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "wibble";
        parms.arguments.scope = "Wibble";
        parms.arguments.cicsplex = 1;

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--cicsplex parameter is not a string");
    });
    it("should complain with overlong cicsplex parameter", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "wibble";
        parms.arguments.scope = "Wibble";
        parms.arguments.cicsplex = "123456789";

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--cicsplex parameter is too long");
    });
    it("should complain with empty cicsplex parameter", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "wibble";
        parms.arguments.scope = "Wibble";
        parms.arguments.cicsplex = "";

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--cicsplex parameter is empty");
    });
    it("should complain with invalid type for scope parameter", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "wibble";
        parms.arguments.cicsplex = "Wibble";
        parms.arguments.scope = 1;

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--scope parameter is not a string");
    });
    it("should complain with overlong scope parameter", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "wibble";
        parms.arguments.cicsplex = "Wibble";
        parms.arguments.scope = "123456789";

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--scope parameter is too long");
    });
    it("should complain with empty scope parameter", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "wibble";
        parms.arguments.cicsplex = "Wibble";
        parms.arguments.scope = "";

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--scope parameter is empty");
    });
    it("should complain with missing csdgroup/resgroup", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "wibble";
        parms.arguments.cicsplex = "Wibble";
        parms.arguments.scope = "wibblE";

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--scope parameter requires either --csdgroup or --resgroup to be set");
    });
    it("should complain with invalid type for csdgroup parameter", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "wibble";
        parms.arguments.cicsplex = "Wibble";
        parms.arguments.scope = "wibblE";
        parms.arguments.csdgroup = -4;

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--csdgroup parameter is not a string");
    });
    it("should complain with overlong csdgroup parameter", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "wibble";
        parms.arguments.cicsplex = "Wibble";
        parms.arguments.scope = "wibblE";
        parms.arguments.csdgroup = "123456789";

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--csdgroup parameter is too long");
    });
    it("should complain with empty csdgroup parameter", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "wibble";
        parms.arguments.cicsplex = "Wibble";
        parms.arguments.scope = "wibblE";
        parms.arguments.csdgroup = "";

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--csdgroup parameter is empty");
    });
    it("should complain with both csdgroup and resgroup set", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "wibble";
        parms.arguments.cicsplex = "Wibble";
        parms.arguments.scope = "wibblE";
        parms.arguments.csdgroup = "a";
        parms.arguments.resgroup = "b";

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--csdgroup and --resgroup cannot both be set");
    });
    it("should complain with invalid type for resgroup parameter", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "wibble";
        parms.arguments.cicsplex = "Wibble";
        parms.arguments.scope = "wibblE";
        parms.arguments.resgroup = -4;

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--resgroup parameter is not a string");
    });
    it("should complain with overlong resgroup parameter", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "wibble";
        parms.arguments.cicsplex = "Wibble";
        parms.arguments.scope = "wibblE";
        parms.arguments.resgroup = "123456789";

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--resgroup parameter is too long");
    });
    it("should complain with empty resgroup parameter", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "wibble";
        parms.arguments.cicsplex = "Wibble";
        parms.arguments.scope = "wibblE";
        parms.arguments.resgroup = "";

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--resgroup parameter is empty");
    });
    it("should complain with non-numeric timeout", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "wibble";
        parms.arguments.cicsplex = "Wibble";
        parms.arguments.scope = "wibblE";
        parms.arguments.resgroup = "wiBBle";
        parms.arguments.timeout = "WiBbLe";

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--timeout parameter is not an integer");
    });
    it("should complain with non-integer timeout", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "wibble";
        parms.arguments.cicsplex = "Wibble";
        parms.arguments.scope = "wibblE";
        parms.arguments.resgroup = "wiBBle";
        parms.arguments.timeout = 1.1;

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--timeout parameter is not an integer");
    });
    it("should complain with too large timeout", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "wibble";
        parms.arguments.cicsplex = "Wibble";
        parms.arguments.scope = "wibblE";
        parms.arguments.resgroup = "wiBBle";
        parms.arguments.timeout = 1801;

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--timeout parameter is too large");
    });
    it("should complain with too small timeout", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "wibble";
        parms.arguments.cicsplex = "Wibble";
        parms.arguments.scope = "wibblE";
        parms.arguments.resgroup = "wiBBle";
        parms.arguments.timeout = 0;

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("--timeout parameter is too small");
    });
    it("should complain if zosmf profile not found", async () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.name = "WIBBLE";
        parms.arguments.bundledir = "wibble";
        parms.arguments.cicsplex = "Wibble";
        parms.arguments.scope = "wibblE";
        parms.arguments.resgroup = "wiBBle";

        let err: Error;
        try {
          const handler = new DeployBundleHandler.default();
          const params = Object.assign({}, ...[parms]);
          await handler.process(params);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(ImperativeError);
        expect(err.message).toContain("No zosmf profile found");
    });
});
