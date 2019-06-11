---
title: Provisioning a CICS region
tags: [tutorial]
keywords:
summary: "The following steps take you through provisioning a CICS region from a z/OS Provisioning Toolkit image. You can then deploy and test applications using the CICS region."
sidebar: cdp_sidebar
permalink: cdp-Provisioning-a-CICS-region.html
folder: cdp
toc: true
---

The [z/OS Provisioning Toolkit](https://developer.ibm.com/mainframe/products/zospt/) (z/OS PT) provides a command line utility and z/OSMF workflows to provision CICS regions and other development environments on z/OS. This tutorial requires z/OS PT version 1.1.5 or above to be installed on z/OS.

### Provision your CICS region using a z/OS PT image

Before you can provision a CICS region, a z/OS PT image needs to be created and built as outlined in [Preparing a z/OS PT image](cdp-Preparing-a-zOS-PT-image). This is typically prepared by a CICS system administrator.

#### Procedure

1. Install the Zowe CLI and plug-ins by following the steps in [Installing](cdp-Installing).

2. Create Zowe CLI profiles by following the steps in [Creating Zowe CLI profiles](cdp-Creating-Zowe-CLI-profiles).

3. On z/OS, update your user `.profile` file to run z/OS PT.

   Add the directory to the `zospt` command to your PATH.

   ```properties
   export PATH=$PATH:zospt_directory/bin
   ```

   Optional: To avoid the password prompt for each `zospt` command, set environment variable `zospt_pw`. Ensure others do not have access to read your .profile:

   ```properties
   export zospt_pw=
   ```

   Optional: If z/OSMF is configured with domain and tenant names that are not the default as described in [Configuring z/OS Provisioning Toolkit](https://www.ibm.com/support/knowledgecenter/en/SSXH44E_1.0.0/zospt/zospt-configuring.html), add the following environment variables:

   ```properties
   export zospt_domain=
   export zospt_tenant=
   ```

4. On your workstation, test you can run z/OS PT.

   ```console
   zowe zos-uss issue ssh "zospt --help"
   ```

5. Provision your CICS region.

   Update `--name` to specify a name for the container that is easy to remember for use in later commands. This command may take a few minutes to complete.

   ```console
   zowe zos-uss issue ssh "zospt run cics_55_nodejs --name my_cics_region"
   ```

6. Display your CICS region information.

   ```console
   zowe zos-uss issue ssh "zospt inspect my_cics_region"
   ```

   The output is in JSON format and includes values for the CICS region application ID, and the z/OS directory within which your CICS bundles can be uploaded. For example:

   <pre class="messageText">
    "DFH_REGION_APPLID": "CICPY000",
    "DFH_REGION_ZFS_DIRECTORY": "/u/cicprov/mnt/CICPY000",</pre>

    Your application can use the directories and files under the DFH_REGION_ZFS_DIRECTORY path:

   | DFH_REGION_ZFS_DIRECTORY<br>sub-directory | Usage |
   | --- | -- |
   | JVMProfiles/ | JVM server profiles |
   | bundles/ | CICS bundles |
   | dfhconfig/ | CICS configuration files |
   | dfhconfig/nodejsprofiles/general.profile | General profile containing values for WORK_DIR and NODE_HOME. Node.js application should include this by adding `%INCLUDE=&USSCONFIG;/nodejsprofiles/general.profile` to their CICS Node.js application profile |
   | workdir/ | Trace, log and configuration files create by applications, Node.js runtimes, Java runtimes, and CICS runtimes |

7. Update your Zowe CLI cics-deploy profile to deploy to your CICS region by default.

   Update `--scope` to specify the value from DFH_REGION_APPLID, and `--bundle-directory` to specify the `bundles` subdirectory of DFH_REGION_ZFS_DIRECTORY. For example:

   ```console
   zowe profiles update cics-deploy cics --scope CICPY000 --bundle-directory "/u/cicprov/mnt/CICPY000/bundles"
   ```

#### Results

You are now ready to deploy applications to the provisioned CICS region. You can try this out by following the steps in [Deploying your first Node.js app](cdp-Deploying-your-first-nodejs-app). During deployment, the CICS bundle will be copied into the `bundles/` directory, and output files will be written into a sub-directory of `workdir/`.

### Stop your CICS region

The CICS region, and the applications running in it, can be stopped if you are not going to be using them for a while by using the following command:

```console
zowe zos-uss issue ssh "zospt stop my_cics_region"
```

### Start your CICS region

The CICS region can be started after it was previously stopped, for example due to the z/OS system being restarted, by using the following command:

```console
zowe zos-uss issue ssh "zospt start my_cics_region"
```

### Deprovision your CICS region

The CICS region can be stopped and removed completely using the following commands. This will remove the `DFH_REGION_ZFS_DIRECTORY` directory used to upload your CICS application and store application output files.

```console
zowe zos-uss issue ssh "zospt rm -f my_cics_region"
```
