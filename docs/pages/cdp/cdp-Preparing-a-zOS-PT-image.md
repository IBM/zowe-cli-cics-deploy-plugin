---
title: Preparing a z/OS PT image
tags: [tutorial]
keywords:
summary: "The following steps take you through preparing a z/OS Provisioning Toolkit image for CICS, and optionally including an application in the image."
sidebar: cdp_sidebar
permalink: cdp-Preparing-a-zOS-PT-image.html
folder: cdp
toc: true
---

The [z/OS Provisioning Toolkit](https://developer.ibm.com/mainframe/products/zospt/) (z/OS PT) provides a command line utility and z/OSMF workflows to provision CICS regions and other development environments on z/OS. This tutorial requires z/OS PT version 1.1.5 or above to be installed on z/OS, and your user `.profile` file on z/OS configured to run z/OS PT.

z/OS PT uses configuration and files in an *image* as input to z/OSMF workflows to provision a CICS region. The image is typically prepared by a CICS system administrator. This tutorial provides two alternative approaches to preparing a z/OS PT image:

* [Prepare a z/OS PT image for CICS](#prepare-a-zos-pt-image-for-cics) - no application is included in the image, and the `zosptfile` is kept separate to the application source.
* [Prepare a z/OS PT image for CICS including an application](#prepare-a-zos-pt-image-for-cics-including-an-application) - the application is provisioned together with the CICS region, and the `zosptfile` is kept with the application source.

### Prepare a z/OS PT image for CICS

Use these steps to prepare a z/OS PT image for a CICS region. No application is included in the image. The CICS region is connected to a CICSplex environment, and has NODE_HOME set.

#### Procedure

Run the following commands on your workstation.

1. Install the Zowe CLI and plugins by following the steps in [Installing](cdp-Installing).

2. Create Zowe CLI profiles by following the steps in [Creating Zowe CLI profiles](cdp-Creating-Zowe-CLI-profiles).

3. Setup environment variables for the name of your image, and paths for the image source on the workstation and z/OS.

   Update these value for to be suitable for your workstation and z/OS environments.

   ```text
   export IMAGE="cics_55_nodejs"
   export IMAGE_DIR="$HOME/zosptimages/$IMAGE"
   export IMAGE_DIR_ZOS="/zosptimages/$IMAGE"
   ```

4. Create directories for the z/OS PT image source and bundles sub-directory.

   ```text
   mkdir -p "$IMAGE_DIR/bundles"
   ```

5. Create a `zosptfile` file.

   ```text
   cat <<EOF >> $IMAGE_DIR/zosptfile
   FROM cics_55
   ENV DFH_CICS_TYPE=MAS
   ENV DFH_CICSPLEX=ZOSPTINT
   ENV DFH_NODE_HOME=/usr/lpp/IBM/cnj/IBM/node-latest-os390-s390x
   COPY bundles bundles
   EOF
   ```

   Update the values for `DFH_CICSPLEX` and `DFH_NODE_HOME` to be suitable for your z/OS environment. Further customization can be made by adding properties as described in [Configuration properties for CICS images](https://www.ibm.com/support/knowledgecenter/en/SSXH44E_1.0.0/zospt/cics/zospt-cics-properties.html).

   | zosptfile&nbsp;entry&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Usage |
   | --- | -- |
   | `FROM cics_55` | Provision a CICS TS V5.5 region that is the minimum release that supports Node.js applications. |
   | `ENV DFH_CICS_TYPE=MAS` | CICS region should be managed by CPSM to enable the DFHDPLOY utility to deploy applications. |
   | `ENV DFH_CICSPLEX=` | Name of the CICSplex this region is to join. |
   | `ENV DFH_NODE_HOME=` | Installation directory for Node.js runtime provided by IBM SDK for Node.js - z/OS. |
   | `COPY bundles bundles` | Create an empty `bundles` directory in the provisioned file system to contain CICS bundles. |

6. Upload the image source to z/OS.

   ```text
   zowe zos-uss issue ssh "rm -Rv *" --cwd "$IMAGE_DIR_ZOS"
   zowe zos-uss issue ssh "mkdir -p $IMAGE_DIR_ZOS"
   zowe zos-files upload dir-to-uss "$IMAGE_DIR" "$IMAGE_DIR_ZOS" --recursive
   ```

7. Build the image source on z/OS.

   ```text
   zowe zos-uss issue ssh "zospt build -t $IMAGE ." --cwd "$IMAGE_DIR_ZOS"
   ```

#### Results

The image is now ready for developers to provision CICS regions and deploy their Node.js applications using [Deploying your first Node.js app](cdp-Deploying-your-first-nodejs-app). The image source can be stored with other images and shared using a source code management system.

### Prepare a z/OS PT image for CICS including an application

Use these steps to prepare a z/OS PT image for a CICS region that includes a Node.js application, such that the region and application are provisioned / started / stopped / de-provisioned together. The CICS region is connected to a CICSplex environment, and has NODE_HOME set.

#### Procedure

Run the following commands on your workstation.

1. Install Zowe CLI by following the steps in [Installing](cdp-Installing).

2. Create Zowe CLI profiles for at least z/OSMF and SSH following the steps in [Creating Zowe CLI profiles](cdp-Creating-Zowe-CLI-profiles).

3. Prepare your environment and Node.js application by following steps 1 thru 4 in tutorial [Deploying your first Node.js app](cdp-Deploying-your-first-nodejs-app).

4. Setup environment variables for the name of your image, and paths for the image source on the workstation and z/OS.

   Update these value for to be suitable for your workstation and z/OS environments.

   ```text
   export APP_DIR=$HOME/myExpressApp
   export IMAGE="cics_55_nodejs_app"
   export IMAGE_DIR_ZOS="/zosptimages/$IMAGE"
   export IMAGE_APP_DIR_ZOS="bundles/myexpressapp_1.0.0"
   ```

5. Create a file `zosptfile` in the root directory of the application.

   ```text
   cat <<EOF >> zosptfile
   FROM cics_55
   ENV DFH_CICS_TYPE=MAS
   ENV DFH_CICSPLEX=ZOSPTINT
   ENV DFH_NODE_HOME=/usr/lpp/IBM/cnj/IBM/node-latest-os390-s390x
   COPY . $APP_DIR_ZOS
   EOF
   ```

   The `COPY` directive will copy all the files from the applications root directory a sub-directory of the z/FS file system provisioned with the CICS region. Update the value of the sub-directory to suit the application.

   Update the values for `DFH_CICSPLEX` and `DFH_NODE_HOME` to be suitable for your z/OS environment, and add additional properties as required. Further customization can be made by adding properties as described in [Configuration properties for CICS images](https://www.ibm.com/support/knowledgecenter/en/SSXH44E_1.0.0/zospt/cics/zospt-cics-properties.html).

6. Upload the z/OS PT image source and application to z/OS.

   ```text
   zowe zos-uss issue ssh "rm -Rv *" --cwd "$IMAGE_DIR_ZOS"
   zowe zos-uss issue ssh "mkdir -p $IMAGE_DIR_ZOS"
   zowe zos-files upload dir-to-uss "$APP_DIR" "$IMAGE_DIR_ZOS" --recursive
   ```

7. Resolve the Node.js application dependencies on z/OS.

   ```text
   zowe zos-uss issue ssh "npm install" --cwd "$IMAGE_DIR_ZOS/$IMAGE_APP_DIR_ZOS"
   ```

8. Build the z/OS PT image.

   ```text
   zowe zos-uss issue ssh "zospt build -t $IMAGE ." --cwd "$IMAGE_DIR_ZOS"
   ```

#### Results

The image is now ready for developers to use to provision their own CICS region. The Node.js application will be provisioned and started together the CICS region. The image source can be stored and shared with the application using a source code management system. When your application is updated, you will need to prepare a new image by repeating steps 3, 4 and 5.

For further details on including applications in z/OS images see [Including a CICS bundle in your image](https://www.ibm.com/support/knowledgecenter/en/SSXH44E_1.0.0/zospt/cics/zospt-cics-bundles.html).
