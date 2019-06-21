---
title: Common errors
tags: [troubleshooting]
keywords: 
summary: "Some common errors can occasionally occur when you attempt to deploy a Node.js application using the cics-deploy plug-in."
sidebar: cdp_sidebar
permalink: cdp-Common-errors.html
folder: cdp
---

## Precautionary checks

If you experience errors while using the cics-deploy plug-in, check the following potential causes before investigating further:

* CICS® must be authorized to read the bundle directory `META-INF`.
* The port specified by the `--port` argument of the `cics-deploy generate bundle` command *must* be free on z/OS® before you attempt to deploy an application.
* If you set a `WORK_DIR` in the CICS® Node.js application profile, such as `nodejsapps/<your application name>.profile`, it must be *writeable* by CICS®.

## Deployment errors

{% include note.html content="For further troubleshooting steps, see [Troubleshooting Node.js applications](https://www.ibm.com/support/knowledgecenter/en/SSGMCP_5.5.0/troubleshooting/node/node-troubleshooting.html)." %}

{% include important.html content="To definitively diagnose a problem based on the suggested symptoms, you might need to refer to one or more [system logs and traces](cdp-Log-and-trace-files) particularly the STDERR Node.js log and the file assigned the MSGUSR DD name in the relevant CICS® job. Depending on your familiarity with z/OS® and CICS®, and your system privileges, you may also need to consult a CICS® systems administrator to get to the bottom of certain problems." %}

### Application incorrectly deploys in a DISABLED state

*Possible cause:* The port requested by the application is already in use.

*Suggested action:* Choose a new port number after double-checking that it is not in use. Redeploy the application using the new value for the port.

{% include note.html content="An application in a `DISABLED` state does not necessarily indicate an error condition. The `cics-deploy deploy`, `cics-deploy push` and `cics-deploy undeploy` commands allow you to specify a `--target-state` option which you may deliberately choose to set to `DISABLED`." %}

### When deploying to multiple regions, the application fails to enable in the second and subsequent regions
*Possible cause:* The application has deployed successfully in the first region, but subsequent regions see the requested port as in use, and cannot enable the application.

*Suggested action:* Confirm the error by searching for `Error: listen EADDRINUSE :::30701` in STDERR. Contact a CICS systems administrator to set up port sharing for the affected port.

### Command error: DFHDPLOY stopped processing due to an error

*Possible causes:*
* The `--scope` and/or `--cicsplex` settings for the current deploy profile are wrong, and don't correctly identify a current CICS® system, CICS® System Group and/or a correct CICSPlex® respectively.
* The CMAS for the current CICSPlex® is inactive.
* CPSM is not functioning correctly.

*Representative output:*
<pre class="messageText">
16:22:50.058844 :  DFHDPLOY CICS TS APPLICATION DEPLOYMENT  2019/04/10 4:22pm
16:22:50.059562 :  RELEASE: HCI7300.   SERVICE LEVEL: HCI7300.
16:22:50.060903 :  *
16:22:50.060910 :  SET CICSPLEX(CAPLE);
16:22:50.062721 :  DFHRL2057S DFHDPLOY is unable to connect to CICSPLEX(CAPLE).
16:22:50.065729 :  DFHRL2055I Errors have occurred, processing terminated.
</pre>

*Suggested actions:*

* Confirm that the `--scope` and `--cicsplex` settings are correct.
* Ask your CICS® Systems Programmer to check that the CMAS for the current CICSPlex® is alive and that CPSM is working properly.

### Command error: ... validation of - -cicshlq dataset failed: z/OSMF REST API Error

*Possible cause:* The profile setting for `--cicshlq` is incorrect.

*Representative output:*
<pre class="messageText">
A failure occurred during CICS® bundle deployment.
Reason = Validation of --cicshlq dataset failed: z/OSMF REST API Error:
Rest API failure with HTTP(S) status 404
category: 4
rc:       8
reason:   0
message:  LMINIT error
details:
  - ISRZ002 Data set not cataloged - 'ANT.CICS.TS.DEV.INTEGRAT.SDFHLOAD' was not found in catalog.
</pre>

*Suggested action:* 
Check that your `--cicshlq` profile setting matches the value configured for CICS® high-level qualifiers in your CICS region. 

### BUNDLE ... cannot be deployed (1)

*Possible cause:* CICS® does not have permission to read the bundle directory.

*Representative output:*
<pre class="messageText">
11:46:15.916293 : DFHRL2300E BUNDLE(CICSJS02) cannot be deployed. The reason for the failure could not be determined.
11:46:15.922147 : DFHRL2055I Errors have occurred, processing terminated.
11:46:15.927066 : DFHRL2014I Disconnecting from CICSPLEX(CAPLEX).
</pre>

*Suggested action:* 
Check the MSGUSR file for more specific diagnostics and if relevant, change the permissions on the offending directory.

<pre class="messageText">
DFHRL0106 E 04/24/2019 11:46:13 CALMAS1 COIE The CICS resource lifecycle manager failed to create the BUNDLE resource CICSJS02 because CICS is not authorized to read the manifest /u/&lt;username>/CICSJSON_1.0.0/META-INF/cics.xml in the root directory of the bundle.
DFHRL0110 E 04/24/2019 11:46:13 CALMAS1 COIE The CICS resource lifecycle manager has failed to create the BUNDLE resource CICSJS02.
</pre>

### BUNDLE ... cannot be deployed (2)

*Possible cause:* The `cics.xml` file is malformed.

*Representative output:*
<pre class="messageText">
15:56:17.411714 :  DFHRL2300E BUNDLE(CICSJS02) cannot be deployed. The reason for the failure could not be determined.
15:56:17.419308 :  DFHRL2055I Errors have occurred, processing terminated.
15:56:17.424650 :  DFHRL2014I Disconnecting from CICSPLEX(CAPLEX).
...
DFHRL0107 I 05/17/2019 15:56:15 CALMAS1 CICSUSER The CICS resource lifecycle manager has started to create the BUNDLE resource
           CICSJS02.
DFHPI1007 05/17/2019 15:56:15 CALMAS1 COIE 00672 XML to data transformation failed because of incorrect input
           (MISSING_CLOSE_TAG_CHAR manifest) for BUNDLE CICSJS02.
DFHRL0113 E 05/17/2019 15:56:15 CALMAS1 COIE The CICS resource lifecycle manager failed to create the BUNDLE resource CICSJS02
           because CICS failed to parse the manifest /u/&lt;your user id>/pushtest2/CICSJSON_1.0.0/META-INF/cics.xml specified in the bundle   
           root directory. The manifest is not valid.
</pre>

*Suggested action:* 
Check that your `cics.xml` file is well-formed.

## General errors

### Syntax error: Invalid value length for option

*Possible cause:* The length of the option you provided in a command was either too long or two short.

*Representative output:*
<pre class="messageText">
Syntax Error:
Invalid value length for option:
--csdgroup

You specified a string of length 9:
NODETESTS

The length must be between 1 and 8 (inclusive)
</pre>

*Suggested action:*
Review the error output text and reissue the original command having corrected the name of the option so that its length falls within acceptable limits.
