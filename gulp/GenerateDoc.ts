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
import { DefaultHelpGenerator, Imperative, ImperativeConfig, ICommandDefinition } from "@brightside/imperative";

const gutil = require("gulp-util");
const fs = require("fs");
const mustache = require("mustache");
const clearRequire = require("clear-require");


const DISPLAY_NAME = "Zowe CLI";

const BINARY_NAME = "zowe";

const JEKYLL_FRONTMATTER = `---
title: Zowe CLI cics-deploy plugin command reference
keywords:
summary: "This section contains syntax reference information for the Zowe CLI CICS deploy plugin"
sidebar: cdp_sidebar
permalink: cdp-CLIReadMe.html
folder: cdp
toc: true
---\n`

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
    //let markdownContent = "# Zowe CLI cics-deploy plugin command reference\n\n";
    let markdownContent = '';

    //markdownContent += "{{tableOfContents}}\n\n";
    let tableOfContentsText = "### Table of Contents\n";
    //let tableOfContentsText = '';

    const tabIndent = "\t";
    let oldCommandName = "";

    // Remove duplicates from Imperative.fullCommandTree
    // Also filter out built-in commands we don't want
    const definitionsArray = getFilteredChildren(loadedDefinitions);

    const profilesGroupIndex = definitionsArray.findIndex((value) => {
        return value.name === "profiles";
    });
    const profilesGroup = definitionsArray[profilesGroupIndex];
    definitionsArray.splice(profilesGroupIndex, 1);

    const pluginTree = {
        name: "cics-deploy",
        description: "Generate and deploy IBM CICS bundle resources",
        type: "group",
        children: definitionsArray
    };

    getGroupHelp(pluginTree);
    getGroupHelp(profilesGroup);

    markdownContent = mustache.render(markdownContent, {tableOfContents: tableOfContentsText});

    fs.writeFileSync("docs/pages/cdp/CLIReadme.md", JEKYLL_FRONTMATTER + markdownContent);
    gutil.log(gutil.colors.blue("Updated docs/pages/CLIReadme.md with definitions of " + totalCommands + " commands"));

    process.env.FORCE_COLOR = undefined;

    function getFilteredChildren(root: ICommandDefinition) {
        const allDefSoFar: string[] = [];
        const cmdNamesToRemove = ["config", "plugins"];
        const filteredChildren = root.children.sort((a, b) => a.name.localeCompare(b.name)).filter((cmdDef) => {
            if (cmdNamesToRemove.indexOf(cmdDef.name) !== -1) {
                return false;
            }
            if (allDefSoFar.indexOf(cmdDef.name) === -1) {
                allDefSoFar.push(cmdDef.name);
                return true;
            }
            return false;
        });
        return filteredChildren;
    }

    function getGroupHelp(definition: any, indentLevel: number = 0) {
        let commandNameSummary = definition.name;
        if (definition.aliases !== undefined &&
            definition.aliases.length > 0 &&
            !(definition.aliases[0].trim().length === 0 && definition.aliases.length === 1)) {
            commandNameSummary += " | " + definition.aliases.join(" | ");
        }
        if (definition.experimental) {
            commandNameSummary += " (experimental)";
        }

        const anchorTag = "module-" + definition.name;
        tableOfContentsText += util.format("%s* [%s](#%s)", tabIndent.repeat(indentLevel), commandNameSummary, anchorTag);

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

            tableOfContentsText += util.format("%s* [%s](#%s)", tabIndent.repeat(indentLevel + 1), childNameSummary, childAnchorTag);
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
};
doc.description = "Create documentation from the CLI help";

exports.doc = doc;

