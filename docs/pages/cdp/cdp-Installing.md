---
title: Installing
tags: [getting_started]
keywords:
summary: "To install the Zowe CLI and cics-deploy plug-in, perform the following steps on your local workstation."
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

2. Install [Zowe CLI](https://zowe.github.io/docs-site/latest/user-guide/cli-installcli.html). For example, to install using npm:

    ```console
    npm install -g @brightside/core
    ```

3. Install the cics plugin:

    ```console
    zowe plugins install @brightside/cics@lts-incremental
    ```

4. Install the cics-deploy plugin:

    ```console
    zowe plugins install zowe-cli-cics-deploy-plugin
    ```

5. Verify the plug-ins are installed:

    ```console
    zowe plugins list
    ```

    Displays a list of the installed plugins:

    <pre class="messageText">
    Installed plugins:

    -- pluginName: @brightside/cics
    -- package: @brightside/cics@lts-incremental
    -- version: 1.1.1
    -- registry: https://registry.npmjs.org/<br>
    -- pluginName: zowe-cli-cics-deploy-plugin
    -- package: zowe-cli-cics-deploy-plugin
    -- version: 0.5.0
    -- registry: https://registry.npmjs.org/ </pre>