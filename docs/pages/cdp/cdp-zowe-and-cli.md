---
title: Zowe, the Zowe CLI and the cics-deploy plug-in
tags: [getting_started, concepts]
keywords:
summary: "Zowe is an open source framework that bridges the divide between workstation and mainframe computing."
sidebar: cdp_sidebar
permalink: cdp-zowe-and-cli.html
folder: cdp
---

### Zowe
Zowe consists of several components:

* The core framework
* The API mediation layer
* The Zowe CLI

The core framework and the API mediation layer are software components that need to be installed as part of the Zowe runtime on z/OS. 

You can read much more about the wider Zowe initiative <a href="https://zowe.github.io/docs-site/latest/" target="_blank">here</a>.

### Zowe CLI
The Zowe CLI is installed on and runs on a local workstation, and does not need to be installed on z/OS. It does not depend on you having installed any other Zowe components, either locally or on z/OS. It *does* need a few familiar [facilities](cdp-Requirements.html) to be set up on the mainframe first.

It allows developers to interact with the mainframe via a command-line interface, which may more approachable than alternative and proprietary front-end applications. 

The Zowe CLI is extended by creating and installing plug-ins.

### Zowe CLI CICS deploy plug-in
The Zowe CLI CICS deploy plug-in extends the Zowe CLI to offer a command-line mechanism for Node.js developers to deploy workstation-developed applications into a running CICS Transaction Server for z/OS region on a remote mainframe. It is the quickest way to get a Node.js application from your workstation into a running CICS region without any special CICS knowledge.