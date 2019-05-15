---
title: Zowe CLI CICS deploy plugin
tags: [getting_started]
keywords:
summary: "The Zowe command line interface (CLI) provides a simple and streamlined way to interact with IBM z/OS. The cics-deploy plugin extends the Zowe CLI to deploy Node.js applications developed on a workstation to IBM CICS Transaction Server for z/OS (CICS)."
sidebar: cdp_sidebar
permalink: index.html
folder: cdp
---

It provides a Node.js CICS deployment workflow for developers and CI/CD automation pipelines similar to that experienced when deploying Node.js applications to the cloud.

Before you start, and especially if you are not familiar with the world of z/OS, Zowe and CICS, it's a good idea to read about some of the key concepts, which include [Zowe](cdp-zowe-and-cli), [CICS bundles](cdp-cics-bundles) and [Zowe CLI profiles](cdp-zowe-profiles).

When everything has been [installed](cdp-installation) and [set up](cdp-Create-Zowe-CLI-profiles), you can deploy a Node.js application from your workstation to CICS in two steps:

1. Use the [zowe cics-deploy generate bundle]({{ site.path_to_generated_docs }}CLIReadme.md#module-generate) command to generate some metadata and artifacts that help the target CICS system understand your application.
1. Use the [zowe cics-deploy push bundle]({{ site.path_to_generated_docs }}CLIReadme.md#module-push) command to push the generated bundle to one or more regions within a CICSplex, enabling and deploying it as an executing application. 

Should you need it, and if you understand a little more about CICS, further commands like [zowe cics-deploy deploy bundle]({{ site.path_to_generated_docs }}CLIReadme.md#module-deploy) and [zowe cics-deploy undeploy bundle]({{ site.path_to_generated_docs }}CLIReadme.md#module-undeploy) offer you finer-grained control of the process - for example, to enable you to install the a bundle in subsets of CICS regions in a cluster in such a way as to maintain an application's availability for clients.

When you're ready to learn more, our tutorial on [Deploying your first app](cdp-Deploying-your-first-app) dives into a step-by-step walkthrough of a basic deployment process. Other tutorials are available from the side menu.

If you hit any speed bumps on your journey, check out our [Troubleshooting](cdp-Troubleshooting-General) page.