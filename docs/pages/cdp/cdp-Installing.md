---
title: Installing
tags: [getting_started]
keywords:
summary: "To install the Zowe CLI and cics-deploy plugin, perform the following steps. For clarity, these components are installed on your local workstation, not on z/OS."
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

2. Install [Zowe CLI](https://zowe.github.io/docs-site/latest/user-guide/cli-installcli.html). For example to install using npm:

    ```console
    sudo npm install -g @zowe/cli
    ```

3. Build and install the cics-deploy plugin as described in [Setting up your development environment](https://github.com/IBM/zowe-cli-cics-deploy-plugin/blob/master/docs-internal/tutorials/Setup.md). For example:

    ```console
    mkdir ~/cics-deploy
    cd ~/cics-deploy
    rm -Rf *
    git clone https://github.com/IBM/zowe-cli-cics-deploy-plugin
    cd zowe-cli-cics-deploy-plugin
    npm install
    npm run build
    zowe plugins install .
    ```

4. Verify the plugin is installed:

    ```console
    zowe plugins list
    ```