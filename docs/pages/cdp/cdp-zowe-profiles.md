---
title: Zowe CLI profiles
tags: [getting_started, concepts]
keywords: command line, zowe cli
summary: "Zowe CLI profiles let you store configuration details so you don't have to repeat them every time you use a Zowe CLI command."
sidebar: cdp_sidebar
permalink: cdp-zowe-profiles.html
folder: cdp
toc: true
---

### Using the command-line
The command-line is a conventional way to run and/or compose programs, especially if you come from a Linux or macOS background. Despite its usefulness, it can become tedious when large numbers of command-line arguments have to be entered and re-entered every time a program is executed. Zowe CLI profiles eliminate a lot of this tedium by collecting sequences of rarely-changing command-line arguments into just one argument - the name of a Zowe CLI profile - which is used as proxy whenever the original longer sequence needs to be subsequently invoked. 

{% include note.html content="Be aware that the broader Zowe and z/OS technology stack includes some other entities commonly referred to as <i>profiles</i> that are entirely different to the profiles discussed here, which are, specifically, Zowe CLI profiles. For example, there is a ```.profile``` file in most z/OS Unix System Services (USS) user home directories - the remote z/OS shell profile - that contains session-initializing environmental configuration. A lack of precision, especially in conversation, can be confusing." %}

Instead of having to type, say, six command-line arguments that describe a collection of z/OS connection details, you only need to type one, the name and type of the profile that stores the full set. 

### Examples of Zowe CLI profiles in action
As an example, a Zowe CLI z/OSMF profile aggregates the configuration details required to establish CLI z/OSMF sessions with the mainframe - such sessions are necessary to submit the batch jobs that deploy and undeploy [CICS bundles](cdp-cics-bundles.md). You can create a Zowe CLI z/OSMF profile with a command like:

```
zowe profiles create zosmf-profile myprofile --host zos124 --port 1443 --user ibmuser --password myp4ss --reject-unauthorized false
```
This creates a Zowe CLI z/OSMF profile called *myprofile* that connects to port *1443* (or, in your situation, such port as your own z/OSMF server is known to run on) on host *zos124* using the credentials *ibmuser* and *myp4ss* and allowing self-signed certificates. That's six command-line arguments stored as a collection under the single profile called *myprofile*.

Now you can issue further Zowe commands that reference the profile you created earlier. For example, to check the health of your connectivity to z/OSMF you might enter:

```
zowe zosmf check status --zosmf-profile myprofile
```
Zowe CLI profiles really come into their own when you decide to deploy your Node.js application(s) using `push bundle`. Using three profiles, you might issue:
```
zowe push bundle --name EXAMPLE --target-directory /u/example/bundles --zosmf-profile testplex --cics-deploy-profile devcics --ssh-profile ssh
```
This is a much more economical and concise command-line than if were it necessary to enumerate all of the individual arguments from all of the profiles.

As suggested above, to deploy a Node.js application from your workstation to one or more CICS regions, you will need to set up a minimum of three Zowe CLI profiles (optionally more if you wish to, say, deploy to multiple hosts) - you can read how to do it in detail [here](cdp-Creating-Zowe-CLI-profiles).

{% include tip.html content="For each profile type, the first profile you create becomes the default for that type. In many cases, you don't even have to type in the name of a specific profile if you know that the default profile will serve your needs." %}

Ultimately, you are not *required* to use Zowe CLI profiles - you can specify all of the required command-line arguments explicitly - but they reduce the burden of typing when you are issuing commands that require many arguments.

### Where are Zowe CLI profiles stored?
When you create a Zowe CLI profile, a representation is written to an operating-system-dependent text file on your local workstation.
<ul id="profileTabs" class="nav nav-tabs">
    <li class="active"><a href="#windows" data-toggle="tab">Windows</a></li>
    <li><a href="#linux" data-toggle="tab">Linux</a></li>
    <li><a href="#macos" data-toggle="tab">macOS</a></li>
</ul>
  <div class="tab-content">
<div role="tabpanel" class="tab-pane active" id="windows">
<p>On Windows, Zowe CLI profiles are written by default to <tt>%userprofile%\.zowe\profiles</tt></p>
</div>

<div role="tabpanel" class="tab-pane" id="linux">
    <p>On Linux, Zowe CLI profiles are written by default to <tt>~/.zowe/profiles</tt></p></div>

<div role="tabpanel" class="tab-pane" id="macos">
    <p>On macOS, Zowe CLI profiles are written by default to <tt>~/.zowe/profiles</tt></p>
</div>
</div>
When you become familiar with their simple syntax, you can hand-edit these files, instead of regenerating the corresponding profiles.
