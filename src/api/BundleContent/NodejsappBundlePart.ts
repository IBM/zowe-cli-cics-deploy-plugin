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

import { BundlePart } from "./BundlePart";
import { TemplateNodejsappProfile } from "./TemplateNodejsappProfile";
import { IHandlerParameters } from "@brightside/imperative";
import * as parser from "fast-xml-parser";

const serialiser = new parser.j2xParser({ignoreAttributes: false, attributeNamePrefix: ""});

/**
 * Interface to represent the manifest data for a NODEJSAPP BundlePart.
 *
 * @export
 * @interface INodejsappType
 */
interface INodejsappType {
  nodejsapp: INodejsappContents;
}

/**
 * Interface to represent the manifest data contents for a NODEJSAPP BundlePart.
 *
 * @export
 * @interface INodejsappContents
 */
interface INodejsappContents {
  name: string;
  xmlns: string;
  startscript: string;
  profile: string;
  lerunopts: string;
}


/**
 * Class to represent a CICS NODEJSAPP BundlePart.
 *
 * @export
 * @class NodejsappBundlePart
 */
export class NodejsappBundlePart extends BundlePart {

  private static MAX_NODEJSAPP_LEN = 32;
  private static MAX_PORT = 65535;
  private nodejsappsDir: string;
  private nodejsappFile: string;
  private nodejsappProfile: string;
  private nodejsappProfileLocal: string;
  private partXML: INodejsappType;
  private profile: string;
  private profileAlreadyExists: boolean;
  private partXMLAlreadyExists: boolean;

  /**
   * Constructor for creating a NodejsappBundlePart.
   *
   * @param {string} directory - The bundle directory.
   * @param {string} name - The name of the NODEJSAPP BundlePart.
   * @param {string} startscript - The path of the start script for the NODEJSAPP.
   * @param {number} port - An optional port number to be added to the profile for the NODEJSAPP.
   * @param {boolean} overwrite - Can existing files be replaced?
   * @param {IHandlerParameters} params - The current Imperative handler parameters
   * @static
   * @throws ImperativeError
   * @memberof NodejsappBundlePart
   */
  constructor(directory: string, name: string, startscript: string, port: number, overwrite: boolean, params?: IHandlerParameters) {
    const partData = { name: "",
                       type: "http://www.ibm.com/xmlns/prod/cics/bundle/NODEJSAPP",
                       path: "" };


    // Check that a name is set
    if (name === undefined) {
      throw new Error("NODEJSAPP name is not set.");
    }

    // Validate the name
    partData.name = BundlePart.mangleName(name, NodejsappBundlePart.MAX_NODEJSAPP_LEN);

    // Check that a startscript is set
    if (startscript === undefined) {
      throw new Error('No startscript value set for NODEJSAPP "' + name + '"');
    }

    partData.path = "nodejsapps/" + partData.name + ".nodejsapp";
    super(directory, partData, false, "NODEJSAPP", overwrite, params);

    // Now validate the port
    this.validatePort(port);

    this.nodejsappsDir = this.bundleDirectory + "/nodejsapps";
    this.nodejsappFile = this.nodejsappsDir + "/" + partData.name + ".nodejsapp";
    this.nodejsappProfile = this.nodejsappsDir + "/" + partData.name + ".profile";
    this.nodejsappProfileLocal = "nodejsapps/" + partData.name + ".profile";
    this.overwrite = overwrite;
    this.bundleDirectory = directory;
    this.profileAlreadyExists = false;
    this.partXMLAlreadyExists = false;

    // Validate that the startscript resolves to something within the current directory
    startscript = this.normalizeAndValidateFileReference(startscript);

    this.createNodejsappXML(startscript);
    this.createNodejsappProfile(port);
  }

  /**
   * Get the NODEJSAPP BundlePart.
   *
   * @returns {INodejsappType}
   * @throws ImperativeError
   * @memberof NodejsappBundlePart
   */
  public getPart(): INodejsappType {
    return this.partXML;
  }

  /**
   * Get the NODEJSAPP BundlePart XML.
   *
   * @returns {string}
   * @throws ImperativeError
   * @memberof NodejsappBundlePart
   */
  public getPartXML(): string {
    return serialiser.parse(this.partXML) + "\n";
  }

  /**
   * Get the NODEJSAPP Profile text.
   *
   * @returns {string}
   * @throws ImperativeError
   * @memberof NodejsappBundlePart
   */
  public getProfile(): string {
    return this.profile;
  }

  /**
   * Perform whatever validation can be done in advance of attempting to save the
   * Nodejsapp, thereby reducing the possibility of a failure after some of the
   * bundle parts have already been persisted to the file system.
   *
   * @throws ImperativeError
   * @memberof Manifest
   */
  public prepareForSave() {
    // Does the nodejsapp directory already exist?
    if (!BundlePart.fs.existsSync(this.nodejsappsDir)) {

      // We'll have to create it during the save, do we have write permission?
      try {
        BundlePart.fs.accessSync(this.bundleDirectory, BundlePart.fs.constants.W_OK);
      }
      catch (err) {
        throw new Error("cics-deploy requires write permission to: " + this.bundleDirectory);
      }
      return;
    }
    // Do we have write permission to the nodejsapp dir?
    try {
        BundlePart.fs.accessSync(this.nodejsappsDir, BundlePart.fs.constants.W_OK);
    }
    catch (err) {
        throw new Error("cics-deploy requires write permission to: " + this.nodejsappsDir);
    }

   // Does the .nodejsapp appear to be saveable?
    this.partXMLAlreadyExists = BundlePart.alreadyExists(this.nodejsappFile, this.overwrite);

    // Does the .profile appear to be saveable?
    this.profileAlreadyExists = BundlePart.alreadyExists(this.nodejsappProfile, this.overwrite);
  }

  /**
   * Save the NODEJSAPP BundlePart. Any changes that have been made will be persisted.
   *
   * @throws ImperativeError
   * @memberof NodejsappBundlePart
   */
  public save() {
    // Does the nodejsapps directory exist? If not, create it.
    if (!BundlePart.fs.existsSync(this.nodejsappsDir)) {
       try {
         this.logCreation(this.nodejsappsDir, "    create");
         BundlePart.fs.mkdirSync(this.nodejsappsDir);
       }
       catch (err) {
         throw new Error("An error occurred attempting to create '" + this.nodejsappsDir + "': " + err.message);
       }
    }

    // Write the .nodejsapp file
    try {
      let action = "    create";
      if (this.partXMLAlreadyExists) {
        action = " overwrite";
      }
      this.logCreation(this.nodejsappFile, action);
      BundlePart.fs.writeFileSync(this.nodejsappFile, this.getPartXML(), "utf8");
    }
    catch (err) {
      throw new Error("An error occurred attempting to write nodejsapp file '" + this.nodejsappFile + "': " + err.message);
    }

    // Write the .profile file
    try {
      let action = "    create";
      if (this.partXMLAlreadyExists) {
        action = " overwrite";
      }
      this.logCreation(this.nodejsappProfile, action);
      BundlePart.fs.writeFileSync(this.nodejsappProfile, this.getProfile(), "utf8");
    }
    catch (err) {
      throw new Error("An error occurred attempting to write profile file '" + this.nodejsappProfile + "': " + err.message);
    }
  }

  private createNodejsappXML(startscript: string) {
    this.partXML = { nodejsapp:
                  {
                    xmlns: "http://www.ibm.com/xmlns/prod/cics/bundle/NODEJSAPP",
                    name: "",
                    startscript: "",
                    profile: "",
                    lerunopts: "DFHSJNRO"
                  }
                };
    this.partXML.nodejsapp.profile = this.nodejsappProfileLocal;
    this.partXML.nodejsapp.name = this.getPartData().name;
    this.partXML.nodejsapp.startscript = startscript;
  }

  private createNodejsappProfile(port: number) {
    const os = require("os");
    this.profile = TemplateNodejsappProfile.profile;

    if (port !== undefined) {
      this.profile = this.profile + "PORT=" + port.toString() + os.EOL;
    }
  }

  // if the port is set, it must be a valid number
  private validatePort(port: number) {
    if (port === undefined) {
      return;
    }
    if (!Number.isInteger(port)) {
      throw new Error("Supplied Port is not an integer: " + port);
    }
    if (port < 1 || port > NodejsappBundlePart.MAX_PORT) {
      throw new Error("Supplied Port is outside the range of 1-65535: " + port);
    }
  }
}
