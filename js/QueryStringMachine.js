// Copyright 2017-2025, University of Colorado Boulder
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
      assert && assert(typeof queryString === "string", `url should be string, but it was: ${typeof queryString}`);
      assert && assert(typeof key === "string", `url should be string, but it was: ${typeof key}`);
      assert && assert(isParameterString(queryString), "queryString should be length 0 or begin with ?");
      assert && assert(key.length > 0, "url should be a string with length > 0");
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
  var QueryStringMachineModule_default = QueryStringMachine;

  // ../query-string-machine/js/preload-main.ts
  self.QueryStringMachine = QueryStringMachineModule_default;
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vcXVlcnktc3RyaW5nLW1hY2hpbmUvanMvUXVlcnlTdHJpbmdNYWNoaW5lTW9kdWxlLnRzIiwgIi4uL3F1ZXJ5LXN0cmluZy1tYWNoaW5lL2pzL3ByZWxvYWQtbWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUXVlcnkgU3RyaW5nIHBhcnNlciB0aGF0IHN1cHBvcnRzIHR5cGUgY29lcmNpb24sIGRlZmF1bHRzLCBlcnJvciBjaGVja2luZywgZXRjLiBiYXNlZCBvbiBhIHNjaGVtYS5cbiAqIFNlZSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0IGZvciB0aGUgZGVzY3JpcHRpb24gb2YgYSBzY2hlbWEuXG4gKlxuICogRm9yIFVNRCAoVW5pdmVyc2FsIE1vZHVsZSBEZWZpbml0aW9uKSBzdXBwb3J0ZWQgb3V0cHV0LCBzZWUganMvUXVlcnlTdHJpbmdNYWNoaW5lLmpzXG4gKlxuICogU2VlIFRZUEVTIGZvciBhIGRlc2NyaXB0aW9uIG9mIHRoZSBzY2hlbWEgdHlwZXMgYW5kIHRoZWlyIHByb3BlcnRpZXMuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuLyogZXNsaW50LWRpc2FibGUgcGhldC9uby1zaW1wbGUtdHlwZS1jaGVja2luZy1hc3NlcnRpb25zICovXG5cbi8vIERlZmF1bHQgc3RyaW5nIHRoYXQgc3BsaXRzIGFycmF5IHN0cmluZ3NcbmNvbnN0IERFRkFVTFRfU0VQQVJBVE9SID0gJywnO1xuXG50eXBlIEFueSA9IGFueTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG5cbnR5cGUgV2FybmluZyA9IHtcbiAga2V5OiBzdHJpbmc7XG4gIHZhbHVlOiBzdHJpbmc7XG4gIG1lc3NhZ2U6IHN0cmluZztcbn07XG5cbnR5cGUgU2hhcmVkU2NoZW1hID0ge1xuICBwcml2YXRlPzogYm9vbGVhbjtcbiAgcHVibGljPzogYm9vbGVhbjtcbn07XG5cbnR5cGUgRmxhZ1NjaGVtYSA9IHtcbiAgdHlwZTogJ2ZsYWcnO1xufSAmIFNoYXJlZFNjaGVtYTtcblxudHlwZSBCb29sZWFuU2NoZW1hID0ge1xuICB0eXBlOiAnYm9vbGVhbic7XG4gIGRlZmF1bHRWYWx1ZT86IGJvb2xlYW47XG59ICYgU2hhcmVkU2NoZW1hO1xuXG50eXBlIE51bWJlclNjaGVtYSA9IHtcbiAgdHlwZTogJ251bWJlcic7XG4gIGRlZmF1bHRWYWx1ZT86IG51bWJlcjtcbiAgdmFsaWRWYWx1ZXM/OiByZWFkb25seSBudW1iZXJbXTtcbiAgaXNWYWxpZFZhbHVlPzogKCBuOiBudW1iZXIgKSA9PiBib29sZWFuO1xufSAmIFNoYXJlZFNjaGVtYTtcblxudHlwZSBTdHJpbmdTY2hlbWEgPSB7XG4gIHR5cGU6ICdzdHJpbmcnO1xuICBkZWZhdWx0VmFsdWU/OiBzdHJpbmcgfCBudWxsO1xuICB2YWxpZFZhbHVlcz86IHJlYWRvbmx5ICggc3RyaW5nIHwgbnVsbCApW107XG4gIGlzVmFsaWRWYWx1ZT86ICggbjogc3RyaW5nIHwgbnVsbCApID0+IGJvb2xlYW47XG59ICYgU2hhcmVkU2NoZW1hO1xuXG50eXBlIEFycmF5U2NoZW1hID0ge1xuICB0eXBlOiAnYXJyYXknO1xuICBlbGVtZW50U2NoZW1hOiBTY2hlbWE7XG4gIHNlcGFyYXRvcj86IHN0cmluZztcbiAgZGVmYXVsdFZhbHVlPzogbnVsbCB8IHJlYWRvbmx5IEFueVtdO1xuICB2YWxpZFZhbHVlcz86IHJlYWRvbmx5IEFueVtdW107XG4gIGlzVmFsaWRWYWx1ZT86ICggbjogQW55W10gKSA9PiBib29sZWFuO1xufSAmIFNoYXJlZFNjaGVtYTtcblxudHlwZSBDdXN0b21TY2hlbWEgPSB7XG4gIHR5cGU6ICdjdXN0b20nO1xuICBwYXJzZTogKCBzdHI6IHN0cmluZyApID0+IEFueTtcbiAgZGVmYXVsdFZhbHVlPzogQW55O1xuICB2YWxpZFZhbHVlcz86IHJlYWRvbmx5IEFueVtdO1xuICBpc1ZhbGlkVmFsdWU/OiAoIG46IEFueSApID0+IGJvb2xlYW47XG59ICYgU2hhcmVkU2NoZW1hO1xuXG5cbi8vIE1hdGNoZXMgVFlQRSBkb2N1bWVudGF0aW9uIGluIFF1ZXJ5U3RyaW5nTWFjaGluZVxudHlwZSBTY2hlbWEgPSBGbGFnU2NoZW1hIHxcbiAgQm9vbGVhblNjaGVtYSB8XG4gIE51bWJlclNjaGVtYSB8XG4gIFN0cmluZ1NjaGVtYSB8XG4gIEFycmF5U2NoZW1hIHxcbiAgQ3VzdG9tU2NoZW1hO1xuXG50eXBlIFVucGFyc2VkVmFsdWUgPSBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xudHlwZSBQYXJzZWRWYWx1ZTxTIGV4dGVuZHMgU2NoZW1hPiA9IFJldHVyblR5cGU8U2NoZW1hVHlwZXNbU1sndHlwZSddXVsncGFyc2UnXT47XG5cbi8vIENvbnZlcnRzIGEgU2NoZW1hJ3MgdHlwZSB0byB0aGUgYWN0dWFsIFR5cGVzY3JpcHQgdHlwZSBpdCByZXByZXNlbnRzXG50eXBlIFF1ZXJ5TWFjaGluZVR5cGVUb1R5cGU8VD4gPSBUIGV4dGVuZHMgKCAnZmxhZycgfCAnYm9vbGVhbicgKSA/IGJvb2xlYW4gOiAoIFQgZXh0ZW5kcyAnbnVtYmVyJyA/IG51bWJlciA6ICggVCBleHRlbmRzICdzdHJpbmcnID8gKCBzdHJpbmcgfCBudWxsICkgOiAoIFQgZXh0ZW5kcyAnYXJyYXknID8gQW55W10gOiBBbnkgKSApICk7XG5cbnR5cGUgUVNNU2NoZW1hT2JqZWN0ID0gUmVjb3JkPHN0cmluZywgU2NoZW1hPjtcblxuLy8gVE9ETzogQ29tYmluZSB0aGlzIHdpdGggU2NoZW1hVHlwZXMgdHlwaW5nIGFuZCBQYXJzZWRWYWx1ZTw+LCBzaW5jZSB0aGV5IGFyZSB0d28gZGlmZmVyZW50IHRoaW5ncyByaWdodCBub3cuIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xdWVyeS1zdHJpbmctbWFjaGluZS9pc3N1ZXMvNDVcbnR5cGUgUVNNUGFyc2VkUGFyYW1ldGVyczxTY2hlbWFNYXAgZXh0ZW5kcyBRU01TY2hlbWFPYmplY3Q+ID0ge1xuICAvLyBXaWxsIHJldHVybiBhIG1hcCBvZiB0aGUgXCJyZXN1bHRcIiB0eXBlc1xuICBbUHJvcGVydHkgaW4ga2V5b2YgU2NoZW1hTWFwXTogUXVlcnlNYWNoaW5lVHlwZVRvVHlwZTxTY2hlbWFNYXBbIFByb3BlcnR5IF1bICd0eXBlJyBdPlxuICAvLyBTQ0hFTUFfTUFQIGFsbG93ZWQgdG8gYmUgc2V0IGluIHR5cGVzXG59ICYgeyBTQ0hFTUFfTUFQPzogUVNNU2NoZW1hT2JqZWN0IH07XG5cbi8vIElmIGEgcXVlcnkgcGFyYW1ldGVyIGhhcyBwcml2YXRlOnRydWUgaW4gaXRzIHNjaGVtYSwgaXQgbXVzdCBwYXNzIHRoaXMgcHJlZGljYXRlIHRvIGJlIHJlYWQgZnJvbSB0aGUgVVJMLlxuLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy83NDNcbmNvbnN0IHByaXZhdGVQcmVkaWNhdGUgPSAoKSA9PiB7XG4gIC8vIFRyeWluZyB0byBhY2Nlc3MgbG9jYWxTdG9yYWdlIG1heSBmYWlsIHdpdGggYSBTZWN1cml0eUVycm9yIGlmIGNvb2tpZXMgYXJlIGJsb2NrZWQgaW4gYSBjZXJ0YWluIHdheS5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xYS9pc3N1ZXMvMzI5IGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICB0cnkge1xuICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSggJ3BoZXRUZWFtTWVtYmVyJyApID09PSAndHJ1ZSc7XG4gIH1cbiAgY2F0Y2goIGUgKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG4vKipcbiAqIFZhbGlkIHBhcmFtZXRlciBzdHJpbmdzIGJlZ2luIHdpdGggPyBvciBhcmUgdGhlIGVtcHR5IHN0cmluZy4gIFRoaXMgaXMgdXNlZCBmb3IgYXNzZXJ0aW9ucyBpbiBzb21lIGNhc2VzIGFuZCBmb3JcbiAqIHRocm93aW5nIEVycm9ycyBpbiBvdGhlciBjYXNlcy5cbiAqL1xuY29uc3QgaXNQYXJhbWV0ZXJTdHJpbmcgPSAoIHN0cmluZzogc3RyaW5nICk6IGJvb2xlYW4gPT4gc3RyaW5nLmxlbmd0aCA9PT0gMCB8fCBzdHJpbmcuc3RhcnRzV2l0aCggJz8nICk7XG5cbi8vIEp1c3QgcmV0dXJuIGEgdmFsdWUgdG8gZGVmaW5lIHRoZSBtb2R1bGUgZXhwb3J0LlxuLy8gVGhpcyBleGFtcGxlIHJldHVybnMgYW4gb2JqZWN0LCBidXQgdGhlIG1vZHVsZVxuLy8gY2FuIHJldHVybiBhIGZ1bmN0aW9uIGFzIHRoZSBleHBvcnRlZCB2YWx1ZS5cblxuLyoqXG4gKiBJbiBvcmRlciB0byBzdXBwb3J0IGdyYWNlZnVsIGZhaWx1cmVzIGZvciB1c2VyLXN1cHBsaWVkIHZhbHVlcywgd2UgZmFsbCBiYWNrIHRvIGRlZmF1bHQgdmFsdWVzIHdoZW4gcHVibGljOiB0cnVlXG4gKiBpcyBzcGVjaWZpZWQuICBJZiB0aGUgc2NoZW1hIGVudHJ5IGlzIHB1YmxpYzogZmFsc2UsIHRoZW4gYSBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQgaXMgdGhyb3duLlxuICogVE9ETzogUGFyYW1ldHJpYyB0eXBpbmcsIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xdWVyeS1zdHJpbmctbWFjaGluZS9pc3N1ZXMvNDVcbiAqL1xuY29uc3QgZ2V0VmFsaWRWYWx1ZSA9ICggcHJlZGljYXRlOiBib29sZWFuLCBrZXk6IHN0cmluZywgdmFsdWU6IEFueSwgc2NoZW1hOiBTY2hlbWEsIG1lc3NhZ2U6IHN0cmluZyApOiBBbnkgPT4ge1xuICBpZiAoICFwcmVkaWNhdGUgKSB7XG5cbiAgICBpZiAoIHNjaGVtYS5wdWJsaWMgKSB7XG4gICAgICBRdWVyeVN0cmluZ01hY2hpbmUuYWRkV2FybmluZygga2V5LCB2YWx1ZSwgbWVzc2FnZSApO1xuICAgICAgaWYgKCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICdkZWZhdWx0VmFsdWUnICkgKSB7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgICAgdmFsdWUgPSBzY2hlbWEuZGVmYXVsdFZhbHVlO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IHR5cGVTY2hlbWEgPSBUWVBFU1sgc2NoZW1hLnR5cGUgXTtcbiAgICAgICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCB0eXBlU2NoZW1hLmhhc093blByb3BlcnR5KCAnZGVmYXVsdFZhbHVlJyApLFxuICAgICAgICAgICdUeXBlIG11c3QgaGF2ZSBhIGRlZmF1bHQgdmFsdWUgaWYgdGhlIHByb3ZpZGVkIHNjaGVtYSBkb2VzIG5vdCBoYXZlIG9uZS4nICk7XG4gICAgICAgIHZhbHVlID0gdHlwZVNjaGVtYS5kZWZhdWx0VmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBwcmVkaWNhdGUsIG1lc3NhZ2UgKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufTtcblxuLyoqXG4gKiBRdWVyeSBTdHJpbmcgTWFjaGluZSBpcyBhIHF1ZXJ5IHN0cmluZyBwYXJzZXIgdGhhdCBzdXBwb3J0cyB0eXBlIGNvZXJjaW9uLCBkZWZhdWx0IHZhbHVlcyAmIHZhbGlkYXRpb24uIFBsZWFzZVxuICogdmlzaXQgUGhFVCdzIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVlcnktc3RyaW5nLW1hY2hpbmVcIiB0YXJnZXQ9XCJfYmxhbmtcIj5xdWVyeS1zdHJpbmctbWFjaGluZTwvYT5cbiAqIHJlcG9zaXRvcnkgZm9yIGRvY3VtZW50YXRpb24gYW5kIGV4YW1wbGVzLlxuICovXG5jb25zdCBRdWVyeVN0cmluZ01hY2hpbmUgPSB7XG5cbiAgLy8gcHVibGljIChyZWFkLW9ubHkpIHt7a2V5OnN0cmluZywgdmFsdWU6eyp9LCBtZXNzYWdlOnN0cmluZ31bXX0gLSBjbGVhcmVkIGJ5IHNvbWUgdGVzdHMgaW4gUXVlcnlTdHJpbmdNYWNoaW5lVGVzdHMuanNcbiAgLy8gU2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5hZGRXYXJuaW5nIGZvciBhIGRlc2NyaXB0aW9uIG9mIHRoZXNlIGZpZWxkcywgYW5kIHRvIGFkZCB3YXJuaW5ncy5cbiAgd2FybmluZ3M6IFtdIGFzIFdhcm5pbmdbXSxcblxuICAvKipcbiAgICogR2V0cyB0aGUgdmFsdWUgZm9yIGEgc2luZ2xlIHF1ZXJ5IHBhcmFtZXRlci5cbiAgICpcbiAgICovXG4gIGdldDogZnVuY3Rpb24gPFMgZXh0ZW5kcyBTY2hlbWE+KCBrZXk6IHN0cmluZywgc2NoZW1hOiBTICk6IFBhcnNlZFZhbHVlPFM+IHtcbiAgICByZXR1cm4gdGhpcy5nZXRGb3JTdHJpbmcoIGtleSwgc2NoZW1hLCB3aW5kb3cubG9jYXRpb24uc2VhcmNoICk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldHMgdmFsdWVzIGZvciBldmVyeSBxdWVyeSBwYXJhbWV0ZXIsIHVzaW5nIHRoZSBzcGVjaWZpZWQgc2NoZW1hIG1hcC5cbiAgICpcbiAgICogQHBhcmFtIHNjaGVtYU1hcCAtIHNlZSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0QWxsRm9yU3RyaW5nXG4gICAqIEByZXR1cm5zIC0gc2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRBbGxGb3JTdHJpbmdcbiAgICovXG4gIGdldEFsbDogZnVuY3Rpb24gPFNjaGVtYU1hcCBleHRlbmRzIFFTTVNjaGVtYU9iamVjdD4oIHNjaGVtYU1hcDogU2NoZW1hTWFwICk6IFFTTVBhcnNlZFBhcmFtZXRlcnM8U2NoZW1hTWFwPiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsRm9yU3RyaW5nKCBzY2hlbWFNYXAsIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggKTtcbiAgfSxcblxuICAvKipcbiAgICogTGlrZSBgZ2V0YCBidXQgZm9yIGFuIGFyYml0cmFyeSBwYXJhbWV0ZXIgc3RyaW5nLlxuICAgKlxuICAgKiBAcGFyYW0ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBuYW1lXG4gICAqIEBwYXJhbSBzY2hlbWEgLSBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldFxuICAgKiBAcGFyYW0gc3RyaW5nIC0gdGhlIHBhcmFtZXRlcnMgc3RyaW5nLiAgTXVzdCBiZWdpbiB3aXRoICc/JyBvciBiZSB0aGUgZW1wdHkgc3RyaW5nXG4gICAqIEByZXR1cm5zIC0gcXVlcnkgcGFyYW1ldGVyIHZhbHVlLCBjb252ZXJ0ZWQgdG8gdGhlIHByb3BlciB0eXBlXG4gICAqL1xuICBnZXRGb3JTdHJpbmc6IGZ1bmN0aW9uIDxTIGV4dGVuZHMgU2NoZW1hPigga2V5OiBzdHJpbmcsIHNjaGVtYTogUywgc3RyaW5nOiBzdHJpbmcgKTogUGFyc2VkVmFsdWU8Uz4ge1xuXG4gICAgaWYgKCAhaXNQYXJhbWV0ZXJTdHJpbmcoIHN0cmluZyApICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCBgUXVlcnkgc3RyaW5ncyBzaG91bGQgYmUgZWl0aGVyIHRoZSBlbXB0eSBzdHJpbmcgb3Igc3RhcnQgd2l0aCBhIFwiP1wiOiAke3N0cmluZ31gICk7XG4gICAgfVxuXG4gICAgLy8gSWdub3JlIFVSTCB2YWx1ZXMgZm9yIHByaXZhdGUgcXVlcnkgcGFyYW1ldGVycyB0aGF0IGZhaWwgcHJpdmF0ZVByZWRpY2F0ZS5cbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzc0My5cbiAgICBjb25zdCB2YWx1ZXMgPSAoIHNjaGVtYS5wcml2YXRlICYmICFwcml2YXRlUHJlZGljYXRlKCkgKSA/IFtdIDogZ2V0VmFsdWVzKCBrZXksIHN0cmluZyApO1xuXG4gICAgdmFsaWRhdGVTY2hlbWEoIGtleSwgc2NoZW1hICk7XG5cbiAgICBsZXQgdmFsdWUgPSBwYXJzZVZhbHVlcygga2V5LCBzY2hlbWEsIHZhbHVlcyApO1xuXG4gICAgaWYgKCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICd2YWxpZFZhbHVlcycgKSApIHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBUT0RPIFdoYXQgaXMgdGhlIGJlc3Qgd2F5IHRvIHR5cGUgbmFycm93IHNjaGVtYT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3F1ZXJ5LXN0cmluZy1tYWNoaW5lL2lzc3Vlcy80NVxuICAgICAgdmFsdWUgPSBnZXRWYWxpZFZhbHVlKCBpc1ZhbGlkVmFsdWUoIHZhbHVlLCBzY2hlbWEudmFsaWRWYWx1ZXMgKSwga2V5LCB2YWx1ZSwgc2NoZW1hLFxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gVE9ETyBXaGF0IGlzIHRoZSBiZXN0IHdheSB0byB0eXBlIG5hcnJvdyBzY2hlbWE/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xdWVyeS1zdHJpbmctbWFjaGluZS9pc3N1ZXMvNDVcbiAgICAgICAgYEludmFsaWQgdmFsdWUgc3VwcGxpZWQgZm9yIGtleSBcIiR7a2V5fVwiOiAke3ZhbHVlfSBpcyBub3QgYSBtZW1iZXIgb2YgdmFsaWQgdmFsdWVzOiAke3NjaGVtYS52YWxpZFZhbHVlcy5qb2luKCAnLCAnICl9YFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBpc1ZhbGlkVmFsdWUgZXZhbHVhdGVzIHRvIHRydWVcbiAgICBlbHNlIGlmICggc2NoZW1hLmhhc093blByb3BlcnR5KCAnaXNWYWxpZFZhbHVlJyApICkge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIFRPRE8gV2hhdCBpcyB0aGUgYmVzdCB3YXkgdG8gdHlwZSBuYXJyb3cgc2NoZW1hPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVlcnktc3RyaW5nLW1hY2hpbmUvaXNzdWVzLzQ1XG4gICAgICB2YWx1ZSA9IGdldFZhbGlkVmFsdWUoIHNjaGVtYS5pc1ZhbGlkVmFsdWUoIHZhbHVlICksIGtleSwgdmFsdWUsIHNjaGVtYSxcbiAgICAgICAgYEludmFsaWQgdmFsdWUgc3VwcGxpZWQgZm9yIGtleSBcIiR7a2V5fVwiOiAke3ZhbHVlfWBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IHZhbHVlVmFsaWQgPSBUWVBFU1sgc2NoZW1hLnR5cGUgXS5pc1ZhbGlkVmFsdWUoIHZhbHVlICk7XG5cbiAgICAvLyBzdXBwb3J0IGN1c3RvbSB2YWxpZGF0aW9uIGZvciBlbGVtZW50U2NoZW1hIGZvciBhcnJheXNcbiAgICBpZiAoIHNjaGVtYS50eXBlID09PSAnYXJyYXknICYmIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG4gICAgICBsZXQgZWxlbWVudHNWYWxpZCA9IHRydWU7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHZhbHVlWyBpIF07XG4gICAgICAgIGlmICggIVRZUEVTWyBzY2hlbWEuZWxlbWVudFNjaGVtYS50eXBlIF0uaXNWYWxpZFZhbHVlKCBlbGVtZW50ICkgKSB7XG4gICAgICAgICAgZWxlbWVudHNWYWxpZCA9IGZhbHNlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBUT0RPIFdoYXQgaXMgdGhlIGJlc3Qgd2F5IHRvIHR5cGUgbmFycm93IHNjaGVtYT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3F1ZXJ5LXN0cmluZy1tYWNoaW5lL2lzc3Vlcy80NVxuICAgICAgICBpZiAoIHNjaGVtYS5lbGVtZW50U2NoZW1hLmhhc093blByb3BlcnR5KCAnaXNWYWxpZFZhbHVlJyApICYmICFzY2hlbWEuZWxlbWVudFNjaGVtYS5pc1ZhbGlkVmFsdWUoIGVsZW1lbnQgKSApIHtcbiAgICAgICAgICBlbGVtZW50c1ZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIFRPRE8gV2hhdCBpcyB0aGUgYmVzdCB3YXkgdG8gdHlwZSBuYXJyb3cgc2NoZW1hPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVlcnktc3RyaW5nLW1hY2hpbmUvaXNzdWVzLzQ1XG4gICAgICAgIGlmICggc2NoZW1hLmVsZW1lbnRTY2hlbWEuaGFzT3duUHJvcGVydHkoICd2YWxpZFZhbHVlcycgKSAmJiAhaXNWYWxpZFZhbHVlKCBlbGVtZW50LCBzY2hlbWEuZWxlbWVudFNjaGVtYS52YWxpZFZhbHVlcyApICkge1xuICAgICAgICAgIGVsZW1lbnRzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFsdWVWYWxpZCA9IHZhbHVlVmFsaWQgJiYgZWxlbWVudHNWYWxpZDtcbiAgICB9XG5cbiAgICAvLyBkaXNwYXRjaCBmdXJ0aGVyIHZhbGlkYXRpb24gdG8gYSB0eXBlLXNwZWNpZmljIGZ1bmN0aW9uXG4gICAgdmFsdWUgPSBnZXRWYWxpZFZhbHVlKCB2YWx1ZVZhbGlkLCBrZXksIHZhbHVlLCBzY2hlbWEsIGBJbnZhbGlkIHZhbHVlIGZvciB0eXBlLCBrZXk6ICR7a2V5fWAgKTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH0sXG5cbiAgLyoqXG4gICAqIExpa2UgYGdldEFsbGAgYnV0IGZvciBhbiBhcmJpdHJhcnkgcGFyYW1ldGVycyBzdHJpbmcuXG4gICAqIEBwYXJhbSBzY2hlbWFNYXAgLSBrZXkvdmFsdWUgcGFpcnMsIGtleSBpcyBxdWVyeSBwYXJhbWV0ZXIgbmFtZSBhbmQgdmFsdWUgaXMgYSBzY2hlbWFcbiAgICogQHBhcmFtIHN0cmluZyAtIHRoZSBwYXJhbWV0ZXJzIHN0cmluZ1xuICAgKiBAcmV0dXJucyAtIGtleS92YWx1ZSBwYWlycyBob2xkaW5nIHRoZSBwYXJzZWQgcmVzdWx0c1xuICAgKi9cbiAgZ2V0QWxsRm9yU3RyaW5nOiBmdW5jdGlvbiA8U2NoZW1hTWFwIGV4dGVuZHMgUVNNU2NoZW1hT2JqZWN0Piggc2NoZW1hTWFwOiBTY2hlbWFNYXAsIHN0cmluZzogc3RyaW5nICk6IFFTTVBhcnNlZFBhcmFtZXRlcnM8U2NoZW1hTWFwPiB7XG4gICAgY29uc3QgcmVzdWx0ID0ge30gYXMgdW5rbm93biBhcyBRU01QYXJzZWRQYXJhbWV0ZXJzPFNjaGVtYU1hcD47XG5cbiAgICBmb3IgKCBjb25zdCBrZXkgaW4gc2NoZW1hTWFwICkge1xuICAgICAgaWYgKCBzY2hlbWFNYXAuaGFzT3duUHJvcGVydHkoIGtleSApICkge1xuICAgICAgICByZXN1bHRbIGtleSBdID0gdGhpcy5nZXRGb3JTdHJpbmcoIGtleSwgc2NoZW1hTWFwWyBrZXkgXSwgc3RyaW5nICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgd2luZG93LmxvY2F0aW9uLnNlYXJjaCBjb250YWlucyB0aGUgZ2l2ZW4ga2V5XG4gICAqIEByZXR1cm5zIC0gdHJ1ZSBpZiB0aGUgd2luZG93LmxvY2F0aW9uLnNlYXJjaCBjb250YWlucyB0aGUgZ2l2ZW4ga2V5XG4gICAqL1xuICBjb250YWluc0tleTogZnVuY3Rpb24oIGtleTogc3RyaW5nICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNvbnRhaW5zS2V5Rm9yU3RyaW5nKCBrZXksIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggKTtcbiAgfSxcblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBzdHJpbmcgY29udGFpbnMgdGhlIHNwZWNpZmllZCBrZXlcbiAgICogQHBhcmFtIGtleSAtIHRoZSBrZXkgdG8gY2hlY2sgZm9yXG4gICAqIEBwYXJhbSBzdHJpbmcgLSB0aGUgcXVlcnkgc3RyaW5nIHRvIHNlYXJjaC4gTXVzdCBiZWdpbiB3aXRoICc/JyBvciBiZSB0aGUgZW1wdHkgc3RyaW5nXG4gICAqIEByZXR1cm5zIC0gdHJ1ZSBpZiB0aGUgZ2l2ZW4gc3RyaW5nIGNvbnRhaW5zIHRoZSBnaXZlbiBrZXlcbiAgICovXG4gIGNvbnRhaW5zS2V5Rm9yU3RyaW5nOiBmdW5jdGlvbigga2V5OiBzdHJpbmcsIHN0cmluZzogc3RyaW5nICk6IGJvb2xlYW4ge1xuICAgIGlmICggIWlzUGFyYW1ldGVyU3RyaW5nKCBzdHJpbmcgKSApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggYFF1ZXJ5IHN0cmluZ3Mgc2hvdWxkIGJlIGVpdGhlciB0aGUgZW1wdHkgc3RyaW5nIG9yIHN0YXJ0IHdpdGggYSBcIj9cIjogJHtzdHJpbmd9YCApO1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZXMgPSBnZXRWYWx1ZXMoIGtleSwgc3RyaW5nICk7XG4gICAgcmV0dXJuIHZhbHVlcy5sZW5ndGggPiAwO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIG9iamVjdHMgYXJlIGVxdWFsLiAgRXhwb3J0ZWQgb24gdGhlIFF1ZXJ5U3RyaW5nTWFjaGluZSBmb3IgdGVzdGluZy4gIE9ubHkgd29ya3MgZm9yXG4gICAqIGFycmF5cyBvYmplY3RzIHRoYXQgY29udGFpbiBwcmltaXRpdmVzIChpLmUuIHRlcm1pbmFscyBhcmUgY29tcGFyZWQgd2l0aCA9PT0pXG4gICAqIHByaXZhdGUgLSBob3dldmVyLCBpdCBpcyBjYWxsZWQgZnJvbSBRdWVyeVN0cmluZ01hY2hpbmVUZXN0c1xuICAgKi9cbiAgZGVlcEVxdWFsczogZnVuY3Rpb24oIGE6IEFueSwgYjogQW55ICk6IGJvb2xlYW4ge1xuICAgIGlmICggdHlwZW9mIGEgIT09IHR5cGVvZiBiICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoIHR5cGVvZiBhID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgYSA9PT0gJ251bWJlcicgfHwgdHlwZW9mIGEgPT09ICdib29sZWFuJyApIHtcbiAgICAgIHJldHVybiBhID09PSBiO1xuICAgIH1cbiAgICBpZiAoIGEgPT09IG51bGwgJiYgYiA9PT0gbnVsbCApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoIGEgPT09IHVuZGVmaW5lZCAmJiBiID09PSB1bmRlZmluZWQgKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKCBhID09PSBudWxsICYmIGIgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKCBhID09PSB1bmRlZmluZWQgJiYgYiA9PT0gbnVsbCApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgYUtleXMgPSBPYmplY3Qua2V5cyggYSApO1xuICAgIGNvbnN0IGJLZXlzID0gT2JqZWN0LmtleXMoIGIgKTtcbiAgICBpZiAoIGFLZXlzLmxlbmd0aCAhPT0gYktleXMubGVuZ3RoICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBlbHNlIGlmICggYUtleXMubGVuZ3RoID09PSAwICkge1xuICAgICAgcmV0dXJuIGEgPT09IGI7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYUtleXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGlmICggYUtleXNbIGkgXSAhPT0gYktleXNbIGkgXSApIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYUNoaWxkID0gYVsgYUtleXNbIGkgXSBdO1xuICAgICAgICBjb25zdCBiQ2hpbGQgPSBiWyBhS2V5c1sgaSBdIF07XG4gICAgICAgIGlmICggIVF1ZXJ5U3RyaW5nTWFjaGluZS5kZWVwRXF1YWxzKCBhQ2hpbGQsIGJDaGlsZCApICkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IFVSTCBidXQgd2l0aG91dCB0aGUga2V5LXZhbHVlIHBhaXIuXG4gICAqXG4gICAqIEBwYXJhbSBxdWVyeVN0cmluZyAtIHRhaWwgb2YgYSBVUkwgaW5jbHVkaW5nIHRoZSBiZWdpbm5pbmcgJz8nIChpZiBhbnkpXG4gICAqIEBwYXJhbSBrZXlcbiAgICovXG4gIHJlbW92ZUtleVZhbHVlUGFpcjogZnVuY3Rpb24oIHF1ZXJ5U3RyaW5nOiBzdHJpbmcsIGtleTogc3RyaW5nICk6IHN0cmluZyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHF1ZXJ5U3RyaW5nID09PSAnc3RyaW5nJywgYHVybCBzaG91bGQgYmUgc3RyaW5nLCBidXQgaXQgd2FzOiAke3R5cGVvZiBxdWVyeVN0cmluZ31gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGtleSA9PT0gJ3N0cmluZycsIGB1cmwgc2hvdWxkIGJlIHN0cmluZywgYnV0IGl0IHdhczogJHt0eXBlb2Yga2V5fWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc1BhcmFtZXRlclN0cmluZyggcXVlcnlTdHJpbmcgKSwgJ3F1ZXJ5U3RyaW5nIHNob3VsZCBiZSBsZW5ndGggMCBvciBiZWdpbiB3aXRoID8nICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCgga2V5Lmxlbmd0aCA+IDAsICd1cmwgc2hvdWxkIGJlIGEgc3RyaW5nIHdpdGggbGVuZ3RoID4gMCcgKTtcblxuICAgIGlmICggcXVlcnlTdHJpbmcuc3RhcnRzV2l0aCggJz8nICkgKSB7XG4gICAgICBjb25zdCBuZXdQYXJhbWV0ZXJzID0gW107XG4gICAgICBjb25zdCBxdWVyeSA9IHF1ZXJ5U3RyaW5nLnN1YnN0cmluZyggMSApO1xuICAgICAgY29uc3QgZWxlbWVudHMgPSBxdWVyeS5zcGxpdCggJyYnICk7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGVsZW1lbnRzWyBpIF07XG4gICAgICAgIGNvbnN0IGtleUFuZE1heWJlVmFsdWUgPSBlbGVtZW50LnNwbGl0KCAnPScgKTtcblxuICAgICAgICBjb25zdCBlbGVtZW50S2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KCBrZXlBbmRNYXliZVZhbHVlWyAwIF0gKTtcbiAgICAgICAgaWYgKCBlbGVtZW50S2V5ICE9PSBrZXkgKSB7XG4gICAgICAgICAgbmV3UGFyYW1ldGVycy5wdXNoKCBlbGVtZW50ICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCBuZXdQYXJhbWV0ZXJzLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgIHJldHVybiBgPyR7bmV3UGFyYW1ldGVycy5qb2luKCAnJicgKX1gO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gcXVlcnlTdHJpbmc7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIHRoZSBrZXlzIGZyb20gdGhlIHF1ZXJ5U3RyaW5nIChvayBpZiB0aGV5IGRvIG5vdCBhcHBlYXIgYXQgYWxsKVxuICAgKi9cbiAgcmVtb3ZlS2V5VmFsdWVQYWlyczogZnVuY3Rpb24oIHF1ZXJ5U3RyaW5nOiBzdHJpbmcsIGtleXM6IHN0cmluZ1tdICk6IHN0cmluZyB7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHF1ZXJ5U3RyaW5nID0gdGhpcy5yZW1vdmVLZXlWYWx1ZVBhaXIoIHF1ZXJ5U3RyaW5nLCBrZXlzWyBpIF0gKTtcbiAgICB9XG4gICAgcmV0dXJuIHF1ZXJ5U3RyaW5nO1xuICB9LFxuXG4gIC8qKlxuICAgKiBBcHBlbmRzIGEgcXVlcnkgc3RyaW5nIHRvIGEgZ2l2ZW4gdXJsLlxuICAgKiBAcGFyYW0gdXJsIC0gbWF5IG9yIG1heSBub3QgYWxyZWFkeSBoYXZlIG90aGVyIHF1ZXJ5IHBhcmFtZXRlcnNcbiAgICogQHBhcmFtIHF1ZXJ5UGFyYW1ldGVycyAtIG1heSBzdGFydCB3aXRoICcnLCAnPycgb3IgJyYnXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIC8vIExpbWl0IHRvIHRoZSBzZWNvbmQgc2NyZWVuXG4gICAqIHNpbVVSTCA9IFF1ZXJ5U3RyaW5nTWFjaGluZS5hcHBlbmRRdWVyeVN0cmluZyggc2ltVVJMLCAnc2NyZWVucz0yJyApO1xuICAgKi9cbiAgYXBwZW5kUXVlcnlTdHJpbmc6IGZ1bmN0aW9uKCB1cmw6IHN0cmluZywgcXVlcnlQYXJhbWV0ZXJzOiBzdHJpbmcgKTogc3RyaW5nIHtcbiAgICBpZiAoIHF1ZXJ5UGFyYW1ldGVycy5zdGFydHNXaXRoKCAnPycgKSB8fCBxdWVyeVBhcmFtZXRlcnMuc3RhcnRzV2l0aCggJyYnICkgKSB7XG4gICAgICBxdWVyeVBhcmFtZXRlcnMgPSBxdWVyeVBhcmFtZXRlcnMuc3Vic3RyaW5nKCAxICk7XG4gICAgfVxuICAgIGlmICggcXVlcnlQYXJhbWV0ZXJzLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgIHJldHVybiB1cmw7XG4gICAgfVxuICAgIGNvbnN0IGNvbWJpbmF0aW9uID0gdXJsLmluY2x1ZGVzKCAnPycgKSA/ICcmJyA6ICc/JztcbiAgICByZXR1cm4gdXJsICsgY29tYmluYXRpb24gKyBxdWVyeVBhcmFtZXRlcnM7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiBmb3IgbXVsdGlwbGUgcXVlcnkgc3RyaW5nc1xuICAgKiBAcGFyYW0gdXJsIC0gbWF5IG9yIG1heSBub3QgYWxyZWFkeSBoYXZlIG90aGVyIHF1ZXJ5IHBhcmFtZXRlcnNcbiAgICogQHBhcmFtIHF1ZXJ5U3RyaW5nQXJyYXkgLSBlYWNoIGl0ZW0gbWF5IHN0YXJ0IHdpdGggJycsICc/Jywgb3IgJyYnXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIHNvdXJjZUZyYW1lLnNyYyA9IFF1ZXJ5U3RyaW5nTWFjaGluZS5hcHBlbmRRdWVyeVN0cmluZ0FycmF5KCBzaW1VUkwsIFsgJ3NjcmVlbnM9MicsICdmcmFtZVRpdGxlPXNvdXJjZScgXSApO1xuICAgKi9cbiAgYXBwZW5kUXVlcnlTdHJpbmdBcnJheTogZnVuY3Rpb24oIHVybDogc3RyaW5nLCBxdWVyeVN0cmluZ0FycmF5OiBzdHJpbmdbXSApOiBzdHJpbmcge1xuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcXVlcnlTdHJpbmdBcnJheS5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHVybCA9IHRoaXMuYXBwZW5kUXVlcnlTdHJpbmcoIHVybCwgcXVlcnlTdHJpbmdBcnJheVsgaSBdICk7XG4gICAgfVxuICAgIHJldHVybiB1cmw7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHF1ZXJ5IHN0cmluZyBhdCB0aGUgZW5kIG9mIGEgdXJsLCBvciAnPycgaWYgdGhlcmUgaXMgbm9uZS5cbiAgICovXG4gIGdldFF1ZXJ5U3RyaW5nOiBmdW5jdGlvbiggdXJsOiBzdHJpbmcgKTogc3RyaW5nIHtcbiAgICBjb25zdCBpbmRleCA9IHVybC5pbmRleE9mKCAnPycgKTtcblxuICAgIGlmICggaW5kZXggPj0gMCApIHtcbiAgICAgIHJldHVybiB1cmwuc3Vic3RyaW5nKCBpbmRleCApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiAnPyc7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBBZGRzIGEgd2FybmluZyB0byB0aGUgY29uc29sZSBhbmQgUXVlcnlTdHJpbmdNYWNoaW5lLndhcm5pbmdzIHRvIGluZGljYXRlIHRoYXQgdGhlIHByb3ZpZGVkIGludmFsaWQgdmFsdWUgd2lsbFxuICAgKiBub3QgYmUgdXNlZC5cbiAgICpcbiAgICogQHBhcmFtIGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIgbmFtZVxuICAgKiBAcGFyYW0gdmFsdWUgLSB0eXBlIGRlcGVuZHMgb24gc2NoZW1hIHR5cGVcbiAgICogQHBhcmFtIG1lc3NhZ2UgLSB0aGUgbWVzc2FnZSB0aGF0IGluZGljYXRlcyB0aGUgcHJvYmxlbSB3aXRoIHRoZSB2YWx1ZVxuICAgKi9cbiAgYWRkV2FybmluZzogZnVuY3Rpb24oIGtleTogc3RyaW5nLCB2YWx1ZTogQW55LCBtZXNzYWdlOiBzdHJpbmcgKTogdm9pZCB7XG5cbiAgICBsZXQgaXNEdXBsaWNhdGUgPSBmYWxzZTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLndhcm5pbmdzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3Qgd2FybmluZyA9IHRoaXMud2FybmluZ3NbIGkgXTtcbiAgICAgIGlmICgga2V5ID09PSB3YXJuaW5nLmtleSAmJiB2YWx1ZSA9PT0gd2FybmluZy52YWx1ZSAmJiBtZXNzYWdlID09PSB3YXJuaW5nLm1lc3NhZ2UgKSB7XG4gICAgICAgIGlzRHVwbGljYXRlID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICggIWlzRHVwbGljYXRlICkge1xuICAgICAgY29uc29sZS53YXJuKCBtZXNzYWdlICk7XG5cbiAgICAgIHRoaXMud2FybmluZ3MucHVzaCgge1xuICAgICAgICBrZXk6IGtleSxcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICBtZXNzYWdlOiBtZXNzYWdlXG4gICAgICB9ICk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIGlmIHRoZXJlIGlzIGEgd2FybmluZyBmb3IgYSBzcGVjaWZpZWQga2V5LlxuICAgKi9cbiAgaGFzV2FybmluZzogZnVuY3Rpb24oIGtleTogc3RyaW5nICk6IGJvb2xlYW4ge1xuICAgIGxldCBoYXNXYXJuaW5nID0gZmFsc2U7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy53YXJuaW5ncy5sZW5ndGggJiYgIWhhc1dhcm5pbmc7IGkrKyApIHtcbiAgICAgIGhhc1dhcm5pbmcgPSAoIHRoaXMud2FybmluZ3NbIGkgXS5rZXkgPT09IGtleSApO1xuICAgIH1cbiAgICByZXR1cm4gaGFzV2FybmluZztcbiAgfSxcblxuICAvKipcbiAgICogQHBhcmFtIHF1ZXJ5U3RyaW5nIC0gdGFpbCBvZiBhIFVSTCBpbmNsdWRpbmcgdGhlIGJlZ2lubmluZyAnPycgKGlmIGFueSlcbiAgICogQHJldHVybnMgLSB0aGUgc3BsaXQgdXAgc3RpbGwtVVJJLWVuY29kZWQgcGFyYW1ldGVycyAod2l0aCB2YWx1ZXMgaWYgcHJlc2VudClcbiAgICovXG4gIGdldFF1ZXJ5UGFyYW1ldGVyc0Zyb21TdHJpbmc6IGZ1bmN0aW9uKCBxdWVyeVN0cmluZzogc3RyaW5nICk6IHN0cmluZ1tdIHtcbiAgICBpZiAoIHF1ZXJ5U3RyaW5nLnN0YXJ0c1dpdGgoICc/JyApICkge1xuICAgICAgY29uc3QgcXVlcnkgPSBxdWVyeVN0cmluZy5zdWJzdHJpbmcoIDEgKTtcbiAgICAgIHJldHVybiBxdWVyeS5zcGxpdCggJyYnICk7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfSxcblxuICAvKipcbiAgICogQHBhcmFtIGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIga2V5IHRvIHJldHVybiBpZiBwcmVzZW50XG4gICAqIEBwYXJhbSBzdHJpbmcgLSBhIFVSTCBpbmNsdWRpbmcgYSBcIj9cIiBpZiBpdCBoYXMgYSBxdWVyeSBzdHJpbmdcbiAgICogQHJldHVybnMgLSB0aGUgcXVlcnkgcGFyYW1ldGVyIGFzIGl0IGFwcGVhcnMgaW4gdGhlIFVSTCwgbGlrZSBga2V5PVZBTFVFYCwgb3IgbnVsbCBpZiBub3QgcHJlc2VudFxuICAgKi9cbiAgZ2V0U2luZ2xlUXVlcnlQYXJhbWV0ZXJTdHJpbmc6IGZ1bmN0aW9uKCBrZXk6IHN0cmluZywgc3RyaW5nOiBzdHJpbmcgKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgY29uc3QgcXVlcnlTdHJpbmcgPSB0aGlzLmdldFF1ZXJ5U3RyaW5nKCBzdHJpbmcgKTtcbiAgICBjb25zdCBxdWVyeVBhcmFtZXRlcnMgPSB0aGlzLmdldFF1ZXJ5UGFyYW1ldGVyc0Zyb21TdHJpbmcoIHF1ZXJ5U3RyaW5nICk7XG5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBxdWVyeVBhcmFtZXRlcnMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBxdWVyeVBhcmFtZXRlciA9IHF1ZXJ5UGFyYW1ldGVyc1sgaSBdO1xuICAgICAgY29uc3Qga2V5QW5kTWF5YmVWYWx1ZSA9IHF1ZXJ5UGFyYW1ldGVyLnNwbGl0KCAnPScgKTtcblxuICAgICAgaWYgKCBkZWNvZGVVUklDb21wb25lbnQoIGtleUFuZE1heWJlVmFsdWVbIDAgXSApID09PSBrZXkgKSB7XG4gICAgICAgIHJldHVybiBxdWVyeVBhcmFtZXRlcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufTtcblxuLyoqXG4gKiBRdWVyeSBzdHJpbmdzIG1heSBzaG93IHRoZSBzYW1lIGtleSBhcHBlYXJpbmcgbXVsdGlwbGUgdGltZXMsIHN1Y2ggYXMgP3ZhbHVlPTImdmFsdWU9My5cbiAqIFRoaXMgbWV0aG9kIHJlY292ZXJzIGFsbCBvZiB0aGUgc3RyaW5nIHZhbHVlcy4gIEZvciB0aGlzIGV4YW1wbGUsIGl0IHdvdWxkIGJlIFsnMicsJzMnXS5cbiAqXG4gKiBAcGFyYW0ga2V5IC0gdGhlIGtleSBmb3Igd2hpY2ggd2UgYXJlIGZpbmRpbmcgdmFsdWVzLlxuICogQHBhcmFtIHN0cmluZyAtIHRoZSBwYXJhbWV0ZXJzIHN0cmluZ1xuICogQHJldHVybnMgLSB0aGUgcmVzdWx0aW5nIHZhbHVlcywgbnVsbCBpbmRpY2F0ZXMgdGhlIHF1ZXJ5IHBhcmFtZXRlciBpcyBwcmVzZW50IHdpdGggbm8gdmFsdWVcbiAqL1xuY29uc3QgZ2V0VmFsdWVzID0gZnVuY3Rpb24oIGtleTogc3RyaW5nLCBzdHJpbmc6IHN0cmluZyApOiBBcnJheTxBbnkgfCBudWxsPiB7XG4gIGNvbnN0IHZhbHVlcyA9IFtdO1xuICBjb25zdCBwYXJhbXMgPSBzdHJpbmcuc2xpY2UoIDEgKS5zcGxpdCggJyYnICk7XG4gIGZvciAoIGxldCBpID0gMDsgaSA8IHBhcmFtcy5sZW5ndGg7IGkrKyApIHtcbiAgICBjb25zdCBzcGxpdEJ5RXF1YWxzID0gcGFyYW1zWyBpIF0uc3BsaXQoICc9JyApO1xuICAgIGNvbnN0IG5hbWUgPSBzcGxpdEJ5RXF1YWxzWyAwIF07XG4gICAgY29uc3QgdmFsdWUgPSBzcGxpdEJ5RXF1YWxzLnNsaWNlKCAxICkuam9pbiggJz0nICk7IC8vIFN1cHBvcnQgYXJiaXRyYXJ5IG51bWJlciBvZiAnPScgaW4gdGhlIHZhbHVlXG4gICAgaWYgKCBuYW1lID09PSBrZXkgKSB7XG4gICAgICBpZiAoIHZhbHVlICkge1xuICAgICAgICB2YWx1ZXMucHVzaCggZGVjb2RlVVJJQ29tcG9uZW50KCB2YWx1ZSApICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFsdWVzLnB1c2goIG51bGwgKTsgLy8gbm8gdmFsdWUgcHJvdmlkZWRcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZhbHVlcztcbn07XG5cbi8vIFNjaGVtYSB2YWxpZGF0aW9uID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8qKlxuICogVmFsaWRhdGVzIHRoZSBzY2hlbWEgZm9yIGEgcXVlcnkgcGFyYW1ldGVyLlxuICogQHBhcmFtIGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIgbmFtZVxuICogQHBhcmFtIHNjaGVtYSAtIHNjaGVtYSB0aGF0IGRlc2NyaWJlcyB0aGUgcXVlcnkgcGFyYW1ldGVyLCBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldFxuICovXG5jb25zdCB2YWxpZGF0ZVNjaGVtYSA9IGZ1bmN0aW9uKCBrZXk6IHN0cmluZywgc2NoZW1hOiBTY2hlbWEgKTogdm9pZCB7XG5cbiAgLy8gdHlwZSBpcyByZXF1aXJlZFxuICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIHNjaGVtYS5oYXNPd25Qcm9wZXJ0eSggJ3R5cGUnICksIGB0eXBlIGZpZWxkIGlzIHJlcXVpcmVkIGZvciBrZXk6ICR7a2V5fWAgKTtcblxuICAvLyB0eXBlIGlzIHZhbGlkXG4gIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggVFlQRVMuaGFzT3duUHJvcGVydHkoIHNjaGVtYS50eXBlICksIGBpbnZhbGlkIHR5cGU6ICR7c2NoZW1hLnR5cGV9IGZvciBrZXk6ICR7a2V5fWAgKTtcblxuICAvLyBwYXJzZSBpcyBhIGZ1bmN0aW9uXG4gIGlmICggc2NoZW1hLmhhc093blByb3BlcnR5KCAncGFyc2UnICkgKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIFRPRE8gV2hhdCBpcyB0aGUgYmVzdCB3YXkgdG8gdHlwZSBuYXJyb3cgc2NoZW1hPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVlcnktc3RyaW5nLW1hY2hpbmUvaXNzdWVzLzQ1XG4gICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCB0eXBlb2Ygc2NoZW1hLnBhcnNlID09PSAnZnVuY3Rpb24nLCBgcGFyc2UgbXVzdCBiZSBhIGZ1bmN0aW9uIGZvciBrZXk6ICR7a2V5fWAgKTtcbiAgfVxuXG4gIC8vIHZhbGlkVmFsdWVzIGFuZCBpc1ZhbGlkVmFsdWUgYXJlIG9wdGlvbmFsIGFuZCBtdXR1YWxseSBleGNsdXNpdmVcbiAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCAhKCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICd2YWxpZFZhbHVlcycgKSAmJiBzY2hlbWEuaGFzT3duUHJvcGVydHkoICdpc1ZhbGlkVmFsdWUnICkgKSxcbiAgICBgdmFsaWRWYWx1ZXMgYW5kIGlzVmFsaWRWYWx1ZSBhcmUgbXV0dWFsbHkgZXhjbHVzaXZlIGZvciBrZXk6ICR7a2V5fWAgKTtcblxuICAvLyB2YWxpZFZhbHVlcyBpcyBhbiBBcnJheVxuICBpZiAoIHNjaGVtYS5oYXNPd25Qcm9wZXJ0eSggJ3ZhbGlkVmFsdWVzJyApICkge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBUT0RPIFdoYXQgaXMgdGhlIGJlc3Qgd2F5IHRvIHR5cGUgbmFycm93IHNjaGVtYT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3F1ZXJ5LXN0cmluZy1tYWNoaW5lL2lzc3Vlcy80NVxuICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggQXJyYXkuaXNBcnJheSggc2NoZW1hLnZhbGlkVmFsdWVzICksIGBpc1ZhbGlkVmFsdWUgbXVzdCBiZSBhbiBhcnJheSBmb3Iga2V5OiAke2tleX1gICk7XG4gIH1cblxuICAvLyBpc1ZhbGlkVmFsdWUgaXMgYSBmdW5jdGlvblxuICBpZiAoIHNjaGVtYS5oYXNPd25Qcm9wZXJ0eSggJ2lzVmFsaWRWYWx1ZScgKSApIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gVE9ETyBXaGF0IGlzIHRoZSBiZXN0IHdheSB0byB0eXBlIG5hcnJvdyBzY2hlbWE/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xdWVyeS1zdHJpbmctbWFjaGluZS9pc3N1ZXMvNDVcbiAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIHR5cGVvZiBzY2hlbWEuaXNWYWxpZFZhbHVlID09PSAnZnVuY3Rpb24nLCBgaXNWYWxpZFZhbHVlIG11c3QgYmUgYSBmdW5jdGlvbiBmb3Iga2V5OiAke2tleX1gICk7XG4gIH1cblxuICAvLyBkZWZhdWx0VmFsdWUgaGFzIHRoZSBjb3JyZWN0IHR5cGVcbiAgaWYgKCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICdkZWZhdWx0VmFsdWUnICkgKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIFRPRE8gV2hhdCBpcyB0aGUgYmVzdCB3YXkgdG8gdHlwZSBuYXJyb3cgc2NoZW1hPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVlcnktc3RyaW5nLW1hY2hpbmUvaXNzdWVzLzQ1XG4gICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBUWVBFU1sgc2NoZW1hLnR5cGUgXS5pc1ZhbGlkVmFsdWUoIHNjaGVtYS5kZWZhdWx0VmFsdWUgKSwgYGRlZmF1bHRWYWx1ZSBpbmNvcnJlY3QgdHlwZTogJHtrZXl9YCApO1xuICB9XG5cbiAgLy8gdmFsaWRWYWx1ZXMgaGF2ZSB0aGUgY29ycmVjdCB0eXBlXG4gIGlmICggc2NoZW1hLmhhc093blByb3BlcnR5KCAndmFsaWRWYWx1ZXMnICkgKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIFRPRE8gV2hhdCBpcyB0aGUgYmVzdCB3YXkgdG8gdHlwZSBuYXJyb3cgc2NoZW1hPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVlcnktc3RyaW5nLW1hY2hpbmUvaXNzdWVzLzQ1XG4gICAgc2NoZW1hLnZhbGlkVmFsdWVzLmZvckVhY2goIHZhbHVlID0+IHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggVFlQRVNbIHNjaGVtYS50eXBlIF0uaXNWYWxpZFZhbHVlKCB2YWx1ZSApLCBgdmFsaWRWYWx1ZSBpbmNvcnJlY3QgdHlwZSBmb3Iga2V5OiAke2tleX1gICkgKTtcbiAgfVxuXG4gIC8vIGRlZmF1bHRWYWx1ZSBpcyBhIG1lbWJlciBvZiB2YWxpZFZhbHVlc1xuICBpZiAoIHNjaGVtYS5oYXNPd25Qcm9wZXJ0eSggJ2RlZmF1bHRWYWx1ZScgKSAmJiBzY2hlbWEuaGFzT3duUHJvcGVydHkoICd2YWxpZFZhbHVlcycgKSApIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gVE9ETyBXaGF0IGlzIHRoZSBiZXN0IHdheSB0byB0eXBlIG5hcnJvdyBzY2hlbWE/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xdWVyeS1zdHJpbmctbWFjaGluZS9pc3N1ZXMvNDVcbiAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIGlzVmFsaWRWYWx1ZSggc2NoZW1hLmRlZmF1bHRWYWx1ZSwgc2NoZW1hLnZhbGlkVmFsdWVzICksIGBkZWZhdWx0VmFsdWUgbXVzdCBiZSBhIG1lbWJlciBvZiB2YWxpZFZhbHVlcywgZm9yIGtleTogJHtrZXl9YCApO1xuICB9XG5cbiAgLy8gZGVmYXVsdFZhbHVlIG11c3QgZXhpc3QgZm9yIGEgcHVibGljIHNjaGVtYSBzbyB0aGVyZSdzIGEgZmFsbGJhY2sgaW4gY2FzZSBhIHVzZXIgcHJvdmlkZXMgYW4gaW52YWxpZCB2YWx1ZS5cbiAgLy8gSG93ZXZlciwgZGVmYXVsdFZhbHVlIGlzIG5vdCByZXF1aXJlZCBmb3IgZmxhZ3Mgc2luY2UgdGhleSdyZSBvbmx5IGEga2V5LiBXaGlsZSBtYXJraW5nIGEgZmxhZyBhcyBwdWJsaWM6IHRydWVcbiAgLy8gZG9lc24ndCBjaGFuZ2UgaXRzIGJlaGF2aW9yLCBpdCdzIGFsbG93ZWQgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZSBwdWJsaWMga2V5IGZvciBkb2N1bWVudGF0aW9uLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3F1ZXJ5LXN0cmluZy1tYWNoaW5lL2lzc3Vlcy80MVxuICBpZiAoIHNjaGVtYS5oYXNPd25Qcm9wZXJ0eSggJ3B1YmxpYycgKSAmJiBzY2hlbWEucHVibGljICYmIHNjaGVtYS50eXBlICE9PSAnZmxhZycgKSB7XG4gICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICdkZWZhdWx0VmFsdWUnICksIGBkZWZhdWx0VmFsdWUgaXMgcmVxdWlyZWQgd2hlbiBwdWJsaWM6IHRydWUgZm9yIGtleTogJHtrZXl9YCApO1xuICB9XG5cbiAgLy8gdmVyaWZ5IHRoYXQgdGhlIHNjaGVtYSBoYXMgYXBwcm9wcmlhdGUgcHJvcGVydGllc1xuICB2YWxpZGF0ZVNjaGVtYVByb3BlcnRpZXMoIGtleSwgc2NoZW1hLCBUWVBFU1sgc2NoZW1hLnR5cGUgXS5yZXF1aXJlZCwgVFlQRVNbIHNjaGVtYS50eXBlIF0ub3B0aW9uYWwgKTtcblxuICAvLyBkaXNwYXRjaCBmdXJ0aGVyIHZhbGlkYXRpb24gdG8gYW4gKG9wdGlvbmFsKSB0eXBlLXNwZWNpZmljIGZ1bmN0aW9uXG4gIGlmICggVFlQRVNbIHNjaGVtYS50eXBlIF0udmFsaWRhdGVTY2hlbWEgKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIGhlbHAgbWUsIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xdWVyeS1zdHJpbmctbWFjaGluZS9pc3N1ZXMvNDVcbiAgICBUWVBFU1sgc2NoZW1hLnR5cGUgXS52YWxpZGF0ZVNjaGVtYSEoIGtleSwgc2NoZW1hICk7XG4gIH1cbn07XG5cbi8qKlxuICogVmFsaWRhdGVzIHNjaGVtYSBmb3IgdHlwZSAnYXJyYXknLlxuICogQHBhcmFtIGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIgbmFtZVxuICogQHBhcmFtIHNjaGVtYSAtIHNjaGVtYSB0aGF0IGRlc2NyaWJlcyB0aGUgcXVlcnkgcGFyYW1ldGVyLCBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldFxuICovXG5jb25zdCB2YWxpZGF0ZUFycmF5U2NoZW1hID0gZnVuY3Rpb24oIGtleTogc3RyaW5nLCBzY2hlbWE6IEFycmF5U2NoZW1hICk6IHZvaWQge1xuXG4gIC8vIHNlcGFyYXRvciBpcyBhIHNpbmdsZSBjaGFyYWN0ZXJcbiAgaWYgKCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICdzZXBhcmF0b3InICkgKSB7XG4gICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCB0eXBlb2Ygc2NoZW1hLnNlcGFyYXRvciA9PT0gJ3N0cmluZycgJiYgc2NoZW1hLnNlcGFyYXRvci5sZW5ndGggPT09IDEsIGBpbnZhbGlkIHNlcGFyYXRvcjogJHtzY2hlbWEuc2VwYXJhdG9yfSwgZm9yIGtleTogJHtrZXl9YCApO1xuICB9XG5cbiAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCAhc2NoZW1hLmVsZW1lbnRTY2hlbWEuaGFzT3duUHJvcGVydHkoICdwdWJsaWMnICksICdBcnJheSBlbGVtZW50cyBzaG91bGQgbm90IGRlY2xhcmUgcHVibGljOyBpdCBjb21lcyBmcm9tIHRoZSBhcnJheSBzY2hlbWEgaXRzZWxmLicgKTtcblxuICAvLyB2YWxpZGF0ZSBlbGVtZW50U2NoZW1hXG4gIHZhbGlkYXRlU2NoZW1hKCBgJHtrZXl9LmVsZW1lbnRgLCBzY2hlbWEuZWxlbWVudFNjaGVtYSApO1xufTtcblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IGEgc2NoZW1hIGNvbnRhaW5zIG9ubHkgc3VwcG9ydGVkIHByb3BlcnRpZXMsIGFuZCBjb250YWlucyBhbGwgcmVxdWlyZWQgcHJvcGVydGllcy5cbiAqIEBwYXJhbSBrZXkgLSB0aGUgcXVlcnkgcGFyYW1ldGVyIG5hbWVcbiAqIEBwYXJhbSBzY2hlbWEgLSBzY2hlbWEgdGhhdCBkZXNjcmliZXMgdGhlIHF1ZXJ5IHBhcmFtZXRlciwgc2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRcbiAqIEBwYXJhbSByZXF1aXJlZFByb3BlcnRpZXMgLSBwcm9wZXJ0aWVzIHRoYXQgdGhlIHNjaGVtYSBtdXN0IGhhdmVcbiAqIEBwYXJhbSBvcHRpb25hbFByb3BlcnRpZXMgLSBwcm9wZXJ0aWVzIHRoYXQgdGhlIHNjaGVtYSBtYXkgb3B0aW9uYWxseSBoYXZlXG4gKi9cbmNvbnN0IHZhbGlkYXRlU2NoZW1hUHJvcGVydGllcyA9IGZ1bmN0aW9uKCBrZXk6IHN0cmluZywgc2NoZW1hOiBTY2hlbWEsIHJlcXVpcmVkUHJvcGVydGllczogc3RyaW5nW10sIG9wdGlvbmFsUHJvcGVydGllczogc3RyaW5nW10gKTogdm9pZCB7XG5cbiAgLy8ge3N0cmluZ1tdfSwgdGhlIG5hbWVzIG9mIHRoZSBwcm9wZXJ0aWVzIGluIHRoZSBzY2hlbWFcbiAgY29uc3Qgc2NoZW1hUHJvcGVydGllcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKCBzY2hlbWEgKTtcblxuICAvLyB2ZXJpZnkgdGhhdCBhbGwgcmVxdWlyZWQgcHJvcGVydGllcyBhcmUgcHJlc2VudFxuICByZXF1aXJlZFByb3BlcnRpZXMuZm9yRWFjaCggcHJvcGVydHkgPT4ge1xuICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggc2NoZW1hUHJvcGVydGllcy5pbmNsdWRlcyggcHJvcGVydHkgKSwgYG1pc3NpbmcgcmVxdWlyZWQgcHJvcGVydHk6ICR7cHJvcGVydHl9IGZvciBrZXk6ICR7a2V5fWAgKTtcbiAgfSApO1xuXG4gIC8vIHZlcmlmeSB0aGF0IHRoZXJlIGFyZSBubyB1bnN1cHBvcnRlZCBwcm9wZXJ0aWVzXG4gIGNvbnN0IHN1cHBvcnRlZFByb3BlcnRpZXMgPSByZXF1aXJlZFByb3BlcnRpZXMuY29uY2F0KCBvcHRpb25hbFByb3BlcnRpZXMgKTtcbiAgc2NoZW1hUHJvcGVydGllcy5mb3JFYWNoKCBwcm9wZXJ0eSA9PiB7XG4gICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBwcm9wZXJ0eSA9PT0gJ3R5cGUnIHx8IHN1cHBvcnRlZFByb3BlcnRpZXMuaW5jbHVkZXMoIHByb3BlcnR5ICksIGB1bnN1cHBvcnRlZCBwcm9wZXJ0eTogJHtwcm9wZXJ0eX0gZm9yIGtleTogJHtrZXl9YCApO1xuICB9ICk7XG59O1xuXG4vLyBQYXJzaW5nID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vKipcbiAqIFVzZXMgdGhlIHN1cHBsaWVkIHNjaGVtYSB0byBjb252ZXJ0IHF1ZXJ5IHBhcmFtZXRlciB2YWx1ZShzKSBmcm9tIHN0cmluZyB0byB0aGUgZGVzaXJlZCB2YWx1ZSB0eXBlLlxuICogQHBhcmFtIGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIgbmFtZVxuICogQHBhcmFtIHNjaGVtYSAtIHNjaGVtYSB0aGF0IGRlc2NyaWJlcyB0aGUgcXVlcnkgcGFyYW1ldGVyLCBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldFxuICogQHBhcmFtIHZhbHVlcyAtIGFueSBtYXRjaGVzIGZyb20gdGhlIHF1ZXJ5IHN0cmluZyxcbiAqICAgY291bGQgYmUgbXVsdGlwbGUgZm9yID92YWx1ZT14JnZhbHVlPXkgZm9yIGV4YW1wbGVcbiAqIEByZXR1cm5zIHRoZSBhc3NvY2lhdGVkIHZhbHVlLCBjb252ZXJ0ZWQgdG8gdGhlIHByb3BlciB0eXBlXG4gKi9cbmNvbnN0IHBhcnNlVmFsdWVzID0gZnVuY3Rpb24gPFMgZXh0ZW5kcyBTY2hlbWE+KCBrZXk6IHN0cmluZywgc2NoZW1hOiBTLCB2YWx1ZXM6IEFycmF5PFVucGFyc2VkVmFsdWU+ICk6IFBhcnNlZFZhbHVlPFM+IHtcbiAgbGV0IHJldHVyblZhbHVlO1xuXG4gIC8vIHZhbHVlcyBjb250YWlucyB2YWx1ZXMgZm9yIGFsbCBvY2N1cnJlbmNlcyBvZiB0aGUgcXVlcnkgcGFyYW1ldGVyLiAgV2UgY3VycmVudGx5IHN1cHBvcnQgb25seSAxIG9jY3VycmVuY2UuXG4gIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggdmFsdWVzLmxlbmd0aCA8PSAxLCBgcXVlcnkgcGFyYW1ldGVyIGNhbm5vdCBvY2N1ciBtdWx0aXBsZSB0aW1lczogJHtrZXl9YCApO1xuXG4gIGlmICggc2NoZW1hLnR5cGUgPT09ICdmbGFnJyApIHtcblxuICAgIC8vIGZsYWcgaXMgYSBjb252ZW5pZW50IHZhcmlhdGlvbiBvZiBib29sZWFuLCB3aGljaCBkZXBlbmRzIG9uIHdoZXRoZXIgdGhlIHF1ZXJ5IHN0cmluZyBpcyBwcmVzZW50IG9yIG5vdFxuICAgIGNvbnN0IHR5cGUgPSBUWVBFU1sgc2NoZW1hLnR5cGUgXTtcbiAgICByZXR1cm5WYWx1ZSA9IHR5cGUucGFyc2UoIGtleSwgc2NoZW1hLCB2YWx1ZXNbIDAgXSApO1xuICB9XG4gIGVsc2Uge1xuICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggdmFsdWVzWyAwIF0gIT09IHVuZGVmaW5lZCB8fCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICdkZWZhdWx0VmFsdWUnICksXG4gICAgICBgbWlzc2luZyByZXF1aXJlZCBxdWVyeSBwYXJhbWV0ZXI6ICR7a2V5fWAgKTtcbiAgICBpZiAoIHZhbHVlc1sgMCBdID09PSB1bmRlZmluZWQgKSB7XG5cbiAgICAgIC8vIG5vdCBpbiB0aGUgcXVlcnkgc3RyaW5nLCB1c2UgdGhlIGRlZmF1bHRcbiAgICAgIHJldHVyblZhbHVlID0gc2NoZW1hLmRlZmF1bHRWYWx1ZTtcbiAgICB9XG4gICAgZWxzZSB7XG5cbiAgICAgIGNvbnN0IHR5cGUgPSBUWVBFU1sgc2NoZW1hLnR5cGUgXTtcbiAgICAgIC8vIGRpc3BhdGNoIHBhcnNpbmcgb2YgcXVlcnkgc3RyaW5nIHRvIGEgdHlwZS1zcGVjaWZpYyBmdW5jdGlvblxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIHNjaGVtYSBzaG91bGQgYmUgc3BlY2lmaWMgZm9yIHRoYXQgdHlwZS4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3F1ZXJ5LXN0cmluZy1tYWNoaW5lL2lzc3Vlcy80NVxuICAgICAgcmV0dXJuVmFsdWUgPSB0eXBlLnBhcnNlKCBrZXksIHNjaGVtYSwgdmFsdWVzWyAwIF0gKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmV0dXJuVmFsdWU7XG59O1xuXG4vKipcbiAqIFBhcnNlcyB0aGUgdmFsdWUgZm9yIGEgdHlwZSAnZmxhZycuXG4gKiBAcGFyYW0ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBuYW1lXG4gKiBAcGFyYW0gc2NoZW1hIC0gc2NoZW1hIHRoYXQgZGVzY3JpYmVzIHRoZSBxdWVyeSBwYXJhbWV0ZXIsIHNlZSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0XG4gKiBAcGFyYW0gdmFsdWUgLSB2YWx1ZSBmcm9tIHRoZSBxdWVyeSBwYXJhbWV0ZXIgc3RyaW5nXG4gKi9cbmNvbnN0IHBhcnNlRmxhZyA9IGZ1bmN0aW9uKCBrZXk6IHN0cmluZywgc2NoZW1hOiBGbGFnU2NoZW1hLCB2YWx1ZTogVW5wYXJzZWRWYWx1ZSApOiBib29sZWFuIHwgc3RyaW5nIHtcbiAgcmV0dXJuIHZhbHVlID09PSBudWxsID8gdHJ1ZSA6IHZhbHVlID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IHZhbHVlO1xufTtcblxuLyoqXG4gKiBQYXJzZXMgdGhlIHZhbHVlIGZvciBhIHR5cGUgJ2Jvb2xlYW4nLlxuICogQHBhcmFtIGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIgbmFtZVxuICogQHBhcmFtIHNjaGVtYSAtIHNjaGVtYSB0aGF0IGRlc2NyaWJlcyB0aGUgcXVlcnkgcGFyYW1ldGVyLCBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldFxuICogQHBhcmFtIHN0cmluZyAtIHZhbHVlIGZyb20gdGhlIHF1ZXJ5IHBhcmFtZXRlciBzdHJpbmdcbiAqL1xuY29uc3QgcGFyc2VCb29sZWFuID0gZnVuY3Rpb24oIGtleTogc3RyaW5nLCBzY2hlbWE6IEJvb2xlYW5TY2hlbWEsIHN0cmluZzogVW5wYXJzZWRWYWx1ZSApOiBib29sZWFuIHwgc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBzdHJpbmcgPT09ICd0cnVlJyA/IHRydWUgOiBzdHJpbmcgPT09ICdmYWxzZScgPyBmYWxzZSA6IHN0cmluZztcbn07XG5cbi8qKlxuICogUGFyc2VzIHRoZSB2YWx1ZSBmb3IgYSB0eXBlICdudW1iZXInLlxuICogQHBhcmFtIGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIgbmFtZVxuICogQHBhcmFtIHNjaGVtYSAtIHNjaGVtYSB0aGF0IGRlc2NyaWJlcyB0aGUgcXVlcnkgcGFyYW1ldGVyLCBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldFxuICogQHBhcmFtIHN0cmluZyAtIHZhbHVlIGZyb20gdGhlIHF1ZXJ5IHBhcmFtZXRlciBzdHJpbmdcbiAqL1xuY29uc3QgcGFyc2VOdW1iZXIgPSBmdW5jdGlvbigga2V5OiBzdHJpbmcsIHNjaGVtYTogTnVtYmVyU2NoZW1hLCBzdHJpbmc6IFVucGFyc2VkVmFsdWUgKTogbnVtYmVyIHwgVW5wYXJzZWRWYWx1ZSB7XG4gIGNvbnN0IG51bWJlciA9IE51bWJlciggc3RyaW5nICk7XG4gIHJldHVybiBzdHJpbmcgPT09IG51bGwgfHwgaXNOYU4oIG51bWJlciApID8gc3RyaW5nIDogbnVtYmVyO1xufTtcblxuLyoqXG4gKiBQYXJzZXMgdGhlIHZhbHVlIGZvciBhIHR5cGUgJ251bWJlcicuXG4gKiBUaGUgdmFsdWUgdG8gYmUgcGFyc2VkIGlzIGFscmVhZHkgc3RyaW5nLCBzbyBpdCBpcyBndWFyYW50ZWVkIHRvIHBhcnNlIGFzIGEgc3RyaW5nLlxuICogQHBhcmFtIGtleVxuICogQHBhcmFtIHNjaGVtYVxuICogQHBhcmFtIHN0cmluZ1xuICovXG5jb25zdCBwYXJzZVN0cmluZyA9IGZ1bmN0aW9uKCBrZXk6IHN0cmluZywgc2NoZW1hOiBTdHJpbmdTY2hlbWEsIHN0cmluZzogVW5wYXJzZWRWYWx1ZSApOiBVbnBhcnNlZFZhbHVlIHtcbiAgcmV0dXJuIHN0cmluZztcbn07XG5cbi8qKlxuICogUGFyc2VzIHRoZSB2YWx1ZSBmb3IgYSB0eXBlICdhcnJheScuXG4gKiBAcGFyYW0ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBuYW1lXG4gKiBAcGFyYW0gc2NoZW1hIC0gc2NoZW1hIHRoYXQgZGVzY3JpYmVzIHRoZSBxdWVyeSBwYXJhbWV0ZXIsIHNlZSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0XG4gKiBAcGFyYW0gdmFsdWUgLSB2YWx1ZSBmcm9tIHRoZSBxdWVyeSBwYXJhbWV0ZXIgc3RyaW5nXG4gKi9cbmNvbnN0IHBhcnNlQXJyYXkgPSBmdW5jdGlvbigga2V5OiBzdHJpbmcsIHNjaGVtYTogQXJyYXlTY2hlbWEsIHZhbHVlOiBVbnBhcnNlZFZhbHVlICk6IEFycmF5PEFueT4ge1xuXG4gIGxldCByZXR1cm5WYWx1ZTtcblxuICBpZiAoIHZhbHVlID09PSBudWxsICkge1xuXG4gICAgLy8gbnVsbCBzaWduaWZpZXMgYW4gZW1wdHkgYXJyYXkuIEZvciBpbnN0YW5jZSA/c2NyZWVucz0gd291bGQgZ2l2ZSBbXVxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVlcnktc3RyaW5nLW1hY2hpbmUvaXNzdWVzLzE3XG4gICAgcmV0dXJuVmFsdWUgPSBbXTtcbiAgfVxuICBlbHNlIHtcblxuICAgIC8vIFNwbGl0IHVwIHRoZSBzdHJpbmcgaW50byBhbiBhcnJheSBvZiB2YWx1ZXMuIEUuZy4gP3NjcmVlbnM9MSwyIHdvdWxkIGdpdmUgWzEsMl1cbiAgICByZXR1cm5WYWx1ZSA9IHZhbHVlIS5zcGxpdCggc2NoZW1hLnNlcGFyYXRvciB8fCBERUZBVUxUX1NFUEFSQVRPUiApXG4gICAgICAubWFwKCBlbGVtZW50ID0+IHBhcnNlVmFsdWVzKCBrZXksIHNjaGVtYS5lbGVtZW50U2NoZW1hLCBbIGVsZW1lbnQgXSApICk7XG4gIH1cblxuICByZXR1cm4gcmV0dXJuVmFsdWU7XG59O1xuXG4vKipcbiAqIFBhcnNlcyB0aGUgdmFsdWUgZm9yIGEgdHlwZSAnY3VzdG9tJy5cbiAqIEBwYXJhbSBrZXkgLSB0aGUgcXVlcnkgcGFyYW1ldGVyIG5hbWVcbiAqIEBwYXJhbSBzY2hlbWEgLSBzY2hlbWEgdGhhdCBkZXNjcmliZXMgdGhlIHF1ZXJ5IHBhcmFtZXRlciwgc2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRcbiAqIEBwYXJhbSB2YWx1ZSAtIHZhbHVlIGZyb20gdGhlIHF1ZXJ5IHBhcmFtZXRlciBzdHJpbmdcbiAqL1xuY29uc3QgcGFyc2VDdXN0b20gPSBmdW5jdGlvbigga2V5OiBzdHJpbmcsIHNjaGVtYTogQ3VzdG9tU2NoZW1hLCB2YWx1ZTogVW5wYXJzZWRWYWx1ZSApOiBBbnkge1xuICByZXR1cm4gc2NoZW1hLnBhcnNlKCB2YWx1ZSBhcyB1bmtub3duIGFzIHN0cmluZyApO1xufTtcblxuLy8gVXRpbGl0aWVzID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIHZhbHVlIGlzIGluIGEgc2V0IG9mIHZhbGlkIHZhbHVlcywgdXNlcyBkZWVwIGNvbXBhcmlzb24uXG4gKi9cbmNvbnN0IGlzVmFsaWRWYWx1ZSA9IGZ1bmN0aW9uKCB2YWx1ZTogQW55LCB2YWxpZFZhbHVlczogQW55W10gKTogYm9vbGVhbiB7XG4gIGxldCBmb3VuZCA9IGZhbHNlO1xuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB2YWxpZFZhbHVlcy5sZW5ndGggJiYgIWZvdW5kOyBpKysgKSB7XG4gICAgZm91bmQgPSBRdWVyeVN0cmluZ01hY2hpbmUuZGVlcEVxdWFscyggdmFsaWRWYWx1ZXNbIGkgXSwgdmFsdWUgKTtcbiAgfVxuICByZXR1cm4gZm91bmQ7XG59O1xuXG4vKipcbiAqIFF1ZXJ5IHBhcmFtZXRlcnMgYXJlIHNwZWNpZmllZCBieSB0aGUgdXNlciwgYW5kIGFyZSBvdXRzaWRlIHRoZSBjb250cm9sIG9mIHRoZSBwcm9ncmFtbWVyLlxuICogU28gdGhlIGFwcGxpY2F0aW9uIHNob3VsZCB0aHJvdyBhbiBFcnJvciBpZiBxdWVyeSBwYXJhbWV0ZXJzIGFyZSBpbnZhbGlkLlxuICogQHBhcmFtIHByZWRpY2F0ZSAtIGlmIHByZWRpY2F0ZSBldmFsdWF0ZXMgdG8gZmFsc2UsIGFuIEVycm9yIGlzIHRocm93blxuICogQHBhcmFtIG1lc3NhZ2VcbiAqL1xuY29uc3QgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0ID0gZnVuY3Rpb24oIHByZWRpY2F0ZTogYm9vbGVhbiwgbWVzc2FnZTogc3RyaW5nICk6IHZvaWQge1xuICBpZiAoICFwcmVkaWNhdGUgKSB7XG4gICAgY29uc29sZSAmJiBjb25zb2xlLmxvZyAmJiBjb25zb2xlLmxvZyggbWVzc2FnZSApO1xuICAgIHRocm93IG5ldyBFcnJvciggYFF1ZXJ5IFN0cmluZyBNYWNoaW5lIEFzc2VydGlvbiBmYWlsZWQ6ICR7bWVzc2FnZX1gICk7XG4gIH1cbn07XG5cbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbnR5cGUgU2NoZW1hVHlwZTxULCBTcGVjaWZpY1NjaGVtYT4gPSB7XG4gIHJlcXVpcmVkOiBBcnJheTxrZXlvZiBTcGVjaWZpY1NjaGVtYT47XG4gIG9wdGlvbmFsOiBBcnJheTxrZXlvZiBTcGVjaWZpY1NjaGVtYT47XG4gIHZhbGlkYXRlU2NoZW1hOiBudWxsIHwgKCAoIGtleTogc3RyaW5nLCBzY2hlbWE6IFNwZWNpZmljU2NoZW1hICkgPT4gdm9pZCApO1xuICBwYXJzZTogKCBrZXk6IHN0cmluZywgc2NoZW1hOiBTcGVjaWZpY1NjaGVtYSwgdmFsdWU6IFVucGFyc2VkVmFsdWUgKSA9PiBUO1xuICBpc1ZhbGlkVmFsdWU6ICggdmFsdWU6IEFueSApID0+IGJvb2xlYW47XG4gIGRlZmF1bHRWYWx1ZT86IFQ7XG59O1xuXG4vLyBUT0RPOiBUaGVzZSBzdHJpbmdzIHNlZW0gd3JvbmcsIGxldCdzIG5vdCBkbyB0aGF0LCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVlcnktc3RyaW5nLW1hY2hpbmUvaXNzdWVzLzQ1XG50eXBlIFNjaGVtYVR5cGVzID0ge1xuICBmbGFnOiBTY2hlbWFUeXBlPGJvb2xlYW4gfCBVbnBhcnNlZFZhbHVlLCBGbGFnU2NoZW1hPjtcbiAgYm9vbGVhbjogU2NoZW1hVHlwZTxib29sZWFuIHwgVW5wYXJzZWRWYWx1ZSwgQm9vbGVhblNjaGVtYT47XG4gIG51bWJlcjogU2NoZW1hVHlwZTxudW1iZXIgfCBVbnBhcnNlZFZhbHVlLCBOdW1iZXJTY2hlbWE+O1xuICBzdHJpbmc6IFNjaGVtYVR5cGU8c3RyaW5nIHwgVW5wYXJzZWRWYWx1ZSwgU3RyaW5nU2NoZW1hPjtcbiAgYXJyYXk6IFNjaGVtYVR5cGU8QW55W10sIEFycmF5U2NoZW1hPjtcbiAgY3VzdG9tOiBTY2hlbWFUeXBlPEFueSwgQ3VzdG9tU2NoZW1hPjtcbn07XG5cbi8qKlxuICogRGF0YSBzdHJ1Y3R1cmUgdGhhdCBkZXNjcmliZXMgZWFjaCBxdWVyeSBwYXJhbWV0ZXIgdHlwZSwgd2hpY2ggcHJvcGVydGllcyBhcmUgcmVxdWlyZWQgdnMgb3B0aW9uYWwsXG4gKiBob3cgdG8gdmFsaWRhdGUsIGFuZCBob3cgdG8gcGFyc2UuXG4gKlxuICogVGhlIHByb3BlcnRpZXMgdGhhdCBhcmUgcmVxdWlyZWQgb3Igb3B0aW9uYWwgZGVwZW5kIG9uIHRoZSB0eXBlIChzZWUgVFlQRVMpLCBhbmQgaW5jbHVkZTpcbiAqIHR5cGUgLSB7c3RyaW5nfSB0aGUgdHlwZSBuYW1lXG4gKiBkZWZhdWx0VmFsdWUgLSB0aGUgdmFsdWUgdG8gdXNlIGlmIG5vIHF1ZXJ5IHBhcmFtZXRlciBpcyBwcm92aWRlZC4gSWYgdGhlcmUgaXMgbm8gZGVmYXVsdFZhbHVlLCB0aGVuXG4gKiAgICB0aGUgcXVlcnkgcGFyYW1ldGVyIGlzIHJlcXVpcmVkIGluIHRoZSBxdWVyeSBzdHJpbmc7IG9taXR0aW5nIHRoZSBxdWVyeSBwYXJhbWV0ZXIgd2lsbCByZXN1bHQgaW4gYW4gRXJyb3IuXG4gKiB2YWxpZFZhbHVlcyAtIGFycmF5IG9mIHRoZSB2YWxpZCB2YWx1ZXMgZm9yIHRoZSBxdWVyeSBwYXJhbWV0ZXJcbiAqIGlzVmFsaWRWYWx1ZSAtIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYSBwYXJzZWQgT2JqZWN0IChub3Qgc3RyaW5nKSBhbmQgY2hlY2tzIGlmIGl0IGlzIGFjY2VwdGFibGVcbiAqIGVsZW1lbnRTY2hlbWEgLSBzcGVjaWZpZXMgdGhlIHNjaGVtYSBmb3IgZWxlbWVudHMgaW4gYW4gYXJyYXlcbiAqIHNlcGFyYXRvciAtICBhcnJheSBlbGVtZW50cyBhcmUgc2VwYXJhdGVkIGJ5IHRoaXMgc3RyaW5nLCBkZWZhdWx0cyB0byBgLGBcbiAqIHBhcnNlIC0gYSBmdW5jdGlvbiB0aGF0IHRha2VzIGEgc3RyaW5nIGFuZCByZXR1cm5zIGFuIE9iamVjdFxuICovXG5jb25zdCBUWVBFUzogU2NoZW1hVHlwZXMgPSB7XG4gIC8vIE5PVEU6IFR5cGVzIGZvciB0aGlzIGFyZSBjdXJyZW50bHkgaW4gcGhldC10eXBlcy5kLnRzISBDaGFuZ2VzIGhlcmUgc2hvdWxkIGJlIG1hZGUgdGhlcmUgYWxzb1xuXG4gIC8vIHZhbHVlIGlzIHRydWUgaWYgcHJlc2VudCwgZmFsc2UgaWYgYWJzZW50XG4gIGZsYWc6IHtcbiAgICByZXF1aXJlZDogW10sXG4gICAgb3B0aW9uYWw6IFsgJ3ByaXZhdGUnLCAncHVibGljJyBdLFxuICAgIHZhbGlkYXRlU2NoZW1hOiBudWxsLCAvLyBubyB0eXBlLXNwZWNpZmljIHNjaGVtYSB2YWxpZGF0aW9uXG4gICAgcGFyc2U6IHBhcnNlRmxhZyxcbiAgICBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+IHZhbHVlID09PSB0cnVlIHx8IHZhbHVlID09PSBmYWxzZSxcbiAgICBkZWZhdWx0VmFsdWU6IHRydWUgLy8gb25seSBuZWVkZWQgZm9yIGZsYWdzIG1hcmtzIGFzICdwdWJsaWM6IHRydWVgXG4gIH0sXG5cbiAgLy8gdmFsdWUgaXMgZWl0aGVyIHRydWUgb3IgZmFsc2UsIGUuZy4gc2hvd0Fuc3dlcj10cnVlXG4gIGJvb2xlYW46IHtcbiAgICByZXF1aXJlZDogW10sXG4gICAgb3B0aW9uYWw6IFsgJ2RlZmF1bHRWYWx1ZScsICdwcml2YXRlJywgJ3B1YmxpYycgXSxcbiAgICB2YWxpZGF0ZVNjaGVtYTogbnVsbCwgLy8gbm8gdHlwZS1zcGVjaWZpYyBzY2hlbWEgdmFsaWRhdGlvblxuICAgIHBhcnNlOiBwYXJzZUJvb2xlYW4sXG4gICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiB2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gZmFsc2VcbiAgfSxcblxuICAvLyB2YWx1ZSBpcyBhIG51bWJlciwgZS5nLiBmcmFtZVJhdGU9MTAwXG4gIG51bWJlcjoge1xuICAgIHJlcXVpcmVkOiBbXSxcbiAgICBvcHRpb25hbDogWyAnZGVmYXVsdFZhbHVlJywgJ3ZhbGlkVmFsdWVzJywgJ2lzVmFsaWRWYWx1ZScsICdwcml2YXRlJywgJ3B1YmxpYycgXSxcbiAgICB2YWxpZGF0ZVNjaGVtYTogbnVsbCwgLy8gbm8gdHlwZS1zcGVjaWZpYyBzY2hlbWEgdmFsaWRhdGlvblxuICAgIHBhcnNlOiBwYXJzZU51bWJlcixcbiAgICBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgIWlzTmFOKCB2YWx1ZSApXG4gIH0sXG5cbiAgLy8gdmFsdWUgaXMgYSBzdHJpbmcsIGUuZy4gbmFtZT1SaW5nb1xuICBzdHJpbmc6IHtcbiAgICByZXF1aXJlZDogW10sXG4gICAgb3B0aW9uYWw6IFsgJ2RlZmF1bHRWYWx1ZScsICd2YWxpZFZhbHVlcycsICdpc1ZhbGlkVmFsdWUnLCAncHJpdmF0ZScsICdwdWJsaWMnIF0sXG4gICAgdmFsaWRhdGVTY2hlbWE6IG51bGwsIC8vIG5vIHR5cGUtc3BlY2lmaWMgc2NoZW1hIHZhbGlkYXRpb25cbiAgICBwYXJzZTogcGFyc2VTdHJpbmcsXG4gICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiB2YWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnXG4gIH0sXG5cbiAgLy8gdmFsdWUgaXMgYW4gYXJyYXksIGUuZy4gc2NyZWVucz0xLDIsM1xuICBhcnJheToge1xuICAgIHJlcXVpcmVkOiBbICdlbGVtZW50U2NoZW1hJyBdLFxuICAgIG9wdGlvbmFsOiBbICdkZWZhdWx0VmFsdWUnLCAndmFsaWRWYWx1ZXMnLCAnaXNWYWxpZFZhbHVlJywgJ3NlcGFyYXRvcicsICd2YWxpZFZhbHVlcycsICdwcml2YXRlJywgJ3B1YmxpYycgXSxcbiAgICB2YWxpZGF0ZVNjaGVtYTogdmFsaWRhdGVBcnJheVNjaGVtYSxcbiAgICBwYXJzZTogcGFyc2VBcnJheSxcbiAgICBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+IEFycmF5LmlzQXJyYXkoIHZhbHVlICkgfHwgdmFsdWUgPT09IG51bGxcbiAgfSxcblxuICAvLyB2YWx1ZSBpcyBhIGN1c3RvbSBkYXRhIHR5cGUsIGUuZy4gY29sb3I9MjU1LDAsMjU1XG4gIGN1c3RvbToge1xuICAgIHJlcXVpcmVkOiBbICdwYXJzZScgXSxcbiAgICBvcHRpb25hbDogWyAnZGVmYXVsdFZhbHVlJywgJ3ZhbGlkVmFsdWVzJywgJ2lzVmFsaWRWYWx1ZScsICdwcml2YXRlJywgJ3B1YmxpYycgXSxcbiAgICB2YWxpZGF0ZVNjaGVtYTogbnVsbCwgLy8gbm8gdHlwZS1zcGVjaWZpYyBzY2hlbWEgdmFsaWRhdGlvblxuICAgIHBhcnNlOiBwYXJzZUN1c3RvbSxcbiAgICBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+IHtcblxuICAgICAgLy8gVE9ETyBkbyB3ZSBuZWVkIHRvIGFkZCBhIHByb3BlcnR5IHRvICdjdXN0b20nIHNjaGVtYSB0aGF0IGhhbmRsZXMgdmFsaWRhdGlvbiBvZiBjdXN0b20gdmFsdWUncyB0eXBlPyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3F1ZXJ5LXN0cmluZy1tYWNoaW5lL2lzc3Vlcy8zNVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBRdWVyeVN0cmluZ01hY2hpbmU7IiwgIi8vIENvcHlyaWdodCAyMDE2LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vKipcclxuICogRm9yIHVzZSBvZiBRU00gYXMgYSBtb2R1bGVcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKWBcclxuICovXHJcblxyXG5pbXBvcnQgUXVlcnlTdHJpbmdNYWNoaW5lTW9kdWxlIGZyb20gJy4vUXVlcnlTdHJpbmdNYWNoaW5lTW9kdWxlLmpzJztcclxuXHJcbi8vIEB0cy1leHBlY3QtZXJyb3IgLSBRdWVyeVN0cmluZ01hY2hpbmVNb2R1bGUgaGFzIG1vcmUgY29ycmVjdCB0eXBlcywgYnV0IEkgZG9uJ3Qgd2FudCB0byBleHBvc2UgdGhhdCB0byB0aGUgd2hvbGUgY29kZWJhc2Ugb24gYSBmcmlkYXkgYWZ0ZXJub29uLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVlcnktc3RyaW5nLW1hY2hpbmUvaXNzdWVzLzQ1XHJcbnNlbGYuUXVlcnlTdHJpbmdNYWNoaW5lID0gUXVlcnlTdHJpbmdNYWNoaW5lTW9kdWxlOyJdLAogICJtYXBwaW5ncyI6ICI7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
