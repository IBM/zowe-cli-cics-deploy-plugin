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

Firstly, you will need a CICS region. The z/OS Provisioning Toolkit enables you to provision CICS regions yourself:

* [Preparing a z/OS Provisioning Toolkit image](cdp-Preparing-a-zOS-PT-image) - steps to prepare a z/OS Provisioning Toolkit image for CICS, and optionally include an application in the image.

* [Provisioning a CICS region](cdp-Provisioning-a-CICS-region) - steps to provision a CICS region from a z/OS Provisioning Toolkit image. You can then deploy and test applications using the CICS region.

Next deploy an application:

* [Deploying your first Node.js app](cdp-Deploying-your-first-nodejs-app) - create a Node.js application using the Express Application Generator and deploy it.

* [Deploying a CICS policy](cdp-Deploying-a-CICS-policy) - download a sample CICS bundle containing a policy and deploy it.

Finally if you need more precise control of the deployment steps, for example if you are writing a CI-CD pipeline:

* [Deploying using individual actions](cdp-Deploying-using-individual-actions) - the individual actions to deploy a Node.js application in CICS.
