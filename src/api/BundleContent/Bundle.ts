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
  private manifest: Manifest;
  private definedParts: BundlePart[] = [];
  private bundleDirectory: string;
  private merge: boolean;
  private overwrite: boolean;

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
    const bp = new BundlePart(this.bundleDirectory, partData, true, undefined);
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
    const nj = new NodejsappBundlePart(this.bundleDirectory, name, startscript, port);
    this.manifest.addDefinition(nj);
    this.definedParts.push(nj);
  }

  /**
   * Save the current Bundle. Any changes that have been made will be persisted.
   *
   * @throws ImperativeError
   * @memberof Bundle
   */
  public save() {
    this.definedParts.forEach( (value) => {
      value.save();
      });
    this.manifest.save();
  }
}
