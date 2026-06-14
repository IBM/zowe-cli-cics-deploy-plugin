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

// Polyfill for deprecated util functions (removed in Node.js v12+)
// This fixes compatibility issues with older @zowe/imperative versions
const util = require('util');

if (typeof util.isNullOrUndefined !== 'function') {
  util.isNullOrUndefined = function(value) {
    return value === null || value === undefined;
  };
}

if (typeof util.isString !== 'function') {
  util.isString = function(value) {
    return typeof value === 'string';
  };
}

if (typeof util.isBoolean !== 'function') {
  util.isBoolean = function(value) {
    return typeof value === 'boolean';
  };
}

if (typeof util.isNumber !== 'function') {
  util.isNumber = function(value) {
    return typeof value === 'number';
  };
}

if (typeof util.isFunction !== 'function') {
  util.isFunction = function(value) {
    return typeof value === 'function';
  };
}

if (typeof util.isObject !== 'function') {
  util.isObject = function(value) {
    return value !== null && typeof value === 'object';
  };
}

if (typeof util.isArray !== 'function') {
  util.isArray = Array.isArray;
}

if (typeof util.isRegExp !== 'function') {
  util.isRegExp = function(value) {
    return value instanceof RegExp;
  };
}

if (typeof util.isDate !== 'function') {
  util.isDate = function(value) {
    return value instanceof Date;
  };
}

if (typeof util.isError !== 'function') {
  util.isError = function(value) {
    return value instanceof Error;
  };
}

if (typeof util.isPrimitive !== 'function') {
  util.isPrimitive = function(value) {
    return value === null ||
           (typeof value !== 'object' && typeof value !== 'function');
  };
}

if (typeof util.isBuffer !== 'function') {
  util.isBuffer = Buffer.isBuffer;
}

const gulp = require('gulp');
require('ts-node/register');

/**
 * Development related tasks
 */
const docTask = require("./gulp/GenerateDoc");
gulp.task('doc', docTask.doc);
