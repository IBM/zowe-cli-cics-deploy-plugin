---
title: Requirements on z/OS
tags: [getting_started, requirements]
keywords:
summary: "The cics-deploy plug-in is dependent on several servers and facilities that need to be set up on z/OS."
sidebar: cdp_sidebar
permalink: cdp-Requirements.html
folder: cdp
toc: false
---

### z/OS Management Facility

A [z/OS Management Facility (z/OSMF)](https://www.ibm.com/support/knowledgecenter/en/SSLTBW_2.3.0/com.ibm.zos.v2r3.izua300/IZUHPINFO_PartConfiguring.htm) server is required to run the [`zowe cics-deploy push bundle`](cdp-CLIReadMe#push--p), [`zowe cics-deploy deploy bundle`](cdp-CLIReadMe#deploy--d--dep), and [`zowe cics-deploy undeploy bundle`](cdp-CLIReadMe#undeploy--u--udep) commands. These commands call the API for [`zowe zos-jobs submit`](https://github.com/zowe/zowe-cli/blob/master/docs/CLIReadme.md#module-submit) to submit JCL to execute the DFHDPLOY utility to deploy and undeploy CICS bundles.

The z/OSMF server is also required by the [`zowe cics-deploy push bundle`](cdp-CLIReadMe#push--p) command when it uses the API for [`zowe zos-files upload dir-to-uss`](https://github.com/zowe/zowe-cli/blob/master/docs/CLIReadme.md#command-dir-to-uss) to copy a CICS bundle to a z/OS directory.

### z/OS Secure SHell daemon

The [z/OS Secure SHell daemon (sshd)](https://www.ibm.com/support/knowledgecenter/en/SSLTBW_2.3.0/com.ibm.zos.v2r3.foto100/sshset.htm) is required to run the [`zowe cics-deploy push bundle`](cdp-CLIReadMe#push--p) command. This command uses the API for [`zowe zos-uss issue ssh`](https://github.com/zowe/zowe-cli/blob/master/docs/CLIReadme.md#command-ssh) to remove old files from the CICS bundle directory on z/OS and execute `npm` on z/OS to install and uninstall dependencies for Node.js applications.

### DFHDPLOY utility

The [DFHDPLOY](https://www.ibm.com/support/knowledgecenter/SSGMCP_5.5.0/applications/deploying/dfhdploy_overview.html) utility is provided with IBM CICS Transaction Server (CICS) and is required to run the [`zowe cics-deploy push bundle`](cdp-CLIReadMe#push--p), [`zowe cics-deploy deploy bundle`](cdp-CLIReadMe#deploy--d--dep), and [`zowe cics-deploy undeploy bundle`](cdp-CLIReadMe#undeploy--u--udep) commands. These commands start DFHDPLOY with a script to perform deploy and undeploy operations.

### CICSPlex System Manager

CICSPlex System Manager \(CPSM\) is provided with CICS and is required to run the DFHDPLOY utility, and for the [`zowe cics-deploy push bundle`](cdp-CLIReadMe#push--p) to query application resources. CPSM should be connected to the CICS regions into which the application is being installed.
