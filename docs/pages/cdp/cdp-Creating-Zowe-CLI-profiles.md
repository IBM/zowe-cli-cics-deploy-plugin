---
title: Creating Zowe CLI profiles
tags: [getting_started, concepts]
keywords:
summary: "Zowe profiles let you store configuration details so you don't have to repeat them every time you use a Zowe CLI command."
sidebar: cdp_sidebar
permalink: cdp-Creating-Zowe-CLI-profiles.html
folder: cdp
---

The Zowe CLI lets you define arguments and options for commands in multiple ways, with the following order of precedence:

1. Command-line
2. Environment variables
3. Profiles

This provides flexibility when you issue commands and write automation scripts. Further detail is in [Understanding command option order of precedence](https://zowe.github.io/docs-site/latest/user-guide/cli-configuringcli.html#understanding-command-option-order-of-precedence). Therefore by creating and setting options in the following profiles, they will become your defaults and do not need to repeat them on Zowe CLI command unless you wish to override them.

### Create a z/OSMF profile

The z/OSMF profile defines the options needed to connect to the z/OSMF server on z/OS. You need to know the following from your z/OS system administrator:

| Option | Description |
| --- | --- |
| host | Host name of the z/OSMF server. |
| port | Port number of the z/OSMF server. |
| user | User ID to identify yourself to the z/OSMF server. |
| password | Password to identify yourself to the z/OSMF server. |

{% include note.html content="The user ID needs to have sufficient permissions to remove and create directories and files in the directory specified by `--targetdir` in the cics-deploy profile. The user ID also needs permission to submit JCL and to run the DFHDPLOY utility as described in the **Security** heading in topic [Automate the deployment and undeployment of CICS bundles and applications with the DFHDPLOY utility](https://www.ibm.com/support/knowledgecenter/SSGMCP_5.5.0/applications/deploying/dfhdploy_overview.html)." %}

For example, to create a z/OSMF profile:

```console
zowe profiles create zosmf-profile myzos --host myzos.example.com --port 3000 --user myuserid --password mypassword --reject-unauthorized false --overwrite
```

For help on using the options:

```console
zowe profiles create zosmf-profile --help
```

To test the connection to the z/OSMF server using the profile:

```console
zowe zosmf check status
```

### Create an SSH profile

The SSH profile defines the options needed to connect to the SSH server on z/OS. You need to know the following from your z/OS system administrator:

| Option | Description |
| --- | --- |
| host | Host name of the SSH server. |
| port | Port number of the SSH server. This will default to 22. |
| user | User ID to identify yourself to the SSH server. |
| password | Password to identify yourself to the SSH server. |

{% include note.html content="It is recommended that you use the same user ID and host name to connect with SSH as is used in the z/OSMF profile, failure to do so results in undefined behaviour. When an SSH connection is made, the user's remote [z/OS shell .profile](https://www.ibm.com/support/knowledgecenter/en/SSLTBW_2.3.0/com.ibm.zos.v2r3.bpxa400/cupro.htm) is used to set-up the shell environment and variables. This remote .profile should include any necessary environment variables and npm configuration required to run `npm install`. This is descibed in [Installing and configuring](https://www.ibm.com/support/knowledgecenter/SSTRRS_6.0.0/com.ibm.nodejs.zos.v6.doc/install.htm)." %}

For example, to create an SSH profile:

```console
zowe profiles create ssh-profile myzos --host myzos.example.com --user myuserid --password mypassword --overwrite
```

For help on using the options:

```console
zowe profiles create ssh-profile --help
```

To test the connection to the SSH server using the profile:

```console
zowe zos-uss issue ssh 'uname -a'
```

### Create a cics-deploy profile

The cics-deploy profile identifies the CICS environment for deployment. An example of how to create an environment using using z/OS Provisioning Toolkit as described in [Provisioning a CICS region using z/OS PT](cdp-Provisioning-a-CICS-region-using-zospt). You need to know the following from your CICS system administrator:

| Option | Description |
| --- | --- |
| cicsplex | CPSM CICSplex name. |
| cics-hlq | High Level Qualifier \(HLQ\) for the CICS data sets. |
| cpsm-hlq | High Level Qualifier \(HLQ\) for the CPSM data sets. |
| scope | CPSM scope to identify the CICS region or group of regions to deploy your application. |
| csd-group or res-group | CICS CSD group name or CPSM BAS resource group name into which the bundle is defined. If not specified, BUNDLE resources are defined in CPSM BAS for installation and then removed. |
| job-card | JCL jobcard to use when submitting JCL that will run the CICS utility DFHDPLOY. If not specified, a default job card will be used. |
| target-directory | Target directory on z/OS to which CICS bundles should be uploaded. |

For example to create a cics-deploy profile:

```console
zowe profiles create cics-deploy-profile cics --cicsplex PLEX1 --cics-hlq CICSTS55.CICS720 --cpsm-hlq CICSTS55.CPSM550 --scope TESTGRP1 --csd-group BUNDGRP1 --target-directory /var/cicsts/bundles --overwrite
```

For help on using the options:

```console
zowe profiles create cics-deploy-profile --help
```

To test the cics-deploy profile, follow the steps in [Deploying your first Node.js app](cdp-Deploying-your-first-nodejs-app).

### Create a CICS profile

The CICS profile identifies the connection to the CICS Web User Interface (WUI) server to query application resources. You need to know the following from your CICS system administrator:

| Option | Description |
| --- | --- |
| cics-plex | CPSM CICSplex name. This will typically be set to the same as cicsplex in the cics-deploy profile. |
| protocol | HTTP or HTTPS to use to connect to the CICS WUI server. |
| host | Host name of the CICS WUI server. |
| port | Port number of the CICS WUI server. |
| user | User ID to identify yourself to the CICS WUI server . |
| password | Password to identify yourself to the CICS WUI server. |

For example, to create an SSH profile:

```console
zowe profiles create cics-profile cics --cics-plex PLEX1 --protocol https --host myzos.example.com --port 1490 --user myuserid --password mypassword --overwrite
```

For help on using the options:

```console
zowe profiles create cics-profile --help
```

To test the connection to the CICS WUI server using the profile:

```console
zowe cics get resource CICSRegion
```
