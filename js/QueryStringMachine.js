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
      return this.getAllForString(schemaMap, window.location.search);
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
      queryStringMachineAssert(TYPES[schema.type].isValidValue(schema.defaultValue), `defaultValue incorrect type: ${key}`);
    }
    if (hasOwnProperty(schema, "validValues")) {
      schema.validValues.forEach((value) => queryStringMachineAssert(TYPES[schema.type].isValidValue(value), `validValue incorrect type for key: ${key}`));
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
    validateSchemaProperties(key, schema, TYPES[schema.type].required, TYPES[schema.type].optional);
    if (TYPES[schema.type].validateSchema) {
      TYPES[schema.type].validateSchema(key, schema);
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
      validateSchema: null,
      // no type-specific schema validation
      parse: parseFlag,
      isValidValue: (value) => value === true || value === false,
      defaultValue: true
      // only needed for flags marks as 'public: true`
    },
    // value is either true or false, e.g. showAnswer=true
    boolean: {
      required: [],
      optional: ["defaultValue", "private", "public"],
      validateSchema: null,
      // no type-specific schema validation
      parse: parseBoolean,
      isValidValue: (value) => value === true || value === false
    },
    // value is a number, e.g. frameRate=100
    number: {
      required: [],
      optional: ["defaultValue", "validValues", "isValidValue", "private", "public"],
      validateSchema: null,
      // no type-specific schema validation
      parse: parseNumber,
      isValidValue: (value) => typeof value === "number" && !isNaN(value)
    },
    // value is a string, e.g. name=Ringo
    string: {
      required: [],
      optional: ["defaultValue", "validValues", "isValidValue", "private", "public"],
      validateSchema: null,
      // no type-specific schema validation
      parse: parseString,
      isValidValue: (value) => value === null || typeof value === "string"
    },
    // value is an array, e.g. screens=1,2,3
    array: {
      required: ["elementSchema"],
      optional: ["defaultValue", "validValues", "isValidValue", "separator", "validValues", "private", "public"],
      validateSchema: validateArraySchema,
      parse: parseArray,
      isValidValue: (value) => Array.isArray(value) || value === null
    },
    // value is a custom data type, e.g. color=255,0,255
    custom: {
      required: ["parse"],
      optional: ["defaultValue", "validValues", "isValidValue", "private", "public"],
      validateSchema: null,
      // no type-specific schema validation
      parse: parseCustom,
      isValidValue: (value) => true
    }
  };

  // ../query-string-machine/js/preload-main.ts
  self.QueryStringMachine = QueryStringMachine;
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vcXVlcnktc3RyaW5nLW1hY2hpbmUvanMvUXVlcnlTdHJpbmdNYWNoaW5lTW9kdWxlLnRzIiwgIi4uL3F1ZXJ5LXN0cmluZy1tYWNoaW5lL2pzL3ByZWxvYWQtbWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyNSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUXVlcnkgU3RyaW5nIHBhcnNlciB0aGF0IHN1cHBvcnRzIHR5cGUgY29lcmNpb24sIGRlZmF1bHRzLCBlcnJvciBjaGVja2luZywgZXRjLiBiYXNlZCBvbiBhIHNjaGVtYS5cclxuICogU2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXQgZm9yIHRoZSBkZXNjcmlwdGlvbiBvZiBhIHNjaGVtYS5cclxuICpcclxuICogRm9yIFVNRCAoVW5pdmVyc2FsIE1vZHVsZSBEZWZpbml0aW9uKSBzdXBwb3J0ZWQgb3V0cHV0LCBzZWUganMvUXVlcnlTdHJpbmdNYWNoaW5lLmpzXHJcbiAqXHJcbiAqIFNlZSBUWVBFUyBmb3IgYSBkZXNjcmlwdGlvbiBvZiB0aGUgc2NoZW1hIHR5cGVzIGFuZCB0aGVpciBwcm9wZXJ0aWVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuLy8gRGVmYXVsdCBzdHJpbmcgdGhhdCBzcGxpdHMgYXJyYXkgc3RyaW5nc1xyXG5jb25zdCBERUZBVUxUX1NFUEFSQVRPUiA9ICcsJztcclxuXHJcbnR5cGUgSW50ZW50aW9uYWxRU01BbnkgPSBhbnk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxyXG5cclxudHlwZSBJc1ZhbGlkVmFsdWUgPSAoIG46IEludGVudGlvbmFsUVNNQW55W10gKSA9PiBib29sZWFuO1xyXG5cclxuZXhwb3J0IHR5cGUgV2FybmluZyA9IHtcclxuICBrZXk6IHN0cmluZztcclxuICB2YWx1ZTogc3RyaW5nO1xyXG4gIG1lc3NhZ2U6IHN0cmluZztcclxufTtcclxuXHJcbnR5cGUgU2hhcmVkU2NoZW1hID0ge1xyXG4gIHByaXZhdGU/OiBib29sZWFuO1xyXG4gIHB1YmxpYz86IGJvb2xlYW47XHJcbn07XHJcblxyXG50eXBlIEZsYWdTY2hlbWEgPSB7XHJcbiAgdHlwZTogJ2ZsYWcnO1xyXG59ICYgU2hhcmVkU2NoZW1hO1xyXG5cclxudHlwZSBCb29sZWFuU2NoZW1hID0ge1xyXG4gIHR5cGU6ICdib29sZWFuJztcclxuICBkZWZhdWx0VmFsdWU/OiBib29sZWFuO1xyXG59ICYgU2hhcmVkU2NoZW1hO1xyXG5cclxudHlwZSBOdW1iZXJTY2hlbWEgPSB7XHJcbiAgdHlwZTogJ251bWJlcic7XHJcbiAgZGVmYXVsdFZhbHVlPzogbnVtYmVyO1xyXG4gIHZhbGlkVmFsdWVzPzogcmVhZG9ubHkgbnVtYmVyW107XHJcbiAgaXNWYWxpZFZhbHVlPzogKCBuOiBudW1iZXIgKSA9PiBib29sZWFuO1xyXG59ICYgU2hhcmVkU2NoZW1hO1xyXG5cclxudHlwZSBTdHJpbmdTY2hlbWEgPSB7XHJcbiAgdHlwZTogJ3N0cmluZyc7XHJcbiAgZGVmYXVsdFZhbHVlPzogc3RyaW5nIHwgbnVsbDtcclxuICB2YWxpZFZhbHVlcz86IHJlYWRvbmx5ICggc3RyaW5nIHwgbnVsbCApW107XHJcbiAgaXNWYWxpZFZhbHVlPzogKCBuOiBzdHJpbmcgfCBudWxsICkgPT4gYm9vbGVhbjtcclxufSAmIFNoYXJlZFNjaGVtYTtcclxuXHJcbnR5cGUgQXJyYXlTY2hlbWEgPSB7XHJcbiAgdHlwZTogJ2FycmF5JztcclxuICBlbGVtZW50U2NoZW1hOiBTY2hlbWE7XHJcbiAgc2VwYXJhdG9yPzogc3RyaW5nO1xyXG4gIGRlZmF1bHRWYWx1ZT86IG51bGwgfCByZWFkb25seSBJbnRlbnRpb25hbFFTTUFueVtdO1xyXG4gIHZhbGlkVmFsdWVzPzogcmVhZG9ubHkgSW50ZW50aW9uYWxRU01BbnlbXVtdO1xyXG4gIGlzVmFsaWRWYWx1ZT86IElzVmFsaWRWYWx1ZTtcclxufSAmIFNoYXJlZFNjaGVtYTtcclxuXHJcbnR5cGUgQ3VzdG9tU2NoZW1hID0ge1xyXG4gIHR5cGU6ICdjdXN0b20nO1xyXG4gIHBhcnNlOiAoIHN0cjogc3RyaW5nICkgPT4gSW50ZW50aW9uYWxRU01Bbnk7XHJcbiAgZGVmYXVsdFZhbHVlPzogSW50ZW50aW9uYWxRU01Bbnk7XHJcbiAgdmFsaWRWYWx1ZXM/OiByZWFkb25seSBJbnRlbnRpb25hbFFTTUFueVtdO1xyXG4gIGlzVmFsaWRWYWx1ZT86ICggbjogSW50ZW50aW9uYWxRU01BbnkgKSA9PiBib29sZWFuO1xyXG59ICYgU2hhcmVkU2NoZW1hO1xyXG5cclxuXHJcbi8vIE1hdGNoZXMgVFlQRSBkb2N1bWVudGF0aW9uIGluIFF1ZXJ5U3RyaW5nTWFjaGluZVxyXG50eXBlIFNjaGVtYSA9IEZsYWdTY2hlbWEgfFxyXG4gIEJvb2xlYW5TY2hlbWEgfFxyXG4gIE51bWJlclNjaGVtYSB8XHJcbiAgU3RyaW5nU2NoZW1hIHxcclxuICBBcnJheVNjaGVtYSB8XHJcbiAgQ3VzdG9tU2NoZW1hO1xyXG5cclxudHlwZSBVbnBhcnNlZFZhbHVlID0gc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZDtcclxudHlwZSBQYXJzZWRWYWx1ZTxTIGV4dGVuZHMgU2NoZW1hPiA9IFJldHVyblR5cGU8U2NoZW1hVHlwZXNbU1sndHlwZSddXVsncGFyc2UnXT47XHJcblxyXG4vLyBDb252ZXJ0cyBhIFNjaGVtYSdzIHR5cGUgdG8gdGhlIGFjdHVhbCBUeXBlc2NyaXB0IHR5cGUgaXQgcmVwcmVzZW50c1xyXG50eXBlIFF1ZXJ5TWFjaGluZVR5cGVUb1R5cGU8VD4gPSBUIGV4dGVuZHMgKCAnZmxhZycgfCAnYm9vbGVhbicgKSA/IGJvb2xlYW4gOiAoIFQgZXh0ZW5kcyAnbnVtYmVyJyA/IG51bWJlciA6ICggVCBleHRlbmRzICdzdHJpbmcnID8gKCBzdHJpbmcgfCBudWxsICkgOiAoIFQgZXh0ZW5kcyAnYXJyYXknID8gSW50ZW50aW9uYWxRU01BbnlbXSA6IEludGVudGlvbmFsUVNNQW55ICkgKSApO1xyXG5cclxuZXhwb3J0IHR5cGUgUVNNU2NoZW1hT2JqZWN0ID0gUmVjb3JkPHN0cmluZywgU2NoZW1hPjtcclxuXHJcbmV4cG9ydCB0eXBlIFFTTVBhcnNlZFBhcmFtZXRlcnM8U2NoZW1hTWFwIGV4dGVuZHMgUVNNU2NoZW1hT2JqZWN0PiA9IHtcclxuICAvLyBXaWxsIHJldHVybiBhIG1hcCBvZiB0aGUgXCJyZXN1bHRcIiB0eXBlc1xyXG4gIFtQcm9wZXJ0eSBpbiBrZXlvZiBTY2hlbWFNYXBdOiBRdWVyeU1hY2hpbmVUeXBlVG9UeXBlPFNjaGVtYU1hcFsgUHJvcGVydHkgXVsgJ3R5cGUnIF0+XHJcbiAgLy8gU0NIRU1BX01BUCBhbGxvd2VkIHRvIGJlIHNldCBpbiB0eXBlc1xyXG59ICYgeyBTQ0hFTUFfTUFQPzogUVNNU2NoZW1hT2JqZWN0IH07XHJcblxyXG4vLyBJZiBhIHF1ZXJ5IHBhcmFtZXRlciBoYXMgcHJpdmF0ZTp0cnVlIGluIGl0cyBzY2hlbWEsIGl0IG11c3QgcGFzcyB0aGlzIHByZWRpY2F0ZSB0byBiZSByZWFkIGZyb20gdGhlIFVSTC5cclxuLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy83NDNcclxuY29uc3QgcHJpdmF0ZVByZWRpY2F0ZSA9ICgpID0+IHtcclxuICAvLyBUcnlpbmcgdG8gYWNjZXNzIGxvY2FsU3RvcmFnZSBtYXkgZmFpbCB3aXRoIGEgU2VjdXJpdHlFcnJvciBpZiBjb29raWVzIGFyZSBibG9ja2VkIGluIGEgY2VydGFpbiB3YXkuXHJcbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xYS9pc3N1ZXMvMzI5IGZvciBtb3JlIGluZm9ybWF0aW9uLlxyXG4gIHRyeSB7XHJcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oICdwaGV0VGVhbU1lbWJlcicgKSA9PT0gJ3RydWUnO1xyXG4gIH1cclxuICBjYXRjaCggZSApIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbn07XHJcblxyXG50eXBlIERvbnRVc2VUaGlzT2JqZWN0ID0ge307IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlc3RyaWN0ZWQtdHlwZXNcclxuXHJcbmZ1bmN0aW9uIGhhc093blByb3BlcnR5PFxyXG4gIFggZXh0ZW5kcyBEb250VXNlVGhpc09iamVjdCxcclxuICBZIGV4dGVuZHMgUHJvcGVydHlLZXk+KCBvYmo6IFgsIHByb3A6IFkgKTogb2JqIGlzIFggJiBSZWNvcmQ8WSwgdW5rbm93bj4ge1xyXG4gIHJldHVybiBvYmouaGFzT3duUHJvcGVydHkoIHByb3AgKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkIHBhcmFtZXRlciBzdHJpbmdzIGJlZ2luIHdpdGggPyBvciBhcmUgdGhlIGVtcHR5IHN0cmluZy4gIFRoaXMgaXMgdXNlZCBmb3IgYXNzZXJ0aW9ucyBpbiBzb21lIGNhc2VzIGFuZCBmb3JcclxuICogdGhyb3dpbmcgRXJyb3JzIGluIG90aGVyIGNhc2VzLlxyXG4gKi9cclxuY29uc3QgaXNQYXJhbWV0ZXJTdHJpbmcgPSAoIHN0cmluZzogc3RyaW5nICk6IGJvb2xlYW4gPT4gc3RyaW5nLmxlbmd0aCA9PT0gMCB8fCBzdHJpbmcuc3RhcnRzV2l0aCggJz8nICk7XHJcblxyXG4vLyBKdXN0IHJldHVybiBhIHZhbHVlIHRvIGRlZmluZSB0aGUgbW9kdWxlIGV4cG9ydC5cclxuLy8gVGhpcyBleGFtcGxlIHJldHVybnMgYW4gb2JqZWN0LCBidXQgdGhlIG1vZHVsZVxyXG4vLyBjYW4gcmV0dXJuIGEgZnVuY3Rpb24gYXMgdGhlIGV4cG9ydGVkIHZhbHVlLlxyXG5cclxuLyoqXHJcbiAqIEluIG9yZGVyIHRvIHN1cHBvcnQgZ3JhY2VmdWwgZmFpbHVyZXMgZm9yIHVzZXItc3VwcGxpZWQgdmFsdWVzLCB3ZSBmYWxsIGJhY2sgdG8gZGVmYXVsdCB2YWx1ZXMgd2hlbiBwdWJsaWM6IHRydWVcclxuICogaXMgc3BlY2lmaWVkLiAgSWYgdGhlIHNjaGVtYSBlbnRyeSBpcyBwdWJsaWM6IGZhbHNlLCB0aGVuIGEgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0IGlzIHRocm93bi5cclxuICogVE9ETzogUGFyYW1ldHJpYyB0eXBpbmcsIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xdWVyeS1zdHJpbmctbWFjaGluZS9pc3N1ZXMvNDVcclxuICovXHJcbmNvbnN0IGdldFZhbGlkVmFsdWUgPSAoIHByZWRpY2F0ZTogYm9vbGVhbiwga2V5OiBzdHJpbmcsIHZhbHVlOiBJbnRlbnRpb25hbFFTTUFueSwgc2NoZW1hOiBTY2hlbWEsIG1lc3NhZ2U6IHN0cmluZyApOiBJbnRlbnRpb25hbFFTTUFueSA9PiB7XHJcbiAgaWYgKCAhcHJlZGljYXRlICkge1xyXG5cclxuICAgIGlmICggc2NoZW1hLnB1YmxpYyApIHtcclxuICAgICAgUXVlcnlTdHJpbmdNYWNoaW5lLmFkZFdhcm5pbmcoIGtleSwgdmFsdWUsIG1lc3NhZ2UgKTtcclxuICAgICAgaWYgKCBoYXNPd25Qcm9wZXJ0eSggc2NoZW1hLCAnZGVmYXVsdFZhbHVlJyApICkge1xyXG4gICAgICAgIHZhbHVlID0gc2NoZW1hLmRlZmF1bHRWYWx1ZTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBjb25zdCB0eXBlU2NoZW1hID0gVFlQRVNbIHNjaGVtYS50eXBlIF07XHJcbiAgICAgICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBoYXNPd25Qcm9wZXJ0eSggdHlwZVNjaGVtYSwgJ2RlZmF1bHRWYWx1ZScgKSxcclxuICAgICAgICAgICdUeXBlIG11c3QgaGF2ZSBhIGRlZmF1bHQgdmFsdWUgaWYgdGhlIHByb3ZpZGVkIHNjaGVtYSBkb2VzIG5vdCBoYXZlIG9uZS4nICk7XHJcbiAgICAgICAgdmFsdWUgPSB0eXBlU2NoZW1hLmRlZmF1bHRWYWx1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggcHJlZGljYXRlLCBtZXNzYWdlICk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiB2YWx1ZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBRdWVyeSBTdHJpbmcgTWFjaGluZSBpcyBhIHF1ZXJ5IHN0cmluZyBwYXJzZXIgdGhhdCBzdXBwb3J0cyB0eXBlIGNvZXJjaW9uLCBkZWZhdWx0IHZhbHVlcyAmIHZhbGlkYXRpb24uIFBsZWFzZVxyXG4gKiB2aXNpdCBQaEVUJ3MgPGEgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xdWVyeS1zdHJpbmctbWFjaGluZVwiIHRhcmdldD1cIl9ibGFua1wiPnF1ZXJ5LXN0cmluZy1tYWNoaW5lPC9hPlxyXG4gKiByZXBvc2l0b3J5IGZvciBkb2N1bWVudGF0aW9uIGFuZCBleGFtcGxlcy5cclxuICovXHJcbmV4cG9ydCBjb25zdCBRdWVyeVN0cmluZ01hY2hpbmUgPSB7XHJcblxyXG4gIC8vIHB1YmxpYyAocmVhZC1vbmx5KSB7e2tleTpzdHJpbmcsIHZhbHVlOnsqfSwgbWVzc2FnZTpzdHJpbmd9W119IC0gY2xlYXJlZCBieSBzb21lIHRlc3RzIGluIFF1ZXJ5U3RyaW5nTWFjaGluZVRlc3RzLmpzXHJcbiAgLy8gU2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5hZGRXYXJuaW5nIGZvciBhIGRlc2NyaXB0aW9uIG9mIHRoZXNlIGZpZWxkcywgYW5kIHRvIGFkZCB3YXJuaW5ncy5cclxuICB3YXJuaW5nczogW10gYXMgV2FybmluZ1tdLFxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSB2YWx1ZSBmb3IgYSBzaW5nbGUgcXVlcnkgcGFyYW1ldGVyLlxyXG4gICAqXHJcbiAgICovXHJcbiAgZ2V0OiBmdW5jdGlvbiA8UyBleHRlbmRzIFNjaGVtYT4oIGtleTogc3RyaW5nLCBzY2hlbWE6IFMgKTogUGFyc2VkVmFsdWU8Uz4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0Rm9yU3RyaW5nKCBrZXksIHNjaGVtYSwgd2luZG93LmxvY2F0aW9uLnNlYXJjaCApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdmFsdWVzIGZvciBldmVyeSBxdWVyeSBwYXJhbWV0ZXIsIHVzaW5nIHRoZSBzcGVjaWZpZWQgc2NoZW1hIG1hcC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBzY2hlbWFNYXAgLSBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldEFsbEZvclN0cmluZ1xyXG4gICAqIEByZXR1cm5zIC0gc2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRBbGxGb3JTdHJpbmdcclxuICAgKi9cclxuICBnZXRBbGw6IGZ1bmN0aW9uIDxTY2hlbWFNYXAgZXh0ZW5kcyBRU01TY2hlbWFPYmplY3Q+KCBzY2hlbWFNYXA6IFNjaGVtYU1hcCApOiBRU01QYXJzZWRQYXJhbWV0ZXJzPFNjaGVtYU1hcD4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsRm9yU3RyaW5nKCBzY2hlbWFNYXAsIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBMaWtlIGBnZXRgIGJ1dCBmb3IgYW4gYXJiaXRyYXJ5IHBhcmFtZXRlciBzdHJpbmcuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBuYW1lXHJcbiAgICogQHBhcmFtIHNjaGVtYSAtIHNlZSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0XHJcbiAgICogQHBhcmFtIHN0cmluZyAtIHRoZSBwYXJhbWV0ZXJzIHN0cmluZy4gIE11c3QgYmVnaW4gd2l0aCAnPycgb3IgYmUgdGhlIGVtcHR5IHN0cmluZ1xyXG4gICAqIEByZXR1cm5zIC0gcXVlcnkgcGFyYW1ldGVyIHZhbHVlLCBjb252ZXJ0ZWQgdG8gdGhlIHByb3BlciB0eXBlXHJcbiAgICovXHJcbiAgZ2V0Rm9yU3RyaW5nOiBmdW5jdGlvbiA8UyBleHRlbmRzIFNjaGVtYT4oIGtleTogc3RyaW5nLCBzY2hlbWE6IFMsIHN0cmluZzogc3RyaW5nICk6IFBhcnNlZFZhbHVlPFM+IHtcclxuXHJcbiAgICBpZiAoICFpc1BhcmFtZXRlclN0cmluZyggc3RyaW5nICkgKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvciggYFF1ZXJ5IHN0cmluZ3Mgc2hvdWxkIGJlIGVpdGhlciB0aGUgZW1wdHkgc3RyaW5nIG9yIHN0YXJ0IHdpdGggYSBcIj9cIjogJHtzdHJpbmd9YCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIElnbm9yZSBVUkwgdmFsdWVzIGZvciBwcml2YXRlIHF1ZXJ5IHBhcmFtZXRlcnMgdGhhdCBmYWlsIHByaXZhdGVQcmVkaWNhdGUuXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzc0My5cclxuICAgIGNvbnN0IHZhbHVlcyA9ICggc2NoZW1hLnByaXZhdGUgJiYgIXByaXZhdGVQcmVkaWNhdGUoKSApID8gW10gOiBnZXRWYWx1ZXMoIGtleSwgc3RyaW5nICk7XHJcblxyXG4gICAgdmFsaWRhdGVTY2hlbWEoIGtleSwgc2NoZW1hICk7XHJcblxyXG4gICAgbGV0IHZhbHVlID0gcGFyc2VWYWx1ZXMoIGtleSwgc2NoZW1hLCB2YWx1ZXMgKTtcclxuXHJcbiAgICBpZiAoIGhhc093blByb3BlcnR5KCBzY2hlbWEsICd2YWxpZFZhbHVlcycgKSApIHtcclxuICAgICAgY29uc3QgdmFsaWRWYWx1ZXMgPSBzY2hlbWEudmFsaWRWYWx1ZXMgYXMgSW50ZW50aW9uYWxRU01BbnlbXTtcclxuICAgICAgdmFsdWUgPSBnZXRWYWxpZFZhbHVlKCBpc1ZhbGlkVmFsdWUoIHZhbHVlLCB2YWxpZFZhbHVlcyApLCBrZXksIHZhbHVlLCBzY2hlbWEsXHJcbiAgICAgICAgYEludmFsaWQgdmFsdWUgc3VwcGxpZWQgZm9yIGtleSBcIiR7a2V5fVwiOiAke3ZhbHVlfSBpcyBub3QgYSBtZW1iZXIgb2YgdmFsaWQgdmFsdWVzOiAke3ZhbGlkVmFsdWVzLmpvaW4oICcsICcgKX1gXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaXNWYWxpZFZhbHVlIGV2YWx1YXRlcyB0byB0cnVlXHJcbiAgICBlbHNlIGlmICggaGFzT3duUHJvcGVydHkoIHNjaGVtYSwgJ2lzVmFsaWRWYWx1ZScgKSApIHtcclxuICAgICAgdmFsdWUgPSBnZXRWYWxpZFZhbHVlKCAoIHNjaGVtYS5pc1ZhbGlkVmFsdWUgYXMgSXNWYWxpZFZhbHVlICkoIHZhbHVlICksIGtleSwgdmFsdWUsIHNjaGVtYSxcclxuICAgICAgICBgSW52YWxpZCB2YWx1ZSBzdXBwbGllZCBmb3Iga2V5IFwiJHtrZXl9XCI6ICR7dmFsdWV9YFxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCB2YWx1ZVZhbGlkID0gVFlQRVNbIHNjaGVtYS50eXBlIF0uaXNWYWxpZFZhbHVlKCB2YWx1ZSApO1xyXG5cclxuICAgIC8vIHN1cHBvcnQgY3VzdG9tIHZhbGlkYXRpb24gZm9yIGVsZW1lbnRTY2hlbWEgZm9yIGFycmF5c1xyXG4gICAgaWYgKCBzY2hlbWEudHlwZSA9PT0gJ2FycmF5JyAmJiBBcnJheS5pc0FycmF5KCB2YWx1ZSApICkge1xyXG4gICAgICBsZXQgZWxlbWVudHNWYWxpZCA9IHRydWU7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHZhbHVlLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB2YWx1ZVsgaSBdO1xyXG4gICAgICAgIGlmICggIVRZUEVTWyBzY2hlbWEuZWxlbWVudFNjaGVtYS50eXBlIF0uaXNWYWxpZFZhbHVlKCBlbGVtZW50ICkgKSB7XHJcbiAgICAgICAgICBlbGVtZW50c1ZhbGlkID0gZmFsc2U7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBoYXNPd25Qcm9wZXJ0eSggc2NoZW1hLmVsZW1lbnRTY2hlbWEsICdpc1ZhbGlkVmFsdWUnICkgJiYgISggc2NoZW1hLmVsZW1lbnRTY2hlbWEuaXNWYWxpZFZhbHVlIGFzIElzVmFsaWRWYWx1ZSApKCBlbGVtZW50ICkgKSB7XHJcbiAgICAgICAgICBlbGVtZW50c1ZhbGlkID0gZmFsc2U7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBoYXNPd25Qcm9wZXJ0eSggc2NoZW1hLmVsZW1lbnRTY2hlbWEsICd2YWxpZFZhbHVlcycgKSAmJiAhaXNWYWxpZFZhbHVlKCBlbGVtZW50LCBzY2hlbWEuZWxlbWVudFNjaGVtYS52YWxpZFZhbHVlcyBhcyBJbnRlbnRpb25hbFFTTUFueVtdICkgKSB7XHJcbiAgICAgICAgICBlbGVtZW50c1ZhbGlkID0gZmFsc2U7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgdmFsdWVWYWxpZCA9IHZhbHVlVmFsaWQgJiYgZWxlbWVudHNWYWxpZDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBkaXNwYXRjaCBmdXJ0aGVyIHZhbGlkYXRpb24gdG8gYSB0eXBlLXNwZWNpZmljIGZ1bmN0aW9uXHJcbiAgICB2YWx1ZSA9IGdldFZhbGlkVmFsdWUoIHZhbHVlVmFsaWQsIGtleSwgdmFsdWUsIHNjaGVtYSwgYEludmFsaWQgdmFsdWUgZm9yIHR5cGUsIGtleTogJHtrZXl9YCApO1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIExpa2UgYGdldEFsbGAgYnV0IGZvciBhbiBhcmJpdHJhcnkgcGFyYW1ldGVycyBzdHJpbmcuXHJcbiAgICogQHBhcmFtIHNjaGVtYU1hcCAtIGtleS92YWx1ZSBwYWlycywga2V5IGlzIHF1ZXJ5IHBhcmFtZXRlciBuYW1lIGFuZCB2YWx1ZSBpcyBhIHNjaGVtYVxyXG4gICAqIEBwYXJhbSBzdHJpbmcgLSB0aGUgcGFyYW1ldGVycyBzdHJpbmdcclxuICAgKiBAcmV0dXJucyAtIGtleS92YWx1ZSBwYWlycyBob2xkaW5nIHRoZSBwYXJzZWQgcmVzdWx0c1xyXG4gICAqL1xyXG4gIGdldEFsbEZvclN0cmluZzogZnVuY3Rpb24gPFNjaGVtYU1hcCBleHRlbmRzIFFTTVNjaGVtYU9iamVjdD4oIHNjaGVtYU1hcDogU2NoZW1hTWFwLCBzdHJpbmc6IHN0cmluZyApOiBRU01QYXJzZWRQYXJhbWV0ZXJzPFNjaGVtYU1hcD4ge1xyXG4gICAgY29uc3QgcmVzdWx0ID0ge30gYXMgdW5rbm93biBhcyBRU01QYXJzZWRQYXJhbWV0ZXJzPFNjaGVtYU1hcD47XHJcblxyXG4gICAgZm9yICggY29uc3Qga2V5IGluIHNjaGVtYU1hcCApIHtcclxuICAgICAgaWYgKCBzY2hlbWFNYXAuaGFzT3duUHJvcGVydHkoIGtleSApICkge1xyXG4gICAgICAgIHJlc3VsdFsga2V5IF0gPSB0aGlzLmdldEZvclN0cmluZygga2V5LCBzY2hlbWFNYXBbIGtleSBdLCBzdHJpbmcgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggY29udGFpbnMgdGhlIGdpdmVuIGtleVxyXG4gICAqIEByZXR1cm5zIC0gdHJ1ZSBpZiB0aGUgd2luZG93LmxvY2F0aW9uLnNlYXJjaCBjb250YWlucyB0aGUgZ2l2ZW4ga2V5XHJcbiAgICovXHJcbiAgY29udGFpbnNLZXk6IGZ1bmN0aW9uKCBrZXk6IHN0cmluZyApOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmNvbnRhaW5zS2V5Rm9yU3RyaW5nKCBrZXksIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIHN0cmluZyBjb250YWlucyB0aGUgc3BlY2lmaWVkIGtleVxyXG4gICAqIEBwYXJhbSBrZXkgLSB0aGUga2V5IHRvIGNoZWNrIGZvclxyXG4gICAqIEBwYXJhbSBzdHJpbmcgLSB0aGUgcXVlcnkgc3RyaW5nIHRvIHNlYXJjaC4gTXVzdCBiZWdpbiB3aXRoICc/JyBvciBiZSB0aGUgZW1wdHkgc3RyaW5nXHJcbiAgICogQHJldHVybnMgLSB0cnVlIGlmIHRoZSBnaXZlbiBzdHJpbmcgY29udGFpbnMgdGhlIGdpdmVuIGtleVxyXG4gICAqL1xyXG4gIGNvbnRhaW5zS2V5Rm9yU3RyaW5nOiBmdW5jdGlvbigga2V5OiBzdHJpbmcsIHN0cmluZzogc3RyaW5nICk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCAhaXNQYXJhbWV0ZXJTdHJpbmcoIHN0cmluZyApICkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGBRdWVyeSBzdHJpbmdzIHNob3VsZCBiZSBlaXRoZXIgdGhlIGVtcHR5IHN0cmluZyBvciBzdGFydCB3aXRoIGEgXCI/XCI6ICR7c3RyaW5nfWAgKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHZhbHVlcyA9IGdldFZhbHVlcygga2V5LCBzdHJpbmcgKTtcclxuICAgIHJldHVybiB2YWx1ZXMubGVuZ3RoID4gMDtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIG9iamVjdHMgYXJlIGVxdWFsLiAgRXhwb3J0ZWQgb24gdGhlIFF1ZXJ5U3RyaW5nTWFjaGluZSBmb3IgdGVzdGluZy4gIE9ubHkgd29ya3MgZm9yXHJcbiAgICogYXJyYXlzIG9iamVjdHMgdGhhdCBjb250YWluIHByaW1pdGl2ZXMgKGkuZS4gdGVybWluYWxzIGFyZSBjb21wYXJlZCB3aXRoID09PSlcclxuICAgKiBwcml2YXRlIC0gaG93ZXZlciwgaXQgaXMgY2FsbGVkIGZyb20gUXVlcnlTdHJpbmdNYWNoaW5lVGVzdHNcclxuICAgKi9cclxuICBkZWVwRXF1YWxzOiBmdW5jdGlvbiggYTogSW50ZW50aW9uYWxRU01BbnksIGI6IEludGVudGlvbmFsUVNNQW55ICk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCB0eXBlb2YgYSAhPT0gdHlwZW9mIGIgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmICggdHlwZW9mIGEgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBhID09PSAnbnVtYmVyJyB8fCB0eXBlb2YgYSA9PT0gJ2Jvb2xlYW4nICkge1xyXG4gICAgICByZXR1cm4gYSA9PT0gYjtcclxuICAgIH1cclxuICAgIGlmICggYSA9PT0gbnVsbCAmJiBiID09PSBudWxsICkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGlmICggYSA9PT0gdW5kZWZpbmVkICYmIGIgPT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBpZiAoIGEgPT09IG51bGwgJiYgYiA9PT0gdW5kZWZpbmVkICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBpZiAoIGEgPT09IHVuZGVmaW5lZCAmJiBiID09PSBudWxsICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBjb25zdCBhS2V5cyA9IE9iamVjdC5rZXlzKCBhICk7XHJcbiAgICBjb25zdCBiS2V5cyA9IE9iamVjdC5rZXlzKCBiICk7XHJcbiAgICBpZiAoIGFLZXlzLmxlbmd0aCAhPT0gYktleXMubGVuZ3RoICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggYUtleXMubGVuZ3RoID09PSAwICkge1xyXG4gICAgICByZXR1cm4gYSA9PT0gYjtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhS2V5cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBpZiAoIGFLZXlzWyBpIF0gIT09IGJLZXlzWyBpIF0gKSB7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGFDaGlsZCA9IGFbIGFLZXlzWyBpIF0gXTtcclxuICAgICAgICBjb25zdCBiQ2hpbGQgPSBiWyBhS2V5c1sgaSBdIF07XHJcbiAgICAgICAgaWYgKCAhUXVlcnlTdHJpbmdNYWNoaW5lLmRlZXBFcXVhbHMoIGFDaGlsZCwgYkNoaWxkICkgKSB7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBuZXcgVVJMIGJ1dCB3aXRob3V0IHRoZSBrZXktdmFsdWUgcGFpci5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBxdWVyeVN0cmluZyAtIHRhaWwgb2YgYSBVUkwgaW5jbHVkaW5nIHRoZSBiZWdpbm5pbmcgJz8nIChpZiBhbnkpXHJcbiAgICogQHBhcmFtIGtleVxyXG4gICAqL1xyXG4gIHJlbW92ZUtleVZhbHVlUGFpcjogZnVuY3Rpb24oIHF1ZXJ5U3RyaW5nOiBzdHJpbmcsIGtleTogc3RyaW5nICk6IHN0cmluZyB7XHJcbiAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIHR5cGVvZiBxdWVyeVN0cmluZyA9PT0gJ3N0cmluZycsIGB1cmwgc2hvdWxkIGJlIHN0cmluZywgYnV0IGl0IHdhczogJHt0eXBlb2YgcXVlcnlTdHJpbmd9YCApO1xyXG4gICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCB0eXBlb2Yga2V5ID09PSAnc3RyaW5nJywgYHVybCBzaG91bGQgYmUgc3RyaW5nLCBidXQgaXQgd2FzOiAke3R5cGVvZiBrZXl9YCApO1xyXG4gICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBpc1BhcmFtZXRlclN0cmluZyggcXVlcnlTdHJpbmcgKSwgJ3F1ZXJ5U3RyaW5nIHNob3VsZCBiZSBsZW5ndGggMCBvciBiZWdpbiB3aXRoID8nICk7XHJcbiAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIGtleS5sZW5ndGggPiAwLCAndXJsIHNob3VsZCBiZSBhIHN0cmluZyB3aXRoIGxlbmd0aCA+IDAnICk7XHJcblxyXG4gICAgaWYgKCBxdWVyeVN0cmluZy5zdGFydHNXaXRoKCAnPycgKSApIHtcclxuICAgICAgY29uc3QgbmV3UGFyYW1ldGVycyA9IFtdO1xyXG4gICAgICBjb25zdCBxdWVyeSA9IHF1ZXJ5U3RyaW5nLnN1YnN0cmluZyggMSApO1xyXG4gICAgICBjb25zdCBlbGVtZW50cyA9IHF1ZXJ5LnNwbGl0KCAnJicgKTtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGVsZW1lbnRzWyBpIF07XHJcbiAgICAgICAgY29uc3Qga2V5QW5kTWF5YmVWYWx1ZSA9IGVsZW1lbnQuc3BsaXQoICc9JyApO1xyXG5cclxuICAgICAgICBjb25zdCBlbGVtZW50S2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KCBrZXlBbmRNYXliZVZhbHVlWyAwIF0gKTtcclxuICAgICAgICBpZiAoIGVsZW1lbnRLZXkgIT09IGtleSApIHtcclxuICAgICAgICAgIG5ld1BhcmFtZXRlcnMucHVzaCggZWxlbWVudCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCBuZXdQYXJhbWV0ZXJzLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgICAgcmV0dXJuIGA/JHtuZXdQYXJhbWV0ZXJzLmpvaW4oICcmJyApfWA7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIHF1ZXJ5U3RyaW5nO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBhbGwgdGhlIGtleXMgZnJvbSB0aGUgcXVlcnlTdHJpbmcgKG9rIGlmIHRoZXkgZG8gbm90IGFwcGVhciBhdCBhbGwpXHJcbiAgICovXHJcbiAgcmVtb3ZlS2V5VmFsdWVQYWlyczogZnVuY3Rpb24oIHF1ZXJ5U3RyaW5nOiBzdHJpbmcsIGtleXM6IHN0cmluZ1tdICk6IHN0cmluZyB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBxdWVyeVN0cmluZyA9IHRoaXMucmVtb3ZlS2V5VmFsdWVQYWlyKCBxdWVyeVN0cmluZywga2V5c1sgaSBdICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcXVlcnlTdHJpbmc7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQXBwZW5kcyBhIHF1ZXJ5IHN0cmluZyB0byBhIGdpdmVuIHVybC5cclxuICAgKiBAcGFyYW0gdXJsIC0gbWF5IG9yIG1heSBub3QgYWxyZWFkeSBoYXZlIG90aGVyIHF1ZXJ5IHBhcmFtZXRlcnNcclxuICAgKiBAcGFyYW0gcXVlcnlQYXJhbWV0ZXJzIC0gbWF5IHN0YXJ0IHdpdGggJycsICc/JyBvciAnJidcclxuICAgKlxyXG4gICAqIEBleGFtcGxlXHJcbiAgICogLy8gTGltaXQgdG8gdGhlIHNlY29uZCBzY3JlZW5cclxuICAgKiBzaW1VUkwgPSBRdWVyeVN0cmluZ01hY2hpbmUuYXBwZW5kUXVlcnlTdHJpbmcoIHNpbVVSTCwgJ3NjcmVlbnM9MicgKTtcclxuICAgKi9cclxuICBhcHBlbmRRdWVyeVN0cmluZzogZnVuY3Rpb24oIHVybDogc3RyaW5nLCBxdWVyeVBhcmFtZXRlcnM6IHN0cmluZyApOiBzdHJpbmcge1xyXG4gICAgaWYgKCBxdWVyeVBhcmFtZXRlcnMuc3RhcnRzV2l0aCggJz8nICkgfHwgcXVlcnlQYXJhbWV0ZXJzLnN0YXJ0c1dpdGgoICcmJyApICkge1xyXG4gICAgICBxdWVyeVBhcmFtZXRlcnMgPSBxdWVyeVBhcmFtZXRlcnMuc3Vic3RyaW5nKCAxICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIHF1ZXJ5UGFyYW1ldGVycy5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgIHJldHVybiB1cmw7XHJcbiAgICB9XHJcbiAgICBjb25zdCBjb21iaW5hdGlvbiA9IHVybC5pbmNsdWRlcyggJz8nICkgPyAnJicgOiAnPyc7XHJcbiAgICByZXR1cm4gdXJsICsgY29tYmluYXRpb24gKyBxdWVyeVBhcmFtZXRlcnM7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogSGVscGVyIGZ1bmN0aW9uIGZvciBtdWx0aXBsZSBxdWVyeSBzdHJpbmdzXHJcbiAgICogQHBhcmFtIHVybCAtIG1heSBvciBtYXkgbm90IGFscmVhZHkgaGF2ZSBvdGhlciBxdWVyeSBwYXJhbWV0ZXJzXHJcbiAgICogQHBhcmFtIHF1ZXJ5U3RyaW5nQXJyYXkgLSBlYWNoIGl0ZW0gbWF5IHN0YXJ0IHdpdGggJycsICc/Jywgb3IgJyYnXHJcbiAgICpcclxuICAgKiBAZXhhbXBsZVxyXG4gICAqIHNvdXJjZUZyYW1lLnNyYyA9IFF1ZXJ5U3RyaW5nTWFjaGluZS5hcHBlbmRRdWVyeVN0cmluZ0FycmF5KCBzaW1VUkwsIFsgJ3NjcmVlbnM9MicsICdmcmFtZVRpdGxlPXNvdXJjZScgXSApO1xyXG4gICAqL1xyXG4gIGFwcGVuZFF1ZXJ5U3RyaW5nQXJyYXk6IGZ1bmN0aW9uKCB1cmw6IHN0cmluZywgcXVlcnlTdHJpbmdBcnJheTogc3RyaW5nW10gKTogc3RyaW5nIHtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBxdWVyeVN0cmluZ0FycmF5Lmxlbmd0aDsgaSsrICkge1xyXG4gICAgICB1cmwgPSB0aGlzLmFwcGVuZFF1ZXJ5U3RyaW5nKCB1cmwsIHF1ZXJ5U3RyaW5nQXJyYXlbIGkgXSApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHVybDtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBxdWVyeSBzdHJpbmcgYXQgdGhlIGVuZCBvZiBhIHVybCwgb3IgJz8nIGlmIHRoZXJlIGlzIG5vbmUuXHJcbiAgICovXHJcbiAgZ2V0UXVlcnlTdHJpbmc6IGZ1bmN0aW9uKCB1cmw6IHN0cmluZyApOiBzdHJpbmcge1xyXG4gICAgY29uc3QgaW5kZXggPSB1cmwuaW5kZXhPZiggJz8nICk7XHJcblxyXG4gICAgaWYgKCBpbmRleCA+PSAwICkge1xyXG4gICAgICByZXR1cm4gdXJsLnN1YnN0cmluZyggaW5kZXggKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gJz8nO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSB3YXJuaW5nIHRvIHRoZSBjb25zb2xlIGFuZCBRdWVyeVN0cmluZ01hY2hpbmUud2FybmluZ3MgdG8gaW5kaWNhdGUgdGhhdCB0aGUgcHJvdmlkZWQgaW52YWxpZCB2YWx1ZSB3aWxsXHJcbiAgICogbm90IGJlIHVzZWQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBuYW1lXHJcbiAgICogQHBhcmFtIHZhbHVlIC0gdHlwZSBkZXBlbmRzIG9uIHNjaGVtYSB0eXBlXHJcbiAgICogQHBhcmFtIG1lc3NhZ2UgLSB0aGUgbWVzc2FnZSB0aGF0IGluZGljYXRlcyB0aGUgcHJvYmxlbSB3aXRoIHRoZSB2YWx1ZVxyXG4gICAqL1xyXG4gIGFkZFdhcm5pbmc6IGZ1bmN0aW9uKCBrZXk6IHN0cmluZywgdmFsdWU6IEludGVudGlvbmFsUVNNQW55LCBtZXNzYWdlOiBzdHJpbmcgKTogdm9pZCB7XHJcblxyXG4gICAgbGV0IGlzRHVwbGljYXRlID0gZmFsc2U7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLndhcm5pbmdzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCB3YXJuaW5nID0gdGhpcy53YXJuaW5nc1sgaSBdO1xyXG4gICAgICBpZiAoIGtleSA9PT0gd2FybmluZy5rZXkgJiYgdmFsdWUgPT09IHdhcm5pbmcudmFsdWUgJiYgbWVzc2FnZSA9PT0gd2FybmluZy5tZXNzYWdlICkge1xyXG4gICAgICAgIGlzRHVwbGljYXRlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKCAhaXNEdXBsaWNhdGUgKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybiggbWVzc2FnZSApO1xyXG5cclxuICAgICAgdGhpcy53YXJuaW5ncy5wdXNoKCB7XHJcbiAgICAgICAga2V5OiBrZXksXHJcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgaWYgdGhlcmUgaXMgYSB3YXJuaW5nIGZvciBhIHNwZWNpZmllZCBrZXkuXHJcbiAgICovXHJcbiAgaGFzV2FybmluZzogZnVuY3Rpb24oIGtleTogc3RyaW5nICk6IGJvb2xlYW4ge1xyXG4gICAgbGV0IGhhc1dhcm5pbmcgPSBmYWxzZTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMud2FybmluZ3MubGVuZ3RoICYmICFoYXNXYXJuaW5nOyBpKysgKSB7XHJcbiAgICAgIGhhc1dhcm5pbmcgPSAoIHRoaXMud2FybmluZ3NbIGkgXS5rZXkgPT09IGtleSApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGhhc1dhcm5pbmc7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHF1ZXJ5U3RyaW5nIC0gdGFpbCBvZiBhIFVSTCBpbmNsdWRpbmcgdGhlIGJlZ2lubmluZyAnPycgKGlmIGFueSlcclxuICAgKiBAcmV0dXJucyAtIHRoZSBzcGxpdCB1cCBzdGlsbC1VUkktZW5jb2RlZCBwYXJhbWV0ZXJzICh3aXRoIHZhbHVlcyBpZiBwcmVzZW50KVxyXG4gICAqL1xyXG4gIGdldFF1ZXJ5UGFyYW1ldGVyc0Zyb21TdHJpbmc6IGZ1bmN0aW9uKCBxdWVyeVN0cmluZzogc3RyaW5nICk6IHN0cmluZ1tdIHtcclxuICAgIGlmICggcXVlcnlTdHJpbmcuc3RhcnRzV2l0aCggJz8nICkgKSB7XHJcbiAgICAgIGNvbnN0IHF1ZXJ5ID0gcXVlcnlTdHJpbmcuc3Vic3RyaW5nKCAxICk7XHJcbiAgICAgIHJldHVybiBxdWVyeS5zcGxpdCggJyYnICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gW107XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIga2V5IHRvIHJldHVybiBpZiBwcmVzZW50XHJcbiAgICogQHBhcmFtIHN0cmluZyAtIGEgVVJMIGluY2x1ZGluZyBhIFwiP1wiIGlmIGl0IGhhcyBhIHF1ZXJ5IHN0cmluZ1xyXG4gICAqIEByZXR1cm5zIC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBhcyBpdCBhcHBlYXJzIGluIHRoZSBVUkwsIGxpa2UgYGtleT1WQUxVRWAsIG9yIG51bGwgaWYgbm90IHByZXNlbnRcclxuICAgKi9cclxuICBnZXRTaW5nbGVRdWVyeVBhcmFtZXRlclN0cmluZzogZnVuY3Rpb24oIGtleTogc3RyaW5nLCBzdHJpbmc6IHN0cmluZyApOiBzdHJpbmcgfCBudWxsIHtcclxuICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gdGhpcy5nZXRRdWVyeVN0cmluZyggc3RyaW5nICk7XHJcbiAgICBjb25zdCBxdWVyeVBhcmFtZXRlcnMgPSB0aGlzLmdldFF1ZXJ5UGFyYW1ldGVyc0Zyb21TdHJpbmcoIHF1ZXJ5U3RyaW5nICk7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcXVlcnlQYXJhbWV0ZXJzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBxdWVyeVBhcmFtZXRlciA9IHF1ZXJ5UGFyYW1ldGVyc1sgaSBdO1xyXG4gICAgICBjb25zdCBrZXlBbmRNYXliZVZhbHVlID0gcXVlcnlQYXJhbWV0ZXIuc3BsaXQoICc9JyApO1xyXG5cclxuICAgICAgaWYgKCBkZWNvZGVVUklDb21wb25lbnQoIGtleUFuZE1heWJlVmFsdWVbIDAgXSApID09PSBrZXkgKSB7XHJcbiAgICAgICAgcmV0dXJuIHF1ZXJ5UGFyYW1ldGVyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFF1ZXJ5IHN0cmluZ3MgbWF5IHNob3cgdGhlIHNhbWUga2V5IGFwcGVhcmluZyBtdWx0aXBsZSB0aW1lcywgc3VjaCBhcyA/dmFsdWU9MiZ2YWx1ZT0zLlxyXG4gKiBUaGlzIG1ldGhvZCByZWNvdmVycyBhbGwgb2YgdGhlIHN0cmluZyB2YWx1ZXMuICBGb3IgdGhpcyBleGFtcGxlLCBpdCB3b3VsZCBiZSBbJzInLCczJ10uXHJcbiAqXHJcbiAqIEBwYXJhbSBrZXkgLSB0aGUga2V5IGZvciB3aGljaCB3ZSBhcmUgZmluZGluZyB2YWx1ZXMuXHJcbiAqIEBwYXJhbSBzdHJpbmcgLSB0aGUgcGFyYW1ldGVycyBzdHJpbmdcclxuICogQHJldHVybnMgLSB0aGUgcmVzdWx0aW5nIHZhbHVlcywgbnVsbCBpbmRpY2F0ZXMgdGhlIHF1ZXJ5IHBhcmFtZXRlciBpcyBwcmVzZW50IHdpdGggbm8gdmFsdWVcclxuICovXHJcbmNvbnN0IGdldFZhbHVlcyA9IGZ1bmN0aW9uKCBrZXk6IHN0cmluZywgc3RyaW5nOiBzdHJpbmcgKTogQXJyYXk8SW50ZW50aW9uYWxRU01BbnkgfCBudWxsPiB7XHJcbiAgY29uc3QgdmFsdWVzID0gW107XHJcbiAgY29uc3QgcGFyYW1zID0gc3RyaW5nLnNsaWNlKCAxICkuc3BsaXQoICcmJyApO1xyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IHBhcmFtcy5sZW5ndGg7IGkrKyApIHtcclxuICAgIGNvbnN0IHNwbGl0QnlFcXVhbHMgPSBwYXJhbXNbIGkgXS5zcGxpdCggJz0nICk7XHJcbiAgICBjb25zdCBuYW1lID0gc3BsaXRCeUVxdWFsc1sgMCBdO1xyXG4gICAgY29uc3QgdmFsdWUgPSBzcGxpdEJ5RXF1YWxzLnNsaWNlKCAxICkuam9pbiggJz0nICk7IC8vIFN1cHBvcnQgYXJiaXRyYXJ5IG51bWJlciBvZiAnPScgaW4gdGhlIHZhbHVlXHJcbiAgICBpZiAoIG5hbWUgPT09IGtleSApIHtcclxuICAgICAgaWYgKCB2YWx1ZSApIHtcclxuICAgICAgICB2YWx1ZXMucHVzaCggZGVjb2RlVVJJQ29tcG9uZW50KCB2YWx1ZSApICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdmFsdWVzLnB1c2goIG51bGwgKTsgLy8gbm8gdmFsdWUgcHJvdmlkZWRcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gdmFsdWVzO1xyXG59O1xyXG5cclxuLy8gU2NoZW1hIHZhbGlkYXRpb24gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgdGhlIHNjaGVtYSBmb3IgYSBxdWVyeSBwYXJhbWV0ZXIuXHJcbiAqIEBwYXJhbSBrZXkgLSB0aGUgcXVlcnkgcGFyYW1ldGVyIG5hbWVcclxuICogQHBhcmFtIHNjaGVtYSAtIHNjaGVtYSB0aGF0IGRlc2NyaWJlcyB0aGUgcXVlcnkgcGFyYW1ldGVyLCBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldFxyXG4gKi9cclxuY29uc3QgdmFsaWRhdGVTY2hlbWEgPSBmdW5jdGlvbigga2V5OiBzdHJpbmcsIHNjaGVtYTogU2NoZW1hICk6IHZvaWQge1xyXG5cclxuICAvLyB0eXBlIGlzIHJlcXVpcmVkXHJcbiAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICd0eXBlJyApLCBgdHlwZSBmaWVsZCBpcyByZXF1aXJlZCBmb3Iga2V5OiAke2tleX1gICk7XHJcblxyXG4gIC8vIHR5cGUgaXMgdmFsaWRcclxuICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIFRZUEVTLmhhc093blByb3BlcnR5KCBzY2hlbWEudHlwZSApLCBgaW52YWxpZCB0eXBlOiAke3NjaGVtYS50eXBlfSBmb3Iga2V5OiAke2tleX1gICk7XHJcblxyXG4gIC8vIHBhcnNlIGlzIGEgZnVuY3Rpb25cclxuICBpZiAoIGhhc093blByb3BlcnR5KCBzY2hlbWEsICdwYXJzZScgKSApIHtcclxuICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggdHlwZW9mIHNjaGVtYS5wYXJzZSA9PT0gJ2Z1bmN0aW9uJywgYHBhcnNlIG11c3QgYmUgYSBmdW5jdGlvbiBmb3Iga2V5OiAke2tleX1gICk7XHJcbiAgfVxyXG5cclxuICAvLyB2YWxpZFZhbHVlcyBhbmQgaXNWYWxpZFZhbHVlIGFyZSBvcHRpb25hbCBhbmQgbXV0dWFsbHkgZXhjbHVzaXZlXHJcbiAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCAhKCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICd2YWxpZFZhbHVlcycgKSAmJiBzY2hlbWEuaGFzT3duUHJvcGVydHkoICdpc1ZhbGlkVmFsdWUnICkgKSxcclxuICAgIGB2YWxpZFZhbHVlcyBhbmQgaXNWYWxpZFZhbHVlIGFyZSBtdXR1YWxseSBleGNsdXNpdmUgZm9yIGtleTogJHtrZXl9YCApO1xyXG5cclxuICAvLyB2YWxpZFZhbHVlcyBpcyBhbiBBcnJheVxyXG4gIGlmICggaGFzT3duUHJvcGVydHkoIHNjaGVtYSwgJ3ZhbGlkVmFsdWVzJyApICkge1xyXG4gICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBBcnJheS5pc0FycmF5KCBzY2hlbWEudmFsaWRWYWx1ZXMgKSwgYGlzVmFsaWRWYWx1ZSBtdXN0IGJlIGFuIGFycmF5IGZvciBrZXk6ICR7a2V5fWAgKTtcclxuICB9XHJcblxyXG4gIC8vIGlzVmFsaWRWYWx1ZSBpcyBhIGZ1bmN0aW9uXHJcbiAgaWYgKCBoYXNPd25Qcm9wZXJ0eSggc2NoZW1hLCAnaXNWYWxpZFZhbHVlJyApICkge1xyXG4gICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCB0eXBlb2Ygc2NoZW1hLmlzVmFsaWRWYWx1ZSA9PT0gJ2Z1bmN0aW9uJywgYGlzVmFsaWRWYWx1ZSBtdXN0IGJlIGEgZnVuY3Rpb24gZm9yIGtleTogJHtrZXl9YCApO1xyXG4gIH1cclxuXHJcbiAgLy8gZGVmYXVsdFZhbHVlIGhhcyB0aGUgY29ycmVjdCB0eXBlXHJcbiAgaWYgKCBoYXNPd25Qcm9wZXJ0eSggc2NoZW1hLCAnZGVmYXVsdFZhbHVlJyApICkge1xyXG4gICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBUWVBFU1sgc2NoZW1hLnR5cGUgXS5pc1ZhbGlkVmFsdWUoIHNjaGVtYS5kZWZhdWx0VmFsdWUgKSwgYGRlZmF1bHRWYWx1ZSBpbmNvcnJlY3QgdHlwZTogJHtrZXl9YCApO1xyXG4gIH1cclxuXHJcbiAgLy8gdmFsaWRWYWx1ZXMgaGF2ZSB0aGUgY29ycmVjdCB0eXBlXHJcbiAgaWYgKCBoYXNPd25Qcm9wZXJ0eSggc2NoZW1hLCAndmFsaWRWYWx1ZXMnICkgKSB7XHJcbiAgICAoIHNjaGVtYS52YWxpZFZhbHVlcyBhcyBJbnRlbnRpb25hbFFTTUFueVtdICkuZm9yRWFjaCggdmFsdWUgPT4gcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBUWVBFU1sgc2NoZW1hLnR5cGUgXS5pc1ZhbGlkVmFsdWUoIHZhbHVlICksIGB2YWxpZFZhbHVlIGluY29ycmVjdCB0eXBlIGZvciBrZXk6ICR7a2V5fWAgKSApO1xyXG4gIH1cclxuXHJcbiAgLy8gZGVmYXVsdFZhbHVlIGlzIGEgbWVtYmVyIG9mIHZhbGlkVmFsdWVzXHJcbiAgaWYgKCBoYXNPd25Qcm9wZXJ0eSggc2NoZW1hLCAnZGVmYXVsdFZhbHVlJyApICYmIGhhc093blByb3BlcnR5KCBzY2hlbWEsICd2YWxpZFZhbHVlcycgKSApIHtcclxuICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggaXNWYWxpZFZhbHVlKCBzY2hlbWEuZGVmYXVsdFZhbHVlLCBzY2hlbWEudmFsaWRWYWx1ZXMgYXMgSW50ZW50aW9uYWxRU01BbnlbXSApLFxyXG4gICAgICBgZGVmYXVsdFZhbHVlIG11c3QgYmUgYSBtZW1iZXIgb2YgdmFsaWRWYWx1ZXMsIGZvciBrZXk6ICR7a2V5fWAgKTtcclxuICB9XHJcblxyXG4gIC8vIGRlZmF1bHRWYWx1ZSBtdXN0IGV4aXN0IGZvciBhIHB1YmxpYyBzY2hlbWEgc28gdGhlcmUncyBhIGZhbGxiYWNrIGluIGNhc2UgYSB1c2VyIHByb3ZpZGVzIGFuIGludmFsaWQgdmFsdWUuXHJcbiAgLy8gSG93ZXZlciwgZGVmYXVsdFZhbHVlIGlzIG5vdCByZXF1aXJlZCBmb3IgZmxhZ3Mgc2luY2UgdGhleSdyZSBvbmx5IGEga2V5LiBXaGlsZSBtYXJraW5nIGEgZmxhZyBhcyBwdWJsaWM6IHRydWVcclxuICAvLyBkb2Vzbid0IGNoYW5nZSBpdHMgYmVoYXZpb3IsIGl0J3MgYWxsb3dlZCBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlIHB1YmxpYyBrZXkgZm9yIGRvY3VtZW50YXRpb24sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVlcnktc3RyaW5nLW1hY2hpbmUvaXNzdWVzLzQxXHJcbiAgaWYgKCBoYXNPd25Qcm9wZXJ0eSggc2NoZW1hLCAncHVibGljJyApICYmIHNjaGVtYS5wdWJsaWMgJiYgc2NoZW1hLnR5cGUgIT09ICdmbGFnJyApIHtcclxuICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggc2NoZW1hLmhhc093blByb3BlcnR5KCAnZGVmYXVsdFZhbHVlJyApLCBgZGVmYXVsdFZhbHVlIGlzIHJlcXVpcmVkIHdoZW4gcHVibGljOiB0cnVlIGZvciBrZXk6ICR7a2V5fWAgKTtcclxuICB9XHJcblxyXG4gIC8vIHZlcmlmeSB0aGF0IHRoZSBzY2hlbWEgaGFzIGFwcHJvcHJpYXRlIHByb3BlcnRpZXNcclxuICB2YWxpZGF0ZVNjaGVtYVByb3BlcnRpZXMoIGtleSwgc2NoZW1hLCBUWVBFU1sgc2NoZW1hLnR5cGUgXS5yZXF1aXJlZCwgVFlQRVNbIHNjaGVtYS50eXBlIF0ub3B0aW9uYWwgKTtcclxuXHJcbiAgLy8gZGlzcGF0Y2ggZnVydGhlciB2YWxpZGF0aW9uIHRvIGFuIChvcHRpb25hbCkgdHlwZS1zcGVjaWZpYyBmdW5jdGlvblxyXG4gIGlmICggVFlQRVNbIHNjaGVtYS50eXBlIF0udmFsaWRhdGVTY2hlbWEgKSB7XHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gaGVscCBtZSwgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3F1ZXJ5LXN0cmluZy1tYWNoaW5lL2lzc3Vlcy80NVxyXG4gICAgVFlQRVNbIHNjaGVtYS50eXBlIF0udmFsaWRhdGVTY2hlbWEhKCBrZXksIHNjaGVtYSApO1xyXG4gIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgc2NoZW1hIGZvciB0eXBlICdhcnJheScuXHJcbiAqIEBwYXJhbSBrZXkgLSB0aGUgcXVlcnkgcGFyYW1ldGVyIG5hbWVcclxuICogQHBhcmFtIHNjaGVtYSAtIHNjaGVtYSB0aGF0IGRlc2NyaWJlcyB0aGUgcXVlcnkgcGFyYW1ldGVyLCBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldFxyXG4gKi9cclxuY29uc3QgdmFsaWRhdGVBcnJheVNjaGVtYSA9IGZ1bmN0aW9uKCBrZXk6IHN0cmluZywgc2NoZW1hOiBBcnJheVNjaGVtYSApOiB2b2lkIHtcclxuXHJcbiAgLy8gc2VwYXJhdG9yIGlzIGEgc2luZ2xlIGNoYXJhY3RlclxyXG4gIGlmICggc2NoZW1hLmhhc093blByb3BlcnR5KCAnc2VwYXJhdG9yJyApICkge1xyXG4gICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCB0eXBlb2Ygc2NoZW1hLnNlcGFyYXRvciA9PT0gJ3N0cmluZycgJiYgc2NoZW1hLnNlcGFyYXRvci5sZW5ndGggPT09IDEsIGBpbnZhbGlkIHNlcGFyYXRvcjogJHtzY2hlbWEuc2VwYXJhdG9yfSwgZm9yIGtleTogJHtrZXl9YCApO1xyXG4gIH1cclxuXHJcbiAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCAhc2NoZW1hLmVsZW1lbnRTY2hlbWEuaGFzT3duUHJvcGVydHkoICdwdWJsaWMnICksICdBcnJheSBlbGVtZW50cyBzaG91bGQgbm90IGRlY2xhcmUgcHVibGljOyBpdCBjb21lcyBmcm9tIHRoZSBhcnJheSBzY2hlbWEgaXRzZWxmLicgKTtcclxuXHJcbiAgLy8gdmFsaWRhdGUgZWxlbWVudFNjaGVtYVxyXG4gIHZhbGlkYXRlU2NoZW1hKCBgJHtrZXl9LmVsZW1lbnRgLCBzY2hlbWEuZWxlbWVudFNjaGVtYSApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFZlcmlmaWVzIHRoYXQgYSBzY2hlbWEgY29udGFpbnMgb25seSBzdXBwb3J0ZWQgcHJvcGVydGllcywgYW5kIGNvbnRhaW5zIGFsbCByZXF1aXJlZCBwcm9wZXJ0aWVzLlxyXG4gKiBAcGFyYW0ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBuYW1lXHJcbiAqIEBwYXJhbSBzY2hlbWEgLSBzY2hlbWEgdGhhdCBkZXNjcmliZXMgdGhlIHF1ZXJ5IHBhcmFtZXRlciwgc2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRcclxuICogQHBhcmFtIHJlcXVpcmVkUHJvcGVydGllcyAtIHByb3BlcnRpZXMgdGhhdCB0aGUgc2NoZW1hIG11c3QgaGF2ZVxyXG4gKiBAcGFyYW0gb3B0aW9uYWxQcm9wZXJ0aWVzIC0gcHJvcGVydGllcyB0aGF0IHRoZSBzY2hlbWEgbWF5IG9wdGlvbmFsbHkgaGF2ZVxyXG4gKi9cclxuY29uc3QgdmFsaWRhdGVTY2hlbWFQcm9wZXJ0aWVzID0gZnVuY3Rpb24oIGtleTogc3RyaW5nLCBzY2hlbWE6IFNjaGVtYSwgcmVxdWlyZWRQcm9wZXJ0aWVzOiBzdHJpbmdbXSwgb3B0aW9uYWxQcm9wZXJ0aWVzOiBzdHJpbmdbXSApOiB2b2lkIHtcclxuXHJcbiAgLy8ge3N0cmluZ1tdfSwgdGhlIG5hbWVzIG9mIHRoZSBwcm9wZXJ0aWVzIGluIHRoZSBzY2hlbWFcclxuICBjb25zdCBzY2hlbWFQcm9wZXJ0aWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoIHNjaGVtYSApO1xyXG5cclxuICAvLyB2ZXJpZnkgdGhhdCBhbGwgcmVxdWlyZWQgcHJvcGVydGllcyBhcmUgcHJlc2VudFxyXG4gIHJlcXVpcmVkUHJvcGVydGllcy5mb3JFYWNoKCBwcm9wZXJ0eSA9PiB7XHJcbiAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIHNjaGVtYVByb3BlcnRpZXMuaW5jbHVkZXMoIHByb3BlcnR5ICksIGBtaXNzaW5nIHJlcXVpcmVkIHByb3BlcnR5OiAke3Byb3BlcnR5fSBmb3Iga2V5OiAke2tleX1gICk7XHJcbiAgfSApO1xyXG5cclxuICAvLyB2ZXJpZnkgdGhhdCB0aGVyZSBhcmUgbm8gdW5zdXBwb3J0ZWQgcHJvcGVydGllc1xyXG4gIGNvbnN0IHN1cHBvcnRlZFByb3BlcnRpZXMgPSByZXF1aXJlZFByb3BlcnRpZXMuY29uY2F0KCBvcHRpb25hbFByb3BlcnRpZXMgKTtcclxuICBzY2hlbWFQcm9wZXJ0aWVzLmZvckVhY2goIHByb3BlcnR5ID0+IHtcclxuICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggcHJvcGVydHkgPT09ICd0eXBlJyB8fCBzdXBwb3J0ZWRQcm9wZXJ0aWVzLmluY2x1ZGVzKCBwcm9wZXJ0eSApLCBgdW5zdXBwb3J0ZWQgcHJvcGVydHk6ICR7cHJvcGVydHl9IGZvciBrZXk6ICR7a2V5fWAgKTtcclxuICB9ICk7XHJcbn07XHJcblxyXG4vLyBQYXJzaW5nID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuLyoqXHJcbiAqIFVzZXMgdGhlIHN1cHBsaWVkIHNjaGVtYSB0byBjb252ZXJ0IHF1ZXJ5IHBhcmFtZXRlciB2YWx1ZShzKSBmcm9tIHN0cmluZyB0byB0aGUgZGVzaXJlZCB2YWx1ZSB0eXBlLlxyXG4gKiBAcGFyYW0ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBuYW1lXHJcbiAqIEBwYXJhbSBzY2hlbWEgLSBzY2hlbWEgdGhhdCBkZXNjcmliZXMgdGhlIHF1ZXJ5IHBhcmFtZXRlciwgc2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRcclxuICogQHBhcmFtIHZhbHVlcyAtIGFueSBtYXRjaGVzIGZyb20gdGhlIHF1ZXJ5IHN0cmluZyxcclxuICogICBjb3VsZCBiZSBtdWx0aXBsZSBmb3IgP3ZhbHVlPXgmdmFsdWU9eSBmb3IgZXhhbXBsZVxyXG4gKiBAcmV0dXJucyB0aGUgYXNzb2NpYXRlZCB2YWx1ZSwgY29udmVydGVkIHRvIHRoZSBwcm9wZXIgdHlwZVxyXG4gKi9cclxuY29uc3QgcGFyc2VWYWx1ZXMgPSBmdW5jdGlvbiA8UyBleHRlbmRzIFNjaGVtYT4oIGtleTogc3RyaW5nLCBzY2hlbWE6IFMsIHZhbHVlczogQXJyYXk8VW5wYXJzZWRWYWx1ZT4gKTogUGFyc2VkVmFsdWU8Uz4ge1xyXG4gIGxldCByZXR1cm5WYWx1ZTtcclxuXHJcbiAgLy8gdmFsdWVzIGNvbnRhaW5zIHZhbHVlcyBmb3IgYWxsIG9jY3VycmVuY2VzIG9mIHRoZSBxdWVyeSBwYXJhbWV0ZXIuICBXZSBjdXJyZW50bHkgc3VwcG9ydCBvbmx5IDEgb2NjdXJyZW5jZS5cclxuICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIHZhbHVlcy5sZW5ndGggPD0gMSwgYHF1ZXJ5IHBhcmFtZXRlciBjYW5ub3Qgb2NjdXIgbXVsdGlwbGUgdGltZXM6ICR7a2V5fWAgKTtcclxuXHJcbiAgaWYgKCBzY2hlbWEudHlwZSA9PT0gJ2ZsYWcnICkge1xyXG5cclxuICAgIC8vIGZsYWcgaXMgYSBjb252ZW5pZW50IHZhcmlhdGlvbiBvZiBib29sZWFuLCB3aGljaCBkZXBlbmRzIG9uIHdoZXRoZXIgdGhlIHF1ZXJ5IHN0cmluZyBpcyBwcmVzZW50IG9yIG5vdFxyXG4gICAgY29uc3QgdHlwZSA9IFRZUEVTWyBzY2hlbWEudHlwZSBdO1xyXG4gICAgcmV0dXJuVmFsdWUgPSB0eXBlLnBhcnNlKCBrZXksIHNjaGVtYSwgdmFsdWVzWyAwIF0gKTtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIHZhbHVlc1sgMCBdICE9PSB1bmRlZmluZWQgfHwgc2NoZW1hLmhhc093blByb3BlcnR5KCAnZGVmYXVsdFZhbHVlJyApLFxyXG4gICAgICBgbWlzc2luZyByZXF1aXJlZCBxdWVyeSBwYXJhbWV0ZXI6ICR7a2V5fWAgKTtcclxuICAgIGlmICggdmFsdWVzWyAwIF0gPT09IHVuZGVmaW5lZCApIHtcclxuXHJcbiAgICAgIC8vIG5vdCBpbiB0aGUgcXVlcnkgc3RyaW5nLCB1c2UgdGhlIGRlZmF1bHRcclxuICAgICAgcmV0dXJuVmFsdWUgPSBzY2hlbWEuZGVmYXVsdFZhbHVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICBjb25zdCB0eXBlID0gVFlQRVNbIHNjaGVtYS50eXBlIF07XHJcbiAgICAgIC8vIGRpc3BhdGNoIHBhcnNpbmcgb2YgcXVlcnkgc3RyaW5nIHRvIGEgdHlwZS1zcGVjaWZpYyBmdW5jdGlvblxyXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gc2NoZW1hIHNob3VsZCBiZSBzcGVjaWZpYyBmb3IgdGhhdCB0eXBlLiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVlcnktc3RyaW5nLW1hY2hpbmUvaXNzdWVzLzQ1XHJcbiAgICAgIHJldHVyblZhbHVlID0gdHlwZS5wYXJzZSgga2V5LCBzY2hlbWEsIHZhbHVlc1sgMCBdICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcmV0dXJuVmFsdWU7XHJcbn07XHJcblxyXG4vKipcclxuICogUGFyc2VzIHRoZSB2YWx1ZSBmb3IgYSB0eXBlICdmbGFnJy5cclxuICogQHBhcmFtIGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIgbmFtZVxyXG4gKiBAcGFyYW0gc2NoZW1hIC0gc2NoZW1hIHRoYXQgZGVzY3JpYmVzIHRoZSBxdWVyeSBwYXJhbWV0ZXIsIHNlZSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0XHJcbiAqIEBwYXJhbSB2YWx1ZSAtIHZhbHVlIGZyb20gdGhlIHF1ZXJ5IHBhcmFtZXRlciBzdHJpbmdcclxuICovXHJcbmNvbnN0IHBhcnNlRmxhZyA9IGZ1bmN0aW9uKCBrZXk6IHN0cmluZywgc2NoZW1hOiBGbGFnU2NoZW1hLCB2YWx1ZTogVW5wYXJzZWRWYWx1ZSApOiBib29sZWFuIHwgc3RyaW5nIHtcclxuICByZXR1cm4gdmFsdWUgPT09IG51bGwgPyB0cnVlIDogdmFsdWUgPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogdmFsdWU7XHJcbn07XHJcblxyXG4vKipcclxuICogUGFyc2VzIHRoZSB2YWx1ZSBmb3IgYSB0eXBlICdib29sZWFuJy5cclxuICogQHBhcmFtIGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIgbmFtZVxyXG4gKiBAcGFyYW0gc2NoZW1hIC0gc2NoZW1hIHRoYXQgZGVzY3JpYmVzIHRoZSBxdWVyeSBwYXJhbWV0ZXIsIHNlZSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0XHJcbiAqIEBwYXJhbSBzdHJpbmcgLSB2YWx1ZSBmcm9tIHRoZSBxdWVyeSBwYXJhbWV0ZXIgc3RyaW5nXHJcbiAqL1xyXG5jb25zdCBwYXJzZUJvb2xlYW4gPSBmdW5jdGlvbigga2V5OiBzdHJpbmcsIHNjaGVtYTogQm9vbGVhblNjaGVtYSwgc3RyaW5nOiBVbnBhcnNlZFZhbHVlICk6IGJvb2xlYW4gfCBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkIHtcclxuICByZXR1cm4gc3RyaW5nID09PSAndHJ1ZScgPyB0cnVlIDogc3RyaW5nID09PSAnZmFsc2UnID8gZmFsc2UgOiBzdHJpbmc7XHJcbn07XHJcblxyXG4vKipcclxuICogUGFyc2VzIHRoZSB2YWx1ZSBmb3IgYSB0eXBlICdudW1iZXInLlxyXG4gKiBAcGFyYW0ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBuYW1lXHJcbiAqIEBwYXJhbSBzY2hlbWEgLSBzY2hlbWEgdGhhdCBkZXNjcmliZXMgdGhlIHF1ZXJ5IHBhcmFtZXRlciwgc2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRcclxuICogQHBhcmFtIHN0cmluZyAtIHZhbHVlIGZyb20gdGhlIHF1ZXJ5IHBhcmFtZXRlciBzdHJpbmdcclxuICovXHJcbmNvbnN0IHBhcnNlTnVtYmVyID0gZnVuY3Rpb24oIGtleTogc3RyaW5nLCBzY2hlbWE6IE51bWJlclNjaGVtYSwgc3RyaW5nOiBVbnBhcnNlZFZhbHVlICk6IG51bWJlciB8IFVucGFyc2VkVmFsdWUge1xyXG4gIGNvbnN0IG51bWJlciA9IE51bWJlciggc3RyaW5nICk7XHJcbiAgcmV0dXJuIHN0cmluZyA9PT0gbnVsbCB8fCBpc05hTiggbnVtYmVyICkgPyBzdHJpbmcgOiBudW1iZXI7XHJcbn07XHJcblxyXG4vKipcclxuICogUGFyc2VzIHRoZSB2YWx1ZSBmb3IgYSB0eXBlICdudW1iZXInLlxyXG4gKiBUaGUgdmFsdWUgdG8gYmUgcGFyc2VkIGlzIGFscmVhZHkgc3RyaW5nLCBzbyBpdCBpcyBndWFyYW50ZWVkIHRvIHBhcnNlIGFzIGEgc3RyaW5nLlxyXG4gKiBAcGFyYW0ga2V5XHJcbiAqIEBwYXJhbSBzY2hlbWFcclxuICogQHBhcmFtIHN0cmluZ1xyXG4gKi9cclxuY29uc3QgcGFyc2VTdHJpbmcgPSBmdW5jdGlvbigga2V5OiBzdHJpbmcsIHNjaGVtYTogU3RyaW5nU2NoZW1hLCBzdHJpbmc6IFVucGFyc2VkVmFsdWUgKTogVW5wYXJzZWRWYWx1ZSB7XHJcbiAgcmV0dXJuIHN0cmluZztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBQYXJzZXMgdGhlIHZhbHVlIGZvciBhIHR5cGUgJ2FycmF5Jy5cclxuICogQHBhcmFtIGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIgbmFtZVxyXG4gKiBAcGFyYW0gc2NoZW1hIC0gc2NoZW1hIHRoYXQgZGVzY3JpYmVzIHRoZSBxdWVyeSBwYXJhbWV0ZXIsIHNlZSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0XHJcbiAqIEBwYXJhbSB2YWx1ZSAtIHZhbHVlIGZyb20gdGhlIHF1ZXJ5IHBhcmFtZXRlciBzdHJpbmdcclxuICovXHJcbmNvbnN0IHBhcnNlQXJyYXkgPSBmdW5jdGlvbigga2V5OiBzdHJpbmcsIHNjaGVtYTogQXJyYXlTY2hlbWEsIHZhbHVlOiBVbnBhcnNlZFZhbHVlICk6IEFycmF5PEludGVudGlvbmFsUVNNQW55PiB7XHJcblxyXG4gIGxldCByZXR1cm5WYWx1ZTtcclxuXHJcbiAgaWYgKCB2YWx1ZSA9PT0gbnVsbCApIHtcclxuXHJcbiAgICAvLyBudWxsIHNpZ25pZmllcyBhbiBlbXB0eSBhcnJheS4gRm9yIGluc3RhbmNlID9zY3JlZW5zPSB3b3VsZCBnaXZlIFtdXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3F1ZXJ5LXN0cmluZy1tYWNoaW5lL2lzc3Vlcy8xN1xyXG4gICAgcmV0dXJuVmFsdWUgPSBbXTtcclxuICB9XHJcbiAgZWxzZSB7XHJcblxyXG4gICAgLy8gU3BsaXQgdXAgdGhlIHN0cmluZyBpbnRvIGFuIGFycmF5IG9mIHZhbHVlcy4gRS5nLiA/c2NyZWVucz0xLDIgd291bGQgZ2l2ZSBbMSwyXVxyXG4gICAgcmV0dXJuVmFsdWUgPSB2YWx1ZSEuc3BsaXQoIHNjaGVtYS5zZXBhcmF0b3IgfHwgREVGQVVMVF9TRVBBUkFUT1IgKVxyXG4gICAgICAubWFwKCBlbGVtZW50ID0+IHBhcnNlVmFsdWVzKCBrZXksIHNjaGVtYS5lbGVtZW50U2NoZW1hLCBbIGVsZW1lbnQgXSApICk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcmV0dXJuVmFsdWU7XHJcbn07XHJcblxyXG4vKipcclxuICogUGFyc2VzIHRoZSB2YWx1ZSBmb3IgYSB0eXBlICdjdXN0b20nLlxyXG4gKiBAcGFyYW0ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBuYW1lXHJcbiAqIEBwYXJhbSBzY2hlbWEgLSBzY2hlbWEgdGhhdCBkZXNjcmliZXMgdGhlIHF1ZXJ5IHBhcmFtZXRlciwgc2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRcclxuICogQHBhcmFtIHZhbHVlIC0gdmFsdWUgZnJvbSB0aGUgcXVlcnkgcGFyYW1ldGVyIHN0cmluZ1xyXG4gKi9cclxuY29uc3QgcGFyc2VDdXN0b20gPSBmdW5jdGlvbigga2V5OiBzdHJpbmcsIHNjaGVtYTogQ3VzdG9tU2NoZW1hLCB2YWx1ZTogVW5wYXJzZWRWYWx1ZSApOiBJbnRlbnRpb25hbFFTTUFueSB7XHJcbiAgcmV0dXJuIHNjaGVtYS5wYXJzZSggdmFsdWUgYXMgdW5rbm93biBhcyBzdHJpbmcgKTtcclxufTtcclxuXHJcbi8vIFV0aWxpdGllcyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4vKipcclxuICogRGV0ZXJtaW5lcyBpZiB2YWx1ZSBpcyBpbiBhIHNldCBvZiB2YWxpZCB2YWx1ZXMsIHVzZXMgZGVlcCBjb21wYXJpc29uLlxyXG4gKi9cclxuY29uc3QgaXNWYWxpZFZhbHVlID0gZnVuY3Rpb24oIHZhbHVlOiBJbnRlbnRpb25hbFFTTUFueSwgdmFsaWRWYWx1ZXM6IEludGVudGlvbmFsUVNNQW55W10gKTogYm9vbGVhbiB7XHJcbiAgbGV0IGZvdW5kID0gZmFsc2U7XHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgdmFsaWRWYWx1ZXMubGVuZ3RoICYmICFmb3VuZDsgaSsrICkge1xyXG4gICAgZm91bmQgPSBRdWVyeVN0cmluZ01hY2hpbmUuZGVlcEVxdWFscyggdmFsaWRWYWx1ZXNbIGkgXSwgdmFsdWUgKTtcclxuICB9XHJcbiAgcmV0dXJuIGZvdW5kO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFF1ZXJ5IHBhcmFtZXRlcnMgYXJlIHNwZWNpZmllZCBieSB0aGUgdXNlciwgYW5kIGFyZSBvdXRzaWRlIHRoZSBjb250cm9sIG9mIHRoZSBwcm9ncmFtbWVyLlxyXG4gKiBTbyB0aGUgYXBwbGljYXRpb24gc2hvdWxkIHRocm93IGFuIEVycm9yIGlmIHF1ZXJ5IHBhcmFtZXRlcnMgYXJlIGludmFsaWQuXHJcbiAqIEBwYXJhbSBwcmVkaWNhdGUgLSBpZiBwcmVkaWNhdGUgZXZhbHVhdGVzIHRvIGZhbHNlLCBhbiBFcnJvciBpcyB0aHJvd25cclxuICogQHBhcmFtIG1lc3NhZ2VcclxuICovXHJcbmNvbnN0IHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCA9IGZ1bmN0aW9uKCBwcmVkaWNhdGU6IGJvb2xlYW4sIG1lc3NhZ2U6IHN0cmluZyApOiB2b2lkIHtcclxuICBpZiAoICFwcmVkaWNhdGUgKSB7XHJcbiAgICBjb25zb2xlICYmIGNvbnNvbGUubG9nICYmIGNvbnNvbGUubG9nKCBtZXNzYWdlICk7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoIGBRdWVyeSBTdHJpbmcgTWFjaGluZSBBc3NlcnRpb24gZmFpbGVkOiAke21lc3NhZ2V9YCApO1xyXG4gIH1cclxufTtcclxuXHJcbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG50eXBlIFNjaGVtYVR5cGU8VCwgU3BlY2lmaWNTY2hlbWE+ID0ge1xyXG4gIHJlcXVpcmVkOiBBcnJheTxrZXlvZiBTcGVjaWZpY1NjaGVtYT47XHJcbiAgb3B0aW9uYWw6IEFycmF5PGtleW9mIFNwZWNpZmljU2NoZW1hPjtcclxuICB2YWxpZGF0ZVNjaGVtYTogbnVsbCB8ICggKCBrZXk6IHN0cmluZywgc2NoZW1hOiBTcGVjaWZpY1NjaGVtYSApID0+IHZvaWQgKTtcclxuICBwYXJzZTogKCBrZXk6IHN0cmluZywgc2NoZW1hOiBTcGVjaWZpY1NjaGVtYSwgdmFsdWU6IFVucGFyc2VkVmFsdWUgKSA9PiBUO1xyXG4gIGlzVmFsaWRWYWx1ZTogKCB2YWx1ZTogSW50ZW50aW9uYWxRU01BbnkgKSA9PiBib29sZWFuO1xyXG4gIGRlZmF1bHRWYWx1ZT86IFQ7XHJcbn07XHJcblxyXG4vLyBUT0RPOiBUaGVzZSBzdHJpbmdzIHNlZW0gd3JvbmcsIGxldCdzIG5vdCBkbyB0aGF0LCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVlcnktc3RyaW5nLW1hY2hpbmUvaXNzdWVzLzQ1XHJcbnR5cGUgU2NoZW1hVHlwZXMgPSB7XHJcbiAgZmxhZzogU2NoZW1hVHlwZTxib29sZWFuIHwgVW5wYXJzZWRWYWx1ZSwgRmxhZ1NjaGVtYT47XHJcbiAgYm9vbGVhbjogU2NoZW1hVHlwZTxib29sZWFuIHwgVW5wYXJzZWRWYWx1ZSwgQm9vbGVhblNjaGVtYT47XHJcbiAgbnVtYmVyOiBTY2hlbWFUeXBlPG51bWJlciB8IFVucGFyc2VkVmFsdWUsIE51bWJlclNjaGVtYT47XHJcbiAgc3RyaW5nOiBTY2hlbWFUeXBlPHN0cmluZyB8IFVucGFyc2VkVmFsdWUsIFN0cmluZ1NjaGVtYT47XHJcbiAgYXJyYXk6IFNjaGVtYVR5cGU8SW50ZW50aW9uYWxRU01BbnlbXSwgQXJyYXlTY2hlbWE+O1xyXG4gIGN1c3RvbTogU2NoZW1hVHlwZTxJbnRlbnRpb25hbFFTTUFueSwgQ3VzdG9tU2NoZW1hPjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBEYXRhIHN0cnVjdHVyZSB0aGF0IGRlc2NyaWJlcyBlYWNoIHF1ZXJ5IHBhcmFtZXRlciB0eXBlLCB3aGljaCBwcm9wZXJ0aWVzIGFyZSByZXF1aXJlZCB2cyBvcHRpb25hbCxcclxuICogaG93IHRvIHZhbGlkYXRlLCBhbmQgaG93IHRvIHBhcnNlLlxyXG4gKlxyXG4gKiBUaGUgcHJvcGVydGllcyB0aGF0IGFyZSByZXF1aXJlZCBvciBvcHRpb25hbCBkZXBlbmQgb24gdGhlIHR5cGUgKHNlZSBUWVBFUyksIGFuZCBpbmNsdWRlOlxyXG4gKiB0eXBlIC0ge3N0cmluZ30gdGhlIHR5cGUgbmFtZVxyXG4gKiBkZWZhdWx0VmFsdWUgLSB0aGUgdmFsdWUgdG8gdXNlIGlmIG5vIHF1ZXJ5IHBhcmFtZXRlciBpcyBwcm92aWRlZC4gSWYgdGhlcmUgaXMgbm8gZGVmYXVsdFZhbHVlLCB0aGVuXHJcbiAqICAgIHRoZSBxdWVyeSBwYXJhbWV0ZXIgaXMgcmVxdWlyZWQgaW4gdGhlIHF1ZXJ5IHN0cmluZzsgb21pdHRpbmcgdGhlIHF1ZXJ5IHBhcmFtZXRlciB3aWxsIHJlc3VsdCBpbiBhbiBFcnJvci5cclxuICogdmFsaWRWYWx1ZXMgLSBhcnJheSBvZiB0aGUgdmFsaWQgdmFsdWVzIGZvciB0aGUgcXVlcnkgcGFyYW1ldGVyXHJcbiAqIGlzVmFsaWRWYWx1ZSAtIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYSBwYXJzZWQgT2JqZWN0IChub3Qgc3RyaW5nKSBhbmQgY2hlY2tzIGlmIGl0IGlzIGFjY2VwdGFibGVcclxuICogZWxlbWVudFNjaGVtYSAtIHNwZWNpZmllcyB0aGUgc2NoZW1hIGZvciBlbGVtZW50cyBpbiBhbiBhcnJheVxyXG4gKiBzZXBhcmF0b3IgLSAgYXJyYXkgZWxlbWVudHMgYXJlIHNlcGFyYXRlZCBieSB0aGlzIHN0cmluZywgZGVmYXVsdHMgdG8gYCxgXHJcbiAqIHBhcnNlIC0gYSBmdW5jdGlvbiB0aGF0IHRha2VzIGEgc3RyaW5nIGFuZCByZXR1cm5zIGFuIE9iamVjdFxyXG4gKi9cclxuY29uc3QgVFlQRVM6IFNjaGVtYVR5cGVzID0ge1xyXG4gIC8vIE5PVEU6IFR5cGVzIGZvciB0aGlzIGFyZSBjdXJyZW50bHkgaW4gcGhldC10eXBlcy5kLnRzISBDaGFuZ2VzIGhlcmUgc2hvdWxkIGJlIG1hZGUgdGhlcmUgYWxzb1xyXG5cclxuICAvLyB2YWx1ZSBpcyB0cnVlIGlmIHByZXNlbnQsIGZhbHNlIGlmIGFic2VudFxyXG4gIGZsYWc6IHtcclxuICAgIHJlcXVpcmVkOiBbXSxcclxuICAgIG9wdGlvbmFsOiBbICdwcml2YXRlJywgJ3B1YmxpYycgXSxcclxuICAgIHZhbGlkYXRlU2NoZW1hOiBudWxsLCAvLyBubyB0eXBlLXNwZWNpZmljIHNjaGVtYSB2YWxpZGF0aW9uXHJcbiAgICBwYXJzZTogcGFyc2VGbGFnLFxyXG4gICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiB2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gZmFsc2UsXHJcbiAgICBkZWZhdWx0VmFsdWU6IHRydWUgLy8gb25seSBuZWVkZWQgZm9yIGZsYWdzIG1hcmtzIGFzICdwdWJsaWM6IHRydWVgXHJcbiAgfSxcclxuXHJcbiAgLy8gdmFsdWUgaXMgZWl0aGVyIHRydWUgb3IgZmFsc2UsIGUuZy4gc2hvd0Fuc3dlcj10cnVlXHJcbiAgYm9vbGVhbjoge1xyXG4gICAgcmVxdWlyZWQ6IFtdLFxyXG4gICAgb3B0aW9uYWw6IFsgJ2RlZmF1bHRWYWx1ZScsICdwcml2YXRlJywgJ3B1YmxpYycgXSxcclxuICAgIHZhbGlkYXRlU2NoZW1hOiBudWxsLCAvLyBubyB0eXBlLXNwZWNpZmljIHNjaGVtYSB2YWxpZGF0aW9uXHJcbiAgICBwYXJzZTogcGFyc2VCb29sZWFuLFxyXG4gICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiB2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gZmFsc2VcclxuICB9LFxyXG5cclxuICAvLyB2YWx1ZSBpcyBhIG51bWJlciwgZS5nLiBmcmFtZVJhdGU9MTAwXHJcbiAgbnVtYmVyOiB7XHJcbiAgICByZXF1aXJlZDogW10sXHJcbiAgICBvcHRpb25hbDogWyAnZGVmYXVsdFZhbHVlJywgJ3ZhbGlkVmFsdWVzJywgJ2lzVmFsaWRWYWx1ZScsICdwcml2YXRlJywgJ3B1YmxpYycgXSxcclxuICAgIHZhbGlkYXRlU2NoZW1hOiBudWxsLCAvLyBubyB0eXBlLXNwZWNpZmljIHNjaGVtYSB2YWxpZGF0aW9uXHJcbiAgICBwYXJzZTogcGFyc2VOdW1iZXIsXHJcbiAgICBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgIWlzTmFOKCB2YWx1ZSApXHJcbiAgfSxcclxuXHJcbiAgLy8gdmFsdWUgaXMgYSBzdHJpbmcsIGUuZy4gbmFtZT1SaW5nb1xyXG4gIHN0cmluZzoge1xyXG4gICAgcmVxdWlyZWQ6IFtdLFxyXG4gICAgb3B0aW9uYWw6IFsgJ2RlZmF1bHRWYWx1ZScsICd2YWxpZFZhbHVlcycsICdpc1ZhbGlkVmFsdWUnLCAncHJpdmF0ZScsICdwdWJsaWMnIF0sXHJcbiAgICB2YWxpZGF0ZVNjaGVtYTogbnVsbCwgLy8gbm8gdHlwZS1zcGVjaWZpYyBzY2hlbWEgdmFsaWRhdGlvblxyXG4gICAgcGFyc2U6IHBhcnNlU3RyaW5nLFxyXG4gICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiB2YWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnXHJcbiAgfSxcclxuXHJcbiAgLy8gdmFsdWUgaXMgYW4gYXJyYXksIGUuZy4gc2NyZWVucz0xLDIsM1xyXG4gIGFycmF5OiB7XHJcbiAgICByZXF1aXJlZDogWyAnZWxlbWVudFNjaGVtYScgXSxcclxuICAgIG9wdGlvbmFsOiBbICdkZWZhdWx0VmFsdWUnLCAndmFsaWRWYWx1ZXMnLCAnaXNWYWxpZFZhbHVlJywgJ3NlcGFyYXRvcicsICd2YWxpZFZhbHVlcycsICdwcml2YXRlJywgJ3B1YmxpYycgXSxcclxuICAgIHZhbGlkYXRlU2NoZW1hOiB2YWxpZGF0ZUFycmF5U2NoZW1hLFxyXG4gICAgcGFyc2U6IHBhcnNlQXJyYXksXHJcbiAgICBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+IEFycmF5LmlzQXJyYXkoIHZhbHVlICkgfHwgdmFsdWUgPT09IG51bGxcclxuICB9LFxyXG5cclxuICAvLyB2YWx1ZSBpcyBhIGN1c3RvbSBkYXRhIHR5cGUsIGUuZy4gY29sb3I9MjU1LDAsMjU1XHJcbiAgY3VzdG9tOiB7XHJcbiAgICByZXF1aXJlZDogWyAncGFyc2UnIF0sXHJcbiAgICBvcHRpb25hbDogWyAnZGVmYXVsdFZhbHVlJywgJ3ZhbGlkVmFsdWVzJywgJ2lzVmFsaWRWYWx1ZScsICdwcml2YXRlJywgJ3B1YmxpYycgXSxcclxuICAgIHZhbGlkYXRlU2NoZW1hOiBudWxsLCAvLyBubyB0eXBlLXNwZWNpZmljIHNjaGVtYSB2YWxpZGF0aW9uXHJcbiAgICBwYXJzZTogcGFyc2VDdXN0b20sXHJcbiAgICBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+IHRydWVcclxuICB9XHJcbn07IiwgIi8vIENvcHlyaWdodCAyMDI1LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuLyoqXHJcbiAqIEZvciB1c2Ugb2YgUVNNIGFzIGEgbW9kdWxlXHJcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylgXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgUXVlcnlTdHJpbmdNYWNoaW5lIH0gZnJvbSAnLi9RdWVyeVN0cmluZ01hY2hpbmVNb2R1bGUuanMnO1xyXG5cclxuc2VsZi5RdWVyeVN0cmluZ01hY2hpbmUgPSBRdWVyeVN0cmluZ01hY2hpbmU7Il0sCiAgIm1hcHBpbmdzIjogIjs7O0FBZ0JBLE1BQU0sb0JBQW9CO0FBa0YxQixNQUFNLG1CQUFtQixNQUFNO0FBRzdCLFFBQUk7QUFDRixhQUFPLGFBQWEsUUFBUyxnQkFBaUIsTUFBTTtBQUFBLElBQ3RELFNBQ08sR0FBSTtBQUNULGFBQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUlBLFdBQVMsZUFFaUIsS0FBUSxNQUF5QztBQUN6RSxXQUFPLElBQUksZUFBZ0IsSUFBSztBQUFBLEVBQ2xDO0FBTUEsTUFBTSxvQkFBb0IsQ0FBRSxXQUE2QixPQUFPLFdBQVcsS0FBSyxPQUFPLFdBQVksR0FBSTtBQVd2RyxNQUFNLGdCQUFnQixDQUFFLFdBQW9CLEtBQWEsT0FBMEIsUUFBZ0IsWUFBd0M7QUFDekksUUFBSyxDQUFDLFdBQVk7QUFFaEIsVUFBSyxPQUFPLFFBQVM7QUFDbkIsMkJBQW1CLFdBQVksS0FBSyxPQUFPLE9BQVE7QUFDbkQsWUFBSyxlQUFnQixRQUFRLGNBQWUsR0FBSTtBQUM5QyxrQkFBUSxPQUFPO0FBQUEsUUFDakIsT0FDSztBQUNILGdCQUFNLGFBQWEsTUFBTyxPQUFPLElBQUs7QUFD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
