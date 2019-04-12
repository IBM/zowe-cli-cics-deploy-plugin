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
6. [Pushing a Bundle to CICS](#pushing)
6.1. [Requirements for Push](#push_req)
6.2. [The push command](#push_command)
6.3. [Sub-components of push](#push_components)
7. [Contributing](#contributing)


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

Now create a cics-deploy profile. This profile will identify the target CICS environment for deployment; you will need to know the CICSplex name and Scope, together with the High Level Qualifier (HLQ) for the CICS data sets. You can optionally identify either a target CSD group (typically used for single region configurations) or a BAS resource group (used for multi-region configurations) into which the Bundle will be defined. You can optionally configure a JCL jobcard if your site requires a customised JCL configuration for DFHDPLOY. For further assistance on creating a cics-deploy profile issue the following command:

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

<a name="pushing"></a>
## Pushing a Bundle to a CPSM managed CICS environment

Pushing a Bundle to CICS is a composite action that will upload a bundle from the current directory to zFS, then install and enable it in the target CICS environment. This process consists of several stages which are combined together as a simple atomic action. Advanced users may prefer to issue the sub-commands individually, perhaps adding customised site-specific automation, rather than using the `push` action.

<a name="push_req"></a>
### Requirements for using push

The cics-deploy push command combines several activities into a single combined action. In order to use the `push` command you will need several Zowe profiles to have been created. You will need a `zosmf` profile and an `ssh` profile, you might also consider creating a `cics-deploy` profile. You will also need a CICS bundle to exist in the current working directory (for further information on bundle enabling a directory see [Generating a CICS Bundle](#generation)).

<a name="zosmf_profile"></a>
#### The zosmf profile

The `cics-deploy push bundle` command interacts with the target z/OS environment using several different protocols, one of which is zOSMF. The zosmf profile in Zowe defines the connectivity parameters required to connect to a remote zOSMF server in the target z/OS environment. You will typically require the hostname of the target server, the port number at which the zOSMF service is running, and a suitable userid and password for the target server. Your userid will need to have been authorised to perform the various actions that will be needed in order to deploy the Bundle.

If you have not already done so, start by creating a zosmf profile in Zowe CLI. If you only create a single such profile then it will be used as the default z/OS configuration for any further zowe interactions. For further assistance on creating a z/OSMF profile issue the following command:

  `zowe profiles create zosmf-profile --help`

<a name="ssh_profile"></a>
#### The ssh profile

The `cics-deploy push bundle` command may attempt to issue Unix commands over the SSH protocol. In order to do so it requires a profile to be defined for the remote SSH server. You will typically need to know the hostname of the target server, the port at which the SSH service is running, and a suitable userid and password for the target server. It is recommended that you use the same userid and host for running SSH as is used for zOSMF, failure to do so will result in undefined behaviour.

If you have not already done so, create an ssh profile in Zowe CLI. If you only create a single such profile then it will be used as the default z/OS configuration for any further Zowe interactions. For further assistance on creating an SSH profile issue the following command:

  `zowe profiles create ssh-profile --help`


<a name="deploy_profile"></a>
#### The cics-deploy profile

The `cics-deploy push bundle` command uses the CICS DFHDPLOY utility to install and enable a Bundle resource in a CICS environment. It requires CICSPlex System Manager (CPSM) to be used to manage the target CICS regions; if the target environment is not CPSM managed then cics-deploy cannot be used to deploy the Bundle. In order to deploy a Bundle you will need:

1. The name of the target CICSplex and Scope into which the Bundle should be deployed.
2. The High Level Qualifier (HLQ) for the CICS datasets in the target environment.

Use of a cics-deploy profile is not mandatory, but is encouraged; using a profile avoids the requirement to enter the associated parameters each time a cics-deploy command is issued. If you have not already done so, create a cics-deploy profile. You can optionally identify either a target CSD group (typically used for single region configurations) or a BAS resource group (used for multi-region configurations) into which the Bundle will be defined. You can optionally configure a JCL jobcard if your site requires a customised JCL configuration for DFHDPLOY. For further assistance on creating a cics-deploy profile issue the following command:

  `zowe profiles create cics-deploy-profile --help`

For example, you might create the profile using the following command:

  `zowe profiles create cics-deploy-profile example --cicsplex PLEX1 --scope TESTGRP1 --cicshlq CICSTS55.CICS720 --cpsmhlq CICSTS55.CPSM550`


<a name="push_command"></a>
### The push command

The `cics-deploy push bundle` command pushes a bundle from the working directory to a target CICS environment. It requires the use of a zosmf profile and an ssh profile in order to do so, use of a cics-deploy profile is also encouraged (for more information on these dependencies see [Requirements for Push](#push_req)). You can request assistance on using the push command by issuing the following command:

  `zowe cics-deploy push bundle --help`

If you have configured default profiles for zosmf, ssh and cics-deploy then only two further items are needed:

1. A unique name (up to 8 characters) to use for the BUNDLE resource in CICS.
2. A directory in the target zFS in which do stage the Bundle's resources.

For example, you might issue the following command:

  `zowe cics-deploy push bundle --name EXAMPLE1 --targetdir /u/user01/myBundles`

This command will cause cics-deploy to attempt to deploy a bundle from the current working directory to the target CICS environment under the name `EXAMPLE1`. If a Bundle already exists in the target environment with the same name, cics-deploy will return an error. You may instruct cics-deploy to overwrite the existing Bundle by adding the --overwrite parameter, for example:

  `zowe cics-deploy push bundle --name EXAMPLE1 --targetdir /u/user01/myBundles --overwrite`

You can also request verbose messages from cics-deploy by adding the --verbose option, for example:

  `zowe cics-deploy push bundle --name EXAMPLE1 --targetdir /u/user01/myBundles --overwrite --verbose`


<a name="push_components"></a>
### Sub-components of the push command

The `cics-deploy push bundle` command consists of several separate actions, each of which may be issued separately if there is a requirement to do so. The push command performs the following actions:

1. It undeploys an existing Bundle using `zowe cics-deploy undeploy bundle` (See [Undeploying a CICS Bundle](#undeploying)).
2. It uploads the local Bundle directory to zFS using `zowe zos-files upload dir-to-uss`.
3. If the bundle contains a package.json file it runs `npm install` on the remote system using `zowe zos-uss issue ssh`.
4. It deploys a Bundle using `zowe cics-deploy deploy bundle` (See [Deploying a CICS Bundle](#deploying)).

Advanced users may prefer to use these sub-commands in preference to the `push` command. For example, if the target CICS regions are not CPSM managed then you might use Zowe to generate and subsequently upload the Bundle, and your own scripts to deploy the Bundle into a CICS region.




<a name="contributing"></a>
## Contributing

If you would like to contribute to the cics-deploy project you will need a development envionment from which to do so. Follow the instructions at [Setting up your development environment](./tutorials/Setup.md) for further information.
