---
title: Tutorials overview
tags: [tutorial]
keywords:
summary: "Summary of the tutorials."
sidebar: cdp_sidebar
permalink: cdp-Tutorials-overview.html
folder: cdp
toc: true
---

These tutorials will help you setup a CICS region and try the Zowe CLI CICS deploy plug-in to deploy applications.

Firstly, you will need a CICS region. The z/OS Provisioning Toolkit enables you to provision and deprovision CICS regions yourself. Work with your CICS and z/OS administrators to setup a z/OS PT image, then provision your CICS region:

* [Preparing a z/OS Provisioning Toolkit image](cdp-Preparing-a-zOS-PT-image) - steps to prepare a z/OS Provisioning Toolkit image for CICS, and optionally include an application in the image.

* [Provisioning a CICS region](cdp-Provisioning-a-CICS-region) - steps to provision a CICS region from a z/OS Provisioning Toolkit image. You can then deploy and test applications using the CICS region.

Next deploy an application:

* [Deploying your first Node.js app](cdp-Deploying-your-first-nodejs-app) - deploy your first Node.js application to CICS using the Express Application Generator.

* [Deploying a CICS policy](cdp-Deploying-a-CICS-policy) - deploy a sample CICS bundle containing a policy.

Finally if you need more precise control of the deployment steps, for example if you are writing a CI-CD pipeline:

* [Deploying using individual actions](cdp-Deploying-using-individual-actions) - the individual actions to deploy a Node.js application in CICS.
