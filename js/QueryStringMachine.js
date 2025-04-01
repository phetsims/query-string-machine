// Copyright 2025, University of Colorado Boulder
// @author Michael Kauzmann (PhET Interactive Simulations)
// AUTO GENERATED: DO NOT EDIT!!!! See QueryStringMachineModule.ts and chipper/js/scripts/build-qsm.ts
/* eslint-disable */

"use strict";
(() => {
  // ../query-string-machine/js/QueryStringMachineModule.ts
  var DEFAULT_SEPARATOR = ",";
  var privatePredicate = () => {
    try {
      return localStorage.getItem("phetTeamMember") === "true";
    } catch (e) {
      return false;
    }
  };
  function hasOwnProperty(obj, prop) {
    return obj.hasOwnProperty(prop);
  }
  var isParameterString = (string) => string.length === 0 || string.startsWith("?");
  var getValidValue = (predicate, key, value, schema, message) => {
    if (!predicate) {
      if (schema.public) {
        QueryStringMachine.addWarning(key, value, message);
        if (hasOwnProperty(schema, "defaultValue")) {
          value = schema.defaultValue;
        } else {
          const typeSchema = TYPES[schema.type];
          queryStringMachineAssert(
            hasOwnProperty(typeSchema, "defaultValue"),
            "Type must have a default value if the provided schema does not have one."
          );
          value = typeSchema.defaultValue;
        }
      } else {
        queryStringMachineAssert(predicate, message);
      }
    }
    return value;
  };
  var QueryStringMachine = {
    // public (read-only) {{key:string, value:{*}, message:string}[]} - cleared by some tests in QueryStringMachineTests.js
    // See QueryStringMachine.addWarning for a description of these fields, and to add warnings.
    warnings: [],
    /**
     * Gets the value for a single query parameter.
     *
     */
    get: function(key, schema) {
      return this.getForString(key, schema, window.location.search);
    },
    /**
     * Gets values for every query parameter, using the specified schema map.
     *
     * @param schemaMap - see QueryStringMachine.getAllForString
     * @returns - see QueryStringMachine.getAllForString
     */
    getAll: function(schemaMap) {
      return {
        ...this.getAllForString(schemaMap, window.location.search),
        SCHEMA_MAP: schemaMap
      };
    },
    /**
     * Like `get` but for an arbitrary parameter string.
     *
     * @param key - the query parameter name
     * @param schema - see QueryStringMachine.get
     * @param string - the parameters string.  Must begin with '?' or be the empty string
     * @returns - query parameter value, converted to the proper type
     */
    getForString: function(key, schema, string) {
      if (!isParameterString(string)) {
        throw new Error(`Query strings should be either the empty string or start with a "?": ${string}`);
      }
      const values = schema.private && !privatePredicate() ? [] : getValues(key, string);
      validateSchema(key, schema);
      let value = parseValues(key, schema, values);
      if (hasOwnProperty(schema, "validValues")) {
        const validValues = schema.validValues;
        value = getValidValue(
          isValidValue(value, validValues),
          key,
          value,
          schema,
          `Invalid value supplied for key "${key}": ${value} is not a member of valid values: ${validValues.join(", ")}`
        );
      } else if (hasOwnProperty(schema, "isValidValue")) {
        value = getValidValue(
          schema.isValidValue(value),
          key,
          value,
          schema,
          `Invalid value supplied for key "${key}": ${value}`
        );
      }
      let valueValid = TYPES[schema.type].isValidValue(value);
      if (schema.type === "array" && Array.isArray(value)) {
        let elementsValid = true;
        for (let i = 0; i < value.length; i++) {
          const element = value[i];
          if (!TYPES[schema.elementSchema.type].isValidValue(element)) {
            elementsValid = false;
            break;
          }
          if (hasOwnProperty(schema.elementSchema, "isValidValue") && !schema.elementSchema.isValidValue(element)) {
            elementsValid = false;
            break;
          }
          if (hasOwnProperty(schema.elementSchema, "validValues") && !isValidValue(element, schema.elementSchema.validValues)) {
            elementsValid = false;
            break;
          }
        }
        valueValid = valueValid && elementsValid;
      }
      value = getValidValue(valueValid, key, value, schema, `Invalid value for type, key: ${key}`);
      return value;
    },
    /**
     * Like `getAll` but for an arbitrary parameters string.
     * @param schemaMap - key/value pairs, key is query parameter name and value is a schema
     * @param string - the parameters string
     * @returns - key/value pairs holding the parsed results
     */
    getAllForString: function(schemaMap, string) {
      const result = {};
      for (const key in schemaMap) {
        if (schemaMap.hasOwnProperty(key)) {
          result[key] = this.getForString(key, schemaMap[key], string);
        }
      }
      return result;
    },
    /**
     * Returns true if the window.location.search contains the given key
     * @returns - true if the window.location.search contains the given key
     */
    containsKey: function(key) {
      return this.containsKeyForString(key, window.location.search);
    },
    /**
     * Returns true if the given string contains the specified key
     * @param key - the key to check for
     * @param string - the query string to search. Must begin with '?' or be the empty string
     * @returns - true if the given string contains the given key
     */
    containsKeyForString: function(key, string) {
      if (!isParameterString(string)) {
        throw new Error(`Query strings should be either the empty string or start with a "?": ${string}`);
      }
      const values = getValues(key, string);
      return values.length > 0;
    },
    /**
     * Returns true if the objects are equal.  Exported on the QueryStringMachine for testing.  Only works for
     * arrays objects that contain primitives (i.e. terminals are compared with ===)
     * private - however, it is called from QueryStringMachineTests
     */
    deepEquals: function(a, b) {
      if (typeof a !== typeof b) {
        return false;
      }
      if (typeof a === "string" || typeof a === "number" || typeof a === "boolean") {
        return a === b;
      }
      if (a === null && b === null) {
        return true;
      }
      if (a === void 0 && b === void 0) {
        return true;
      }
      if (a === null && b === void 0) {
        return false;
      }
      if (a === void 0 && b === null) {
        return false;
      }
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);
      if (aKeys.length !== bKeys.length) {
        return false;
      } else if (aKeys.length === 0) {
        return a === b;
      } else {
        for (let i = 0; i < aKeys.length; i++) {
          if (aKeys[i] !== bKeys[i]) {
            return false;
          }
          const aChild = a[aKeys[i]];
          const bChild = b[aKeys[i]];
          if (!QueryStringMachine.deepEquals(aChild, bChild)) {
            return false;
          }
        }
        return true;
      }
    },
    /**
     * Returns a new URL but without the key-value pair.
     *
     * @param queryString - tail of a URL including the beginning '?' (if any)
     * @param key
     */
    removeKeyValuePair: function(queryString, key) {
      queryStringMachineAssert(typeof queryString === "string", `url should be string, but it was: ${typeof queryString}`);
      queryStringMachineAssert(typeof key === "string", `url should be string, but it was: ${typeof key}`);
      queryStringMachineAssert(isParameterString(queryString), "queryString should be length 0 or begin with ?");
      queryStringMachineAssert(key.length > 0, "url should be a string with length > 0");
      if (queryString.startsWith("?")) {
        const newParameters = [];
        const query = queryString.substring(1);
        const elements = query.split("&");
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const keyAndMaybeValue = element.split("=");
          const elementKey = decodeURIComponent(keyAndMaybeValue[0]);
          if (elementKey !== key) {
            newParameters.push(element);
          }
        }
        if (newParameters.length > 0) {
          return `?${newParameters.join("&")}`;
        } else {
          return "";
        }
      } else {
        return queryString;
      }
    },
    /**
     * Remove all the keys from the queryString (ok if they do not appear at all)
     */
    removeKeyValuePairs: function(queryString, keys) {
      for (let i = 0; i < keys.length; i++) {
        queryString = this.removeKeyValuePair(queryString, keys[i]);
      }
      return queryString;
    },
    /**
     * Appends a query string to a given url.
     * @param url - may or may not already have other query parameters
     * @param queryParameters - may start with '', '?' or '&'
     *
     * @example
     * // Limit to the second screen
     * simURL = QueryStringMachine.appendQueryString( simURL, 'screens=2' );
     */
    appendQueryString: function(url, queryParameters) {
      if (queryParameters.startsWith("?") || queryParameters.startsWith("&")) {
        queryParameters = queryParameters.substring(1);
      }
      if (queryParameters.length === 0) {
        return url;
      }
      const combination = url.includes("?") ? "&" : "?";
      return url + combination + queryParameters;
    },
    /**
     * Helper function for multiple query strings
     * @param url - may or may not already have other query parameters
     * @param queryStringArray - each item may start with '', '?', or '&'
     *
     * @example
     * sourceFrame.src = QueryStringMachine.appendQueryStringArray( simURL, [ 'screens=2', 'frameTitle=source' ] );
     */
    appendQueryStringArray: function(url, queryStringArray) {
      for (let i = 0; i < queryStringArray.length; i++) {
        url = this.appendQueryString(url, queryStringArray[i]);
      }
      return url;
    },
    /**
     * Returns the query string at the end of a url, or '?' if there is none.
     */
    getQueryString: function(url) {
      const index = url.indexOf("?");
      if (index >= 0) {
        return url.substring(index);
      } else {
        return "?";
      }
    },
    /**
     * Adds a warning to the console and QueryStringMachine.warnings to indicate that the provided invalid value will
     * not be used.
     *
     * @param key - the query parameter name
     * @param value - type depends on schema type
     * @param message - the message that indicates the problem with the value
     */
    addWarning: function(key, value, message) {
      let isDuplicate = false;
      for (let i = 0; i < this.warnings.length; i++) {
        const warning = this.warnings[i];
        if (key === warning.key && value === warning.value && message === warning.message) {
          isDuplicate = true;
          break;
        }
      }
      if (!isDuplicate) {
        console.warn(message);
        this.warnings.push({
          key,
          value,
          message
        });
      }
    },
    /**
     * Determines if there is a warning for a specified key.
     */
    hasWarning: function(key) {
      let hasWarning = false;
      for (let i = 0; i < this.warnings.length && !hasWarning; i++) {
        hasWarning = this.warnings[i].key === key;
      }
      return hasWarning;
    },
    /**
     * @param queryString - tail of a URL including the beginning '?' (if any)
     * @returns - the split up still-URI-encoded parameters (with values if present)
     */
    getQueryParametersFromString: function(queryString) {
      if (queryString.startsWith("?")) {
        const query = queryString.substring(1);
        return query.split("&");
      }
      return [];
    },
    /**
     * @param key - the query parameter key to return if present
     * @param string - a URL including a "?" if it has a query string
     * @returns - the query parameter as it appears in the URL, like `key=VALUE`, or null if not present
     */
    getSingleQueryParameterString: function(key, string) {
      const queryString = this.getQueryString(string);
      const queryParameters = this.getQueryParametersFromString(queryString);
      for (let i = 0; i < queryParameters.length; i++) {
        const queryParameter = queryParameters[i];
        const keyAndMaybeValue = queryParameter.split("=");
        if (decodeURIComponent(keyAndMaybeValue[0]) === key) {
          return queryParameter;
        }
      }
      return null;
    }
  };
  var getValues = function(key, string) {
    const values = [];
    const params = string.slice(1).split("&");
    for (let i = 0; i < params.length; i++) {
      const splitByEquals = params[i].split("=");
      const name = splitByEquals[0];
      const value = splitByEquals.slice(1).join("=");
      if (name === key) {
        if (value) {
          values.push(decodeURIComponent(value));
        } else {
          values.push(null);
        }
      }
    }
    return values;
  };
  var validateSchema = function(key, schema) {
    const schemaType = TYPES[schema.type];
    queryStringMachineAssert(schema.hasOwnProperty("type"), `type field is required for key: ${key}`);
    queryStringMachineAssert(TYPES.hasOwnProperty(schema.type), `invalid type: ${schema.type} for key: ${key}`);
    if (hasOwnProperty(schema, "parse")) {
      queryStringMachineAssert(typeof schema.parse === "function", `parse must be a function for key: ${key}`);
    }
    queryStringMachineAssert(
      !(schema.hasOwnProperty("validValues") && schema.hasOwnProperty("isValidValue")),
      `validValues and isValidValue are mutually exclusive for key: ${key}`
    );
    if (hasOwnProperty(schema, "validValues")) {
      queryStringMachineAssert(Array.isArray(schema.validValues), `isValidValue must be an array for key: ${key}`);
    }
    if (hasOwnProperty(schema, "isValidValue")) {
      queryStringMachineAssert(typeof schema.isValidValue === "function", `isValidValue must be a function for key: ${key}`);
    }
    if (hasOwnProperty(schema, "defaultValue")) {
      queryStringMachineAssert(schemaType.isValidValue(schema.defaultValue), `defaultValue incorrect type: ${key}`);
    }
    if (hasOwnProperty(schema, "validValues")) {
      schema.validValues.forEach((value) => queryStringMachineAssert(schemaType.isValidValue(value), `validValue incorrect type for key: ${key}`));
    }
    if (hasOwnProperty(schema, "defaultValue") && hasOwnProperty(schema, "validValues")) {
      queryStringMachineAssert(
        isValidValue(schema.defaultValue, schema.validValues),
        `defaultValue must be a member of validValues, for key: ${key}`
      );
    }
    if (hasOwnProperty(schema, "public") && schema.public && schema.type !== "flag") {
      queryStringMachineAssert(schema.hasOwnProperty("defaultValue"), `defaultValue is required when public: true for key: ${key}`);
    }
    validateSchemaProperties(key, schema, schemaType.required, schemaType.optional);
    if (schema.type === "array") {
      validateArraySchema(key, schema);
    }
  };
  var validateArraySchema = function(key, schema) {
    if (schema.hasOwnProperty("separator")) {
      queryStringMachineAssert(typeof schema.separator === "string" && schema.separator.length === 1, `invalid separator: ${schema.separator}, for key: ${key}`);
    }
    queryStringMachineAssert(!schema.elementSchema.hasOwnProperty("public"), "Array elements should not declare public; it comes from the array schema itself.");
    validateSchema(`${key}.element`, schema.elementSchema);
  };
  var validateSchemaProperties = function(key, schema, requiredProperties, optionalProperties) {
    const schemaProperties = Object.getOwnPropertyNames(schema);
    requiredProperties.forEach((property) => {
      queryStringMachineAssert(schemaProperties.includes(property), `missing required property: ${property} for key: ${key}`);
    });
    const supportedProperties = requiredProperties.concat(optionalProperties);
    schemaProperties.forEach((property) => {
      queryStringMachineAssert(property === "type" || supportedProperties.includes(property), `unsupported property: ${property} for key: ${key}`);
    });
  };
  var parseValues = function(key, schema, values) {
    let returnValue;
    queryStringMachineAssert(values.length <= 1, `query parameter cannot occur multiple times: ${key}`);
    if (schema.type === "flag") {
      const type = TYPES[schema.type];
      returnValue = type.parse(key, schema, values[0]);
    } else {
      queryStringMachineAssert(
        values[0] !== void 0 || schema.hasOwnProperty("defaultValue"),
        `missing required query parameter: ${key}`
      );
      if (values[0] === void 0) {
        returnValue = schema.defaultValue;
      } else {
        const type = TYPES[schema.type];
        returnValue = type.parse(key, schema, values[0]);
      }
    }
    return returnValue;
  };
  var parseFlag = function(key, schema, value) {
    return value === null ? true : value === void 0 ? false : value;
  };
  var parseBoolean = function(key, schema, string) {
    return string === "true" ? true : string === "false" ? false : string;
  };
  var parseNumber = function(key, schema, string) {
    const number = Number(string);
    return string === null || isNaN(number) ? string : number;
  };
  var parseString = function(key, schema, string) {
    return string;
  };
  var parseArray = function(key, schema, value) {
    let returnValue;
    if (value === null) {
      returnValue = [];
    } else {
      returnValue = value.split(schema.separator || DEFAULT_SEPARATOR).map((element) => parseValues(key, schema.elementSchema, [element]));
    }
    return returnValue;
  };
  var parseCustom = function(key, schema, value) {
    return schema.parse(value);
  };
  var isValidValue = function(value, validValues) {
    let found = false;
    for (let i = 0; i < validValues.length && !found; i++) {
      found = QueryStringMachine.deepEquals(validValues[i], value);
    }
    return found;
  };
  var queryStringMachineAssert = function(predicate, message) {
    if (!predicate) {
      console && console.log && console.log(message);
      throw new Error(`Query String Machine Assertion failed: ${message}`);
    }
  };
  var TYPES = {
    // NOTE: Types for this are currently in phet-types.d.ts! Changes here should be made there also
    // value is true if present, false if absent
    flag: {
      required: [],
      optional: ["private", "public"],
      parse: parseFlag,
      isValidValue: (value) => value === true || value === false,
      defaultValue: true
      // only needed for flags marks as 'public: true`
    },
    // value is either true or false, e.g. showAnswer=true
    boolean: {
      required: [],
      optional: ["defaultValue", "private", "public"],
      parse: parseBoolean,
      isValidValue: (value) => value === true || value === false
    },
    // value is a number, e.g. frameRate=100
    number: {
      required: [],
      optional: ["defaultValue", "validValues", "isValidValue", "private", "public"],
      parse: parseNumber,
      isValidValue: (value) => typeof value === "number" && !isNaN(value)
    },
    // value is a string, e.g. name=Ringo
    string: {
      required: [],
      optional: ["defaultValue", "validValues", "isValidValue", "private", "public"],
      parse: parseString,
      isValidValue: (value) => value === null || typeof value === "string"
    },
    // value is an array, e.g. screens=1,2,3
    array: {
      required: ["elementSchema"],
      optional: ["defaultValue", "validValues", "isValidValue", "separator", "validValues", "private", "public"],
      parse: parseArray,
      isValidValue: (value) => Array.isArray(value) || value === null
    },
    // value is a custom data type, e.g. color=255,0,255
    custom: {
      required: ["parse"],
      optional: ["defaultValue", "validValues", "isValidValue", "private", "public"],
      parse: parseCustom,
      isValidValue: () => true
    }
  };

  // ../query-string-machine/js/preload-main.ts
  self.QueryStringMachine = QueryStringMachine;
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vcXVlcnktc3RyaW5nLW1hY2hpbmUvanMvUXVlcnlTdHJpbmdNYWNoaW5lTW9kdWxlLnRzIiwgIi4uL3F1ZXJ5LXN0cmluZy1tYWNoaW5lL2pzL3ByZWxvYWQtbWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyNSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUXVlcnkgU3RyaW5nIHBhcnNlciB0aGF0IHN1cHBvcnRzIHR5cGUgY29lcmNpb24sIGRlZmF1bHRzLCBlcnJvciBjaGVja2luZywgZXRjLiBiYXNlZCBvbiBhIHNjaGVtYS5cclxuICogU2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXQgZm9yIHRoZSBkZXNjcmlwdGlvbiBvZiBhIHNjaGVtYS5cclxuICpcclxuICogRm9yIFVNRCAoVW5pdmVyc2FsIE1vZHVsZSBEZWZpbml0aW9uKSBzdXBwb3J0ZWQgb3V0cHV0LCBzZWUganMvUXVlcnlTdHJpbmdNYWNoaW5lLmpzXHJcbiAqXHJcbiAqIFNlZSBUWVBFUyBmb3IgYSBkZXNjcmlwdGlvbiBvZiB0aGUgc2NoZW1hIHR5cGVzIGFuZCB0aGVpciBwcm9wZXJ0aWVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuLy8gRGVmYXVsdCBzdHJpbmcgdGhhdCBzcGxpdHMgYXJyYXkgc3RyaW5nc1xyXG5jb25zdCBERUZBVUxUX1NFUEFSQVRPUiA9ICcsJztcclxuXHJcbnR5cGUgSW50ZW50aW9uYWxRU01BbnkgPSBhbnk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxyXG5cclxudHlwZSBJc1ZhbGlkVmFsdWUgPSAoIG46IEludGVudGlvbmFsUVNNQW55W10gKSA9PiBib29sZWFuO1xyXG5cclxuZXhwb3J0IHR5cGUgV2FybmluZyA9IHtcclxuICBrZXk6IHN0cmluZztcclxuICB2YWx1ZTogc3RyaW5nO1xyXG4gIG1lc3NhZ2U6IHN0cmluZztcclxufTtcclxuXHJcbnR5cGUgU2hhcmVkU2NoZW1hID0ge1xyXG4gIHByaXZhdGU/OiBib29sZWFuO1xyXG4gIHB1YmxpYz86IGJvb2xlYW47XHJcbn07XHJcblxyXG50eXBlIEZsYWdTY2hlbWEgPSB7XHJcbiAgdHlwZTogJ2ZsYWcnO1xyXG59ICYgU2hhcmVkU2NoZW1hO1xyXG5cclxudHlwZSBCb29sZWFuU2NoZW1hID0ge1xyXG4gIHR5cGU6ICdib29sZWFuJztcclxuICBkZWZhdWx0VmFsdWU/OiBib29sZWFuO1xyXG59ICYgU2hhcmVkU2NoZW1hO1xyXG5cclxudHlwZSBOdW1iZXJTY2hlbWEgPSB7XHJcbiAgdHlwZTogJ251bWJlcic7XHJcbiAgZGVmYXVsdFZhbHVlPzogbnVtYmVyO1xyXG4gIHZhbGlkVmFsdWVzPzogcmVhZG9ubHkgbnVtYmVyW107XHJcbiAgaXNWYWxpZFZhbHVlPzogKCBuOiBudW1iZXIgKSA9PiBib29sZWFuO1xyXG59ICYgU2hhcmVkU2NoZW1hO1xyXG5cclxuLy8gSSB3aXNoIHRoaXMgd2FzIGp1c3QgXCJzdHJpbmdcIiwgVE9ETzogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3F1ZXJ5LXN0cmluZy1tYWNoaW5lL2lzc3Vlcy80M1xyXG50eXBlIFN0cmluZ1R5cGUgPSBzdHJpbmcgfCBudWxsO1xyXG5cclxudHlwZSBTdHJpbmdTY2hlbWEgPSB7XHJcbiAgdHlwZTogJ3N0cmluZyc7XHJcbiAgZGVmYXVsdFZhbHVlPzogU3RyaW5nVHlwZTtcclxuICB2YWxpZFZhbHVlcz86IHJlYWRvbmx5ICggU3RyaW5nVHlwZSApW107XHJcbiAgaXNWYWxpZFZhbHVlPzogKCBuOiBTdHJpbmdUeXBlICkgPT4gYm9vbGVhbjtcclxufSAmIFNoYXJlZFNjaGVtYTtcclxuXHJcbnR5cGUgQXJyYXlTY2hlbWEgPSB7XHJcbiAgdHlwZTogJ2FycmF5JztcclxuICBlbGVtZW50U2NoZW1hOiBTY2hlbWE7XHJcbiAgc2VwYXJhdG9yPzogc3RyaW5nO1xyXG4gIGRlZmF1bHRWYWx1ZT86IG51bGwgfCByZWFkb25seSBJbnRlbnRpb25hbFFTTUFueVtdO1xyXG4gIHZhbGlkVmFsdWVzPzogcmVhZG9ubHkgSW50ZW50aW9uYWxRU01BbnlbXVtdO1xyXG4gIGlzVmFsaWRWYWx1ZT86IElzVmFsaWRWYWx1ZTtcclxufSAmIFNoYXJlZFNjaGVtYTtcclxuXHJcbnR5cGUgQ3VzdG9tU2NoZW1hID0ge1xyXG4gIHR5cGU6ICdjdXN0b20nO1xyXG4gIHBhcnNlOiAoIHN0cjogc3RyaW5nICkgPT4gSW50ZW50aW9uYWxRU01Bbnk7XHJcbiAgZGVmYXVsdFZhbHVlPzogSW50ZW50aW9uYWxRU01Bbnk7XHJcbiAgdmFsaWRWYWx1ZXM/OiByZWFkb25seSBJbnRlbnRpb25hbFFTTUFueVtdO1xyXG4gIGlzVmFsaWRWYWx1ZT86ICggbjogSW50ZW50aW9uYWxRU01BbnkgKSA9PiBib29sZWFuO1xyXG59ICYgU2hhcmVkU2NoZW1hO1xyXG5cclxuLy8gTWF0Y2hlcyBUWVBFIGRvY3VtZW50YXRpb24gaW4gUXVlcnlTdHJpbmdNYWNoaW5lXHJcbnR5cGUgU2NoZW1hID0gRmxhZ1NjaGVtYSB8XHJcbiAgQm9vbGVhblNjaGVtYSB8XHJcbiAgTnVtYmVyU2NoZW1hIHxcclxuICBTdHJpbmdTY2hlbWEgfFxyXG4gIEFycmF5U2NoZW1hIHxcclxuICBDdXN0b21TY2hlbWE7XHJcblxyXG50eXBlIFVucGFyc2VkVmFsdWUgPSBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xyXG50eXBlIFBhcnNlZFZhbHVlPFMgZXh0ZW5kcyBTY2hlbWE+ID0gUmV0dXJuVHlwZTx0eXBlb2YgVFlQRVNbU1sndHlwZSddXVsncGFyc2UnXT47XHJcblxyXG4vLyBDb252ZXJ0cyBhIFNjaGVtYSdzIHR5cGUgdG8gdGhlIGFjdHVhbCBUeXBlc2NyaXB0IHR5cGUgaXQgcmVwcmVzZW50c1xyXG50eXBlIFF1ZXJ5TWFjaGluZVR5cGVUb1R5cGU8VD4gPSBUIGV4dGVuZHMgKCAnZmxhZycgfCAnYm9vbGVhbicgKSA/IGJvb2xlYW4gOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFQgZXh0ZW5kcyAnbnVtYmVyJyA/IG51bWJlciA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBUIGV4dGVuZHMgJ3N0cmluZycgPyAoIFN0cmluZ1R5cGUgKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFQgZXh0ZW5kcyAnYXJyYXknID8gSW50ZW50aW9uYWxRU01BbnlbXSA6IEludGVudGlvbmFsUVNNQW55ICkgKSApO1xyXG5cclxuZXhwb3J0IHR5cGUgUVNNU2NoZW1hT2JqZWN0ID0gUmVjb3JkPHN0cmluZywgU2NoZW1hPjtcclxuXHJcbmV4cG9ydCB0eXBlIFFTTVBhcnNlZFBhcmFtZXRlcnM8U2NoZW1hTWFwIGV4dGVuZHMgUVNNU2NoZW1hT2JqZWN0PiA9IHtcclxuICAvLyBXaWxsIHJldHVybiBhIG1hcCBvZiB0aGUgXCJyZXN1bHRcIiB0eXBlc1xyXG4gIFtQcm9wZXJ0eSBpbiBrZXlvZiBTY2hlbWFNYXBdOiBRdWVyeU1hY2hpbmVUeXBlVG9UeXBlPFNjaGVtYU1hcFsgUHJvcGVydHkgXVsgJ3R5cGUnIF0+XHJcbiAgLy8gU0NIRU1BX01BUCBhbGxvd2VkIHRvIGJlIHNldCBpbiB0eXBlc1xyXG59ICYgeyByZWFkb25seSBTQ0hFTUFfTUFQOiBTY2hlbWFNYXAgfTtcclxuXHJcbi8vIElmIGEgcXVlcnkgcGFyYW1ldGVyIGhhcyBwcml2YXRlOnRydWUgaW4gaXRzIHNjaGVtYSwgaXQgbXVzdCBwYXNzIHRoaXMgcHJlZGljYXRlIHRvIGJlIHJlYWQgZnJvbSB0aGUgVVJMLlxyXG4vLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzc0M1xyXG5jb25zdCBwcml2YXRlUHJlZGljYXRlID0gKCkgPT4ge1xyXG4gIC8vIFRyeWluZyB0byBhY2Nlc3MgbG9jYWxTdG9yYWdlIG1heSBmYWlsIHdpdGggYSBTZWN1cml0eUVycm9yIGlmIGNvb2tpZXMgYXJlIGJsb2NrZWQgaW4gYSBjZXJ0YWluIHdheS5cclxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3FhL2lzc3Vlcy8zMjkgZm9yIG1vcmUgaW5mb3JtYXRpb24uXHJcbiAgdHJ5IHtcclxuICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSggJ3BoZXRUZWFtTWVtYmVyJyApID09PSAndHJ1ZSc7XHJcbiAgfVxyXG4gIGNhdGNoKCBlICkge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxufTtcclxuXHJcbnR5cGUgRG9udFVzZVRoaXNPYmplY3QgPSB7fTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVzdHJpY3RlZC10eXBlc1xyXG5cclxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHk8XHJcbiAgWCBleHRlbmRzIERvbnRVc2VUaGlzT2JqZWN0LFxyXG4gIFkgZXh0ZW5kcyBQcm9wZXJ0eUtleT4oIG9iajogWCwgcHJvcDogWSApOiBvYmogaXMgWCAmIFJlY29yZDxZLCB1bmtub3duPiB7XHJcbiAgcmV0dXJuIG9iai5oYXNPd25Qcm9wZXJ0eSggcHJvcCApO1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWQgcGFyYW1ldGVyIHN0cmluZ3MgYmVnaW4gd2l0aCA/IG9yIGFyZSB0aGUgZW1wdHkgc3RyaW5nLiAgVGhpcyBpcyB1c2VkIGZvciBhc3NlcnRpb25zIGluIHNvbWUgY2FzZXMgYW5kIGZvclxyXG4gKiB0aHJvd2luZyBFcnJvcnMgaW4gb3RoZXIgY2FzZXMuXHJcbiAqL1xyXG5jb25zdCBpc1BhcmFtZXRlclN0cmluZyA9ICggc3RyaW5nOiBzdHJpbmcgKTogYm9vbGVhbiA9PiBzdHJpbmcubGVuZ3RoID09PSAwIHx8IHN0cmluZy5zdGFydHNXaXRoKCAnPycgKTtcclxuXHJcbi8vIEp1c3QgcmV0dXJuIGEgdmFsdWUgdG8gZGVmaW5lIHRoZSBtb2R1bGUgZXhwb3J0LlxyXG4vLyBUaGlzIGV4YW1wbGUgcmV0dXJucyBhbiBvYmplY3QsIGJ1dCB0aGUgbW9kdWxlXHJcbi8vIGNhbiByZXR1cm4gYSBmdW5jdGlvbiBhcyB0aGUgZXhwb3J0ZWQgdmFsdWUuXHJcblxyXG4vKipcclxuICogSW4gb3JkZXIgdG8gc3VwcG9ydCBncmFjZWZ1bCBmYWlsdXJlcyBmb3IgdXNlci1zdXBwbGllZCB2YWx1ZXMsIHdlIGZhbGwgYmFjayB0byBkZWZhdWx0IHZhbHVlcyB3aGVuIHB1YmxpYzogdHJ1ZVxyXG4gKiBpcyBzcGVjaWZpZWQuICBJZiB0aGUgc2NoZW1hIGVudHJ5IGlzIHB1YmxpYzogZmFsc2UsIHRoZW4gYSBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQgaXMgdGhyb3duLlxyXG4gKi9cclxuY29uc3QgZ2V0VmFsaWRWYWx1ZSA9ICggcHJlZGljYXRlOiBib29sZWFuLCBrZXk6IHN0cmluZywgdmFsdWU6IEludGVudGlvbmFsUVNNQW55LCBzY2hlbWE6IFNjaGVtYSwgbWVzc2FnZTogc3RyaW5nICk6IEludGVudGlvbmFsUVNNQW55ID0+IHtcclxuICBpZiAoICFwcmVkaWNhdGUgKSB7XHJcblxyXG4gICAgaWYgKCBzY2hlbWEucHVibGljICkge1xyXG4gICAgICBRdWVyeVN0cmluZ01hY2hpbmUuYWRkV2FybmluZygga2V5LCB2YWx1ZSwgbWVzc2FnZSApO1xyXG4gICAgICBpZiAoIGhhc093blByb3BlcnR5KCBzY2hlbWEsICdkZWZhdWx0VmFsdWUnICkgKSB7XHJcbiAgICAgICAgdmFsdWUgPSBzY2hlbWEuZGVmYXVsdFZhbHVlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IHR5cGVTY2hlbWEgPSBUWVBFU1sgc2NoZW1hLnR5cGUgXTtcclxuICAgICAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIGhhc093blByb3BlcnR5KCB0eXBlU2NoZW1hLCAnZGVmYXVsdFZhbHVlJyApLFxyXG4gICAgICAgICAgJ1R5cGUgbXVzdCBoYXZlIGEgZGVmYXVsdCB2YWx1ZSBpZiB0aGUgcHJvdmlkZWQgc2NoZW1hIGRvZXMgbm90IGhhdmUgb25lLicgKTtcclxuXHJcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIHdlIGtub3cgdGhleSBkb24ndCBhbGwgaGF2ZSB0aGlzLCBoZW5jZSB0aGUgYXNzZXJ0aW9uIGFib3ZlLlxyXG4gICAgICAgIHZhbHVlID0gdHlwZVNjaGVtYS5kZWZhdWx0VmFsdWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIHByZWRpY2F0ZSwgbWVzc2FnZSApO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gdmFsdWU7XHJcbn07XHJcblxyXG4vKipcclxuICogUXVlcnkgU3RyaW5nIE1hY2hpbmUgaXMgYSBxdWVyeSBzdHJpbmcgcGFyc2VyIHRoYXQgc3VwcG9ydHMgdHlwZSBjb2VyY2lvbiwgZGVmYXVsdCB2YWx1ZXMgJiB2YWxpZGF0aW9uLiBQbGVhc2VcclxuICogdmlzaXQgUGhFVCdzIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVlcnktc3RyaW5nLW1hY2hpbmVcIiB0YXJnZXQ9XCJfYmxhbmtcIj5xdWVyeS1zdHJpbmctbWFjaGluZTwvYT5cclxuICogcmVwb3NpdG9yeSBmb3IgZG9jdW1lbnRhdGlvbiBhbmQgZXhhbXBsZXMuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgUXVlcnlTdHJpbmdNYWNoaW5lID0ge1xyXG5cclxuICAvLyBwdWJsaWMgKHJlYWQtb25seSkge3trZXk6c3RyaW5nLCB2YWx1ZTp7Kn0sIG1lc3NhZ2U6c3RyaW5nfVtdfSAtIGNsZWFyZWQgYnkgc29tZSB0ZXN0cyBpbiBRdWVyeVN0cmluZ01hY2hpbmVUZXN0cy5qc1xyXG4gIC8vIFNlZSBRdWVyeVN0cmluZ01hY2hpbmUuYWRkV2FybmluZyBmb3IgYSBkZXNjcmlwdGlvbiBvZiB0aGVzZSBmaWVsZHMsIGFuZCB0byBhZGQgd2FybmluZ3MuXHJcbiAgd2FybmluZ3M6IFtdIGFzIFdhcm5pbmdbXSxcclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgdmFsdWUgZm9yIGEgc2luZ2xlIHF1ZXJ5IHBhcmFtZXRlci5cclxuICAgKlxyXG4gICAqL1xyXG4gIGdldDogZnVuY3Rpb24gPFMgZXh0ZW5kcyBTY2hlbWE+KCBrZXk6IHN0cmluZywgc2NoZW1hOiBTICk6IFBhcnNlZFZhbHVlPFM+IHtcclxuICAgIHJldHVybiB0aGlzLmdldEZvclN0cmluZygga2V5LCBzY2hlbWEsIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHZhbHVlcyBmb3IgZXZlcnkgcXVlcnkgcGFyYW1ldGVyLCB1c2luZyB0aGUgc3BlY2lmaWVkIHNjaGVtYSBtYXAuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gc2NoZW1hTWFwIC0gc2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRBbGxGb3JTdHJpbmdcclxuICAgKiBAcmV0dXJucyAtIHNlZSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0QWxsRm9yU3RyaW5nXHJcbiAgICovXHJcbiAgZ2V0QWxsOiBmdW5jdGlvbiA8U2NoZW1hTWFwIGV4dGVuZHMgUVNNU2NoZW1hT2JqZWN0Piggc2NoZW1hTWFwOiBTY2hlbWFNYXAgKTogUVNNUGFyc2VkUGFyYW1ldGVyczxTY2hlbWFNYXA+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwaGV0L25vLW9iamVjdC1zcHJlYWQtb24tbm9uLWxpdGVyYWxzXHJcbiAgICAgIC4uLnRoaXMuZ2V0QWxsRm9yU3RyaW5nKCBzY2hlbWFNYXAsIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggKSxcclxuICAgICAgU0NIRU1BX01BUDogc2NoZW1hTWFwXHJcbiAgICB9O1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIExpa2UgYGdldGAgYnV0IGZvciBhbiBhcmJpdHJhcnkgcGFyYW1ldGVyIHN0cmluZy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBrZXkgLSB0aGUgcXVlcnkgcGFyYW1ldGVyIG5hbWVcclxuICAgKiBAcGFyYW0gc2NoZW1hIC0gc2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRcclxuICAgKiBAcGFyYW0gc3RyaW5nIC0gdGhlIHBhcmFtZXRlcnMgc3RyaW5nLiAgTXVzdCBiZWdpbiB3aXRoICc/JyBvciBiZSB0aGUgZW1wdHkgc3RyaW5nXHJcbiAgICogQHJldHVybnMgLSBxdWVyeSBwYXJhbWV0ZXIgdmFsdWUsIGNvbnZlcnRlZCB0byB0aGUgcHJvcGVyIHR5cGVcclxuICAgKi9cclxuICBnZXRGb3JTdHJpbmc6IGZ1bmN0aW9uIDxTIGV4dGVuZHMgU2NoZW1hPigga2V5OiBzdHJpbmcsIHNjaGVtYTogUywgc3RyaW5nOiBzdHJpbmcgKTogUGFyc2VkVmFsdWU8Uz4ge1xyXG5cclxuICAgIGlmICggIWlzUGFyYW1ldGVyU3RyaW5nKCBzdHJpbmcgKSApIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCBgUXVlcnkgc3RyaW5ncyBzaG91bGQgYmUgZWl0aGVyIHRoZSBlbXB0eSBzdHJpbmcgb3Igc3RhcnQgd2l0aCBhIFwiP1wiOiAke3N0cmluZ31gICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWdub3JlIFVSTCB2YWx1ZXMgZm9yIHByaXZhdGUgcXVlcnkgcGFyYW1ldGVycyB0aGF0IGZhaWwgcHJpdmF0ZVByZWRpY2F0ZS5cclxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvNzQzLlxyXG4gICAgY29uc3QgdmFsdWVzID0gKCBzY2hlbWEucHJpdmF0ZSAmJiAhcHJpdmF0ZVByZWRpY2F0ZSgpICkgPyBbXSA6IGdldFZhbHVlcygga2V5LCBzdHJpbmcgKTtcclxuXHJcbiAgICB2YWxpZGF0ZVNjaGVtYSgga2V5LCBzY2hlbWEgKTtcclxuXHJcbiAgICBsZXQgdmFsdWUgPSBwYXJzZVZhbHVlcygga2V5LCBzY2hlbWEsIHZhbHVlcyApO1xyXG5cclxuICAgIGlmICggaGFzT3duUHJvcGVydHkoIHNjaGVtYSwgJ3ZhbGlkVmFsdWVzJyApICkge1xyXG4gICAgICBjb25zdCB2YWxpZFZhbHVlcyA9IHNjaGVtYS52YWxpZFZhbHVlcyBhcyBJbnRlbnRpb25hbFFTTUFueVtdO1xyXG4gICAgICB2YWx1ZSA9IGdldFZhbGlkVmFsdWUoIGlzVmFsaWRWYWx1ZSggdmFsdWUsIHZhbGlkVmFsdWVzICksIGtleSwgdmFsdWUsIHNjaGVtYSxcclxuICAgICAgICBgSW52YWxpZCB2YWx1ZSBzdXBwbGllZCBmb3Iga2V5IFwiJHtrZXl9XCI6ICR7dmFsdWV9IGlzIG5vdCBhIG1lbWJlciBvZiB2YWxpZCB2YWx1ZXM6ICR7dmFsaWRWYWx1ZXMuam9pbiggJywgJyApfWBcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpc1ZhbGlkVmFsdWUgZXZhbHVhdGVzIHRvIHRydWVcclxuICAgIGVsc2UgaWYgKCBoYXNPd25Qcm9wZXJ0eSggc2NoZW1hLCAnaXNWYWxpZFZhbHVlJyApICkge1xyXG4gICAgICB2YWx1ZSA9IGdldFZhbGlkVmFsdWUoICggc2NoZW1hLmlzVmFsaWRWYWx1ZSBhcyBJc1ZhbGlkVmFsdWUgKSggdmFsdWUgKSwga2V5LCB2YWx1ZSwgc2NoZW1hLFxyXG4gICAgICAgIGBJbnZhbGlkIHZhbHVlIHN1cHBsaWVkIGZvciBrZXkgXCIke2tleX1cIjogJHt2YWx1ZX1gXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHZhbHVlVmFsaWQgPSBUWVBFU1sgc2NoZW1hLnR5cGUgXS5pc1ZhbGlkVmFsdWUoIHZhbHVlICk7XHJcblxyXG4gICAgLy8gc3VwcG9ydCBjdXN0b20gdmFsaWRhdGlvbiBmb3IgZWxlbWVudFNjaGVtYSBmb3IgYXJyYXlzXHJcbiAgICBpZiAoIHNjaGVtYS50eXBlID09PSAnYXJyYXknICYmIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XHJcbiAgICAgIGxldCBlbGVtZW50c1ZhbGlkID0gdHJ1ZTtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHZhbHVlWyBpIF07XHJcbiAgICAgICAgaWYgKCAhVFlQRVNbIHNjaGVtYS5lbGVtZW50U2NoZW1hLnR5cGUgXS5pc1ZhbGlkVmFsdWUoIGVsZW1lbnQgKSApIHtcclxuICAgICAgICAgIGVsZW1lbnRzVmFsaWQgPSBmYWxzZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIGhhc093blByb3BlcnR5KCBzY2hlbWEuZWxlbWVudFNjaGVtYSwgJ2lzVmFsaWRWYWx1ZScgKSAmJiAhKCBzY2hlbWEuZWxlbWVudFNjaGVtYS5pc1ZhbGlkVmFsdWUgYXMgSXNWYWxpZFZhbHVlICkoIGVsZW1lbnQgKSApIHtcclxuICAgICAgICAgIGVsZW1lbnRzVmFsaWQgPSBmYWxzZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIGhhc093blByb3BlcnR5KCBzY2hlbWEuZWxlbWVudFNjaGVtYSwgJ3ZhbGlkVmFsdWVzJyApICYmICFpc1ZhbGlkVmFsdWUoIGVsZW1lbnQsIHNjaGVtYS5lbGVtZW50U2NoZW1hLnZhbGlkVmFsdWVzIGFzIEludGVudGlvbmFsUVNNQW55W10gKSApIHtcclxuICAgICAgICAgIGVsZW1lbnRzVmFsaWQgPSBmYWxzZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICB2YWx1ZVZhbGlkID0gdmFsdWVWYWxpZCAmJiBlbGVtZW50c1ZhbGlkO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGRpc3BhdGNoIGZ1cnRoZXIgdmFsaWRhdGlvbiB0byBhIHR5cGUtc3BlY2lmaWMgZnVuY3Rpb25cclxuICAgIHZhbHVlID0gZ2V0VmFsaWRWYWx1ZSggdmFsdWVWYWxpZCwga2V5LCB2YWx1ZSwgc2NoZW1hLCBgSW52YWxpZCB2YWx1ZSBmb3IgdHlwZSwga2V5OiAke2tleX1gICk7XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogTGlrZSBgZ2V0QWxsYCBidXQgZm9yIGFuIGFyYml0cmFyeSBwYXJhbWV0ZXJzIHN0cmluZy5cclxuICAgKiBAcGFyYW0gc2NoZW1hTWFwIC0ga2V5L3ZhbHVlIHBhaXJzLCBrZXkgaXMgcXVlcnkgcGFyYW1ldGVyIG5hbWUgYW5kIHZhbHVlIGlzIGEgc2NoZW1hXHJcbiAgICogQHBhcmFtIHN0cmluZyAtIHRoZSBwYXJhbWV0ZXJzIHN0cmluZ1xyXG4gICAqIEByZXR1cm5zIC0ga2V5L3ZhbHVlIHBhaXJzIGhvbGRpbmcgdGhlIHBhcnNlZCByZXN1bHRzXHJcbiAgICovXHJcbiAgZ2V0QWxsRm9yU3RyaW5nOiBmdW5jdGlvbiA8U2NoZW1hTWFwIGV4dGVuZHMgUVNNU2NoZW1hT2JqZWN0Piggc2NoZW1hTWFwOiBTY2hlbWFNYXAsIHN0cmluZzogc3RyaW5nICk6IFFTTVBhcnNlZFBhcmFtZXRlcnM8U2NoZW1hTWFwPiB7XHJcbiAgICBjb25zdCByZXN1bHQgPSB7fSBhcyB1bmtub3duIGFzIFFTTVBhcnNlZFBhcmFtZXRlcnM8U2NoZW1hTWFwPjtcclxuXHJcbiAgICBmb3IgKCBjb25zdCBrZXkgaW4gc2NoZW1hTWFwICkge1xyXG4gICAgICBpZiAoIHNjaGVtYU1hcC5oYXNPd25Qcm9wZXJ0eSgga2V5ICkgKSB7XHJcbiAgICAgICAgcmVzdWx0WyBrZXkgXSA9IHRoaXMuZ2V0Rm9yU3RyaW5nKCBrZXksIHNjaGVtYU1hcFsga2V5IF0sIHN0cmluZyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgd2luZG93LmxvY2F0aW9uLnNlYXJjaCBjb250YWlucyB0aGUgZ2l2ZW4ga2V5XHJcbiAgICogQHJldHVybnMgLSB0cnVlIGlmIHRoZSB3aW5kb3cubG9jYXRpb24uc2VhcmNoIGNvbnRhaW5zIHRoZSBnaXZlbiBrZXlcclxuICAgKi9cclxuICBjb250YWluc0tleTogZnVuY3Rpb24oIGtleTogc3RyaW5nICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuY29udGFpbnNLZXlGb3JTdHJpbmcoIGtleSwgd2luZG93LmxvY2F0aW9uLnNlYXJjaCApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gc3RyaW5nIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQga2V5XHJcbiAgICogQHBhcmFtIGtleSAtIHRoZSBrZXkgdG8gY2hlY2sgZm9yXHJcbiAgICogQHBhcmFtIHN0cmluZyAtIHRoZSBxdWVyeSBzdHJpbmcgdG8gc2VhcmNoLiBNdXN0IGJlZ2luIHdpdGggJz8nIG9yIGJlIHRoZSBlbXB0eSBzdHJpbmdcclxuICAgKiBAcmV0dXJucyAtIHRydWUgaWYgdGhlIGdpdmVuIHN0cmluZyBjb250YWlucyB0aGUgZ2l2ZW4ga2V5XHJcbiAgICovXHJcbiAgY29udGFpbnNLZXlGb3JTdHJpbmc6IGZ1bmN0aW9uKCBrZXk6IHN0cmluZywgc3RyaW5nOiBzdHJpbmcgKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoICFpc1BhcmFtZXRlclN0cmluZyggc3RyaW5nICkgKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvciggYFF1ZXJ5IHN0cmluZ3Mgc2hvdWxkIGJlIGVpdGhlciB0aGUgZW1wdHkgc3RyaW5nIG9yIHN0YXJ0IHdpdGggYSBcIj9cIjogJHtzdHJpbmd9YCApO1xyXG4gICAgfVxyXG4gICAgY29uc3QgdmFsdWVzID0gZ2V0VmFsdWVzKCBrZXksIHN0cmluZyApO1xyXG4gICAgcmV0dXJuIHZhbHVlcy5sZW5ndGggPiAwO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgb2JqZWN0cyBhcmUgZXF1YWwuICBFeHBvcnRlZCBvbiB0aGUgUXVlcnlTdHJpbmdNYWNoaW5lIGZvciB0ZXN0aW5nLiAgT25seSB3b3JrcyBmb3JcclxuICAgKiBhcnJheXMgb2JqZWN0cyB0aGF0IGNvbnRhaW4gcHJpbWl0aXZlcyAoaS5lLiB0ZXJtaW5hbHMgYXJlIGNvbXBhcmVkIHdpdGggPT09KVxyXG4gICAqIHByaXZhdGUgLSBob3dldmVyLCBpdCBpcyBjYWxsZWQgZnJvbSBRdWVyeVN0cmluZ01hY2hpbmVUZXN0c1xyXG4gICAqL1xyXG4gIGRlZXBFcXVhbHM6IGZ1bmN0aW9uKCBhOiBJbnRlbnRpb25hbFFTTUFueSwgYjogSW50ZW50aW9uYWxRU01BbnkgKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoIHR5cGVvZiBhICE9PSB0eXBlb2YgYiApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaWYgKCB0eXBlb2YgYSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIGEgPT09ICdudW1iZXInIHx8IHR5cGVvZiBhID09PSAnYm9vbGVhbicgKSB7XHJcbiAgICAgIHJldHVybiBhID09PSBiO1xyXG4gICAgfVxyXG4gICAgaWYgKCBhID09PSBudWxsICYmIGIgPT09IG51bGwgKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgaWYgKCBhID09PSB1bmRlZmluZWQgJiYgYiA9PT0gdW5kZWZpbmVkICkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGlmICggYSA9PT0gbnVsbCAmJiBiID09PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmICggYSA9PT0gdW5kZWZpbmVkICYmIGIgPT09IG51bGwgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGNvbnN0IGFLZXlzID0gT2JqZWN0LmtleXMoIGEgKTtcclxuICAgIGNvbnN0IGJLZXlzID0gT2JqZWN0LmtleXMoIGIgKTtcclxuICAgIGlmICggYUtleXMubGVuZ3RoICE9PSBiS2V5cy5sZW5ndGggKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBhS2V5cy5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgIHJldHVybiBhID09PSBiO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGFLZXlzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGlmICggYUtleXNbIGkgXSAhPT0gYktleXNbIGkgXSApIHtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgYUNoaWxkID0gYVsgYUtleXNbIGkgXSBdO1xyXG4gICAgICAgIGNvbnN0IGJDaGlsZCA9IGJbIGFLZXlzWyBpIF0gXTtcclxuICAgICAgICBpZiAoICFRdWVyeVN0cmluZ01hY2hpbmUuZGVlcEVxdWFscyggYUNoaWxkLCBiQ2hpbGQgKSApIHtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG5ldyBVUkwgYnV0IHdpdGhvdXQgdGhlIGtleS12YWx1ZSBwYWlyLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHF1ZXJ5U3RyaW5nIC0gdGFpbCBvZiBhIFVSTCBpbmNsdWRpbmcgdGhlIGJlZ2lubmluZyAnPycgKGlmIGFueSlcclxuICAgKiBAcGFyYW0ga2V5XHJcbiAgICovXHJcbiAgcmVtb3ZlS2V5VmFsdWVQYWlyOiBmdW5jdGlvbiggcXVlcnlTdHJpbmc6IHN0cmluZywga2V5OiBzdHJpbmcgKTogc3RyaW5nIHtcclxuICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggdHlwZW9mIHF1ZXJ5U3RyaW5nID09PSAnc3RyaW5nJywgYHVybCBzaG91bGQgYmUgc3RyaW5nLCBidXQgaXQgd2FzOiAke3R5cGVvZiBxdWVyeVN0cmluZ31gICk7XHJcbiAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnLCBgdXJsIHNob3VsZCBiZSBzdHJpbmcsIGJ1dCBpdCB3YXM6ICR7dHlwZW9mIGtleX1gICk7XHJcbiAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIGlzUGFyYW1ldGVyU3RyaW5nKCBxdWVyeVN0cmluZyApLCAncXVlcnlTdHJpbmcgc2hvdWxkIGJlIGxlbmd0aCAwIG9yIGJlZ2luIHdpdGggPycgKTtcclxuICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCgga2V5Lmxlbmd0aCA+IDAsICd1cmwgc2hvdWxkIGJlIGEgc3RyaW5nIHdpdGggbGVuZ3RoID4gMCcgKTtcclxuXHJcbiAgICBpZiAoIHF1ZXJ5U3RyaW5nLnN0YXJ0c1dpdGgoICc/JyApICkge1xyXG4gICAgICBjb25zdCBuZXdQYXJhbWV0ZXJzID0gW107XHJcbiAgICAgIGNvbnN0IHF1ZXJ5ID0gcXVlcnlTdHJpbmcuc3Vic3RyaW5nKCAxICk7XHJcbiAgICAgIGNvbnN0IGVsZW1lbnRzID0gcXVlcnkuc3BsaXQoICcmJyApO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gZWxlbWVudHNbIGkgXTtcclxuICAgICAgICBjb25zdCBrZXlBbmRNYXliZVZhbHVlID0gZWxlbWVudC5zcGxpdCggJz0nICk7XHJcblxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRLZXkgPSBkZWNvZGVVUklDb21wb25lbnQoIGtleUFuZE1heWJlVmFsdWVbIDAgXSApO1xyXG4gICAgICAgIGlmICggZWxlbWVudEtleSAhPT0ga2V5ICkge1xyXG4gICAgICAgICAgbmV3UGFyYW1ldGVycy5wdXNoKCBlbGVtZW50ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIG5ld1BhcmFtZXRlcnMubGVuZ3RoID4gMCApIHtcclxuICAgICAgICByZXR1cm4gYD8ke25ld1BhcmFtZXRlcnMuam9pbiggJyYnICl9YDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gcXVlcnlTdHJpbmc7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGFsbCB0aGUga2V5cyBmcm9tIHRoZSBxdWVyeVN0cmluZyAob2sgaWYgdGhleSBkbyBub3QgYXBwZWFyIGF0IGFsbClcclxuICAgKi9cclxuICByZW1vdmVLZXlWYWx1ZVBhaXJzOiBmdW5jdGlvbiggcXVlcnlTdHJpbmc6IHN0cmluZywga2V5czogc3RyaW5nW10gKTogc3RyaW5nIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHF1ZXJ5U3RyaW5nID0gdGhpcy5yZW1vdmVLZXlWYWx1ZVBhaXIoIHF1ZXJ5U3RyaW5nLCBrZXlzWyBpIF0gKTtcclxuICAgIH1cclxuICAgIHJldHVybiBxdWVyeVN0cmluZztcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBBcHBlbmRzIGEgcXVlcnkgc3RyaW5nIHRvIGEgZ2l2ZW4gdXJsLlxyXG4gICAqIEBwYXJhbSB1cmwgLSBtYXkgb3IgbWF5IG5vdCBhbHJlYWR5IGhhdmUgb3RoZXIgcXVlcnkgcGFyYW1ldGVyc1xyXG4gICAqIEBwYXJhbSBxdWVyeVBhcmFtZXRlcnMgLSBtYXkgc3RhcnQgd2l0aCAnJywgJz8nIG9yICcmJ1xyXG4gICAqXHJcbiAgICogQGV4YW1wbGVcclxuICAgKiAvLyBMaW1pdCB0byB0aGUgc2Vjb25kIHNjcmVlblxyXG4gICAqIHNpbVVSTCA9IFF1ZXJ5U3RyaW5nTWFjaGluZS5hcHBlbmRRdWVyeVN0cmluZyggc2ltVVJMLCAnc2NyZWVucz0yJyApO1xyXG4gICAqL1xyXG4gIGFwcGVuZFF1ZXJ5U3RyaW5nOiBmdW5jdGlvbiggdXJsOiBzdHJpbmcsIHF1ZXJ5UGFyYW1ldGVyczogc3RyaW5nICk6IHN0cmluZyB7XHJcbiAgICBpZiAoIHF1ZXJ5UGFyYW1ldGVycy5zdGFydHNXaXRoKCAnPycgKSB8fCBxdWVyeVBhcmFtZXRlcnMuc3RhcnRzV2l0aCggJyYnICkgKSB7XHJcbiAgICAgIHF1ZXJ5UGFyYW1ldGVycyA9IHF1ZXJ5UGFyYW1ldGVycy5zdWJzdHJpbmcoIDEgKTtcclxuICAgIH1cclxuICAgIGlmICggcXVlcnlQYXJhbWV0ZXJzLmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgcmV0dXJuIHVybDtcclxuICAgIH1cclxuICAgIGNvbnN0IGNvbWJpbmF0aW9uID0gdXJsLmluY2x1ZGVzKCAnPycgKSA/ICcmJyA6ICc/JztcclxuICAgIHJldHVybiB1cmwgKyBjb21iaW5hdGlvbiArIHF1ZXJ5UGFyYW1ldGVycztcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBIZWxwZXIgZnVuY3Rpb24gZm9yIG11bHRpcGxlIHF1ZXJ5IHN0cmluZ3NcclxuICAgKiBAcGFyYW0gdXJsIC0gbWF5IG9yIG1heSBub3QgYWxyZWFkeSBoYXZlIG90aGVyIHF1ZXJ5IHBhcmFtZXRlcnNcclxuICAgKiBAcGFyYW0gcXVlcnlTdHJpbmdBcnJheSAtIGVhY2ggaXRlbSBtYXkgc3RhcnQgd2l0aCAnJywgJz8nLCBvciAnJidcclxuICAgKlxyXG4gICAqIEBleGFtcGxlXHJcbiAgICogc291cmNlRnJhbWUuc3JjID0gUXVlcnlTdHJpbmdNYWNoaW5lLmFwcGVuZFF1ZXJ5U3RyaW5nQXJyYXkoIHNpbVVSTCwgWyAnc2NyZWVucz0yJywgJ2ZyYW1lVGl0bGU9c291cmNlJyBdICk7XHJcbiAgICovXHJcbiAgYXBwZW5kUXVlcnlTdHJpbmdBcnJheTogZnVuY3Rpb24oIHVybDogc3RyaW5nLCBxdWVyeVN0cmluZ0FycmF5OiBzdHJpbmdbXSApOiBzdHJpbmcge1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHF1ZXJ5U3RyaW5nQXJyYXkubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHVybCA9IHRoaXMuYXBwZW5kUXVlcnlTdHJpbmcoIHVybCwgcXVlcnlTdHJpbmdBcnJheVsgaSBdICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdXJsO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHF1ZXJ5IHN0cmluZyBhdCB0aGUgZW5kIG9mIGEgdXJsLCBvciAnPycgaWYgdGhlcmUgaXMgbm9uZS5cclxuICAgKi9cclxuICBnZXRRdWVyeVN0cmluZzogZnVuY3Rpb24oIHVybDogc3RyaW5nICk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBpbmRleCA9IHVybC5pbmRleE9mKCAnPycgKTtcclxuXHJcbiAgICBpZiAoIGluZGV4ID49IDAgKSB7XHJcbiAgICAgIHJldHVybiB1cmwuc3Vic3RyaW5nKCBpbmRleCApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiAnPyc7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIHdhcm5pbmcgdG8gdGhlIGNvbnNvbGUgYW5kIFF1ZXJ5U3RyaW5nTWFjaGluZS53YXJuaW5ncyB0byBpbmRpY2F0ZSB0aGF0IHRoZSBwcm92aWRlZCBpbnZhbGlkIHZhbHVlIHdpbGxcclxuICAgKiBub3QgYmUgdXNlZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBrZXkgLSB0aGUgcXVlcnkgcGFyYW1ldGVyIG5hbWVcclxuICAgKiBAcGFyYW0gdmFsdWUgLSB0eXBlIGRlcGVuZHMgb24gc2NoZW1hIHR5cGVcclxuICAgKiBAcGFyYW0gbWVzc2FnZSAtIHRoZSBtZXNzYWdlIHRoYXQgaW5kaWNhdGVzIHRoZSBwcm9ibGVtIHdpdGggdGhlIHZhbHVlXHJcbiAgICovXHJcbiAgYWRkV2FybmluZzogZnVuY3Rpb24oIGtleTogc3RyaW5nLCB2YWx1ZTogSW50ZW50aW9uYWxRU01BbnksIG1lc3NhZ2U6IHN0cmluZyApOiB2b2lkIHtcclxuXHJcbiAgICBsZXQgaXNEdXBsaWNhdGUgPSBmYWxzZTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMud2FybmluZ3MubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHdhcm5pbmcgPSB0aGlzLndhcm5pbmdzWyBpIF07XHJcbiAgICAgIGlmICgga2V5ID09PSB3YXJuaW5nLmtleSAmJiB2YWx1ZSA9PT0gd2FybmluZy52YWx1ZSAmJiBtZXNzYWdlID09PSB3YXJuaW5nLm1lc3NhZ2UgKSB7XHJcbiAgICAgICAgaXNEdXBsaWNhdGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoICFpc0R1cGxpY2F0ZSApIHtcclxuICAgICAgY29uc29sZS53YXJuKCBtZXNzYWdlICk7XHJcblxyXG4gICAgICB0aGlzLndhcm5pbmdzLnB1c2goIHtcclxuICAgICAgICBrZXk6IGtleSxcclxuICAgICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgICAgbWVzc2FnZTogbWVzc2FnZVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyBpZiB0aGVyZSBpcyBhIHdhcm5pbmcgZm9yIGEgc3BlY2lmaWVkIGtleS5cclxuICAgKi9cclxuICBoYXNXYXJuaW5nOiBmdW5jdGlvbigga2V5OiBzdHJpbmcgKTogYm9vbGVhbiB7XHJcbiAgICBsZXQgaGFzV2FybmluZyA9IGZhbHNlO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy53YXJuaW5ncy5sZW5ndGggJiYgIWhhc1dhcm5pbmc7IGkrKyApIHtcclxuICAgICAgaGFzV2FybmluZyA9ICggdGhpcy53YXJuaW5nc1sgaSBdLmtleSA9PT0ga2V5ICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaGFzV2FybmluZztcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gcXVlcnlTdHJpbmcgLSB0YWlsIG9mIGEgVVJMIGluY2x1ZGluZyB0aGUgYmVnaW5uaW5nICc/JyAoaWYgYW55KVxyXG4gICAqIEByZXR1cm5zIC0gdGhlIHNwbGl0IHVwIHN0aWxsLVVSSS1lbmNvZGVkIHBhcmFtZXRlcnMgKHdpdGggdmFsdWVzIGlmIHByZXNlbnQpXHJcbiAgICovXHJcbiAgZ2V0UXVlcnlQYXJhbWV0ZXJzRnJvbVN0cmluZzogZnVuY3Rpb24oIHF1ZXJ5U3RyaW5nOiBzdHJpbmcgKTogc3RyaW5nW10ge1xyXG4gICAgaWYgKCBxdWVyeVN0cmluZy5zdGFydHNXaXRoKCAnPycgKSApIHtcclxuICAgICAgY29uc3QgcXVlcnkgPSBxdWVyeVN0cmluZy5zdWJzdHJpbmcoIDEgKTtcclxuICAgICAgcmV0dXJuIHF1ZXJ5LnNwbGl0KCAnJicgKTtcclxuICAgIH1cclxuICAgIHJldHVybiBbXTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBrZXkgdG8gcmV0dXJuIGlmIHByZXNlbnRcclxuICAgKiBAcGFyYW0gc3RyaW5nIC0gYSBVUkwgaW5jbHVkaW5nIGEgXCI/XCIgaWYgaXQgaGFzIGEgcXVlcnkgc3RyaW5nXHJcbiAgICogQHJldHVybnMgLSB0aGUgcXVlcnkgcGFyYW1ldGVyIGFzIGl0IGFwcGVhcnMgaW4gdGhlIFVSTCwgbGlrZSBga2V5PVZBTFVFYCwgb3IgbnVsbCBpZiBub3QgcHJlc2VudFxyXG4gICAqL1xyXG4gIGdldFNpbmdsZVF1ZXJ5UGFyYW1ldGVyU3RyaW5nOiBmdW5jdGlvbigga2V5OiBzdHJpbmcsIHN0cmluZzogc3RyaW5nICk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgY29uc3QgcXVlcnlTdHJpbmcgPSB0aGlzLmdldFF1ZXJ5U3RyaW5nKCBzdHJpbmcgKTtcclxuICAgIGNvbnN0IHF1ZXJ5UGFyYW1ldGVycyA9IHRoaXMuZ2V0UXVlcnlQYXJhbWV0ZXJzRnJvbVN0cmluZyggcXVlcnlTdHJpbmcgKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBxdWVyeVBhcmFtZXRlcnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHF1ZXJ5UGFyYW1ldGVyID0gcXVlcnlQYXJhbWV0ZXJzWyBpIF07XHJcbiAgICAgIGNvbnN0IGtleUFuZE1heWJlVmFsdWUgPSBxdWVyeVBhcmFtZXRlci5zcGxpdCggJz0nICk7XHJcblxyXG4gICAgICBpZiAoIGRlY29kZVVSSUNvbXBvbmVudCgga2V5QW5kTWF5YmVWYWx1ZVsgMCBdICkgPT09IGtleSApIHtcclxuICAgICAgICByZXR1cm4gcXVlcnlQYXJhbWV0ZXI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogUXVlcnkgc3RyaW5ncyBtYXkgc2hvdyB0aGUgc2FtZSBrZXkgYXBwZWFyaW5nIG11bHRpcGxlIHRpbWVzLCBzdWNoIGFzID92YWx1ZT0yJnZhbHVlPTMuXHJcbiAqIFRoaXMgbWV0aG9kIHJlY292ZXJzIGFsbCBvZiB0aGUgc3RyaW5nIHZhbHVlcy4gIEZvciB0aGlzIGV4YW1wbGUsIGl0IHdvdWxkIGJlIFsnMicsJzMnXS5cclxuICpcclxuICogQHBhcmFtIGtleSAtIHRoZSBrZXkgZm9yIHdoaWNoIHdlIGFyZSBmaW5kaW5nIHZhbHVlcy5cclxuICogQHBhcmFtIHN0cmluZyAtIHRoZSBwYXJhbWV0ZXJzIHN0cmluZ1xyXG4gKiBAcmV0dXJucyAtIHRoZSByZXN1bHRpbmcgdmFsdWVzLCBudWxsIGluZGljYXRlcyB0aGUgcXVlcnkgcGFyYW1ldGVyIGlzIHByZXNlbnQgd2l0aCBubyB2YWx1ZVxyXG4gKi9cclxuY29uc3QgZ2V0VmFsdWVzID0gZnVuY3Rpb24oIGtleTogc3RyaW5nLCBzdHJpbmc6IHN0cmluZyApOiBBcnJheTxJbnRlbnRpb25hbFFTTUFueSB8IG51bGw+IHtcclxuICBjb25zdCB2YWx1ZXMgPSBbXTtcclxuICBjb25zdCBwYXJhbXMgPSBzdHJpbmcuc2xpY2UoIDEgKS5zcGxpdCggJyYnICk7XHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgcGFyYW1zLmxlbmd0aDsgaSsrICkge1xyXG4gICAgY29uc3Qgc3BsaXRCeUVxdWFscyA9IHBhcmFtc1sgaSBdLnNwbGl0KCAnPScgKTtcclxuICAgIGNvbnN0IG5hbWUgPSBzcGxpdEJ5RXF1YWxzWyAwIF07XHJcbiAgICBjb25zdCB2YWx1ZSA9IHNwbGl0QnlFcXVhbHMuc2xpY2UoIDEgKS5qb2luKCAnPScgKTsgLy8gU3VwcG9ydCBhcmJpdHJhcnkgbnVtYmVyIG9mICc9JyBpbiB0aGUgdmFsdWVcclxuICAgIGlmICggbmFtZSA9PT0ga2V5ICkge1xyXG4gICAgICBpZiAoIHZhbHVlICkge1xyXG4gICAgICAgIHZhbHVlcy5wdXNoKCBkZWNvZGVVUklDb21wb25lbnQoIHZhbHVlICkgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB2YWx1ZXMucHVzaCggbnVsbCApOyAvLyBubyB2YWx1ZSBwcm92aWRlZFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiB2YWx1ZXM7XHJcbn07XHJcblxyXG4vLyBTY2hlbWEgdmFsaWRhdGlvbiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyB0aGUgc2NoZW1hIGZvciBhIHF1ZXJ5IHBhcmFtZXRlci5cclxuICogQHBhcmFtIGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIgbmFtZVxyXG4gKiBAcGFyYW0gc2NoZW1hIC0gc2NoZW1hIHRoYXQgZGVzY3JpYmVzIHRoZSBxdWVyeSBwYXJhbWV0ZXIsIHNlZSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0XHJcbiAqL1xyXG5jb25zdCB2YWxpZGF0ZVNjaGVtYSA9IGZ1bmN0aW9uKCBrZXk6IHN0cmluZywgc2NoZW1hOiBTY2hlbWEgKTogdm9pZCB7XHJcblxyXG4gIGNvbnN0IHNjaGVtYVR5cGUgPSBUWVBFU1sgc2NoZW1hLnR5cGUgXTtcclxuXHJcbiAgLy8gdHlwZSBpcyByZXF1aXJlZFxyXG4gIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggc2NoZW1hLmhhc093blByb3BlcnR5KCAndHlwZScgKSwgYHR5cGUgZmllbGQgaXMgcmVxdWlyZWQgZm9yIGtleTogJHtrZXl9YCApO1xyXG5cclxuICAvLyB0eXBlIGlzIHZhbGlkXHJcbiAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBUWVBFUy5oYXNPd25Qcm9wZXJ0eSggc2NoZW1hLnR5cGUgKSwgYGludmFsaWQgdHlwZTogJHtzY2hlbWEudHlwZX0gZm9yIGtleTogJHtrZXl9YCApO1xyXG5cclxuICAvLyBwYXJzZSBpcyBhIGZ1bmN0aW9uXHJcbiAgaWYgKCBoYXNPd25Qcm9wZXJ0eSggc2NoZW1hLCAncGFyc2UnICkgKSB7XHJcbiAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIHR5cGVvZiBzY2hlbWEucGFyc2UgPT09ICdmdW5jdGlvbicsIGBwYXJzZSBtdXN0IGJlIGEgZnVuY3Rpb24gZm9yIGtleTogJHtrZXl9YCApO1xyXG4gIH1cclxuXHJcbiAgLy8gdmFsaWRWYWx1ZXMgYW5kIGlzVmFsaWRWYWx1ZSBhcmUgb3B0aW9uYWwgYW5kIG11dHVhbGx5IGV4Y2x1c2l2ZVxyXG4gIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggISggc2NoZW1hLmhhc093blByb3BlcnR5KCAndmFsaWRWYWx1ZXMnICkgJiYgc2NoZW1hLmhhc093blByb3BlcnR5KCAnaXNWYWxpZFZhbHVlJyApICksXHJcbiAgICBgdmFsaWRWYWx1ZXMgYW5kIGlzVmFsaWRWYWx1ZSBhcmUgbXV0dWFsbHkgZXhjbHVzaXZlIGZvciBrZXk6ICR7a2V5fWAgKTtcclxuXHJcbiAgLy8gdmFsaWRWYWx1ZXMgaXMgYW4gQXJyYXlcclxuICBpZiAoIGhhc093blByb3BlcnR5KCBzY2hlbWEsICd2YWxpZFZhbHVlcycgKSApIHtcclxuICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggQXJyYXkuaXNBcnJheSggc2NoZW1hLnZhbGlkVmFsdWVzICksIGBpc1ZhbGlkVmFsdWUgbXVzdCBiZSBhbiBhcnJheSBmb3Iga2V5OiAke2tleX1gICk7XHJcbiAgfVxyXG5cclxuICAvLyBpc1ZhbGlkVmFsdWUgaXMgYSBmdW5jdGlvblxyXG4gIGlmICggaGFzT3duUHJvcGVydHkoIHNjaGVtYSwgJ2lzVmFsaWRWYWx1ZScgKSApIHtcclxuICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggdHlwZW9mIHNjaGVtYS5pc1ZhbGlkVmFsdWUgPT09ICdmdW5jdGlvbicsIGBpc1ZhbGlkVmFsdWUgbXVzdCBiZSBhIGZ1bmN0aW9uIGZvciBrZXk6ICR7a2V5fWAgKTtcclxuICB9XHJcblxyXG4gIC8vIGRlZmF1bHRWYWx1ZSBoYXMgdGhlIGNvcnJlY3QgdHlwZVxyXG4gIGlmICggaGFzT3duUHJvcGVydHkoIHNjaGVtYSwgJ2RlZmF1bHRWYWx1ZScgKSApIHtcclxuICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggc2NoZW1hVHlwZS5pc1ZhbGlkVmFsdWUoIHNjaGVtYS5kZWZhdWx0VmFsdWUgKSwgYGRlZmF1bHRWYWx1ZSBpbmNvcnJlY3QgdHlwZTogJHtrZXl9YCApO1xyXG4gIH1cclxuXHJcbiAgLy8gdmFsaWRWYWx1ZXMgaGF2ZSB0aGUgY29ycmVjdCB0eXBlXHJcbiAgaWYgKCBoYXNPd25Qcm9wZXJ0eSggc2NoZW1hLCAndmFsaWRWYWx1ZXMnICkgKSB7XHJcbiAgICAoIHNjaGVtYS52YWxpZFZhbHVlcyBhcyBJbnRlbnRpb25hbFFTTUFueVtdICkuZm9yRWFjaCggdmFsdWUgPT4gcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBzY2hlbWFUeXBlLmlzVmFsaWRWYWx1ZSggdmFsdWUgKSwgYHZhbGlkVmFsdWUgaW5jb3JyZWN0IHR5cGUgZm9yIGtleTogJHtrZXl9YCApICk7XHJcbiAgfVxyXG5cclxuICAvLyBkZWZhdWx0VmFsdWUgaXMgYSBtZW1iZXIgb2YgdmFsaWRWYWx1ZXNcclxuICBpZiAoIGhhc093blByb3BlcnR5KCBzY2hlbWEsICdkZWZhdWx0VmFsdWUnICkgJiYgaGFzT3duUHJvcGVydHkoIHNjaGVtYSwgJ3ZhbGlkVmFsdWVzJyApICkge1xyXG4gICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBpc1ZhbGlkVmFsdWUoIHNjaGVtYS5kZWZhdWx0VmFsdWUsIHNjaGVtYS52YWxpZFZhbHVlcyBhcyBJbnRlbnRpb25hbFFTTUFueVtdICksXHJcbiAgICAgIGBkZWZhdWx0VmFsdWUgbXVzdCBiZSBhIG1lbWJlciBvZiB2YWxpZFZhbHVlcywgZm9yIGtleTogJHtrZXl9YCApO1xyXG4gIH1cclxuXHJcbiAgLy8gZGVmYXVsdFZhbHVlIG11c3QgZXhpc3QgZm9yIGEgcHVibGljIHNjaGVtYSBzbyB0aGVyZSdzIGEgZmFsbGJhY2sgaW4gY2FzZSBhIHVzZXIgcHJvdmlkZXMgYW4gaW52YWxpZCB2YWx1ZS5cclxuICAvLyBIb3dldmVyLCBkZWZhdWx0VmFsdWUgaXMgbm90IHJlcXVpcmVkIGZvciBmbGFncyBzaW5jZSB0aGV5J3JlIG9ubHkgYSBrZXkuIFdoaWxlIG1hcmtpbmcgYSBmbGFnIGFzIHB1YmxpYzogdHJ1ZVxyXG4gIC8vIGRvZXNuJ3QgY2hhbmdlIGl0cyBiZWhhdmlvciwgaXQncyBhbGxvd2VkIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGUgcHVibGljIGtleSBmb3IgZG9jdW1lbnRhdGlvbiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xdWVyeS1zdHJpbmctbWFjaGluZS9pc3N1ZXMvNDFcclxuICBpZiAoIGhhc093blByb3BlcnR5KCBzY2hlbWEsICdwdWJsaWMnICkgJiYgc2NoZW1hLnB1YmxpYyAmJiBzY2hlbWEudHlwZSAhPT0gJ2ZsYWcnICkge1xyXG4gICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICdkZWZhdWx0VmFsdWUnICksIGBkZWZhdWx0VmFsdWUgaXMgcmVxdWlyZWQgd2hlbiBwdWJsaWM6IHRydWUgZm9yIGtleTogJHtrZXl9YCApO1xyXG4gIH1cclxuXHJcbiAgLy8gdmVyaWZ5IHRoYXQgdGhlIHNjaGVtYSBoYXMgYXBwcm9wcmlhdGUgcHJvcGVydGllc1xyXG4gIHZhbGlkYXRlU2NoZW1hUHJvcGVydGllcygga2V5LCBzY2hlbWEsIHNjaGVtYVR5cGUucmVxdWlyZWQsIHNjaGVtYVR5cGUub3B0aW9uYWwgKTtcclxuXHJcbiAgaWYgKCBzY2hlbWEudHlwZSA9PT0gJ2FycmF5JyApIHtcclxuICAgIHZhbGlkYXRlQXJyYXlTY2hlbWEoIGtleSwgc2NoZW1hICk7XHJcbiAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBzY2hlbWEgZm9yIHR5cGUgJ2FycmF5Jy5cclxuICogQHBhcmFtIGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIgbmFtZVxyXG4gKiBAcGFyYW0gc2NoZW1hIC0gc2NoZW1hIHRoYXQgZGVzY3JpYmVzIHRoZSBxdWVyeSBwYXJhbWV0ZXIsIHNlZSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0XHJcbiAqL1xyXG5jb25zdCB2YWxpZGF0ZUFycmF5U2NoZW1hID0gZnVuY3Rpb24oIGtleTogc3RyaW5nLCBzY2hlbWE6IEFycmF5U2NoZW1hICk6IHZvaWQge1xyXG5cclxuICAvLyBzZXBhcmF0b3IgaXMgYSBzaW5nbGUgY2hhcmFjdGVyXHJcbiAgaWYgKCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICdzZXBhcmF0b3InICkgKSB7XHJcbiAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIHR5cGVvZiBzY2hlbWEuc2VwYXJhdG9yID09PSAnc3RyaW5nJyAmJiBzY2hlbWEuc2VwYXJhdG9yLmxlbmd0aCA9PT0gMSwgYGludmFsaWQgc2VwYXJhdG9yOiAke3NjaGVtYS5zZXBhcmF0b3J9LCBmb3Iga2V5OiAke2tleX1gICk7XHJcbiAgfVxyXG5cclxuICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoICFzY2hlbWEuZWxlbWVudFNjaGVtYS5oYXNPd25Qcm9wZXJ0eSggJ3B1YmxpYycgKSwgJ0FycmF5IGVsZW1lbnRzIHNob3VsZCBub3QgZGVjbGFyZSBwdWJsaWM7IGl0IGNvbWVzIGZyb20gdGhlIGFycmF5IHNjaGVtYSBpdHNlbGYuJyApO1xyXG5cclxuICAvLyB2YWxpZGF0ZSBlbGVtZW50U2NoZW1hXHJcbiAgdmFsaWRhdGVTY2hlbWEoIGAke2tleX0uZWxlbWVudGAsIHNjaGVtYS5lbGVtZW50U2NoZW1hICk7XHJcbn07XHJcblxyXG4vKipcclxuICogVmVyaWZpZXMgdGhhdCBhIHNjaGVtYSBjb250YWlucyBvbmx5IHN1cHBvcnRlZCBwcm9wZXJ0aWVzLCBhbmQgY29udGFpbnMgYWxsIHJlcXVpcmVkIHByb3BlcnRpZXMuXHJcbiAqIEBwYXJhbSBrZXkgLSB0aGUgcXVlcnkgcGFyYW1ldGVyIG5hbWVcclxuICogQHBhcmFtIHNjaGVtYSAtIHNjaGVtYSB0aGF0IGRlc2NyaWJlcyB0aGUgcXVlcnkgcGFyYW1ldGVyLCBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldFxyXG4gKiBAcGFyYW0gcmVxdWlyZWRQcm9wZXJ0aWVzIC0gcHJvcGVydGllcyB0aGF0IHRoZSBzY2hlbWEgbXVzdCBoYXZlXHJcbiAqIEBwYXJhbSBvcHRpb25hbFByb3BlcnRpZXMgLSBwcm9wZXJ0aWVzIHRoYXQgdGhlIHNjaGVtYSBtYXkgb3B0aW9uYWxseSBoYXZlXHJcbiAqL1xyXG5jb25zdCB2YWxpZGF0ZVNjaGVtYVByb3BlcnRpZXMgPSBmdW5jdGlvbigga2V5OiBzdHJpbmcsIHNjaGVtYTogU2NoZW1hLCByZXF1aXJlZFByb3BlcnRpZXM6IHN0cmluZ1tdLCBvcHRpb25hbFByb3BlcnRpZXM6IHN0cmluZ1tdICk6IHZvaWQge1xyXG5cclxuICAvLyB7c3RyaW5nW119LCB0aGUgbmFtZXMgb2YgdGhlIHByb3BlcnRpZXMgaW4gdGhlIHNjaGVtYVxyXG4gIGNvbnN0IHNjaGVtYVByb3BlcnRpZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyggc2NoZW1hICk7XHJcblxyXG4gIC8vIHZlcmlmeSB0aGF0IGFsbCByZXF1aXJlZCBwcm9wZXJ0aWVzIGFyZSBwcmVzZW50XHJcbiAgcmVxdWlyZWRQcm9wZXJ0aWVzLmZvckVhY2goIHByb3BlcnR5ID0+IHtcclxuICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggc2NoZW1hUHJvcGVydGllcy5pbmNsdWRlcyggcHJvcGVydHkgKSwgYG1pc3NpbmcgcmVxdWlyZWQgcHJvcGVydHk6ICR7cHJvcGVydHl9IGZvciBrZXk6ICR7a2V5fWAgKTtcclxuICB9ICk7XHJcblxyXG4gIC8vIHZlcmlmeSB0aGF0IHRoZXJlIGFyZSBubyB1bnN1cHBvcnRlZCBwcm9wZXJ0aWVzXHJcbiAgY29uc3Qgc3VwcG9ydGVkUHJvcGVydGllcyA9IHJlcXVpcmVkUHJvcGVydGllcy5jb25jYXQoIG9wdGlvbmFsUHJvcGVydGllcyApO1xyXG4gIHNjaGVtYVByb3BlcnRpZXMuZm9yRWFjaCggcHJvcGVydHkgPT4ge1xyXG4gICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBwcm9wZXJ0eSA9PT0gJ3R5cGUnIHx8IHN1cHBvcnRlZFByb3BlcnRpZXMuaW5jbHVkZXMoIHByb3BlcnR5ICksIGB1bnN1cHBvcnRlZCBwcm9wZXJ0eTogJHtwcm9wZXJ0eX0gZm9yIGtleTogJHtrZXl9YCApO1xyXG4gIH0gKTtcclxufTtcclxuXHJcbi8vIFBhcnNpbmcgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4vKipcclxuICogVXNlcyB0aGUgc3VwcGxpZWQgc2NoZW1hIHRvIGNvbnZlcnQgcXVlcnkgcGFyYW1ldGVyIHZhbHVlKHMpIGZyb20gc3RyaW5nIHRvIHRoZSBkZXNpcmVkIHZhbHVlIHR5cGUuXHJcbiAqIEBwYXJhbSBrZXkgLSB0aGUgcXVlcnkgcGFyYW1ldGVyIG5hbWVcclxuICogQHBhcmFtIHNjaGVtYSAtIHNjaGVtYSB0aGF0IGRlc2NyaWJlcyB0aGUgcXVlcnkgcGFyYW1ldGVyLCBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldFxyXG4gKiBAcGFyYW0gdmFsdWVzIC0gYW55IG1hdGNoZXMgZnJvbSB0aGUgcXVlcnkgc3RyaW5nLFxyXG4gKiAgIGNvdWxkIGJlIG11bHRpcGxlIGZvciA/dmFsdWU9eCZ2YWx1ZT15IGZvciBleGFtcGxlXHJcbiAqIEByZXR1cm5zIHRoZSBhc3NvY2lhdGVkIHZhbHVlLCBjb252ZXJ0ZWQgdG8gdGhlIHByb3BlciB0eXBlXHJcbiAqL1xyXG5jb25zdCBwYXJzZVZhbHVlcyA9IGZ1bmN0aW9uIDxTIGV4dGVuZHMgU2NoZW1hPigga2V5OiBzdHJpbmcsIHNjaGVtYTogUywgdmFsdWVzOiBBcnJheTxVbnBhcnNlZFZhbHVlPiApOiBQYXJzZWRWYWx1ZTxTPiB7XHJcbiAgbGV0IHJldHVyblZhbHVlO1xyXG5cclxuICAvLyB2YWx1ZXMgY29udGFpbnMgdmFsdWVzIGZvciBhbGwgb2NjdXJyZW5jZXMgb2YgdGhlIHF1ZXJ5IHBhcmFtZXRlci4gIFdlIGN1cnJlbnRseSBzdXBwb3J0IG9ubHkgMSBvY2N1cnJlbmNlLlxyXG4gIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggdmFsdWVzLmxlbmd0aCA8PSAxLCBgcXVlcnkgcGFyYW1ldGVyIGNhbm5vdCBvY2N1ciBtdWx0aXBsZSB0aW1lczogJHtrZXl9YCApO1xyXG5cclxuICBpZiAoIHNjaGVtYS50eXBlID09PSAnZmxhZycgKSB7XHJcblxyXG4gICAgLy8gZmxhZyBpcyBhIGNvbnZlbmllbnQgdmFyaWF0aW9uIG9mIGJvb2xlYW4sIHdoaWNoIGRlcGVuZHMgb24gd2hldGhlciB0aGUgcXVlcnkgc3RyaW5nIGlzIHByZXNlbnQgb3Igbm90XHJcbiAgICBjb25zdCB0eXBlID0gVFlQRVNbIHNjaGVtYS50eXBlIF07XHJcbiAgICByZXR1cm5WYWx1ZSA9IHR5cGUucGFyc2UoIGtleSwgc2NoZW1hLCB2YWx1ZXNbIDAgXSApO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggdmFsdWVzWyAwIF0gIT09IHVuZGVmaW5lZCB8fCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICdkZWZhdWx0VmFsdWUnICksXHJcbiAgICAgIGBtaXNzaW5nIHJlcXVpcmVkIHF1ZXJ5IHBhcmFtZXRlcjogJHtrZXl9YCApO1xyXG4gICAgaWYgKCB2YWx1ZXNbIDAgXSA9PT0gdW5kZWZpbmVkICkge1xyXG5cclxuICAgICAgLy8gbm90IGluIHRoZSBxdWVyeSBzdHJpbmcsIHVzZSB0aGUgZGVmYXVsdFxyXG4gICAgICByZXR1cm5WYWx1ZSA9IHNjaGVtYS5kZWZhdWx0VmFsdWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIGNvbnN0IHR5cGUgPSBUWVBFU1sgc2NoZW1hLnR5cGUgXTtcclxuICAgICAgLy8gZGlzcGF0Y2ggcGFyc2luZyBvZiBxdWVyeSBzdHJpbmcgdG8gYSB0eXBlLXNwZWNpZmljIGZ1bmN0aW9uXHJcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBzY2hlbWEgY2Fubm90IGJlIGdpdmVuIHRoZSBleGFjdCB0eXBlIGJhc2VkIG9uIHRoZSBzcGVjaWZpYyB2YWx1ZSBvZiBzY2hlbWEudHlwZVxyXG4gICAgICByZXR1cm5WYWx1ZSA9IHR5cGUucGFyc2UoIGtleSwgc2NoZW1hLCB2YWx1ZXNbIDAgXSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJldHVyblZhbHVlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFBhcnNlcyB0aGUgdmFsdWUgZm9yIGEgdHlwZSAnZmxhZycuXHJcbiAqIEBwYXJhbSBrZXkgLSB0aGUgcXVlcnkgcGFyYW1ldGVyIG5hbWVcclxuICogQHBhcmFtIHNjaGVtYSAtIHNjaGVtYSB0aGF0IGRlc2NyaWJlcyB0aGUgcXVlcnkgcGFyYW1ldGVyLCBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldFxyXG4gKiBAcGFyYW0gdmFsdWUgLSB2YWx1ZSBmcm9tIHRoZSBxdWVyeSBwYXJhbWV0ZXIgc3RyaW5nXHJcbiAqL1xyXG5jb25zdCBwYXJzZUZsYWcgPSBmdW5jdGlvbigga2V5OiBzdHJpbmcsIHNjaGVtYTogRmxhZ1NjaGVtYSwgdmFsdWU6IFVucGFyc2VkVmFsdWUgKTogYm9vbGVhbiB8IHN0cmluZyB7XHJcbiAgcmV0dXJuIHZhbHVlID09PSBudWxsID8gdHJ1ZSA6IHZhbHVlID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IHZhbHVlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFBhcnNlcyB0aGUgdmFsdWUgZm9yIGEgdHlwZSAnYm9vbGVhbicuXHJcbiAqIEBwYXJhbSBrZXkgLSB0aGUgcXVlcnkgcGFyYW1ldGVyIG5hbWVcclxuICogQHBhcmFtIHNjaGVtYSAtIHNjaGVtYSB0aGF0IGRlc2NyaWJlcyB0aGUgcXVlcnkgcGFyYW1ldGVyLCBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldFxyXG4gKiBAcGFyYW0gc3RyaW5nIC0gdmFsdWUgZnJvbSB0aGUgcXVlcnkgcGFyYW1ldGVyIHN0cmluZ1xyXG4gKi9cclxuY29uc3QgcGFyc2VCb29sZWFuID0gZnVuY3Rpb24oIGtleTogc3RyaW5nLCBzY2hlbWE6IEJvb2xlYW5TY2hlbWEsIHN0cmluZzogVW5wYXJzZWRWYWx1ZSApOiBib29sZWFuIHwgc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCB7XHJcbiAgcmV0dXJuIHN0cmluZyA9PT0gJ3RydWUnID8gdHJ1ZSA6IHN0cmluZyA9PT0gJ2ZhbHNlJyA/IGZhbHNlIDogc3RyaW5nO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFBhcnNlcyB0aGUgdmFsdWUgZm9yIGEgdHlwZSAnbnVtYmVyJy5cclxuICogQHBhcmFtIGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIgbmFtZVxyXG4gKiBAcGFyYW0gc2NoZW1hIC0gc2NoZW1hIHRoYXQgZGVzY3JpYmVzIHRoZSBxdWVyeSBwYXJhbWV0ZXIsIHNlZSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0XHJcbiAqIEBwYXJhbSBzdHJpbmcgLSB2YWx1ZSBmcm9tIHRoZSBxdWVyeSBwYXJhbWV0ZXIgc3RyaW5nXHJcbiAqL1xyXG5jb25zdCBwYXJzZU51bWJlciA9IGZ1bmN0aW9uKCBrZXk6IHN0cmluZywgc2NoZW1hOiBOdW1iZXJTY2hlbWEsIHN0cmluZzogVW5wYXJzZWRWYWx1ZSApOiBudW1iZXIgfCBVbnBhcnNlZFZhbHVlIHtcclxuICBjb25zdCBudW1iZXIgPSBOdW1iZXIoIHN0cmluZyApO1xyXG4gIHJldHVybiBzdHJpbmcgPT09IG51bGwgfHwgaXNOYU4oIG51bWJlciApID8gc3RyaW5nIDogbnVtYmVyO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFBhcnNlcyB0aGUgdmFsdWUgZm9yIGEgdHlwZSAnbnVtYmVyJy5cclxuICogVGhlIHZhbHVlIHRvIGJlIHBhcnNlZCBpcyBhbHJlYWR5IHN0cmluZywgc28gaXQgaXMgZ3VhcmFudGVlZCB0byBwYXJzZSBhcyBhIHN0cmluZy5cclxuICogQHBhcmFtIGtleVxyXG4gKiBAcGFyYW0gc2NoZW1hXHJcbiAqIEBwYXJhbSBzdHJpbmdcclxuICovXHJcbmNvbnN0IHBhcnNlU3RyaW5nID0gZnVuY3Rpb24oIGtleTogc3RyaW5nLCBzY2hlbWE6IFN0cmluZ1NjaGVtYSwgc3RyaW5nOiBVbnBhcnNlZFZhbHVlICk6IFVucGFyc2VkVmFsdWUge1xyXG4gIHJldHVybiBzdHJpbmc7XHJcbn07XHJcblxyXG4vKipcclxuICogUGFyc2VzIHRoZSB2YWx1ZSBmb3IgYSB0eXBlICdhcnJheScuXHJcbiAqIEBwYXJhbSBrZXkgLSB0aGUgcXVlcnkgcGFyYW1ldGVyIG5hbWVcclxuICogQHBhcmFtIHNjaGVtYSAtIHNjaGVtYSB0aGF0IGRlc2NyaWJlcyB0aGUgcXVlcnkgcGFyYW1ldGVyLCBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldFxyXG4gKiBAcGFyYW0gdmFsdWUgLSB2YWx1ZSBmcm9tIHRoZSBxdWVyeSBwYXJhbWV0ZXIgc3RyaW5nXHJcbiAqL1xyXG5jb25zdCBwYXJzZUFycmF5ID0gZnVuY3Rpb24oIGtleTogc3RyaW5nLCBzY2hlbWE6IEFycmF5U2NoZW1hLCB2YWx1ZTogVW5wYXJzZWRWYWx1ZSApOiBBcnJheTxJbnRlbnRpb25hbFFTTUFueT4ge1xyXG5cclxuICBsZXQgcmV0dXJuVmFsdWU7XHJcblxyXG4gIGlmICggdmFsdWUgPT09IG51bGwgKSB7XHJcblxyXG4gICAgLy8gbnVsbCBzaWduaWZpZXMgYW4gZW1wdHkgYXJyYXkuIEZvciBpbnN0YW5jZSA/c2NyZWVucz0gd291bGQgZ2l2ZSBbXVxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xdWVyeS1zdHJpbmctbWFjaGluZS9pc3N1ZXMvMTdcclxuICAgIHJldHVyblZhbHVlID0gW107XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG5cclxuICAgIC8vIFNwbGl0IHVwIHRoZSBzdHJpbmcgaW50byBhbiBhcnJheSBvZiB2YWx1ZXMuIEUuZy4gP3NjcmVlbnM9MSwyIHdvdWxkIGdpdmUgWzEsMl1cclxuICAgIHJldHVyblZhbHVlID0gdmFsdWUhLnNwbGl0KCBzY2hlbWEuc2VwYXJhdG9yIHx8IERFRkFVTFRfU0VQQVJBVE9SIClcclxuICAgICAgLm1hcCggZWxlbWVudCA9PiBwYXJzZVZhbHVlcygga2V5LCBzY2hlbWEuZWxlbWVudFNjaGVtYSwgWyBlbGVtZW50IF0gKSApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJldHVyblZhbHVlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFBhcnNlcyB0aGUgdmFsdWUgZm9yIGEgdHlwZSAnY3VzdG9tJy5cclxuICogQHBhcmFtIGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIgbmFtZVxyXG4gKiBAcGFyYW0gc2NoZW1hIC0gc2NoZW1hIHRoYXQgZGVzY3JpYmVzIHRoZSBxdWVyeSBwYXJhbWV0ZXIsIHNlZSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0XHJcbiAqIEBwYXJhbSB2YWx1ZSAtIHZhbHVlIGZyb20gdGhlIHF1ZXJ5IHBhcmFtZXRlciBzdHJpbmdcclxuICovXHJcbmNvbnN0IHBhcnNlQ3VzdG9tID0gZnVuY3Rpb24oIGtleTogc3RyaW5nLCBzY2hlbWE6IEN1c3RvbVNjaGVtYSwgdmFsdWU6IFVucGFyc2VkVmFsdWUgKTogSW50ZW50aW9uYWxRU01Bbnkge1xyXG4gIHJldHVybiBzY2hlbWEucGFyc2UoIHZhbHVlIGFzIHVua25vd24gYXMgc3RyaW5nICk7XHJcbn07XHJcblxyXG4vLyBVdGlsaXRpZXMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuLyoqXHJcbiAqIERldGVybWluZXMgaWYgdmFsdWUgaXMgaW4gYSBzZXQgb2YgdmFsaWQgdmFsdWVzLCB1c2VzIGRlZXAgY29tcGFyaXNvbi5cclxuICovXHJcbmNvbnN0IGlzVmFsaWRWYWx1ZSA9IGZ1bmN0aW9uKCB2YWx1ZTogSW50ZW50aW9uYWxRU01BbnksIHZhbGlkVmFsdWVzOiBJbnRlbnRpb25hbFFTTUFueVtdICk6IGJvb2xlYW4ge1xyXG4gIGxldCBmb3VuZCA9IGZhbHNlO1xyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IHZhbGlkVmFsdWVzLmxlbmd0aCAmJiAhZm91bmQ7IGkrKyApIHtcclxuICAgIGZvdW5kID0gUXVlcnlTdHJpbmdNYWNoaW5lLmRlZXBFcXVhbHMoIHZhbGlkVmFsdWVzWyBpIF0sIHZhbHVlICk7XHJcbiAgfVxyXG4gIHJldHVybiBmb3VuZDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBRdWVyeSBwYXJhbWV0ZXJzIGFyZSBzcGVjaWZpZWQgYnkgdGhlIHVzZXIsIGFuZCBhcmUgb3V0c2lkZSB0aGUgY29udHJvbCBvZiB0aGUgcHJvZ3JhbW1lci5cclxuICogU28gdGhlIGFwcGxpY2F0aW9uIHNob3VsZCB0aHJvdyBhbiBFcnJvciBpZiBxdWVyeSBwYXJhbWV0ZXJzIGFyZSBpbnZhbGlkLlxyXG4gKiBAcGFyYW0gcHJlZGljYXRlIC0gaWYgcHJlZGljYXRlIGV2YWx1YXRlcyB0byBmYWxzZSwgYW4gRXJyb3IgaXMgdGhyb3duXHJcbiAqIEBwYXJhbSBtZXNzYWdlXHJcbiAqL1xyXG5jb25zdCBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQgPSBmdW5jdGlvbiggcHJlZGljYXRlOiBib29sZWFuLCBtZXNzYWdlOiBzdHJpbmcgKTogdm9pZCB7XHJcbiAgaWYgKCAhcHJlZGljYXRlICkge1xyXG4gICAgY29uc29sZSAmJiBjb25zb2xlLmxvZyAmJiBjb25zb2xlLmxvZyggbWVzc2FnZSApO1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCBgUXVlcnkgU3RyaW5nIE1hY2hpbmUgQXNzZXJ0aW9uIGZhaWxlZDogJHttZXNzYWdlfWAgKTtcclxuICB9XHJcbn07XHJcblxyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxudHlwZSBTY2hlbWFUeXBlPFQsIFNwZWNpZmljU2NoZW1hIGV4dGVuZHMgU2NoZW1hPiA9IHtcclxuICByZXF1aXJlZDogQXJyYXk8a2V5b2YgU3BlY2lmaWNTY2hlbWE+O1xyXG4gIG9wdGlvbmFsOiBBcnJheTxrZXlvZiBTcGVjaWZpY1NjaGVtYT47XHJcbiAgdmFsaWRhdGVTY2hlbWE/OiAoICgga2V5OiBzdHJpbmcsIHNjaGVtYTogU3BlY2lmaWNTY2hlbWEgKSA9PiB2b2lkICk7XHJcblxyXG4gIC8vIHBhcnNlKCkgd2lsbCBhdHRlbXB0IHRvIHBhcnNlIHRoZSB2YWx1ZSBpbnRvIHRoZSByaWdodCB0eXBlLCBidXQgZG9lcyBub3QgaGFuZGxlIGFsbCBwb3NzaWJsZSBpbnB1dHMuIEluc3RlYWQsIHNvbWVcclxuICAvLyBpbmNvcnJlY3QgdmFsdWVzIHdpbGwgcGFzcyB0aHJvdWdoIHRvIGxhdGVyIHZhbGlkYXRpb24gKGxpa2UgaXNWYWxpZFZhbHVlKSB0byBlcnJvciBvdXQuXHJcbiAgcGFyc2U6ICgga2V5OiBzdHJpbmcsIHNjaGVtYTogU3BlY2lmaWNTY2hlbWEsIHZhbHVlOiBVbnBhcnNlZFZhbHVlICkgPT4gVCB8IFVucGFyc2VkVmFsdWU7XHJcbiAgaXNWYWxpZFZhbHVlOiAoIHZhbHVlOiBJbnRlbnRpb25hbFFTTUFueSApID0+IGJvb2xlYW47XHJcbiAgZGVmYXVsdFZhbHVlPzogVDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBEYXRhIHN0cnVjdHVyZSB0aGF0IGRlc2NyaWJlcyBlYWNoIHF1ZXJ5IHBhcmFtZXRlciB0eXBlLCB3aGljaCBwcm9wZXJ0aWVzIGFyZSByZXF1aXJlZCB2cyBvcHRpb25hbCxcclxuICogaG93IHRvIHZhbGlkYXRlLCBhbmQgaG93IHRvIHBhcnNlLlxyXG4gKlxyXG4gKiBUaGUgcHJvcGVydGllcyB0aGF0IGFyZSByZXF1aXJlZCBvciBvcHRpb25hbCBkZXBlbmQgb24gdGhlIHR5cGUgKHNlZSBUWVBFUyksIGFuZCBpbmNsdWRlOlxyXG4gKiB0eXBlIC0ge3N0cmluZ30gdGhlIHR5cGUgbmFtZVxyXG4gKiBkZWZhdWx0VmFsdWUgLSB0aGUgdmFsdWUgdG8gdXNlIGlmIG5vIHF1ZXJ5IHBhcmFtZXRlciBpcyBwcm92aWRlZC4gSWYgdGhlcmUgaXMgbm8gZGVmYXVsdFZhbHVlLCB0aGVuXHJcbiAqICAgIHRoZSBxdWVyeSBwYXJhbWV0ZXIgaXMgcmVxdWlyZWQgaW4gdGhlIHF1ZXJ5IHN0cmluZzsgb21pdHRpbmcgdGhlIHF1ZXJ5IHBhcmFtZXRlciB3aWxsIHJlc3VsdCBpbiBhbiBFcnJvci5cclxuICogdmFsaWRWYWx1ZXMgLSBhcnJheSBvZiB0aGUgdmFsaWQgdmFsdWVzIGZvciB0aGUgcXVlcnkgcGFyYW1ldGVyXHJcbiAqIGlzVmFsaWRWYWx1ZSAtIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYSBwYXJzZWQgT2JqZWN0IChub3Qgc3RyaW5nKSBhbmQgY2hlY2tzIGlmIGl0IGlzIGFjY2VwdGFibGVcclxuICogZWxlbWVudFNjaGVtYSAtIHNwZWNpZmllcyB0aGUgc2NoZW1hIGZvciBlbGVtZW50cyBpbiBhbiBhcnJheVxyXG4gKiBzZXBhcmF0b3IgLSAgYXJyYXkgZWxlbWVudHMgYXJlIHNlcGFyYXRlZCBieSB0aGlzIHN0cmluZywgZGVmYXVsdHMgdG8gYCxgXHJcbiAqIHBhcnNlIC0gYSBmdW5jdGlvbiB0aGF0IHRha2VzIGEgc3RyaW5nIGFuZCByZXR1cm5zIGFuIE9iamVjdFxyXG4gKi9cclxuY29uc3QgVFlQRVMgPSB7XHJcbiAgLy8gTk9URTogVHlwZXMgZm9yIHRoaXMgYXJlIGN1cnJlbnRseSBpbiBwaGV0LXR5cGVzLmQudHMhIENoYW5nZXMgaGVyZSBzaG91bGQgYmUgbWFkZSB0aGVyZSBhbHNvXHJcblxyXG4gIC8vIHZhbHVlIGlzIHRydWUgaWYgcHJlc2VudCwgZmFsc2UgaWYgYWJzZW50XHJcbiAgZmxhZzoge1xyXG4gICAgcmVxdWlyZWQ6IFtdLFxyXG4gICAgb3B0aW9uYWw6IFsgJ3ByaXZhdGUnLCAncHVibGljJyBdLFxyXG4gICAgcGFyc2U6IHBhcnNlRmxhZyxcclxuICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gdmFsdWUgPT09IHRydWUgfHwgdmFsdWUgPT09IGZhbHNlLFxyXG4gICAgZGVmYXVsdFZhbHVlOiB0cnVlIC8vIG9ubHkgbmVlZGVkIGZvciBmbGFncyBtYXJrcyBhcyAncHVibGljOiB0cnVlYFxyXG4gIH0gc2F0aXNmaWVzIFNjaGVtYVR5cGU8Ym9vbGVhbiwgRmxhZ1NjaGVtYT4sXHJcblxyXG4gIC8vIHZhbHVlIGlzIGVpdGhlciB0cnVlIG9yIGZhbHNlLCBlLmcuIHNob3dBbnN3ZXI9dHJ1ZVxyXG4gIGJvb2xlYW46IHtcclxuICAgIHJlcXVpcmVkOiBbXSxcclxuICAgIG9wdGlvbmFsOiBbICdkZWZhdWx0VmFsdWUnLCAncHJpdmF0ZScsICdwdWJsaWMnIF0sXHJcbiAgICBwYXJzZTogcGFyc2VCb29sZWFuLFxyXG4gICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiB2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gZmFsc2VcclxuICB9IHNhdGlzZmllcyBTY2hlbWFUeXBlPGJvb2xlYW4sIEJvb2xlYW5TY2hlbWE+LFxyXG5cclxuICAvLyB2YWx1ZSBpcyBhIG51bWJlciwgZS5nLiBmcmFtZVJhdGU9MTAwXHJcbiAgbnVtYmVyOiB7XHJcbiAgICByZXF1aXJlZDogW10sXHJcbiAgICBvcHRpb25hbDogWyAnZGVmYXVsdFZhbHVlJywgJ3ZhbGlkVmFsdWVzJywgJ2lzVmFsaWRWYWx1ZScsICdwcml2YXRlJywgJ3B1YmxpYycgXSxcclxuICAgIHBhcnNlOiBwYXJzZU51bWJlcixcclxuICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiAhaXNOYU4oIHZhbHVlIClcclxuICB9IHNhdGlzZmllcyBTY2hlbWFUeXBlPG51bWJlciwgTnVtYmVyU2NoZW1hPixcclxuXHJcbiAgLy8gdmFsdWUgaXMgYSBzdHJpbmcsIGUuZy4gbmFtZT1SaW5nb1xyXG4gIHN0cmluZzoge1xyXG4gICAgcmVxdWlyZWQ6IFtdLFxyXG4gICAgb3B0aW9uYWw6IFsgJ2RlZmF1bHRWYWx1ZScsICd2YWxpZFZhbHVlcycsICdpc1ZhbGlkVmFsdWUnLCAncHJpdmF0ZScsICdwdWJsaWMnIF0sXHJcbiAgICBwYXJzZTogcGFyc2VTdHJpbmcsXHJcbiAgICBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+IHZhbHVlID09PSBudWxsIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZydcclxuICB9IHNhdGlzZmllcyBTY2hlbWFUeXBlPFN0cmluZ1R5cGUsIFN0cmluZ1NjaGVtYT4sXHJcblxyXG4gIC8vIHZhbHVlIGlzIGFuIGFycmF5LCBlLmcuIHNjcmVlbnM9MSwyLDNcclxuICBhcnJheToge1xyXG4gICAgcmVxdWlyZWQ6IFsgJ2VsZW1lbnRTY2hlbWEnIF0sXHJcbiAgICBvcHRpb25hbDogWyAnZGVmYXVsdFZhbHVlJywgJ3ZhbGlkVmFsdWVzJywgJ2lzVmFsaWRWYWx1ZScsICdzZXBhcmF0b3InLCAndmFsaWRWYWx1ZXMnLCAncHJpdmF0ZScsICdwdWJsaWMnIF0sXHJcbiAgICBwYXJzZTogcGFyc2VBcnJheSxcclxuICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gQXJyYXkuaXNBcnJheSggdmFsdWUgKSB8fCB2YWx1ZSA9PT0gbnVsbFxyXG4gIH0gc2F0aXNmaWVzIFNjaGVtYVR5cGU8SW50ZW50aW9uYWxRU01BbnlbXSwgQXJyYXlTY2hlbWE+LFxyXG5cclxuICAvLyB2YWx1ZSBpcyBhIGN1c3RvbSBkYXRhIHR5cGUsIGUuZy4gY29sb3I9MjU1LDAsMjU1XHJcbiAgY3VzdG9tOiB7XHJcbiAgICByZXF1aXJlZDogWyAncGFyc2UnIF0sXHJcbiAgICBvcHRpb25hbDogWyAnZGVmYXVsdFZhbHVlJywgJ3ZhbGlkVmFsdWVzJywgJ2lzVmFsaWRWYWx1ZScsICdwcml2YXRlJywgJ3B1YmxpYycgXSxcclxuICAgIHBhcnNlOiBwYXJzZUN1c3RvbSxcclxuICAgIGlzVmFsaWRWYWx1ZTogKCkgPT4gdHJ1ZVxyXG4gIH0gc2F0aXNmaWVzIFNjaGVtYVR5cGU8SW50ZW50aW9uYWxRU01BbnksIEN1c3RvbVNjaGVtYT5cclxufSBhcyBjb25zdDsiLCAiLy8gQ29weXJpZ2h0IDIwMjUsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vKipcclxuICogRm9yIHVzZSBvZiBRU00gYXMgYSBtb2R1bGVcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKWBcclxuICovXHJcblxyXG5pbXBvcnQgeyBRdWVyeVN0cmluZ01hY2hpbmUgfSBmcm9tICcuL1F1ZXJ5U3RyaW5nTWFjaGluZU1vZHVsZS5qcyc7XHJcblxyXG5zZWxmLlF1ZXJ5U3RyaW5nTWFjaGluZSA9IFF1ZXJ5U3RyaW5nTWFjaGluZTsiXSwKICAibWFwcGluZ3MiOiAiOzs7QUFnQkEsTUFBTSxvQkFBb0I7QUF1RjFCLE1BQU0sbUJBQW1CLE1BQU07QUFHN0IsUUFBSTtBQUNGLGFBQU8sYUFBYSxRQUFTLGdCQUFpQixNQUFNO0FBQUEsSUFDdEQsU0FDTyxHQUFJO0FBQ1QsYUFBTztBQUFBLElBQ1Q7QUFBQSxFQUNGO0FBSUEsV0FBUyxlQUVpQixLQUFRLE1BQXlDO0FBQ3pFLFdBQU8sSUFBSSxlQUFnQixJQUFLO0FBQUEsRUFDbEM7QUFNQSxNQUFNLG9CQUFvQixDQUFFLFdBQTZCLE9BQU8sV0FBVyxLQUFLLE9BQU8sV0FBWSxHQUFJO0FBVXZHLE1BQU0sZ0JBQWdCLENBQUUsV0FBb0IsS0FBYSxPQUEwQixRQUFnQixZQUF3QztBQUN6SSxRQUFLLENBQUMsV0FBWTtBQUVoQixVQUFLLE9BQU8sUUFBUztBQUNuQiwyQkFBbUIsV0FBWSxLQUFLLE9BQU8sT0FBUTtBQUNuRCxZQUFLLGVBQWdCLFFBQVEsY0FBZSxHQUFJO0FBQzlDLGtCQUFRLE9BQU87QUFBQSxRQUNqQixPQUNLO0FBQ0gsZ0JBQU0sYUFBYSxNQUFPLE9BQU8sSUFBSztBQUN0QztBQUFBLFlBQTBCLGVBQWdCLFlBQVksY0FBZTtBQUFBLFlBQ25FO0FBQUEsVUFBMkU7QUFHN0Usa0JBQVEsV0FBVztBQUFBLFFBQ3JCO0FBQUEsTUFDRixPQUNLO0FBQ0gsaUNBQTBCLFdBQVcsT0FBUTtBQUFBLE1BQy9DO0FBQUEsSUFDRjtBQUNBLFdBQU87QUFBQSxFQUNUO0FBT08sTUFBTSxxQkFBcUI7QUFBQTtBQUFBO0FBQUEsSUFJaEMsVUFBVSxDQUFDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQU1YLEtBQUssU0FBNkIsS0FBYSxRQUE0QjtBQUN6RSxhQUFPLEtBQUssYUFBYyxLQUFLLFFBQVEsT0FBTyxTQUFTLE1BQU87QUFBQSxJQUNoRTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBUUEsUUFBUSxTQUE4QyxXQUF1RDtBQUMzRyxhQUFPO0FBQUE7QUFBQSxRQUVMLEdBQUcsS0FBSyxnQkFBaUIsV0FBVyxPQUFPLFNBQVMsTUFBTztBQUFBLFFBQzNELFlBQVk7QUFBQSxNQUNkO0FBQUEsSUFDRjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQVVBLGNBQWMsU0FBNkIsS0FBYSxRQUFXLFFBQWlDO0FBRWxHLFVBQUssQ0FBQyxrQkFBbUIsTUFBTyxHQUFJO0FBQ2xDLGNBQU0sSUFBSSxNQUFPLHdFQUF3RSxNQUFNLEVBQUc7QUFBQSxNQUNwRztBQUlBLFlBQU0sU0FBVyxPQUFPLFdBQVcsQ0FBQyxpQkFBaUIsSUFBTSxDQUFDLElBQUksVUFBVyxLQUFLLE1BQU87QUFFdkYscUJBQWdCLEtBQUssTUFBTztBQUU1QixVQUFJLFFBQVEsWUFBYSxLQUFLLFFBQVEsTUFBTztBQUU3QyxVQUFLLGVBQWdCLFFBQVEsYUFBYyxHQUFJO0FBQzdDLGNBQU0sY0FBYyxPQUFPO0FBQzNCLGdCQUFRO0FBQUEsVUFBZSxhQUFjLE9BQU8sV0FBWTtBQUFBLFVBQUc7QUFBQSxVQUFLO0FBQUEsVUFBTztBQUFBLFVBQ3JFLG1DQUFtQyxHQUFHLE1BQU0sS0FBSyxxQ0FBcUMsWUFBWSxLQUFNLElBQUssQ0FBQztBQUFBLFFBQ2hIO0FBQUEsTUFDRixXQUdVLGVBQWdCLFFBQVEsY0FBZSxHQUFJO0FBQ25ELGdCQUFRO0FBQUEsVUFBaUIsT0FBTyxhQUFnQyxLQUFNO0FBQUEsVUFBRztBQUFBLFVBQUs7QUFBQSxVQUFPO0FBQUEsVUFDbkYsbUNBQW1DLEdBQUcsTUFBTSxLQUFLO0FBQUEsUUFDbkQ7QUFBQSxNQUNGO0FBRUEsVUFBSSxhQUFhLE1BQU8sT0FBTyxJQUFLLEVBQUUsYUFBYyxLQUFNO0FBRzFELFVBQUssT0FBTyxTQUFTLFdBQVcsTUFBTSxRQUFTLEtBQU0sR0FBSTtBQUN2RCxZQUFJLGdCQUFnQjtBQUNwQixpQkFBVSxJQUFJLEdBQUcsSUFBSSxNQUFNLFFBQVEsS0FBTTtBQUN2QyxnQkFBTSxVQUFVLE1BQU8sQ0FBRTtBQUN6QixjQUFLLENBQUMsTUFBTyxPQUFPLGNBQWMsSUFBSyxFQUFFLGFBQWMsT0FBUSxHQUFJO0FBQ2pFLDRCQUFnQjtBQUNoQjtBQUFBLFVBQ0Y7QUFDQSxjQUFLLGVBQWdCLE9BQU8sZUFBZSxjQUFlLEtBQUssQ0FBRyxPQUFPLGNBQWMsYUFBZ0MsT0FBUSxHQUFJO0FBQ2pJLDRCQUFnQjtBQUNoQjtBQUFBLFVBQ0Y7QUFDQSxjQUFLLGVBQWdCLE9BQU8sZUFBZSxhQUFjLEtBQUssQ0FBQyxhQUFjLFNBQVMsT0FBTyxjQUFjLFdBQW1DLEdBQUk7QUFDaEosNEJBQWdCO0FBQ2hCO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFDQSxxQkFBYSxjQUFjO0FBQUEsTUFDN0I7QUFHQSxjQUFRLGNBQWUsWUFBWSxLQUFLLE9BQU8sUUFBUSxnQ0FBZ0MsR0FBRyxFQUFHO0FBQzdGLGFBQU87QUFBQSxJQUNUO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFRQSxpQkFBaUIsU0FBOEMsV0FBc0IsUUFBaUQ7QUFDcEksWUFBTSxTQUFTLENBQUM7QUFFaEIsaUJBQVksT0FBTyxXQUFZO0FBQzdCLFlBQUssVUFBVSxlQUFnQixHQUFJLEdBQUk7QUFDckMsaUJBQVEsR0FBSSxJQUFJLEtBQUssYUFBYyxLQUFLLFVBQVcsR0FBSSxHQUFHLE1BQU87QUFBQSxRQUNuRTtBQUFBLE1BQ0Y7QUFDQSxhQUFPO0FBQUEsSUFDVDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFNQSxhQUFhLFNBQVUsS0FBdUI7QUFDNUMsYUFBTyxLQUFLLHFCQUFzQixLQUFLLE9BQU8sU0FBUyxNQUFPO0FBQUEsSUFDaEU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQVFBLHNCQUFzQixTQUFVLEtBQWEsUUFBMEI7QUFDckUsVUFBSyxDQUFDLGtCQUFtQixNQUFPLEdBQUk7QUFDbEMsY0FBTSxJQUFJLE1BQU8sd0VBQXdFLE1BQU0sRUFBRztBQUFBLE1BQ3BHO0FBQ0EsWUFBTSxTQUFTLFVBQVcsS0FBSyxNQUFPO0FBQ3RDLGFBQU8sT0FBTyxTQUFTO0FBQUEsSUFDekI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFPQSxZQUFZLFNBQVUsR0FBc0IsR0FBZ0M7QUFDMUUsVUFBSyxPQUFPLE1BQU0sT0FBTyxHQUFJO0FBQzNCLGVBQU87QUFBQSxNQUNUO0FBQ0EsVUFBSyxPQUFPLE1BQU0sWUFBWSxPQUFPLE1BQU0sWUFBWSxPQUFPLE1BQU0sV0FBWTtBQUM5RSxlQUFPLE1BQU07QUFBQSxNQUNmO0FBQ0EsVUFBSyxNQUFNLFFBQVEsTUFBTSxNQUFPO0FBQzlCLGVBQU87QUFBQSxNQUNUO0FBQ0EsVUFBSyxNQUFNLFVBQWEsTUFBTSxRQUFZO0FBQ3hDLGVBQU87QUFBQSxNQUNUO0FBQ0EsVUFBSyxNQUFNLFFBQVEsTUFBTSxRQUFZO0FBQ25DLGVBQU87QUFBQSxNQUNUO0FBQ0EsVUFBSyxNQUFNLFVBQWEsTUFBTSxNQUFPO0FBQ25DLGVBQU87QUFBQSxNQUNUO0FBQ0EsWUFBTSxRQUFRLE9BQU8sS0FBTSxDQUFFO0FBQzdCLFlBQU0sUUFBUSxPQUFPLEtBQU0sQ0FBRTtBQUM3QixVQUFLLE1BQU0sV0FBVyxNQUFNLFFBQVM7QUFDbkMsZUFBTztBQUFBLE1BQ1QsV0FDVSxNQUFNLFdBQVcsR0FBSTtBQUM3QixlQUFPLE1BQU07QUFBQSxNQUNmLE9BQ0s7QUFDSCxpQkFBVSxJQUFJLEdBQUcsSUFBSSxNQUFNLFFBQVEsS0FBTTtBQUN2QyxjQUFLLE1BQU8sQ0FBRSxNQUFNLE1BQU8sQ0FBRSxHQUFJO0FBQy9CLG1CQUFPO0FBQUEsVUFDVDtBQUNBLGdCQUFNLFNBQVMsRUFBRyxNQUFPLENBQUUsQ0FBRTtBQUM3QixnQkFBTSxTQUFTLEVBQUcsTUFBTyxDQUFFLENBQUU7QUFDN0IsY0FBSyxDQUFDLG1CQUFtQixXQUFZLFFBQVEsTUFBTyxHQUFJO0FBQ3RELG1CQUFPO0FBQUEsVUFDVDtBQUFBLFFBQ0Y7QUFDQSxlQUFPO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQVFBLG9CQUFvQixTQUFVLGFBQXFCLEtBQXNCO0FBQ3ZFLCtCQUEwQixPQUFPLGdCQUFnQixVQUFVLHFDQUFxQyxPQUFPLFdBQVcsRUFBRztBQUNySCwrQkFBMEIsT0FBTyxRQUFRLFVBQVUscUNBQXFDLE9BQU8sR0FBRyxFQUFHO0FBQ3JHLCtCQUEwQixrQkFBbUIsV0FBWSxHQUFHLGdEQUFpRDtBQUM3RywrQkFBMEIsSUFBSSxTQUFTLEdBQUcsd0NBQXlDO0FBRW5GLFVBQUssWUFBWSxXQUFZLEdBQUksR0FBSTtBQUNuQyxjQUFNLGdCQUFnQixDQUFDO0FBQ3ZCLGNBQU0sUUFBUSxZQUFZLFVBQVcsQ0FBRTtBQUN2QyxjQUFNLFdBQVcsTUFBTSxNQUFPLEdBQUk7QUFDbEMsaUJBQVUsSUFBSSxHQUFHLElBQUksU0FBUyxRQUFRLEtBQU07QUFDMUMsZ0JBQU0sVUFBVSxTQUFVLENBQUU7QUFDNUIsZ0JBQU0sbUJBQW1CLFFBQVEsTUFBTyxHQUFJO0FBRTVDLGdCQUFNLGFBQWEsbUJBQW9CLGlCQUFrQixDQUFFLENBQUU7QUFDN0QsY0FBSyxlQUFlLEtBQU07QUFDeEIsMEJBQWMsS0FBTSxPQUFRO0FBQUEsVUFDOUI7QUFBQSxRQUNGO0FBRUEsWUFBSyxjQUFjLFNBQVMsR0FBSTtBQUM5QixpQkFBTyxJQUFJLGNBQWMsS0FBTSxHQUFJLENBQUM7QUFBQSxRQUN0QyxPQUNLO0FBQ0gsaUJBQU87QUFBQSxRQUNUO0FBQUEsTUFDRixPQUNLO0FBQ0gsZUFBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLQSxxQkFBcUIsU0FBVSxhQUFxQixNQUF5QjtBQUMzRSxlQUFVLElBQUksR0FBRyxJQUFJLEtBQUssUUFBUSxLQUFNO0FBQ3RDLHNCQUFjLEtBQUssbUJBQW9CLGFBQWEsS0FBTSxDQUFFLENBQUU7QUFBQSxNQUNoRTtBQUNBLGFBQU87QUFBQSxJQUNUO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFXQSxtQkFBbUIsU0FBVSxLQUFhLGlCQUFrQztBQUMxRSxVQUFLLGdCQUFnQixXQUFZLEdBQUksS0FBSyxnQkFBZ0IsV0FBWSxHQUFJLEdBQUk7QUFDNUUsMEJBQWtCLGdCQUFnQixVQUFXLENBQUU7QUFBQSxNQUNqRDtBQUNBLFVBQUssZ0JBQWdCLFdBQVcsR0FBSTtBQUNsQyxlQUFPO0FBQUEsTUFDVDtBQUNBLFlBQU0sY0FBYyxJQUFJLFNBQVUsR0FBSSxJQUFJLE1BQU07QUFDaEQsYUFBTyxNQUFNLGNBQWM7QUFBQSxJQUM3QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQVVBLHdCQUF3QixTQUFVLEtBQWEsa0JBQXFDO0FBRWxGLGVBQVUsSUFBSSxHQUFHLElBQUksaUJBQWlCLFFBQVEsS0FBTTtBQUNsRCxjQUFNLEtBQUssa0JBQW1CLEtBQUssaUJBQWtCLENBQUUsQ0FBRTtBQUFBLE1BQzNEO0FBQ0EsYUFBTztBQUFBLElBQ1Q7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtBLGdCQUFnQixTQUFVLEtBQXNCO0FBQzlDLFlBQU0sUUFBUSxJQUFJLFFBQVMsR0FBSTtBQUUvQixVQUFLLFNBQVMsR0FBSTtBQUNoQixlQUFPLElBQUksVUFBVyxLQUFNO0FBQUEsTUFDOUIsT0FDSztBQUNILGVBQU87QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQVVBLFlBQVksU0FBVSxLQUFhLE9BQTBCLFNBQXdCO0FBRW5GLFVBQUksY0FBYztBQUNsQixlQUFVLElBQUksR0FBRyxJQUFJLEtBQUssU0FBUyxRQUFRLEtBQU07QUFDL0MsY0FBTSxVQUFVLEtBQUssU0FBVSxDQUFFO0FBQ2pDLFlBQUssUUFBUSxRQUFRLE9BQU8sVUFBVSxRQUFRLFNBQVMsWUFBWSxRQUFRLFNBQVU7QUFDbkYsd0JBQWM7QUFDZDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQ0EsVUFBSyxDQUFDLGFBQWM7QUFDbEIsZ0JBQVEsS0FBTSxPQUFRO0FBRXRCLGFBQUssU0FBUyxLQUFNO0FBQUEsVUFDbEI7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFFBQ0YsQ0FBRTtBQUFBLE1BQ0o7QUFBQSxJQUNGO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLQSxZQUFZLFNBQVUsS0FBdUI7QUFDM0MsVUFBSSxhQUFhO0FBQ2pCLGVBQVUsSUFBSSxHQUFHLElBQUksS0FBSyxTQUFTLFVBQVUsQ0FBQyxZQUFZLEtBQU07QUFDOUQscUJBQWUsS0FBSyxTQUFVLENBQUUsRUFBRSxRQUFRO0FBQUEsTUFDNUM7QUFDQSxhQUFPO0FBQUEsSUFDVDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFNQSw4QkFBOEIsU0FBVSxhQUFnQztBQUN0RSxVQUFLLFlBQVksV0FBWSxHQUFJLEdBQUk7QUFDbkMsY0FBTSxRQUFRLFlBQVksVUFBVyxDQUFFO0FBQ3ZDLGVBQU8sTUFBTSxNQUFPLEdBQUk7QUFBQSxNQUMxQjtBQUNBLGFBQU8sQ0FBQztBQUFBLElBQ1Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFPQSwrQkFBK0IsU0FBVSxLQUFhLFFBQWdDO0FBQ3BGLFlBQU0sY0FBYyxLQUFLLGVBQWdCLE1BQU87QUFDaEQsWUFBTSxrQkFBa0IsS0FBSyw2QkFBOEIsV0FBWTtBQUV2RSxlQUFVLElBQUksR0FBRyxJQUFJLGdCQUFnQixRQUFRLEtBQU07QUFDakQsY0FBTSxpQkFBaUIsZ0JBQWlCLENBQUU7QUFDMUMsY0FBTSxtQkFBbUIsZUFBZSxNQUFPLEdBQUk7QUFFbkQsWUFBSyxtQkFBb0IsaUJBQWtCLENBQUUsQ0FBRSxNQUFNLEtBQU07QUFDekQsaUJBQU87QUFBQSxRQUNUO0FBQUEsTUFDRjtBQUVBLGFBQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQVVBLE1BQU0sWUFBWSxTQUFVLEtBQWEsUUFBa0Q7QUFDekYsVUFBTSxTQUFTLENBQUM7QUFDaEIsVUFBTSxTQUFTLE9BQU8sTUFBTyxDQUFFLEVBQUUsTUFBTyxHQUFJO0FBQzVDLGFBQVUsSUFBSSxHQUFHLElBQUksT0FBTyxRQUFRLEtBQU07QUFDeEMsWUFBTSxnQkFBZ0IsT0FBUSxDQUFFLEVBQUUsTUFBTyxHQUFJO0FBQzdDLFlBQU0sT0FBTyxjQUFlLENBQUU7QUFDOUIsWUFBTSxRQUFRLGNBQWMsTUFBTyxDQUFFLEVBQUUsS0FBTSxHQUFJO0FBQ2pELFVBQUssU0FBUyxLQUFNO0FBQ2xCLFlBQUssT0FBUTtBQUNYLGlCQUFPLEtBQU0sbUJBQW9CLEtBQU0sQ0FBRTtBQUFBLFFBQzNDLE9BQ0s7QUFDSCxpQkFBTyxLQUFNLElBQUs7QUFBQSxRQUNwQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFTQSxNQUFNLGlCQUFpQixTQUFVLEtBQWEsUUFBdUI7QUFFbkUsVUFBTSxhQUFhLE1BQU8sT0FBTyxJQUFLO0FBR3RDLDZCQUEwQixPQUFPLGVBQWdCLE1BQU8sR0FBRyxtQ0FBbUMsR0FBRyxFQUFHO0FBR3BHLDZCQUEwQixNQUFNLGVBQWdCLE9BQU8sSUFBSyxHQUFHLGlCQUFpQixPQUFPLElBQUksYUFBYSxHQUFHLEVBQUc7QUFHOUcsUUFBSyxlQUFnQixRQUFRLE9BQVEsR0FBSTtBQUN2QywrQkFBMEIsT0FBTyxPQUFPLFVBQVUsWUFBWSxxQ0FBcUMsR0FBRyxFQUFHO0FBQUEsSUFDM0c7QUFHQTtBQUFBLE1BQTBCLEVBQUcsT0FBTyxlQUFnQixhQUFjLEtBQUssT0FBTyxlQUFnQixjQUFlO0FBQUEsTUFDM0csZ0VBQWdFLEdBQUc7QUFBQSxJQUFHO0FBR3hFLFFBQUssZUFBZ0IsUUFBUSxhQUFjLEdBQUk7QUFDN0MsK0JBQTBCLE1BQU0sUUFBUyxPQUFPLFdBQVksR0FBRywwQ0FBMEMsR0FBRyxFQUFHO0FBQUEsSUFDakg7QUFHQSxRQUFLLGVBQWdCLFFBQVEsY0FBZSxHQUFJO0FBQzlDLCtCQUEwQixPQUFPLE9BQU8saUJBQWlCLFlBQVksNENBQTRDLEdBQUcsRUFBRztBQUFBLElBQ3pIO0FBR0EsUUFBSyxlQUFnQixRQUFRLGNBQWUsR0FBSTtBQUM5QywrQkFBMEIsV0FBVyxhQUFjLE9BQU8sWUFBYSxHQUFHLGdDQUFnQyxHQUFHLEVBQUc7QUFBQSxJQUNsSDtBQUdBLFFBQUssZUFBZ0IsUUFBUSxhQUFjLEdBQUk7QUFDN0MsTUFBRSxPQUFPLFlBQXFDLFFBQVMsV0FBUyx5QkFBMEIsV0FBVyxhQUFjLEtBQU0sR0FBRyxzQ0FBc0MsR0FBRyxFQUFHLENBQUU7QUFBQSxJQUM1SztBQUdBLFFBQUssZUFBZ0IsUUFBUSxjQUFlLEtBQUssZUFBZ0IsUUFBUSxhQUFjLEdBQUk7QUFDekY7QUFBQSxRQUEwQixhQUFjLE9BQU8sY0FBYyxPQUFPLFdBQW1DO0FBQUEsUUFDckcsMERBQTBELEdBQUc7QUFBQSxNQUFHO0FBQUEsSUFDcEU7QUFLQSxRQUFLLGVBQWdCLFFBQVEsUUFBUyxLQUFLLE9BQU8sVUFBVSxPQUFPLFNBQVMsUUFBUztBQUNuRiwrQkFBMEIsT0FBTyxlQUFnQixjQUFlLEdBQUcsdURBQXVELEdBQUcsRUFBRztBQUFBLElBQ2xJO0FBR0EsNkJBQTBCLEtBQUssUUFBUSxXQUFXLFVBQVUsV0FBVyxRQUFTO0FBRWhGLFFBQUssT0FBTyxTQUFTLFNBQVU7QUFDN0IsMEJBQXFCLEtBQUssTUFBTztBQUFBLElBQ25DO0FBQUEsRUFDRjtBQU9BLE1BQU0sc0JBQXNCLFNBQVUsS0FBYSxRQUE0QjtBQUc3RSxRQUFLLE9BQU8sZUFBZ0IsV0FBWSxHQUFJO0FBQzFDLCtCQUEwQixPQUFPLE9BQU8sY0FBYyxZQUFZLE9BQU8sVUFBVSxXQUFXLEdBQUcsc0JBQXNCLE9BQU8sU0FBUyxjQUFjLEdBQUcsRUFBRztBQUFBLElBQzdKO0FBRUEsNkJBQTBCLENBQUMsT0FBTyxjQUFjLGVBQWdCLFFBQVMsR0FBRyxrRkFBbUY7QUFHL0osbUJBQWdCLEdBQUcsR0FBRyxZQUFZLE9BQU8sYUFBYztBQUFBLEVBQ3pEO0FBU0EsTUFBTSwyQkFBMkIsU0FBVSxLQUFhLFFBQWdCLG9CQUE4QixvQkFBcUM7QUFHekksVUFBTSxtQkFBbUIsT0FBTyxvQkFBcUIsTUFBTztBQUc1RCx1QkFBbUIsUUFBUyxjQUFZO0FBQ3RDLCtCQUEwQixpQkFBaUIsU0FBVSxRQUFTLEdBQUcsOEJBQThCLFFBQVEsYUFBYSxHQUFHLEVBQUc7QUFBQSxJQUM1SCxDQUFFO0FBR0YsVUFBTSxzQkFBc0IsbUJBQW1CLE9BQVEsa0JBQW1CO0FBQzFFLHFCQUFpQixRQUFTLGNBQVk7QUFDcEMsK0JBQTBCLGFBQWEsVUFBVSxvQkFBb0IsU0FBVSxRQUFTLEdBQUcseUJBQXlCLFFBQVEsYUFBYSxHQUFHLEVBQUc7QUFBQSxJQUNqSixDQUFFO0FBQUEsRUFDSjtBQVlBLE1BQU0sY0FBYyxTQUE2QixLQUFhLFFBQVcsUUFBK0M7QUFDdEgsUUFBSTtBQUdKLDZCQUEwQixPQUFPLFVBQVUsR0FBRyxnREFBZ0QsR0FBRyxFQUFHO0FBRXBHLFFBQUssT0FBTyxTQUFTLFFBQVM7QUFHNUIsWUFBTSxPQUFPLE1BQU8sT0FBTyxJQUFLO0FBQ2hDLG9CQUFjLEtBQUssTUFBTyxLQUFLLFFBQVEsT0FBUSxDQUFFLENBQUU7QUFBQSxJQUNyRCxPQUNLO0FBQ0g7QUFBQSxRQUEwQixPQUFRLENBQUUsTUFBTSxVQUFhLE9BQU8sZUFBZ0IsY0FBZTtBQUFBLFFBQzNGLHFDQUFxQyxHQUFHO0FBQUEsTUFBRztBQUM3QyxVQUFLLE9BQVEsQ0FBRSxNQUFNLFFBQVk7QUFHL0Isc0JBQWMsT0FBTztBQUFBLE1BQ3ZCLE9BQ0s7QUFFSCxjQUFNLE9BQU8sTUFBTyxPQUFPLElBQUs7QUFHaEMsc0JBQWMsS0FBSyxNQUFPLEtBQUssUUFBUSxPQUFRLENBQUUsQ0FBRTtBQUFBLE1BQ3JEO0FBQUEsSUFDRjtBQUVBLFdBQU87QUFBQSxFQUNUO0FBUUEsTUFBTSxZQUFZLFNBQVUsS0FBYSxRQUFvQixPQUF5QztBQUNwRyxXQUFPLFVBQVUsT0FBTyxPQUFPLFVBQVUsU0FBWSxRQUFRO0FBQUEsRUFDL0Q7QUFRQSxNQUFNLGVBQWUsU0FBVSxLQUFhLFFBQXVCLFFBQTZEO0FBQzlILFdBQU8sV0FBVyxTQUFTLE9BQU8sV0FBVyxVQUFVLFFBQVE7QUFBQSxFQUNqRTtBQVFBLE1BQU0sY0FBYyxTQUFVLEtBQWEsUUFBc0IsUUFBZ0Q7QUFDL0csVUFBTSxTQUFTLE9BQVEsTUFBTztBQUM5QixXQUFPLFdBQVcsUUFBUSxNQUFPLE1BQU8sSUFBSSxTQUFTO0FBQUEsRUFDdkQ7QUFTQSxNQUFNLGNBQWMsU0FBVSxLQUFhLFFBQXNCLFFBQXVDO0FBQ3RHLFdBQU87QUFBQSxFQUNUO0FBUUEsTUFBTSxhQUFhLFNBQVUsS0FBYSxRQUFxQixPQUFpRDtBQUU5RyxRQUFJO0FBRUosUUFBSyxVQUFVLE1BQU87QUFJcEIsb0JBQWMsQ0FBQztBQUFBLElBQ2pCLE9BQ0s7QUFHSCxvQkFBYyxNQUFPLE1BQU8sT0FBTyxhQUFhLGlCQUFrQixFQUMvRCxJQUFLLGFBQVcsWUFBYSxLQUFLLE9BQU8sZUFBZSxDQUFFLE9BQVEsQ0FBRSxDQUFFO0FBQUEsSUFDM0U7QUFFQSxXQUFPO0FBQUEsRUFDVDtBQVFBLE1BQU0sY0FBYyxTQUFVLEtBQWEsUUFBc0IsT0FBMEM7QUFDekcsV0FBTyxPQUFPLE1BQU8sS0FBMkI7QUFBQSxFQUNsRDtBQU9BLE1BQU0sZUFBZSxTQUFVLE9BQTBCLGFBQTRDO0FBQ25HLFFBQUksUUFBUTtBQUNaLGFBQVUsSUFBSSxHQUFHLElBQUksWUFBWSxVQUFVLENBQUMsT0FBTyxLQUFNO0FBQ3ZELGNBQVEsbUJBQW1CLFdBQVksWUFBYSxDQUFFLEdBQUcsS0FBTTtBQUFBLElBQ2pFO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFRQSxNQUFNLDJCQUEyQixTQUFVLFdBQW9CLFNBQXdCO0FBQ3JGLFFBQUssQ0FBQyxXQUFZO0FBQ2hCLGlCQUFXLFFBQVEsT0FBTyxRQUFRLElBQUssT0FBUTtBQUMvQyxZQUFNLElBQUksTUFBTywwQ0FBMEMsT0FBTyxFQUFHO0FBQUEsSUFDdkU7QUFBQSxFQUNGO0FBOEJBLE1BQU0sUUFBUTtBQUFBO0FBQUE7QUFBQSxJQUlaLE1BQU07QUFBQSxNQUNKLFVBQVUsQ0FBQztBQUFBLE1BQ1gsVUFBVSxDQUFFLFdBQVcsUUFBUztBQUFBLE1BQ2hDLE9BQU87QUFBQSxNQUNQLGNBQWMsV0FBUyxVQUFVLFFBQVEsVUFBVTtBQUFBLE1BQ25ELGNBQWM7QUFBQTtBQUFBLElBQ2hCO0FBQUE7QUFBQSxJQUdBLFNBQVM7QUFBQSxNQUNQLFVBQVUsQ0FBQztBQUFBLE1BQ1gsVUFBVSxDQUFFLGdCQUFnQixXQUFXLFFBQVM7QUFBQSxNQUNoRCxPQUFPO0FBQUEsTUFDUCxjQUFjLFdBQVMsVUFBVSxRQUFRLFVBQVU7QUFBQSxJQUNyRDtBQUFBO0FBQUEsSUFHQSxRQUFRO0FBQUEsTUFDTixVQUFVLENBQUM7QUFBQSxNQUNYLFVBQVUsQ0FBRSxnQkFBZ0IsZUFBZSxnQkFBZ0IsV0FBVyxRQUFTO0FBQUEsTUFDL0UsT0FBTztBQUFBLE1BQ1AsY0FBYyxXQUFTLE9BQU8sVUFBVSxZQUFZLENBQUMsTUFBTyxLQUFNO0FBQUEsSUFDcEU7QUFBQTtBQUFBLElBR0EsUUFBUTtBQUFBLE1BQ04sVUFBVSxDQUFDO0FBQUEsTUFDWCxVQUFVLENBQUUsZ0JBQWdCLGVBQWUsZ0JBQWdCLFdBQVcsUUFBUztBQUFBLE1BQy9FLE9BQU87QUFBQSxNQUNQLGNBQWMsV0FBUyxVQUFVLFFBQVEsT0FBTyxVQUFVO0FBQUEsSUFDNUQ7QUFBQTtBQUFBLElBR0EsT0FBTztBQUFBLE1BQ0wsVUFBVSxDQUFFLGVBQWdCO0FBQUEsTUFDNUIsVUFBVSxDQUFFLGdCQUFnQixlQUFlLGdCQUFnQixhQUFhLGVBQWUsV0FBVyxRQUFTO0FBQUEsTUFDM0csT0FBTztBQUFBLE1BQ1AsY0FBYyxXQUFTLE1BQU0sUUFBUyxLQUFNLEtBQUssVUFBVTtBQUFBLElBQzdEO0FBQUE7QUFBQSxJQUdBLFFBQVE7QUFBQSxNQUNOLFVBQVUsQ0FBRSxPQUFRO0FBQUEsTUFDcEIsVUFBVSxDQUFFLGdCQUFnQixlQUFlLGdCQUFnQixXQUFXLFFBQVM7QUFBQSxNQUMvRSxPQUFPO0FBQUEsTUFDUCxjQUFjLE1BQU07QUFBQSxJQUN0QjtBQUFBLEVBQ0Y7OztBQ3AyQkEsT0FBSyxxQkFBcUI7IiwKICAibmFtZXMiOiBbXQp9Cg==
