---
title: Provision a CICS region using z/OS PT and deploy a Node.js application
tags: [getting_started]
keywords:
summary: "The following steps take you through provisioning a CICS region using the z/OS Provisioning Toolkit, then creating and deploying an application to the CICS region."
sidebar: cdp_sidebar
permalink: cdp-Deploying-into-zospt-cics-region.html
folder: cdp
toc: true
---

The [z/OS Provisioning Toolkit](https://developer.ibm.com/mainframe/products/zospt/) (z/OS PT) provides a command line utility provision CICS regions and other development environment on z/OS. This tutorial requires z/OS PT version 1.1.5 or above to be installed.

### Prepare a z/OS PT image

A z/OS PT image contains the configuration and files necessary to provision the CICS region. This is typically prepared by the CICS system programmer for use by many developers. The configuration should include:

| zosptfile&nbsp;entry&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Usage |
| --- | -- |
| `FROM cics_55` | Build a CICS TS V5.5 region |
| `ENV DFH_NODE_HOME=` | Specify the directory for IBM SDK for Node.js - z/OS |
| `ENV DFH_CICS_TYPE=MAS` | Specify the CICS region should be managed by CPSM |
| `ENV DFH_CICSPLEX=` | Specify the name of the CICSplex |
| `COPY bundles bundles` | Create an empty bundles directory in the provisioned file system to contain CICS bundles |

For example, to create the z/OS PT image source directory and configuration file, and build it ready for developers to provision a CICS region:

```console
export ZOSPTIMAGE=~/zosptimages/cics_55_nodejs

mkdir -p $ZOSPTIMAGE/bundles

cat > $ZOSPTIMAGE/zosptfile << EOF
FROM cics_55
ENV DFH_NODE_HOME=/usr/lpp/IBM/cnj/IBM/node-latest-os390-s390x
ENV DFH_CICS_TYPE=MAS
ENV DFH_CICSPLEX=ZOSPTINT
COPY bundles bundles
EOF

cat $ZOSPTIMAGE/zosptfile | iconv -f IBM1047 -t UTF8 > $ZOSPTIMAGE/zosptfile

chtag -tc UTF-8 $ZOSPTIMAGE/zosptfile

zospt build $ZOSPTIMAGE -t cics_55_nodejs
```

### Provision your CICS region and deploy a Node.js application

1. Update your user `.profile` file on z/OS.

   Update your path to include the directory containing the `zospt` command, and add the following environment variables as described in [Configuring z/OS Provisioning Toolkit](https://www.ibm.com/support/knowledgecenter/en/SSXH44E_1.0.0/zospt/zospt-configuring.html):

   ```properties
   export zospt_domain=
   export zospt_tenant=
   export zospt_pw=
   ```

2. Provision your CICS region.

   Use the `--name` option to specify a name for the container that is easy to remember for use in later commands. This may take several minutes.

   ```console
   zowe zos-uss issue ssh "zospt run cics_55_nodejs --name my_cics_region"
   ```

3. Display the CICS region information.

   ```console
   zowe zos-uss issue ssh "zospt inspect my_cics_region"
   ```

   The output will include values for the CICS region application ID, and the z/OS directory within which your CICS bundles can be uploaded. For example:

   ```json
    "DFH_REGION_APPLID": "CICPY000",
    "DFH_REGION_ZFS_DIRECTORY": "/u/cicprov/mnt/CICPY000",
    ```

4. Update your Zowe cics-deploy profile with the CICS region application ID and z/OS directory. For example:

   ```console
   zowe profiles update cics-deploy cics --scope CICPY000 --bundle-directory /u/cicprov/mnt/CICPY000/bundles
   ```

4. Deploy your Node.js application to the CICS region using the steps in [Deploying your first app](cdp-Deploying-your-first-app). For example:

   ```console
   zowe cics-deploy push bundle --name Express --overwrite
   ```

### Stop your CICS region

The CICS region can be stopped if you are not going to be using it for a while using command:

```console
zowe zos-uss issue ssh "zospt stop my_cics_region"
```

### Start your CICS region

The CICS region can be started if it was previous stopped, or the z/OS system was restarted using command:

```console
zowe zos-uss issue ssh "zospt start my_cics_region"
```

### Deprovision your CICS region

The CICS region can be stopped and removed using the following command. This will remove the z/OS directory used to upload your CICS bundles:

```console
zowe zos-uss issue ssh "zospt stop my_cics_region"
zowe zos-uss issue ssh "zospt rm my_cics_region"
```