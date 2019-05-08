---
title: Log and trace files
tags: [troubleshooting]
keywords:
summary: "When you use Zowe, log and trace files are written on both your local workstation and the z/OS machine."
sidebar: cdp_sidebar
permalink: cdp-Troubleshooting-General.html
folder: cdp
---

### zowe.log
The .zowe directory contains log files, profiles, and plug-ins. The location of this directory can be customised as described in [ Setting the Zowe CLI home directory](https://zowe.github.io/docs-site/latest/user-guide/cli-configuringcli.html#setting-the-zowe-cli-home-directory) and logging level set as described in [Setting Zowe CLI log levels](https://zowe.github.io/docs-site/latest/user-guide/cli-configuringcli.html#setting-zowe-cli-log-levels).

You can use the following command to display messages written to the log file as they occur. This can be useful when troubleshooting problems when using `zowe` and `zowe cics-plugin` commands in another terminal.
```console
tail -f -n 0 ~/.zowe/zowe/logs/zowe.log
```