---
title: Log and trace files
tags: [troubleshooting]
keywords:
summary: "When you use Zowe, log and trace files are written on both your local workstation and the z/OS machine."
sidebar: cdp_sidebar
permalink: cdp-Troubleshooting-General.html
folder: cdp
---

### Console output
All Zowe CLI cics deploy plugin commands send output to the console when invoked. Very often, enough information is provided for you to diagnose and pinpoint the cause of a problem. The commands `cics-deploy push`, `cics-deploy deploy` and `cics-deploy undeploy` accept a `--verbose` command-line option which can generate extra information if needed.  

### zowe.log
The .zowe directory on your local workstation contains log files, profiles, and plug-ins. The location of this directory can be customised as described in [ Setting the Zowe CLI home directory](https://zowe.github.io/docs-site/latest/user-guide/cli-configuringcli.html#setting-the-zowe-cli-home-directory) and logging level set as described in [Setting Zowe CLI log levels](https://zowe.github.io/docs-site/latest/user-guide/cli-configuringcli.html#setting-zowe-cli-log-levels).

You can use the following command to display messages written to the log file as they occur. This can be useful when troubleshooting problems when using `zowe` and `zowe cics-plugin` commands in another terminal.
<ul id="profileTabs" class="nav nav-tabs">
    <li class="active"><a href="#windows" data-toggle="tab">Windows</a></li>
    <li><a href="#linux" data-toggle="tab">Linux</a></li>
    <li><a href="#macos" data-toggle="tab">macOS</a></li>
</ul>
  <div class="tab-content">
<div role="tabpanel" class="tab-pane active" id="windows">
<p>On Windows, use the Powershell command 
<br/><br/>
<tt>Get-Content $env:USERPROFILE\.zowe\zowe\logs\zowe.log -Tail 30 -wait</tt></p>
</div>

<div role="tabpanel" class="tab-pane" id="linux">
    <p>On Linux, use <tt>tail -f -n 0 ~/.zowe/zowe/logs/zowe.log</tt></p></div>

<div role="tabpanel" class="tab-pane" id="macos">
    <p>On macOS, use <tt>tail -f -n 0 ~/.zowe/zowe/logs/zowe.log</tt></p>
</div>
</div>

### Node.js logs
By default, CICS writes Node.js log files on z/OS to the `/tmp` directory. However, the `generate bundle` command creates a number of files including `nodejsapps/<my app name>.profile` (often referred to as the Node.js profile), which you can edit to specify a more convenient log file location. Such logs get written to the directory referenced by the environment variable `WORK_DIR`. For example, you might edit your Node.js profile so that it includes the line:

```
WORK_DIR=/u/<your user id>/nodelogs
```
This causes CICS to write all Node.js logs to the specified directory.

Files typically written to `WORK_DIR` include:

* LOG
* STDERR
* STDOUT
* TRACE

They can all be useful when identifying the cause of an error, especially STDERR.

### JES job logs
DFHDPLOY is a CICS utility which provides a set of commands that you can use to deploy, undeploy and set the state of CICS bundles. When you deploy or undeploy a Node.js application to or from CICS, a batch DFHDPLOY job is initiated on z/OS.

If you are familiar with the z/OS environment, you can often find some useful diagnostics by accessing z/OS file assigned to the MSGUSR DD name for the deploy/undeploy job associated with your CICS region. If you are not so fluent with the world of z/OS, you may need to discuss your needs with one of your organization's CICS system administrators.

{% include note.html content="If you use [Visual Studio Code](https://code.visualstudio.com/) as your editor, there is a [Zowe extension](https://marketplace.visualstudio.com/items?itemName=Zowe.vscode-extension-for-zowe) that enables you to interact with USS files and examine JES job logs from your local workstation." %}