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

The `zowe cics-deploy push bundle` command performs a set of actions to deploy applications to CICS as can be seen in [Deploying your first app](cdp-cdp-Deploying-your-first-app). The main actions include:

* undeploying the old version of the CICS bundle
* uploading the new version of the CICS bundle to z/OS
* running `npm install` on z/OS to resolve dependencies
* deploying the new version of the CICS bundle.

However, there may be situations where you need more control or perform alternate actions. The following sections describe how each of these actions could be performed independently, enabling you to form a sequence of commands to achieve your needs.

### Undeploy a CICS bundle

Undeploying a CICS bundle will first disable the CICS bundle resource (BUNDLE) in CICS. This will result in all CICS resources defined in the BUNDLE being disabled. To disable Node.js applications, CICS will send a SIGTERM signal to the application. The CICS bundle will then be discarded from CICS. This command will not remove the CICS bundle from the z/OS directory.

```console
zowe cics-deploy undeploy bundle --name Express
```

Alternatively, if you want to disable the CICS bundle, but to not discard it:

```console
zowe cics-deploy undeploy bundle --name Express --target-state disabled
```

### Upload to z/OS

Before uploading the CICS bundle to z/OS, you will need to ensure the target directory is empty in order to prevent merging with a previously deployed version of the CICS bundle.

There are several ways to run shell commands and scripts on z/OS, such as SSH, batch jobs, and Zowe. When using Zowe, an SSH connection will be established, the user will be logged in, the shell .profile will be run to setup the environment. Zowe will then run the specified command in the directory specified by the `--cwd` option.

For example, to remove the target directory:

```console
zowe zos-uss issue ssh "rm -Rv *" --cwd "/var/cicsts/bundles/myexpressapp_1.0.0"
echo $?
```

Typically you will need to upload some files as binary, some as text, and exclude others that are not required to run the application. In addition it is best practice to tag files on z/OS as binary or with their text codepage to allow for correct viewing and loading by environments such as Node.js. You can specify these requirements in a .zosattributes file and use the Zowe CLI to upload and tag files in a single command.

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

### Run npm install on z/OS

A Node.js application will typically depend on packages that are described in `package.json`. The dependencies can be installed by running `npm install`. For example:

```console
zowe zos-uss issue ssh "npm install" --cwd "/var/cicsts/bundles/myexpressapp_1.0.0"
```

### Deploy a CICS bundle

Deploying a CICS bundle will define a CICS bundle resource (BUNDLE), then install it, and finally enable it. When the CICS bundle is enabled, the Node.js application is started. For example:

```console
zowe cics-deploy deploy bundle --name Express --bundledir /var/cicsts/bundles/myexpressapp_1.0.0
```

Alternatively, to define and install the BUNDLE but to not enable it:

```console
zowe cics-deploy deploy bundle --name Express --target-state disabled
```