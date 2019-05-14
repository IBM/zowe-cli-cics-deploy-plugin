---
title: Requirements
tags: [getting_started, requirements]
keywords:
summary: "The cics-deploy plugin is dependent on several servers and facilities that need to be set up on z/OS."
sidebar: cdp_sidebar
permalink: cdp-Requirements.html
folder: cdp
toc: false
---

### z/OS Management Facility

A [z/OS Management Facility (z/OSMF)](https://www.ibm.com/support/knowledgecenter/en/SSLTBW_2.3.0/com.ibm.zos.v2r3.izua300/IZUHPINFO_PartConfiguring.htm) server is required to run the [push bundle](Commands#command-push-bundle), [deploy bundle](Commands#command-deploy-bundle), and [undeploy bundle](Commands#command-undeploy-bundle) commands. These commands call the API for [`zowe zos-jobs submit`](https://zowe.github.io/docs-site/latest/user-guide/cli-usingcli.html#zos-jobs) to submit JCL that executes the DFHDPLOY utility to deploy and undeploy CICS bundles.

The z/OSMF server is also required by the [push bundle](Commands#command-push-bundle) command when it uses the API for [`zowe files upload dir-to-uss`](https://github.com/zowe/zowe-cli/issues/207) to copy a CICS bundle to a z/OS directory.

### z/OS Secure SHell daemon

The [z/OS Secure SHell daemon (sshd)](https://www.ibm.com/support/knowledgecenter/en/SSLTBW_2.3.0/com.ibm.zos.v2r3.foto100/sshset.htm) is required to run the [push bundle](Commands#command-push-bundle) command. This command uses the API for [`zowe zos-uss issue ssh`](https://github.com/zowe/zowe-cli/pull/308) to remove old files from the CICS bundle directory on z/OS and execute `npm install` on z/OS to install dependencies for Node.js applications.

### DFHDPLOY utility

The [DFHDPLOY](https://www.ibm.com/support/knowledgecenter/SSGMCP_5.5.0/applications/deploying/dfhdploy_overview.html) utility is provided with IBM CICS Transaction Server (CICS) and is required to run the [push bundle](Commands#command-push-bundle), [deploy bundle](Commands#command-deploy-bundle), and [undeploy bundle](Commands#command-undeploy-bundle) commands. These commands start DFHDPLOY with a script to perform deploy and undeploy operations. For example the deploy operation will define, install, then enable a CICS BUNDLE resource in a one or more CICS regions.

CICSPlex System Manager \(CPSM\) is provided with CICS and is required to run the DFHDPLOY utility. CPSM should be connected to the CICS regions into which the CICS application is being installed.