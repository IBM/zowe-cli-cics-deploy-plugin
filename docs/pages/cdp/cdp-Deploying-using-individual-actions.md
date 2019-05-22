---
title: Deploying using individual actions
tags: [getting_started]
keywords:
summary: "The following steps take you through the individual actions to deploy a Node.js application in CICS."
sidebar: cdp_sidebar
permalink: cdp-Deploying-using-individual-actions.html
folder: cdp
toc: false
---

The `zowe cics-deploy push bundle` command performs a set of actions to deploy applications to CICS, as can be seen in [Deploying your first Node.js app](cdp-Deploying-your-first-nodejs-app). The main actions include:

* undeploy the old version of the CICS bundle in CICS
* upload the new version of the CICS bundle to z/OS
* run `npm install` on z/OS to resolve Node.js application dependencies
* deploy the CICS bundle in CICS.

However, there may be situations where you need more control of these actions or perform alternate actions. The following sections describe how each of these actions can be performed independently, enabling you to form a sequence of commands to achieve your needs.

### Undeploy a CICS bundle

Undeploying a CICS bundle disables the CICS bundle resource (BUNDLE) in CICS. Disabling the CICS bundle causes the resources defined in it to also be disabled. For Node.js applications, CICS sends a SIGTERM signal that can be handled in the application to stop in a controlled manner, such as stopping new requests and completing existing requests. Once the CICS bundle has been disabled it is then discarded in CICS.

```console
zowe cics-deploy undeploy bundle --name Express
```

Alternatively, if you want to disable the CICS bundle, but to not discard it:

```console
zowe cics-deploy undeploy bundle --name Express --target-state disabled
```

{% include note.html content="This command does not remove the CICS bundle from the z/OS directory." %}

### Upload a CICS bundle to z/OS

Before uploading the CICS bundle to z/OS, you need to ensure the target directory is empty in order to prevent merging with a previously deployed version of the CICS bundle.

There are several ways to run shell commands and scripts on z/OS, such as SSH, batch jobs, and Zowe. When using Zowe, an SSH connection is established using information in the Zowe ssh profile, and then the shell .profile for the user will be run to setup the environment. The command is then run in the directory specified by the `--cwd` option. The return code from the Zowe CLI will be the same as that returned by the command run on z/OS, enabling you to take action in your script in error scenarios.

For example, to remove the target directory:

```console
zowe zos-uss issue ssh "rm -Rv *" --cwd "/var/cicsts/bundles/myexpressapp_1.0.0" && echo RC=$?
```

{% include tip.html content="You can run several commands in one request using the syntax described in [sh — Invoke a shell](https://www.ibm.com/support/knowledgecenter/en/SSLTBW_2.3.0/com.ibm.zos.v2r3.bpxa500/sh.htm)." %}

Typically you will need to upload some files as binary, some as text, and exclude others that are not required to run the application. In addition, it is best practice to tag files on z/OS as binary or with their text codepage to allow for correct codepage translation by editors and environments such as Node.js. You can specify these requirements in a `.zosattributes` file and use the Zowe CLI to upload and tag files in a single command.

For example, create file **~/myExpressApp/.zosattributes** in the CICS bundle:

```properties
# Don't upload node_modules
node_modules -

# Don't upload things that start with dots
.* -

# Upload the following file types in binary
*.jpg binary binary
*.png binary binary
*.gif binary binary
*.zip binary binary
*.eot binary binary
*.svg binary binary
*.ttf binary binary
*.woff binary binary

# Convert CICS Node.js profiles to EBCDIC
*.profile ISO8859-1 IBM-1047
```

Then upload the CICS bundle to z/OS:

```console
zowe zos-files upload dir-to-uss ~/myExpressApp/ /var/cicsts/bundles/myexpressapp_1.0.0 --recursive --attributes ~/myExpressApp/.zosattributes
```

### Run npm on z/OS

A Node.js application typically depends on packages that are described in `package.json`. The dependencies can be installed by running `npm install` in the z/OS directory containing `package.json`, for example:

```console
zowe zos-uss issue ssh "npm install" --cwd "/var/cicsts/bundles/myexpressapp_1.0.0"
```

### Deploy a CICS bundle

Deploying a CICS bundle defines a CICS bundle resource (BUNDLE), then installs it, and finally enables it. When the CICS bundle is enabled, the Node.js application is started. For example:

```console
zowe cics-deploy deploy bundle --name Express --bundle-directory /var/cicsts/bundles/myexpressapp_1.0.0
```

Alternatively, to define and install the BUNDLE but not enable it:

```console
zowe cics-deploy deploy bundle --name Express --bundle-directory /var/cicsts/bundles/myexpressapp_1.0.0 --target-state disabled
```