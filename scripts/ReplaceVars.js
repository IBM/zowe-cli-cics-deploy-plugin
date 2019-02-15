/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
* Copyright Contributors to the Zowe Project.
*
*/

const fs = require("fs");

//____________________________________________________________________________
/**
 * Within the text of FileToReplace, replace all of occurrances of
 * variable names (specified as keys in varToValMap) with their values.
 *
 * @param {String} fileToReplace - The name of the text file for which
 *    we want to replace variables with their values.
 *
 * @param {Object} varToValMap - A map of variable names. See replaceVarsInString()
 *     for details.
 *
 * @returns {String} - The contents of FileToReplace with all variables
 *    replaced with their values.
 */
function replaceVarsInFile(fileToReplace, varToValMap) {
    const fileContents = fs.readFileSync(fileToReplace, "utf8");
    return replaceVarsInString(fileContents, varToValMap);
}

//____________________________________________________________________________
/**
 * Within stringToReplace, replace all of occurrances of
 * variable names (specified as keys in varToValMap) with their values.
 *
 * @param {String} stringToReplace - The string into which we want to replace
 *    variables with their values.
 *
 * @param {Object} varToValMap - A map of variable names to values used
 *    to replace occurrences of the names within stringToReplace.
 *    When using special characters to make your variable names stand out,
 *    within stringToReplace, you must avoid characters that are special
 *    to regular expressions (like $).
 *
 * @returns {String} - The contents of stringToReplace with all variables
 *    replaced with their values.
 */
function replaceVarsInString(stringToReplace, varToValMap) {
    // Iterate through keys. Replace each key with its value in stringToReplace.
    let replacedString = stringToReplace;
    Object.keys(varToValMap).forEach(varName => {
        const varMatcher = new RegExp(varName, 'g');
        replacedString = replacedString.replace(varMatcher, varToValMap[varName]);
    });
    return replacedString;
}
//____________________________________________________________________________

module.exports = { replaceVarsInFile, replaceVarsInString };
