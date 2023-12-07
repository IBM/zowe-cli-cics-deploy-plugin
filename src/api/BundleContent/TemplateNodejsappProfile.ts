/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
* Copyright IBM Corp, 2019
*
*/

"use strict";

export class TemplateNodejsappProfile {
    public static profile: string = "" +
    "#######################################################################\n" +
    "# Node.js application profile: basic_nodejsapp.profile                #\n" +
    "#                                                                     #\n" +
    "# The Node.js application profile is used to configure how CICS       #\n" +
    "# controls the Node.js runtime, provide Node.js command line options, #\n" +
    "# and to set environment variables for use by the application.        #\n" +
    "#                                                                     #\n" +
    "# Lines starting with # are treated as comments and ignored.          #\n" +
    "# Lines ending with \\ are continued on the next line.                 #\n" +
    "#                                                                     #\n" +
    "# See topic \"Node.js profile validation and properties\"               #\n" +
    "# in the Knowledge Center:                                            #\n" +
    "# http://www.ibm.com/support/knowledgecenter/SSGMCP_5.5.0             #\n" +
    "#                                                                     #\n" +
    "#######################################################################\n" +
    "#\n" +
    "#                      Symbol Substitution\n" +
    "#                      -------------------\n" +
    "#\n" +
    "# Symbols are replaced with their value when the profile is read by\n" +
    "# CICS. They are useful to avoid duplicating configuration in the\n" +
    "# profile. Symbols start with & and end with ; characters. Environment\n" +
    "# variables defined in the profile may also be used as symbols.\n" +
    "#\n" +
    "# The following symbols are provided:\n" +
    "#   &APPLID;     => Applid of the CICS region.\n" +
    "#   &BUNDLE;     => Name of the BUNDLE resource.\n" +
    "#   &BUNDLEID;   => Bundle ID.\n" +
    "#   &CONFIGROOT; => Directory of the .nodejsapp CICS bundle part.\n" +
    "#   &DATE;       => Date when the NODEJSAPP resource is enabled\n" +
    "#                   (localtime), formatted as Dyymmdd.\n" +
    "#   &NODEJSAPP;  => Name of the NODEJSAPP resource.\n" +
    "#   &TIME;       => Time when the NODEJSAPP resource is enabled\n" +
    "#                   (localtime), formatted as Thhmmss.\n" +
    "#   &USSCONFIG;  => Value of the USSCONFIG SIT parameter.\n" +
    "#   &USSHOME;    => Value of the USSHOME SIT parameter.\n" +
    "#\n" +
    "# Examples:\n" +
    "# LOG_DIR=&WORK_DIR;/&APPLID;/&BUNDLEID;/&NODEJSAPP;\n" +
    "# LOG_SUCCESS=&LOG_DIR;/success.txt\n" +
    "# LOG_FAILURE=&LOG_DIR;/failure.txt\n" +
    "#\n" +
    "#**********************************************************************\n" +
    "#\n" +
    "#                      Required parameters\n" +
    "#                      -------------------\n" +
    "#\n" +
    "# NODE_HOME specifies the location of IBM SDK for Node.js - z/OS.\n" +
    "#\n" +
    "# NODE_HOME=/usr/lpp/IBM/cnj/IBM/node-v6.14.4-os390-s390x\n" +
    "#\n" +
    "#\n" +
    "# WORK_DIR specifies the root directory in which CICS will create log\n" +
    "# files. The default value is /tmp. A value of . means the home\n" +
    "# directory of the user id running the CICS job.\n" +
    "#\n" +
    "# WORK_DIR=.\n" +
    "#\n" +
    "#**********************************************************************\n" +
    "#\n" +
    "#                      Including files in the profile\n" +
    "#                      ------------------------------\n" +
    "#\n" +
    "# %INCLUDE specifies a file to be included in this profile. The file can\n" +
    "# contain common system-wide configuration that can then be maintained\n" +
    "# separate to the application configuration. Symbols can be used when\n" +
    "# specifying the file to be included.\n" +
    "#\n" +
    "# Examples:\n" +
    "# %INCLUDE=/etc/cicsts/prodplex/nodejs/sdk.profile\n" +
    "# %INCLUDE=&USSCONFIG;/nodejs/sdk.profile\n" +
    "# %INCLUDE=&CONFIGROOT;/debug.profile\n" +
    "#\n" +
    "%INCLUDE=&USSCONFIG;/nodejsprofiles/general.profile\n" +
    "#\n" +
    "#**********************************************************************\n" +
    "#\n" +
    "#                      Optional parameters\n" +
    "#                      -------------------\n" +
    "#\n" +
    "# NODEJSAPP_DISABLE_TIMEOUT specifies the time in milliseconds that\n" +
    "# CICS will wait when attempting to disable a NODEJSAPP. If the process\n" +
    "# has not terminated in this time then CICS will send a SIGKILL signal\n" +
    "# to force the process to end. The default value is 10000 (10 seconds).\n" +
    "#\n" +
    "# Example:\n" +
    "# NODEJSAPP_DISABLE_TIMEOUT=30000\n" +
    "#\n" +
    "#**********************************************************************\n" +
    "#\n" +
    "#                      Command line options\n" +
    "#                      --------------------\n" +
    "#\n" +
    "# Options beginning with a hyphen will be included on the command line\n" +
    "# when CICS starts the Node.js runtime. The command line options\n" +
    "# accepted by Node.js are documented at:\n" +
    "# https://nodejs.org/dist/latest-v6.x/docs/api/cli.html\n" +
    "#\n" +
    "# Example:\n" +
    "# --trace-sync-io\n" +
    "#\n" +
    "#**********************************************************************\n" +
    "#\n" +
    "#              Unix System Services Environment Variables\n" +
    "#              ------------------------------------------\n" +
    "#\n" +
    "# TZ specifies the local time zone in POSIX format in which the Node.js\n" +
    "# application will run.\n" +
    "#\n" +
    "# Example:\n" +
    "# TZ=CET-1CEST,M3.5.0,M10.5.0\n" +
    "#\n" +
    "#**********************************************************************\n" +
    "#\n" +
    "#                      Environment variables\n" +
    "#                      ---------------------\n" +
    "#\n" +
    "# Environment variables will be set before CICS starts the Node.js\n" +
    "# runtime. Use environment variables to pass configuration to the\n" +
    "# Node.js application.\n" +
    "#\n" +
    "# Example:\n" +
    "# PORT=9080\n" +
    "#\n" +
    "#**********************************************************************\n";
}
