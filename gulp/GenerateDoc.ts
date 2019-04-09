/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
* Copyright Contributors to the Zowe Project.
* Copyright IBM Corp. 2019
*
*/

import { ITaskFunction } from "./GulpHelpers";
import * as util from "util";
import { DefaultHelpGenerator, Imperative, ImperativeConfig } from "@zowe/imperative";

const gutil = require("gulp-util");
const fs = require("fs");
const mustache = require("mustache");
const clearRequire = require("clear-require");


const DISPLAY_NAME = "Zowe CLI";

const BINARY_NAME = "zowe";

const doc: ITaskFunction = async () => {
    process.env.FORCE_COLOR = "0";

    // Get all command definitions
    const myConfig = ImperativeConfig.instance;
    // myConfig.callerLocation = __dirname;
    myConfig.loadedConfig = require("../src/imperative");

    myConfig.loadedConfig.commandModuleGlobs = ["src/cli/*/*.definition!(.d).*s"];


    // Need to set this for the internal caller location so that the commandModuleGlobs finds the commands
    process.mainModule.filename = __dirname + "/../package.json";

    await Imperative.init(myConfig.loadedConfig);
    const loadedDefinitions = Imperative.fullCommandTree;
    clearRequire.all(); // in case the code has changed, reload any code

    let totalCommands = 0;
    let markdownContent = "# Zowe CLI cics-deploy plugin command reference\n\n";

    markdownContent += "{{tableOfContents}}\n\n";
    let tableOfContentsText = "### Table of Contents\n";

    const tabIndent = "\t";
    let oldCommandName = "";

    function getGroupHelp(definition: any, indentLevel: number = 0) {
        let commandNameSummary = definition.name;
        if (definition.aliases.length > 0 &&
            !(definition.aliases[0].trim().length === 0 && definition.aliases.length === 1)) {
            commandNameSummary += " | " + definition.aliases.join(" | ");
        }
        if (definition.experimental) {
            commandNameSummary += " (experimental)";
        }

        const anchorTag = "module-" + definition.name;
        tableOfContentsText += util.format("%s* [%s](#%s)\n", tabIndent.repeat(indentLevel), commandNameSummary, anchorTag);

        markdownContent += util.format("#%s %s<a name=\"%s\"></a>\n", "#".repeat(indentLevel), commandNameSummary, anchorTag);
        markdownContent += definition.description ? definition.description.trim() + "\n" : "";

        for (const child of definition.children) {
            if (child.type !== "command") {
                oldCommandName = " " + definition.name;
                getGroupHelp(child, indentLevel + 1);
                continue;
            }
            totalCommands++;
            const childAnchorTag = "command-" + child.name.replace(/\s/g, "-");
            let childNameSummary = child.name;
            if (child.experimental) {
                childNameSummary += " (experimental)";
            }

            tableOfContentsText += util.format("%s* [%s](#%s)\n", tabIndent.repeat(indentLevel + 1), childNameSummary, childAnchorTag);
            markdownContent += util.format("##%s %s<a name=\"%s\"></a>\n", "#".repeat(indentLevel), childNameSummary, childAnchorTag);

            const helpGen = new DefaultHelpGenerator({
                produceMarkdown: true,
                rootCommandName: BINARY_NAME + oldCommandName
            } as any, {
                commandDefinition: child,
                fullCommandTree: definition
            });
            markdownContent += helpGen.buildHelp();
        }
        oldCommandName = "";
    }

    // --------------------------------------------------------
    // Remove duplicates from Imperative.fullCommandTree
    // Also filter out built-in commands we don't want
    const allDefSoFar: string[] = [];
    const cmdNamesToRemove = ["config", "plugins"];
    const definitionsArray = loadedDefinitions.children.sort((a, b) => a.name.localeCompare(b.name)).filter((cmdDef) => {
        if (cmdNamesToRemove.indexOf(cmdDef.name) !== -1) {
            return false;
        }
        if (allDefSoFar.indexOf(cmdDef.name) === -1) {
            allDefSoFar.push(cmdDef.name);
            return true;
        }
        return false;
    });
    // --------------------------------------------------------

    for (const def of definitionsArray) {
        getGroupHelp(def);
    }

    markdownContent = mustache.render(markdownContent, {tableOfContents: tableOfContentsText});
    fs.writeFileSync("docs/CLIReadme.md", markdownContent);
    gutil.log(gutil.colors.blue("Updated docs/CLIReadme.md with definitions of " + totalCommands + " commands"));

    process.env.FORCE_COLOR = undefined;
};
doc.description = "Create documentation from the CLI help";

exports.doc = doc;
