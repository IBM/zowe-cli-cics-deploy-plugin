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

import { Manifest } from "./Manifest";
import { BundlePart, IBundlePartDataType } from "./BundlePart";
import { NodejsappBundlePart } from "./NodejsappBundlePart";

/**
 * Class to represent a CICS Bundle.
 *
 * @export
 * @class Bundle
 */
export class Bundle {

  private path = require("path");
  private fs = require("fs");
  private manifest: Manifest;
  private definedParts: BundlePart[] = [];
  private bundleDirectory: string;
  private merge: boolean;
  private overwrite: boolean;
  private preparedToSave: boolean = false;
  private zosAttribsNeeded: boolean = false;
  private zosAttribsFile: string;

  /**
   * Constructor for creating a Bundle.
   * @static
   * @param {string} directory - The bundle directory.
   * @param {boolean} merge - Changes to the bundle manifest should be merged into any existing manifest.
   * @param {boolean} overwrite - Changes to the bundle contents should replace any existing contents.
   * @throws ImperativeError
   * @memberof Bundle
   */
  constructor(directory: string, merge: boolean, overwrite: boolean) {
    this.merge = merge;
    this.overwrite = overwrite;
    this.bundleDirectory = this.path.normalize(directory);
    this.manifest = new Manifest(this.bundleDirectory, this.merge, this.overwrite);
    this.preparedToSave = false;
    this.zosAttribsFile = this.path.join(this.bundleDirectory, ".zosattributes");
  }

  /**
   * Returns the Bundle's identity (id) value.
   * @returns {string}
   * @throws ImperativeError
   * @memberof Bundle
   */
  public getId(): string {
    return this.manifest.getBundleId();
  }

  /**
   * Set the Bundle's identity (id) value.
   * @param {string} id - The identiry value for the Bundle.
   * @throws ImperativeError
   * @memberof Bundle
   */
  public setId(id: string) {
    this.manifest.setBundleId(id);
  }

  /**
   * Set the Bundle's version number.
   * @param {number} majorVersion - The major version number.
   * @param {number} minorVersion - The minor version number.
   * @param {number} microVersion - The micro version number.
   * @throws ImperativeError
   * @memberof Bundle
   */
  public setVersion(majorVersion: number, minorVersion: number, microVersion: number) {
    this.manifest.setBundleVersion(majorVersion, minorVersion, microVersion);
  }

  /**
   * Returns the Manifest contents as a JSON Object.
   *
   * @returns {object}
   * @throws ImperativeError
   * @memberof Bundle
   */
  public getManifest(): object {
    return this.manifest.getJson();
  }

  /**
   * Returns the Manifest contents as an XML string.
   *
   * @returns {string}
   * @throws ImperativeError
   * @memberof Bundle
   */
  public getManifestXML(): string {
    return this.manifest.getXML();
  }

  /**
   * Add a resource definition to the Bundle. If a part of the same name and type
   * already exists then it is replaced with the new part data.
   *
   * @param {IBundlePartDataType} partData - the part to add.
   * @throws ImperativeError
   * @memberof Bundle
   */
  public addDefinition(partData: IBundlePartDataType) {
    // Create a BundlePart
    this.preparedToSave = false;
    const bp = new BundlePart(this.bundleDirectory, partData, true, undefined, this.overwrite);
    this.definedParts.push(bp);
    this.manifest.addDefinition(bp);
  }

  /**
   * Add a NODEJSAPP resource definition to the Bundle. If a NODEJSAPP of the same name
   * already exists then it is replaced with the new part data.
   *
   * @param {string} name - the name of the NODEJSAPP to add.
   * @param {string} startscript - the path to the starting script for the NODEJSAPP.
   * @param {number} port - the port mumber to associate with the NODEJSAPP.
   * @throws ImperativeError
   * @memberof Bundle
   */
  public addNodejsappDefinition(name: string, startscript: string, port: number) {
    this.preparedToSave = false;
    const nj = new NodejsappBundlePart(this.bundleDirectory, name, startscript, port, this.overwrite);
    this.manifest.addDefinition(nj);
    this.definedParts.push(nj);
    this.zosAttribsNeeded = true;
  }

  /**
   * Each bundle part is prompted to ensure that it is in a fit state to be saved.
   * This might involve ensuring that file system permissions are suitable and that
   * existing files wont be overwritten. The goal is that errors can be detected
   * before any changes are actually saved, thereby reducing the probability that
   * something will go wrong after partial changes are saved, and potentially resulting
   * in a damaged Bundle on the file system.
   *
   * @throws ImperativeError
   * @memberof Bundle
   */
  public prepareForSave() {
    // prepare the manifest, this will check write access to the target directory
    // (amongst other things).
    this.manifest.prepareForSave();

    // prepare each bundle part in turn
    this.definedParts.forEach( (value) => {
      value.prepareForSave();
      });

    // prepare the .zosattributes file (which can be useful for transferring a
    // bundle to zFS).
    this.prepareZosAttribs();

    this.preparedToSave = true;
  }

  /**
   * Save the current Bundle. Any changes that have been made will be persisted.
   *
   * @throws ImperativeError
   * @memberof Bundle
   */
  public save() {
    // Prepare the resources to be saved, without actually saving them. This should
    // cause most common errors to be detected before we start persisting anything.
    // If an error does occur mid-save then we have a better chance of avoiding a
    // broken Bundle.
    if (this.preparedToSave === false) {
      this.prepareForSave();
    }

    // save the parts
    this.definedParts.forEach( (value) => {
      value.save();
      });

    // save the zosattributes
    this.writeZosAttribs();

    // save the manifest
    this.manifest.save();
  }

  private prepareZosAttribs() {
    if (this.zosAttribsNeeded) {
      BundlePart.ensureFileSaveable(this.zosAttribsFile, this.overwrite);
    }
  }

  private writeZosAttribs() {
    if (!this.zosAttribsNeeded) {
      return;
    }

    const contents = "" +
          "# Don't upload node_modules\n" +
          "node_modules -\n" +
          "# Don't upload things that start with dots\n" +
          ".* -\n" +
          "\n" +
          "# Upload images in binary\n" +
          "*.jpg binary binary\n" +
          "*.png binary binary\n" +
          "*.gif binary binary\n" +
          "*.zip binary binary\n" +
          "*.eot binary binary\n" +
          "*.svg binary binary\n" +
          "*.ttf binary binary\n" +
          "*.woff binary binary\n" +
          "\n" +
          "# Convert CICS Node.js profiles to EBCDIC\n" +
          "*.profile ISO8859-1 IBM-1047";

    // Write the zosattributes file
    try {
      this.fs.writeFileSync(this.zosAttribsFile, contents, "utf8");
    }
    catch (err) {
      throw new Error("An error occurred attempting to write .zosattributes file '" + this.zosAttribsFile + "': " + err.message);
    }
  }
}
