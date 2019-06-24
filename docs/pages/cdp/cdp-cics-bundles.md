---
title: CICS bundles
tags: [getting_started, concepts]
keywords:
summary: "An overview of CICS® bundles and their contents"
sidebar: cdp_sidebar
permalink: cdp-CICS-bundles.html
folder: cdp
toc: false
---
In CICS, Node.js applications are deployed as a CICS bundle.

A CICS bundle is a directory that contains artifacts and a manifest that describes the bundle and its dependencies. CICS bundles allow you to group and manage resources relating to your Node.js application.

The CICS BUNDLE resource represents the Node.js application to CICS and you can use it to manage the lifecycle of the application.

When the bundle is deployed in CICS, the Node.js runtime starts and the associated application runs. When the bundle is undeployed, the Node.js application and runtime are stopped and the bundle is discarded.

## Contents of a CICS bundle

{% include image.html file="CICSbundlecontents.png" alt="Contents of a CICS bundle with the myExpressApp Node.js application" caption="Contents of a CICS bundle with the myExpressApp Node.js application" %}

When you generate a bundle, the following files are created from package.json:  

**cics.xml** contains a manifest of the contents of the bundle and is found in the /META-INF folder. It describes which resources to create in the CICS region and the location of the supporting artifacts, which prerequisites are required for the CICS bundle to run successfully, and any services that the CICS bundle can offer to other bundles. For more information on bundle manifests, see [Manifest contents for a CICS bundle](https://www.ibm.com/support/knowledgecenter/SSGMCP_5.5.0/configuring/resources/manifestdefinitions.html).

**myexpressapp.nodejsapp** contains information about the Node.js application and references the JavaScript code to start the application.

**myexpressapp.profile** contains configuration information for the runtime environment, including the PORT environment variable.
