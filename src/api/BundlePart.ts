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

/**
 * Interface to represent the manifest data for a BundlePart.
 *
 * @export
 * @interface IBundlePartDataType
 */
export interface IBundlePartDataType {
  name: string;
  type: string;
  path: string;
}

/**
 * Class to represent a CICS BundlePart.
 *
 * @export
 * @class BundlePart
 */
export class BundlePart {

  /**
   * Function for mangaling a name into something valid for CICS
   *
   * @throws ImperativeError
   * @memberof BundlePart
   */
  protected static mangleName(text: string, maxLength: number): string {

    // replace underscore with hyphen
    let mangledTest = text.replace(/_/g, "-");

    // Convert all unsupported characters to X
    mangledTest = mangledTest.replace(/[^0-9,^A-Z,^a-z\-]/g, "X");

    // Now truncate the string
    return mangledTest.substring(0, maxLength);
  }

  protected fs = require("fs");
  protected bundleDirectory: string;
  private path = require("path");
  private partData: IBundlePartDataType;
  private simpleType = "BundlePart";

  /**
   * Constructor for creating a BundlePart.
   * @param {string} directory - The bundle directory.
   * @param {IBundlePartDataType} partDataLocal - The metadata for the BundlePart.
   * @param {boolean} validatePath - True if the path property should be validated.
   * @static
   * @throws ImperativeError
   * @memberof BundlePart
   */
  constructor(directory: string, partDataLocal: IBundlePartDataType, validatePath: boolean, abbrevType: string) {
    if (abbrevType !== undefined) {
      this.simpleType = abbrevType;
    }
    this.partData = partDataLocal;
    this.bundleDirectory = this.path.normalize(directory);
    this.validateName();
    this.validateType();
    if (validatePath) {
      this.validatePath();
    }
  }

  /**
   * Returns the BundlePart's manifest data.
   *
   * @returns {IBundlePartDataType}
   * @throws ImperativeError
   * @memberof BundlePart
   */
  public getPartData(): IBundlePartDataType {
    return this.partData;
  }

  /**
   * Save the current BundlePart. Any changes that have been made will be persisted.
   *
   * @throws ImperativeError
   * @memberof BundlePart
   */
  public save() {
    // no-op, the files must already exist
  }

  /**
   * Resolves a file reference to ensure that it exists and is located within
   * the working directory. Returns the normalized file reference.
   *
   * @param {string} filename - The filename to validate.
   * @returns {string}
   * @throws ImperativeError
   * @memberof BundlePart
   */
  protected normalizeAndValidateFileReference(filename: string): string {

    // normalise it (to get rid of dots)
    let file = this.path.normalize(filename);

    // find the location of the target relative to the current directory
    file = this.path.relative(this.bundleDirectory, file);

    // the target file is not within the current directory tree throw an error
    if (file.indexOf("..") === 0) {
      throw new Error(this.simpleType + ' "' + this.partData.name + '" references a file outside of the Bundle directory: "' + file + '".');
    }

    // Check that the target file exists
    const fullLocation = this.bundleDirectory + "/" + file;
    if (!this.fs.existsSync(fullLocation)) {
      throw new Error(this.simpleType + ' "' + this.partData.name + '" references a file that does not exist: "' + fullLocation + '".');
    }

    // change any Windows style file delimiters to Unix style
    file = file.replace(new RegExp("\\\\", "g"), "/");

    return file;
  }

  private validateName() {
    if (this.partData.name === undefined) {
      throw new Error(this.simpleType + " name is not set.");
    }
  }

  private validateType() {
    if (this.partData.type === undefined) {
      throw new Error(this.simpleType + ' type is not set for part "' + this.partData.name + '"');
    }
  }

  private validatePath() {
    if (this.partData.path === undefined) {
      throw new Error(this.simpleType + ' path is not set for part "' + this.partData.name + '"');
    }
    this.partData.path = this.normalizeAndValidateFileReference(this.partData.path);
  }
}
