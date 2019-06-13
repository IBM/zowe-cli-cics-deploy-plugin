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
    ParmValidator.validateDescription(params);
    ParmValidator.validateTimeout(params);
    ParmValidator.validateCicshlq(params);
    ParmValidator.validateCpsmhlq(params);
    ParmValidator.validateTargetStateDeploy(params);
    ParmValidator.validateVerbose(params);
    ParmValidator.validateJobcard(params);
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
    ParmValidator.validateCpsmhlq(params);
    ParmValidator.validateTargetStateUndeploy(params);
    ParmValidator.validateVerbose(params);
    ParmValidator.validateJobcard(params);
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
    const prof = params.profiles.get("cics-deploy");

    // const logger = Logger.getAppLogger();
    // logger.debug("Profile: " + JSON.stringify(prof));

    if (prof === undefined) {
      throw new Error('cics-deploy-profile "' + params.arguments["cics-deploy-profile"] + '" not found.');
    }
  }

  private static validateCicsplex(params: IHandlerParameters) {

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

  private static validateCpsmhlq(params: IHandlerParameters) {
    // cpsmhlq is mandatory
    if (params.arguments.cpsmhlq === undefined) {
      throw new Error("--cpsmhlq parameter is not set");
    }

    if (typeof params.arguments.cpsmhlq !== "string") {
      throw new Error("--cpsmhlq parameter is not a string");
    }

    const MAX_LEN = 35;
    if (params.arguments.cpsmhlq.length > MAX_LEN) {
      throw new Error("--cpsmhlq parameter is too long");
    }

    if (params.arguments.cpsmhlq === "") {
      throw new Error("--cpsmhlq parameter is empty");
    }
  }

  private static wrapJobcard(params: IHandlerParameters) {
    if (params.arguments.jobcard.indexOf("\\n") === -1) {
      // if the user hasn't embedded new-line characters into the jobcard
      // then we'll have to do that ourselves if the value is too long
      let jobcardLocal = params.arguments.jobcard;
      let jobcardNew = "";
      const MAX_JCL_LINE = 71;
      while (jobcardLocal.length > MAX_JCL_LINE) {
        const indexOflastComma = jobcardLocal.lastIndexOf(",", MAX_JCL_LINE);

        if (indexOflastComma === -1) {
          throw new Error("--jobcard parameter section cannot be split into 72 character lines: '" + jobcardLocal + "'.");
        }

        jobcardNew = jobcardNew + jobcardLocal.substring(0, indexOflastComma + 1) + "\n";
        jobcardLocal = "//         " + jobcardLocal.substring(indexOflastComma + 1);
      }
      jobcardNew = jobcardNew + jobcardLocal;
      params.arguments.jobcard = jobcardNew;
    }
    else {
      // if the user has embedded new-line characters within the jobcard
      // then resolve them, the user has taken responsibility for ensuring
      // line breaks are in suitable places.
      params.arguments.jobcard = params.arguments.jobcard.replace("\\n", "\n");
    }
  }

  private static validateJobcard(params: IHandlerParameters) {
    // jobcard is mandatory
    if (params.arguments.jobcard === undefined) {
      throw new Error("--jobcard parameter is not set");
    }

    if (typeof params.arguments.jobcard !== "string") {
      throw new Error("--jobcard parameter is not a string");
    }

    if (params.arguments.jobcard === "") {
      throw new Error("--jobcard parameter is empty");
    }

    // handle long jobcards
    ParmValidator.wrapJobcard(params);

    // split the jobcard into a comma separated list
    const jobcardParts = params.arguments.jobcard.split(",");
    const firstPart = jobcardParts[0].trim();

    // check that it starts with '//'
    if (firstPart.indexOf("//") !== 0) {
      throw new Error("--jobcard parameter does not start with //");
    }

    // split the first section of the jobcard into chunks
    // e.g. //DFHDPLOY JOB EXAMPLE,
    const firstPartParts = firstPart.split(" ");

    // check the initial word is max 10 chars long, eg //DFHDPLOY
    const jobname = firstPartParts[0].trim();
    const MAX_JOBNAME = 10;
    const MIN_JOBNAME = 3;
    if (jobname.length > MAX_JOBNAME || jobname.length < MIN_JOBNAME) {
      throw new Error("--jobcard parameter does not start with a suitable jobname: '" + jobname + " '");
    }

    // Check that there is a second word
    if (firstPartParts.length < 2) {
      throw new Error("--jobcard parameter does not have JOB keyword after the jobname.");
    }

    // check the second word is 'JOB'
    const jobkeyword = firstPartParts[1].trim();
    if (jobkeyword !== "JOB") {
      throw new Error("--jobcard parameter does not have JOB keyword after the jobname. Expected 'JOB' but found '" + jobkeyword + "'");
    }
  }

  private static validateTargetStateDeploy(params: IHandlerParameters) {
    // targetstate is mandatory (a default value should be set by Imperative)
    if (params.arguments.targetstate === undefined) {
      throw new Error("--targetstate parameter is not set");
    }

    if (typeof params.arguments.targetstate !== "string") {
      throw new Error("--targetstate parameter is not a string");
    }

    if (params.arguments.targetstate === "") {
      throw new Error("--targetstate parameter is empty");
    }

    // tolerate mixed case
    params.arguments.targetstate = params.arguments.targetstate.toUpperCase();

    if (params.arguments.targetstate !== "DISABLED" &&
        params.arguments.targetstate !== "ENABLED" &&
        params.arguments.targetstate !== "AVAILABLE") {
      throw new Error("--targetstate has invalid value. Found " +
        params.arguments.targetstate +
        " but expected one of DISABLED, ENABLED or AVAILABLE.");
    }
  }

  private static validateTargetStateUndeploy(params: IHandlerParameters) {
    // targetstate is mandatory (a default value should be set by Imperative)
    if (params.arguments.targetstate === undefined) {
      throw new Error("--targetstate parameter is not set");
    }

    if (typeof params.arguments.targetstate !== "string") {
      throw new Error("--targetstate parameter is not a string");
    }

    if (params.arguments.targetstate === "") {
      throw new Error("--targetstate parameter is empty");
    }

    // tolerate mixed case
    params.arguments.targetstate = params.arguments.targetstate.toUpperCase();

    if (params.arguments.targetstate !== "UNAVAILABLE" &&
        params.arguments.targetstate !== "DISABLED" &&
        params.arguments.targetstate !== "DISCARDED") {
      throw new Error("--targetstate has invalid value. Found " +
        params.arguments.targetstate +
        " but expected one of UNAVAILABLE, DISABLED or DISCARDED.");
    }
  }

  private static validateVerbose(params: IHandlerParameters) {
    // verbose is optional
    if (params.arguments.verbose === undefined) {
      return;
    }

    if (typeof params.arguments.verbose !== "boolean") {
      throw new Error("--verbose parameter is not boolean");
    }
  }

  private static validateDescription(params: IHandlerParameters) {
    // description is optional
    if (params.arguments.description === undefined) {
      return;
    }

    if (typeof params.arguments.description !== "string") {
      throw new Error("--description parameter is not a string");
    }

    const MAX_LEN = 58;
    if (params.arguments.description.length > MAX_LEN) {
      throw new Error("--description parameter is too long");
    }

    if (params.arguments.description === "") {
      throw new Error("--description parameter is empty");
    }
  }

}
