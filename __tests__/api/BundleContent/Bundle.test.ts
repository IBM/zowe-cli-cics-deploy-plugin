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
});


// Note, the following tests mock the file-system. Snapshot based tests are unlikely to
// work as the jest implementation will itself need to interact with the filesystem.
describe("MockedFilesystemTests", () => {
    afterEach(() => {
      jest.resetAllMocks();
    });
    it("should tolerate META-INF directory not existing", () => {

        // Mocks for the manifest - META-INF exists
        const existsSpy = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the manifest - Bundle dir writable
        const accessSpy = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle01", false, false);
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeUndefined();
        expect(existsSpy).toHaveBeenCalledTimes(1);
        expect(accessSpy).toHaveBeenCalledTimes(1);
    });
    it("should complain if no write permission to bundle directory", () => {

        // Mocks for the manifest - META-INF exists
        const existsSpy = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the manifest - Bundle dir writable
        const accessSpy = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => { throw new Error("Wibble"); });

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle01", false, false);
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(existsSpy).toHaveBeenCalledTimes(1);
        expect(accessSpy).toHaveBeenCalledTimes(1);
        expect(err).toBeDefined();
        expect(err.message).toContain("cics-deploy requires write permission to: ");
    });
    it("should complain if no write permission to META-INF directory", () => {

        // Mocks for the manifest - META-INF exists
        const existsSpy = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF is writable
        const accessSpy = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => { throw new Error("Wibble"); });

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle01", false, false);
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(existsSpy).toHaveBeenCalledTimes(1);
        expect(accessSpy).toHaveBeenCalledTimes(1);
        expect(err).toBeDefined();
        expect(err.message).toContain("cics-deploy requires write permission to: ");
    });
    it("should complain if no overwrite permission to manifest", () => {

        // Mocks for the manifest - META-INF exists
        const existsSpy = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF is writable
        const accessSpy = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - manifest exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle01", false, false);
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(existsSpy).toHaveBeenCalledTimes(2);
        expect(accessSpy).toHaveBeenCalledTimes(1);
        expect(err).toBeDefined();
        expect(err.message).toContain("A bundle manifest file already exists. Specify --overwrite to replace it, or --merge to merge changes into it.");
    });
    it("should complain if no write permission to manifest", () => {

        // Mocks for the manifest - META-INF exists
        const existsSpy = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF is writable
        const accessSpy = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - manifest exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - manifest writable
        jest.spyOn(fs, "accessSync").mockImplementationOnce(() => { throw new Error("Wibble"); });

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle01", false, true);
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(existsSpy).toHaveBeenCalledTimes(2);
        expect(accessSpy).toHaveBeenCalledTimes(2);
        expect(err).toBeDefined();
        expect(err.message).toContain("cics-deploy requires write permission to:");
        expect(err.message).toContain("cics.xml");
    });
    it("should tolerate absence of .nodejsapp directory", () => {

        // Mocks for the Nodejsapp - startscript exists
        const existsSpy = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF is writable
        const accessSpy = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - manifest exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - nodejsapp dir exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - nodejsapp dir creatable
        jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - zosattributes
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle03", false, false);
          bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        // Check the output as JSON
        expect(err).toBeUndefined();
        expect(existsSpy).toHaveBeenCalledTimes(5);
        expect(accessSpy).toHaveBeenCalledTimes(2);
    });
    it("should detect inability to create .nodejsapp directory", () => {

        // Mocks for the Nodejsapp - startscript exists
        const existsSpy = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF is writable
        const accessSpy = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - manifest exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - nodejsapp dir exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - nodejsapp dir creatable
        jest.spyOn(fs, "accessSync").mockImplementationOnce(() => { throw new Error("Wibble"); });

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle03", false, false);
        bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);
        let err: Error;
        try {
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(existsSpy).toHaveBeenCalledTimes(4);
        expect(accessSpy).toHaveBeenCalledTimes(2);
        expect(err).toBeDefined();
        expect(err.message).toContain("cics-deploy requires write permission to: ");
    });
    it("should detect unwritable nodejsapps directory", () => {

        // Mocks for the Nodejsapp - startscript exists
        const existsSpy = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF is writable
        const accessSpy = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - manifest exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - nodejsapp dir exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - nodejsapp dir not writable
        jest.spyOn(fs, "accessSync").mockImplementationOnce(() => { throw new Error("Wibble"); });

        // Create a Bundle
        const bund = new Bundle("__tests__/__resources__/ExampleBundle03", false, true);
        bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);

        let err: Error;
        try {
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(existsSpy).toHaveBeenCalledTimes(4);
        expect(accessSpy).toHaveBeenCalledTimes(2);
        expect(err).toBeDefined();
        expect(err.message).toContain("cics-deploy requires write permission to: ");
        expect(err.message).toContain("nodejsapps");
    });
    it("should complain if existing .nodejsapp file isn't overwritable", () => {

        // Mocks for the Nodejsapp - startscript exists
        const existsSpy = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF is writable
        const accessSpy = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - manifest exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - nodejsapp dir exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - nodejsapp dir writable
        jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - .nodejsapp file exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle03", false, false);
          bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(existsSpy).toHaveBeenCalledTimes(5);
        expect(accessSpy).toHaveBeenCalledTimes(2);
        expect(err).toBeDefined();
        expect(err.message).toContain("NodeName.nodejsapp already exists. Specify --overwrite to replace it.");
    });
    it("should complain if no write permission to existing .nodejsapp", () => {

        // Mocks for the Nodejsapp - startscript exists
        const existsSpy = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF is writable
        const accessSpy = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - manifest exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - nodejsapp dir exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - nodejsapp dir writable
        jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - .nodejsapp file exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - .nodejsapp file not writable
        jest.spyOn(fs, "accessSync").mockImplementationOnce(() => { throw new Error("Wibble"); });

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle03", false, true);
          bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(existsSpy).toHaveBeenCalledTimes(5);
        expect(accessSpy).toHaveBeenCalledTimes(3);
        expect(err).toBeDefined();
        expect(err.message).toContain("cics-deploy requires write permission to: ");
        expect(err.message).toContain("NodeName.nodejsapp");
    });
    it("should complain if no write permission to existing .profile", () => {

        // Mocks for the Nodejsapp - startscript exists
        const existsSpy = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF is writable
        const accessSpy = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - manifest exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - nodejsapp dir exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - nodejsapp dir writable
        jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - .nodejsapp file exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - .nodejsapp file writable
        jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - .profile file exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - .profile file writable
        jest.spyOn(fs, "accessSync").mockImplementationOnce(() => { throw new Error("Wibble"); });

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle03", false, true);
          bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(existsSpy).toHaveBeenCalledTimes(6);
        expect(accessSpy).toHaveBeenCalledTimes(4);
        expect(err).toBeDefined();
        expect(err.message).toContain("cics-deploy requires write permission to: ");
        expect(err.message).toContain("NodeName.profile");
    });
    it("should complain if no overwrite permission for existing .zosattributes", () => {

        // Mocks for the Nodejsapp - startscript exists
        const existsSpy = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF is writable
        const accessSpy = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - manifest exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - nodejsapp dir exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - nodejsapp dir writable
        jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - .nodejsapp file exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - .profile file exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - .zosattributes file exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle03", false, false);
          bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(existsSpy).toHaveBeenCalledTimes(7);
        expect(accessSpy).toHaveBeenCalledTimes(2);
        expect(err).toBeDefined();
        expect(err.message).toContain(".zosattributes already exists. Specify --overwrite to replace it.");
    });
    it("should complain if can't make a new META-INF directory", () => {

        // Mocks for the manifest - META-INF exists
        const existsSpy = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF is writable
        const accessSpy = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - manifest exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the manifest - META-INF exists (on save() rather than prepareForSave())
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the manifest - META-INF creation)
        const mkdirSpy = jest.spyOn(fs, "mkdirSync").mockImplementationOnce(() => { throw new Error("InjectedError"); });

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle01", false, true);
          bund.save();
        }
        catch (error) {
          err = error;
        }

        expect(existsSpy).toHaveBeenCalledTimes(3);
        expect(accessSpy).toHaveBeenCalledTimes(1);
        expect(mkdirSpy).toHaveBeenCalledTimes(1);
        expect(err).toBeDefined();
        expect(err.message).toContain("An error occurred attempting to create");
        expect(err.message).toContain("META-INF");
        expect(err.message).toContain("InjectedError");
    });
    it("should complain if writing the manifest fails", () => {

        // Mocks for the manifest - META-INF exists
        const existsSpy = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF is writable
        const accessSpy = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - manifest exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the manifest - META-INF exists (on save() rather than prepareForSave())
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - manifest write)
        const writeSpy = jest.spyOn(fs, "writeFileSync").mockImplementationOnce(() => { throw new Error("InjectedError"); });

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle01", false, true);
          bund.save();
        }
        catch (error) {
          err = error;
        }

        expect(existsSpy).toHaveBeenCalledTimes(3);
        expect(accessSpy).toHaveBeenCalledTimes(1);
        expect(writeSpy).toHaveBeenCalledTimes(1);
        expect(err).toBeDefined();
        expect(err.message).toContain("An error occurred attempting to write manifest file");
        expect(err.message).toContain("cics.xml");
        expect(err.message).toContain("InjectedError");
    });
    it("should complain if creating nodejsapps dir fails", () => {

        // Mocks for the Nodejsapp - startscript exists
        const existsSpy = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF is writable
        const accessSpy = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - manifest exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - nodejsapp dir exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - nodejsapp dir writable
        jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - .nodejsapp file exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - .profile file exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - .zosattributes file exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));

        // Mocks for the nodejsapp - nodejsapps dir exists (on save() rather than prepareForSave())
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the manifest - nodejsapps dir creation)
        const mkdirSpy = jest.spyOn(fs, "mkdirSync").mockImplementationOnce(() => { throw new Error("InjectedError"); });

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle03", false, true);
          bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);
          bund.save();
        }
        catch (error) {
          err = error;
        }

        expect(existsSpy).toHaveBeenCalledTimes(8);
        expect(accessSpy).toHaveBeenCalledTimes(2);
        expect(mkdirSpy).toHaveBeenCalledTimes(1);
        expect(err).toBeDefined();
        expect(err.message).toContain("An error occurred attempting to create");
        expect(err.message).toContain("nodejsapps'");
        expect(err.message).toContain("InjectedError");
    });
    it("should complain if writing .nodejsapp file fails", () => {

        // Mocks for the Nodejsapp - startscript exists
        const existsSpy = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF is writable
        const accessSpy = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - manifest exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - nodejsapp dir exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - nodejsapp dir writable
        jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - .nodejsapp file exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - .profile file exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - .zosattributes file exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));

        // Mocks for the nodejsapp - nodejsapps dir exists (on save() rather than prepareForSave())
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the nodejsapp - write .nodejsapp file)
        const writeSpy = jest.spyOn(fs, "writeFileSync").mockImplementationOnce(() => { throw new Error("InjectedError"); });

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle03", false, true);
          bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);
          bund.save();
        }
        catch (error) {
          err = error;
        }

        expect(existsSpy).toHaveBeenCalledTimes(8);
        expect(accessSpy).toHaveBeenCalledTimes(2);
        expect(writeSpy).toHaveBeenCalledTimes(1);
        expect(err).toBeDefined();
        expect(err.message).toContain("An error occurred attempting to write nodejsapp file");
        expect(err.message).toContain(".nodejsapp'");
        expect(err.message).toContain("InjectedError");
    });
    it("should complain if writing .profile fails", () => {

        // Mocks for the Nodejsapp - startscript exists
        const existsSpy = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF is writable
        const accessSpy = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - manifest exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - nodejsapp dir exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - nodejsapp dir writable
        jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - .nodejsapp file exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - .profile file exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - .zosattributes file exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));

        // Mocks for the nodejsapp - nodejsapps dir exists (on save() rather than prepareForSave())
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the nodejsapp - write .nodejsapp file)
        const writeSpy = jest.spyOn(fs, "writeFileSync").mockImplementationOnce(() => ( true ));
        // Mocks for the nodejsapp - write .profile file)
        jest.spyOn(fs, "writeFileSync").mockImplementationOnce(() => { throw new Error("InjectedError"); });

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle03", false, true);
          bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);
          bund.save();
        }
        catch (error) {
          err = error;
        }

        expect(existsSpy).toHaveBeenCalledTimes(8);
        expect(accessSpy).toHaveBeenCalledTimes(2);
        expect(writeSpy).toHaveBeenCalledTimes(2);
        expect(err).toBeDefined();
        expect(err.message).toContain("An error occurred attempting to write profile file");
        expect(err.message).toContain(".profile'");
        expect(err.message).toContain("InjectedError");
    });
    it("should complain if writing .zosattributes fails", () => {

        // Mocks for the Nodejsapp - startscript exists
        const existsSpy = jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF is writable
        const accessSpy = jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - manifest exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - nodejsapp dir exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - nodejsapp dir writable
        jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));
        // Mocks for the Nodejsapp - .nodejsapp file exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - .profile file exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the Nodejsapp - .zosattributes file exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));

        // Mocks for the nodejsapp - nodejsapps dir exists (on save() rather than prepareForSave())
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the nodejsapp - write .nodejsapp file)
        const writeSpy = jest.spyOn(fs, "writeFileSync").mockImplementationOnce(() => ( true ));
        // Mocks for the nodejsapp - write .profile file)
        jest.spyOn(fs, "writeFileSync").mockImplementationOnce(() => ( true ));
        // Mocks for the zosattributes - write .zosattributes file)
        jest.spyOn(fs, "writeFileSync").mockImplementationOnce(() => { throw new Error("InjectedError"); });

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle03", false, true);
          bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);
          bund.save();
        }
        catch (error) {
          err = error;
        }

        expect(existsSpy).toHaveBeenCalledTimes(8);
        expect(accessSpy).toHaveBeenCalledTimes(2);
        expect(writeSpy).toHaveBeenCalledTimes(3);
        expect(err).toBeDefined();
        expect(err.message).toContain("An error occurred attempting to write .zosattributes file");
        expect(err.message).toContain(".zosattributes'");
        expect(err.message).toContain("InjectedError");
    });
});

// Note, the following tests mock JSON parsing. It has been split into its own suite for isolation
// purposes.
describe("MockedJSONParsingTests", () => {
    afterEach(() => {
      jest.resetAllMocks();
    });
    it("should complain if exceptions are thrown during manifest parsing", () => {

        const jsonSpy = jest.spyOn(JSON, "parse").mockImplementationOnce(() => { throw new Error("Wibble"); });

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle01", true, true);
        }
        catch (error) {
          err = error;
        }

        expect(jsonSpy).toHaveBeenCalledTimes(1);
        expect(err).toBeDefined();
        expect(err.message).toContain("Parsing error occurred reading a CICS manifest file: Wibble");
    });
});
