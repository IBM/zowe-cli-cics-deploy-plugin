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


const DEFAULT_PARAMETERS: IHandlerParameters = {
    arguments: {
        $0: "bright",
        _: ["zowe-cli-cics-deploy-plugin", "generate", "bundle"],
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
                expect("" + setMsgArgs).toMatch("NO MESSAGE IS EXPECTED");
            }),
            setObj: jest.fn((setObjArgs) => {
                expect(setObjArgs).toMatch("NO OBJECT IS EXPECTED");
            })
        },
        console: {
            log: jest.fn((logs) => {
                expect("" + logs).toMatch("NO LOGS ARE EXPECTED");
            }),
            error: jest.fn((errors) => {
                expect("" + errors).toMatch("NO ERRORS ARE EXPECTED");
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

    it("should read an existing bundle", async () => {

        const parms: IHandlerParameters = DEFAULT_PARAMETERS;
        setCommonParmsForAutoBundleTests(parms);

        await runAutoBundle(parms, "__tests__/__resources__/ExampleBundle01");
    });
    it("should not merge an existing bundle", async () => {

        const parms: IHandlerParameters = DEFAULT_PARAMETERS;
        setCommonParmsForAutoBundleTests(parms);
        parms.arguments.merge = false;

        await runAutoBundle(parms, "__tests__/__resources__/ExampleBundle01");
    });
    it("should set the bundleid", async () => {

        const parms: IHandlerParameters = DEFAULT_PARAMETERS;
        setCommonParmsForAutoBundleTests(parms);
        parms.arguments.bundleid = "test";

        await runAutoBundle(parms, "__tests__/__resources__/ExampleBundle03");
    });
    it("should set the bundle version", async () => {

        const parms: IHandlerParameters = DEFAULT_PARAMETERS;
        setCommonParmsForAutoBundleTests(parms);
        parms.arguments.bundleversion = "3.4.5";

        await runAutoBundle(parms, "__tests__/__resources__/ExampleBundle03");
    });
    it("should receive default values from package.json", async () => {

        const parms: IHandlerParameters = DEFAULT_PARAMETERS;
        setCommonParmsForAutoBundleTests(parms);

        await runAutoBundle(parms, "__tests__/__resources__/ExampleBundle04");
    });
    it("should support main script from package.json", async () => {

        const parms: IHandlerParameters = DEFAULT_PARAMETERS;
        setCommonParmsForAutoBundleTests(parms);

        await runAutoBundle(parms, "__tests__/__resources__/ExampleBundle05");
    });
    it("should set a nodejsapp name", async () => {

        const parms: IHandlerParameters = DEFAULT_PARAMETERS;
        setCommonParmsForAutoBundleTests(parms);
        parms.arguments.nodejsapp = "MyExampleOverride";

        await runAutoBundle(parms, "__tests__/__resources__/ExampleBundle04");
    });
    it("should set a startscript name", async () => {

        const parms: IHandlerParameters = DEFAULT_PARAMETERS;
        setCommonParmsForAutoBundleTests(parms);
        parms.arguments.nodejsapp = "MyExampleOverride";
        parms.arguments.startscript = "wibble";

        let err: Error;
        try {
          const ab = new AutoBundler("__tests__/__resources__/ExampleBundle01", parms);
        } catch (e) {
          err = e;
        }

        expect(err).toBeDefined();
        expect(err.message).toContain("NODEJSAPP \"MyExampleOverride\" references a file outside of the Bundle directory:");
        expect(err.message).toContain("wibble");
    });
    it("should set a port number", async () => {

        const parms: IHandlerParameters = DEFAULT_PARAMETERS;
        setCommonParmsForAutoBundleTests(parms);
        parms.arguments.port = -27;

        await runAutoBundleWithError(parms, "__tests__/__resources__/ExampleBundle04");
    });
    it("should cope with an empty directory", async () => {

        const parms: IHandlerParameters = DEFAULT_PARAMETERS;
        setCommonParmsForAutoBundleTests(parms);

        await runAutoBundle(parms, "__tests__/__resources__/EmptyBundle01");
    });
    it("should cope with an empty directory and generate a NODEJSAPP", async () => {

        const parms: IHandlerParameters = DEFAULT_PARAMETERS;
        setCommonParmsForAutoBundleTests(parms);
        parms.arguments.port = 500;
        parms.arguments.nodejsapp = "wibble";
        parms.arguments.startscript = "__tests__/__resources__/EmptyBundle02/script.js";

        await runAutoBundle(parms, "__tests__/__resources__/EmptyBundle02");
    });
    it("should detect a bad package.json", async () => {
        const parms: IHandlerParameters = DEFAULT_PARAMETERS;
        setCommonParmsForAutoBundleTests(parms);
        await runAutoBundleWithError(parms, "__tests__/__resources__/BadPackageJson");
    });
    it("should tolerate an empty package.json", async () => {
        const parms: IHandlerParameters = DEFAULT_PARAMETERS;
        setCommonParmsForAutoBundleTests(parms);
        await runAutoBundleWithError(parms, "__tests__/__resources__/EmptyPackageJson");
    });
    it("should tolerate an almost empty package.json", async () => {
        const parms: IHandlerParameters = DEFAULT_PARAMETERS;
        setCommonParmsForAutoBundleTests(parms);
        await runAutoBundleWithError(parms, "__tests__/__resources__/AlmostEmptyPackageJson");
    });
    it("should detect --merge without --overwrite", async () => {
        const parms: IHandlerParameters = DEFAULT_PARAMETERS;
        setCommonParmsForAutoBundleTests(parms);
        parms.arguments.overwrite = false;
        await runAutoBundleWithError(parms, "__tests__/__resources__/AlmostEmptyPackageJson");
    });
});

function setCommonParmsForAutoBundleTests(parms: IHandlerParameters) {
  parms.arguments.merge = true;
  parms.arguments.overwrite = true;
  parms.arguments.port = undefined;
  parms.arguments.nodejsapp = undefined;
  parms.arguments.startscript = undefined;
  parms.arguments.bundleid = undefined;
  parms.arguments.bundleversion = undefined;
}

async function runAutoBundleWithError(parms: IHandlerParameters, dir: string) {

  let err: Error;
  try {
    const ab = new AutoBundler(dir, parms);
  } catch (e) {
    err = e;
  }

  expect(err).toBeDefined();
  expect(err.message).toMatchSnapshot();
}

async function runAutoBundle(parms: IHandlerParameters, dir: string) {

  const ab = new AutoBundler(dir, parms);

  expect(JSON.stringify(ab.getBundle().getManifest())).toMatchSnapshot();
}
