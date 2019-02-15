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

/** Create links for core and imperative within the plugin's
 * ./node_modules/@brightside directory (if they do not already exist)
 * to directories within the CLI project directory.
 *
 * You can specify either:
 * 1.  The absolute path to a CLI project directory (ie the directory that
 *     contains the CLI's package.json). For example:
 *         /path/to/your/zowe/directory
 * 2.  The string '-p', which will interactively prompt for your CLI directory.
 */

const askUser = require("./askUser").askUser;
const fs = require("fs");
const path = require("path");

const promptForCliPath = "-p";
const exitWithErr = 1;
const exitOk = 0;

if (process.argv.length < 3) {
    console.log("One parameter is required. It specifies how to determine the path to\n" +
        "your CLI's project root directory when a symbolic link from your plugin to\n" +
        "your CLI directory does not already exist.\n\n" +
        "Specify one of the following:\n" +
        "1. The absolute path to your CLI's project root directory  -- or --\n" +
        "2. The string '" + promptForCliPath + "', which will interactively prompt for your CLI directory."
    );
    process.exit(exitWithErr);
}

/* We put the bulk of the work into an async function because
 * we may have to await the user's response to a prompt.
 */
linkPluginToCli_promise(process.argv[2])
    .then(cliImpPath => {
        console.log("Symlinks from plugin to CLI successfully confirmed.");
        process.exit(exitOk);
    }).catch(err => {
    console.log(err + "Unable to establish required symlinks from this plugin to your CLI.\n" +
        "You will be unable to build this plugin."
    );
    process.exit(exitWithErr);
});

//____________________________________________________________________________

/**
 * Create links for core and imperative within the plugin's
 * ./node_modules/@brightside directory to the developer's
 * <BrightsideSourceDirectory> and its node_modules/@bright/imperative
 * directories.
 *
 * @param {String} cliProjPath - This argaument can acceopt either:
 *     1. The absolute path to your CLI's project root directory
 *        (ie the directory that contains the CLI's package.json).
 *     2. The string '-p', which will interactively prompt for your CLI directory.
 *        This scoend option is the default value.
 *
 * @returns {Boolean} A promise containing true upon success.
 *     Otherwise, a promise containing an error.
 */
async function linkPluginToCli_promise(cliProjPath = promptForCliPath) {
    if (cliProjPath.charAt(0) === "-") {
        if (cliProjPath.toLowerCase() !== promptForCliPath) {
            return Promise.reject("The only acceptable flag is '" + promptForCliPath +
                "'. You specified '" + cliProjPath + "'.\n"
            );
        }
        cliProjPath = cliProjPath.toLowerCase();
    }

    // create directories to the plugin's @brightside directory
    let pluginBsPath = "./";
    const dirsToBsModules = ["node_modules", "@brightside"];
    for (let dir of dirsToBsModules) {
        pluginBsPath = path.join(pluginBsPath, dir);
        if (!fs.existsSync(pluginBsPath)) {
            fs.mkdirSync(pluginBsPath);
        }
    }

    // array of links that we want to make
    const coreInx = 0;
    const impInx = 1;
    const linksToMake = [
        {
            pluginPath: path.resolve(pluginBsPath, "core"),
            cliSubdirPath: ""
        },
        {
            pluginPath: path.resolve(pluginBsPath, "imperative"),
            cliSubdirPath: path.join("node_modules", "@brightside", "imperative")
        }
    ];

    try {
        for (let linkInx = coreInx; linkInx < linksToMake.length; linkInx++) {
            let fileStats = null;
            if (fs.existsSync(linksToMake[linkInx].pluginPath)) {
                fileStats = fs.lstatSync(linksToMake[linkInx].pluginPath);
                if (!fileStats.isSymbolicLink()) {
                    return Promise.reject("We expected the directory\n   " +
                        linksToMake[linkInx].pluginPath +
                        "\nto be a symbolic link, but it is not.\n" +
                        "You must manually remove this directory and try again.\n" +
                        "You could also run 'node ./scripts/createPackageJson.js' to " +
                        "start over again.\n"
                    );
                }

                // get the target path that nextLink.pluginPath points to.
                cliTargetPath = fs.readlinkSync(linksToMake[linkInx].pluginPath);
                if (!fs.existsSync(cliTargetPath)) {
                    return Promise.reject("The symbolic link\n   " + linksToMake[linkInx].pluginPath +
                        "\npoints to\n   " + cliTargetPath +
                        "\nwhich does not exist." +
                        "\n\nYour CLI directory must exist. You can clone it from Github\n" +
                        "and build it, or you can install it from an NPM registry.\n"
                    );
                }

                // The symlink and its target exist. We are done.
                console.log("\nLink already exists from\n   " +
                    linksToMake[linkInx].pluginPath + "\nto\n   " +
                    cliTargetPath + "\n"
                );

                // if all links exist, we are done
                if (linkInx === linksToMake.length - 1) {
                    return Promise.resolve(true);
                }
                continue;
            }

            /* When no CLI project directory is known, ask for path to the
             * CLI project directory directory, so that we can make a link.
             * We only need ask on the first iteration because the second
             * link is in a subdirectory of the original.
             */
            if (cliProjPath === promptForCliPath) {
                console.log("Please enter the absolute path to your host CLI's project directory.\n" +
                    "For example:  /path/to/your/zoweCLI/directory\n" +
                    "If you press the ENTER key, we will use your globally-installed Zowe CLI.\n" +
                    "You can enter 'q' to quit."
                );
            }
            while (cliProjPath === promptForCliPath) {
                cliProjPath = await askUser("\nEnter path: ");
                if (cliProjPath.toLowerCase() === "q") {
                    return Promise.reject("You asked to quit.\n");
                }

                if (cliProjPath === promptForCliPath || cliProjPath.trim() === "") {
                    // find the globally installed brightside
                    const npmBin = require("os").platform() === "win32" ? "npm.cmd" : "npm";
                    const npmResult = require("child_process").spawnSync(npmBin, ["prefix", "-g"]);
                    if (npmResult.status !== 0) {
                        return Promise.reject("Encountered an error trying to find the globally installed Zowe CLI:\n" +
                            npmResult
                        );
                    }

                    const installPath = npmResult.stdout.toString().trim();
                    cliProjPath = installPath + "/node_modules/@brightside/core";
                    console.log("Defaulted to '%s'", cliProjPath);
                }

                if (!fs.existsSync(cliProjPath)) {
                    console.log("The directory '" + cliProjPath + "' does not exist.");
                    cliProjPath = promptForCliPath;
                }
            }

            /* If the path was specified on the command line, we skipped the
             * existence test above, so we test again here.
             */
            if (!fs.existsSync(cliProjPath)) {
                return Promise.reject("The specified CLI project directory '" +
                    cliProjPath + "' does not exist.\n"
                );
            }

            // Create a symlink to the existing CLI directory.
            cliPath = path.join(cliProjPath, linksToMake[linkInx].cliSubdirPath);
            fs.symlinkSync(cliPath, linksToMake[linkInx].pluginPath, "dir");
            console.log("\nCreated symbolic link from\n   " +
                linksToMake[linkInx].pluginPath + "\nto\n   " +
                cliPath + "\n"
            );

            // if all links have been created, we are done
            if (linkInx === linksToMake.length - 1) {
                return Promise.resolve(true);
            }
        }
    } catch (ioExcept) {
        return Promise.reject("Failed due to an I/O error. Details follow:\n" +
            ioExcept.message
        );
    }
}
