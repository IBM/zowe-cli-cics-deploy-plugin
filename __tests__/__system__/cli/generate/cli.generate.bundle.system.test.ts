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
let NO_PACKAGE_JSON_APP: string;


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
        NO_PACKAGE_JSON_APP = path.join(TEST_APPS_DIR, "no-package-json");
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

    it("should generate a bundle using defaults from package.json", async () => {
        await testBundleGenerateWorks([]);
        expectFileToMatchSnapshot(path.join(SIMPLE_TEST_APP, "nodejsapps", "cics-nodejs-invoke.profile"));
    });

    it("should generate an empty bundle if no package.json present", async () => {
        const response = await runCliScript(__dirname + "/__scripts__/generate_bundle.sh", TEST_ENVIRONMENT, [NO_PACKAGE_JSON_APP]);

        expect(response.stderr.toString()).toBe("");
        expect(response.status).toBe(0);
        expectFileToMatchSnapshot(path.join(NO_PACKAGE_JSON_APP, "META-INF", "cics.xml"));
        expect(fse.existsSync(path.join(NO_PACKAGE_JSON_APP, "nodejsapps"))).toBeFalsy();
    });

    describe("paramters", async () => {
        // Issue #15
        it.skip("should customise bundle ID according to command line args", async () => {
            await testBundleGenerateWorks(["--bundleid", "myNodeBundle"]);
        });
        it("should customise bundle version according to command line args", async () => {
            await testBundleGenerateWorks(["--bundleversion", "2.1.5"]);
        });
        it("should customise NODEJSAPP name according to command line args", async () => {
            await testBundleGenerateWorks(["--nodejsapp", "myapp"], "myapp");
        });
        it("should customise NODEJSAPP name and bundle ID independently", async () => {
            await testBundleGenerateWorks(["--bundleid", "mybundle", "--nodejsapp", "myapp"], "myapp");
        });
        it("should customise startscript according to args", async () => {
            await testBundleGenerateWorks(["--startscript", "other.js"], "cics-nodejs-invoke");
        });

        it("should customise port in generated profile accord to args", async () => {
            await testBundleGenerateWorks(["--port", "12345"]);
            expectFileToMatchSnapshot(path.join(SIMPLE_TEST_APP, "nodejsapps", "cics-nodejs-invoke.profile"));
        });

        it("should generate a bundle using values supplied when there's no package.json", async () => {
            await testBundleGenerateWorks(["--bundleid", "mybundle", "--nodejsapp", "myapp", "--startscript", "server.js"], "myapp", NO_PACKAGE_JSON_APP);
        });

        // Issue #12
        it.skip("should return an error if invalid bundle version is supplied", async () => {
            await expectError(SIMPLE_TEST_APP, ["--bundleversion", "foo.bar.baz"]);
        });

        // Issue #13
        it.skip("should mangle NODEJSAPP name supplied on command line", async () => {
            await testBundleGenerateWorks(["--nodejsapp", "foo%€@"], "fooXXX");
        });

        // Issue #15
        it.skip("should mangle bundle ID supplied on command line", async () => {
            await testBundleGenerateWorks(["--bundleid", "foo%€@"]);
        });
    });

    describe("package.json variations", async () => {
        it("should mangle name supplied in package.json", async () => {
            await testBundleGenerateWorks([], "thisisareallylongnamethatwillnee", path.join(TEST_APPS_DIR, "long-name"));
        });

        it("should error nicely if package.json is malformed", async () => {
            const appPath = path.join(TEST_APPS_DIR, "bad-package-json");
            await expectError(appPath);
        });

        it("should error nicely if package.json is empty", async () => {
            const appPath = path.join(TEST_APPS_DIR, "empty-package-json");
            await expectError(appPath);
        });

        it("should error nicely if package.json doesn't have start script or main", async () => {
            const appPath = path.join(TEST_APPS_DIR, "minimal-package-json");
            await expectError(appPath);
        });
    });
});

async function expectError(appPath: string, options: string[] = []) {
    const response = await runCliScript(__dirname + "/__scripts__/generate_bundle.sh", TEST_ENVIRONMENT, [appPath].concat(options));
    expect(fse.existsSync(path.join(appPath, "nodejsapps"))).toBeFalsy();
    expect(response.stdout.toString()).toBe("");
    expect(response.stderr.toString()).not.toBe("");
    expect(response.stderr.toString()).toBe("foo");
    // TODO - reinstate this when Issue #5 is fixed
    // expect(response.status).toBeGreaterThan(0);
}

async function testBundleGenerateWorks(args: string[], nodejsappName = "cics-nodejs-invoke", appPath = SIMPLE_TEST_APP) {
    const response = await runCliScript(__dirname + "/__scripts__/generate_bundle.sh", TEST_ENVIRONMENT, [appPath].concat(args));
    expect(response.stderr.toString()).toBe("");
    expect(response.status).toBe(0);
    expectFileToMatchSnapshot(path.join(appPath, "META-INF", "cics.xml"));
    expectFileToMatchSnapshot(path.join(appPath, "nodejsapps", nodejsappName + ".nodejsapp"));
}

function expectFileToMatchSnapshot(filePath: string) {
    const contents = fse.readFileSync(filePath).toString();
    expect(contents).toMatchSnapshot();
}

