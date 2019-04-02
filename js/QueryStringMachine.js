// Copyright 2016, University of Colorado Boulder

/**
 * Query String parser that supports type coercion, defaults, error checking, etc. based on a schema.
 * See QueryStringMachine.get for the description of a schema.
 *
 * Implemented as a UMD (Universal Module Definition) so that it's capable of working everywhere.
 * See https://github.com/umdjs/umd/blob/master/templates/returnExports.js
 *
 * See TYPES for a description of the schema types and their properties.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
( function( root, factory ) {
  'use strict';

  if ( typeof define === 'function' && define.amd ) {

    // AMD. Register as an anonymous module.
    define( [], factory );
  }
  else if ( typeof module === 'object' && module.exports ) {

    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  }
  else {

    // Browser globals (root is window)
    root.QueryStringMachine = factory();
  }
}( this, function() {
  'use strict';

  // Default string that splits array strings
  var DEFAULT_SEPARATOR = ',';

  // If a query parameter has private:true in its schema, it must pass this predicate to be read from the URL.
  // See https://github.com/phetsims/chipper/issues/743
  const privatePredicate = () => {
    return localStorage.getItem( 'phetTeamMember' ) === 'true';
  };

  // Just return a value to define the module export.
  // This example returns an object, but the module
  // can return a function as the exported value.
  return ( function() {

    /**
     * Query String Machine is a query string parser that supports type coercion, default values & validation. Please
     * visit PhET's <a href="https://github.com/phetsims/query-string-machine" target="_blank">query-string-machine</a>
     * repository for documentation and examples.
     */
    var QueryStringMachine = {

      /**
       * Gets the value for a single query parameter.
       *
       * @param {string} key - the query parameter name
       * @param {Object} schema
       * @returns {*} query parameter value, converted to the proper type
       * @public
       */
      get: function( key, schema ) {
        return this.getForString( key, schema, window.location.search );
      },

      /**
       * Gets values for every query parameter, using the specified schema map.
       *
       * @param {Object} schemaMap - see QueryStringMachine.getAllForString
       * @returns {Object} - see QueryStringMachine.getAllForString
       * @public
       */
      getAll: function( schemaMap ) {
        return this.getAllForString( schemaMap, window.location.search );
      },

      /**
       * Like `get` but for an arbitrary parameter string.
       *
       * @param {string} key - the query parameter name
       * @param {Object} schema - see QueryStringMachine.get
       * @param {string} string - the parameters string.  Must begin with '?' or be the empty string
       * @returns {*} query parameter value, converted to the proper type
       * @public
       */
      getForString: function( key, schema, string ) {

        if ( !( string.length === 0 || string.indexOf( '?' ) === 0 ) ) {
          throw new Error( 'Query strings should be either the empty string or start with a "?": ' + string );
        }

        // Ignore URL values for private query parameters that fail privatePredicate.
        // See https://github.com/phetsims/chipper/issues/743.
        const values = ( schema.private && !privatePredicate() ) ? [] : getValues( key, string );

        validateSchema( key, schema );
        var value = parseValues( key, schema, values );
        validateValue( key, schema, value );
        return value;
      },

      /**
       * Like `getAll` but for an arbitrary parameters string.
       * @param {Object} schemaMap - key/value pairs, key is query parameter name and value is a schema
       * @param {string} string - the parameters string
       * @returns {Object} - key/value pairs holding the parsed results
       * @public
       */
      getAllForString: function( schemaMap, string ) {
        var result = {};
        for ( var key in schemaMap ) {
          if ( schemaMap.hasOwnProperty( key ) ) {
            result[ key ] = this.getForString( key, schemaMap[ key ], string );
          }
        }
        return result;
      },

      /**
       * Returns true if the window.location.search contains the given key
       * @param {string} key
       * @returns {boolean} true if the window.location.search contains the given key
       * @public
       */
      containsKey: function( key ) {
        return this.containsKeyForString( key, window.location.search );
      },

      /**
       * Returns true if the given string contains the specified key
       * @param {string} key - the key to check for
       * @param {string} string - the query string to search. Must begin with '?' or be the empty string
       * @returns {boolean} true if the given string contains the given key
       * @public
       */
      containsKeyForString: function( key, string ) {

        // TODO: this is the same check as above, can it be factored out?
        if ( !( string.length === 0 || string.indexOf( '?' ) === 0 ) ) {
          throw new Error( 'Query strings should be either the empty string or start with a "?": ' + string );
        }

        var values = getValues( key, string );
        return values.length > 0;
      },

      /**
       * Returns true if the objects are equal.  Exported on the QueryStringMachine for testing.  Only works for
       * arrays objects that contain primitives (i.e. terminals are compared with ===)
       * @param {Object} a - an object to compare
       * @param {Object} b - an object to compare
       * @private - however, it is called from QueryStringMachineTests
       */
      deepEquals: function( a, b ) {
        if ( typeof a !== typeof b ) {
          return false;
        }
        if ( typeof a === 'string' ) {
          return a === b;
        }
        if ( a === null && b === null ) {
          return true;
        }
        if ( a === undefined && b === undefined ) {
          return true;
        }
        if ( a === null && b === undefined ) {
          return false;
        }
        if ( a === undefined && b === null ) {
          return false;
        }
        var aKeys = Object.keys( a );
        var bKeys = Object.keys( b );
        if ( aKeys.length !== bKeys.length ) {
          return false;
        }
        else if ( aKeys.length === 0 ) {
          return a === b;
        }
        else {

          for ( var i = 0; i < aKeys.length; i++ ) {
            if ( aKeys[ i ] !== bKeys[ i ] ) {
              return false;
            }
            var aChild = a[ aKeys[ i ] ];
            var bChild = b[ aKeys[ i ] ];
            if ( !QueryStringMachine.deepEquals( aChild, bChild ) ) {
              return false;
            }
          }
          return true;
        }
      },

      /**
       * Returns a new URL but without the key-value pair.
       *
       * @param {string} queryString - tail of a URL including the beginning '?' (if any)
       * @param {string} key
       * @public
       */
      removeKeyValuePair: function( queryString, key ) {
        assert && assert( typeof queryString === 'string', 'url should be string, but it was: ' + ( typeof queryString ) );
        assert && assert( typeof key === 'string', 'url should be string, but it was: ' + ( typeof key ) );
        assert && assert( queryString.length === 0 || queryString.indexOf( '?' ) === 0, 'queryString should be length 0 or begin with ?' );
        assert && assert( key.length > 0, 'url should be a string with length > 0' );

        if ( queryString.indexOf( '?' ) === 0 ) {
          var newString = '';
          var query = queryString.substring( 1 );
          var elements = query.split( '&' );
          for ( var i = 0; i < elements.length; i++ ) {
            var element = elements[ i ];
            var keyAndMaybeValue = element.split( '=' );

            const elementKey = decodeURIComponent( keyAndMaybeValue[ 0 ] );
            if ( elementKey !== key ) {
              newString += element;
            }
          }

          if ( newString.length > 0 ) {
            return '?' + newString;
          }
          else {
            return newString;
          }
        }
        else {
          return queryString;
        }
      },

      /**
       * Appends a query string to a given url.
       * @param {string} url - may or may not already have other query parameters
       * @param {string} queryParameters - may start with '', '?' or '&'
       * @returns {string}
       * @public
       * @static
       *
       * @example
       * // Limit to the second screen
       * simURL = QueryStringMachine.appendQueryString( simURL, 'screens=2' );
       */
      appendQueryString: function( url, queryParameters ) {
        if ( queryParameters.indexOf( '?' ) === 0 || queryParameters.indexOf( '&' ) === 0 ) {
          queryParameters = queryParameters.substring( 1 );
        }
        if ( queryParameters.length === 0 ) {
          return url;
        }
        const combination = url.indexOf( '?' ) >= 0 ? '&' : '?';
        return url + combination + queryParameters;
      },

      /**
       * Helper function for multiple query strings
       * @param {string} url - may or may not already have other query parameters
       * @param {Array.<string>} queryStringArray - each item may start with '', '?', or '&'
       * @returns {string}
       * @public
       * @static
       *
       * @example
       * sourceFrame.src = QueryStringMachine.appendQueryStringArray( simURL, [ 'screens=2', 'frameTitle=source' ] );
       */
      appendQueryStringArray: function( url, queryStringArray ) {

        for ( let i = 0; i < queryStringArray.length; i++ ) {
          url = this.appendQueryString( url, queryStringArray[ i ] );
        }
        return url;
      }
    };

    /**
     * Query strings may show the same key appearing multiple times, such as ?value=2&value=3.
     * This method recovers all of the string values.  For this example, it would be ['2','3'].
     *
     * @param {string} key - the key for which we are finding values.
     * @param {string} string - the parameters string
     * @returns {Array.<string|null>} - the resulting values, null indicates the query parameter is present with no value
     */
    var getValues = function( key, string ) {
      var values = [];
      var params = string.slice( 1 ).split( '&' );
      for ( var i = 0; i < params.length; i++ ) {
        var splitByEquals = params[ i ].split( '=' );
        var name = splitByEquals[ 0 ];
        var value = splitByEquals.slice( 1 ).join( '=' ); // Support arbitrary number of '=' in the value
        if ( name === key ) {
          if ( value ) {
            values.push( decodeURIComponent( value ) );
          }
          else {
            values.push( null ); // no value provided
          }
        }
      }
      return values;
    };

    // Schema validation ===============================================================================================

    /**
     * Validates the schema for a query parameter.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     */
    var validateSchema = function( key, schema ) {

      // type is required
      queryStringMachineAssert( schema.hasOwnProperty( 'type' ), key, 'type field is required' );

      // type is valid
      queryStringMachineAssert( TYPES.hasOwnProperty( schema.type ), key, 'invalid type: ' + schema.type );

      // parse is a function
      if ( schema.hasOwnProperty( 'parse' ) ) {
        queryStringMachineAssert( typeof schema.parse === 'function', key, 'parse must be a function' );
      }

      // validValues and isValidValue are optional and mutually exclusive
      queryStringMachineAssert( !( schema.hasOwnProperty( 'validValues' ) && schema.hasOwnProperty( 'isValidValue' ) ),
        key, 'validValues and isValidValue are mutually exclusive' );

      // validValues is an Array
      if ( schema.hasOwnProperty( 'validValues' ) ) {
        queryStringMachineAssert( Array.isArray( schema.validValues ), key, 'isValidValue must be an array' );
      }

      // isValidValue is a function
      if ( schema.hasOwnProperty( 'isValidValue' ) ) {
        queryStringMachineAssert( typeof schema.isValidValue === 'function', key, 'isValidValue must be a function' );
      }

      // defaultValue has the correct type
      if ( schema.hasOwnProperty( 'defaultValue' ) ) {
        TYPES[ schema.type ].validateValue( key, schema, schema.defaultValue );
      }

      // validValues have the correct type
      if ( schema.hasOwnProperty( 'validValues' ) ) {
        schema.validValues.forEach( function( value ) {
          TYPES[ schema.type ].validateValue( key, schema, value );
        } );
      }

      // defaultValue is a member of validValues
      if ( schema.hasOwnProperty( 'defaultValue' ) && schema.hasOwnProperty( 'validValues' ) ) {
        queryStringMachineAssert( isValidValue( schema.defaultValue, schema.validValues ),
          key, 'defaultValue must be a member of validValues' );
      }

      // verify that the schema has appropriate properties
      validateSchemaProperties( key, schema, TYPES[ schema.type ].required, TYPES[ schema.type ].optional );

      // dispatch further validation to an (optional) type-specific function
      if ( TYPES[ schema.type ].validateSchema ) {
        TYPES[ schema.type ].validateSchema( key, schema );
      }
    };

    /**
     * Validates schema for type 'array'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     */
    var validateArraySchema = function( key, schema ) {

      // separator is a single character
      if ( schema.hasOwnProperty( 'separator' ) ) {
        queryStringMachineAssert( typeof schema.separator === 'string' && schema.separator.length === 1,
          key, 'invalid separator: ' + schema.separator );
      }

      // validate elementSchema
      validateSchema( key + '.element', schema.elementSchema );
    };

    /**
     * Verifies that a schema contains only supported properties, and contains all required properties.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string[]} requiredProperties - properties that the schema must have
     * @param {string[]} optionalProperties - properties that the schema may optionally have
     */
    var validateSchemaProperties = function( key, schema, requiredProperties, optionalProperties ) {

      // {string[]}, the names of the properties in the schema
      var schemaProperties = Object.getOwnPropertyNames( schema );

      // verify that all required properties are present
      requiredProperties.forEach( function( property ) {
        queryStringMachineAssert( schemaProperties.indexOf( property ) !== -1,
          key, 'missing required property: ' + property );
      } );

      // verify that there are no unsupported properties
      var supportedProperties = requiredProperties.concat( optionalProperties );
      schemaProperties.forEach( function( property ) {
        queryStringMachineAssert( property === 'type' || supportedProperties.indexOf( property ) !== -1,
          key, 'unsupported property: ' + property );
      } );
    };

    // Value validation ================================================================================================

    /**
     * Validates a value.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter
     * @param {*} value - type depends on schema type
     */
    var validateValue = function( key, schema, value ) {

      // value is a member of validValues
      if ( schema.hasOwnProperty( 'validValues' ) ) {
        queryStringMachineAssert( isValidValue( value, schema.validValues ),
          key, 'value must be a member of validValues: ' + value );
      }

      // isValidValue evaluates to true
      if ( schema.hasOwnProperty( 'isValidValue' ) ) {
        queryStringMachineAssert( schema.isValidValue( value ), key, 'invalid value: ' + value );
      }

      // dispatch further validation to a type-specific function
      TYPES[ schema.type ].validateValue( key, schema, value );
    };

    /**
     * Validates a value for type 'flag'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter
     * @param {boolean} value
     */
    var validateFlagValue = function( key, schema, value ) {
      return validateBooleanValue( key, schema, value ); // flag is a convenient variation of boolean
    };

    /**
     * Validates a value for type 'boolean'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter
     * @param {boolean} value - value from the query parameter string
     */
    var validateBooleanValue = function( key, schema, value ) {
      queryStringMachineAssert( value === true || value === false, key, 'invalid value: ' + value );
    };

    /**
     * Validates a value for type 'number'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter
     * @param {number} value - value from the query parameter string
     */
    var validateNumberValue = function( key, schema, value ) {
      queryStringMachineAssert( typeof value === 'number' && !isNaN( value ), key, 'invalid value: ' + value );
    };

    /**
     * Validates a value for type 'string'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter
     * @param {string|null} value - value from the query parameter string
     */
    var validateStringValue = function( key, schema, value ) {
      queryStringMachineAssert( value === null || typeof value === 'string', key, 'invalid value: ' + value );
    };

    /**
     * Validates a value for type 'array'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter
     * @param {Array.<*>} value - type of array elements depends on elementSchema
     */
    var validateArrayValue = function( key, schema, value ) {
      queryStringMachineAssert( Array.isArray( value ) || value === null, key, 'invalid value: ' + value );
    };

    /**
     * Validates a value for type 'custom'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter
     * @param {*} value - type depends on what parse returns
     */
    var validateCustomValue = function( key, schema, value ) {
      //TODO do we need to add a property to 'custom' schema that handles validation of custom value's type?
    };

    // Parsing =========================================================================================================

    /**
     * Uses the supplied schema to convert query parameter value(s) from string to the desired value type.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {Array.<string|null|undefined>} values - any matches from the query string,
     *   could be multiple for ?value=x&value=y for example
     * @returns {*} the associated value, converted to the proper type
     */
    var parseValues = function( key, schema, values ) {

      var returnValue;

      // values contains values for all occurrences of the query parameter.  We currently support only 1 occurrence.
      queryStringMachineAssert( values.length <= 1, key, 'query parameter cannot occur multiple times' );

      if ( schema.type === 'flag' ) {

        // flag is a convenient variation of boolean, which depends on whether the query string is present or not
        returnValue = parseFlag( key, schema, values[ 0 ] );
      }
      else {
        queryStringMachineAssert( values[ 0 ] !== undefined || schema.hasOwnProperty( 'defaultValue' ),
          key, 'missing required query parameter: ' + key );
        if ( values[ 0 ] === undefined ) {

          // not in the query string, use the default
          returnValue = schema.defaultValue;
        }
        else {

          // dispatch parsing of query string to a type-specific function
          returnValue = TYPES[ schema.type ].parse( key, schema, values[ 0 ] );
        }
      }

      return returnValue;
    };

    /**
     * Parses the value for a type 'flag'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {undefined|null} value - value from the query parameter string
     * @returns {boolean}
     */
    var parseFlag = function( key, schema, value ) {
      queryStringMachineAssert( ( value === undefined || value === null ), key, 'flag type does not support a value: ' + value );

      // value is true if the flag is present, false if absent
      return ( value !== undefined );
    };

    /**
     * Parses the value for a type 'boolean'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string|null} value - value from the query parameter string
     * @returns {boolean}
     */
    var parseBoolean = function( key, schema, value ) {
      queryStringMachineAssert( value === 'true' || value === 'false', key, 'invalid value: ' + value );
      return ( value === 'true' );
    };

    /**
     * Parses the value for a type 'number'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string|null} value - value from the query parameter string
     * @returns {number}
     */
    var parseNumber = function( key, schema, value ) {
      var returnValue = Number( value );
      queryStringMachineAssert( !isNaN( returnValue ), key, 'value must be a number: ' + value );
      return returnValue;
    };

    /**
     * Parses the value for a type 'string'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string|null} value - value from the query parameter string
     * @returns {string|null}
     */
    var parseString = function( key, schema, value ) {
      return value;
    };

    /**
     * Parses the value for a type 'array'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string|null} value - value from the query parameter string
     * @returns {Array.<*>|null}
     */
    var parseArray = function( key, schema, value ) {

      var returnValue;

      if ( value === null ) {

        // null signifies an empty array. For instance ?screens= would give []
        // See https://github.com/phetsims/query-string-machine/issues/17
        returnValue = [];
      }
      else {

        // Split up the string into an array of values. E.g. ?screens=1,2 would give [1,2]
        returnValue = value.split( schema.separator || DEFAULT_SEPARATOR ).map( function( element ) {
          return parseValues( key, schema.elementSchema, [ element ] );
        } );
      }

      return returnValue;
    };

    /**
     * Parses the value for a type 'custom'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string} value - value from the query parameter string
     * @returns {*}
     */
    var parseCustom = function( key, schema, value ) {
      return schema.parse( value );
    };

    // Utilities =======================================================================================================

    /**
     * Determines if value is in a set of valid values, uses deep comparison.
     * @param {*} value
     * @param {Array.<*>} validValues
     * @returns {boolean}
     */
    var isValidValue = function( value, validValues ) {
      var found = false;
      for ( var i = 0; i < validValues.length && !found; i++ ) {
        found = QueryStringMachine.deepEquals( validValues[ i ], value );
      }
      return found;
    };

    /**
     * Query parameters are specified by the user, and are outside the control of the programmer.
     * So the application should throw an Error if query parameters are invalid.
     * @param {boolean} condition - if this condition is false, an Error is throw
     * @param {string} key - the query parameter name
     * @param {string} message
     */
    var queryStringMachineAssert = function( condition, key, message ) {
      if ( !condition ) {
        console && console.log && console.log( formatErrorMessage( key, message ) );
        throw new Error( 'Assertion failed: ' + message );
      }
    };

    /**
     * Formats an error message.
     * @param {string} key - the query parameter name
     * @param {string} message
     * @returns {string}
     */
    var formatErrorMessage = function( key, message ) {
      return 'Error for query parameter "' + key + '": ' + message;
    };

    //==================================================================================================================

    /**
     * Data structure that describes each query parameter type, which properties are required vs optional,
     * how to validate, and how to parse.
     *
     * The properties that are required or optional depend on the type (see TYPES), and include:
     * type - {string} the type name
     * defaultValue - the value to use if no query parameter is provided. If there is no defaultValue, then
     *    the query parameter is required in the query string; omitting the query parameter will result in an Error.
     * validValues - array of the valid values for the query parameter
     * isValidValue - function that takes a parsed Object (not string) and checks if it is acceptable
     * elementSchema - specifies the schema for elements in an array
     * separator -  array elements are separated by this string, defaults to `,`
     * parse - a function that takes a string and returns an Object
     */
    var TYPES = {

      // value is true if present, false if absent
      flag: {
        required: [],
        optional: [ 'private' ],
        validateSchema: null, // no type-specific schema validation
        parse: parseFlag,
        validateValue: validateFlagValue
      },

      // value is either true or false, e.g. showAnswer=true
      boolean: {
        required: [],
        optional: [ 'defaultValue', 'private' ],
        validateSchema: null, // no type-specific schema validation
        parse: parseBoolean,
        validateValue: validateBooleanValue
      },

      // value is a number, e.g. frameRate=100
      number: {
        required: [],
        optional: [ 'defaultValue', 'validValues', 'isValidValue', 'private' ],
        validateSchema: null, // no type-specific schema validation
        parse: parseNumber,
        validateValue: validateNumberValue
      },

      // value is a string, e.g. name=Ringo
      string: {
        required: [],
        optional: [ 'defaultValue', 'validValues', 'isValidValue', 'private' ],
        validateSchema: null, // no type-specific schema validation
        parse: parseString,
        validateValue: validateStringValue
      },

      // value is an array, e.g. screens=1,2,3
      array: {
        required: [ 'elementSchema' ],
        optional: [ 'defaultValue', 'validValues', 'isValidValue', 'separator', 'validValues', 'private' ],
        validateSchema: validateArraySchema,
        parse: parseArray,
        validateValue: validateArrayValue
      },

      // value is a custom data type, e.g. color=255,0,255
      custom: {
        required: [ 'parse' ],
        optional: [ 'defaultValue', 'validValues', 'isValidValue', 'private' ],
        validateSchema: null, // no type-specific schema validation
        parse: parseCustom,
        validateValue: validateCustomValue
      }
    };

    return QueryStringMachine;
  } )();
} ) );