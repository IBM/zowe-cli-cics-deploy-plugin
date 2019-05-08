---
title: Developer pushing Node.js apps
tags: [getting_started]
keywords:
summary: "Pushing a bundle to CICS is a composite action that uploads a bundle from the current directory to a z/OS directory, then installs and enables it in the target CICS environment."
sidebar: cdp_sidebar
permalink: cdp-Developer-pushing-Node.js-apps.html
folder: cdp
---

## Pushing a bundle to a CPSM-managed CICS environment

 This process consists of several stages, which are combined together as a simple action. Advanced users might prefer to issue the subcommands individually, perhaps adding customized site-specific automation, rather than using the `push` action.

<a name="push_req"></a>
### Requirements for using push

The cics-deploy push command combines several activities into a single combined action. 

To use the `push` command, you need to ensure that several Zowe profiles are created:

* A `zosmf` profile. 
  The `cics-deploy push bundle` command interacts with the target z/OS environment by using several different protocols, one of which is z/OSMF. The zosmf profile in Zowe defines the connectivity parameters that are required to connect to a remote z/OSMF server in the target z/OS environment.

* An `ssh` profile. 
  The `cics-deploy push bundle` command might attempt to issue UNIX commands over the SSH protocol. To do so, it requires a profile to be defined for the remote SSH server. 
  
* You might also consider creating a `cics-deploy` profile.
  Use of a cics-deploy profile is not mandatory, but is encouraged. Using a profile avoids the need to enter the associated parameters each time a cics-deploy command is issued.

For more information about creating profiles, see [Installation and Setup](installation-and-setup).

You also need an existing CICS bundle in the current working directory. For more information about bundle enabling a directory, see [Generating a CICS bundle](#generation)).

<a name="usage_examples"></a>
### Usage Examples

The `cics-deploy push bundle` command pushes a bundle from the working directory to a target CICS environment. It requires the use of a z/OSMF profile and an ssh profile to do so, use of a cics-deploy profile is also encouraged (for more information on these dependencies see [Requirements for Push](#push_req)). You can request assistance on using the push command by issuing the following command:

  `zowe cics-deploy push bundle --help`

If you have configured default profiles for zosmf, ssh and cics-deploy then only two further items are needed:

1. A unique name (up to 8 characters) to use for the BUNDLE resource in CICS.
2. A directory in the target z/OS directory in which do stage the bundle's resources.

For example, you might issue the following command:

  `zowe cics-deploy push bundle --name EXAMPLE1 --targetdir /u/user01/myBundles`

This command causes cics-deploy to attempt to deploy a bundle from the current working directory to the target CICS environment under the name `EXAMPLE1`. If a bundle exists in the target environment with the same name, cics-deploy returns an error. You can instruct cics-deploy to overwrite the existing bundle by adding the --overwrite parameter, for example:

  `zowe cics-deploy push bundle --name EXAMPLE1 --targetdir /u/user01/myBundles --overwrite`

You can also request verbose messages from cics-deploy by adding the --verbose option, for example:

  `zowe cics-deploy push bundle --name EXAMPLE1 --targetdir /u/user01/myBundles --overwrite --verbose`


<a name="push_components"></a>
### Subcomponents of the push command

The `cics-deploy push bundle` command consists of several separate actions, each of which can be issued separately if there is a requirement to do so. The push command performs the following actions:

1. It undeploys an existing bundle by using `zowe cics-deploy undeploy bundle` (See [Undeploying a CICS bundle](#undeploying)).
2. It uploads the local bundle directory to zFS by using `zowe zos-files upload dir-to-uss`.
3. If the bundle contains a package.json file, it runs `npm install` on the remote system by using `zowe zos-uss issue ssh`.
4. It deploys a bundle by using `zowe cics-deploy deploy bundle` (See [Deploying a CICS bundle](#deploying)).

Advanced users might prefer to use these subcommands in preference to the `push` command. For example, if the target CICS regions are not CPSM-managed then you might use Zowe to generate and then upload the bundle, and your own scripts to deploy the bundle into a CICS region.

