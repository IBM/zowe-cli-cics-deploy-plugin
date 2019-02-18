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
  private manifestAsJson: IManifestType;
  private bundleDirectory: string;
  private metainfDir: string;
  private manifestFile: string;


  /**
   * Constructor for creating a Manifest.
   *
   * @static
   * @param {string} directory - The bundle directory.
   * @throws ImperativeError
   * @memberof Manifest
   */
  constructor(directory: string) {
   this.bundleDirectory = this.path.normalize(directory);
   this.metainfDir = this.bundleDirectory + "/META-INF";
   this.manifestFile = this.metainfDir + "/cics.xml";

   // If there is an existing manifest file, read it
   try {
     this.readManifest();
   } catch (ex) {
     if (ex.code === "ENOENT") {
      // No existing file was found, so magic up an empty manifest
       this.manifestAsJson = { manifest:
                               { xmlns: "http://www.ibm.com/xmlns/prod/cics/bundle",
                                 bundleVersion: 1,
                                 bundleRelease: 0 } };
       return;
     }
     throw ex;
   }
  }

  /**
   * Save the Manifest file.
   *
   * @throws ImperativeError
   * @memberof Manifest
   */
  // Save the manifest file back into the file system
  public save() {
     // Create the META-INF directory if it doesn't already exist
     if (!this.fs.existsSync(this.metainfDir)) {
      this.fs.mkdirSync(this.metainfDir);
     }

     // Write the cics.xml manifest
     this.fs.writeFileSync(this.manifestFile, this.getXML(), "utf8");
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
      this.manifestAsJson.manifest.bundleMajorVer = 1;
    }

    if (Number.isInteger(minorVersion) && minorVersion >= 0) {
      this.manifestAsJson.manifest.bundleMinorVer = minorVersion;
    }
    else {
      this.manifestAsJson.manifest.bundleMinorVer = 0;
    }

    if (Number.isInteger(microVersion) && microVersion >= 0) {
      this.manifestAsJson.manifest.bundleMicroVer = microVersion;
    }
    else {
      this.manifestAsJson.manifest.bundleMicroVer = 0;
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
}
