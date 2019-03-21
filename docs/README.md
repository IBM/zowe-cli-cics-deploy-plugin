# Introduction to using the cics-deploy plugin for Zowe CLI

The cics-deploy plugin for Zowe CLI is used to generate IBM CICS Bundles from Node.js applications. These Bundles can then be deployed to a CICS region as BUNDLE resources.

CICS TS V5.5 supports the Node.js programming language, Node.js applications can be deployed to CICS as Bundle resources which will run within the CICS address space. For further information on Node.js in CICS see [CICS and Node.js](https://www.ibm.com/support/knowledgecenter/en/SSGMCP_5.5.0/fundamentals/node/nodeintro.html). The cics-deploy plugin to Zowe CLI enables a Node.js application developer to construct the metadata files that form a Bundle using a command line on their workstation; the generated Bundle metadata might then be stored under Source Control along with the rest of the application, the entire Bundle might be deployed to CICS, or both.

The bundle can then be uploaded to z/OS and deployed to a target CICS environment.

# Table of Contents
1. [Dependencies](#dependencies)
2. [Installation](#installation)
3. [Generating a CICS Bundle](#generation)
3.1. [Usage examples](#genuse)
3.2. [Bundle metadata](#metadata)
4. [Deploying a CICS Bundle](#deploying)
5. [Undeploying a CICS Bundle](#undeploying)
6. [Contributing](#contributing)


<a name="dependencies"></a>
## Dependencies 

In order to use the cics-deploy plugin you must first have installed Zowe CLI; for further information on Zowe CLI see [Install Zowe CLI](https://zowe.github.io/docs-site/latest/user-guide/cli-installcli.html). The cics-deploy plugin does not require the Zowe runtime to be installed or configured on z/OS. CICS TS V5.5 is not required in order to generate CICS Bundles, but Node.js Bundles will not deploy to earlier versions of CICS.

<a name="installation"></a>
## Installation

To install the cics-deploy plugin to Zowe CLI do the following: 
`zowe plugins install zowe-cli-cics-deploy-plugin`

<a name="generation"></a>
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


<a name="genuse"></a>
### Usage examples

a) You have a package.json file and the contents include a meaningful name and the starting script:

  `zowe cics-deploy generate bundle`

b) You have been advised of a resource naming convention in CICS and wish to set the NODEJSAPP name accordingly:

  `zowe cics-deploy generate bundle --nodejsapp DFH-ACCOUNTING-BUNDLE-022`

c) You wish to have a CICS specific Wrapper as the entry point for the application when deployed to CICS, rather than a default value that is used on other platforms:

  `zowe cics-deploy generate bundle --startscript /scripts/cicsWrapper.js`

d) You have been reserved a range of port numbers in CICS for testing purposes and wish to use one of them:

  `zowe cics-deploy generate bundle --port 12345`


<a name="metadata"></a>
### CICS Bundle metadata

Users of the cics-deploy plugin do not typically need to know about the metadata that forms a CICS Bundle, but it is sometimes useful to be aware of the basics. When you run the 'generate bundle' command it is likely that the following files will be created or changed within your working directory:

1. `/META-INF/cics.xml`
2. `/nodejsapps/<nodejsapp>.nodejsapp`
3. `/nodejsapps/<nodejsapp>.profile`

If you wish to undo a `bundle generate` command you could simply remove these files from your working directory.

The `cics.xml` file is the Bundle's manifest, it lists the contents of the Bundle. The `<nodejsapp>.nodejsapp` file contains information about the Node.js application, including the value of the starting script; the `<nodejsapp>.profile` file contains configuration information for the runtime environment, including the `PORT` environment variable.

You may change some or all of these files yourself, other automated processes may change them during the process of deploying the Bundle to CICS. Typical use does not require these files to be changed by the application developer. You can read more about the Bundle manifest at [Manifest contents for a CICS bundle](https://www.ibm.com/support/knowledgecenter/en/SSGMCP_5.5.0/configuring/resources/manifestdefinitions.html).


<a name="deploying"></a>
## Deploying a Bundle to a CPSM managed CICS environment

The cics-deploy extensions to Zowe CLI provide a mechanism by which the CICS DFHDPLOY utility can be used to install a Bundle resource in CICS. It requires CICSPlex System Manager (CPSM) to be used to manage the target CICS regions; if the target environment is not CPSM managed then cics-deploy cannot be used to deploy the Bundle. In order to deploy a Bundle you will need:

1. A userid for the target z/OS environment with the necessary authorization to perform the deployment.
2. The directory structure for the CICS Bundle to already exist on the Unix file system for the target z/OS environment.
3. The name of the target CICSplex and Scope into which the Bundle should be deployed.
4. The High Level Qualifier (HLQ) for the CICS datasets in the target environment.
5. An up to 8 character name for the Bundle resource which is unique within the target CICS regions.

If you have not already done so, start by creating a zosmf profile in Zowe CLI. This profile will identify the target z/OS environment; you will need to know the hostname and port number for the z/OSMF server in your target environment, together with your user name and password. If you only create a single such profile then it will be used as the default z/OS configuration for any further zowe interactions. For further assistance on creating a z/OSMF profile issue the following command:

  `zowe profiles create zosmf-profile --help`

Now create a cics-deploy profile. This profile will identify the target CICS environment for deployment; you will need to know the CICSplex name and Scope, together with the High Level Qualifier (HLQ) for the CICS data sets. You will also have to identify either a target CSD group (typically used for single region configurations) or a BAS resource group (used for multi-region configurations) into which the Bundle will be defined. You may optionally configure a JCL jobcard if your site requires a customised JCL configuration for DFHDPLOY. For further assistance on creating a cics-deploy profile issue the following command:

  `zowe profiles create cics-deploy-profile --help`

For example, you might create the profile using the following command:

  `zowe profiles create cics-deploy-profile example --cicsplex PLEX1 --scope TESTGRP1 --cicshlq CICSTS55.CICS720 --cpsmhlq CICSTS55.CPSM550 --resgroup BUNDGRP1`

You can now use cics-deploy to deploy a Bundle. You will need to know the name to be used for the Bundle, and the location in the Unix file system at which it can be found. For example, you might issue the following command:

  `zowe cics-deploy deploy bundle --name MYBUND01 --bundledir /u/example/bundles/MyBundle01 --cics-deploy-profile example`

The above command will attempt to define and install a CICS Bundle named MYBUND01 from the specified location (bundledir) within the target z/OS environment, using the default z/OSMF configuration and the CICS configuration defined in the `example` cics-deploy profile. For further assistance on `deploy bundle` issue the following command:

  `zowe cics-deploy deploy bundle --help`

<a name="undeploying"></a>
## Undeploying a Bundle from a CPSM managed CICS environment

Undeploying a Bundle removes it from a target CICS environment. The undeployment action shares the same dependencies as are required for deploying a Bundle, it will use the same zosmf and cics-deploy profiles. You will need to know the name of the Bundle in the target CICS environment.  For example, you might issue the following command:

  `zowe cics-deploy undeploy bundle --name MYBUND01 --cics-deploy-profile example`

The above command will attempt to disable and discard a CICS Bundle named MYBUND01, using the default z/OSMF configuration and the CICS configuration defined in the `example` cics-deploy profile. For further assistance on `undeploy bundle` issue the following command:

  `zowe cics-deploy undeploy bundle --help`


<a name="contributing"></a>
## Contributing

If you would like to contribute to the cics-deploy project you will need a development envionment from which to do so. Follow the instructions at [Setting up your development environment](./tutorials/Setup.md) for further information.