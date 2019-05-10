---
title: Installation
tags: [getting_started]
keywords:
summary: "To install the Zowe CLI and cics-deploy plugin, perform the following steps."
sidebar: cdp_sidebar
permalink: cdp-Installation.html
folder: cdp
toc: false
---

1. Install [Node.js V8.0](https://nodejs.org/en/download/) or later, and Node Package Manager (npm) V5.0 or later, that are required by Zowe CLI. To verify the versions installed:
   ```console
   node --version
   npm --version
   ```

2. Install [Zowe CLI](https://zowe.github.io/docs-site/latest/user-guide/cli-installcli.html). For example to install using npm:
   ```console
   npm install -g zowe-cli
   ```

3. Install the cics-deploy plugin:
   ```console
   zowe plugins install zowe-cli-cics-deploy-plugin
   ```

4. Verify the version of the plugin that is installed:
   ```console
   zowe plugins list
   ```

### Update the cics-deploy plugin

To update to the latest version of the plugin:
```console
zowe plugins update zowe-cli-cics-deploy-plugin
```