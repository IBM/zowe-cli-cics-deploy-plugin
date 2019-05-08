---
title: Create Zowe CLI profiles
tags: [getting_started]
keywords:
summary: "Zowe profiles let you store configuration details so you don't have to repeat them every time you use a Zowe CLI command."
sidebar: cdp_sidebar
permalink: cdp-Create-Zowe-CLI-profiles.html
folder: cdp
---

### Step 1: Create a z/OSMF profile

This profile identifies the z/OSMF server that has access to the directory on z/OS into which the CICS bundle will be deployed. You need to know the following from your z/OS system administrator:

* *hostname* of the z/OSMF server.
* *port number* of the z/OSMF server.
* *user ID* and *password* to identify yourself to the z/OSMF server.

For example, to create a z/OSMF profile:
```console
zowe profiles create zosmf-profile myzos --host myzos.example.com --port 3000
     --user myuserid --password mypassword --reject-unauthorized false --overwrite
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

This profile defines the parameters needed to connect. to the remote SSH server. You need to know the following from your z/OS system administrator:

* *hostname* of the SSH server.
* *port number* of the SSH server. This will default to 22.
* *user ID* and *password* to identify yourself to the SSH server.

It is recommended that you use the same user ID and host to connect with SSH as is used in the z/OSMF profile, failure to do so results in undefined behaviour.

For example, to create an SSH profile:
```console
zowe profiles create ssh-profile myzos --host myzos.example.com
     --user myuserid --password mypassword --overwrite
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

* *CPSM CICSplex name*.
* *High Level Qualifier* \(HLQ\) for the CICS and CPSM data sets.
* *CPSM scope* to identify the CICS region or group of regions to deploy your application.
* Optional - *CICS CSD group name or CPSM BAS resource group name* into which the bundle is defined.
* Optional - *JCL jobcard* to use when submitting JCL that will run the CICS utility DFHDPLOY.

For example to create a cics-deploy profile:
```console
zowe profiles create cics-deploy-profile example --cicsplex PLEX1
     --cicshlq CICSTS55.CICS720 --cpsmhlq CICSTS55.CPSM550
     --scope TESTGRP1 --csdgroup BUNDGRP1 --overwrite
```
For help on using the options:
```console
zowe profiles create cics-deploy-profile --help
```