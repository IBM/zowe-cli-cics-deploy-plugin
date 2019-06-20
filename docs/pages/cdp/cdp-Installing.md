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
    sudo npm install -g @brightside/core
    ```

3. Install the cics plugin:

    ```console
    zowe plugins install @brightside/cics
    ```

4. Install the cics-deploy plugin:

    ```console
    zowe plugins install zowe-cli-cics-deploy-plugin
    ```

5. Validate the plug-ins are installed:

    ```console
    zowe plugins validate
    ```

    validates the installed plugins:

    <pre class="messageText">
    _____ Validation results for plugin '@brightside/cics' _____
    This plugin was successfully validated. Enjoy the plugin. <br>
    _____ Validation results for plugin 'zowe-cli-cics-deploy-plugin' _____
    This plugin was successfully validated. Enjoy the plugin. </pre>
