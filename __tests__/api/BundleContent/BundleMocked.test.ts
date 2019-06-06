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
import * as parser from "fast-xml-parser";

// Note, the following tests mock the file-system. Snapshot based tests are unlikely to
// work as the jest implementation will itself need to interact with the filesystem.
describe("MockedFilesystemTests", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should tolerate META-INF directory not existing", () => {
        // Mocks for the manifest - META-INF exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the manifest - Bundle dir writable
        jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle01", false, false);
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeUndefined();
    });
    it("should complain if no write permission to bundle directory", () => {
        // Mocks for the manifest - META-INF doesn't exist
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( false ));
        // Mocks for the manifest - Bundle dir writable
        jest.spyOn(fs, "accessSync").mockImplementationOnce(() => { throw new Error("Wibble"); });

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle01", false, false);
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toContain("cics-deploy requires write permission to: ");
    });
    it("should complain if no write permission to META-INF directory", () => {

        // Mocks for the manifest - META-INF exists
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => ( true ));
        // Mocks for the manifest - META-INF is writable
        jest.spyOn(fs, "accessSync").mockImplementationOnce(() => { throw new Error("Wibble"); });

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle01", false, false);
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toContain("cics-deploy requires write permission to: ");
    });
    it("should complain if no overwrite permission to manifest", () => {

        // Mocks for the manifest - META-INF & manifest exist
        jest.spyOn(fs, "existsSync").mockReturnValue(true);
        // Mocks for the manifest - META-INF is writable
        jest.spyOn(fs, "accessSync").mockImplementationOnce(() => ( true ));

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle01", false, false);
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toContain("A bundle manifest file already exists. Specify --overwrite to replace it, or --merge to merge changes into it.");
    });
    it("should complain if no write permission to manifest", () => {

        // Mocks for the manifest - META-INF & manifest exist
        jest.spyOn(fs, "existsSync").mockReturnValue(true);
        // Mocks for the manifest - META-INF is writable, but manifest is not.
        jest.spyOn(fs, "accessSync").mockImplementation((path: string) => {
          if (path.endsWith("cics.xml")) {
            throw new Error("Wibble");
          }
          return true;
        });

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle01", false, true);
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toContain("cics-deploy requires write permission to:");
        expect(err.message).toContain("cics.xml");
    });
    it("should tolerate absence of .nodejsapp directory", () => {

        jest.spyOn(fs, "existsSync").mockImplementation((path: string) => {
          if (path.endsWith("nodejsapps")) {
            return false;
          }
          if (path.endsWith(".nodejsapp")) {
            return false;
          }
          if (path.endsWith("cics.xml")) {
            return false;
          }
          if (path.endsWith(".profile")) {
            return false;
          }
          if (path.endsWith(".zosattributes")) {
            return false;
          }
          return true;
        });

        // Mocks for the Nodejsapp - META-INF writable & nodejsapp dir creatable
        jest.spyOn(fs, "accessSync").mockReturnValue(true);

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
    });
    it("should detect inability to create .nodejsapp directory", () => {
        jest.spyOn(fs, "existsSync").mockImplementation((path: string) => {
            if (path.endsWith("nodejsapps")) {
              return false;
            }
            if (path.endsWith("cics.xml")) {
              return false;
            }
            if (path.endsWith(".zosattributes")) {
                return false;
              }
            return true;
          });

        // Bundle dir is unwriteable, so nodejsapps can't be created
        jest.spyOn(fs, "accessSync").mockImplementation((path: string) => {
            if (path.endsWith("ExampleBundle03")) {
                throw new Error("Wibble");
            }
            return true;
        });

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

        expect(err).toBeDefined();
        expect(err.message).toContain("cics-deploy requires write permission to: ");
    });
    it("should detect unwritable nodejsapps directory", () => {
        jest.spyOn(fs, "existsSync").mockImplementation((path: string) => {
            if (path.endsWith("cics.xml")) {
              return false;
            }
            if (path.endsWith(".zosattributes")) {
                return false;
              }
            return true;
          });

        jest.spyOn(fs, "accessSync").mockImplementation((path: string) => {
            if (path.endsWith("nodejsapps")) {
                throw new Error("Wibble");
            }
            return true;
        });

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

        expect(err).toBeDefined();
        expect(err.message).toContain("cics-deploy requires write permission to: ");
        expect(err.message).toContain("nodejsapps");
    });
    it("should complain if existing .nodejsapp file isn't overwritable", () => {
        // manifest don't exist, everying else does (inlucde .nodejsapp)
        jest.spyOn(fs, "existsSync").mockImplementation((path: string) => {
            if (path.endsWith("cics.xml")) {
              return false;
            }
            return true;
          });

        // Mocks for the Nodejsapp - META-INF writable & nodejsapp dir creatable
        jest.spyOn(fs, "accessSync").mockReturnValue(true);

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle03", false, false);
          bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toContain("NodeName.nodejsapp already exists. Specify --overwrite to replace it.");
    });
    it("should complain if no write permission to existing .nodejsapp", () => {
        // manifest don't exist, everying else does (inlucde .nodejsapp)
        jest.spyOn(fs, "existsSync").mockImplementation((path: string) => {
            if (path.endsWith("cics.xml")) {
              return false;
            }
            return true;
          });

        jest.spyOn(fs, "accessSync").mockImplementation((path: string) => {
            if (path.endsWith(".nodejsapp")) {
                throw new Error("Wibble");
            }
            return true;
        });


        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle03", false, true);
          bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toContain("cics-deploy requires write permission to: ");
        expect(err.message).toContain("NodeName.nodejsapp");
    });
    it("should complain if no write permission to existing .profile", () => {
        // manifest don't exist, everying else does
        jest.spyOn(fs, "existsSync").mockImplementation((path: string) => {
            if (path.endsWith("cics.xml")) {
              return false;
            }
            return true;
          });

        jest.spyOn(fs, "accessSync").mockImplementation((path: string) => {
            if (path.endsWith(".profile")) {
                throw new Error("Wibble");
            }
            return true;
        });

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle03", false, true);
          bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toContain("cics-deploy requires write permission to: ");
        expect(err.message).toContain("NodeName.profile");
    });
    it("should complain if no overwrite permission for existing .zosattributes", () => {

        jest.spyOn(fs, "existsSync").mockImplementation((path: string) => {
            if (path.endsWith("cics.xml")) {
              return false;
            }
            if (path.endsWith(".nodejsapp")) {
                return false;
            }
            if (path.endsWith(".profile")) {
                return false;
            }
            return true;
          });

        jest.spyOn(fs, "accessSync").mockImplementation((path: string) => {
            if (path.endsWith(".zosattributes")) {
                throw new Error("Wibble");
            }
            return true;
        });

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle03", false, false);
          bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);
          bund.prepareForSave();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toContain(".zosattributes already exists. Specify --overwrite to replace it.");
    });
    it("should complain if can't make a new META-INF directory", () => {
        jest.spyOn(fs, "accessSync").mockReturnValue(true);
         // manifest don't exist, everying else does
        jest.spyOn(fs, "existsSync").mockImplementation((path: string) => {
            if (path.endsWith("META-INF")) {
              return false;
            }
            return true;
          });

        jest.spyOn(fs, "mkdirSync").mockImplementationOnce(() => { throw new Error("InjectedError"); });

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle01", false, true);
          bund.save();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toContain("An error occurred attempting to create");
        expect(err.message).toContain("META-INF");
        expect(err.message).toContain("InjectedError");
    });
    it("should complain if writing the manifest fails", () => {
        jest.spyOn(fs, "accessSync").mockReturnValue(true);
         // manifest don't exist, everying else does
        jest.spyOn(fs, "existsSync").mockImplementation((path: string) => {
            if (path.endsWith("cics.xml")) {
              return false;
            }
            return true;
          });

        // Mocks for the manifest - manifest write
        jest.spyOn(fs, "writeFileSync").mockImplementationOnce(() => { throw new Error("InjectedError"); });


        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle01", false, true);
          bund.save();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toContain("An error occurred attempting to write manifest file");
        expect(err.message).toContain("cics.xml");
        expect(err.message).toContain("InjectedError");
    });
    it("should complain if creating nodejsapps dir fails", () => {
        jest.spyOn(fs, "accessSync").mockReturnValue(true);
        jest.spyOn(fs, "existsSync").mockImplementation((path: string) => {
            if (path.endsWith("nodejsapps")) {
              return false;
            }
            return true;
          });

        jest.spyOn(fs, "mkdirSync").mockImplementationOnce(() => { throw new Error("InjectedError"); });

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle03", false, true);
          bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);
          bund.save();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toContain("An error occurred attempting to create");
        expect(err.message).toContain("nodejsapps'");
        expect(err.message).toContain("InjectedError");
    });
    it("should complain if writing .nodejsapp file fails", () => {
        jest.spyOn(fs, "accessSync").mockReturnValue(true);
        jest.spyOn(fs, "existsSync").mockImplementation((path: string) => {
            if (path.endsWith(".nodejsapp")) {
              return false;
            }
            return true;
          });

        // Mocks for the nodejsapp - write .nodejsapp file)
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

        expect(err).toBeDefined();
        expect(err.message).toContain("An error occurred attempting to write nodejsapp file");
        expect(err.message).toContain(".nodejsapp'");
        expect(err.message).toContain("InjectedError");
    });
    it("should complain if writing .profile fails", () => {
        jest.spyOn(fs, "accessSync").mockReturnValue(true);
        jest.spyOn(fs, "existsSync").mockImplementation((path: string) => {
            if (path.endsWith(".profile")) {
                return false;
              }
            return true;
          });

        jest.spyOn(fs, "writeFileSync").mockImplementation((path: string) => {
            if (path.endsWith(".profile")) {
                throw new Error("InjectedError");
            }
        });

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle03", false, true);
          bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);
          bund.save();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toContain("An error occurred attempting to write profile file");
        expect(err.message).toContain(".profile'");
        expect(err.message).toContain("InjectedError");
    });
    it("should complain if writing .zosattributes fails", () => {
        jest.spyOn(fs, "accessSync").mockReturnValue(true);
        jest.spyOn(fs, "existsSync").mockImplementation((path: string) => {
            if (path.endsWith(".zosattributes")) {
                return false;
              }
            return true;
          });

        // Mocks for the nodejsapp - write .zosattributes
        jest.spyOn(fs, "writeFileSync").mockImplementation((path: string) => {
            if (path.endsWith(".zosattributes")) {
                throw new Error("InjectedError");
            }
        });

        let err: Error;
        try {
          const bund = new Bundle("__tests__/__resources__/ExampleBundle03", false, true);
          bund.addNodejsappDefinition("NodeName", "__tests__/__resources__/ExampleBundle03/Artefact1", 1000);
          bund.save();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toContain("An error occurred attempting to write .zosattributes file");
        expect(err.message).toContain(".zosattributes'");
        expect(err.message).toContain("InjectedError");
    });
    it("should know if the bundle is valid", () => {
        jest.spyOn(fs, "accessSync").mockReturnValue(true);
        jest.spyOn(fs, "existsSync").mockReturnValue(false);
        jest.spyOn(fs, "writeFileSync").mockReturnValue(true);
        jest.spyOn(fs, "mkdirSync").mockReturnValue(true);

        let err: Error;
        let bund;
        try {
          bund = new Bundle("__tests__/__resources__/ExampleBundle01", false, false);
          bund.validate();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeDefined();
        expect(err.message).toContain("No bundle manifest file found");
        expect(err.message).toContain("cics.xml");

        err = undefined;
        try {
          bund.save();
          bund.validate();
        }
        catch (error) {
          err = error;
        }

        expect(err).toBeUndefined();
    });

    it("should complain if exceptions are thrown during manifest parsing", () => {

      jest.spyOn(parser, "parse").mockImplementationOnce(() => { throw new Error("Wibble"); });

      let err: Error;
      try {
        const bund = new Bundle("__tests__/__resources__/ExampleBundle01", true, true);
      }
      catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err.message).toContain("Parsing error occurred reading a CICS manifest file: Wibble");
    });
});
