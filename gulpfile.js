/*
* This program and the accompanying materials are made available under the terms of the *
* Eclipse Public License v2.0 which accompanies this distribution, and is available at *
* https://www.eclipse.org/legal/epl-v20.html                                      *
*                                                                                 *
* SPDX-License-Identifier: EPL-2.0                                                *
*                                                                                 *
* Copyright Contributors to the Zowe Project.                                     *
* Copyright IBM Corp. 2019                                                        *
*                                                                                 *
*/

const gulp = require('gulp');
require('ts-node/register');

/**
 * Development related tasks
 */
const docTask = require("./gulp/GenerateDoc");
gulp.task('doc', docTask.doc);
