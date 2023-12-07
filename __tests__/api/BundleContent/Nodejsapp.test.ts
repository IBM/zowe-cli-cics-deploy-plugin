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

import { NodejsappBundlePart } from "../../../src/api/BundleContent/NodejsappBundlePart";
describe("NodejsappBundlePart01", () => {
    it("Create a NodejsappBundlePart", () => {

        // Create a Nodejsapp
        const njs = new NodejsappBundlePart("__tests__/__resources__/ExampleBundle03", "NodeName",
        // eslint-disable-next-line no-magic-numbers
            "__tests__/__resources__/ExampleBundle03/Artefact1", 1000, false);

        expect(JSON.stringify(njs.getPart())).toMatchSnapshot();
        expect(njs.getPartXML()).toMatchSnapshot();
        expect(njs.getProfile()).toMatchSnapshot();
        expect(njs.getProfile()).toMatchSnapshot();
    });
    it("Create a NodejsappBundlePart with bad chars", () => {

        // Create a Nodejsapp
        const njs = new NodejsappBundlePart("__tests__/__resources__/ExampleBundle03", "NodeName is invalid!!!",
        // eslint-disable-next-line no-magic-numbers
            "__tests__/__resources__/ExampleBundle03/Artefact1", 1000, false);

        expect(JSON.stringify(njs.getPart())).toMatchSnapshot();
        expect(njs.getPartXML()).toMatchSnapshot();
        expect(njs.getProfile()).toMatchSnapshot();
        expect(njs.getProfile()).toMatchSnapshot();
    });
    it("Create a NodejsappBundlePart with long name", () => {

        // Create a Nodejsapp
        const njs = new NodejsappBundlePart("__tests__/__resources__/ExampleBundle03", "123456789012345678901234567890123",
        // eslint-disable-next-line no-magic-numbers
            "__tests__/__resources__/ExampleBundle03/Artefact1", 1000, false);

        expect(JSON.stringify(njs.getPart())).toMatchSnapshot();
        expect(njs.getPartXML()).toMatchSnapshot();
        expect(njs.getProfile()).toMatchSnapshot();
        expect(njs.getProfile()).toMatchSnapshot();
    });
    it("Create a NodejsappBundlePart with missing name parameter", () => {

        let err: Error;
        try {
            // eslint-disable-next-line no-magic-numbers
            const njs = new NodejsappBundlePart("__tests__/__resources__/ExampleBundle03", undefined, "", 1000, false);
        }
        catch (error) {
            err = error;
        }

        // Check the output as JSON
        expect(err.message).toMatch("NODEJSAPP name is not set.");
    });
    it("Create a NodejsappBundlePart with missing startscript", () => {

        let err: Error;
        try {
            const njs = new NodejsappBundlePart("__tests__/__resources__/ExampleBundle03", "test",
            // eslint-disable-next-line no-magic-numbers
                "__tests__/__resources__/ExampleBundle03/Artefact2", 1000, false);
        }
        catch (error) {
            err = error;
        }

        // Check the output as JSON
        expect(err.message).toContain("NODEJSAPP \"test\" references a file that does not exist");
    });
    it("Create a NodejsappBundlePart with missing startscript parameter", () => {

        let err: Error;
        try {
            // eslint-disable-next-line no-magic-numbers
            const njs = new NodejsappBundlePart("__tests__/__resources__/ExampleBundle03", "test", undefined, 1000, false);
        }
        catch (error) {
            err = error;
        }

        // Check the output as JSON
        expect(err.message).toContain("No startscript value set for NODEJSAPP \"test\"");
    });
    it("Create a NodejsappBundlePart with negative port number", () => {

        let err: Error;
        try {
            const njs = new NodejsappBundlePart("__tests__/__resources__/ExampleBundle03", "test",
                "__tests__/__resources__/ExampleBundle03/Artefact1", -1, false);
        }
        catch (error) {
            err = error;
        }

        // Check the output as JSON
        expect(err.message).toContain("Supplied Port is outside the range of 1-65535: -1");
    });
    it("Create a NodejsappBundlePart with fractional port number", () => {

        let err: Error;
        try {
            const njs = new NodejsappBundlePart("__tests__/__resources__/ExampleBundle03", "test",
            // eslint-disable-next-line no-magic-numbers
                "__tests__/__resources__/ExampleBundle03/Artefact1", 1000.1, false);
        }
        catch (error) {
            err = error;
        }

        // Check the output as JSON
        // eslint-disable-next-line no-magic-numbers
        expect(err.message).toContain("Supplied Port is not an integer: 1000.1");
    });
    it("Create a NodejsappBundlePart with missing port number", () => {

        // Create a Nodejsapp
        const njs = new NodejsappBundlePart("__tests__/__resources__/ExampleBundle03", "NodeName",
            "__tests__/__resources__/ExampleBundle03/Artefact1", undefined, false);

        // Check the bundle part as JSON
        expect(JSON.stringify(njs.getPart())).toMatchSnapshot();
        expect(njs.getPartXML()).toMatchSnapshot();
        expect(njs.getProfile()).toMatchSnapshot();
        expect(njs.getProfile()).toMatchSnapshot();
    });
    it("Create a NodejsappBundlePart with missing name", () => {

        let err: Error;
        try {
            const njs = new NodejsappBundlePart("__tests__/__resources__/ExampleBundle03", undefined,
            // eslint-disable-next-line no-magic-numbers
                "__tests__/__resources__/ExampleBundle03/Artefact1", 1000, false);
        }
        catch (error) {
            err = error;
        }

        // Check the output as JSON
        expect(err.message).toContain("NODEJSAPP name is not set.");
    });
});
