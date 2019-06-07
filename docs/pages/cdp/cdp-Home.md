---
title: Zowe CLI CICS deploy plug-in
tags: [getting_started]
keywords:
summary: "The Zowe command line interface (CLI) provides a simple and streamlined way to interact with IBM z/OS. The cics-deploy plug-in extends the Zowe CLI to deploy applications developed on a workstation to IBM CICS Transaction Server for z/OS (CICS)."
sidebar: cdp_sidebar
permalink: index.html
folder: cdp
---

It provides a CICS deployment workflow for developers and CI/CD automation pipelines similar to that experienced when deploying applications to cloud environments.

Before you start, and especially if you are not familiar with the world of z/OS, Zowe, and CICS, it's a good idea to read about some of the key concepts, which include [Zowe](cdp-zowe-and-cli), [Zowe CLI profiles](cdp-zowe-profiles) and [CICS bundles](cdp-cics-bundles). If you're keen to get going quickly, you can jump right in and follow along with our tutorial on [Deploying your first Node.js app](cdp-Deploying-your-first-nodejs-app).

When everything is [installed](cdp-Installing) and you have [created the Zowe CLI profiles](cdp-Creating-Zowe-CLI-profiles), you can deploy an application from your workstation to CICS in two steps:

1. Use the [zowe cics-deploy generate bundle](cdp-CLIReadMe#generate--g--gen) command to generate some metadata and artifacts that help the target CICS system understand your application.

2. Use the [zowe cics-deploy push bundle](cdp-CLIReadMe#push--p) command to push the generated bundle to one or more regions within a CICSplex, enabling and deploying it as an executing application. 

Should you need it, and if you understand a little more about CICS, further commands like [zowe cics-deploy deploy bundle](cdp-CLIReadMe#deploy--d--dep) and [zowe cics-deploy undeploy bundle](cdp-CLIReadMe#undeploy--u--udep) offer you finer-grained control of the process - for example, to enable you to install a bundle in subsets of CICS regions in a cluster in such a way as to maintain an application's availability for clients.

If you hit any speed bumps on your journey, check out our [Troubleshooting](cdp-Troubleshooting-General) pages.
