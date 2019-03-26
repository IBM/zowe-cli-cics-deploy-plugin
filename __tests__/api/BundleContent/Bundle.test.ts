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
    beforeEach(() => {
      jest.spyOn(fs, "writeFileSync").mockImplementationOnce(() => { throw new Error("DO NOT WRITE TO FILE SYSTEM IN A UNIT TEST"); });
    });
    afterEach(() => {
      jest.resetAllMocks();
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
        expect(err.message).toMatchSnapshot();
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
        expect(err.message).toMatchSnapshot();
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
    it("should tolerate META-INF directory not existing", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle01", false, false);

        const spy1 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        const spy2 = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        bund.prepareForSave();

        expect(JSON.stringify(bund.getManifest())).toMatchSnapshot();
    });
    it("should complain if no write permission to bundle directory", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle01", false, false);

        const spy1 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        const spy2 = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => { throw new Error("Wibble"); });

        let err: Error;
        try {
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toMatchSnapshot();
    });
    it("should complain if no write permission to META-INF directory", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle01", false, false);

        const spy1 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        const spy2 = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => { throw new Error("Wibble"); });

        let err: Error;
        try {
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toMatchSnapshot();
    });
    it("should complain if no overwrite permission to manifest", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle01", false, false);

        const spy1 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        const spy2 = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        const spy3 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));

        let err: Error;
        try {
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toMatchSnapshot();
    });
    it("should complain if no write permission to manifest", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle01", false, true);

        const spy1 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        const spy2 = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        const spy3 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        const spy4 = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => { throw new Error("Wibble"); });

        let err: Error;
        try {
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toMatchSnapshot();
    });
    it("should complain if can't make a new META-INF directory", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle01", false, true);

        const spy1 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        const spy2 = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        const spy3 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        const spy4 = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        const spy5 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        const spy6 = jest.spyOn(fs, "mkdirSync").mockImplementationOnce(() => { throw new Error("Wibble"); });

        let err: Error;
        try {
          bund.save();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toMatchSnapshot();
    });
    it("should complain if writing the manifest fails", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle01", false, true);

        const spy1 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        const spy2 = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        const spy3 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        const spy4 = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        const spy5 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));

        let err: Error;
        try {
          bund.save();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toMatchSnapshot();
    });
    it("should tolerate absence of .nodejsapp directory", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle03", false, false);

        // Mocks for the manifest
        const spy1 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        const spy2 = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        const spy3 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - startscript exists
        const spy4 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - dir exists
        const spy5 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));

        bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);
        bund.prepareForSave();

        // Check the output as JSON
        expect(JSON.stringify(bund.getManifest())).toMatchSnapshot();
    });
    it("should detect unwritable .nodejsapp directory", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle03", false, false);

        // Mocks for the manifest
        const spy1 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        const spy2 = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        const spy3 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - startscript exists
        const spy4 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - dir exists
        const spy5 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - dir not writable
        const spy6 = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => { throw new Error("Wibble"); });

        bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);
        let err: Error;
        try {
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toMatchSnapshot();
    });
    it("should complain if existing .nodejsapp file isn't overwritable", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle03", false, false);

        // Mocks for the manifest
        const spy1 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        const spy2 = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        const spy3 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - startscript exists
        const spy4 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - dir exists
        const spy5 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - dir writable
        const spy6 = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - .nodejsapp exists
        const spy7 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));

        bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);
        let err: Error;
        try {
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toMatchSnapshot();
    });
    it("should complain if no write permission to existing .nodejsapp", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle03", false, true);

        // Mocks for the manifest
        const spy1 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        const spy2 = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        const spy3 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - startscript exists
        const spy4 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - dir exists
        const spy5 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - dir writable
        const spy6 = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - .nodejsapp exists
        const spy7 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - .nodejsapp not writable
        const spy8 = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => { throw new Error("Wibble"); });

        bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);
        let err: Error;
        try {
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toMatchSnapshot();
    });
    it("should complain if no write permission to existing .profile", () => {

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle03", false, true);

        // Mocks for the manifest
        const spy1 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        const spy2 = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        const spy3 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - startscript exists
        const spy4 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - dir exists
        const spy5 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - dir writable
        const spy6 = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - .nodejsapp exists
        const spy7 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - .nodejsapp writable
        const spy8 = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - .profile exists
        const spy9 = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - .profile writable
        const spy10 = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => { throw new Error("Wibble"); });

        bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);
        let err: Error;
        try {
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toMatchSnapshot();
    });
    it("should complain if exceptions are thrown during manifest parsing", () => {

        const spy1 = jest.spyOn(JSON, "parse").mockImplementationOnce(() => { throw new Error("Wibble"); });

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle01", true, true);
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toMatchSnapshot();
    });
});
