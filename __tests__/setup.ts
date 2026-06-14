/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
* Copyright Contributors to the Zowe Project.
*
*/

// Polyfill for deprecated util functions (removed in Node.js v12+)
// This fixes compatibility issues with older @zowe packages in tests
const util = require('util');

if (typeof util.isNullOrUndefined !== 'function') {
  util.isNullOrUndefined = (value: any) => {
    return value === null || value === undefined;
  };
}

if (typeof util.isString !== 'function') {
  util.isString = (value: any) => {
    return typeof value === 'string';
  };
}

if (typeof util.isBoolean !== 'function') {
  util.isBoolean = (value: any) => {
    return typeof value === 'boolean';
  };
}

if (typeof util.isNumber !== 'function') {
  util.isNumber = (value: any) => {
    return typeof value === 'number';
  };
}

if (typeof util.isFunction !== 'function') {
  util.isFunction = (value: any) => {
    return typeof value === 'function';
  };
}

if (typeof util.isObject !== 'function') {
  util.isObject = (value: any) => {
    return value !== null && typeof value === 'object';
  };
}

if (typeof util.isArray !== 'function') {
  util.isArray = Array.isArray;
}

if (typeof util.isRegExp !== 'function') {
  util.isRegExp = (value: any) => {
    return value instanceof RegExp;
  };
}

if (typeof util.isDate !== 'function') {
  util.isDate = (value: any) => {
    return value instanceof Date;
  };
}

if (typeof util.isError !== 'function') {
  util.isError = (value: any) => {
    return value instanceof Error;
  };
}

if (typeof util.isPrimitive !== 'function') {
  util.isPrimitive = (value: any) => {
    return value === null ||
           (typeof value !== 'object' && typeof value !== 'function');
  };
}

if (typeof util.isBuffer !== 'function') {
  util.isBuffer = Buffer.isBuffer;
}
