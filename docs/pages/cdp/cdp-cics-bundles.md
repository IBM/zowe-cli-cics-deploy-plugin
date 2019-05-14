---
title: CICS bundles
tags: [getting_started, concepts]
keywords:
summary: "An overview of CICS bundles"
sidebar: cdp_sidebar
permalink: cdp-cics-bundles.html
folder: cdp
---
# CICS Bundles

## What is a CICS bundle?

In CICS, Node.js applications are deployed as a bundle along with their resources.

The CICS BUNDLE resource represents the Node.js application to CICS and you can use it to manage the lifecycle of the application.

When the bundle is deployed in CICS, the associated Node.js application runs within the enclave. When the bundle is undeployed, the associated Node.js application is stopped and the bundle is discarded.

## What goes in a bundle?

{% include image.html file="bundlecontents.png" alt="Contents of a CICS bundle" caption="Contents of a CICS bundle" %}

When you generate a bundle, the following files are created from package.json:  

**cics.xml** contains a manifest of the contents of the bundle and is found in the /META-INF folder. It describes which resources to create in the CICS region and the location of the supporting artifacts, which prerequisites are required for the CICS bundle to run successfully, and any services that the CICS bundle can offer to other bundles. For more information on bundle manifests, see [Manifest contents for a CICS bundle](https://www.ibm.com/support/knowledgecenter/SSGMCP_5.5.0/configuring/resources/manifestdefinitions.html).

***nodejsapp*.nodejsapp** contains information about the Node.js application and references the JavaScript code to start the application. 

***nodejsapp*.profile** contains configuration information for the runtime environment, including the PORT environment variable.


