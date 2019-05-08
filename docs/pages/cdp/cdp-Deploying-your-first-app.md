---
title: Deploying your first app
tags: [getting_started]
keywords:
summary: "The following steps take you through deploying your first Node.js application to CICS."
sidebar: cdp_sidebar
permalink: cdp-Deploying-your-first-app.html
folder: cdp
toc: false
---

1. Install the Zowe CLI and cics-deploy plugin by following the steps in [Installation](cdp-Installation).

1. Create Zowe CLI profiles for z/OSMF, SSH, and cics-deploy by following the steps in [Create Zowe CLI profiles](cdp-Create-Zowe-CLI-profiles).

1. Create a Node.js application.

   For example, to create a Node.js application using the Express Generator:
   ```console
   npm install -g express-generator
   express myExpressApp
   cd myExpressApp
   npm install
   npm start
   ```
   The Node.js web server will start and you can browse to http://localhost:3000 to see the running application. Use CTRL+C to stop the Node.js web server.

1. Package the Node.js application into a CICS bundle. The port needs to be available for use by the CICS region on z/OS.

   ```console
   zowe cics-deploy generate bundle --startscript app.js --port 3000 --overwrite
   ```

1. Deploy the CICS bundle into CICS. Replace the value for `--targetdir` with a directory on z/OS that your user ID has write access to, and the CICS region user ID has read access to. 

   ```console
   zowe cics-deploy push bundle --name myExpressApp --targetdir /u/userid/bundles --overwrite
   ```

### Results
The Node.js web server will start and you can browse to http://myzos:3000 to see the running application.
