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

import { IHandlerParameters, Logger } from "@brightside/imperative";


/**
 * Class to represent a CICS Bundle manifest.
 *
 * @export
 * @class Manifest
 */
export class ParmValidator {

  public static validateDeploy(params: IHandlerParameters) {

    // Validate the parms that are valid for Deploy
    ParmValidator.validateName(params);
    ParmValidator.validateBundledir(params);
    ParmValidator.validateCicsDeployProfile(params);
    ParmValidator.validateCicsplex(params);
    ParmValidator.validateScope(params);
    ParmValidator.validateCsdgroup(params);
    ParmValidator.validateResgroup(params);
    ParmValidator.validateTimeout(params);
    ParmValidator.validateCicshlq(params);
  }

  public static validateUndeploy(params: IHandlerParameters) {

    // Validate the parms that are valid for Undeploy
    ParmValidator.validateName(params);
    ParmValidator.validateCicsDeployProfile(params);
    ParmValidator.validateCicsplex(params);
    ParmValidator.validateScope(params);
    ParmValidator.validateCsdgroup(params);
    ParmValidator.validateResgroup(params);
    ParmValidator.validateTimeout(params);
    ParmValidator.validateCicshlq(params);
  }

  private static validateName(params: IHandlerParameters) {
    // Name is mandatory
    if (params.arguments.name === undefined) {
      throw new Error("--name parameter is not set");
    }

    if (typeof params.arguments.name !== "string") {
      throw new Error("--name parameter is not a string");
    }

    const MAX_LEN = 8;
    if (params.arguments.name.length > MAX_LEN) {
      throw new Error("--name parameter is too long");
    }

    if (params.arguments.name === "") {
      throw new Error("--name parameter is empty");
    }
  }

  private static validateBundledir(params: IHandlerParameters) {
    // bundleDir is mandatory (but only for deploy. not undeploy)
    if (params.arguments.bundledir === undefined) {
      throw new Error("--bundledir parameter is not set");
    }

    if (typeof params.arguments.bundledir !== "string") {
      throw new Error("--bundledir parameter is not a string");
    }

    const MAX_LEN = 255;
    if (params.arguments.bundledir.length > MAX_LEN) {
      throw new Error("--bundledir parameter is too long");
    }

    if (params.arguments.bundledir === "") {
      throw new Error("--bundledir parameter is empty");
    }
  }

  private static validateCicsDeployProfile(params: IHandlerParameters) {

    // if missing, then CICSPlex and Scope must be set
    if (params.arguments["cics-deploy-profile"] === undefined) {
      if (params.arguments.cicsplex === undefined ||
          params.arguments.scope === undefined) {
          throw new Error("either --cics-deploy-profile or both --cicsplex and --scope must be set");
      }
      return;
    }

    if (typeof params.arguments["cics-deploy-profile"] !== "string") {
      throw new Error("--cics-deploy-profile parameter is not a string");
    }

    if (params.arguments["cics-deploy-profile"] === "") {
      throw new Error("--cics-deploy-profile parameter is empty");
    }

    // Now check that the profile can be found
    let prof;
    try {
      prof = params.profiles.get("cics-deploy");
    }
    catch (error) {
      // If something goes wrong then 'prof' will remain uninitialised
      // Note: this can be a common failure for the unit tests
    }

    // const logger = Logger.getAppLogger();
    // logger.debug("Profile: " + JSON.stringify(prof));

    if (prof === undefined) {
      throw new Error('cics-deploy-profile "' + params.arguments["cics-deploy-profile"] + '" not found.');
    }
  }

  private static validateCicsplex(params: IHandlerParameters) {
    // cicsplex is optional
    if (params.arguments.cicsplex === undefined) {
      return;
    }

    if (typeof params.arguments.cicsplex !== "string") {
      throw new Error("--cicsplex parameter is not a string");
    }

    const MAX_LEN = 8;
    if (params.arguments.cicsplex.length > MAX_LEN) {
      throw new Error("--cicsplex parameter is too long");
    }

    if (params.arguments.cicsplex === "") {
      throw new Error("--cicsplex parameter is empty");
    }
  }

  private static validateScope(params: IHandlerParameters) {
    // scope is optional
    if (params.arguments.scope === undefined) {
      return;
    }

    if (typeof params.arguments.scope !== "string") {
      throw new Error("--scope parameter is not a string");
    }

    const MAX_LEN = 8;
    if (params.arguments.scope.length > MAX_LEN) {
      throw new Error("--scope parameter is too long");
    }

    if (params.arguments.scope === "") {
      throw new Error("--scope parameter is empty");
    }

    // if scope set, either csdgroup or resgroup is also needed
    if (params.arguments.csdgroup === undefined &&
        params.arguments.resgroup === undefined) {
      throw new Error("--scope parameter requires either --csdgroup or --resgroup to be set");
    }
  }

  private static validateCsdgroup(params: IHandlerParameters) {
    // csdgroup is optional
    if (params.arguments.csdgroup === undefined) {
      return;
    }

    // if set, it's mutually exclusive with resgroup
    if (params.arguments.resgroup !== undefined) {
      throw new Error("--csdgroup and --resgroup cannot both be set");
    }

    if (typeof params.arguments.csdgroup !== "string") {
      throw new Error("--csdgroup parameter is not a string");
    }

    const MAX_LEN = 8;
    if (params.arguments.csdgroup.length > MAX_LEN) {
      throw new Error("--csdgroup parameter is too long");
    }

    if (params.arguments.csdgroup === "") {
      throw new Error("--csdgroup parameter is empty");
    }
  }

  private static validateResgroup(params: IHandlerParameters) {
    // resgroup is optional
    if (params.arguments.resgroup === undefined) {
      return;
    }

    if (typeof params.arguments.resgroup !== "string") {
      throw new Error("--resgroup parameter is not a string");
    }

    const MAX_LEN = 8;
    if (params.arguments.resgroup.length > MAX_LEN) {
      throw new Error("--resgroup parameter is too long");
    }

    if (params.arguments.resgroup === "") {
      throw new Error("--resgroup parameter is empty");
    }
  }

  private static validateTimeout(params: IHandlerParameters) {
    // timeout is optional
    if (params.arguments.timeout === undefined) {
      return;
    }

    if (Number.isInteger(params.arguments.timeout) === false) {
      throw new Error("--timeout parameter is not an integer");
    }

    const MAX_VAL = 1800;
    if (params.arguments.timeout > MAX_VAL) {
      throw new Error("--timeout parameter is too large");
    }

    if (params.arguments.timeout < 1) {
      throw new Error("--timeout parameter is too small");
    }
  }

  private static validateCicshlq(params: IHandlerParameters) {
    // cicshlq is mandatory
    if (params.arguments.cicshlq === undefined) {
      throw new Error("--cicshlq parameter is not set");
    }

    if (typeof params.arguments.cicshlq !== "string") {
      throw new Error("--cicshlq parameter is not a string");
    }

    const MAX_LEN = 35;
    if (params.arguments.cicshlq.length > MAX_LEN) {
      throw new Error("--cicshlq parameter is too long");
    }

    if (params.arguments.cicshlq === "") {
      throw new Error("--cicshlq parameter is empty");
    }
  }
}
