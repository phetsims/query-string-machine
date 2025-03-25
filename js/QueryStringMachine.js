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
  var isParameterString = (string) => string.length === 0 || string.startsWith("?");
  var getValidValue = (predicate, key, value, schema, message) => {
    if (!predicate) {
      if (schema.public) {
        QueryStringMachine.addWarning(key, value, message);
        if (schema.hasOwnProperty("defaultValue")) {
          value = schema.defaultValue;
        } else {
          const typeSchema = TYPES[schema.type];
          queryStringMachineAssert(
            typeSchema.hasOwnProperty("defaultValue"),
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
      if (schema.hasOwnProperty("validValues")) {
        value = getValidValue(
          isValidValue(value, schema.validValues),
          key,
          value,
          schema,
          // @ts-expect-error - TODO What is the best way to type narrow schema? https://github.com/phetsims/query-string-machine/issues/45
          `Invalid value supplied for key "${key}": ${value} is not a member of valid values: ${schema.validValues.join(", ")}`
        );
      } else if (schema.hasOwnProperty("isValidValue")) {
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
          if (schema.elementSchema.hasOwnProperty("isValidValue") && !schema.elementSchema.isValidValue(element)) {
            elementsValid = false;
            break;
          }
          if (schema.elementSchema.hasOwnProperty("validValues") && !isValidValue(element, schema.elementSchema.validValues)) {
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
    if (schema.hasOwnProperty("parse")) {
      queryStringMachineAssert(typeof schema.parse === "function", `parse must be a function for key: ${key}`);
    }
    queryStringMachineAssert(
      !(schema.hasOwnProperty("validValues") && schema.hasOwnProperty("isValidValue")),
      `validValues and isValidValue are mutually exclusive for key: ${key}`
    );
    if (schema.hasOwnProperty("validValues")) {
      queryStringMachineAssert(Array.isArray(schema.validValues), `isValidValue must be an array for key: ${key}`);
    }
    if (schema.hasOwnProperty("isValidValue")) {
      queryStringMachineAssert(typeof schema.isValidValue === "function", `isValidValue must be a function for key: ${key}`);
    }
    if (schema.hasOwnProperty("defaultValue")) {
      queryStringMachineAssert(TYPES[schema.type].isValidValue(schema.defaultValue), `defaultValue incorrect type: ${key}`);
    }
    if (schema.hasOwnProperty("validValues")) {
      schema.validValues.forEach((value) => queryStringMachineAssert(TYPES[schema.type].isValidValue(value), `validValue incorrect type for key: ${key}`));
    }
    if (schema.hasOwnProperty("defaultValue") && schema.hasOwnProperty("validValues")) {
      queryStringMachineAssert(isValidValue(schema.defaultValue, schema.validValues), `defaultValue must be a member of validValues, for key: ${key}`);
    }
    if (schema.hasOwnProperty("public") && schema.public && schema.type !== "flag") {
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
      isValidValue: (value) => {
        return true;
      }
    }
  };

  // ../query-string-machine/js/preload-main.ts
  self.QueryStringMachine = QueryStringMachine;
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vcXVlcnktc3RyaW5nLW1hY2hpbmUvanMvUXVlcnlTdHJpbmdNYWNoaW5lTW9kdWxlLnRzIiwgIi4uL3F1ZXJ5LXN0cmluZy1tYWNoaW5lL2pzL3ByZWxvYWQtbWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyNSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUXVlcnkgU3RyaW5nIHBhcnNlciB0aGF0IHN1cHBvcnRzIHR5cGUgY29lcmNpb24sIGRlZmF1bHRzLCBlcnJvciBjaGVja2luZywgZXRjLiBiYXNlZCBvbiBhIHNjaGVtYS5cclxuICogU2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXQgZm9yIHRoZSBkZXNjcmlwdGlvbiBvZiBhIHNjaGVtYS5cclxuICpcclxuICogRm9yIFVNRCAoVW5pdmVyc2FsIE1vZHVsZSBEZWZpbml0aW9uKSBzdXBwb3J0ZWQgb3V0cHV0LCBzZWUganMvUXVlcnlTdHJpbmdNYWNoaW5lLmpzXHJcbiAqXHJcbiAqIFNlZSBUWVBFUyBmb3IgYSBkZXNjcmlwdGlvbiBvZiB0aGUgc2NoZW1hIHR5cGVzIGFuZCB0aGVpciBwcm9wZXJ0aWVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuLy8gRGVmYXVsdCBzdHJpbmcgdGhhdCBzcGxpdHMgYXJyYXkgc3RyaW5nc1xyXG5jb25zdCBERUZBVUxUX1NFUEFSQVRPUiA9ICcsJztcclxuXHJcbnR5cGUgQW55ID0gYW55OyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcclxuXHJcbmV4cG9ydCB0eXBlIFdhcm5pbmcgPSB7XHJcbiAga2V5OiBzdHJpbmc7XHJcbiAgdmFsdWU6IHN0cmluZztcclxuICBtZXNzYWdlOiBzdHJpbmc7XHJcbn07XHJcblxyXG50eXBlIFNoYXJlZFNjaGVtYSA9IHtcclxuICBwcml2YXRlPzogYm9vbGVhbjtcclxuICBwdWJsaWM/OiBib29sZWFuO1xyXG59O1xyXG5cclxudHlwZSBGbGFnU2NoZW1hID0ge1xyXG4gIHR5cGU6ICdmbGFnJztcclxufSAmIFNoYXJlZFNjaGVtYTtcclxuXHJcbnR5cGUgQm9vbGVhblNjaGVtYSA9IHtcclxuICB0eXBlOiAnYm9vbGVhbic7XHJcbiAgZGVmYXVsdFZhbHVlPzogYm9vbGVhbjtcclxufSAmIFNoYXJlZFNjaGVtYTtcclxuXHJcbnR5cGUgTnVtYmVyU2NoZW1hID0ge1xyXG4gIHR5cGU6ICdudW1iZXInO1xyXG4gIGRlZmF1bHRWYWx1ZT86IG51bWJlcjtcclxuICB2YWxpZFZhbHVlcz86IHJlYWRvbmx5IG51bWJlcltdO1xyXG4gIGlzVmFsaWRWYWx1ZT86ICggbjogbnVtYmVyICkgPT4gYm9vbGVhbjtcclxufSAmIFNoYXJlZFNjaGVtYTtcclxuXHJcbnR5cGUgU3RyaW5nU2NoZW1hID0ge1xyXG4gIHR5cGU6ICdzdHJpbmcnO1xyXG4gIGRlZmF1bHRWYWx1ZT86IHN0cmluZyB8IG51bGw7XHJcbiAgdmFsaWRWYWx1ZXM/OiByZWFkb25seSAoIHN0cmluZyB8IG51bGwgKVtdO1xyXG4gIGlzVmFsaWRWYWx1ZT86ICggbjogc3RyaW5nIHwgbnVsbCApID0+IGJvb2xlYW47XHJcbn0gJiBTaGFyZWRTY2hlbWE7XHJcblxyXG50eXBlIEFycmF5U2NoZW1hID0ge1xyXG4gIHR5cGU6ICdhcnJheSc7XHJcbiAgZWxlbWVudFNjaGVtYTogU2NoZW1hO1xyXG4gIHNlcGFyYXRvcj86IHN0cmluZztcclxuICBkZWZhdWx0VmFsdWU/OiBudWxsIHwgcmVhZG9ubHkgQW55W107XHJcbiAgdmFsaWRWYWx1ZXM/OiByZWFkb25seSBBbnlbXVtdO1xyXG4gIGlzVmFsaWRWYWx1ZT86ICggbjogQW55W10gKSA9PiBib29sZWFuO1xyXG59ICYgU2hhcmVkU2NoZW1hO1xyXG5cclxudHlwZSBDdXN0b21TY2hlbWEgPSB7XHJcbiAgdHlwZTogJ2N1c3RvbSc7XHJcbiAgcGFyc2U6ICggc3RyOiBzdHJpbmcgKSA9PiBBbnk7XHJcbiAgZGVmYXVsdFZhbHVlPzogQW55O1xyXG4gIHZhbGlkVmFsdWVzPzogcmVhZG9ubHkgQW55W107XHJcbiAgaXNWYWxpZFZhbHVlPzogKCBuOiBBbnkgKSA9PiBib29sZWFuO1xyXG59ICYgU2hhcmVkU2NoZW1hO1xyXG5cclxuXHJcbi8vIE1hdGNoZXMgVFlQRSBkb2N1bWVudGF0aW9uIGluIFF1ZXJ5U3RyaW5nTWFjaGluZVxyXG50eXBlIFNjaGVtYSA9IEZsYWdTY2hlbWEgfFxyXG4gIEJvb2xlYW5TY2hlbWEgfFxyXG4gIE51bWJlclNjaGVtYSB8XHJcbiAgU3RyaW5nU2NoZW1hIHxcclxuICBBcnJheVNjaGVtYSB8XHJcbiAgQ3VzdG9tU2NoZW1hO1xyXG5leHBvcnQgdHlwZSBRdWVyeVN0cmluZ01hY2hpbmVTY2hlbWEgPSBTY2hlbWE7XHJcblxyXG50eXBlIFVucGFyc2VkVmFsdWUgPSBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xyXG50eXBlIFBhcnNlZFZhbHVlPFMgZXh0ZW5kcyBTY2hlbWE+ID0gUmV0dXJuVHlwZTxTY2hlbWFUeXBlc1tTWyd0eXBlJ11dWydwYXJzZSddPjtcclxuXHJcbi8vIENvbnZlcnRzIGEgU2NoZW1hJ3MgdHlwZSB0byB0aGUgYWN0dWFsIFR5cGVzY3JpcHQgdHlwZSBpdCByZXByZXNlbnRzXHJcbnR5cGUgUXVlcnlNYWNoaW5lVHlwZVRvVHlwZTxUPiA9IFQgZXh0ZW5kcyAoICdmbGFnJyB8ICdib29sZWFuJyApID8gYm9vbGVhbiA6ICggVCBleHRlbmRzICdudW1iZXInID8gbnVtYmVyIDogKCBUIGV4dGVuZHMgJ3N0cmluZycgPyAoIHN0cmluZyB8IG51bGwgKSA6ICggVCBleHRlbmRzICdhcnJheScgPyBBbnlbXSA6IEFueSApICkgKTtcclxuXHJcbnR5cGUgUVNNU2NoZW1hT2JqZWN0ID0gUmVjb3JkPHN0cmluZywgU2NoZW1hPjtcclxuXHJcbmV4cG9ydCB0eXBlIFFTTVBhcnNlZFBhcmFtZXRlcnM8U2NoZW1hTWFwIGV4dGVuZHMgUVNNU2NoZW1hT2JqZWN0PiA9IHtcclxuICAvLyBXaWxsIHJldHVybiBhIG1hcCBvZiB0aGUgXCJyZXN1bHRcIiB0eXBlc1xyXG4gIFtQcm9wZXJ0eSBpbiBrZXlvZiBTY2hlbWFNYXBdOiBRdWVyeU1hY2hpbmVUeXBlVG9UeXBlPFNjaGVtYU1hcFsgUHJvcGVydHkgXVsgJ3R5cGUnIF0+XHJcbiAgLy8gU0NIRU1BX01BUCBhbGxvd2VkIHRvIGJlIHNldCBpbiB0eXBlc1xyXG59ICYgeyBTQ0hFTUFfTUFQPzogUVNNU2NoZW1hT2JqZWN0IH07XHJcblxyXG4vLyBJZiBhIHF1ZXJ5IHBhcmFtZXRlciBoYXMgcHJpdmF0ZTp0cnVlIGluIGl0cyBzY2hlbWEsIGl0IG11c3QgcGFzcyB0aGlzIHByZWRpY2F0ZSB0byBiZSByZWFkIGZyb20gdGhlIFVSTC5cclxuLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy83NDNcclxuY29uc3QgcHJpdmF0ZVByZWRpY2F0ZSA9ICgpID0+IHtcclxuICAvLyBUcnlpbmcgdG8gYWNjZXNzIGxvY2FsU3RvcmFnZSBtYXkgZmFpbCB3aXRoIGEgU2VjdXJpdHlFcnJvciBpZiBjb29raWVzIGFyZSBibG9ja2VkIGluIGEgY2VydGFpbiB3YXkuXHJcbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xYS9pc3N1ZXMvMzI5IGZvciBtb3JlIGluZm9ybWF0aW9uLlxyXG4gIHRyeSB7XHJcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oICdwaGV0VGVhbU1lbWJlcicgKSA9PT0gJ3RydWUnO1xyXG4gIH1cclxuICBjYXRjaCggZSApIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogVmFsaWQgcGFyYW1ldGVyIHN0cmluZ3MgYmVnaW4gd2l0aCA/IG9yIGFyZSB0aGUgZW1wdHkgc3RyaW5nLiAgVGhpcyBpcyB1c2VkIGZvciBhc3NlcnRpb25zIGluIHNvbWUgY2FzZXMgYW5kIGZvclxyXG4gKiB0aHJvd2luZyBFcnJvcnMgaW4gb3RoZXIgY2FzZXMuXHJcbiAqL1xyXG5jb25zdCBpc1BhcmFtZXRlclN0cmluZyA9ICggc3RyaW5nOiBzdHJpbmcgKTogYm9vbGVhbiA9PiBzdHJpbmcubGVuZ3RoID09PSAwIHx8IHN0cmluZy5zdGFydHNXaXRoKCAnPycgKTtcclxuXHJcbi8vIEp1c3QgcmV0dXJuIGEgdmFsdWUgdG8gZGVmaW5lIHRoZSBtb2R1bGUgZXhwb3J0LlxyXG4vLyBUaGlzIGV4YW1wbGUgcmV0dXJucyBhbiBvYmplY3QsIGJ1dCB0aGUgbW9kdWxlXHJcbi8vIGNhbiByZXR1cm4gYSBmdW5jdGlvbiBhcyB0aGUgZXhwb3J0ZWQgdmFsdWUuXHJcblxyXG4vKipcclxuICogSW4gb3JkZXIgdG8gc3VwcG9ydCBncmFjZWZ1bCBmYWlsdXJlcyBmb3IgdXNlci1zdXBwbGllZCB2YWx1ZXMsIHdlIGZhbGwgYmFjayB0byBkZWZhdWx0IHZhbHVlcyB3aGVuIHB1YmxpYzogdHJ1ZVxyXG4gKiBpcyBzcGVjaWZpZWQuICBJZiB0aGUgc2NoZW1hIGVudHJ5IGlzIHB1YmxpYzogZmFsc2UsIHRoZW4gYSBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQgaXMgdGhyb3duLlxyXG4gKiBUT0RPOiBQYXJhbWV0cmljIHR5cGluZywgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3F1ZXJ5LXN0cmluZy1tYWNoaW5lL2lzc3Vlcy80NVxyXG4gKi9cclxuY29uc3QgZ2V0VmFsaWRWYWx1ZSA9ICggcHJlZGljYXRlOiBib29sZWFuLCBrZXk6IHN0cmluZywgdmFsdWU6IEFueSwgc2NoZW1hOiBTY2hlbWEsIG1lc3NhZ2U6IHN0cmluZyApOiBBbnkgPT4ge1xyXG4gIGlmICggIXByZWRpY2F0ZSApIHtcclxuXHJcbiAgICBpZiAoIHNjaGVtYS5wdWJsaWMgKSB7XHJcbiAgICAgIFF1ZXJ5U3RyaW5nTWFjaGluZS5hZGRXYXJuaW5nKCBrZXksIHZhbHVlLCBtZXNzYWdlICk7XHJcbiAgICAgIGlmICggc2NoZW1hLmhhc093blByb3BlcnR5KCAnZGVmYXVsdFZhbHVlJyApICkge1xyXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgICAgICB2YWx1ZSA9IHNjaGVtYS5kZWZhdWx0VmFsdWU7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgY29uc3QgdHlwZVNjaGVtYSA9IFRZUEVTWyBzY2hlbWEudHlwZSBdO1xyXG4gICAgICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggdHlwZVNjaGVtYS5oYXNPd25Qcm9wZXJ0eSggJ2RlZmF1bHRWYWx1ZScgKSxcclxuICAgICAgICAgICdUeXBlIG11c3QgaGF2ZSBhIGRlZmF1bHQgdmFsdWUgaWYgdGhlIHByb3ZpZGVkIHNjaGVtYSBkb2VzIG5vdCBoYXZlIG9uZS4nICk7XHJcbiAgICAgICAgdmFsdWUgPSB0eXBlU2NoZW1hLmRlZmF1bHRWYWx1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggcHJlZGljYXRlLCBtZXNzYWdlICk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiB2YWx1ZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBRdWVyeSBTdHJpbmcgTWFjaGluZSBpcyBhIHF1ZXJ5IHN0cmluZyBwYXJzZXIgdGhhdCBzdXBwb3J0cyB0eXBlIGNvZXJjaW9uLCBkZWZhdWx0IHZhbHVlcyAmIHZhbGlkYXRpb24uIFBsZWFzZVxyXG4gKiB2aXNpdCBQaEVUJ3MgPGEgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xdWVyeS1zdHJpbmctbWFjaGluZVwiIHRhcmdldD1cIl9ibGFua1wiPnF1ZXJ5LXN0cmluZy1tYWNoaW5lPC9hPlxyXG4gKiByZXBvc2l0b3J5IGZvciBkb2N1bWVudGF0aW9uIGFuZCBleGFtcGxlcy5cclxuICovXHJcbmV4cG9ydCBjb25zdCBRdWVyeVN0cmluZ01hY2hpbmUgPSB7XHJcblxyXG4gIC8vIHB1YmxpYyAocmVhZC1vbmx5KSB7e2tleTpzdHJpbmcsIHZhbHVlOnsqfSwgbWVzc2FnZTpzdHJpbmd9W119IC0gY2xlYXJlZCBieSBzb21lIHRlc3RzIGluIFF1ZXJ5U3RyaW5nTWFjaGluZVRlc3RzLmpzXHJcbiAgLy8gU2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5hZGRXYXJuaW5nIGZvciBhIGRlc2NyaXB0aW9uIG9mIHRoZXNlIGZpZWxkcywgYW5kIHRvIGFkZCB3YXJuaW5ncy5cclxuICB3YXJuaW5nczogW10gYXMgV2FybmluZ1tdLFxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSB2YWx1ZSBmb3IgYSBzaW5nbGUgcXVlcnkgcGFyYW1ldGVyLlxyXG4gICAqXHJcbiAgICovXHJcbiAgZ2V0OiBmdW5jdGlvbiA8UyBleHRlbmRzIFNjaGVtYT4oIGtleTogc3RyaW5nLCBzY2hlbWE6IFMgKTogUGFyc2VkVmFsdWU8Uz4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0Rm9yU3RyaW5nKCBrZXksIHNjaGVtYSwgd2luZG93LmxvY2F0aW9uLnNlYXJjaCApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdmFsdWVzIGZvciBldmVyeSBxdWVyeSBwYXJhbWV0ZXIsIHVzaW5nIHRoZSBzcGVjaWZpZWQgc2NoZW1hIG1hcC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBzY2hlbWFNYXAgLSBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldEFsbEZvclN0cmluZ1xyXG4gICAqIEByZXR1cm5zIC0gc2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRBbGxGb3JTdHJpbmdcclxuICAgKi9cclxuICBnZXRBbGw6IGZ1bmN0aW9uIDxTY2hlbWFNYXAgZXh0ZW5kcyBRU01TY2hlbWFPYmplY3Q+KCBzY2hlbWFNYXA6IFNjaGVtYU1hcCApOiBRU01QYXJzZWRQYXJhbWV0ZXJzPFNjaGVtYU1hcD4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsRm9yU3RyaW5nKCBzY2hlbWFNYXAsIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBMaWtlIGBnZXRgIGJ1dCBmb3IgYW4gYXJiaXRyYXJ5IHBhcmFtZXRlciBzdHJpbmcuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBuYW1lXHJcbiAgICogQHBhcmFtIHNjaGVtYSAtIHNlZSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0XHJcbiAgICogQHBhcmFtIHN0cmluZyAtIHRoZSBwYXJhbWV0ZXJzIHN0cmluZy4gIE11c3QgYmVnaW4gd2l0aCAnPycgb3IgYmUgdGhlIGVtcHR5IHN0cmluZ1xyXG4gICAqIEByZXR1cm5zIC0gcXVlcnkgcGFyYW1ldGVyIHZhbHVlLCBjb252ZXJ0ZWQgdG8gdGhlIHByb3BlciB0eXBlXHJcbiAgICovXHJcbiAgZ2V0Rm9yU3RyaW5nOiBmdW5jdGlvbiA8UyBleHRlbmRzIFNjaGVtYT4oIGtleTogc3RyaW5nLCBzY2hlbWE6IFMsIHN0cmluZzogc3RyaW5nICk6IFBhcnNlZFZhbHVlPFM+IHtcclxuXHJcbiAgICBpZiAoICFpc1BhcmFtZXRlclN0cmluZyggc3RyaW5nICkgKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvciggYFF1ZXJ5IHN0cmluZ3Mgc2hvdWxkIGJlIGVpdGhlciB0aGUgZW1wdHkgc3RyaW5nIG9yIHN0YXJ0IHdpdGggYSBcIj9cIjogJHtzdHJpbmd9YCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIElnbm9yZSBVUkwgdmFsdWVzIGZvciBwcml2YXRlIHF1ZXJ5IHBhcmFtZXRlcnMgdGhhdCBmYWlsIHByaXZhdGVQcmVkaWNhdGUuXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzc0My5cclxuICAgIGNvbnN0IHZhbHVlcyA9ICggc2NoZW1hLnByaXZhdGUgJiYgIXByaXZhdGVQcmVkaWNhdGUoKSApID8gW10gOiBnZXRWYWx1ZXMoIGtleSwgc3RyaW5nICk7XHJcblxyXG4gICAgdmFsaWRhdGVTY2hlbWEoIGtleSwgc2NoZW1hICk7XHJcblxyXG4gICAgbGV0IHZhbHVlID0gcGFyc2VWYWx1ZXMoIGtleSwgc2NoZW1hLCB2YWx1ZXMgKTtcclxuXHJcbiAgICBpZiAoIHNjaGVtYS5oYXNPd25Qcm9wZXJ0eSggJ3ZhbGlkVmFsdWVzJyApICkge1xyXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gVE9ETyBXaGF0IGlzIHRoZSBiZXN0IHdheSB0byB0eXBlIG5hcnJvdyBzY2hlbWE/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xdWVyeS1zdHJpbmctbWFjaGluZS9pc3N1ZXMvNDVcclxuICAgICAgdmFsdWUgPSBnZXRWYWxpZFZhbHVlKCBpc1ZhbGlkVmFsdWUoIHZhbHVlLCBzY2hlbWEudmFsaWRWYWx1ZXMgKSwga2V5LCB2YWx1ZSwgc2NoZW1hLFxyXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBUT0RPIFdoYXQgaXMgdGhlIGJlc3Qgd2F5IHRvIHR5cGUgbmFycm93IHNjaGVtYT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3F1ZXJ5LXN0cmluZy1tYWNoaW5lL2lzc3Vlcy80NVxyXG4gICAgICAgIGBJbnZhbGlkIHZhbHVlIHN1cHBsaWVkIGZvciBrZXkgXCIke2tleX1cIjogJHt2YWx1ZX0gaXMgbm90IGEgbWVtYmVyIG9mIHZhbGlkIHZhbHVlczogJHtzY2hlbWEudmFsaWRWYWx1ZXMuam9pbiggJywgJyApfWBcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpc1ZhbGlkVmFsdWUgZXZhbHVhdGVzIHRvIHRydWVcclxuICAgIGVsc2UgaWYgKCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICdpc1ZhbGlkVmFsdWUnICkgKSB7XHJcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBUT0RPIFdoYXQgaXMgdGhlIGJlc3Qgd2F5IHRvIHR5cGUgbmFycm93IHNjaGVtYT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3F1ZXJ5LXN0cmluZy1tYWNoaW5lL2lzc3Vlcy80NVxyXG4gICAgICB2YWx1ZSA9IGdldFZhbGlkVmFsdWUoIHNjaGVtYS5pc1ZhbGlkVmFsdWUoIHZhbHVlICksIGtleSwgdmFsdWUsIHNjaGVtYSxcclxuICAgICAgICBgSW52YWxpZCB2YWx1ZSBzdXBwbGllZCBmb3Iga2V5IFwiJHtrZXl9XCI6ICR7dmFsdWV9YFxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCB2YWx1ZVZhbGlkID0gVFlQRVNbIHNjaGVtYS50eXBlIF0uaXNWYWxpZFZhbHVlKCB2YWx1ZSApO1xyXG5cclxuICAgIC8vIHN1cHBvcnQgY3VzdG9tIHZhbGlkYXRpb24gZm9yIGVsZW1lbnRTY2hlbWEgZm9yIGFycmF5c1xyXG4gICAgaWYgKCBzY2hlbWEudHlwZSA9PT0gJ2FycmF5JyAmJiBBcnJheS5pc0FycmF5KCB2YWx1ZSApICkge1xyXG4gICAgICBsZXQgZWxlbWVudHNWYWxpZCA9IHRydWU7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHZhbHVlLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB2YWx1ZVsgaSBdO1xyXG4gICAgICAgIGlmICggIVRZUEVTWyBzY2hlbWEuZWxlbWVudFNjaGVtYS50eXBlIF0uaXNWYWxpZFZhbHVlKCBlbGVtZW50ICkgKSB7XHJcbiAgICAgICAgICBlbGVtZW50c1ZhbGlkID0gZmFsc2U7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIFRPRE8gV2hhdCBpcyB0aGUgYmVzdCB3YXkgdG8gdHlwZSBuYXJyb3cgc2NoZW1hPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVlcnktc3RyaW5nLW1hY2hpbmUvaXNzdWVzLzQ1XHJcbiAgICAgICAgaWYgKCBzY2hlbWEuZWxlbWVudFNjaGVtYS5oYXNPd25Qcm9wZXJ0eSggJ2lzVmFsaWRWYWx1ZScgKSAmJiAhc2NoZW1hLmVsZW1lbnRTY2hlbWEuaXNWYWxpZFZhbHVlKCBlbGVtZW50ICkgKSB7XHJcbiAgICAgICAgICBlbGVtZW50c1ZhbGlkID0gZmFsc2U7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIFRPRE8gV2hhdCBpcyB0aGUgYmVzdCB3YXkgdG8gdHlwZSBuYXJyb3cgc2NoZW1hPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVlcnktc3RyaW5nLW1hY2hpbmUvaXNzdWVzLzQ1XHJcbiAgICAgICAgaWYgKCBzY2hlbWEuZWxlbWVudFNjaGVtYS5oYXNPd25Qcm9wZXJ0eSggJ3ZhbGlkVmFsdWVzJyApICYmICFpc1ZhbGlkVmFsdWUoIGVsZW1lbnQsIHNjaGVtYS5lbGVtZW50U2NoZW1hLnZhbGlkVmFsdWVzICkgKSB7XHJcbiAgICAgICAgICBlbGVtZW50c1ZhbGlkID0gZmFsc2U7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgdmFsdWVWYWxpZCA9IHZhbHVlVmFsaWQgJiYgZWxlbWVudHNWYWxpZDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBkaXNwYXRjaCBmdXJ0aGVyIHZhbGlkYXRpb24gdG8gYSB0eXBlLXNwZWNpZmljIGZ1bmN0aW9uXHJcbiAgICB2YWx1ZSA9IGdldFZhbGlkVmFsdWUoIHZhbHVlVmFsaWQsIGtleSwgdmFsdWUsIHNjaGVtYSwgYEludmFsaWQgdmFsdWUgZm9yIHR5cGUsIGtleTogJHtrZXl9YCApO1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIExpa2UgYGdldEFsbGAgYnV0IGZvciBhbiBhcmJpdHJhcnkgcGFyYW1ldGVycyBzdHJpbmcuXHJcbiAgICogQHBhcmFtIHNjaGVtYU1hcCAtIGtleS92YWx1ZSBwYWlycywga2V5IGlzIHF1ZXJ5IHBhcmFtZXRlciBuYW1lIGFuZCB2YWx1ZSBpcyBhIHNjaGVtYVxyXG4gICAqIEBwYXJhbSBzdHJpbmcgLSB0aGUgcGFyYW1ldGVycyBzdHJpbmdcclxuICAgKiBAcmV0dXJucyAtIGtleS92YWx1ZSBwYWlycyBob2xkaW5nIHRoZSBwYXJzZWQgcmVzdWx0c1xyXG4gICAqL1xyXG4gIGdldEFsbEZvclN0cmluZzogZnVuY3Rpb24gPFNjaGVtYU1hcCBleHRlbmRzIFFTTVNjaGVtYU9iamVjdD4oIHNjaGVtYU1hcDogU2NoZW1hTWFwLCBzdHJpbmc6IHN0cmluZyApOiBRU01QYXJzZWRQYXJhbWV0ZXJzPFNjaGVtYU1hcD4ge1xyXG4gICAgY29uc3QgcmVzdWx0ID0ge30gYXMgdW5rbm93biBhcyBRU01QYXJzZWRQYXJhbWV0ZXJzPFNjaGVtYU1hcD47XHJcblxyXG4gICAgZm9yICggY29uc3Qga2V5IGluIHNjaGVtYU1hcCApIHtcclxuICAgICAgaWYgKCBzY2hlbWFNYXAuaGFzT3duUHJvcGVydHkoIGtleSApICkge1xyXG4gICAgICAgIHJlc3VsdFsga2V5IF0gPSB0aGlzLmdldEZvclN0cmluZygga2V5LCBzY2hlbWFNYXBbIGtleSBdLCBzdHJpbmcgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggY29udGFpbnMgdGhlIGdpdmVuIGtleVxyXG4gICAqIEByZXR1cm5zIC0gdHJ1ZSBpZiB0aGUgd2luZG93LmxvY2F0aW9uLnNlYXJjaCBjb250YWlucyB0aGUgZ2l2ZW4ga2V5XHJcbiAgICovXHJcbiAgY29udGFpbnNLZXk6IGZ1bmN0aW9uKCBrZXk6IHN0cmluZyApOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmNvbnRhaW5zS2V5Rm9yU3RyaW5nKCBrZXksIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIHN0cmluZyBjb250YWlucyB0aGUgc3BlY2lmaWVkIGtleVxyXG4gICAqIEBwYXJhbSBrZXkgLSB0aGUga2V5IHRvIGNoZWNrIGZvclxyXG4gICAqIEBwYXJhbSBzdHJpbmcgLSB0aGUgcXVlcnkgc3RyaW5nIHRvIHNlYXJjaC4gTXVzdCBiZWdpbiB3aXRoICc/JyBvciBiZSB0aGUgZW1wdHkgc3RyaW5nXHJcbiAgICogQHJldHVybnMgLSB0cnVlIGlmIHRoZSBnaXZlbiBzdHJpbmcgY29udGFpbnMgdGhlIGdpdmVuIGtleVxyXG4gICAqL1xyXG4gIGNvbnRhaW5zS2V5Rm9yU3RyaW5nOiBmdW5jdGlvbigga2V5OiBzdHJpbmcsIHN0cmluZzogc3RyaW5nICk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCAhaXNQYXJhbWV0ZXJTdHJpbmcoIHN0cmluZyApICkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGBRdWVyeSBzdHJpbmdzIHNob3VsZCBiZSBlaXRoZXIgdGhlIGVtcHR5IHN0cmluZyBvciBzdGFydCB3aXRoIGEgXCI/XCI6ICR7c3RyaW5nfWAgKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHZhbHVlcyA9IGdldFZhbHVlcygga2V5LCBzdHJpbmcgKTtcclxuICAgIHJldHVybiB2YWx1ZXMubGVuZ3RoID4gMDtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIG9iamVjdHMgYXJlIGVxdWFsLiAgRXhwb3J0ZWQgb24gdGhlIFF1ZXJ5U3RyaW5nTWFjaGluZSBmb3IgdGVzdGluZy4gIE9ubHkgd29ya3MgZm9yXHJcbiAgICogYXJyYXlzIG9iamVjdHMgdGhhdCBjb250YWluIHByaW1pdGl2ZXMgKGkuZS4gdGVybWluYWxzIGFyZSBjb21wYXJlZCB3aXRoID09PSlcclxuICAgKiBwcml2YXRlIC0gaG93ZXZlciwgaXQgaXMgY2FsbGVkIGZyb20gUXVlcnlTdHJpbmdNYWNoaW5lVGVzdHNcclxuICAgKi9cclxuICBkZWVwRXF1YWxzOiBmdW5jdGlvbiggYTogQW55LCBiOiBBbnkgKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoIHR5cGVvZiBhICE9PSB0eXBlb2YgYiApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaWYgKCB0eXBlb2YgYSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIGEgPT09ICdudW1iZXInIHx8IHR5cGVvZiBhID09PSAnYm9vbGVhbicgKSB7XHJcbiAgICAgIHJldHVybiBhID09PSBiO1xyXG4gICAgfVxyXG4gICAgaWYgKCBhID09PSBudWxsICYmIGIgPT09IG51bGwgKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgaWYgKCBhID09PSB1bmRlZmluZWQgJiYgYiA9PT0gdW5kZWZpbmVkICkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGlmICggYSA9PT0gbnVsbCAmJiBiID09PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmICggYSA9PT0gdW5kZWZpbmVkICYmIGIgPT09IG51bGwgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGNvbnN0IGFLZXlzID0gT2JqZWN0LmtleXMoIGEgKTtcclxuICAgIGNvbnN0IGJLZXlzID0gT2JqZWN0LmtleXMoIGIgKTtcclxuICAgIGlmICggYUtleXMubGVuZ3RoICE9PSBiS2V5cy5sZW5ndGggKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBhS2V5cy5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgIHJldHVybiBhID09PSBiO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGFLZXlzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGlmICggYUtleXNbIGkgXSAhPT0gYktleXNbIGkgXSApIHtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgYUNoaWxkID0gYVsgYUtleXNbIGkgXSBdO1xyXG4gICAgICAgIGNvbnN0IGJDaGlsZCA9IGJbIGFLZXlzWyBpIF0gXTtcclxuICAgICAgICBpZiAoICFRdWVyeVN0cmluZ01hY2hpbmUuZGVlcEVxdWFscyggYUNoaWxkLCBiQ2hpbGQgKSApIHtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG5ldyBVUkwgYnV0IHdpdGhvdXQgdGhlIGtleS12YWx1ZSBwYWlyLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHF1ZXJ5U3RyaW5nIC0gdGFpbCBvZiBhIFVSTCBpbmNsdWRpbmcgdGhlIGJlZ2lubmluZyAnPycgKGlmIGFueSlcclxuICAgKiBAcGFyYW0ga2V5XHJcbiAgICovXHJcbiAgcmVtb3ZlS2V5VmFsdWVQYWlyOiBmdW5jdGlvbiggcXVlcnlTdHJpbmc6IHN0cmluZywga2V5OiBzdHJpbmcgKTogc3RyaW5nIHtcclxuICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggdHlwZW9mIHF1ZXJ5U3RyaW5nID09PSAnc3RyaW5nJywgYHVybCBzaG91bGQgYmUgc3RyaW5nLCBidXQgaXQgd2FzOiAke3R5cGVvZiBxdWVyeVN0cmluZ31gICk7XHJcbiAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnLCBgdXJsIHNob3VsZCBiZSBzdHJpbmcsIGJ1dCBpdCB3YXM6ICR7dHlwZW9mIGtleX1gICk7XHJcbiAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIGlzUGFyYW1ldGVyU3RyaW5nKCBxdWVyeVN0cmluZyApLCAncXVlcnlTdHJpbmcgc2hvdWxkIGJlIGxlbmd0aCAwIG9yIGJlZ2luIHdpdGggPycgKTtcclxuICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCgga2V5Lmxlbmd0aCA+IDAsICd1cmwgc2hvdWxkIGJlIGEgc3RyaW5nIHdpdGggbGVuZ3RoID4gMCcgKTtcclxuXHJcbiAgICBpZiAoIHF1ZXJ5U3RyaW5nLnN0YXJ0c1dpdGgoICc/JyApICkge1xyXG4gICAgICBjb25zdCBuZXdQYXJhbWV0ZXJzID0gW107XHJcbiAgICAgIGNvbnN0IHF1ZXJ5ID0gcXVlcnlTdHJpbmcuc3Vic3RyaW5nKCAxICk7XHJcbiAgICAgIGNvbnN0IGVsZW1lbnRzID0gcXVlcnkuc3BsaXQoICcmJyApO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gZWxlbWVudHNbIGkgXTtcclxuICAgICAgICBjb25zdCBrZXlBbmRNYXliZVZhbHVlID0gZWxlbWVudC5zcGxpdCggJz0nICk7XHJcblxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRLZXkgPSBkZWNvZGVVUklDb21wb25lbnQoIGtleUFuZE1heWJlVmFsdWVbIDAgXSApO1xyXG4gICAgICAgIGlmICggZWxlbWVudEtleSAhPT0ga2V5ICkge1xyXG4gICAgICAgICAgbmV3UGFyYW1ldGVycy5wdXNoKCBlbGVtZW50ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIG5ld1BhcmFtZXRlcnMubGVuZ3RoID4gMCApIHtcclxuICAgICAgICByZXR1cm4gYD8ke25ld1BhcmFtZXRlcnMuam9pbiggJyYnICl9YDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gcXVlcnlTdHJpbmc7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGFsbCB0aGUga2V5cyBmcm9tIHRoZSBxdWVyeVN0cmluZyAob2sgaWYgdGhleSBkbyBub3QgYXBwZWFyIGF0IGFsbClcclxuICAgKi9cclxuICByZW1vdmVLZXlWYWx1ZVBhaXJzOiBmdW5jdGlvbiggcXVlcnlTdHJpbmc6IHN0cmluZywga2V5czogc3RyaW5nW10gKTogc3RyaW5nIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHF1ZXJ5U3RyaW5nID0gdGhpcy5yZW1vdmVLZXlWYWx1ZVBhaXIoIHF1ZXJ5U3RyaW5nLCBrZXlzWyBpIF0gKTtcclxuICAgIH1cclxuICAgIHJldHVybiBxdWVyeVN0cmluZztcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBBcHBlbmRzIGEgcXVlcnkgc3RyaW5nIHRvIGEgZ2l2ZW4gdXJsLlxyXG4gICAqIEBwYXJhbSB1cmwgLSBtYXkgb3IgbWF5IG5vdCBhbHJlYWR5IGhhdmUgb3RoZXIgcXVlcnkgcGFyYW1ldGVyc1xyXG4gICAqIEBwYXJhbSBxdWVyeVBhcmFtZXRlcnMgLSBtYXkgc3RhcnQgd2l0aCAnJywgJz8nIG9yICcmJ1xyXG4gICAqXHJcbiAgICogQGV4YW1wbGVcclxuICAgKiAvLyBMaW1pdCB0byB0aGUgc2Vjb25kIHNjcmVlblxyXG4gICAqIHNpbVVSTCA9IFF1ZXJ5U3RyaW5nTWFjaGluZS5hcHBlbmRRdWVyeVN0cmluZyggc2ltVVJMLCAnc2NyZWVucz0yJyApO1xyXG4gICAqL1xyXG4gIGFwcGVuZFF1ZXJ5U3RyaW5nOiBmdW5jdGlvbiggdXJsOiBzdHJpbmcsIHF1ZXJ5UGFyYW1ldGVyczogc3RyaW5nICk6IHN0cmluZyB7XHJcbiAgICBpZiAoIHF1ZXJ5UGFyYW1ldGVycy5zdGFydHNXaXRoKCAnPycgKSB8fCBxdWVyeVBhcmFtZXRlcnMuc3RhcnRzV2l0aCggJyYnICkgKSB7XHJcbiAgICAgIHF1ZXJ5UGFyYW1ldGVycyA9IHF1ZXJ5UGFyYW1ldGVycy5zdWJzdHJpbmcoIDEgKTtcclxuICAgIH1cclxuICAgIGlmICggcXVlcnlQYXJhbWV0ZXJzLmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgcmV0dXJuIHVybDtcclxuICAgIH1cclxuICAgIGNvbnN0IGNvbWJpbmF0aW9uID0gdXJsLmluY2x1ZGVzKCAnPycgKSA/ICcmJyA6ICc/JztcclxuICAgIHJldHVybiB1cmwgKyBjb21iaW5hdGlvbiArIHF1ZXJ5UGFyYW1ldGVycztcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBIZWxwZXIgZnVuY3Rpb24gZm9yIG11bHRpcGxlIHF1ZXJ5IHN0cmluZ3NcclxuICAgKiBAcGFyYW0gdXJsIC0gbWF5IG9yIG1heSBub3QgYWxyZWFkeSBoYXZlIG90aGVyIHF1ZXJ5IHBhcmFtZXRlcnNcclxuICAgKiBAcGFyYW0gcXVlcnlTdHJpbmdBcnJheSAtIGVhY2ggaXRlbSBtYXkgc3RhcnQgd2l0aCAnJywgJz8nLCBvciAnJidcclxuICAgKlxyXG4gICAqIEBleGFtcGxlXHJcbiAgICogc291cmNlRnJhbWUuc3JjID0gUXVlcnlTdHJpbmdNYWNoaW5lLmFwcGVuZFF1ZXJ5U3RyaW5nQXJyYXkoIHNpbVVSTCwgWyAnc2NyZWVucz0yJywgJ2ZyYW1lVGl0bGU9c291cmNlJyBdICk7XHJcbiAgICovXHJcbiAgYXBwZW5kUXVlcnlTdHJpbmdBcnJheTogZnVuY3Rpb24oIHVybDogc3RyaW5nLCBxdWVyeVN0cmluZ0FycmF5OiBzdHJpbmdbXSApOiBzdHJpbmcge1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHF1ZXJ5U3RyaW5nQXJyYXkubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHVybCA9IHRoaXMuYXBwZW5kUXVlcnlTdHJpbmcoIHVybCwgcXVlcnlTdHJpbmdBcnJheVsgaSBdICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdXJsO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHF1ZXJ5IHN0cmluZyBhdCB0aGUgZW5kIG9mIGEgdXJsLCBvciAnPycgaWYgdGhlcmUgaXMgbm9uZS5cclxuICAgKi9cclxuICBnZXRRdWVyeVN0cmluZzogZnVuY3Rpb24oIHVybDogc3RyaW5nICk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBpbmRleCA9IHVybC5pbmRleE9mKCAnPycgKTtcclxuXHJcbiAgICBpZiAoIGluZGV4ID49IDAgKSB7XHJcbiAgICAgIHJldHVybiB1cmwuc3Vic3RyaW5nKCBpbmRleCApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiAnPyc7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIHdhcm5pbmcgdG8gdGhlIGNvbnNvbGUgYW5kIFF1ZXJ5U3RyaW5nTWFjaGluZS53YXJuaW5ncyB0byBpbmRpY2F0ZSB0aGF0IHRoZSBwcm92aWRlZCBpbnZhbGlkIHZhbHVlIHdpbGxcclxuICAgKiBub3QgYmUgdXNlZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBrZXkgLSB0aGUgcXVlcnkgcGFyYW1ldGVyIG5hbWVcclxuICAgKiBAcGFyYW0gdmFsdWUgLSB0eXBlIGRlcGVuZHMgb24gc2NoZW1hIHR5cGVcclxuICAgKiBAcGFyYW0gbWVzc2FnZSAtIHRoZSBtZXNzYWdlIHRoYXQgaW5kaWNhdGVzIHRoZSBwcm9ibGVtIHdpdGggdGhlIHZhbHVlXHJcbiAgICovXHJcbiAgYWRkV2FybmluZzogZnVuY3Rpb24oIGtleTogc3RyaW5nLCB2YWx1ZTogQW55LCBtZXNzYWdlOiBzdHJpbmcgKTogdm9pZCB7XHJcblxyXG4gICAgbGV0IGlzRHVwbGljYXRlID0gZmFsc2U7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLndhcm5pbmdzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCB3YXJuaW5nID0gdGhpcy53YXJuaW5nc1sgaSBdO1xyXG4gICAgICBpZiAoIGtleSA9PT0gd2FybmluZy5rZXkgJiYgdmFsdWUgPT09IHdhcm5pbmcudmFsdWUgJiYgbWVzc2FnZSA9PT0gd2FybmluZy5tZXNzYWdlICkge1xyXG4gICAgICAgIGlzRHVwbGljYXRlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKCAhaXNEdXBsaWNhdGUgKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybiggbWVzc2FnZSApO1xyXG5cclxuICAgICAgdGhpcy53YXJuaW5ncy5wdXNoKCB7XHJcbiAgICAgICAga2V5OiBrZXksXHJcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgaWYgdGhlcmUgaXMgYSB3YXJuaW5nIGZvciBhIHNwZWNpZmllZCBrZXkuXHJcbiAgICovXHJcbiAgaGFzV2FybmluZzogZnVuY3Rpb24oIGtleTogc3RyaW5nICk6IGJvb2xlYW4ge1xyXG4gICAgbGV0IGhhc1dhcm5pbmcgPSBmYWxzZTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMud2FybmluZ3MubGVuZ3RoICYmICFoYXNXYXJuaW5nOyBpKysgKSB7XHJcbiAgICAgIGhhc1dhcm5pbmcgPSAoIHRoaXMud2FybmluZ3NbIGkgXS5rZXkgPT09IGtleSApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGhhc1dhcm5pbmc7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHF1ZXJ5U3RyaW5nIC0gdGFpbCBvZiBhIFVSTCBpbmNsdWRpbmcgdGhlIGJlZ2lubmluZyAnPycgKGlmIGFueSlcclxuICAgKiBAcmV0dXJucyAtIHRoZSBzcGxpdCB1cCBzdGlsbC1VUkktZW5jb2RlZCBwYXJhbWV0ZXJzICh3aXRoIHZhbHVlcyBpZiBwcmVzZW50KVxyXG4gICAqL1xyXG4gIGdldFF1ZXJ5UGFyYW1ldGVyc0Zyb21TdHJpbmc6IGZ1bmN0aW9uKCBxdWVyeVN0cmluZzogc3RyaW5nICk6IHN0cmluZ1tdIHtcclxuICAgIGlmICggcXVlcnlTdHJpbmcuc3RhcnRzV2l0aCggJz8nICkgKSB7XHJcbiAgICAgIGNvbnN0IHF1ZXJ5ID0gcXVlcnlTdHJpbmcuc3Vic3RyaW5nKCAxICk7XHJcbiAgICAgIHJldHVybiBxdWVyeS5zcGxpdCggJyYnICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gW107XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIga2V5IHRvIHJldHVybiBpZiBwcmVzZW50XHJcbiAgICogQHBhcmFtIHN0cmluZyAtIGEgVVJMIGluY2x1ZGluZyBhIFwiP1wiIGlmIGl0IGhhcyBhIHF1ZXJ5IHN0cmluZ1xyXG4gICAqIEByZXR1cm5zIC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBhcyBpdCBhcHBlYXJzIGluIHRoZSBVUkwsIGxpa2UgYGtleT1WQUxVRWAsIG9yIG51bGwgaWYgbm90IHByZXNlbnRcclxuICAgKi9cclxuICBnZXRTaW5nbGVRdWVyeVBhcmFtZXRlclN0cmluZzogZnVuY3Rpb24oIGtleTogc3RyaW5nLCBzdHJpbmc6IHN0cmluZyApOiBzdHJpbmcgfCBudWxsIHtcclxuICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gdGhpcy5nZXRRdWVyeVN0cmluZyggc3RyaW5nICk7XHJcbiAgICBjb25zdCBxdWVyeVBhcmFtZXRlcnMgPSB0aGlzLmdldFF1ZXJ5UGFyYW1ldGVyc0Zyb21TdHJpbmcoIHF1ZXJ5U3RyaW5nICk7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcXVlcnlQYXJhbWV0ZXJzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBxdWVyeVBhcmFtZXRlciA9IHF1ZXJ5UGFyYW1ldGVyc1sgaSBdO1xyXG4gICAgICBjb25zdCBrZXlBbmRNYXliZVZhbHVlID0gcXVlcnlQYXJhbWV0ZXIuc3BsaXQoICc9JyApO1xyXG5cclxuICAgICAgaWYgKCBkZWNvZGVVUklDb21wb25lbnQoIGtleUFuZE1heWJlVmFsdWVbIDAgXSApID09PSBrZXkgKSB7XHJcbiAgICAgICAgcmV0dXJuIHF1ZXJ5UGFyYW1ldGVyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFF1ZXJ5IHN0cmluZ3MgbWF5IHNob3cgdGhlIHNhbWUga2V5IGFwcGVhcmluZyBtdWx0aXBsZSB0aW1lcywgc3VjaCBhcyA/dmFsdWU9MiZ2YWx1ZT0zLlxyXG4gKiBUaGlzIG1ldGhvZCByZWNvdmVycyBhbGwgb2YgdGhlIHN0cmluZyB2YWx1ZXMuICBGb3IgdGhpcyBleGFtcGxlLCBpdCB3b3VsZCBiZSBbJzInLCczJ10uXHJcbiAqXHJcbiAqIEBwYXJhbSBrZXkgLSB0aGUga2V5IGZvciB3aGljaCB3ZSBhcmUgZmluZGluZyB2YWx1ZXMuXHJcbiAqIEBwYXJhbSBzdHJpbmcgLSB0aGUgcGFyYW1ldGVycyBzdHJpbmdcclxuICogQHJldHVybnMgLSB0aGUgcmVzdWx0aW5nIHZhbHVlcywgbnVsbCBpbmRpY2F0ZXMgdGhlIHF1ZXJ5IHBhcmFtZXRlciBpcyBwcmVzZW50IHdpdGggbm8gdmFsdWVcclxuICovXHJcbmNvbnN0IGdldFZhbHVlcyA9IGZ1bmN0aW9uKCBrZXk6IHN0cmluZywgc3RyaW5nOiBzdHJpbmcgKTogQXJyYXk8QW55IHwgbnVsbD4ge1xyXG4gIGNvbnN0IHZhbHVlcyA9IFtdO1xyXG4gIGNvbnN0IHBhcmFtcyA9IHN0cmluZy5zbGljZSggMSApLnNwbGl0KCAnJicgKTtcclxuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBwYXJhbXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICBjb25zdCBzcGxpdEJ5RXF1YWxzID0gcGFyYW1zWyBpIF0uc3BsaXQoICc9JyApO1xyXG4gICAgY29uc3QgbmFtZSA9IHNwbGl0QnlFcXVhbHNbIDAgXTtcclxuICAgIGNvbnN0IHZhbHVlID0gc3BsaXRCeUVxdWFscy5zbGljZSggMSApLmpvaW4oICc9JyApOyAvLyBTdXBwb3J0IGFyYml0cmFyeSBudW1iZXIgb2YgJz0nIGluIHRoZSB2YWx1ZVxyXG4gICAgaWYgKCBuYW1lID09PSBrZXkgKSB7XHJcbiAgICAgIGlmICggdmFsdWUgKSB7XHJcbiAgICAgICAgdmFsdWVzLnB1c2goIGRlY29kZVVSSUNvbXBvbmVudCggdmFsdWUgKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHZhbHVlcy5wdXNoKCBudWxsICk7IC8vIG5vIHZhbHVlIHByb3ZpZGVkXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHZhbHVlcztcclxufTtcclxuXHJcbi8vIFNjaGVtYSB2YWxpZGF0aW9uID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIHRoZSBzY2hlbWEgZm9yIGEgcXVlcnkgcGFyYW1ldGVyLlxyXG4gKiBAcGFyYW0ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBuYW1lXHJcbiAqIEBwYXJhbSBzY2hlbWEgLSBzY2hlbWEgdGhhdCBkZXNjcmliZXMgdGhlIHF1ZXJ5IHBhcmFtZXRlciwgc2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRcclxuICovXHJcbmNvbnN0IHZhbGlkYXRlU2NoZW1hID0gZnVuY3Rpb24oIGtleTogc3RyaW5nLCBzY2hlbWE6IFNjaGVtYSApOiB2b2lkIHtcclxuXHJcbiAgLy8gdHlwZSBpcyByZXF1aXJlZFxyXG4gIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggc2NoZW1hLmhhc093blByb3BlcnR5KCAndHlwZScgKSwgYHR5cGUgZmllbGQgaXMgcmVxdWlyZWQgZm9yIGtleTogJHtrZXl9YCApO1xyXG5cclxuICAvLyB0eXBlIGlzIHZhbGlkXHJcbiAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBUWVBFUy5oYXNPd25Qcm9wZXJ0eSggc2NoZW1hLnR5cGUgKSwgYGludmFsaWQgdHlwZTogJHtzY2hlbWEudHlwZX0gZm9yIGtleTogJHtrZXl9YCApO1xyXG5cclxuICAvLyBwYXJzZSBpcyBhIGZ1bmN0aW9uXHJcbiAgaWYgKCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICdwYXJzZScgKSApIHtcclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBUT0RPIFdoYXQgaXMgdGhlIGJlc3Qgd2F5IHRvIHR5cGUgbmFycm93IHNjaGVtYT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3F1ZXJ5LXN0cmluZy1tYWNoaW5lL2lzc3Vlcy80NVxyXG4gICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCB0eXBlb2Ygc2NoZW1hLnBhcnNlID09PSAnZnVuY3Rpb24nLCBgcGFyc2UgbXVzdCBiZSBhIGZ1bmN0aW9uIGZvciBrZXk6ICR7a2V5fWAgKTtcclxuICB9XHJcblxyXG4gIC8vIHZhbGlkVmFsdWVzIGFuZCBpc1ZhbGlkVmFsdWUgYXJlIG9wdGlvbmFsIGFuZCBtdXR1YWxseSBleGNsdXNpdmVcclxuICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoICEoIHNjaGVtYS5oYXNPd25Qcm9wZXJ0eSggJ3ZhbGlkVmFsdWVzJyApICYmIHNjaGVtYS5oYXNPd25Qcm9wZXJ0eSggJ2lzVmFsaWRWYWx1ZScgKSApLFxyXG4gICAgYHZhbGlkVmFsdWVzIGFuZCBpc1ZhbGlkVmFsdWUgYXJlIG11dHVhbGx5IGV4Y2x1c2l2ZSBmb3Iga2V5OiAke2tleX1gICk7XHJcblxyXG4gIC8vIHZhbGlkVmFsdWVzIGlzIGFuIEFycmF5XHJcbiAgaWYgKCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICd2YWxpZFZhbHVlcycgKSApIHtcclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBUT0RPIFdoYXQgaXMgdGhlIGJlc3Qgd2F5IHRvIHR5cGUgbmFycm93IHNjaGVtYT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3F1ZXJ5LXN0cmluZy1tYWNoaW5lL2lzc3Vlcy80NVxyXG4gICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBBcnJheS5pc0FycmF5KCBzY2hlbWEudmFsaWRWYWx1ZXMgKSwgYGlzVmFsaWRWYWx1ZSBtdXN0IGJlIGFuIGFycmF5IGZvciBrZXk6ICR7a2V5fWAgKTtcclxuICB9XHJcblxyXG4gIC8vIGlzVmFsaWRWYWx1ZSBpcyBhIGZ1bmN0aW9uXHJcbiAgaWYgKCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICdpc1ZhbGlkVmFsdWUnICkgKSB7XHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gVE9ETyBXaGF0IGlzIHRoZSBiZXN0IHdheSB0byB0eXBlIG5hcnJvdyBzY2hlbWE/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xdWVyeS1zdHJpbmctbWFjaGluZS9pc3N1ZXMvNDVcclxuICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggdHlwZW9mIHNjaGVtYS5pc1ZhbGlkVmFsdWUgPT09ICdmdW5jdGlvbicsIGBpc1ZhbGlkVmFsdWUgbXVzdCBiZSBhIGZ1bmN0aW9uIGZvciBrZXk6ICR7a2V5fWAgKTtcclxuICB9XHJcblxyXG4gIC8vIGRlZmF1bHRWYWx1ZSBoYXMgdGhlIGNvcnJlY3QgdHlwZVxyXG4gIGlmICggc2NoZW1hLmhhc093blByb3BlcnR5KCAnZGVmYXVsdFZhbHVlJyApICkge1xyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIFRPRE8gV2hhdCBpcyB0aGUgYmVzdCB3YXkgdG8gdHlwZSBuYXJyb3cgc2NoZW1hPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVlcnktc3RyaW5nLW1hY2hpbmUvaXNzdWVzLzQ1XHJcbiAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIFRZUEVTWyBzY2hlbWEudHlwZSBdLmlzVmFsaWRWYWx1ZSggc2NoZW1hLmRlZmF1bHRWYWx1ZSApLCBgZGVmYXVsdFZhbHVlIGluY29ycmVjdCB0eXBlOiAke2tleX1gICk7XHJcbiAgfVxyXG5cclxuICAvLyB2YWxpZFZhbHVlcyBoYXZlIHRoZSBjb3JyZWN0IHR5cGVcclxuICBpZiAoIHNjaGVtYS5oYXNPd25Qcm9wZXJ0eSggJ3ZhbGlkVmFsdWVzJyApICkge1xyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIFRPRE8gV2hhdCBpcyB0aGUgYmVzdCB3YXkgdG8gdHlwZSBuYXJyb3cgc2NoZW1hPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVlcnktc3RyaW5nLW1hY2hpbmUvaXNzdWVzLzQ1XHJcbiAgICBzY2hlbWEudmFsaWRWYWx1ZXMuZm9yRWFjaCggdmFsdWUgPT4gcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBUWVBFU1sgc2NoZW1hLnR5cGUgXS5pc1ZhbGlkVmFsdWUoIHZhbHVlICksIGB2YWxpZFZhbHVlIGluY29ycmVjdCB0eXBlIGZvciBrZXk6ICR7a2V5fWAgKSApO1xyXG4gIH1cclxuXHJcbiAgLy8gZGVmYXVsdFZhbHVlIGlzIGEgbWVtYmVyIG9mIHZhbGlkVmFsdWVzXHJcbiAgaWYgKCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICdkZWZhdWx0VmFsdWUnICkgJiYgc2NoZW1hLmhhc093blByb3BlcnR5KCAndmFsaWRWYWx1ZXMnICkgKSB7XHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gVE9ETyBXaGF0IGlzIHRoZSBiZXN0IHdheSB0byB0eXBlIG5hcnJvdyBzY2hlbWE/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xdWVyeS1zdHJpbmctbWFjaGluZS9pc3N1ZXMvNDVcclxuICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggaXNWYWxpZFZhbHVlKCBzY2hlbWEuZGVmYXVsdFZhbHVlLCBzY2hlbWEudmFsaWRWYWx1ZXMgKSwgYGRlZmF1bHRWYWx1ZSBtdXN0IGJlIGEgbWVtYmVyIG9mIHZhbGlkVmFsdWVzLCBmb3Iga2V5OiAke2tleX1gICk7XHJcbiAgfVxyXG5cclxuICAvLyBkZWZhdWx0VmFsdWUgbXVzdCBleGlzdCBmb3IgYSBwdWJsaWMgc2NoZW1hIHNvIHRoZXJlJ3MgYSBmYWxsYmFjayBpbiBjYXNlIGEgdXNlciBwcm92aWRlcyBhbiBpbnZhbGlkIHZhbHVlLlxyXG4gIC8vIEhvd2V2ZXIsIGRlZmF1bHRWYWx1ZSBpcyBub3QgcmVxdWlyZWQgZm9yIGZsYWdzIHNpbmNlIHRoZXkncmUgb25seSBhIGtleS4gV2hpbGUgbWFya2luZyBhIGZsYWcgYXMgcHVibGljOiB0cnVlXHJcbiAgLy8gZG9lc24ndCBjaGFuZ2UgaXRzIGJlaGF2aW9yLCBpdCdzIGFsbG93ZWQgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZSBwdWJsaWMga2V5IGZvciBkb2N1bWVudGF0aW9uLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3F1ZXJ5LXN0cmluZy1tYWNoaW5lL2lzc3Vlcy80MVxyXG4gIGlmICggc2NoZW1hLmhhc093blByb3BlcnR5KCAncHVibGljJyApICYmIHNjaGVtYS5wdWJsaWMgJiYgc2NoZW1hLnR5cGUgIT09ICdmbGFnJyApIHtcclxuICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggc2NoZW1hLmhhc093blByb3BlcnR5KCAnZGVmYXVsdFZhbHVlJyApLCBgZGVmYXVsdFZhbHVlIGlzIHJlcXVpcmVkIHdoZW4gcHVibGljOiB0cnVlIGZvciBrZXk6ICR7a2V5fWAgKTtcclxuICB9XHJcblxyXG4gIC8vIHZlcmlmeSB0aGF0IHRoZSBzY2hlbWEgaGFzIGFwcHJvcHJpYXRlIHByb3BlcnRpZXNcclxuICB2YWxpZGF0ZVNjaGVtYVByb3BlcnRpZXMoIGtleSwgc2NoZW1hLCBUWVBFU1sgc2NoZW1hLnR5cGUgXS5yZXF1aXJlZCwgVFlQRVNbIHNjaGVtYS50eXBlIF0ub3B0aW9uYWwgKTtcclxuXHJcbiAgLy8gZGlzcGF0Y2ggZnVydGhlciB2YWxpZGF0aW9uIHRvIGFuIChvcHRpb25hbCkgdHlwZS1zcGVjaWZpYyBmdW5jdGlvblxyXG4gIGlmICggVFlQRVNbIHNjaGVtYS50eXBlIF0udmFsaWRhdGVTY2hlbWEgKSB7XHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gaGVscCBtZSwgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3F1ZXJ5LXN0cmluZy1tYWNoaW5lL2lzc3Vlcy80NVxyXG4gICAgVFlQRVNbIHNjaGVtYS50eXBlIF0udmFsaWRhdGVTY2hlbWEhKCBrZXksIHNjaGVtYSApO1xyXG4gIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgc2NoZW1hIGZvciB0eXBlICdhcnJheScuXHJcbiAqIEBwYXJhbSBrZXkgLSB0aGUgcXVlcnkgcGFyYW1ldGVyIG5hbWVcclxuICogQHBhcmFtIHNjaGVtYSAtIHNjaGVtYSB0aGF0IGRlc2NyaWJlcyB0aGUgcXVlcnkgcGFyYW1ldGVyLCBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldFxyXG4gKi9cclxuY29uc3QgdmFsaWRhdGVBcnJheVNjaGVtYSA9IGZ1bmN0aW9uKCBrZXk6IHN0cmluZywgc2NoZW1hOiBBcnJheVNjaGVtYSApOiB2b2lkIHtcclxuXHJcbiAgLy8gc2VwYXJhdG9yIGlzIGEgc2luZ2xlIGNoYXJhY3RlclxyXG4gIGlmICggc2NoZW1hLmhhc093blByb3BlcnR5KCAnc2VwYXJhdG9yJyApICkge1xyXG4gICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCB0eXBlb2Ygc2NoZW1hLnNlcGFyYXRvciA9PT0gJ3N0cmluZycgJiYgc2NoZW1hLnNlcGFyYXRvci5sZW5ndGggPT09IDEsIGBpbnZhbGlkIHNlcGFyYXRvcjogJHtzY2hlbWEuc2VwYXJhdG9yfSwgZm9yIGtleTogJHtrZXl9YCApO1xyXG4gIH1cclxuXHJcbiAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCAhc2NoZW1hLmVsZW1lbnRTY2hlbWEuaGFzT3duUHJvcGVydHkoICdwdWJsaWMnICksICdBcnJheSBlbGVtZW50cyBzaG91bGQgbm90IGRlY2xhcmUgcHVibGljOyBpdCBjb21lcyBmcm9tIHRoZSBhcnJheSBzY2hlbWEgaXRzZWxmLicgKTtcclxuXHJcbiAgLy8gdmFsaWRhdGUgZWxlbWVudFNjaGVtYVxyXG4gIHZhbGlkYXRlU2NoZW1hKCBgJHtrZXl9LmVsZW1lbnRgLCBzY2hlbWEuZWxlbWVudFNjaGVtYSApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFZlcmlmaWVzIHRoYXQgYSBzY2hlbWEgY29udGFpbnMgb25seSBzdXBwb3J0ZWQgcHJvcGVydGllcywgYW5kIGNvbnRhaW5zIGFsbCByZXF1aXJlZCBwcm9wZXJ0aWVzLlxyXG4gKiBAcGFyYW0ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBuYW1lXHJcbiAqIEBwYXJhbSBzY2hlbWEgLSBzY2hlbWEgdGhhdCBkZXNjcmliZXMgdGhlIHF1ZXJ5IHBhcmFtZXRlciwgc2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRcclxuICogQHBhcmFtIHJlcXVpcmVkUHJvcGVydGllcyAtIHByb3BlcnRpZXMgdGhhdCB0aGUgc2NoZW1hIG11c3QgaGF2ZVxyXG4gKiBAcGFyYW0gb3B0aW9uYWxQcm9wZXJ0aWVzIC0gcHJvcGVydGllcyB0aGF0IHRoZSBzY2hlbWEgbWF5IG9wdGlvbmFsbHkgaGF2ZVxyXG4gKi9cclxuY29uc3QgdmFsaWRhdGVTY2hlbWFQcm9wZXJ0aWVzID0gZnVuY3Rpb24oIGtleTogc3RyaW5nLCBzY2hlbWE6IFNjaGVtYSwgcmVxdWlyZWRQcm9wZXJ0aWVzOiBzdHJpbmdbXSwgb3B0aW9uYWxQcm9wZXJ0aWVzOiBzdHJpbmdbXSApOiB2b2lkIHtcclxuXHJcbiAgLy8ge3N0cmluZ1tdfSwgdGhlIG5hbWVzIG9mIHRoZSBwcm9wZXJ0aWVzIGluIHRoZSBzY2hlbWFcclxuICBjb25zdCBzY2hlbWFQcm9wZXJ0aWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoIHNjaGVtYSApO1xyXG5cclxuICAvLyB2ZXJpZnkgdGhhdCBhbGwgcmVxdWlyZWQgcHJvcGVydGllcyBhcmUgcHJlc2VudFxyXG4gIHJlcXVpcmVkUHJvcGVydGllcy5mb3JFYWNoKCBwcm9wZXJ0eSA9PiB7XHJcbiAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIHNjaGVtYVByb3BlcnRpZXMuaW5jbHVkZXMoIHByb3BlcnR5ICksIGBtaXNzaW5nIHJlcXVpcmVkIHByb3BlcnR5OiAke3Byb3BlcnR5fSBmb3Iga2V5OiAke2tleX1gICk7XHJcbiAgfSApO1xyXG5cclxuICAvLyB2ZXJpZnkgdGhhdCB0aGVyZSBhcmUgbm8gdW5zdXBwb3J0ZWQgcHJvcGVydGllc1xyXG4gIGNvbnN0IHN1cHBvcnRlZFByb3BlcnRpZXMgPSByZXF1aXJlZFByb3BlcnRpZXMuY29uY2F0KCBvcHRpb25hbFByb3BlcnRpZXMgKTtcclxuICBzY2hlbWFQcm9wZXJ0aWVzLmZvckVhY2goIHByb3BlcnR5ID0+IHtcclxuICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggcHJvcGVydHkgPT09ICd0eXBlJyB8fCBzdXBwb3J0ZWRQcm9wZXJ0aWVzLmluY2x1ZGVzKCBwcm9wZXJ0eSApLCBgdW5zdXBwb3J0ZWQgcHJvcGVydHk6ICR7cHJvcGVydHl9IGZvciBrZXk6ICR7a2V5fWAgKTtcclxuICB9ICk7XHJcbn07XHJcblxyXG4vLyBQYXJzaW5nID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuLyoqXHJcbiAqIFVzZXMgdGhlIHN1cHBsaWVkIHNjaGVtYSB0byBjb252ZXJ0IHF1ZXJ5IHBhcmFtZXRlciB2YWx1ZShzKSBmcm9tIHN0cmluZyB0byB0aGUgZGVzaXJlZCB2YWx1ZSB0eXBlLlxyXG4gKiBAcGFyYW0ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBuYW1lXHJcbiAqIEBwYXJhbSBzY2hlbWEgLSBzY2hlbWEgdGhhdCBkZXNjcmliZXMgdGhlIHF1ZXJ5IHBhcmFtZXRlciwgc2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRcclxuICogQHBhcmFtIHZhbHVlcyAtIGFueSBtYXRjaGVzIGZyb20gdGhlIHF1ZXJ5IHN0cmluZyxcclxuICogICBjb3VsZCBiZSBtdWx0aXBsZSBmb3IgP3ZhbHVlPXgmdmFsdWU9eSBmb3IgZXhhbXBsZVxyXG4gKiBAcmV0dXJucyB0aGUgYXNzb2NpYXRlZCB2YWx1ZSwgY29udmVydGVkIHRvIHRoZSBwcm9wZXIgdHlwZVxyXG4gKi9cclxuY29uc3QgcGFyc2VWYWx1ZXMgPSBmdW5jdGlvbiA8UyBleHRlbmRzIFNjaGVtYT4oIGtleTogc3RyaW5nLCBzY2hlbWE6IFMsIHZhbHVlczogQXJyYXk8VW5wYXJzZWRWYWx1ZT4gKTogUGFyc2VkVmFsdWU8Uz4ge1xyXG4gIGxldCByZXR1cm5WYWx1ZTtcclxuXHJcbiAgLy8gdmFsdWVzIGNvbnRhaW5zIHZhbHVlcyBmb3IgYWxsIG9jY3VycmVuY2VzIG9mIHRoZSBxdWVyeSBwYXJhbWV0ZXIuICBXZSBjdXJyZW50bHkgc3VwcG9ydCBvbmx5IDEgb2NjdXJyZW5jZS5cclxuICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIHZhbHVlcy5sZW5ndGggPD0gMSwgYHF1ZXJ5IHBhcmFtZXRlciBjYW5ub3Qgb2NjdXIgbXVsdGlwbGUgdGltZXM6ICR7a2V5fWAgKTtcclxuXHJcbiAgaWYgKCBzY2hlbWEudHlwZSA9PT0gJ2ZsYWcnICkge1xyXG5cclxuICAgIC8vIGZsYWcgaXMgYSBjb252ZW5pZW50IHZhcmlhdGlvbiBvZiBib29sZWFuLCB3aGljaCBkZXBlbmRzIG9uIHdoZXRoZXIgdGhlIHF1ZXJ5IHN0cmluZyBpcyBwcmVzZW50IG9yIG5vdFxyXG4gICAgY29uc3QgdHlwZSA9IFRZUEVTWyBzY2hlbWEudHlwZSBdO1xyXG4gICAgcmV0dXJuVmFsdWUgPSB0eXBlLnBhcnNlKCBrZXksIHNjaGVtYSwgdmFsdWVzWyAwIF0gKTtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIHZhbHVlc1sgMCBdICE9PSB1bmRlZmluZWQgfHwgc2NoZW1hLmhhc093blByb3BlcnR5KCAnZGVmYXVsdFZhbHVlJyApLFxyXG4gICAgICBgbWlzc2luZyByZXF1aXJlZCBxdWVyeSBwYXJhbWV0ZXI6ICR7a2V5fWAgKTtcclxuICAgIGlmICggdmFsdWVzWyAwIF0gPT09IHVuZGVmaW5lZCApIHtcclxuXHJcbiAgICAgIC8vIG5vdCBpbiB0aGUgcXVlcnkgc3RyaW5nLCB1c2UgdGhlIGRlZmF1bHRcclxuICAgICAgcmV0dXJuVmFsdWUgPSBzY2hlbWEuZGVmYXVsdFZhbHVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICBjb25zdCB0eXBlID0gVFlQRVNbIHNjaGVtYS50eXBlIF07XHJcbiAgICAgIC8vIGRpc3BhdGNoIHBhcnNpbmcgb2YgcXVlcnkgc3RyaW5nIHRvIGEgdHlwZS1zcGVjaWZpYyBmdW5jdGlvblxyXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gc2NoZW1hIHNob3VsZCBiZSBzcGVjaWZpYyBmb3IgdGhhdCB0eXBlLiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVlcnktc3RyaW5nLW1hY2hpbmUvaXNzdWVzLzQ1XHJcbiAgICAgIHJldHVyblZhbHVlID0gdHlwZS5wYXJzZSgga2V5LCBzY2hlbWEsIHZhbHVlc1sgMCBdICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcmV0dXJuVmFsdWU7XHJcbn07XHJcblxyXG4vKipcclxuICogUGFyc2VzIHRoZSB2YWx1ZSBmb3IgYSB0eXBlICdmbGFnJy5cclxuICogQHBhcmFtIGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIgbmFtZVxyXG4gKiBAcGFyYW0gc2NoZW1hIC0gc2NoZW1hIHRoYXQgZGVzY3JpYmVzIHRoZSBxdWVyeSBwYXJhbWV0ZXIsIHNlZSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0XHJcbiAqIEBwYXJhbSB2YWx1ZSAtIHZhbHVlIGZyb20gdGhlIHF1ZXJ5IHBhcmFtZXRlciBzdHJpbmdcclxuICovXHJcbmNvbnN0IHBhcnNlRmxhZyA9IGZ1bmN0aW9uKCBrZXk6IHN0cmluZywgc2NoZW1hOiBGbGFnU2NoZW1hLCB2YWx1ZTogVW5wYXJzZWRWYWx1ZSApOiBib29sZWFuIHwgc3RyaW5nIHtcclxuICByZXR1cm4gdmFsdWUgPT09IG51bGwgPyB0cnVlIDogdmFsdWUgPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogdmFsdWU7XHJcbn07XHJcblxyXG4vKipcclxuICogUGFyc2VzIHRoZSB2YWx1ZSBmb3IgYSB0eXBlICdib29sZWFuJy5cclxuICogQHBhcmFtIGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIgbmFtZVxyXG4gKiBAcGFyYW0gc2NoZW1hIC0gc2NoZW1hIHRoYXQgZGVzY3JpYmVzIHRoZSBxdWVyeSBwYXJhbWV0ZXIsIHNlZSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0XHJcbiAqIEBwYXJhbSBzdHJpbmcgLSB2YWx1ZSBmcm9tIHRoZSBxdWVyeSBwYXJhbWV0ZXIgc3RyaW5nXHJcbiAqL1xyXG5jb25zdCBwYXJzZUJvb2xlYW4gPSBmdW5jdGlvbigga2V5OiBzdHJpbmcsIHNjaGVtYTogQm9vbGVhblNjaGVtYSwgc3RyaW5nOiBVbnBhcnNlZFZhbHVlICk6IGJvb2xlYW4gfCBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkIHtcclxuICByZXR1cm4gc3RyaW5nID09PSAndHJ1ZScgPyB0cnVlIDogc3RyaW5nID09PSAnZmFsc2UnID8gZmFsc2UgOiBzdHJpbmc7XHJcbn07XHJcblxyXG4vKipcclxuICogUGFyc2VzIHRoZSB2YWx1ZSBmb3IgYSB0eXBlICdudW1iZXInLlxyXG4gKiBAcGFyYW0ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBuYW1lXHJcbiAqIEBwYXJhbSBzY2hlbWEgLSBzY2hlbWEgdGhhdCBkZXNjcmliZXMgdGhlIHF1ZXJ5IHBhcmFtZXRlciwgc2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRcclxuICogQHBhcmFtIHN0cmluZyAtIHZhbHVlIGZyb20gdGhlIHF1ZXJ5IHBhcmFtZXRlciBzdHJpbmdcclxuICovXHJcbmNvbnN0IHBhcnNlTnVtYmVyID0gZnVuY3Rpb24oIGtleTogc3RyaW5nLCBzY2hlbWE6IE51bWJlclNjaGVtYSwgc3RyaW5nOiBVbnBhcnNlZFZhbHVlICk6IG51bWJlciB8IFVucGFyc2VkVmFsdWUge1xyXG4gIGNvbnN0IG51bWJlciA9IE51bWJlciggc3RyaW5nICk7XHJcbiAgcmV0dXJuIHN0cmluZyA9PT0gbnVsbCB8fCBpc05hTiggbnVtYmVyICkgPyBzdHJpbmcgOiBudW1iZXI7XHJcbn07XHJcblxyXG4vKipcclxuICogUGFyc2VzIHRoZSB2YWx1ZSBmb3IgYSB0eXBlICdudW1iZXInLlxyXG4gKiBUaGUgdmFsdWUgdG8gYmUgcGFyc2VkIGlzIGFscmVhZHkgc3RyaW5nLCBzbyBpdCBpcyBndWFyYW50ZWVkIHRvIHBhcnNlIGFzIGEgc3RyaW5nLlxyXG4gKiBAcGFyYW0ga2V5XHJcbiAqIEBwYXJhbSBzY2hlbWFcclxuICogQHBhcmFtIHN0cmluZ1xyXG4gKi9cclxuY29uc3QgcGFyc2VTdHJpbmcgPSBmdW5jdGlvbigga2V5OiBzdHJpbmcsIHNjaGVtYTogU3RyaW5nU2NoZW1hLCBzdHJpbmc6IFVucGFyc2VkVmFsdWUgKTogVW5wYXJzZWRWYWx1ZSB7XHJcbiAgcmV0dXJuIHN0cmluZztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBQYXJzZXMgdGhlIHZhbHVlIGZvciBhIHR5cGUgJ2FycmF5Jy5cclxuICogQHBhcmFtIGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIgbmFtZVxyXG4gKiBAcGFyYW0gc2NoZW1hIC0gc2NoZW1hIHRoYXQgZGVzY3JpYmVzIHRoZSBxdWVyeSBwYXJhbWV0ZXIsIHNlZSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0XHJcbiAqIEBwYXJhbSB2YWx1ZSAtIHZhbHVlIGZyb20gdGhlIHF1ZXJ5IHBhcmFtZXRlciBzdHJpbmdcclxuICovXHJcbmNvbnN0IHBhcnNlQXJyYXkgPSBmdW5jdGlvbigga2V5OiBzdHJpbmcsIHNjaGVtYTogQXJyYXlTY2hlbWEsIHZhbHVlOiBVbnBhcnNlZFZhbHVlICk6IEFycmF5PEFueT4ge1xyXG5cclxuICBsZXQgcmV0dXJuVmFsdWU7XHJcblxyXG4gIGlmICggdmFsdWUgPT09IG51bGwgKSB7XHJcblxyXG4gICAgLy8gbnVsbCBzaWduaWZpZXMgYW4gZW1wdHkgYXJyYXkuIEZvciBpbnN0YW5jZSA/c2NyZWVucz0gd291bGQgZ2l2ZSBbXVxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xdWVyeS1zdHJpbmctbWFjaGluZS9pc3N1ZXMvMTdcclxuICAgIHJldHVyblZhbHVlID0gW107XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG5cclxuICAgIC8vIFNwbGl0IHVwIHRoZSBzdHJpbmcgaW50byBhbiBhcnJheSBvZiB2YWx1ZXMuIEUuZy4gP3NjcmVlbnM9MSwyIHdvdWxkIGdpdmUgWzEsMl1cclxuICAgIHJldHVyblZhbHVlID0gdmFsdWUhLnNwbGl0KCBzY2hlbWEuc2VwYXJhdG9yIHx8IERFRkFVTFRfU0VQQVJBVE9SIClcclxuICAgICAgLm1hcCggZWxlbWVudCA9PiBwYXJzZVZhbHVlcygga2V5LCBzY2hlbWEuZWxlbWVudFNjaGVtYSwgWyBlbGVtZW50IF0gKSApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJldHVyblZhbHVlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFBhcnNlcyB0aGUgdmFsdWUgZm9yIGEgdHlwZSAnY3VzdG9tJy5cclxuICogQHBhcmFtIGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIgbmFtZVxyXG4gKiBAcGFyYW0gc2NoZW1hIC0gc2NoZW1hIHRoYXQgZGVzY3JpYmVzIHRoZSBxdWVyeSBwYXJhbWV0ZXIsIHNlZSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0XHJcbiAqIEBwYXJhbSB2YWx1ZSAtIHZhbHVlIGZyb20gdGhlIHF1ZXJ5IHBhcmFtZXRlciBzdHJpbmdcclxuICovXHJcbmNvbnN0IHBhcnNlQ3VzdG9tID0gZnVuY3Rpb24oIGtleTogc3RyaW5nLCBzY2hlbWE6IEN1c3RvbVNjaGVtYSwgdmFsdWU6IFVucGFyc2VkVmFsdWUgKTogQW55IHtcclxuICByZXR1cm4gc2NoZW1hLnBhcnNlKCB2YWx1ZSBhcyB1bmtub3duIGFzIHN0cmluZyApO1xyXG59O1xyXG5cclxuLy8gVXRpbGl0aWVzID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbi8qKlxyXG4gKiBEZXRlcm1pbmVzIGlmIHZhbHVlIGlzIGluIGEgc2V0IG9mIHZhbGlkIHZhbHVlcywgdXNlcyBkZWVwIGNvbXBhcmlzb24uXHJcbiAqL1xyXG5jb25zdCBpc1ZhbGlkVmFsdWUgPSBmdW5jdGlvbiggdmFsdWU6IEFueSwgdmFsaWRWYWx1ZXM6IEFueVtdICk6IGJvb2xlYW4ge1xyXG4gIGxldCBmb3VuZCA9IGZhbHNlO1xyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IHZhbGlkVmFsdWVzLmxlbmd0aCAmJiAhZm91bmQ7IGkrKyApIHtcclxuICAgIGZvdW5kID0gUXVlcnlTdHJpbmdNYWNoaW5lLmRlZXBFcXVhbHMoIHZhbGlkVmFsdWVzWyBpIF0sIHZhbHVlICk7XHJcbiAgfVxyXG4gIHJldHVybiBmb3VuZDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBRdWVyeSBwYXJhbWV0ZXJzIGFyZSBzcGVjaWZpZWQgYnkgdGhlIHVzZXIsIGFuZCBhcmUgb3V0c2lkZSB0aGUgY29udHJvbCBvZiB0aGUgcHJvZ3JhbW1lci5cclxuICogU28gdGhlIGFwcGxpY2F0aW9uIHNob3VsZCB0aHJvdyBhbiBFcnJvciBpZiBxdWVyeSBwYXJhbWV0ZXJzIGFyZSBpbnZhbGlkLlxyXG4gKiBAcGFyYW0gcHJlZGljYXRlIC0gaWYgcHJlZGljYXRlIGV2YWx1YXRlcyB0byBmYWxzZSwgYW4gRXJyb3IgaXMgdGhyb3duXHJcbiAqIEBwYXJhbSBtZXNzYWdlXHJcbiAqL1xyXG5jb25zdCBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQgPSBmdW5jdGlvbiggcHJlZGljYXRlOiBib29sZWFuLCBtZXNzYWdlOiBzdHJpbmcgKTogdm9pZCB7XHJcbiAgaWYgKCAhcHJlZGljYXRlICkge1xyXG4gICAgY29uc29sZSAmJiBjb25zb2xlLmxvZyAmJiBjb25zb2xlLmxvZyggbWVzc2FnZSApO1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCBgUXVlcnkgU3RyaW5nIE1hY2hpbmUgQXNzZXJ0aW9uIGZhaWxlZDogJHttZXNzYWdlfWAgKTtcclxuICB9XHJcbn07XHJcblxyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxudHlwZSBTY2hlbWFUeXBlPFQsIFNwZWNpZmljU2NoZW1hPiA9IHtcclxuICByZXF1aXJlZDogQXJyYXk8a2V5b2YgU3BlY2lmaWNTY2hlbWE+O1xyXG4gIG9wdGlvbmFsOiBBcnJheTxrZXlvZiBTcGVjaWZpY1NjaGVtYT47XHJcbiAgdmFsaWRhdGVTY2hlbWE6IG51bGwgfCAoICgga2V5OiBzdHJpbmcsIHNjaGVtYTogU3BlY2lmaWNTY2hlbWEgKSA9PiB2b2lkICk7XHJcbiAgcGFyc2U6ICgga2V5OiBzdHJpbmcsIHNjaGVtYTogU3BlY2lmaWNTY2hlbWEsIHZhbHVlOiBVbnBhcnNlZFZhbHVlICkgPT4gVDtcclxuICBpc1ZhbGlkVmFsdWU6ICggdmFsdWU6IEFueSApID0+IGJvb2xlYW47XHJcbiAgZGVmYXVsdFZhbHVlPzogVDtcclxufTtcclxuXHJcbi8vIFRPRE86IFRoZXNlIHN0cmluZ3Mgc2VlbSB3cm9uZywgbGV0J3Mgbm90IGRvIHRoYXQsIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xdWVyeS1zdHJpbmctbWFjaGluZS9pc3N1ZXMvNDVcclxudHlwZSBTY2hlbWFUeXBlcyA9IHtcclxuICBmbGFnOiBTY2hlbWFUeXBlPGJvb2xlYW4gfCBVbnBhcnNlZFZhbHVlLCBGbGFnU2NoZW1hPjtcclxuICBib29sZWFuOiBTY2hlbWFUeXBlPGJvb2xlYW4gfCBVbnBhcnNlZFZhbHVlLCBCb29sZWFuU2NoZW1hPjtcclxuICBudW1iZXI6IFNjaGVtYVR5cGU8bnVtYmVyIHwgVW5wYXJzZWRWYWx1ZSwgTnVtYmVyU2NoZW1hPjtcclxuICBzdHJpbmc6IFNjaGVtYVR5cGU8c3RyaW5nIHwgVW5wYXJzZWRWYWx1ZSwgU3RyaW5nU2NoZW1hPjtcclxuICBhcnJheTogU2NoZW1hVHlwZTxBbnlbXSwgQXJyYXlTY2hlbWE+O1xyXG4gIGN1c3RvbTogU2NoZW1hVHlwZTxBbnksIEN1c3RvbVNjaGVtYT47XHJcbn07XHJcblxyXG4vKipcclxuICogRGF0YSBzdHJ1Y3R1cmUgdGhhdCBkZXNjcmliZXMgZWFjaCBxdWVyeSBwYXJhbWV0ZXIgdHlwZSwgd2hpY2ggcHJvcGVydGllcyBhcmUgcmVxdWlyZWQgdnMgb3B0aW9uYWwsXHJcbiAqIGhvdyB0byB2YWxpZGF0ZSwgYW5kIGhvdyB0byBwYXJzZS5cclxuICpcclxuICogVGhlIHByb3BlcnRpZXMgdGhhdCBhcmUgcmVxdWlyZWQgb3Igb3B0aW9uYWwgZGVwZW5kIG9uIHRoZSB0eXBlIChzZWUgVFlQRVMpLCBhbmQgaW5jbHVkZTpcclxuICogdHlwZSAtIHtzdHJpbmd9IHRoZSB0eXBlIG5hbWVcclxuICogZGVmYXVsdFZhbHVlIC0gdGhlIHZhbHVlIHRvIHVzZSBpZiBubyBxdWVyeSBwYXJhbWV0ZXIgaXMgcHJvdmlkZWQuIElmIHRoZXJlIGlzIG5vIGRlZmF1bHRWYWx1ZSwgdGhlblxyXG4gKiAgICB0aGUgcXVlcnkgcGFyYW1ldGVyIGlzIHJlcXVpcmVkIGluIHRoZSBxdWVyeSBzdHJpbmc7IG9taXR0aW5nIHRoZSBxdWVyeSBwYXJhbWV0ZXIgd2lsbCByZXN1bHQgaW4gYW4gRXJyb3IuXHJcbiAqIHZhbGlkVmFsdWVzIC0gYXJyYXkgb2YgdGhlIHZhbGlkIHZhbHVlcyBmb3IgdGhlIHF1ZXJ5IHBhcmFtZXRlclxyXG4gKiBpc1ZhbGlkVmFsdWUgLSBmdW5jdGlvbiB0aGF0IHRha2VzIGEgcGFyc2VkIE9iamVjdCAobm90IHN0cmluZykgYW5kIGNoZWNrcyBpZiBpdCBpcyBhY2NlcHRhYmxlXHJcbiAqIGVsZW1lbnRTY2hlbWEgLSBzcGVjaWZpZXMgdGhlIHNjaGVtYSBmb3IgZWxlbWVudHMgaW4gYW4gYXJyYXlcclxuICogc2VwYXJhdG9yIC0gIGFycmF5IGVsZW1lbnRzIGFyZSBzZXBhcmF0ZWQgYnkgdGhpcyBzdHJpbmcsIGRlZmF1bHRzIHRvIGAsYFxyXG4gKiBwYXJzZSAtIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyBhIHN0cmluZyBhbmQgcmV0dXJucyBhbiBPYmplY3RcclxuICovXHJcbmNvbnN0IFRZUEVTOiBTY2hlbWFUeXBlcyA9IHtcclxuICAvLyBOT1RFOiBUeXBlcyBmb3IgdGhpcyBhcmUgY3VycmVudGx5IGluIHBoZXQtdHlwZXMuZC50cyEgQ2hhbmdlcyBoZXJlIHNob3VsZCBiZSBtYWRlIHRoZXJlIGFsc29cclxuXHJcbiAgLy8gdmFsdWUgaXMgdHJ1ZSBpZiBwcmVzZW50LCBmYWxzZSBpZiBhYnNlbnRcclxuICBmbGFnOiB7XHJcbiAgICByZXF1aXJlZDogW10sXHJcbiAgICBvcHRpb25hbDogWyAncHJpdmF0ZScsICdwdWJsaWMnIF0sXHJcbiAgICB2YWxpZGF0ZVNjaGVtYTogbnVsbCwgLy8gbm8gdHlwZS1zcGVjaWZpYyBzY2hlbWEgdmFsaWRhdGlvblxyXG4gICAgcGFyc2U6IHBhcnNlRmxhZyxcclxuICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gdmFsdWUgPT09IHRydWUgfHwgdmFsdWUgPT09IGZhbHNlLFxyXG4gICAgZGVmYXVsdFZhbHVlOiB0cnVlIC8vIG9ubHkgbmVlZGVkIGZvciBmbGFncyBtYXJrcyBhcyAncHVibGljOiB0cnVlYFxyXG4gIH0sXHJcblxyXG4gIC8vIHZhbHVlIGlzIGVpdGhlciB0cnVlIG9yIGZhbHNlLCBlLmcuIHNob3dBbnN3ZXI9dHJ1ZVxyXG4gIGJvb2xlYW46IHtcclxuICAgIHJlcXVpcmVkOiBbXSxcclxuICAgIG9wdGlvbmFsOiBbICdkZWZhdWx0VmFsdWUnLCAncHJpdmF0ZScsICdwdWJsaWMnIF0sXHJcbiAgICB2YWxpZGF0ZVNjaGVtYTogbnVsbCwgLy8gbm8gdHlwZS1zcGVjaWZpYyBzY2hlbWEgdmFsaWRhdGlvblxyXG4gICAgcGFyc2U6IHBhcnNlQm9vbGVhbixcclxuICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gdmFsdWUgPT09IHRydWUgfHwgdmFsdWUgPT09IGZhbHNlXHJcbiAgfSxcclxuXHJcbiAgLy8gdmFsdWUgaXMgYSBudW1iZXIsIGUuZy4gZnJhbWVSYXRlPTEwMFxyXG4gIG51bWJlcjoge1xyXG4gICAgcmVxdWlyZWQ6IFtdLFxyXG4gICAgb3B0aW9uYWw6IFsgJ2RlZmF1bHRWYWx1ZScsICd2YWxpZFZhbHVlcycsICdpc1ZhbGlkVmFsdWUnLCAncHJpdmF0ZScsICdwdWJsaWMnIF0sXHJcbiAgICB2YWxpZGF0ZVNjaGVtYTogbnVsbCwgLy8gbm8gdHlwZS1zcGVjaWZpYyBzY2hlbWEgdmFsaWRhdGlvblxyXG4gICAgcGFyc2U6IHBhcnNlTnVtYmVyLFxyXG4gICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc05hTiggdmFsdWUgKVxyXG4gIH0sXHJcblxyXG4gIC8vIHZhbHVlIGlzIGEgc3RyaW5nLCBlLmcuIG5hbWU9UmluZ29cclxuICBzdHJpbmc6IHtcclxuICAgIHJlcXVpcmVkOiBbXSxcclxuICAgIG9wdGlvbmFsOiBbICdkZWZhdWx0VmFsdWUnLCAndmFsaWRWYWx1ZXMnLCAnaXNWYWxpZFZhbHVlJywgJ3ByaXZhdGUnLCAncHVibGljJyBdLFxyXG4gICAgdmFsaWRhdGVTY2hlbWE6IG51bGwsIC8vIG5vIHR5cGUtc3BlY2lmaWMgc2NoZW1hIHZhbGlkYXRpb25cclxuICAgIHBhcnNlOiBwYXJzZVN0cmluZyxcclxuICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gdmFsdWUgPT09IG51bGwgfHwgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJ1xyXG4gIH0sXHJcblxyXG4gIC8vIHZhbHVlIGlzIGFuIGFycmF5LCBlLmcuIHNjcmVlbnM9MSwyLDNcclxuICBhcnJheToge1xyXG4gICAgcmVxdWlyZWQ6IFsgJ2VsZW1lbnRTY2hlbWEnIF0sXHJcbiAgICBvcHRpb25hbDogWyAnZGVmYXVsdFZhbHVlJywgJ3ZhbGlkVmFsdWVzJywgJ2lzVmFsaWRWYWx1ZScsICdzZXBhcmF0b3InLCAndmFsaWRWYWx1ZXMnLCAncHJpdmF0ZScsICdwdWJsaWMnIF0sXHJcbiAgICB2YWxpZGF0ZVNjaGVtYTogdmFsaWRhdGVBcnJheVNjaGVtYSxcclxuICAgIHBhcnNlOiBwYXJzZUFycmF5LFxyXG4gICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiBBcnJheS5pc0FycmF5KCB2YWx1ZSApIHx8IHZhbHVlID09PSBudWxsXHJcbiAgfSxcclxuXHJcbiAgLy8gdmFsdWUgaXMgYSBjdXN0b20gZGF0YSB0eXBlLCBlLmcuIGNvbG9yPTI1NSwwLDI1NVxyXG4gIGN1c3RvbToge1xyXG4gICAgcmVxdWlyZWQ6IFsgJ3BhcnNlJyBdLFxyXG4gICAgb3B0aW9uYWw6IFsgJ2RlZmF1bHRWYWx1ZScsICd2YWxpZFZhbHVlcycsICdpc1ZhbGlkVmFsdWUnLCAncHJpdmF0ZScsICdwdWJsaWMnIF0sXHJcbiAgICB2YWxpZGF0ZVNjaGVtYTogbnVsbCwgLy8gbm8gdHlwZS1zcGVjaWZpYyBzY2hlbWEgdmFsaWRhdGlvblxyXG4gICAgcGFyc2U6IHBhcnNlQ3VzdG9tLFxyXG4gICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiB7XHJcblxyXG4gICAgICAvLyBUT0RPIGRvIHdlIG5lZWQgdG8gYWRkIGEgcHJvcGVydHkgdG8gJ2N1c3RvbScgc2NoZW1hIHRoYXQgaGFuZGxlcyB2YWxpZGF0aW9uIG9mIGN1c3RvbSB2YWx1ZSdzIHR5cGU/IHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVlcnktc3RyaW5nLW1hY2hpbmUvaXNzdWVzLzM1XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gIH1cclxufTsiLCAiLy8gQ29weXJpZ2h0IDIwMjUsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vKipcclxuICogRm9yIHVzZSBvZiBRU00gYXMgYSBtb2R1bGVcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKWBcclxuICovXHJcblxyXG5pbXBvcnQgeyBRdWVyeVN0cmluZ01hY2hpbmUgfSBmcm9tICcuL1F1ZXJ5U3RyaW5nTWFjaGluZU1vZHVsZS5qcyc7XHJcblxyXG5zZWxmLlF1ZXJ5U3RyaW5nTWFjaGluZSA9IFF1ZXJ5U3RyaW5nTWFjaGluZTsiXSwKICAibWFwcGluZ3MiOiAiOzs7QUFnQkEsTUFBTSxvQkFBb0I7QUFpRjFCLE1BQU0sbUJBQW1CLE1BQU07QUFHN0IsUUFBSTtBQUNGLGFBQU8sYUFBYSxRQUFTLGdCQUFpQixNQUFNO0FBQUEsSUFDdEQsU0FDTyxHQUFJO0FBQ1QsYUFBTztBQUFBLElBQ1Q7QUFBQSxFQUNGO0FBTUEsTUFBTSxvQkFBb0IsQ0FBRSxXQUE2QixPQUFPLFdBQVcsS0FBSyxPQUFPLFdBQVksR0FBSTtBQVd2RyxNQUFNLGdCQUFnQixDQUFFLFdBQW9CLEtBQWEsT0FBWSxRQUFnQixZQUEwQjtBQUM3RyxRQUFLLENBQUMsV0FBWTtBQUVoQixVQUFLLE9BQU8sUUFBUztBQUNuQiwyQkFBbUIsV0FBWSxLQUFLLE9BQU8sT0FBUTtBQUNuRCxZQUFLLE9BQU8sZUFBZ0IsY0FBZSxHQUFJO0FBRTdDLGtCQUFRLE9BQU87QUFBQSxRQUNqQixPQUNLO0FBQ0gsZ0JBQU0sYUFBYSxNQUFPLE9BQU8sSUFBSztBQUN0QztBQUFB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
