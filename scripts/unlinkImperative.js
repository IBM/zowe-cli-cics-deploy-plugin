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

/*
 * Script to remove the symbolic link to imperative after a build is complete
 */

const fs = require("fs");

const ok = 0;
const error = 1;
const impSymLinkPath = "./node_modules/@brightside/imperative";

if (fs.existsSync(impSymLinkPath)) {
    // Get the file status to determine if it is a symlink.
    const fileStats = fs.lstatSync(impSymLinkPath);
    if (fileStats.isSymbolicLink()) {
        fs.unlinkSync(impSymLinkPath, (err) => {
            if (err) {
                console.log("\nEncountered the following error trying to delete\n    " +
                    impSymLinkPath + "\n" + err.message
                );
                process.exit(error);
            }
        });
        console.log("Deleted symbolic link " + impSymLinkPath);
    }
}

process.exit(ok);