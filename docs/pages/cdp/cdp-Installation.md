---
title: Installation
tags: [getting_started]
keywords:
summary: "To install the Zowe CLI and cics-deploy plugin, perform the following steps."
sidebar: cdp_sidebar
permalink: cdp-Installation.html
folder: cdp
---

1. Install the Zowe CLI by following one of the methods described in [Install Zowe CLI](https://zowe.github.io/docs-site/latest/user-guide/cli-installcli.html). For example:
   ```console
   npm install -g zowe-cli
   ```

1. Install the cics-deploy plugin:
   ```console
   zowe plugins install zowe-cli-cics-deploy-plugin
   ```
   Or, if the cics-deploy plugin is already installed, you can update to the latest version:
   ```console
   zowe plugins update zowe-cli-cics-deploy-plugin
   ```

1. To find out the version of the plugins you have installed:
   ```console
   zowe plugins list
   ```