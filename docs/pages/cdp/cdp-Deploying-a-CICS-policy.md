---
title: Deploying a CICS policy
tags: [tutorial]
keywords:
summary: "The following steps take you through deploying a sample CICS bundle containing a policy."
sidebar: cdp_sidebar
permalink: cdp-Deploying-a-CICS-policy.html
folder: cdp
toc: true
---

[CICS policies](https://www.ibm.com/support/knowledgecenter/en/SSGMCP_5.5.0/fundamentals/policies/policies.html) are used to monitor the state of the CICS region, and the resources and workload in it. A policy consists of rules that define the conditions that are required to be met for the rule to trigger, and the action to take when the conditions are met.

This tutorial shows how to download a sample CICS policy and deploy it using the CICS deploy plug-in. The policy rule condition is when the number of active tasks in your CICS regions goes above 90% of your MXT value, and action is to issue message DFHMP3009 to the CICS region JES job log. CICS policies and this sample are described in article [Using CICS policy system rules to monitor system health](https://developer.ibm.com/cics/2017/07/04/using-cics-policy-system-rules-monitor-system-health/).

### Procedure

1. Install the Zowe CLI and plug-ins by following the steps in [Installing](cdp-Installing).

2. Create Zowe CLI profiles by following the steps in [Creating Zowe CLI profiles](cdp-Creating-Zowe-CLI-profiles).

3. Clone the [cics-policy-samples](https://github.com/cicsdev/cics-policy-samples) repository from GitHub.

   ```text
   git clone https://github.com/cicsdev/cics-policy-samples.git

   cd cics-policy-samples/bundles/CICSDEV_system_rule
   ```

4. Deploy the CICS bundle into CICS.

   ```text
   zowe cics-deploy push bundle --name Policy --overwrite
   ```

   A progress bar is shown with status messages as the CICS bundle is deployed. This can take a few minutes. The command will summarize the deployment, for example:

   <pre class="messageText">
   WARNING: No .zosAttributes file found in the bundle directory, default values will be applied.
   Regions in scope 'CICPY000' of CICSplex 'ZOSPTINT':
      Applid: CICPY000   jobname: CICPY000   jobid: STC47025   sysname: MV2C
   PUSH operation completed</pre>

   The warning can be ignored as the default values result in the files being uploaded in text that is suitable for this bundle.

   The CICS BUNDLE resource named `Policy` is defined, installed, and enabled in CICS. If the BUNDLE `Policy` was already defined or installed in CICS, it is undeployed first. As the BUNDLE is enabled, the policy is also enabled. If there are errors, retry with the `--verbose` option for more detailed output, or refer to [Troubleshooting](cdp-Troubleshooting-General).

### Results

The CICS policy is enabled in the CICS region. When the policy rule is triggered, CICS will write message DFHMP3009 to the CICS region JES job log. For details on how to view this log see [Log and trace files](cdp-Troubleshooting-General).

To get started with defining your own CICS policy:
* [Download and start the CICS Explorer](https://www.ibm.com/support/knowledgecenter/en/SSSQ3W_5.5.0/com.ibm.cics.core.help/topics/concepts/install_planning_client.html).
* Create a CICS bundle project using the procedure [Creating a CICS bundle project](https://www.ibm.com/support/knowledgecenter/SSSQ3W_5.5.0/com.ibm.cics.core.help/topics/tasks/create_bundle.html).
* Create a policy using the procedure [To create a policy in a CICS bundle project](https://www.ibm.com/support/knowledgecenter/SSSQ3W_5.5.0/com.ibm.cics.core.help/topics/tasks/task_create_policy.html).
