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

"use strict";

import { BundlePart, IBundlePartDataType } from "./BundlePart";
import { IHandlerParameters } from "@zowe/imperative";

/**
 * Interface to represent the manifest data for a CICS Bundle.
 *
 * @export
 * @interface IManifestType
 */
interface IManifestType {
  manifest: IManifestContents;
}
/**
 * Interface to represent the manifest data contents for CICS Bundle.
 *
 * @export
 * @interface IManifestContents
 */
interface IManifestContents {
  id?: string;
  xmlns?: string;
  bundleVersion?: number;
  bundleRelease?: number;
  bundleMajorVer?: number;
  bundleMinorVer?: number;
  bundleMicroVer?: number;
  define?: IBundlePartDataType[];
}

/**
 * Class to represent a CICS Bundle manifest.
 *
 * @export
 * @class Manifest
 */
export class Manifest {

  private MAX_BUNDLEID_LEN = 64;
  private fs = require("fs");
  private path = require("path");
  private manifestAsJson: IManifestType = undefined;
  private bundleDirectory: string;
  private metainfDir: string;
  private manifestFile: string;
  private manifestExists: boolean = false;
  private merge: boolean;
  private overwrite: boolean;
  private params: IHandlerParameters;
  private manifestAction = "    create";


  /**
   * Constructor for creating a Manifest.
   *
   * @static
   * @param {string} directory - The bundle directory.
   * @param {boolean} merge - Changes to the bundle manifest should be merged into any existing manifest.
   * @param {boolean} overwrite - Changes to the bundle contents should replace any existing contents.
   * @param {IHandlerParameters} params - The current Imperative handler parameters
   * @throws ImperativeError
   * @memberof Manifest
   */
  constructor(directory: string, merge: boolean, overwrite: boolean, params?: IHandlerParameters) {
   this.merge = merge;
   this.overwrite = overwrite;
   this.bundleDirectory = this.path.normalize(directory);
   this.metainfDir = this.bundleDirectory + "/META-INF";
   this.manifestFile = this.metainfDir + "/cics.xml";
   this.params = params;

   // If 'merge' is set then attempt to read any existing manifest that may
   // already exist. Subsequent changes will be merged with the existing
   // content.
   if (this.merge === true) {
     try {
       this.readManifest();
     } catch (ex) {
       // Something went wrong. If it's an ENOENT response then there was
       // no manifest to read, so that can be ignored, otherwise propagate
       // the exception back to the caller.
       if (ex.code !== "ENOENT") {
         throw ex;
       }
     }
   }

   // If we've not read an existing manifest, create a new one
   if (this.manifestAsJson === undefined) {
     this.manifestAsJson = { manifest:
                             { xmlns: "http://www.ibm.com/xmlns/prod/cics/bundle",
                               bundleVersion: 1,
                               bundleRelease: 0 } };
   }
  }

  /**
   * Perform whatever validation can be done in advance of attempting to save the
   * manifest, thereby reducing the possibility of a failure after some of the
   * bundle parts have already been persisted to the file system.
   *
   * @throws ImperativeError
   * @memberof Manifest
   */
  public prepareForSave() {
    // Does the meta-inf directory already exist?
    if (!this.fs.existsSync(this.metainfDir)) {
      // we'll have to create it during the save, do we have write permission?
      try {
        this.fs.accessSync(this.bundleDirectory, this.fs.constants.W_OK);
      }
      catch (err) {
        throw new Error("cics-deploy requires write permission to: " + this.bundleDirectory);
      }

      return;
    }

    // Do we have write permission to the META-INF dir?
    try {
      this.fs.accessSync(this.metainfDir, this.fs.constants.W_OK);
    }
    catch (err) {
      throw new Error("cics-deploy requires write permission to: " + this.metainfDir);
    }

    // Does a manifest file already exist?
    if (this.fs.existsSync(this.manifestFile)) {
      if (this.overwrite === false) {
        throw new Error("A bundle manifest file already exists. Specify --overwrite to replace it, or --merge to merge changes into it.");
      }
      if (this.merge) {
        this.manifestAction = "     merge";
      }
      else {
        this.manifestAction = " overwrite";
      }

      // Do we have write permission to the manifest?
      try {
        this.fs.accessSync(this.manifestFile, this.fs.constants.W_OK);
      }
      catch (err) {
        throw new Error("cics-deploy requires write permission to: " + this.manifestFile);
      }
    }
  }

  /**
   * Save the Manifest file.
   *
   * @throws ImperativeError
   * @memberof Manifest
   */
  public save() {
     // Create the META-INF directory if it doesn't already exist
     if (!this.fs.existsSync(this.metainfDir)) {
       try {
         this.logCreation(this.metainfDir);
         this.fs.mkdirSync(this.metainfDir);
       }
       catch (err) {
         throw new Error("An error occurred attempting to create '" + this.metainfDir + "': " + err.message);
       }
     }

     // Write the cics.xml manifest
     try {
       this.logCreation(this.manifestFile, this.manifestAction);
       this.fs.writeFileSync(this.manifestFile, this.getXML(), "utf8");
     }
     catch (err) {
       throw new Error("An error occurred attempting to write manifest file '" + this.manifestFile + "': " + err.message);
     }

     this.manifestExists = true;
  }

  /**
   * Validates that a manifest file exists. If the manifest has not yet been saved then it is
   * invalid.
   *
   * @returns {object}
   * @throws ImperativeError
   * @memberof Manifest
   */
  public validate() {
    if (!this.manifestExists) {
      throw new Error("No bundle manifest file found: " + this.manifestFile);
    }
  }

  /**
   * Returns the Manifest contents as a JSON Object.
   *
   * @returns {object}
   * @throws ImperativeError
   * @memberof Manifest
   */
  public getJson(): object {
    return this.manifestAsJson;
  }

  /**
   * Returns the Manifest contents as XML text.
   *
   * @returns {string}
   * @throws ImperativeError
   * @memberof Manifest
   */
  public getXML(): string {
    const parser = require("xml2json");
    return parser.toXml(JSON.stringify(this.manifestAsJson)) + "\n";
  }

  /**
   * Returns the Bundle's identity (id) value.
   *
   * @returns {string}
   * @throws ImperativeError
   * @memberof Manifest
   */
  public getBundleId(): string {
    return this.manifestAsJson.manifest.id;
  }

  /**
   * Set the Bundle's identity (id) value.
   * @param {string} id - The identiry value for the Bundle.
   * @throws ImperativeError
   * @memberof Manifest
   */
  public setBundleId(id: string) {
    if (id === undefined) {
      throw new Error("BundleId not set.");
    }
    const mangledId = this.mangle(id, this.MAX_BUNDLEID_LEN);
    this.manifestAsJson.manifest.id = mangledId;
  }

  /**
   * Returns the Bundle's version number.
   *
   * @returns {string}
   * @throws ImperativeError
   * @memberof Manifest
   */
  public getBundleVersion(): string {
    if (this.manifestAsJson.manifest.bundleMajorVer === undefined) {
      this.manifestAsJson.manifest.bundleMajorVer = 1;
    }
    if (this.manifestAsJson.manifest.bundleMinorVer === undefined) {
      this.manifestAsJson.manifest.bundleMinorVer = 0;
    }
    if (this.manifestAsJson.manifest.bundleMicroVer === undefined) {
      this.manifestAsJson.manifest.bundleMicroVer = 0;
    }

    return this.manifestAsJson.manifest.bundleMajorVer + "." +
           this.manifestAsJson.manifest.bundleMinorVer + "." +
           this.manifestAsJson.manifest.bundleMicroVer;
  }

  /**
   * Set the Bundle's version number.
   * @param {number} majorVersion - The major version number.
   * @param {number} minorVersion - The minor version number.
   * @param {number} microVersion - The micro version number.
   * @throws ImperativeError
   * @memberof Manifest
   */
  public setBundleVersion(majorVersion: number, minorVersion: number, microVersion: number) {
    if (Number.isInteger(majorVersion) && majorVersion > 0) {
      this.manifestAsJson.manifest.bundleMajorVer = majorVersion;
    }
    else {
      throw new Error("Invalid Bundle major version specified: " + majorVersion + ".");
    }

    if (Number.isInteger(minorVersion) && minorVersion >= 0) {
      this.manifestAsJson.manifest.bundleMinorVer = minorVersion;
    }
    else {
      throw new Error("Invalid Bundle minor version specified: " + minorVersion + ".");
    }

    if (Number.isInteger(microVersion) && microVersion >= 0) {
      this.manifestAsJson.manifest.bundleMicroVer = microVersion;
    }
    else {
      throw new Error("Invalid Bundle micro version specified: " + microVersion + ".");
    }
  }

  /**
   * Add a resource definition to the Manifest. If a part of the same name and type
   * already exists then it is replaced with the new part data.
   *
   * @param {BundlePart} bundlePart - the BundlePart to add.
   * @throws ImperativeError
   * @memberof Manifest
   */
  public addDefinition(bundlePart: BundlePart) {

    const definition = bundlePart.getPartData();

    // Ensure that the definitions array is usable
    this.prepareDefinitionsArray();

    // Search the array for a definition with the same name and
    // type as the one we're trying to add, if found then update
    // it with the new path.
    let i: number;
    for (i = 0; i < this.manifestAsJson.manifest.define.length; i++) {
      const candidate = this.manifestAsJson.manifest.define[i];
      if (candidate.name === definition.name &&
          candidate.type === definition.type) {
        candidate.path = definition.path;
        return;
      }
    }

    // If we've not replaced an existing item in the list, add
    // the new item to the end.
    this.manifestAsJson.manifest.define.push(definition);
  }

  /**
   * Does the bundle contain any resource definitions of the
   * specified type?
   *
   * @param {String} resourceType - the resource type
   * @throws ImperativeError
   * @memberof Manifest
   */
  public containsDefinitionsOfType(resourceType: string): boolean {

    // Ensure that the definitions array is usable
    this.prepareDefinitionsArray();

    // Search the array for a definition with the nominated type
    let i: number;
    for (i = 0; i < this.manifestAsJson.manifest.define.length; i++) {
      const candidate = this.manifestAsJson.manifest.define[i];
      if (candidate.type === resourceType) {
        return true;
      }
    }

    return false;
  }


  private prepareDefinitionsArray() {
    // Create the array of definitions if it doesn't already exist
    if (this.manifestAsJson.manifest.define === undefined) {
      this.manifestAsJson.manifest.define = [];
    }

    // If what already exists is an object (as may happen when appending
    // to an existing XML manifest with only one entry) convert it to an array;
    if (Array.isArray(this.manifestAsJson.manifest.define) === false) {
      const obj = this.manifestAsJson.manifest.define as any;
      this.manifestAsJson.manifest.define = [];
      this.manifestAsJson.manifest.define.push(obj as IBundlePartDataType);
    }
  }

  // Read an existing manifest file into an object
  private readManifest() {
    // read the manifest from the file system
    const xmltext = this.fs.readFileSync(this.manifestFile, "utf8");

    try {
      // Reading the file worked, so convert the contents into a JSON Object
      const parser = require("xml2json");
      this.manifestAsJson = JSON.parse( parser.toJson( xmltext, { reversible: true } ) );
    }
    catch (exception)
    {
      throw new Error("Parsing error occurred reading a CICS manifest file: " + exception.message);
    }

    // Note, the XML parser has no support for namespaces.
    // If the manifest is namespace prefixed then it wont be found. Yuck.
    // Validate that the manifest we've read is usable.
    if (this.manifestAsJson.manifest === undefined) {
      throw new Error("Existing CICS Manifest file found with unparsable content.");
    }

    // Now check the namespace
    if (this.manifestAsJson.manifest.xmlns !== "http://www.ibm.com/xmlns/prod/cics/bundle") {
      throw new Error("Existing CICS Manifest file found with unexpected namespace: " + this.manifestAsJson.manifest.xmlns + " .");
    }

    this.manifestExists = true;
  }

  // Function for mangaling a string for inclusion in the manifest
  private mangle(text: string, maxLength: number): string {

    // replace underscore with hyphen
    const text2 = text.replace(/_/g, "-");

    // Convert all unsupported characters to X
    const text3 = text2.replace(/[^0-9,^A-Z,^a-z\-]/g, "X");

    // Now truncate the string
    const text4 = text3.substring(0, maxLength);

    return text4;
  }

  private logCreation(file: string, action?: string) {
    if (action === undefined) {
      action = "    create";
    }
    if (this.params !== undefined) {
      this.params.response.console.log(action + " : " + this.path.relative(this.bundleDirectory, file));
    }
  }
}
