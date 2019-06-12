---
title: Deploying your first Node.js app
tags: [tutorial]
keywords:
summary: "The following steps take you through deploying your first Node.js application to CICS using the Express Application Generator."
sidebar: cdp_sidebar
permalink: cdp-Deploying-your-first-nodejs-app.html
folder: cdp
toc: true
---

### Before you begin

CICS TS V5.5 introduced support to run Node.js applications and is required by this tutorial. If you do not have a CICS TS V5.5 region, use the steps in [Provisioning a CICS region using z/OS PT](cdp-Provisioning-a-CICS-region-using-zospt) to provision one, or speak to your CICS system administrator.

### Procedure

1. Install the Zowe CLI and plug-ins by following the steps in [Installing](cdp-Installing).

2. Create Zowe CLI profiles by following the steps in [Creating Zowe CLI profiles](cdp-Creating-Zowe-CLI-profiles).

3. Create a Node.js application using the [Express Application Generator](https://expressjs.com/en/starter/generator.html):

   ```text
   npm install -g express-generator
   express myExpressApp
   cd myExpressApp
   npm install
   npm start
   ```

   The Node.js application will start. You can call the application from a browser by using URL [http://localhost:3000/](http://localhost:3000/). To stop the application in the console press CTRL+C.

4. Package the Node.js application into a [CICS bundle](cdp-cics-bundles).

   Make sure that you are in the root directory of the application.

   Replace the value for `--port` with one that is available for use by the CICS region on z/OS. This sets the PORT environment variable in the generated `.profile` file. Additional variables can be set by editing this file.

   ```console
    zowe cics-deploy generate bundle --port 3000 --overwrite
   ```

   The output indicates the directories and files that are created to form a CICS bundle. For example:

   <pre class="messageText">
   define : NODEJSAPP "myexpressapp" with startscript "./bin/www"
   create : nodejsapps
   create : nodejsapps/myexpressapp.nodejsapp
   create : nodejsapps/myexpressapp.profile
   create : .zosattributes
   create : META-INF
   create : META-INF/cics.xml
   CICS Bundle generated with bundleid "myexpressapp"</pre>

5. Deploy the CICS bundle into CICS.

   ```text
   zowe cics-deploy push bundle --name Express --overwrite
   ```

   A progress bar is shown with status messages as the CICS bundle is deployed and the application is started. This can take a few minutes. The command will summarize the deployment, including the Node.js runtime `.stdout` and `.stderr` file names that the application will write output to:

   <pre class="messageText">
   Regions in scope 'CICPY000' of CICSplex 'ZOSPTINT':
   Applid: CICPY000   jobname: CICPY000   jobid: STC35860   sysname: MV2C

   NODEJSAPP resources for bundle 'Express' in scope 'CICPY000':
   NODEJSAPP resource 'Express' is in 'ENABLED' state in region 'CICPY000' with process id '16844444'.
   stdout: /u/cicprov/mnt/CICPY000/workdir/CICPY000/myexpressapp/Express/D20190612.T144609.stdout
   stderr: /u/cicprov/mnt/CICPY000/workdir/CICPY000/myexpressapp/Express/D20190612.T144609.stderr
   PUSH operation completed</pre>

   This results in a CICS BUNDLE resource named `Express` being defined, installed, and enabled in CICS. If the BUNDLE `Express` was already defined or installed in CICS, it is undeployed first. As the BUNDLE is enabled, the application is started. If there are errors, retry with the `--verbose` option for more detailed output, or refer to [Troubleshooting](cdp-Troubleshooting-General).

6. Test the application.

   You can call the application from a browser by using URL [http://myzos:3000/](http://myzos:3000/), replacing _myzos_ with the host name of the z/OS system, and _3000_ with the port specified in step 4.

   If you make changes to the application, you can redeploy it by repeating step 5.

7. View the application output files.

   Use the [Zowe](https://marketplace.visualstudio.com/items?itemName=Zowe.vscode-extension-for-zowe) extension for Visual Studio Code or Zowe CLI commands to view the application output files. For example:

   ```text
   zowe zos-uss issue ssh "tail -f /u/cicprov/mnt/CICPY000/workdir/CICPY000/myexpressapp/Express/D20190612.T144609.stdout"
   ```

### Results

The Node.js application is packaged into a CICS bundle on the workstation, uploaded to a directory on z/OS, and is running in CICS.

{% include tip.html content="When writing your own application, follow the guidance in [Best practice for developing Node.js applications](https://www.ibm.com/support/knowledgecenter/SSGMCP_5.5.0/applications/developing/node/best-practice.html) to use environment variables and enable the application to terminate gracefully." %}
