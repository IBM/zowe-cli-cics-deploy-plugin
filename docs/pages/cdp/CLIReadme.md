---
title: Zowe CLI cics-deploy plugin command reference
keywords:
summary: "This section contains syntax reference information for the Zowe CLI CICS deploy plugin"
sidebar: cdp_sidebar
permalink: cdp-CLIReadMe.html
folder: cdp
toc: true
---
# cics-deploy<a name="module-cics-deploy"></a>
Generate and deploy IBM CICS bundle resources
## deploy | d | dep<a name="module-deploy"></a>
Deploy a CICS bundle from zFS to one or more CICS regions within a CICSplex. A BUNDLE resource is installed, ENABLED and made AVAILABLE in the target scope of the CICSplex.
### bundle<a name="command-bundle"></a>
Deploy a CICS bundle from zFS to one or more CICS regions within a CICSplex\.
The DFHDPLOY utility is used to install and make available a BUNDLE resource in
the target group of CICS regions\.

#### Usage

   zowe cics-deploy deploy bundle [options]

#### Required Options

*   `--name`  | `-n` *(string)*

	* Specifies the name of the CICS BUNDLE resource (up to 8 characters) to deploy or
      undeploy\.

*   `--bundle-directory`  | `--bd` | `--bundledir` | `--bundle-dir` *(string)*

	* Specifies the location of the CICS bundle (up to 255 characters) on zFS\.

#### Options

*   `--cicsplex`  | `--cp` *(string)*

	* Specifies the CICSplex (up to 8 characters) to target\. Use this parameter if
      you have not set the \-\-cics\-deploy\-profile option\. For help on creating a
      profile issue the 'zowe profiles create cics\-deploy \-\-help' command\.

*   `--scope`  | `--sc` *(string)*

	* Specifies the name of the CICS System, or CICS System Group (up to 8 characters)
      to target\. Use this parameter if you have not set the \-\-cics\-deploy\-profile
      option\. For help on creating a profile issue the 'zowe profiles create
      cics\-deploy \-\-help' command\.

*   `--csd-group`  | `--cg` | `--csdgroup` *(string)*

	* Specifies the CSD group (up to 8 characters) for the bundle resource\. If a
      bundle is deployed, a definition is added to this group\. If a bundle is
      undeployed, then the definition is removed from this group\. The definition is
      added or removed from the CSD of each system that is specified by the \-\-scope
      option\. The \-\-csd\-group and \-\-res\-group options are mutually exclusive\.

*   `--res-group`  | `--rg` | `--resgroup` *(string)*

	* Specifies the BAS resource group (up to 8 characters) for the bundle resource\.
      If a bundle is deployed, a resource is defined in the BAS data repository\. If a
      bundle is undeployed, the definition is removed\. The \-\-csd\-group and
      \-\-res\-group options are mutually exclusive\.

*   `--cics-hlq`  | `--ch` | `--cicshlq` *(string)*

	* Specifies the high\-level qualifier (up to 35 characters) at which the CICS
      datasets can be found in the target environment\. Use this parameter if you have
      not set the \-\-cics\-deploy\-profile option\.

*   `--cpsm-hlq`  | `--cph` | `--cpsmhlq` *(string)*

	* Specifies the high\-level qualifier (up to 35 characters) at which the CPSM
      datasets can be found in the target environment\. Use this parameter if you have
      not set the \-\-cics\-deploy\-profile option\.

*   `--description`  | `--desc` *(string)*

	* An optional value that specifies a description of the bundle definition (up to
      58 characters)\.

*   `--job-card`  | `--jc` | `--jobcard` *(string)*

	* Specifies the job card to use with any generated DFHDPLOY JCL\. Use this
      parameter if you need to tailor the job card and you have not set the
      \-\-cics\-deploy\-profile option\. You can separate multiple lines of the
      jobcard with \n\.

      Default value: //DFHDPLOY JOB DFHDPLOY,CLASS=A,MSGCLASS=X,TIME=NOLIMIT

*   `--timeout`  | `--to` *(number)*

	* An optional numerical value that specifies the maximum amount of time in seconds
      (1 \- 1800 inclusive) for the DFHDPLOY command to complete\. If not specified
      DFHDPLOY will use its default of 300 seconds\.

*   `--target-state`  | `--ts` | `--targetstate` *(string)*

	* Specifies the target state for the deployed bundle\.

      Default value: ENABLED
      Allowed values: DISABLED, ENABLED, AVAILABLE

*   `--verbose`  | `-v` *(boolean)*

	* Enable or suppress verbose output from the DFHDPLOY tool\.

#### Profile Options

*   `--zosmf-profile`  | `--zosmf-p` *(string)*

	* The name of a (zosmf) profile to load for this command execution\.

*   `--cics-deploy-profile`  | `--cics-deploy-p` *(string)*

	* The name of a (cics\-deploy) profile to load for this command execution\.

### Examples

*  Deploy a CICS bundle with a specific name and location to a
default set of target regions:

      * `$  zowe cics-deploy deploy bundle --name EXAMPLE --bundle-directory /u/example/bundleDir`

*  Deploy a CICS bundle, but declare a timeout if the
processing takes too long:

      * `$  zowe cics-deploy deploy bundle --name EXAMPLE --bundle-directory /u/example/bundleDir --timeout 60`

*  Deploy a CICS bundle to a specific target environment by
using specific zosmf & cics-deploy profiles:

      * `$  zowe cics-deploy deploy bundle --name EXAMPLE --bundle-directory /u/example/bundleDir --cicsplex TESTPLEX --scope SCOPE --res-group BUNDGRP --cics-hlq CICSTS55.CICS720 --cpsm-hlq CICSTS55.CPSM550 --zosmf-profile testplex --cics-deploy-profile devcics`

## generate | g | gen<a name="module-generate"></a>
Generate a CICS bundle and associated metadata files in the current working directory. This allows the application in the current working directory to be deployed to CICS.
### bundle<a name="command-bundle"></a>
Generate a CICS bundle in the working directory\. The associated data is
constructed from a combination of the command\-line options and the contents of
package\.json\. If package\.json exists, no options are required\. If
package\.json does not exist, both \-\-start\-script and \-\-nodejsapp are
required\.

#### Usage

   zowe cics-deploy generate bundle [options]

#### Options

*   `--bundle-id`  | `-b` | `--id` | `--bundleid` *(string)*

	* The ID for the generated CICS bundle, up to 64 characters\. If no value is
      specified, a default value is created from the 'name' property in the
      package\.json file in the current working directory\. If the value is too long,
      it is truncated\. If it contains characters that are not supported by CICS, each
      character is replaced by an X\.

*   `--bundle-version`  | `--bv` | `--bundleversion` *(string)*

	* The major\.minor\.micro version number for the generated CICS bundle\. If no
      value is specified, a default value of 1\.0\.0 is used\.

*   `--nodejsapp`  | `-n` | `--nj` | `--nja` *(string)*

	* The ID of the generated CICS NODEJSAPP resource, up to 32 characters\. If no
      value is specified, a default value is created from the 'name' property in
      package\.json, or the bundleid option if specified\. If the value is too long it
      is truncated\. If it contains characters that are not supported by CICS, each
      character is replaced by an X\.

*   `--start-script`  | `-s` | `--ss` | `--startscript` *(string)*

	* Up to 255 character path to the Node\.js start script that runs when the
      associated bundle is enabled in CICS\. If a value is not specified, a default
      value is created from either the 'scripts\.start' property of the package\.json
      file in the current working directory, or from the 'main' property\.

*   `--port`  | `-p` *(string)*

	* The TCP/IP port number the Node\.js application should use for clients to
      connect to\. If a value is specified, it is set within the generated NODEJSAPP's
      profile\. The Node\.js application can reference this value by accessing the
      PORT environment variable, for example using process\.env\.PORT\. Additional
      environment variables can be set by manually editing the profile\.

*   `--overwrite`  | `--ow` *(boolean)*

	* Enable or disable the ability to replace existing files within a CICS bundle\.

*   `--merge`  | `--me` *(boolean)*

	* Enable or disable the ability to merge new resources into an existing CICS
      bundle manifest\.Requires \-\-overwrite to be specified\.

### Examples

*  Generate a CICS bundle in the working directory, taking
information from package.json:

      * `$  zowe cics-deploy generate bundle `

*  Generate a CICS bundle in the working directory, based on
package.json but using a bundle ID of "mybundle":

      * `$  zowe cics-deploy generate bundle --bundle-id mybundle`

*  Generate a CICS bundle in the working directory in which a
package.json does not exist:

      * `$  zowe cics-deploy generate bundle --bundle-id mybundle --nodejsapp myapp --start-script server.js`

## push | p<a name="module-push"></a>
Push combines several actions for deploying a bundle to CICS into a single command. It uploads the bundle to z/OS, optionally runs an 'npm install' command on the remote system, then uses DFHDPLOY to install and enable the bundle in a target CICS environment.
### bundle<a name="command-bundle"></a>
Push a CICS bundle from the working directory to a target CICSplex\.

#### Usage

   zowe cics-deploy push bundle [options]

#### Required Options

*   `--name`  | `-n` *(string)*

	* Specifies the name of the CICS BUNDLE resource (up to 8 characters) to deploy or
      undeploy\.

*   `--target-directory`  | `--td` | `--targetdir` | `--target-dir` *(string)*

	* Specifies the target zFS location in which the CICS bundle is to be created (up
      to 255 characters)

#### Options

*   `--cicsplex`  | `--cp` *(string)*

	* Specifies the CICSplex (up to 8 characters) to target\. Use this parameter if
      you have not set the \-\-cics\-deploy\-profile option\. For help on creating a
      profile issue the 'zowe profiles create cics\-deploy \-\-help' command\.

*   `--scope`  | `--sc` *(string)*

	* Specifies the name of the CICS System, or CICS System Group (up to 8 characters)
      to target\. Use this parameter if you have not set the \-\-cics\-deploy\-profile
      option\. For help on creating a profile issue the 'zowe profiles create
      cics\-deploy \-\-help' command\.

*   `--csd-group`  | `--cg` | `--csdgroup` *(string)*

	* Specifies the CSD group (up to 8 characters) for the bundle resource\. If a
      bundle is deployed, a definition is added to this group\. If a bundle is
      undeployed, then the definition is removed from this group\. The definition is
      added or removed from the CSD of each system that is specified by the \-\-scope
      option\. The \-\-csd\-group and \-\-res\-group options are mutually exclusive\.

*   `--res-group`  | `--rg` | `--resgroup` *(string)*

	* Specifies the BAS resource group (up to 8 characters) for the bundle resource\.
      If a bundle is deployed, a resource is defined in the BAS data repository\. If a
      bundle is undeployed, the definition is removed\. The \-\-csd\-group and
      \-\-res\-group options are mutually exclusive\.

*   `--cics-hlq`  | `--ch` | `--cicshlq` *(string)*

	* Specifies the high\-level qualifier (up to 35 characters) at which the CICS
      datasets can be found in the target environment\. Use this parameter if you have
      not set the \-\-cics\-deploy\-profile option\.

*   `--cpsm-hlq`  | `--cph` | `--cpsmhlq` *(string)*

	* Specifies the high\-level qualifier (up to 35 characters) at which the CPSM
      datasets can be found in the target environment\. Use this parameter if you have
      not set the \-\-cics\-deploy\-profile option\.

*   `--description`  | `--desc` *(string)*

	* An optional value that specifies a description of the bundle definition (up to
      58 characters)\.

*   `--job-card`  | `--jc` | `--jobcard` *(string)*

	* Specifies the job card to use with any generated DFHDPLOY JCL\. Use this
      parameter if you need to tailor the job card and you have not set the
      \-\-cics\-deploy\-profile option\. You can separate multiple lines of the
      jobcard with \n\.

      Default value: //DFHDPLOY JOB DFHDPLOY,CLASS=A,MSGCLASS=X,TIME=NOLIMIT

*   `--timeout`  | `--to` *(number)*

	* An optional numerical value that specifies the maximum amount of time in seconds
      (1 \- 1800 inclusive) for the DFHDPLOY command to complete\. If not specified
      DFHDPLOY will use its default of 300 seconds\.

*   `--target-state`  | `--ts` | `--targetstate` *(string)*

	* Specifies the target state for the deployed bundle\.

      Default value: ENABLED
      Allowed values: DISABLED, ENABLED, AVAILABLE

*   `--verbose`  | `-v` *(boolean)*

	* Enable or suppress verbose output from the DFHDPLOY tool\.

*   `--overwrite`  | `--ow` *(boolean)*

	* Enable or disable the ability to replace an existing bundle directory or bundle
      on the remote system\.

#### Profile Options

*   `--zosmf-profile`  | `--zosmf-p` *(string)*

	* The name of a (zosmf) profile to load for this command execution\.

*   `--ssh-profile`  | `--ssh-p` *(string)*

	* The name of a (ssh) profile to load for this command execution\.

*   `--cics-deploy-profile`  | `--cics-deploy-p` *(string)*

	* The name of a (cics\-deploy) profile to load for this command execution\.

*   `--cics-profile`  | `--cics-p` *(string)*

	* The name of a (cics) profile to load for this command execution\.

### Examples

*  Push a CICS bundle from the working directory by using
default cics-deploy, ssh and zosmf profiles:

      * `$  zowe cics-deploy push bundle --name EXAMPLE --target-directory /u/example/bundles`

*  Push a CICS bundle from the working directory by using
specific zosmf, ssh & cics-deploy profiles:

      * `$  zowe cics-deploy push bundle --name EXAMPLE --target-directory /u/example/bundles --zosmf-profile testplex --cics-deploy-profile devcics --ssh-profile ssh`

*  Push a CICS bundle from the working directory replacing any
bundle of the same name that is already deployed:

      * `$  zowe cics-deploy push bundle --name EXAMPLE --target-directory /u/example/bundles --overwrite`

## undeploy | u | udep<a name="module-undeploy"></a>
Undeploy a CICS bundle from one or more CICS regions within a CICSplex. A BUNDLE resource is made UNAVAILABLE, it is then DISABLED and DISCARDED from the target scope with the CICSplex.
### bundle<a name="command-bundle"></a>
Undeploy a CICS bundle from one or more CICS regions within a CICSplex\. The
DFHDPLOY utility is used to undeploy and remove a BUNDLE resource from the
target group of CICS regions\.

#### Usage

   zowe cics-deploy undeploy bundle [options]

#### Required Options

*   `--name`  | `-n` *(string)*

	* Specifies the name of the CICS BUNDLE resource (up to 8 characters) to deploy or
      undeploy\.

#### Options

*   `--cicsplex`  | `--cp` *(string)*

	* Specifies the CICSplex (up to 8 characters) to target\. Use this parameter if
      you have not set the \-\-cics\-deploy\-profile option\. For help on creating a
      profile issue the 'zowe profiles create cics\-deploy \-\-help' command\.

*   `--scope`  | `--sc` *(string)*

	* Specifies the name of the CICS System, or CICS System Group (up to 8 characters)
      to target\. Use this parameter if you have not set the \-\-cics\-deploy\-profile
      option\. For help on creating a profile issue the 'zowe profiles create
      cics\-deploy \-\-help' command\.

*   `--csd-group`  | `--cg` | `--csdgroup` *(string)*

	* Specifies the CSD group (up to 8 characters) for the bundle resource\. If a
      bundle is deployed, a definition is added to this group\. If a bundle is
      undeployed, then the definition is removed from this group\. The definition is
      added or removed from the CSD of each system that is specified by the \-\-scope
      option\. The \-\-csd\-group and \-\-res\-group options are mutually exclusive\.

*   `--res-group`  | `--rg` | `--resgroup` *(string)*

	* Specifies the BAS resource group (up to 8 characters) for the bundle resource\.
      If a bundle is deployed, a resource is defined in the BAS data repository\. If a
      bundle is undeployed, the definition is removed\. The \-\-csd\-group and
      \-\-res\-group options are mutually exclusive\.

*   `--cics-hlq`  | `--ch` | `--cicshlq` *(string)*

	* Specifies the high\-level qualifier (up to 35 characters) at which the CICS
      datasets can be found in the target environment\. Use this parameter if you have
      not set the \-\-cics\-deploy\-profile option\.

*   `--cpsm-hlq`  | `--cph` | `--cpsmhlq` *(string)*

	* Specifies the high\-level qualifier (up to 35 characters) at which the CPSM
      datasets can be found in the target environment\. Use this parameter if you have
      not set the \-\-cics\-deploy\-profile option\.

*   `--job-card`  | `--jc` | `--jobcard` *(string)*

	* Specifies the job card to use with any generated DFHDPLOY JCL\. Use this
      parameter if you need to tailor the job card and you have not set the
      \-\-cics\-deploy\-profile option\. You can separate multiple lines of the
      jobcard with \n\.

      Default value: //DFHDPLOY JOB DFHDPLOY,CLASS=A,MSGCLASS=X,TIME=NOLIMIT

*   `--timeout`  | `--to` *(number)*

	* An optional numerical value that specifies the maximum amount of time in seconds
      (1 \- 1800 inclusive) for the DFHDPLOY command to complete\. If not specified
      DFHDPLOY will use its default of 300 seconds\.

*   `--target-state`  | `--ts` | `--targetstate` *(string)*

	* Specifies the target state for the undeployed bundle\.

      Default value: DISCARDED
      Allowed values: UNAVAILABLE, DISABLED, DISCARDED

*   `--verbose`  | `-v` *(boolean)*

	* Enable or suppress verbose output from the DFHDPLOY tool\.

#### Profile Options

*   `--zosmf-profile`  | `--zosmf-p` *(string)*

	* The name of a (zosmf) profile to load for this command execution\.

*   `--cics-deploy-profile`  | `--cics-deploy-p` *(string)*

	* The name of a (cics\-deploy) profile to load for this command execution\.

### Examples

*  Undeploy a CICS bundle by using the default cics-deploy
profile:

      * `$  zowe cics-deploy undeploy bundle --name EXAMPLE`

*  Undeploy a CICS bundle, and declare a timeout if the
processing takes too long:

      * `$  zowe cics-deploy undeploy bundle --name EXAMPLE --timeout 60`

*  Undeploy a CICS bundle from a specific target environment by
using specific zosmf and cics-deploy profiles:

      * `$  zowe cics-deploy undeploy bundle --name EXAMPLE --cics-plex TESTPLEX --scope SCOPE --res-group BUNDGRP --cics-hlq CICSTS55.CICS720 --cpsm-hlq CICSTS55.CPSM550 --zosmf-profile testplex --cics-deploy-profile devcics`

# profiles<a name="module-profiles"></a>
Create and manage configuration profiles
## create | cre<a name="module-create"></a>
Create new configuration profiles.
### cics-deploy-profile<a name="command-cics-deploy-profile"></a>
Specifies the target environment for the cics\-deploy deploy and undeploy
actions\.

#### Usage

   zowe profiles create cics-deploy-profile <profileName> [options]

#### Positional Arguments

*   `profileName`		 *(string)*

	* Specifies the name of the new cics\-deploy profile\. You can load this profile
      by using the name on commands that support the "\-\-cics\-deploy\-profile"
      option\.

#### Required Options

*   `--cicsplex`  | `--cp` *(string)*

	* Specifies the CICSplex (up to 8 characters) to target\.

*   `--scope`  | `--sc` *(string)*

	* Specifies the name of the CICS System, or CICS System Group (up to 8 characters)
      to target\.

*   `--cics-hlq`  | `--ch` | `--cicshlq` *(string)*

	* Specifies the High Level Qualifier (up to 35 characters) at which the CICS
      datasets can be found in the target environment\.

*   `--cpsm-hlq`  | `--cph` | `--cpsmhlq` *(string)*

	* Specifies the High Level Qualifier (up to 35 characters) at which the CPSM
      datasets can be found in the target environment\.

*   `--job-card`  | `--jc` | `--jobcard` *(string)*

	* Specifies the job card to use with any generated DFHDPLOY JCL\.

      Default value: //DFHDPLOY JOB DFHDPLOY,CLASS=A,MSGCLASS=X,TIME=NOLIMIT

#### Options

*   `--csd-group`  | `--cg` | `--csdgroup` *(string)*

	* Specifies the CSD group (up to 8 characters) for the bundle resource\. If a
      bundle is deployed then a definition is added to this group; if a bundle is
      undeployed then the definition is removed from this group\. The CSD group is
      changed for each CICS system that is specified by the \-\-scope option\. The
      \-\-csd\-group and \-\-res\-group options are mutually exclusive\.

*   `--res-group`  | `--rg` | `--resgroup` *(string)*

	* Specifies the BAS resource group (up to 8 characters) for the bundle resource\.
      If a bundle is deployed then a resource is defined in the BAS data repository;
      if a bundle is undeployed then the definition is removed\. The \-\-csd\-group
      and \-\-res\-group options are mutually exclusive\.

*   `--target-directory`  | `--td` | `--targetdir` | `--target-dir` *(string)*

	* Specifies the target zFS location to which CICS bundles should be uploaded (up
      to 255 characters)\.

*   `--overwrite`  | `--ow` *(boolean)*

	* Overwrite the cics\-deploy profile when a profile of the same name exists\.

### Examples

*  Create a cics-deploy profile called 'example1' to connect to
a CPSM managed group of CICS regions within the TESTGRP1 scope of a cicsplex
named PLEX1:

      * `$  zowe profiles create cics-deploy-profile example1 --cicsplex PLEX1 --scope TESTGRP1 --cics-hlq CICSTS55.CICS720 --cpsm-hlq CICSTS55.CPSM550`

*  Create a cics-deploy profile called 'example2' to connect to
the same CPSM managed group of regions, and identify a BAS resource group
BUNDGRP1 in which to store resource definitions:

      * `$  zowe profiles create cics-deploy-profile example2 --cicsplex PLEX1 --scope TESTGRP1 --cics-hlq CICSTS55.CICS720 --cpsm-hlq CICSTS55.CPSM550 --res-group BUNDGRP1`

*  Create a cics-deploy profile called 'example3' to connect to
the same CPSM managed group of regions, and identify the default USS directory
to which bundles should be uploaded:

      * `$  zowe profiles create cics-deploy-profile example3 --cicsplex PLEX1 --scope TESTGRP1 --cics-hlq CICSTS55.CICS720 --cpsm-hlq CICSTS55.CPSM550 --target-directory /var/cicsts/bundles`

## update | upd<a name="module-update"></a>
Update a  profile.You can update any property present within the profile configuration. The updated profile  will be printed so that you can review the result of the updates.
### cics-deploy-profile<a name="command-cics-deploy-profile"></a>
Specifies the target environment for the cics\-deploy deploy and undeploy
actions\.

#### Usage

   zowe profiles update cics-deploy-profile <profileName> [options]

#### Positional Arguments

*   `profileName`		 *(string)*

	* Specifies the name of the new cics\-deploy profile\. You can load this profile
      by using the name on commands that support the "\-\-cics\-deploy\-profile"
      option\.

#### Options

*   `--cicsplex`  | `--cp` *(string)*

	* Specifies the CICSplex (up to 8 characters) to target\.

*   `--scope`  | `--sc` *(string)*

	* Specifies the name of the CICS System, or CICS System Group (up to 8 characters)
      to target\.

*   `--csd-group`  | `--cg` | `--csdgroup` *(string)*

	* Specifies the CSD group (up to 8 characters) for the bundle resource\. If a
      bundle is deployed then a definition is added to this group; if a bundle is
      undeployed then the definition is removed from this group\. The CSD group is
      changed for each CICS system that is specified by the \-\-scope option\. The
      \-\-csd\-group and \-\-res\-group options are mutually exclusive\.

*   `--res-group`  | `--rg` | `--resgroup` *(string)*

	* Specifies the BAS resource group (up to 8 characters) for the bundle resource\.
      If a bundle is deployed then a resource is defined in the BAS data repository;
      if a bundle is undeployed then the definition is removed\. The \-\-csd\-group
      and \-\-res\-group options are mutually exclusive\.

*   `--cics-hlq`  | `--ch` | `--cicshlq` *(string)*

	* Specifies the High Level Qualifier (up to 35 characters) at which the CICS
      datasets can be found in the target environment\.

*   `--cpsm-hlq`  | `--cph` | `--cpsmhlq` *(string)*

	* Specifies the High Level Qualifier (up to 35 characters) at which the CPSM
      datasets can be found in the target environment\.

*   `--target-directory`  | `--td` | `--targetdir` | `--target-dir` *(string)*

	* Specifies the target zFS location to which CICS bundles should be uploaded (up
      to 255 characters)\.

*   `--job-card`  | `--jc` | `--jobcard` *(string)*

	* Specifies the job card to use with any generated DFHDPLOY JCL\.

## delete | rm<a name="module-delete"></a>
Delete existing profiles.
### cics-deploy-profile<a name="command-cics-deploy-profile"></a>
Delete a cics\-deploy profile\. You must specify a profile name to be deleted\.
To find a list of available profiles for deletion, issue the profiles list
command\. By default, you will be prompted to confirm the profile removal\.

#### Usage

   zowe profiles delete cics-deploy-profile <profileName> [options]

#### Positional Arguments

*   `profileName`		 *(string)*

	* Specifies the name of the cics\-deploy profile to be deleted\. You can also load
      this profile by using the name on commands that support the
      "\-\-cics\-deploy\-profile" option\.

#### Options

*   `--force`  *(boolean)*

	* Force deletion of profile, and dependent profiles if specified\. No prompt will
      be displayed before deletion occurs\.

### Examples

*  Delete a cics-deploy profile named profilename:

      * `$  zowe profiles delete cics-deploy-profile profilename`

## list | ls<a name="module-list"></a>
List profiles of the type 
### cics-deploy-profiles<a name="command-cics-deploy-profiles"></a>
Specifies the target environment for the cics\-deploy deploy and undeploy
actions\.

#### Usage

   zowe profiles list cics-deploy-profiles [options]

#### Options

*   `--show-contents`  | `--sc` *(boolean)*

	* List cics\-deploy profiles and their contents\. All profile details will be
      printed as part of command output\.

### Examples

*  List profiles of type cics-deploy:

      * `$  zowe profiles list cics-deploy-profiles `

*  List profiles of type cics-deploy and display their
contents:

      * `$  zowe profiles list cics-deploy-profiles --sc`

## set-default | set<a name="module-set-default"></a>
Set which profiles are loaded by default.
### cics-deploy-profile<a name="command-cics-deploy-profile"></a>
The cics\-deploy set default\-profiles command allows you to set the default
profiles for this command group\. When a cics\-deploy command is issued and no
profile override options are specified, the default profiles for the command
group are automatically loaded for the command based on the commands profile
requirements\.

#### Usage

   zowe profiles set-default cics-deploy-profile <profileName> [options]

#### Positional Arguments

*   `profileName`		 *(string)*

	* Specify a
      profile for default usage within the cics\-deploy group\. When you issue
      commands within the cics\-deploy group without a profile specified as part of
      the command, the default will be loaded instead\.

### Examples

*  Set the default profile for type cics-deploy to the profile
named 'profilename':

      * `$  zowe profiles set-default cics-deploy-profile profilename`

