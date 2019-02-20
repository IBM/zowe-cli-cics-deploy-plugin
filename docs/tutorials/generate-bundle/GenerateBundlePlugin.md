# Installing the cics-deploy plug-in

Before you begin, [set up](../Setup.md) your environment to install a plug-in.

## Overview
This tutorial covers installing and running this bundled Zowe CLI cics-deploy plugin as-is (without modification). 

The plug-in adds a command to the CLI that supports generation and deployment of CICS Bundle resources from the current directory of your PC.

## Installing the cics-deploy plug-in to Zowe CLI

(NOTE: This step may have completed during set up.)

To begin, `cd` into your `cics-deploy` folder.

Issue the following commands to install the cics-deploy plug-in to Zowe CLI:
1. `cd cics-deploy`
2. `zowe plugins install ./zowe-cli-cics-deploy-plugin`

## Viewing the installed plug-in help
Issue `zowe cics-deploy generate deploy --help` in the command line to return information for the installed `cics-deploy` command group.

## Using the installed plug-in
To use the plug-in functionality, issue: `zowe cics-deploy generate bundle`. It will generate meta-data for a simple CICS Bundle into the working directory; 
if the working directory contains a node.js `package.json` file then a NODEJSAPP resource definition will be included in the Bundle meta-data.

## Testing the installed plug-in
To run automated tests against the plug-in, `cd` into your `cics-deploy/zowe-cli-cics-deploy-plugin` folder.

Issue the following command:
* `npm run test`
