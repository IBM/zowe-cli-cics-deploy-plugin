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
 * Script to create a package.json file for the application in this directory.
 * For help, type:
 *    node scripts/createPackageJson.js
 */

const fs = require('fs');
const path = require("path");
const replVars = require("./ReplaceVars");

// give help when no parameter is supplied
if (process.argv.length < 3) {
    const helpMsg =
        "This command creates a package.json file for an Imperative application.\n\n" +
        "Format:  node " + path.normalize("./scripts/createPackageJson.js") +
        "  cli | plugin\n\n" +
        "It creates a different package.json for a command line application (CLI)\n" +
        "than it does for a plugin application. However, the source of the\n" +
        "application can remain the same for each type of deliverable. Just use\n" +
        "this command to create the appropriate package.json file. You can\n" +
        "repeatedly re-run this command to switch the nature of your package.json,\n" +
        "and then re-install your application.";
    console.log(helpMsg);
    return;
}

// verify our argument
const packageTypeArg = process.argv[2];
const packageType = packageTypeArg.toLowerCase();
if (packageType !== "cli" && packageType !== "plugin") {
    const errMsg =
        "The specified argument = '" + packageTypeArg + "' is invalid.\n" +
        "Type 'node " + path.normalize("./scripts/createPackageJson.js") +
        "' for help.\n" +
        "A package.json file was not created.";
    console.log(errMsg);
    return;
}

// Define the variable replacements to be applied to package.json
let varsToReplace = {};
let dependencyType = "dependencyTypeNotAssigned";
if (packageType === "plugin") {
    dependencyType = "peerDependencies";
    varsToReplace["{LinkPluginToCli}"] = "node scripts/linkPluginToCli.js -p &&";
} else {
    dependencyType = "dependencies";
    varsToReplace["{LinkPluginToCli}"] = "";
}

// copy items from BrightDependencies into the right type of dependency
const templateBrightDepProp = "BrightDependencies";
const coreProp = "@brightside/core";
const impProp = "@brightside/imperative";

let pkgJsonContents = JSON.parse(fs.readFileSync("./package_template.json", "utf8"));
if (pkgJsonContents[dependencyType] == null) {
    // initialize the dependency type if there is no peerDependencies/dependencies field
    pkgJsonContents[dependencyType] = {};
}
pkgJsonContents[dependencyType][coreProp] = pkgJsonContents[templateBrightDepProp][coreProp];
pkgJsonContents[dependencyType][impProp] = pkgJsonContents[templateBrightDepProp][impProp];

// delete the BrightDependencies property
delete pkgJsonContents[templateBrightDepProp];

// replace variables with actions to make and remove symlinks
pkgJsonContents = replVars.replaceVarsInString(JSON.stringify(pkgJsonContents, null, 2), varsToReplace);
fs.writeFileSync("./package.json", pkgJsonContents, "utf8");

/* Whenever we re-create package.json, ensure that no old
 * core or imperative directories are still around.
 */
removeDirTree("./node_modules/@brightside/core");
removeDirTree("./node_modules/@brightside/imperative");

console.log("Created a package.json file for a " + packageType + ".\n" +
    "You should now install and build this app with:\n" +
    "    npm install   -and-\n" +
    "    npm run build"
);

// ___________________________________________________________________________
/**
 * Remove all files and subdirectories of the specified directory.
 *
 * @params {string} pathToTreeToRemove - Path to top directory of the tree
 *      to remove.
 */
function removeDirTree(pathToTreeToRemove) {
    // if pathToTreeToRemove is a symlink, just remove the link file
    if (fs.existsSync(pathToTreeToRemove)) {
        let fileStats = fs.lstatSync(pathToTreeToRemove);
        if (fileStats.isSymbolicLink() || fileStats.isFile()) {
            fs.unlinkSync(pathToTreeToRemove);
            return;
        }

        // read all of the children of this directory
        fs.readdirSync(pathToTreeToRemove).forEach(function(file, index) {
            // recursively remove the child
            removeDirTree(pathToTreeToRemove + path.sep + file);
        });

        // remove our starting irectory
        fs.rmdirSync(pathToTreeToRemove);
    }
}
