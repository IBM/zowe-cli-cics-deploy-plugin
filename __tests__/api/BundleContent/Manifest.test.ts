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

import { Manifest } from "../../../src/api/BundleContent/Manifest";
describe("Manifest01", () => {
    it("should read an existing manifest", () => {

        // Create a Manifest
        const man = new Manifest("__tests__/__resources__/ExampleBundle01", true, true);

        // Check the output as JSON
        expect(JSON.stringify(man.getJson())).toMatchSnapshot();
        // Check the output as XML
        expect(man.getXML()).toMatchSnapshot();
    });
    it("should create an empty manifest from empty dir", () => {

        // Create a Manifest
        const man = new Manifest("__tests__/__resources__/EmptyBundle01", true, true);

        // Check the output
        expect(JSON.stringify(man.getJson())).toMatchSnapshot();
    });
    it("should create an empty manifest from empty META-INF dir", () => {

        // Create a Manifest
        const man = new Manifest("__tests__/__resources__/EmptyBundle02", true, true);

        // Check the output
        expect(JSON.stringify(man.getJson())).toMatchSnapshot();
    });
    it("set the bundleId", () => {

        // Create a Manifest
        const man = new Manifest("__tests__/__resources__/ExampleBundle01", true, true);

        // Set a bundleId
        man.setBundleId("testing a BundleId");

        // Check the output as JSON
        expect(JSON.stringify(man.getJson())).toMatchSnapshot();
        expect(man.getBundleId()).toMatchSnapshot();
    });
    it("set a long  bundleId", () => {

        // Create a Manifest
        const man = new Manifest("__tests__/__resources__/ExampleBundle01", true, true);

        // Set a bundleId
        man.setBundleId("1234567890123456789012345678901234567890123456789012345678901234567890");

        // Check the output as JSON
        expect(JSON.stringify(man.getJson())).toMatchSnapshot();
        expect(man.getBundleId()).toMatchSnapshot();
    });
    it("set a null bundleId", () => {

        // Create a Manifest
        const man = new Manifest("__tests__/__resources__/ExampleBundle01", true, true);

        // Add a definition
        let err: Error;
        try {
          man.setBundleId(undefined);
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toMatchSnapshot();
    });
    it("set a valid version number", () => {

        // Create a Manifest
        const man = new Manifest("__tests__/__resources__/ExampleBundle01", true, true);

        // Set a bundleId
        man.setBundleVersion(1, 2, 3);

        // Check the output as JSON
        expect(JSON.stringify(man.getJson())).toMatchSnapshot();
    });
    it("set an invalid major version number", () => {

        // Create a Manifest
        const man = new Manifest("__tests__/__resources__/EmptyBundle01", true, true);

        let err: Error;
        try {
          // Set a bundleId
          man.setBundleVersion(-1, 0, 0);
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toMatchSnapshot();
    });
    it("set an invalid minor version number", () => {

        // Create a Manifest
        const man = new Manifest("__tests__/__resources__/EmptyBundle01", true, true);

        let err: Error;
        try {
          // Set a bundleId
          man.setBundleVersion(1, 3.4, 0);
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toMatchSnapshot();
    });
    it("set an invalid micro version number", () => {

        // Create a Manifest
        const man = new Manifest("__tests__/__resources__/EmptyBundle01", true, true);

        let err: Error;
        try {
          // Set a bundleId
          man.setBundleVersion(1, 3, 4.3);
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toMatchSnapshot();
    });
    it("set a null version number", () => {

        // Create a Manifest
        const man = new Manifest("__tests__/__resources__/EmptyBundle01", true, true);

        let err: Error;
        try {
          // Set a bundleId
          man.setBundleVersion(undefined, undefined, undefined);
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toMatchSnapshot();
    });
    it("Parse a garbage manifest", () => {

        // Read a bad manifest
        let err: Error;
        try {
          const man = new Manifest("__tests__/__resources__/BadManifestBundle01", true, true);
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toContain("Existing CICS Manifest file found with unparsable content:");
    });
    it("Parse a manifest with bad namespace", () => {

        // Read a bad manifest
        let err: Error;
        try {
          const man = new Manifest("__tests__/__resources__/BadManifestBundle02", true, true);
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toContain("Existing CICS Manifest file found with unexpected namespace: wibble .");
    });
    it("Parse a malformed manifest", () => {

        // Read a bad manifest
        let err: Error;
        try {
          const man = new Manifest("__tests__/__resources__/BadManifestBundle03", true, true);
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toContain("Existing CICS Manifest file found with unparsable content:");
    });
});
