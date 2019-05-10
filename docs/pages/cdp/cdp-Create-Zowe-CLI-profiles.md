---
title: Create Zowe CLI profiles
tags: [getting_started, concepts]
keywords:
summary: "Zowe profiles let you store configuration details so you don't have to repeat them every time you use a Zowe CLI command."
sidebar: cdp_sidebar
permalink: cdp-Create-Zowe-CLI-profiles.html
folder: cdp
---

### Step 1: Create a z/OSMF profile

This profile defines the parameters needed to connect to the z/OSMF server on z/OS. You need to know the following from your z/OS system administrator:

| Parameter | Description |
| --- | --- |
| host | Host name of the z/OSMF server. |
| port | Port number of the z/OSMF server. |
| user | User ID to identify yourself to the z/OSMF server. |
| password | Password to identify yourself to the z/OSMF server. |

**Note**: The user ID needs to have sufficient permissions to remove and create directories and files in the directory specified by `--targetdir` in the cics-deploy profile.

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

### Step 2: Create an SSH profile

This profile defines the parameters needed to connect to the SSH server on z/OS. You need to know the following from your z/OS system administrator:

| Parameter | Description |
| --- | --- |
| host | Host name of the SSH server. |
| port | Port number of the SSH server. This will default to 22. |
| user | User ID to identify yourself to the SSH server. |
| password | Password to identify yourself to the SSH server. |

**Note**: It is recommended that you use the same user ID and host name to connect with SSH as is used in the z/OSMF profile, failure to do so results in undefined behaviour. When an SSH connection is made, the [z/OS shell .profile](https://www.ibm.com/support/knowledgecenter/en/SSLTBW_2.3.0/com.ibm.zos.v2r3.bpxa400/cupro.htm) is used to setup the shell environment and variables. The user .profile should include enviroonment variables and npm configuration required to run `npm install` in order to resolve Node.js appplication dependencies such as compiling native code. This is descibed in 
[Installing and configuring](https://www.ibm.com/support/knowledgecenter/SSTRRS_6.0.0/com.ibm.nodejs.zos.v6.doc/install.htm).


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

### Step 3: Create a cics-deploy profile

This profile identifies the CICS environment for deployment. You need to know the following from your CICS system administrator:

| Parameter | Description |
| --- | --- |
| cicsplex | CPSM CICSplex name. |
| cicshlq | High Level Qualifier \(HLQ\) for the CICS data sets. |
| cpsmhlq | High Level Qualifier \(HLQ\) for the CPSM data sets. |
| scope | CPSM scope to identify the CICS region or group of regions to deploy your application. |
| resgroup or basgroup | CICS CSD group name or BAS resource group name into which the bundle is defined. If not specified, BUNDLE resources are defined in CPSM BAS for installation and then removed. |
| jobcard | JCL jobcard to use when submitting JCL that will run the CICS utility DFHDPLOY. If not specified, a default jobcard will be used. |
| targetdir | Target directory on z/OS to which CICS bundles should be uploaded. |

For example to create a cics-deploy profile:

```console
zowe profiles create cics-deploy-profile example --cicsplex PLEX1 --cicshlq CICSTS55.CICS720 --cpsmhlq CICSTS55.CPSM550 --scope TESTGRP1 --csdgroup BUNDGRP1 --targetdir /var/cicsts/bundles
--overwrite
```

For help on using the options:

```console
zowe profiles create cics-deploy-profile --help
```

To test the cics-deploy profile, follow the steps in [Deploying your first app](cdp-Deploying-your-first-app).