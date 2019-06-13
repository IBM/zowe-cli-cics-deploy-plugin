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

import { Bundle } from "./Bundle";
import { Logger, IHandlerParameters } from "@brightside/imperative";


/**
 * Utility class to bundle enable the working directory. If a package.json file is
 * found then the contents are processed and a basic NODEJSAPP resource is added
 * to the Bundle.
 *
 * @export
 * @class AutoBundler
 */
export class AutoBundler {

  private MAX_NODEJSAPP_LEN = 32;
  private bundle: Bundle;
  private fs = require("fs");
  private path = require("path");
  private packageJsonFile: string;
  private bundleidOverride: string;
  private bundleMajorVerOverride: number;
  private bundleMinorVerOverride: number;
  private bundleMicroVerOverride: number;
  private nodejsappOverride: string;
  private startscriptOverride: string;
  private portOverride: number;
  private bundleDirectory: string;
  private overwrite: boolean = false;
  private merge: boolean = false;

  /**
   * Constructor to perform the automatic bundle enablement.
   * @param {string} directory - The bundle directory.
   * @param {IHandlerParameters} params - The Imperative handler parameters
   * @static
   * @throws ImperativeError
   * @memberof AutoBundler
   */
  constructor(directory: string, params: IHandlerParameters) {

    this.bundleDirectory = this.path.normalize(directory);
    this.packageJsonFile = directory + "/package.json";
    this.validateMergeAndOverwrite(params.arguments.merge, params.arguments.overwrite);
    this.bundle = new Bundle(this.bundleDirectory, this.merge, this.overwrite, params);
    this.discoverArguments(params);

    this.autoDetectWorkdirContent(params);
  }

  /**
   * Returns the generated Bundle instance.
   * @throws ImperativeError
   * @returns {Bundle}
   * @memberof AutoBundler
   */
  public getBundle(): Bundle {
    return this.bundle;
  }

  /**
   * Save the generated Bundle
   *
   * @throws ImperativeError
   * @memberof AutoBundler
   */
  public save() {
    this.bundle.save();
  }

  private autoDetectWorkdirContent(params: IHandlerParameters) {

    // Look for a package.json file; if found, process the contents for a NODEJSAPP
    if (this.fs.existsSync(this.packageJsonFile)) {
      this.processPackageJson(params);
    }
    else {
      // If we get here then we've not found a package.json file. it remains possible
      // that sufficient command line parameters have been set to allow a NODEJSAPP
      // to be created. If so, process them.
      if (this.startscriptOverride !== undefined ||
          this.nodejsappOverride   !== undefined ||
          this.portOverride        !== undefined ) {
        this.bundle.addNodejsappDefinition(this.nodejsappOverride, this.startscriptOverride, this.portOverride);
        try {
          const msg = 'define : NODEJSAPP "' + this.nodejsappOverride + '" with startscript "' + this.startscriptOverride + '"';
          params.response.console.log(msg);

          // Also log the message for posterity
          if (params.arguments.silent === undefined) {
            const logger = Logger.getAppLogger();
            logger.debug(msg);
          }
        }
        catch (error) {
          // logging errors can be thrown in some of the mocked tests... just ignore it.
        }
      }
    }
  }

  private processPackageJson(params: IHandlerParameters) {

    // read the package.json file
    let pj;
    try {
      pj = JSON.parse(this.fs.readFileSync(this.packageJsonFile, "utf8"));
    }
    catch (exception)
    {
      throw new Error("Parsing error occurred reading package.json: " + exception.message);
    }

    // Find the name from package.json
    const name = pj.name;

    // Set the name of the Bundle based on what was found
    if (this.bundleidOverride === undefined) {
      if (name === undefined) {
        throw new Error("No bundleid value set");
      }
      this.bundle.setId(name);
    }

    // Recover the mangled variant of the name (it may be different from what we started with)
    const bundleName = this.bundle.getId();

    // Set the Bundle version to 1.0.0
    if (this.bundleMajorVerOverride === undefined) {
      this.bundle.setVersion(1, 0, 0);
    }

    // truncate the Bundle name to find a suitable NODEJSAPP resource name
    let njappname = this.nodejsappOverride;
    if (njappname === undefined) {
      njappname = bundleName;
    }
    njappname = njappname.substring(0, this.MAX_NODEJSAPP_LEN);

    // get the start script
    let ss = this.startscriptOverride;
    let fullSS = ss;
    if (ss === undefined) {
      if (pj.scripts !== undefined) {
        ss = pj.scripts.start;
      }
      if (ss !== undefined) {
        // Remove the first word from the value (which will be the node command)
        ss = ss.substr(ss.indexOf(" ") + 1).trim();
        fullSS = this.bundleDirectory + "/" + ss;
      }
      // If there's no start script, try the main script instead
      else {
        ss = pj.main;

        if (ss !== undefined) {
         fullSS = this.bundleDirectory + "/" + pj.main;
        }
      }
    }

    // Add the NODEJSAPP to the Bundle
    this.bundle.addNodejsappDefinition(njappname, fullSS, this.portOverride);
    try {
      // Construct an info message to report that the NODEJSAPP has been created
      const msg = '    define : NODEJSAPP "' + njappname + '" with startscript "' + ss + '"';

      // log the message to the console for the uesr
      params.response.console.log(msg);

      // Also log the message for posterity
      if (params.arguments.silent === undefined) {
        const logger = Logger.getAppLogger();
        logger.debug(msg);
      }
    }
    catch (error) {
      // logging errors can be thrown in some of the mocked tests... just ignore it.
    }
  }

  private discoverArguments(params: IHandlerParameters) {

    const args = params.arguments;

    if (args.bundleid !== undefined) {
      this.validateBundleId(args.bundleid);
    }
    if (args.bundleversion !== undefined) {
      this.validateBundleVer(args.bundleversion);
    }
    if (args.nodejsapp !== undefined) {
      this.validateNodejsapp(args.nodejsapp);
    }
    if (args.startscript !== undefined) {
      this.validateStartscript(args.startscript);
    }
    if (args.port !== undefined) {
      this.validatePort(args.port);
    }
  }

  private validateBundleId(value: string) {
    this.bundleidOverride = value;
    this.bundle.setId(this.bundleidOverride);
  }

  private validateBundleVer(value: string) {
    const splitString = value.split(".");
    this.bundleMajorVerOverride = parseInt(splitString[0], 10);
    this.bundleMinorVerOverride = parseInt(splitString[1], 10);
    this.bundleMicroVerOverride = parseInt(splitString[2], 10);
    this.bundle.setVersion(this.bundleMajorVerOverride,
                           this.bundleMinorVerOverride,
                           this.bundleMicroVerOverride);
  }

  private validateNodejsapp(value: string) {
    this.nodejsappOverride = value;
  }

  private validateStartscript(value: string) {
    this.startscriptOverride = value;
  }

  private validatePort(value: string) {
    this.portOverride = parseInt(value, 10);
  }

  private validateMergeAndOverwrite(merge: boolean, overwrite: boolean) {
    if (merge === true && overwrite !== true) {
      throw new Error("--merge requires the use of --overwrite");
    }
    this.merge = merge;
    this.overwrite = overwrite;
  }
}
