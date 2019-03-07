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
import { IHandlerParameters } from "@brightside/imperative";
import * as DeployBundleDefinition from "../../../src/cli/deploy/bundle/DeployBundle.definition";
import * as fse from "fs-extra";


const DEFAULT_PARAMTERS: IHandlerParameters = {
    arguments: {
        $0: "bright",
        _: ["zowe-cli-cics-deploy-plugin", "deploy", "bundle"],
        jobcard: "//DFHDPLOY JOB DFHDPLOY,CLASS=A,MSGCLASS=X,TIME=NOLIMIT"
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

describe("BundleDeployer01", () => {

    it("should generate deploy JCL for csdgroup", () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.csdgroup = "12345678";

        // Create a Bundle
        const bd = new BundleDeployer(parms);

        // Check the output as JSON
        expect(bd.getDeployJCL()).toMatchSnapshot();
    });
    it("should generate deploy JCL for csdgroup with timeout", () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.csdgroup = "12345678";
        parms.arguments.timeout = 1500;

        // Create a Bundle
        const bd = new BundleDeployer(parms);

        // Check the output as JSON
        expect(bd.getDeployJCL()).toMatchSnapshot();
    });
    it("should generate deploy JCL for resgroup", () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.resgroup = "12345678";

        // Create a Bundle
        const bd = new BundleDeployer(parms);

        // Check the output as JSON
        expect(bd.getDeployJCL()).toMatchSnapshot();
    });
    it("should generate deploy JCL for resgroup with timeout", () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.resgroup = "12345678";
        parms.arguments.timeout = 1500;

        // Create a Bundle
        const bd = new BundleDeployer(parms);

        // Check the output as JSON
        expect(bd.getDeployJCL()).toMatchSnapshot();
    });
    it("should support long bundledir", () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.resgroup = "12345678";
        parms.arguments.bundledir = "12345678901234567890123456789012345678901234567890" +
                                    "12345678901234567890123456789012345678901234567890" +
                                    "12345678901234567890123456789012345678901234567890" +
                                    "12345678901234567890123456789012345678901234567890" +
                                    "1234567890123456789012345678901234567890123456789012345";

        // Create a Bundle
        const bd = new BundleDeployer(parms);

        // Check the output as JSON
        expect(bd.getDeployJCL()).toMatchSnapshot();
    });
    it("should generate undeploy JCL for csdgroup", () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.csdgroup = "12345678";

        // Create a Bundle
        const bd = new BundleDeployer(parms);

        // Check the output as JSON
        expect(bd.getUndeployJCL()).toMatchSnapshot();
    });
    it("should generate undeploy JCL for csdgroup with timeout", () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.csdgroup = "12345678";
        parms.arguments.timeout = 1500;

        // Create a Bundle
        const bd = new BundleDeployer(parms);

        // Check the output as JSON
        expect(bd.getUndeployJCL()).toMatchSnapshot();
    });
    it("should generate undeploy JCL for resgroup", () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.resgroup = "12345678";

        // Create a Bundle
        const bd = new BundleDeployer(parms);

        // Check the output as JSON
        expect(bd.getUndeployJCL()).toMatchSnapshot();
    });
    it("should generate undeploy JCL for resgroup with timeout", () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;
        setCommonParmsForDeployTests(parms);
        parms.arguments.resgroup = "12345678";
        parms.arguments.timeout = 1500;

        // Create a Bundle
        const bd = new BundleDeployer(parms);

        // Check the output as JSON
        expect(bd.getUndeployJCL()).toMatchSnapshot();
    });
});

function setCommonParmsForDeployTests(parms: IHandlerParameters) {
  parms.arguments.cicshlq = "12345678901234567890123456789012345";
  parms.arguments.cicsplex = "12345678";
  parms.arguments.scope = "12345678";
  parms.arguments.csdgroup = undefined;
  parms.arguments.resgroup = undefined;
  parms.arguments.timeout = undefined;
  parms.arguments.name = "12345678";
  parms.arguments.bundledir = "1234567890";
}

