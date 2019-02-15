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

const readline = require("readline");

/**
 * Ask our user a question on the terminal's command line.
 * The script will wait for the user to type one line of text.
 *
 * @param {String} questionText - The text of the question to be asked.
 *
 * @returns A Promise containing the answer text that the user typed.
 */
function askUser(questionText) {
    const conversation = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        history: 5
    });

    const answerProm = new Promise(function(resolve) {
        conversation.question(questionText, function(answer) {
            conversation.close();
            resolve(answer);
        });
    });
    return answerProm;
}

module.exports = { askUser };
