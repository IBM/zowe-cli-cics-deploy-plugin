---
title: Zowe CLI CICS deploy plugin
tags: [getting_started]
keywords:
summary: "The Zowe command line interface (CLI) provides a simple and streamlined way to interact with IBM z/OS. The cics-deploy plugin extends the Zowe CLI to deploy applications developed on a workstation to IBM CICS Transaction Server for z/OS (CICS)."
sidebar: cdp_sidebar
permalink: index.html
folder: cdp
---

It aims to provide an experience for developers and CI/CD automation pipelines similar to deploying to a cloud platform when deploying to CICS.

The plug-in provides the following commands:
* [zowe cics-deploy generate bundle]({{ site.path_to_generated_docs }}CLIReadme.md#module-generate) - Generate a CICS bundle in the working directory. Typically used by developers to package their existing application as a CICS bundle.

* [zowe cics-deploy push bundle]({{ site.path_to_generated_docs }}CLIReadme.md#module-push) - Firstly undeploy the previous version of the CICS bundle from CICS incase it had been previously deployed. Then copy the bundle from the working directory to a z/OS directory, and run npm to install dependencies for each Node.js application in the bundle. Finally deploy the bundle to one or more CICS regions within a CICSplex. Typically used by developers to deploy applications in CICS ready for testing.

* [zowe cics-deploy deploy bundle]({{ site.path_to_generated_docs }}CLIReadme.md#module-deploy) - Deploy a CICS bundle that is in a z/OS directory to one more CICS regions within a CICSplex. The DFHDPLOY utility is used to define the BUNDLE resource in a CICS system definition (CSD) file or CPSM Business Application Services (BAS) file, then install and enable the resource in the target CICS regions. Typically used by developers and CI-CD pipelines that require more precise control when deploying applications to CICS, for example to install the bundle in subsets of CICS regions in a cluster in a manner that maintains the availability of the application for clients.

* [zowe cics-deploy undeploy bundle]({{ site.path_to_generated_docs }}CLIReadme.md#module-undeploy) - Undeploy a CICS bundle from one or more CICS regions within a CICSplex. The DFHDPLOY utility is used to disable then discard the BUNDLE resource from the target CICS regions, then the resource is deleted from a CICS CSD or CPSM BAS file. Typically used by developers and CI-CD pipelines that require more precise control when undeploying applications to CICS.