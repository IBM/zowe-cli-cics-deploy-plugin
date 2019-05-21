---
title: Possible problems and their resolution
tags: [troubleshooting]
keywords:
summary: "This section describes sets of problem symptoms, their possible causes and suggested solutions."
sidebar: cdp_sidebar
permalink: cdp-Troubleshooting-Symptoms.html
folder: cdp
---

{% include important.html content="To definitively diagnose a problem based on the suggested symptoms, you will need to refer to one or more [system logs and traces](cdp-Troubleshooting-General) particularly the STDERR Node.js log and the file assigned the MSGUSR DD name in the relevant CICS DFHDPLOY job. Depending on your familiarity with z/OS and CICS, and your system privileges, you may need to consult a CICS Systems Programmer to get to the bottom of certain problems." %}

## Deployment errors

### Application incorrectly deploys in a DISABLED state
*Possible cause*: The port requested by the application is already in use.

*Suggested action*: Choose a new port number after double-checking that it is not in use. Redeploy the application using the new value for the port.

{% include note.html content="An application in a `DISABLED` state does not necessarily indicate an error condition. The `cics-deploy deploy`, `cics-deploy push` and `cics-deploy undeploy` commands allow you to specify a `--target-state` option which you may deliberately choose to set to `DISABLED`." %}

### Command error: DFHDPLOY stopped processing due to an error
*Possible causes*:
  * The `--scope` and/or `--cicsplex` settings for the current deploy profile are wrong, and don't correctly identify a current CICS system, CICS System Group and/or a correct CICSPlex respectively.

  * The CMAS for the current CICSPlex is inactive.

  * CPSM is not functioning correctly.

*Representative output*:
<pre class="messageText">
16:22:50.058844 :  DFHDPLOY CICS TS APPLICATION DEPLOYMENT  2019/04/10 4:22pm
16:22:50.059562 :  RELEASE: HCI7300.   SERVICE LEVEL: HCI7300.
16:22:50.060903 :  *
16:22:50.060910 :  SET CICSPLEX(CAPLE);
16:22:50.062721 :  DFHRL2057S DFHDPLOY is unable to connect to CICSPLEX(CAPLE).
16:22:50.065729 :  DFHRL2055I Errors have occurred, processing terminated.
</pre>

*Suggested actions*:
  * Confirm that the `--scope` and `--cicsplex` settings are correct.

  * Ask your CICS Systems Programmer to check that the CMAS for the current CICSPlex is alive and that CPSM is working properly.



## General errors

TBC 


