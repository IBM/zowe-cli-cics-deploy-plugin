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

import * as fse from "fs-extra";
import * as path from "path";
import {runCliScript} from "../../../__src__/TestUtils";
import {ITestEnvironment} from "../../../__src__/environment/doc/response/ITestEnvironment";
import {TestEnvironment} from "../../../__src__/environment/TestEnvironment";

// Test environment will be populated in the "beforeAll"
let TEST_ENVIRONMENT: ITestEnvironment;
let TEST_APPS_DIR: string;
let SIMPLE_TEST_APP: string;

describe("cics-deploy generate bundle", () => {

    // Create the unique test environment
    beforeAll(async () => {
        TEST_ENVIRONMENT = await TestEnvironment.setUp({
            testName: "generate_bundle_command",
            installPlugin: true,
            tempProfileTypes: ["zosmf"]
        });
        TEST_APPS_DIR = path.join(TEST_ENVIRONMENT.workingDir, "apps");
        SIMPLE_TEST_APP = path.join(TEST_APPS_DIR, "simple-node-app");
    });

    afterAll(async () => {
        await TestEnvironment.cleanUp(TEST_ENVIRONMENT);
    });

    beforeEach(() => {
        if (fse.existsSync(TEST_APPS_DIR)) {
            fse.removeSync(TEST_APPS_DIR);
        }
        fse.mkdirSync(TEST_APPS_DIR);
        fse.copySync(__dirname + "../../../../__resources__/apps", TEST_APPS_DIR);
    });

    it("should generate bundle metadata in the working directory", async () => {
        const response = await runCliScript(__dirname + "/__scripts__/generate_bundle.sh", TEST_ENVIRONMENT, [SIMPLE_TEST_APP]);

        expect(response.stderr.toString()).toBe("");
        expect(response.status).toBe(0);
        expectFileExistsContaining(path.join(SIMPLE_TEST_APP, "META-INF", "cics.xml"),
                                         "name=\"cics-nodejs-invoke\"");

        expectFileExistsContaining(path.join(SIMPLE_TEST_APP, "nodejsapps", "cics-nodejs-invoke.nodejsapp"),
                                        "startscript=\"server.js\"");
    });
    describe.skip("permissions tests", () => {
        it("should error nicely if it can't read the working directory", async () => {
            fse.chmodSync(SIMPLE_TEST_APP, "300");
            const response = await runCliScript(__dirname + "/__scripts__/generate_bundle.sh", TEST_ENVIRONMENT, [SIMPLE_TEST_APP]);

            expect(response.status).toBeGreaterThan(0);
        });
        it("should error nicely if it can't write to the working directory", async () => {
            fse.chmodSync(SIMPLE_TEST_APP, "500");
            const response = await runCliScript(__dirname + "/__scripts__/generate_bundle.sh", TEST_ENVIRONMENT, [SIMPLE_TEST_APP]);

            expect(response.status).toBeGreaterThan(0);
        });

        afterEach(() => {
            fse.chmodSync(SIMPLE_TEST_APP, "700");
        });
    });
});

function expectFileExistsContaining(filePath: string, searchString: string) {
    expect(fse.pathExistsSync(filePath));
    const contents = fse.readFileSync(filePath).toString();
    expect(contents).toMatch(searchString);
}

