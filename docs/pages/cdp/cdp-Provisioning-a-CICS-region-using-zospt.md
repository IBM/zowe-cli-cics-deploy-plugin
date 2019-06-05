---
title: Provisioning a CICS region using z/OS PT
tags: [tutorial]
keywords:
summary: "The following steps take you through preparing a z/OS Provisioning Toolkit image for CICS, provisioning a CICS region using the image, and then starting, stopping and deprovisioning it."
sidebar: cdp_sidebar
permalink: cdp-Provisioning-a-CICS-region-using-zospt.html
folder: cdp
toc: true
---

The [z/OS Provisioning Toolkit](https://developer.ibm.com/mainframe/products/zospt/) (z/OS PT) provides a command line utility and z/OSMF workflows to provision CICS regions and other development environments on z/OS. This tutorial requires z/OS PT version 1.1.5 or above to be installed on z/OS.

### Prepare a z/OS PT image

A z/OS PT image contains the configuration and files necessary to provision a CICS region. This is typically prepared by the CICS system administrator. The main configuration is in the file `zosptfile` in the form of properties that are described in [Configuration properties for CICS images](https://www.ibm.com/support/knowledgecenter/en/SSXH44E_1.0.0/zospt/cics/zospt-cics-properties.html).

For example, to support Node.js applications `zosptfile` should include:

| zosptfile&nbsp;entry&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Usage |
| --- | -- |
| `FROM cics_55` | Provision a CICS TS V5.5 region that is the minimum release that supports Node.js applications. |
| `ENV DFH_CICS_TYPE=MAS` | CICS region should be managed by CPSM to enable the DFHDPLOY utility to deploy applications. |
| `ENV DFH_CICSPLEX=` | Name of the CICSplex this region is to join. |
| `ENV DFH_NODE_HOME=` | Installation directory for Node.js runtime provided by IBM SDK for Node.js - z/OS. |
| `COPY bundles bundles` | Create an empty `bundles` directory in the provisioned file system to contain CICS bundles. |

To create a z/OS PT image source directory, a `zosptfile` file, and build it ready for developers to provision CICS regions, run the following commands on z/OS:

```console
export ZOSPTIMAGE=~/zosptimages/cics_55_nodejs

mkdir -p $ZOSPTIMAGE/bundles

iconv -f IBM1047 -t UTF-8  > $ZOSPTIMAGE/zosptfile << EOF
FROM cics_55
ENV DFH_CICS_TYPE=MAS
ENV DFH_CICSPLEX=ZOSPTINT
ENV DFH_NODE_HOME=/usr/lpp/IBM/cnj/IBM/node-latest-os390-s390x
COPY bundles bundles
EOF

chtag -tc UTF-8 $ZOSPTIMAGE/zosptfile

zospt build $ZOSPTIMAGE -t cics_55_nodejs
```

### Provision your CICS region using a z/OS image

1. Update your user `.profile` file on z/OS to run z/OS PT.

   Add the directory to the `zospt` command to your PATH.
   ```properties
   export PATH=$PATH:zospt_directory/bin
   ```

   Optional: To avoid the password prompt for each zospt command, specify your password as the environment variable. Ensure others do not have access to read your .profile:

   ```properties
   export zospt_pw=
   ```

   Optional: If z/OSMF is configured with domain and tenant names that are not the default as described in [Configuring z/OS Provisioning Toolkit](https://www.ibm.com/support/knowledgecenter/en/SSXH44E_1.0.0/zospt/zospt-configuring.html), add the following environment variables:

   ```properties
   export zospt_domain=
   export zospt_tenant=
   ```

2. Provision your CICS region.

   Use the `--name` option to specify a name for the container that is easy to remember for use in later commands. The provisioning steps may take several minutes to complete.

   ```console
   zowe zos-uss issue ssh "zospt run cics_55_nodejs --name my_cics_region"
   ```

3. Display your CICS region information.

   ```console
   zowe zos-uss issue ssh "zospt inspect my_cics_region"
   ```

   The output is in JSON format and includes values for the CICS region application ID, and the z/OS directory within which your CICS bundles can be uploaded. For example:

   <pre class="messageText">
    "DFH_REGION_APPLID": "CICPY000",
    "DFH_REGION_ZFS_DIRECTORY": "/u/cicprov/mnt/CICPY000",</pre>

    Your applications can make use of the directories and files under the DFH_REGION_ZFS_DIRECTORY path:

   | DFH_REGION_ZFS_DIRECTORY<br>sub-directory | Usage |
   | --- | -- |
   | /JVMProfiles | JVM server profiles |
   | /bundles | CICS bundles |
   | /dfhconfig | CICS configuration files |
   | /dfhconfig/nodejsprofiles/general.profile | General profile containing values for WORK_DIR and NODE_HOME. Node.js application should include this by adding `%INCLUDE=&USSCONFIG;/nodejsprofiles/general.profile` to their CICS Node.js application profile |
   | /workdir | Trace, log and configuration files create by applications, Node.js runtimes, Java runtimes, and CICS runtimes |


4. Update your Zowe CLI cics-deploy profile options to deploy to your CICS region by default.

   Update `--scope` to be the value from DFH_REGION_APPLID, and `--bundle-directory` to be the `bundles` subdirectory of DFH_REGION_ZFS_DIRECTORY. For example:

   ```console
   zowe profiles update cics-deploy cics --scope CICPY000 --bundle-directory "/u/cicprov/mnt/CICPY000/bundles"
   ```

### Deploying an application to your CICS region

You are now ready to deploy applications to the provisioned CICS region. You can try this out by following the steps in [Deploying your first Node.js app](cdp-Deploying-your-first-nodejs-app). During deployment, the CICS bundle will be copied into the `/bundles` directory, and output files will be written into a sub-directory of `/workdir`.

### Stop your CICS region

The CICS region and the applications running in it can be stopped if you are not going to be using them for a while by using the following command:

```console
zowe zos-uss issue ssh "zospt stop my_cics_region"
```

### Start your CICS region

The CICS region can be started after it was previously stopped, or the z/OS system was restarted, by using the following command:

```console
zowe zos-uss issue ssh "zospt start my_cics_region"
```

### Deprovision your CICS region

The CICS region can be stopped and removed completely using the following commands. This will remove the z/OS directory used to upload your CICS applications:

```console
zowe zos-uss issue ssh "zospt stop my_cics_region"
zowe zos-uss issue ssh "zospt rm my_cics_region"
```
