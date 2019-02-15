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

import { Bundle } from "../../src/api/Bundle";
describe("Bundle01", () => {
    it("should read an existing bundle", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle01");

        // Check the output as JSON
        expect(JSON.stringify(bund.getManifest())).toMatch("{\"manifest\":{\"xmlns\":\"http://www.ibm.com/xmlns/prod/cics/bundle\",\"bundleVersion\":\"1\",\"bundleRelease\":\"2\",\"id\":\"ThisIsAnId\",\"bundleMajorVer\":\"10\",\"bundleMinorVer\":\"11\",\"bundleMicroVer\":\"12\",\"define\":[{\"name\":\"name1\",\"type\":\"type1\",\"path\":\"path1\"},{\"name\":\"name2\",\"type\":\"type2\",\"path\":\"path2\"},{\"name\":\"name3\",\"type\":\"http://www.ibm.com/xmlns/prod/cics/bundle/NODEJSAPP\",\"path\":\"nodejsapps/Test.nodejsapp\"}]}}");
    });
    it("set the id and version", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle01");

        // Set the Id
        bund.setId("TestExample");
        expect(bund.getId()).toMatch("TestExample");

        // Set the Version
        bund.setVersion(33, 44, 55);

        // Check the output as JSON
        expect(JSON.stringify(bund.getManifest())).toMatch("{\"manifest\":{\"xmlns\":\"http://www.ibm.com/xmlns/prod/cics/bundle\",\"bundleVersion\":\"1\",\"bundleRelease\":\"2\",\"id\":\"TestExample\",\"bundleMajorVer\":33,\"bundleMinorVer\":44,\"bundleMicroVer\":55,\"define\":[{\"name\":\"name1\",\"type\":\"type1\",\"path\":\"path1\"},{\"name\":\"name2\",\"type\":\"type2\",\"path\":\"path2\"},{\"name\":\"name3\",\"type\":\"http://www.ibm.com/xmlns/prod/cics/bundle/NODEJSAPP\",\"path\":\"nodejsapps/Test.nodejsapp\"}]}}");
    });
    it("add definitions", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle02");

        // Add a definition
        bund.addDefinition({name: "name1", type: "type1", path: "__tests__/__resources__/ExampleBundle02/Artefact1"});
        bund.addDefinition({name: "name2", type: "type2", path: "__tests__/__resources__/ExampleBundle02/Artefact2.txt"});
        bund.addDefinition({name: "name3", type: "type3", path: "__tests__/__resources__/ExampleBundle02/folder/Artefact3.jpg"});

        // Check the output as JSON
        expect(JSON.stringify(bund.getManifest())).toMatch("{\"manifest\":{\"xmlns\":\"http://www.ibm.com/xmlns/prod/cics/bundle\",\"bundleVersion\":\"1\",\"bundleRelease\":\"2\",\"id\":\"ThisIsAnId\",\"bundleMajorVer\":\"10\",\"bundleMinorVer\":\"11\",\"bundleMicroVer\":\"12\",\"define\":[{\"name\":\"name1\",\"type\":\"type1\",\"path\":\"Artefact1\"},{\"name\":\"name2\",\"type\":\"type2\",\"path\":\"Artefact2.txt\"},{\"name\":\"name3\",\"type\":\"http://www.ibm.com/xmlns/prod/cics/bundle/NODEJSAPP\",\"path\":\"nodejsapps/Test.nodejsapp\"},{\"name\":\"name3\",\"type\":\"type3\",\"path\":\"folder/Artefact3.jpg\"}]}}");
    });
    it("add a definition that references files outside of the bundle", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle02");

        // Add a definition that's out of scope
        let err: Error;
        try {
          bund.addDefinition({name: "name1", type: "type1", path: "__tests__/__resources__/ExampleBundle01/META-INF/cics.xml"});
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toContain("BundlePart \"name1\" references a file outside of the Bundle directory:");
    });
    it("add a not found definition", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle02");

        // Add a definition
        let err: Error;
        try {
          bund.addDefinition({name: "name1", type: "type1", path: "__tests__/__resources__/ExampleBundle02/Artefact3"});
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toContain("BundlePart \"name1\" references a file that does not exist:");
    });
    it("add a part with missing name", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle02");

        // Add a definition
        let err: Error;
        try {
          bund.addDefinition({name: undefined, type: "type1", path: "__tests__/__resources__/ExampleBundle02/Artefact1"});
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toMatch("BundlePart name is not set.");
    });
    it("add a part with missing type", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle02");

        // Add a definition
        let err: Error;
        try {
          bund.addDefinition({name: "name1", type: undefined, path: "__tests__/__resources__/ExampleBundle02/Artefact1"});
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toMatch("BundlePart type is not set for part \"name1\"");
    });
    it("add a part with missing path", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle02");

        // Add a definition
        let err: Error;
        try {
          bund.addDefinition({name: "name1", type: "type1", path: undefined});
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toMatch("BundlePart path is not set for part \"name1\"");
    });
    it("tolerate an existing almost empty manifest", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle03");

        // Add a definition
        bund.addDefinition({name: "name1", type: "type1", path: "__tests__/__resources__/ExampleBundle03/Artefact1"});

        // Check the output as JSON
        expect(JSON.stringify(bund.getManifest())).toMatch("{\"manifest\":{\"xmlns\":\"http://www.ibm.com/xmlns/prod/cics/bundle\",\"$t\":\"\",\"define\":[{\"name\":\"name1\",\"type\":\"type1\",\"path\":\"Artefact1\"}]}}");
    });
    it("add a NODEJSAPP", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle03");

        // Add a definition
        bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);

        // Check the manifest as JSON
        expect(JSON.stringify(bund.getManifest())).toMatch("{\"manifest\":{\"xmlns\":\"http://www.ibm.com/xmlns/prod/cics/bundle\",\"$t\":\"\",\"define\":[{\"name\":\"NodeName\",\"type\":\"http://www.ibm.com/xmlns/prod/cics/bundle/NODEJSAPP\",\"path\":\"nodejsapps/NodeName.nodejsapp\"}]}}");
        // Check the manifest as XML
        expect(bund.getManifestXML()).toMatch("<manifest xmlns=\"http://www.ibm.com/xmlns/prod/cics/bundle\"><define name=\"NodeName\" type=\"http://www.ibm.com/xmlns/prod/cics/bundle/NODEJSAPP\" path=\"nodejsapps/NodeName.nodejsapp\"></define></manifest>");
    });
});
