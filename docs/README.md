# Introduction to using the cics-deploy plugin for Zowe CLI

The cics-deploy plugin for Zowe CLI is used to generate IBM CICS Bundles from Node.js applications. These Bundles can then be deployed to a CICS region as BUNDLE resources.

CICS TS V5.5 supports the Node.js programming language, Node.js applications can be deployed to CICS as Bundle resources which will run within the CICS address space. For further information on Node.js in CICS see [CICS and Node.js](https://www.ibm.com/support/knowledgecenter/en/SSGMCP_5.5.0/fundamentals/node/nodeintro.html). The cics-deploy plugin to Zowe CLI enables a Node.js application developer to construct the metadata files that form a Bundle using a command line on their workstation; the generated Bundle metadata might then be stored under Source Control along with the rest of the application, the entire Bundle might be deployed to CICS, or both.

## Dependencies

In order to use the cics-deploy plugin you must first have installed Zowe CLI; for further information on Zowe CLI see [Install Zowe CLI](https://zowe.github.io/docs-site/latest/user-guide/cli-installcli.html). The cics-deploy plugin does not require the Zowe runtime to be installed or configured on z/OS. CICS TS V5.5 is not required in order to generate CICS Bundles, but Node.js Bundles will not deploy to earlier versions of CICS.

## Installation

To install the cics-deploy plugin to Zowe CLI do the following: TO BE DETERMINED; NPM, SOMETHING, SOMETHING.

## Generating a Bundle from an existing Node.js project

The typical usage pattern for cics-deploy is to start with an existing Node.js application in the working directory and to construct the CICS Bundle from it. This directory will typically include an NPM [package.json](https://docs.npmjs.com/files/package.json) file, though it is not required to do so.

1. Change directory to the root of the Node.js application.

2. Issue the `zowe cics-deploy generate bundle` command.

The cics-deploy plugin will generate the CICS Bundle metadata for a NODEJSAPP resource using the information found in your package.json file. If you don't have a package.json file, or if you want to override some of the generated values, you can set any of the following optional command line parameters:

`--bundleid MyExampleName`

The `--bundleid` parameter can be used to set a name for the Bundle. The value can be up to 64 alphanumeric characters long; if an invalid value is used then any problematic characters are replaced with 'X' and overlong values will be truncated. If `--bundleid` is not set then the default value is the value of the `name` property from package.json.

`--bundleversion 2.0.1`

The `--bundleversion` parameter can be used to set a version for the Bundle. The version consists of three dot separated numbers, they are the major, minor and micro version numbers. In the example above the major version number is 2, the minor version number is zero, and the micro version number is 1. If `--bundleversion` is not set then the default value is 1.0.0.

`--nodejsapp MyNodeJsApp`

The `--nodejsapp` parameter can be used to name the NODEJSAPP resource that will be defined in the Bundle. This is the name of the resource that will be installed into CICS; it must be unique within the target CICS region. The value is up to 32 alphanumeric characters long; if an invalid value is used then any problematic characters are replaced with 'X' and overlong values will be truncated. If `--nodejsapp` is not set then the default value is the first 32 characters of the bundleid.

`--startscript /lib/main.js`

The `--startscript` parameter can be used to identify the node.js script that CICS will run when the Bundle is enabled within CICS. The value is up to 255 characters long and must identify a file that exists within or below the root directory of the Bundle. If `--startscript` is not set then the default value derives from either the `scripts.start` property of the package.json file, or the value of the `main` property of package.json.

`--port 5000`

The `--port` parameter can be used to set a default HTTP port number that the Node.js application will expect to be able to use when installed in CICS. The value will be passed to the Node.js application in CICS by way of the `PORT` environment variable; the application may elect to use the value thereby derived. The value may be customised during the process of deploying the Bundle to CICS, setting an initial value can be useful if no other process exists to offer a customised or provisioned port number.

`--help`

The `--help` parameter can be set to receive further assistance regarding the command line options that are available to be used.


## Usage examples

a) You have a package.json file and the contents include a meaningful name and the starting script:

  `zowe cics-deploy generate bundle`

b) You have been advised of a resource naming convention in CICS and wish to set the NODEJSAPP name accordingly:

  `zowe cics-deploy generate bundle --nodejsapp DFH-ACCOUNTING-BUNDLE-022`

c) You wish to have a CICS specific Wrapper as the entry point for the application when deployed to CICS, rather than a default value that is used on other platforms:

  `zowe cics-deploy generate bundle --startscript /scripts/cicsWrapper.js`

d) You have been reserved a range of port numbers in CICS for testing purposes and wish to use one of them:

  `zowe cics-deploy generate bundle --port 12345`


## CICS Bundle metadata

Users of the cics-deploy plugin do not typically need to know about the metadata that forms a CICS Bundle, but it is sometimes useful to be aware of the basics. When you run the 'generate bundle' command it is likely that the following files will be created or changed within your working directory:

1. `/META-INF/cics.xml`
2. `/nodejsapps/<nodejsapp>.nodejsapp`
3. `/nodejsapps/<nodejsapp>.profile`

If you wish to undo a `bundle generate` command you could simply remove these files from your working directory.

The `cics.xml` file is the Bundle's manifest, it lists the contents of the Bundle. The `<nodejsapp>.nodejsapp` file contains information about the Node.js application, including the value of the starting script; the `<nodejsapp>.profile` file contains configuration information for the runtime environment, including the `PORT` environment variable.

You may change some or all of these files yourself, other automated processes may change them during the process of deploying the Bundle to CICS. Typical use does not require these files to be changed by the application developer. You can read more about the Bundle manifest at [Manifest contents for a CICS bundle](https://www.ibm.com/support/knowledgecenter/en/SSGMCP_5.5.0/configuring/resources/manifestdefinitions.html).

## Contributing

If you would like to contribute to the cics-deploy project you will need a development envionment from which to do so. Follow the instructions at [Setting up your development environment](./tutorials/Setup.md) for further information.