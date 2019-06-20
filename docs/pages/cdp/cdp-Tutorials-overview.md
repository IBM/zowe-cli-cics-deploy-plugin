---
title: Tutorials overview
tags: [tutorial]
keywords:
summary: "Summary of the tutorials to provision a CICS region and deploy applications to it."
sidebar: cdp_sidebar
permalink: cdp-Tutorials-overview.html
folder: cdp
toc: true
---

Firstly, you will need a CICS region:

* The z/OS Provisioning Toolkit enables you to provision CICS regions yourself:

  * [Preparing a z/OS Provisioning Toolkit image](cdp-Preparing-a-zOS-PT-image) - prepare a z/OS Provisioning Toolkit image for CICS, and optionally include an application in the image.

  * [Provisioning a CICS region](cdp-Provisioning-a-CICS-region) - provision a CICS region from a z/OS Provisioning Toolkit image.

* Alternatively, work with your CICS and z/OS system administrators [Creating Zowe CLI profiles](cdp-Creating-Zowe-CLI-profiles) based on the z/OS system and CICS region you can use.

Next, deploy a CICS bundle containing an application to the CICS region:

* [Deploying a Node.js application](cdp-Deploying-a-Nodejs-application) - create a Node.js application using the Express Application Generator, package it into a CICS bundle, and deploy it.

* [Deploying a CICS policy](cdp-Deploying-a-CICS-policy) - download a sample policy packaged in a CICS bundle, and deploy it.

If you need more precise control of the deployment steps, for example if you are writing a CI-CD pipeline:

* [Deploying using individual actions](cdp-Deploying-using-individual-actions) - steps that provide greater control when deploying a CICS bundle.
