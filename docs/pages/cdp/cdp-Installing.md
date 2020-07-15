---
title: Installing
tags: [getting_started]
keywords:
summary: 'To install the Zowe CLI and cics-deploy plug-in, perform the following steps on your local workstation.'
sidebar: cdp_sidebar
permalink: cdp-Installing.html
folder: cdp
toc: false
---

1. Install Node.js V8.0 or later, and Node Package Manager (npm) V5.0 or later, that are required by Zowe CLI. Installers are available from Node.js [Downloads](https://nodejs.org/en/download/).

    To verify the versions installed:

    ```console
    node --version
    npm --version
    ```

2. Install [Zowe CLI](https://docs.zowe.org/stable/user-guide/cli-installcli.html). For example, to install using npm from an online registry:

    ```console
    npm install @zowe/cli@zowe-v1-lts -g
    zowe plugins install @zowe/secure-credential-store-for-zowe-cli@zowe-v1-lts
    ```

3. Install the CICS® plug-in:

    ```console
    zowe plugins install @zowe/cics-for-zowe-cli@zowe-v1-lts
    ```

4. Install the cics-deploy plug-in:

    ```console
    zowe plugins install zowe-cli-cics-deploy-plugin
    ```

5. Verify the plug-ins are installed:

    ```console
    zowe plugins list
    ```

    Displays a list of the installed plug-ins:

    <pre class="messageText">
    Installed plugins:
    
    -- pluginName: cics-for-zowe-cli
    -- package: cics-for-zowe-cli@zowe-v1-lts
    -- version: 4.0.2
    -- registry: https://registry.npmjs.org/<br>
    -- pluginName: zowe-cli-cics-deploy-plugin
    -- package: zowe-cli-cics-deploy-plugin
    -- version: 1.1.0
    -- registry: https://registry.npmjs.org/ </pre>
