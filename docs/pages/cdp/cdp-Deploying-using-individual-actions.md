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

The `zowe cics-deploy push bundle` command performs a set of actions to deploy applications to CICS. The actions include undeploying the old version of the CICS bundle, uploading the new version of the CICS bundle to z/OS, running `npm install` on z/OS to resolve dependencies, and finally deploying the new version of the CICS bundle.

However, there may be situations where you need more control or perform alternate actions. The following sections describe how each of these actions could be performed independently, enabling you to form a sequence of commands to achieve your needs.

### Undeploy a CICS bundle

Undeploying a CICS bundle will first disable the BUNDLE resource in CICS. This will result in all CICS resources defined in the BUNDLE being disabled. To disable Node.js applications, CICS will send a SIGTERM signal to the application. The CICS bundle will then be discarded from CICS. This command will not remove the CICS bundle from the z/OS directory.

```console
zowe cics-deploy undeploy bundle --name Express
```

Alternatively, if you want to disable the CICS bundle, but to not discard it:

```console
zowe cics-deploy undeploy bundle --name Express --target-state disabled
```

### Upload to z/OS

There are several ways to upload a CICS bundle to z/OS, such as FTP, Git, and Zowe. Typically you will need to upload some files as binary, some as text, and exclude others that are not required to run the application. It is best practice to tag files on z/OS as binary or with their text codepage to allow for correct viewing and loading by environments such as Node.js. You can specify these requirements in a .zosattributes file and use the Zowe CLI to upload and tag files in a single command.

For example, create file **~/myExpressApp/.zosattributes** in the CICS bundle:

```
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
zowe zos-files upload dir-to-uss ~/myExpressApp/ /var/cicsts/bundles --recursive --attributes my_global_attributes
```

### Run npm install on z/OS

There are several ways to run shell commands and scripts on z/OS, such as SSH, batch jobs, and Zowe. When using Zowe, an SSH connection will be established, the user will be logged in, the shell .profile will be run to setup the environment. Zowe will then run the specified command in the directory specified by the `--cdw` option.

```console
zowe zos-uss issue ssh "npm install" --cdw "/var/cicsts/bundles"
```

### Deploy a CICS bundle

Deploying a CICS bundle will define the BUNDLE resource in CICS, then install, then enable the BUNDLE.

```console
zowe cics-deploy deploy bundle --name EXAMPLE --bundledir /var/cicsts/bundles/myExpressApp_1.0.0
```

Alternatively, if you want to define and install the CICS bundle, but to not enable it:

```console
zowe cics-deploy deploy bundle --name Express --target-state disabled
```