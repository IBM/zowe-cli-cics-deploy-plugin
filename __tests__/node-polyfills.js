// Polyfill for deprecated util functions (removed in Node.js v12+)
// This fixes compatibility issues with older @zowe packages

// Suppress deprecation warnings for util functions
const originalEmitWarning = process.emitWarning;
process.emitWarning = function(warning, type, code) {
  if (code && code.startsWith('DEP0044')) {
    // Suppress util.isArray deprecation warning
    return;
  }
  return originalEmitWarning.apply(process, arguments);
};

const util = require('util');

if (typeof util.isNullOrUndefined !== 'function') {
  util.isNullOrUndefined = (value) => {
    return value === null || value === undefined;
  };
}

if (typeof util.isString !== 'function') {
  util.isString = (value) => {
    return typeof value === 'string';
  };
}

if (typeof util.isBoolean !== 'function') {
  util.isBoolean = (value) => {
    return typeof value === 'boolean';
  };
}

if (typeof util.isNumber !== 'function') {
  util.isNumber = (value) => {
    return typeof value === 'number';
  };
}

if (typeof util.isFunction !== 'function') {
  util.isFunction = (value) => {
    return typeof value === 'function';
  };
}

if (typeof util.isObject !== 'function') {
  util.isObject = (value) => {
    return value !== null && typeof value === 'object';
  };
}

if (typeof util.isArray !== 'function') {
  util.isArray = Array.isArray;
}

if (typeof util.isRegExp !== 'function') {
  util.isRegExp = (value) => {
    return value instanceof RegExp;
  };
}

if (typeof util.isDate !== 'function') {
  util.isDate = (value) => {
    return value instanceof Date;
  };
}

if (typeof util.isError !== 'function') {
  util.isError = (value) => {
    return value instanceof Error;
  };
}

if (typeof util.isPrimitive !== 'function') {
  util.isPrimitive = (value) => {
    return value === null ||
           (typeof value !== 'object' && typeof value !== 'function');
  };
}

if (typeof util.isBuffer !== 'function') {
  util.isBuffer = Buffer.isBuffer;
}
