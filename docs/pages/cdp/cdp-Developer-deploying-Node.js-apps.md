---
title: Developer deploying Node.js apps
tags: [getting_started]
keywords:
summary: "CICS TS V5.5 supports Node.js, Node.js applications can be deployed to CICS as bundle resources that run within the CICS address space. For more information on Node.js in CICS, see [CICS and Node.js](https://www.ibm.com/support/knowledgecenter/en/SSGMCP_5.5.0/fundamentals/node/nodeintro.html). The cics-deploy plug-in to Zowe CLI enables a Node.js application developer to construct the metadata files that form a bundle by using a command line on their workstation. The generated bundle metadata might then be stored under source control along with the rest of the application, the entire bundle might be deployed to CICS, or both. The CICS bundle must be available on zFS."
sidebar: cdp_sidebar
permalink: cdp-Developer-deploying-Node.js-apps.html
folder: cdp
---

The typical usage pattern for cics-deploy is to start with an existing Node.js application in the working directory and to construct the CICS bundle from it. This directory typically includes a [package.json](https://docs.npmjs.com/files/package.json) file, though it is not required.

To generate a bundle:

1. Change directory to the root of the Node.js application.

2. Issue the `zowe cics-deploy generate bundle` command.

The cics-deploy plug-in generates the CICS bundle metadata for a NODEJSAPP resource by using the information in your package.json file. If you don't have a package.json file, or if you want to override some of the generated values, you can set any of the following optional command-line parameters.

## Parameters

`--bundleid MyExampleName`
* Set the name for the bundle. The value can be up to 64 alphanumeric characters long, invalid values or characters are replaced with 'X' and overlong values are truncated. The default is the value of the `name` property from package.json.

`--bundleversion 2.0.1`
* Set the version for the bundle. The version consists of three dot-separated numbers, they are the major, minor, and micro version numbers. In this example, the major version number is 2, the minor version number is zero, and the micro version number is 1. The default is `--bundleversion 1.0.0`.

`--nodejsapp MyNodeJsApp`
* Set the name of the NODEJSAPP resource that is defined in the bundle. This is the name of the resource to be installed into CICS. It must be unique within the target CICS region. The value is up to 32 alphanumeric characters long, invalid values or characters are replaced with 'X' and overlong values are truncated. The default value is the first 32 characters of `--bundleid`.

`--startscript app/main.js`
* Identify the Node.js script that CICS runs when the bundle is enabled within CICS. The value is up to 255 characters long and must identify a file that exists within or below the root directory of the bundle. The default value is derived from either the `scripts.start` property of the package.json file, or the value of the `main` property of package.json.

`--port 5000`
* Set the default HTTP port number that the Node.js application expects to use when installed in CICS. The value is passed to the Node.js application in CICS through the `PORT`environment variable. The application might use this port number. The value can be customized during the process of deploying the bundle to CICS, setting an initial value is useful if no other process exists to offer a customized or provisioned port number.

`--help`
* Receive further assistance about the command line options.

## Usage examples

1. You have a package.json file and the contents include a meaningful name and the starting script:
   ```console
   zowe cics-deploy generate bundle
   ```

1.  You are advised of a resource naming convention in CICS and want to set the NODEJSAPP name accordingly:
    ```console
    zowe cics-deploy generate bundle --nodejsapp Accounting-apis
    ```

1. You want to have a CICS-specific wrapper as the entry point for the application when deployed to CICS, rather than a default value that is used on other platforms:
   ```console
   zowe cics-deploy generate bundle --startscript app/cicsWrapper.js
   ```

1. A range of port numbers in CICS for testing purposes are reserved for you and want to use one of them:
   ```console
   zowe cics-deploy generate bundle --port 12345
   ```

## CICS bundle metadata

Users of the cics-deploy plug-in do not typically need to know about the metadata that forms a CICS bundle, but it is sometimes useful to be aware of the basics. When you run the  command, it is likely that the following files are created or changed within your working directory:
```
/META-INF/cics.xml
/nodejsapps/<nodejsapp>.nodejsapp
/nodejsapps/<nodejsapp>.profile
```

To undo a `bundle generate` command, remove these files from your working directory.

The `cics.xml` file is the bundle's manifest, it lists the contents of the bundle. The `<nodejsapp>.nodejsapp` file contains information about the Node.js application, including the value of the starting script. The `<nodejsapp>.profile` file contains configuration information for the runtime environment, including the `PORT` environment variable.

You can change some or all of these files yourself by using the `--overwrite` parameter to replace existing files or the `--merge` parameter to merge new resources into the existing CICS bundle. Other automated processes might change them during the process of deploying the bundle to CICS. Typical use does not require these files to be changed by the application developer. 

You can read more about the bundle manifest at [Manifest contents for a CICS bundle](https://www.ibm.com/support/knowledgecenter/en/SSGMCP_5.5.0/configuring/resources/manifestdefinitions.html).

## Undeploying a bundle


Undeploying a bundle removes it from a target CICS environment but it does not remove the bundle from zFS. The undeployment action shares the same dependencies as are required for deploying a bundle, and it uses the same z/OSMF and cics-deploy profiles. You need to know the name of the bundle in the target CICS environment. For example, you might issue the following command:

`zowe cics-deploy undeploy bundle --name MYBUND01 --cics-deploy-profile example`

This command attempts to disable and discard a CICS bundle that is named MYBUND01, by using the default z/OSMF configuration and the CICS configuration defined in the example cics-deploy profile. For further information on undeploying bundle, issue the following command:

`zowe cics-deploy undeploy bundle --help`

