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

import { AutoBundler } from "../../../src/api/BundleContent/AutoBundler";
import { IHandlerParameters } from "@brightside/imperative";
import * as GenerateBundleDefinition from "../../../src/cli/generate/bundle/GenerateBundle.definition";
import * as fse from "fs-extra";


const DEFAULT_PARAMTERS: IHandlerParameters = {
    arguments: {
        $0: "bright",
        _: ["zowe-cli-cics-deploy-plugin", "generate", "bundle"],
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
    definition: GenerateBundleDefinition.GenerateBundleDefinition,
    fullDefinition: GenerateBundleDefinition.GenerateBundleDefinition,
};

describe("AutoBundler01", () => {

    beforeAll(() => {
        // Git does not commit empty dirs, so make sure they exist
        fse.ensureDir("__tests__/__resources__/EmptyBundle01");
    });

    it("should read an existing bundle", () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;

        // Create a Bundle
        const ab = new AutoBundler("__tests__/__resources__/ExampleBundle01", parms);

        // Check the output as JSON
// tslint:disable-next-line: max-line-length
        expect(JSON.stringify(ab.getBundle().getManifest())).toMatch("{\"manifest\":{\"xmlns\":\"http://www.ibm.com/xmlns/prod/cics/bundle\",\"bundleVersion\":\"1\",\"bundleRelease\":\"2\",\"id\":\"ThisIsAnId\",\"bundleMajorVer\":\"10\",\"bundleMinorVer\":\"11\",\"bundleMicroVer\":\"12\",\"define\":[{\"name\":\"name1\",\"type\":\"type1\",\"path\":\"path1\"},{\"name\":\"name2\",\"type\":\"type2\",\"path\":\"path2\"},{\"name\":\"name3\",\"type\":\"http://www.ibm.com/xmlns/prod/cics/bundle/NODEJSAPP\",\"path\":\"nodejsapps/Test.nodejsapp\"}]}}");
    });
    it("should set the bundleid", () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.bundleid = "test";

        // Create a Bundle
        const ab = new AutoBundler("__tests__/__resources__/ExampleBundle03", parms);

        // Check the output as JSON
// tslint:disable-next-line: max-line-length
        expect(JSON.stringify(ab.getBundle().getManifest())).toMatch("{\"manifest\":{\"xmlns\":\"http://www.ibm.com/xmlns/prod/cics/bundle\",\"$t\":\"\",\"id\":\"test\"}}");
    });
    it("should set the bundle version", () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.bundleversion = "3.4.5";

        // Create a Bundle
        const ab = new AutoBundler("__tests__/__resources__/ExampleBundle03", parms);

        // Check the output as JSON
        expect(JSON.stringify(ab.getBundle().getManifest())).toMatch("{\"manifest\":{\"xmlns\":\"http://www.ibm.com/xmlns/prod/cics/bundle\",\"$t\":\"\",\"bundleMajorVer\":3,\"bundleMinorVer\":4,\"bundleMicroVer\":5}}");
    });
    it("should receive default values from package.json", () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));

        // Create a Bundle
        const ab = new AutoBundler("__tests__/__resources__/ExampleBundle04", parms);

        // Check the output as JSON
        expect(JSON.stringify(ab.getBundle().getManifest())).toMatch("{\"manifest\":{\"xmlns\":\"http://www.ibm.com/xmlns/prod/cics/bundle\",\"$t\":\"\",\"id\":\"testBundleName\",\"bundleMajorVer\":1,\"bundleMinorVer\":0,\"bundleMicroVer\":0,\"define\":[{\"name\":\"testBundleName\",\"type\":\"http://www.ibm.com/xmlns/prod/cics/bundle/NODEJSAPP\",\"path\":\"nodejsapps/testBundleName.nodejsapp\"}]}}");
    });
    it("should support main script from package.json", () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));

        // Create a Bundle
        const ab = new AutoBundler("__tests__/__resources__/ExampleBundle05", parms);

        // Check the output as JSON
        expect(JSON.stringify(ab.getBundle().getManifest())).toMatch("{\"manifest\":{\"xmlns\":\"http://www.ibm.com/xmlns/prod/cics/bundle\",\"$t\":\"\",\"id\":\"testBundleName\",\"bundleMajorVer\":1,\"bundleMinorVer\":0,\"bundleMicroVer\":0,\"define\":[{\"name\":\"testBundleName\",\"type\":\"http://www.ibm.com/xmlns/prod/cics/bundle/NODEJSAPP\",\"path\":\"nodejsapps/testBundleName.nodejsapp\"}]}}");
    });
    it("should set a nodejsapp name", () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.nodejsapp = "MyExampleOverride";

        // Create a Bundle
        const ab = new AutoBundler("__tests__/__resources__/ExampleBundle04", parms);

        // Check the output as JSON
        expect(JSON.stringify(ab.getBundle().getManifest())).toMatch("{\"manifest\":{\"xmlns\":\"http://www.ibm.com/xmlns/prod/cics/bundle\",\"$t\":\"\",\"id\":\"testBundleName\",\"bundleMajorVer\":1,\"bundleMinorVer\":0,\"bundleMicroVer\":0,\"define\":[{\"name\":\"MyExampleOverride\",\"type\":\"http://www.ibm.com/xmlns/prod/cics/bundle/NODEJSAPP\",\"path\":\"nodejsapps/MyExampleOverride.nodejsapp\"}]}}");
    });
    it("should set a startscript name", () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.startscript = "wibble";

        // Read a bad manifest
        let err: Error;
        try {
          const ab = new AutoBundler("__tests__/__resources__/ExampleBundle04", parms);
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toContain("NODEJSAPP \"testBundleName\" references a file outside of the Bundle directory:");
    });
    it("should set a port number", () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.port = -27;

        // Read a bad manifest
        let err: Error;
        try {
          const ab = new AutoBundler("__tests__/__resources__/ExampleBundle04", parms);
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toMatch("Supplied Port is outside the range of 1-65535: -27");
    });
    it("should cope with an empty directory", () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;

        // Create a Bundle
        const ab = new AutoBundler("__tests__/__resources__/EmptyBundle01", parms);

        // Check the output as JSON
        expect(JSON.stringify(ab.getBundle().getManifest())).toMatch("{\"manifest\":{\"xmlns\":\"http://www.ibm.com/xmlns/prod/cics/bundle\",\"bundleVersion\":1,\"bundleRelease\":0}}");
    });
    it("should cope with an empty directory and generate a NODEJSAPP", () => {

        let parms: IHandlerParameters;
        parms = JSON.parse(JSON.stringify(DEFAULT_PARAMTERS));
        parms.arguments.port = 500;
        parms.arguments.nodejsapp = "wibble";
        parms.arguments.startscript = "__tests__/__resources__/EmptyBundle02/script.js";

        // Create a Bundle
        const ab = new AutoBundler("__tests__/__resources__/EmptyBundle02", parms);

        // Check the output as JSON
// tslint:disable-next-line: max-line-length
        expect(JSON.stringify(ab.getBundle().getManifest())).toMatch("{\"manifest\":{\"xmlns\":\"http://www.ibm.com/xmlns/prod/cics/bundle\",\"bundleVersion\":1,\"bundleRelease\":0,\"define\":[{\"name\":\"wibble\",\"type\":\"http://www.ibm.com/xmlns/prod/cics/bundle/NODEJSAPP\",\"path\":\"nodejsapps/wibble.nodejsapp\"}]}}");
    });
    it("should detect a bad package.json", () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;

        // Create a Bundle
        let err: Error;
        try {
          const ab = new AutoBundler("__tests__/__resources__/BadPackageJson", parms);
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toContain("Parsing error occurred reading package.json:");
    });
    it("should tolerate an empty package.json", () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;

        // Create a Bundle
        let err: Error;
        try {
          const ab = new AutoBundler("__tests__/__resources__/EmptyPackageJson", parms);
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toMatch("No bundleid value set");
    });
    it("should tolerate an almost empty package.json", () => {

        let parms: IHandlerParameters;
        parms = DEFAULT_PARAMTERS;

        // Create a Bundle
        let err: Error;
        try {
          const ab = new AutoBundler("__tests__/__resources__/AlmostEmptyPackageJson", parms);
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toMatch("No startscript value set for NODEJSAPP \"almostEmpty\"");
    });
});
