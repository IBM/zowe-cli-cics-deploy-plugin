---
title: Precautionary checks
tags: [troubleshooting]
keywords: 
summary: "You can sometimes fix problems quickly by eliminating the following possible causes instead of individually tracing their origins through several log files."
sidebar: cdp_sidebar
permalink: cdp-Precautionary-Checks.html
folder: cdp
---

* CICS must be authorised to read the bundle directory `META-INF`.
* The port specified by the `--port` argument of the `cics-deploy generate bundle` command *must* be free on the z/OS machine before you attempt to deploy an application. 
* If you set a `WORK_DIR` in `nodejsapps/<your application name>.profile`, it must be *writeable* by CICS.