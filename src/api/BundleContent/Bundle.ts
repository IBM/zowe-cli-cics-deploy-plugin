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
import { IHandlerParameters } from "@zowe/imperative";

/**
 * Class to represent a CICS Bundle.
 *
 * @export
 * @class Bundle
 */
export class Bundle {

  /**
   * Get a template version of the .zosattributes file
   * @returns {string}
   * @memberof Bundle
   */
  public static getTemplateZosAttributesFile(): string {
    return `#z/OS File Attributes Document
#-----------------------------
# This document specfies the encodings for the files within
# the project in a form that is compatible with the
# 'Zowe files upload dir-to-uss' command.
#
# Don't upload node_modules
node_modules -
# Don't upload things that start with dots
.* -

# Upload the following file types in binary
*.jpg binary binary
*.png binary binary
*.gif binary binary
*.zip binary binary
*.eot binary binary
*.svg binary binary
*.ttf binary binary
*.woff binary binary

# Convert CICS Node.js profiles to EBCDIC
*.profile ISO8859-1 IBM-1047`;
  }

  private path = require("path");
  private fs = require("fs");
  private manifest: Manifest;
  private definedParts: BundlePart[] = [];
  private bundleDirectory: string;
  private merge: boolean;
  private overwrite: boolean;
  private preparedToSave: boolean = false;
  private zosAttribsNeeded: boolean = false;
  private zosAttribsAlreadyExists: boolean = false;
  private zosAttribsFile: string;
  private params: IHandlerParameters;

  /**
   * Constructor for creating a Bundle.
   * @static
   * @param {string} directory - The bundle directory.
   * @param {boolean} merge - Changes to the bundle manifest should be merged into any existing manifest.
   * @param {boolean} overwrite - Changes to the bundle contents should replace any existing contents.
   * @param {IHandlerParameters} params - The current Imperative handler parameters
   * @throws ImperativeError
   * @memberof Bundle
   */
  constructor(directory: string, merge: boolean, overwrite: boolean, params?: IHandlerParameters) {
    this.merge = merge;
    this.overwrite = overwrite;
    this.params = params;
    this.bundleDirectory = this.path.normalize(directory);
    this.manifest = new Manifest(this.bundleDirectory, this.merge, this.overwrite, params);
    this.preparedToSave = false;
    this.zosAttribsFile = this.path.join(this.bundleDirectory, ".zosattributes");
  }

  /**
   * Validates that a Bundle appears to be valid on the file-system
   * @returns {string}
   * @throws ImperativeError
   * @memberof Bundle
   */
  public validate() {

    // check that the manifest file exists. We could perform a more rigorous
    // validation of the contents of the Bundle, but this simple check is
    // sufficient to ensure the bundle is broadly valid on the file-system.
    // Errors will be thrown to report problems.
    this.manifest.validate();
  }

  /**
   * Determines whether the Bundle contains the named resource
   * @param {string} resource - The resource to query
   * @returns {boolean}
   * @throws ImperativeError
   * @memberof Bundle
   */
  public contains(resource: string): boolean {
    const fullyQualifiedResourceName = this.path.join(this.bundleDirectory, resource);
    const relative = BundlePart.getRelativeFileReference(fullyQualifiedResourceName, this.bundleDirectory);
    if (relative === undefined) {
      // The file isn't within the Bundle directory
      return false;
    }

    const fullLocation = this.path.join(this.bundleDirectory, relative);
    if (!this.fs.existsSync(fullLocation)) {
      return false;
    }

    return true;
  }

  /**
   * Determines whether the Bundle contains any resources of the specified type
   * @param {string} resource - The resource to query
   * @returns {boolean}
   * @throws ImperativeError
   * @memberof Bundle
   */
  public containsDefinitionsOfType(resourceType: string): boolean {
    return this.manifest.containsDefinitionsOfType(resourceType);
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
   * @param {string} id - The identity value for the Bundle.
   * @throws ImperativeError
   * @memberof Bundle
   */
  public setId(id: string) {
    this.manifest.setBundleId(id);
  }

  /**
   * Returns the Bundle's version value.
   * @returns {string}
   * @throws ImperativeError
   * @memberof Bundle
   */
  public getVersion(): string {
    return this.manifest.getBundleVersion();
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
    const bp = new BundlePart(this.bundleDirectory, partData, true, undefined, this.overwrite, this.params);
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
    const nj = new NodejsappBundlePart(this.bundleDirectory, name, startscript, port, this.overwrite, this.params);
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
      this.zosAttribsAlreadyExists = BundlePart.alreadyExists(this.zosAttribsFile, this.overwrite);
    }
  }

  private writeZosAttribs() {
    if (!this.zosAttribsNeeded) {
      return;
    }

    const contents = Bundle.getTemplateZosAttributesFile();

    // Write the zosattributes file
    try {
      if (this.params !== undefined) {
        let action = "    create";
        if (this.zosAttribsAlreadyExists) {
          action = " overwrite";
        }
        this.params.response.console.log(action + " : " + this.path.relative(this.bundleDirectory, this.zosAttribsFile));
      }
      this.fs.writeFileSync(this.zosAttribsFile, contents, "utf8");
    }
    catch (err) {
      throw new Error("An error occurred attempting to write .zosattributes file '" + this.zosAttribsFile + "': " + err.message);
    }
  }
}
