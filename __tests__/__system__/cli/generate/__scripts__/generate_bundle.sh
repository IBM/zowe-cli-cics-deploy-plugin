#!/bin/bash
set -e # fail the script if we get a non zero exit code
cd $1
shift
zowe cics-deploy generate bundle $@
