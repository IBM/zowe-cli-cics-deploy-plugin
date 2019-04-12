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

import { Bundle } from "../../../src/api/BundleContent/Bundle";
import * as fs from "fs";

describe("Bundle01", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it("should read an existing bundle", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle01", true, true);

        // Check the output as JSON
        expect(JSON.stringify(bund.getManifest())).toMatchSnapshot();
    });
    it("set the id and version", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle01", true, true);

        // Set the Id
        bund.setId("TestExample");
        expect(bund.getId()).toMatch("TestExample");

        // Set the Version
        bund.setVersion(33, 44, 55);

        // Check the output as JSON
        expect(JSON.stringify(bund.getManifest())).toMatchSnapshot();
    });
    it("add definitions", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle02", true, true);

        // Add a definition
        bund.addDefinition({name: "name1", type: "type1", path: "__tests__/__resources__/ExampleBundle02/Artefact1"});
        bund.addDefinition({name: "name2", type: "type2", path: "__tests__/__resources__/ExampleBundle02/Artefact2.txt"});
        bund.addDefinition({name: "name3", type: "type3", path: "__tests__/__resources__/ExampleBundle02/folder/Artefact3.jpg"});

        // Check the output as JSON
        expect(JSON.stringify(bund.getManifest())).toMatchSnapshot();
    });
    it("add a definition that references files outside of the bundle", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle02", true, true);

        // Add a definition that's out of scope
        let err: Error;
        try {
          bund.addDefinition({name: "name1", type: "type1", path: "__tests__/__resources__/ExampleBundle01/META-INF/cics.xml"});
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err).toBeDefined();
        expect(err.message).toContain("BundlePart \"name1\" references a file outside of the Bundle directory:");
        expect(err.message).toContain("cics.xml");
    });
    it("add a not found definition", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle02", true, true);

        // Add a definition
        let err: Error;
        try {
          bund.addDefinition({name: "name1", type: "type1", path: "__tests__/__resources__/ExampleBundle02/Artefact3"});
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err).toBeDefined();
        expect(err.message).toContain("BundlePart \"name1\" references a file that does not exist:");
        expect(err.message).toContain("Artefact3");
    });
    it("add a part with missing name", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle02", true, true);

        // Add a definition
        let err: Error;
        try {
          bund.addDefinition({name: undefined, type: "type1", path: "__tests__/__resources__/ExampleBundle02/Artefact1"});
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toMatchSnapshot();
    });
    it("add a part with missing type", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle02", true, true);

        // Add a definition
        let err: Error;
        try {
          bund.addDefinition({name: "name1", type: undefined, path: "__tests__/__resources__/ExampleBundle02/Artefact1"});
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toMatchSnapshot();
    });
    it("add a part with missing path", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle02", true, true);

        // Add a definition
        let err: Error;
        try {
          bund.addDefinition({name: "name1", type: "type1", path: undefined});
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toMatchSnapshot();
    });
    it("tolerate an existing almost empty manifest", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle03", true, true);

        // Add a definition
        bund.addDefinition({name: "name1", type: "type1", path: "__tests__/__resources__/ExampleBundle03/Artefact1"});

        // Check the output as JSON
        expect(JSON.stringify(bund.getManifest())).toMatchSnapshot();
    });
    it("should be able to add a resource to a single item manifest", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle06", true, true);

        // Add a definition
        bund.addDefinition({name: "item2", type: "type2", path: "__tests__/__resources__/ExampleBundle06/Artefact1"});

        // Check the output as JSON
        expect(JSON.stringify(bund.getManifest())).toMatchSnapshot();
    });
    it("add a NODEJSAPP", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle03", true, true);

        // Add a definition
        bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);

        // Check the manifest as JSON
        expect(JSON.stringify(bund.getManifest())).toMatchSnapshot();
        // Check the manifest as XML
        expect(bund.getManifestXML()).toMatchSnapshot();
    });
    it("should warn that an existing bundle cant be overwritten", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle01", false, false);

        let err: Error;
        try {
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err.message).toMatchSnapshot();
    });
    it("should be able to save new definitions", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle02", true, true);

        // Add a definition
        bund.addDefinition({name: "name1", type: "type1", path: "__tests__/__resources__/ExampleBundle02/Artefact1"});
        bund.prepareForSave();

        // Check the output as JSON
        expect(JSON.stringify(bund.getManifest())).toMatchSnapshot();
    });
    it("should find a directory within the Bundle", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle02", true, true);

        expect(bund.contains("META-INF")).toBeTruthy();
    });
    it("should find a file within the Bundle", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle02", true, true);

        expect(bund.contains("Artefact2.txt")).toBeTruthy();
    });
    it("should find a file within a directory within the Bundle", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle02", true, true);

        expect(bund.contains("META-INF/cics.xml")).toBeTruthy();
    });
    it("should not find a missing file within the Bundle", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle02", true, true);

        expect(bund.contains("doesNotexist")).toBeFalsy();
    });
    it("should not find a file outside of the Bundle", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle02", true, true);

        expect(bund.contains("../ExampleBundle01")).toBeFalsy();
    });
});
