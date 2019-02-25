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
        const man = new Manifest("__tests__/__resources__/ExampleBundle01");

        // Check the output as JSON
// tslint:disable-next-line: max-line-length
        expect(JSON.stringify(man.getJson())).toMatch("{\"manifest\":{\"xmlns\":\"http://www.ibm.com/xmlns/prod/cics/bundle\",\"bundleVersion\":\"1\",\"bundleRelease\":\"2\",\"id\":\"ThisIsAnId\",\"bundleMajorVer\":\"10\",\"bundleMinorVer\":\"11\",\"bundleMicroVer\":\"12\",\"define\":[{\"name\":\"name1\",\"type\":\"type1\",\"path\":\"path1\"},{\"name\":\"name2\",\"type\":\"type2\",\"path\":\"path2\"},{\"name\":\"name3\",\"type\":\"http://www.ibm.com/xmlns/prod/cics/bundle/NODEJSAPP\",\"path\":\"nodejsapps/Test.nodejsapp\"}]}}");
        // Check the output as XML
        expect(man.getXML()).toMatch("<manifest xmlns=\"http://www.ibm.com/xmlns/prod/cics/bundle\" bundleVersion=\"1\" bundleRelease=\"2\" id=\"ThisIsAnId\" bundleMajorVer=\"10\" bundleMinorVer=\"11\" bundleMicroVer=\"12\"><define name=\"name1\" type=\"type1\" path=\"path1\"></define><define name=\"name2\" type=\"type2\" path=\"path2\"></define><define name=\"name3\" type=\"http://www.ibm.com/xmlns/prod/cics/bundle/NODEJSAPP\" path=\"nodejsapps/Test.nodejsapp\"></define></manifest>");
    });
    it("should create an empty manifest from empty dir", () => {

        // Create a Manifest
        const man = new Manifest("__tests__/__resources__/EmptyBundle01");

        // Check the output
        expect(JSON.stringify(man.getJson())).toMatch("{\"manifest\":{\"xmlns\":\"http://www.ibm.com/xmlns/prod/cics/bundle\",\"bundleVersion\":1,\"bundleRelease\":0}}");
    });
    it("should create an empty manifest from empty META-INF dir", () => {

        // Create a Manifest
        const man = new Manifest("__tests__/__resources__/EmptyBundle02");

        // Check the output
        expect(JSON.stringify(man.getJson())).toMatch("{\"manifest\":{\"xmlns\":\"http://www.ibm.com/xmlns/prod/cics/bundle\",\"bundleVersion\":1,\"bundleRelease\":0}}");
    });
    it("set the bundleId", () => {

        // Create a Manifest
        const man = new Manifest("__tests__/__resources__/ExampleBundle01");

        // Set a bundleId
        man.setBundleId("testing a BundleId");

        // Check the output as JSON
        expect(JSON.stringify(man.getJson())).toMatch("{\"manifest\":{\"xmlns\":\"http://www.ibm.com/xmlns/prod/cics/bundle\",\"bundleVersion\":\"1\",\"bundleRelease\":\"2\",\"id\":\"testingXaXBundleId\",\"bundleMajorVer\":\"10\",\"bundleMinorVer\":\"11\",\"bundleMicroVer\":\"12\",\"define\":[{\"name\":\"name1\",\"type\":\"type1\",\"path\":\"path1\"},{\"name\":\"name2\",\"type\":\"type2\",\"path\":\"path2\"},{\"name\":\"name3\",\"type\":\"http://www.ibm.com/xmlns/prod/cics/bundle/NODEJSAPP\",\"path\":\"nodejsapps/Test.nodejsapp\"}]}}");
        expect(man.getBundleId()).toMatch("testingXaXBundleId");
    });
    it("set a long  bundleId", () => {

        // Create a Manifest
        const man = new Manifest("__tests__/__resources__/ExampleBundle01");

        // Set a bundleId
        man.setBundleId("1234567890123456789012345678901234567890123456789012345678901234567890");

        // Check the output as JSON
        expect(JSON.stringify(man.getJson())).toMatch("{\"manifest\":{\"xmlns\":\"http://www.ibm.com/xmlns/prod/cics/bundle\",\"bundleVersion\":\"1\",\"bundleRelease\":\"2\",\"id\":\"1234567890123456789012345678901234567890123456789012345678901234\",\"bundleMajorVer\":\"10\",\"bundleMinorVer\":\"11\",\"bundleMicroVer\":\"12\",\"define\":[{\"name\":\"name1\",\"type\":\"type1\",\"path\":\"path1\"},{\"name\":\"name2\",\"type\":\"type2\",\"path\":\"path2\"},{\"name\":\"name3\",\"type\":\"http://www.ibm.com/xmlns/prod/cics/bundle/NODEJSAPP\",\"path\":\"nodejsapps/Test.nodejsapp\"}]}}");
        expect(man.getBundleId()).toMatch("1234567890123456789012345678901234567890123456789012345678901234");
    });
    it("set a null bundleId", () => {

        // Create a Manifest
        const man = new Manifest("__tests__/__resources__/ExampleBundle01");

        // Add a definition
        let err: Error;
        try {
          man.setBundleId(undefined);
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toMatch("BundleId not set.");
    });
    it("set a valid version number", () => {

        // Create a Manifest
        const man = new Manifest("__tests__/__resources__/ExampleBundle01");

        // Set a bundleId
        man.setBundleVersion(1, 2, 3);

        // Check the output as JSON
        expect(JSON.stringify(man.getJson())).toMatch("{\"manifest\":{\"xmlns\":\"http://www.ibm.com/xmlns/prod/cics/bundle\",\"bundleVersion\":\"1\",\"bundleRelease\":\"2\",\"id\":\"ThisIsAnId\",\"bundleMajorVer\":1,\"bundleMinorVer\":2,\"bundleMicroVer\":3,\"define\":[{\"name\":\"name1\",\"type\":\"type1\",\"path\":\"path1\"},{\"name\":\"name2\",\"type\":\"type2\",\"path\":\"path2\"},{\"name\":\"name3\",\"type\":\"http://www.ibm.com/xmlns/prod/cics/bundle/NODEJSAPP\",\"path\":\"nodejsapps/Test.nodejsapp\"}]}}");
    });
    it("set an invalid version number", () => {

        // Create a Manifest
        const man = new Manifest("__tests__/__resources__/EmptyBundle01");

        let err: Error;
        try {
          // Set a bundleId
          man.setBundleVersion(-1, 2.4, 3.0);
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toContain("Invalid Bundle version specified.");
    });
    it("set a null version number", () => {

        // Create a Manifest
        const man = new Manifest("__tests__/__resources__/EmptyBundle01");

        let err: Error;
        try {
          // Set a bundleId
          man.setBundleVersion(undefined, undefined, undefined);
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toContain("Invalid Bundle version specified.");
    });
    it("Parse a garbage manifest", () => {

        // Read a bad manifest
        let err: Error;
        try {
          const man = new Manifest("__tests__/__resources__/BadManifestBundle01");
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toContain("Existing CICS Manifest file found with unparsable content.");
    });
    it("Parse a manifest with bad namespace", () => {

        // Read a bad manifest
        let err: Error;
        try {
          const man = new Manifest("__tests__/__resources__/BadManifestBundle02");
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
          const man = new Manifest("__tests__/__resources__/BadManifestBundle03");
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toContain("Existing CICS Manifest file found with unparsable content.");
    });
});
