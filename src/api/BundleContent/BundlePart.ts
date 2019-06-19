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
import { IHandlerParameters } from "@brightside/imperative";

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
   * Perform checks to determine whether it is likely that a file can be written.
   *
   * @param {string} filename - The file to check
   * @returns {boolean}
   * @throws ImperativeError
   * @memberof BundlePart
   */
  public static alreadyExists(filename: string, overwrite: boolean): boolean {
    // Does the file already exist?
    if (BundlePart.fs.existsSync(filename)) {
      // Are we allowed to replace it?
      if (overwrite === false) {
        throw new Error("File " + filename + " already exists. Specify --overwrite to replace it.");
      }

      // Do we have write permission to it?
      try {
        BundlePart.fs.accessSync(filename, BundlePart.fs.constants.W_OK);
      }
      catch (err) {
        throw new Error("cics-deploy requires write permission to: " + filename);
      }

      return true;
    }

    return false;
  }

  /**
   * Determine whether a file reference is local to the Bundle. Returns a normalised
   * reference, or null if the reference is invalid.
   *
   * @param {string} filename - The filename to validate.
   * @param {string} bundledir - The home directory for the Bundle.
   * @returns {string}
   * @throws ImperativeError
   * @memberof BundlePart
   */
  public static getRelativeFileReference(filename: string, bundledir: string): string {
    // normalise it (to get rid of dots)
    let file = BundlePart.path.normalize(filename);

    // find the location of the target relative to the current directory
    file = this.path.relative(bundledir, file);

    // the target file is not within the current directory tree throw an error
    if (file.indexOf("..") === 0) {
      return undefined;
    }
    return file;
  }

  protected static fs = require("fs");
  protected static path = require("path");

  /**
   * Function for mangaling a name into something valid for CICS
   *
   * @throws ImperativeError
   * @memberof BundlePart
   */
  protected static mangleName(text: string, maxLength: number): string {

    // replace underscore with hyphen
    let mangledText = text.replace(/_/g, "-");

    // Convert all unsupported characters to X
    mangledText = mangledText.replace(/[^0-9,^A-Z,^a-z\-]/g, "X");

    // Now truncate the string
    return mangledText.substring(0, maxLength);
  }

  protected bundleDirectory: string;
  protected overwrite: boolean;
  private partData: IBundlePartDataType;
  private simpleType = "BundlePart";
  private params: IHandlerParameters;

  /**
   * Constructor for creating a BundlePart.
   * @param {string} directory - The bundle directory.
   * @param {IBundlePartDataType} partDataLocal - The metadata for the BundlePart.
   * @param {boolean} validatePath - True if the path property should be validated.
   * @param {boolean} overwrite - True if the parts contents are allowed to be changed.
   * @param {IHandlerParameters} params - The current Imperative handler parameters
   * @static
   * @throws ImperativeError
   * @memberof BundlePart
   */
  constructor(directory: string, partDataLocal: IBundlePartDataType, validatePath: boolean,
              abbrevType: string, overwrite: boolean, params?: IHandlerParameters) {
    if (abbrevType !== undefined) {
      this.simpleType = abbrevType;
    }
    this.partData = partDataLocal;
    this.overwrite = overwrite;
    this.params = params;
    this.bundleDirectory = BundlePart.path.normalize(directory);
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
   * Perform whatever validation can be done in advance of attempting to save the
   * BundlePart, thereby reducing the possibility of a failure after some of the
   * bundle's parts have already been persisted to the file system.
   *
   * @throws ImperativeError
   * @memberof BundlePart
   */
  public prepareForSave() {
    // no-op, sub-classes may override this
  }

  /**
   * Save the current BundlePart. Any changes that have been made will be persisted.
   *
   * @throws ImperativeError
   * @memberof BundlePart
   */
  public save() {
    // no-op, sub-classes may override this
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
    let file = BundlePart.getRelativeFileReference(filename, this.bundleDirectory);

    // the target file is not within the current directory tree throw an error
    if (file === undefined) {
      throw new Error(this.simpleType + ' "' + this.partData.name + '" references a file outside of the Bundle directory: "' + filename + '".');
    }

    // Check that the target file exists
    const fullLocation = this.bundleDirectory + "/" + file;
    if (!BundlePart.fs.existsSync(fullLocation)) {
      throw new Error(this.simpleType + ' "' + this.partData.name + '" references a file that does not exist: "' + fullLocation + '".');
    }

    // change any Windows style file delimiters to Unix style
    file = file.replace(new RegExp("\\\\", "g"), "/");

    return file;
  }

  /**
   * Function to log the modification or creation of a file
   *
   * @param {string} file - the name of the file to log
   * @param {string} action - the action to log
   * @throws ImperativeError
   * @memberof BundlePart
   */
  protected logCreation(file: string, action: string) {
    if (this.params !== undefined) {
      this.params.response.console.log(action + " : " + BundlePart.path.relative(this.bundleDirectory, file));
    }
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
