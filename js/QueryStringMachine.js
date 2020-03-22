// Copyright 2016-2020, University of Colorado Boulder

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
  const DEFAULT_SEPARATOR = ',';

  // If a query parameter has private:true in its schema, it must pass this predicate to be read from the URL.
  // See https://github.com/phetsims/chipper/issues/743
  const privatePredicate = () => {
    // Trying to access localStorage may fail with a SecurityError if cookies are blocked in a certain way.
    // See https://github.com/phetsims/qa/issues/329 for more information.
    try {
      return localStorage.getItem( 'phetTeamMember' ) === 'true';
    }
    catch( e ) {
      return false;
    }
  };

  /**
   * Valid parameter strings begin with ? or are the empty string.  This is used for assertions in some cases and for
   * throwing Errors in other cases.
   * @param {string} string
   * @returns {boolean}
   */
  const isParameterString = string => string.length === 0 || string.indexOf( '?' ) === 0;

  // Just return a value to define the module export.
  // This example returns an object, but the module
  // can return a function as the exported value.
  return ( function() {

    /**
     * In order to support graceful failures for user-supplied values, we fall back to default values when public: true
     * is specified.  If the schema entry is public: false, then a queryStringMachineAssert is thrown.
     * @param {boolean} ok
     * @param {string} key
     * @param {Object} value - value of the parsed type, or, if parsing failed, the {string} that would not parse
     * @param {Object} schema
     * @param {string} message
     * @returns {Object}
     */
    const getValidValue = ( ok, key, value, schema, message ) => {
      if ( !ok ) {

        if ( schema.public ) {
          QueryStringMachine.addWarning( key, value, schema.defaultValue, message );
          value = schema.defaultValue;
        }
        else {
          queryStringMachineAssert( ok, message );
        }
      }
      return value;
    };

    /**
     * Query String Machine is a query string parser that supports type coercion, default values & validation. Please
     * visit PhET's <a href="https://github.com/phetsims/query-string-machine" target="_blank">query-string-machine</a>
     * repository for documentation and examples.
     */
    const QueryStringMachine = {

      // @public {{key:string, value:{*}, defaultValue:{*}, message:string}[]}
      warnings: [],

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

        if ( !isParameterString( string ) ) {
          throw new Error( 'Query strings should be either the empty string or start with a "?": ' + string );
        }

        // Ignore URL values for private query parameters that fail privatePredicate.
        // See https://github.com/phetsims/chipper/issues/743.
        const values = ( schema.private && !privatePredicate() ) ? [] : getValues( key, string );

        validateSchema( key, schema );

        let value = parseValues( key, schema, values );

        if ( schema.hasOwnProperty( 'validValues' ) ) {
          value = getValidValue(
            isValidValue( value, schema.validValues ), key, value, schema,
            `Invalid value supplied for key "${key}": ${value} is not a member of valid values: ${schema.validValues.join( ', ' )}`
          );
        }

        // isValidValue evaluates to true
        else if ( schema.hasOwnProperty( 'isValidValue' ) ) {
          value = getValidValue(
            schema.isValidValue( value ), key, value, schema,
            `Invalid value supplied for key "${key}": ${value}`
          );
        }

        // dispatch further validation to a type-specific function
        value = getValidValue(
          TYPES[ schema.type ].isValidValue( value ), key, value, schema,
          `Invalid value for type, key: ${key}`
        );

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
        const result = {};
        for ( const key in schemaMap ) {
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
        if ( !isParameterString( string ) ) {
          throw new Error( 'Query strings should be either the empty string or start with a "?": ' + string );
        }
        const values = getValues( key, string );
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
        if ( typeof a === 'string' || typeof a === 'number' || typeof a === 'boolean' ) {
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
        const aKeys = Object.keys( a );
        const bKeys = Object.keys( b );
        if ( aKeys.length !== bKeys.length ) {
          return false;
        }
        else if ( aKeys.length === 0 ) {
          return a === b;
        }
        else {

            for ( let i = 0; i < aKeys.length; i++ ) {
              if ( aKeys[ i ] !== bKeys[ i ] ) {
                return false;
              }
              const aChild = a[ aKeys[ i ] ];
              const bChild = b[ aKeys[ i ] ];
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
        assert && assert( isParameterString( queryString ), 'queryString should be length 0 or begin with ?' );
        assert && assert( key.length > 0, 'url should be a string with length > 0' );

        if ( queryString.indexOf( '?' ) === 0 ) {
          const newParameters = [];
          const query = queryString.substring( 1 );
          const elements = query.split( '&' );
          for ( let i = 0; i < elements.length; i++ ) {
            const element = elements[ i ];
            const keyAndMaybeValue = element.split( '=' );

            const elementKey = decodeURIComponent( keyAndMaybeValue[ 0 ] );
            if ( elementKey !== key ) {
              newParameters.push( element );
            }
          }

          if ( newParameters.length > 0 ) {
            return '?' + newParameters.join( '&' );
          }
          else {
            return '';
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
      },

      /**
       * Adds a warning to the console and QueryStringMachine.warnings to indicate that a default value is being used
       * instead of the invalid provided value
       *
       * @param {string} key - the query parameter name
       * @param {string} value - type depends on schema type
       * @param {*} defaultValue - default value for the query parameter schema
       * @param {string} message - the message that indicates the problem with the value
       * @public
       */
      addWarning: function( key, value, defaultValue, message ) {
        console.warn( `${message}. Reverting to default value: ${defaultValue}` );

        this.warnings.push( {
          key: key,
          value: value,
          defaultValue: defaultValue,
          message: message
        } );
      },

      /**
       * Determines if there is a warning for a specified key.
       * @param {string} key
       * @returns {boolean}
       * @public
       */
      hasWarning: function( key ) {
        let hasWarning = false;
        for ( let i = 0; i < this.warnings.length && !hasWarning; i++ ) {
          hasWarning = ( this.warnings[ i ].key === key );
        }
        return hasWarning;
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
    const getValues = function( key, string ) {
      const values = [];
      const params = string.slice( 1 ).split( '&' );
      for ( let i = 0; i < params.length; i++ ) {
        const splitByEquals = params[ i ].split( '=' );
        const name = splitByEquals[ 0 ];
        const value = splitByEquals.slice( 1 ).join( '=' ); // Support arbitrary number of '=' in the value
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
    const validateSchema = function( key, schema ) {

      // type is required
      queryStringMachineAssert( schema.hasOwnProperty( 'type' ), 'type field is required for key: ' + key );

      // type is valid
      queryStringMachineAssert( TYPES.hasOwnProperty( schema.type ), 'invalid type: ' + schema.type + ' for key: ' + key );

      // parse is a function
      if ( schema.hasOwnProperty( 'parse' ) ) {
        queryStringMachineAssert( typeof schema.parse === 'function', 'parse must be a function for key: ' + key );
      }

      // validValues and isValidValue are optional and mutually exclusive
      queryStringMachineAssert( !( schema.hasOwnProperty( 'validValues' ) && schema.hasOwnProperty( 'isValidValue' ) ),
        schema, key, 'validValues and isValidValue are mutually exclusive for key: ' + key );

      // validValues is an Array
      if ( schema.hasOwnProperty( 'validValues' ) ) {
        queryStringMachineAssert( Array.isArray( schema.validValues ), 'isValidValue must be an array for key: ' + key );
      }

      // isValidValue is a function
      if ( schema.hasOwnProperty( 'isValidValue' ) ) {
        queryStringMachineAssert( typeof schema.isValidValue === 'function', 'isValidValue must be a function for key: ' + key );
      }

      // defaultValue has the correct type
      if ( schema.hasOwnProperty( 'defaultValue' ) ) {
        queryStringMachineAssert( TYPES[ schema.type ].isValidValue( schema.defaultValue ), 'defaultValue incorrect type: ' + key );
      }

      // validValues have the correct type
      if ( schema.hasOwnProperty( 'validValues' ) ) {
        schema.validValues.forEach( value => queryStringMachineAssert( TYPES[ schema.type ].isValidValue( value ), 'validValue incorrect type for key: ' + key ) );
      }

      // defaultValue is a member of validValues
      if ( schema.hasOwnProperty( 'defaultValue' ) && schema.hasOwnProperty( 'validValues' ) ) {
        queryStringMachineAssert( isValidValue( schema.defaultValue, schema.validValues ), schema,
          key, 'defaultValue must be a member of validValues, for key: ' + key );
      }

      // defaultValue is a member of validValues
      if ( schema.hasOwnProperty( 'public' ) && schema.public ) {
        queryStringMachineAssert( schema.hasOwnProperty( 'defaultValue' ), 'defaultValue is required when public: true for key: ' + key );
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
    const validateArraySchema = function( key, schema ) {

      // separator is a single character
      if ( schema.hasOwnProperty( 'separator' ) ) {
        queryStringMachineAssert( typeof schema.separator === 'string' && schema.separator.length === 1, 'invalid separator: ' + schema.separator + ', for key: ' + key );
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
    const validateSchemaProperties = function( key, schema, requiredProperties, optionalProperties ) {

      // {string[]}, the names of the properties in the schema
      const schemaProperties = Object.getOwnPropertyNames( schema );

      // verify that all required properties are present
      requiredProperties.forEach( function( property ) {
        queryStringMachineAssert( schemaProperties.indexOf( property ) !== -1, 'missing required property: ' + property + ' for key: ' + key );
      } );

      // verify that there are no unsupported properties
      const supportedProperties = requiredProperties.concat( optionalProperties );
      schemaProperties.forEach( function( property ) {
        queryStringMachineAssert( property === 'type' || supportedProperties.indexOf( property ) !== -1, 'unsupported property: ' + property + ' for key: ' + key );
      } );
    };

    // Parsing =========================================================================================================

    /**
     * Uses the supplied schema to convert query parameter value(s) from string to the desired value type.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {Array.<string|null|undefined>} values - any matches from the query string,
     *   could be multiple for ?value=x&value=y for example
     * @returns {*} the associated value, converted to the proper type
     * TODO: can this be improved?
     */
    const parseValues = function( key, schema, values ) {
      let returnValue;

      // values contains values for all occurrences of the query parameter.  We currently support only 1 occurrence.
      queryStringMachineAssert( values.length <= 1, 'query parameter cannot occur multiple times' );

      if ( schema.type === 'flag' ) {

        // flag is a convenient variation of boolean, which depends on whether the query string is present or not
        returnValue = TYPES[ schema.type ].parse( key, schema, values[ 0 ] );
      }
      else {
        queryStringMachineAssert( values[ 0 ] !== undefined || schema.hasOwnProperty( 'defaultValue' ),
          'missing required query parameter: ' + key );
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
    const parseFlag = function( key, schema, value ) {
      queryStringMachineAssert( ( value === undefined || value === null ), 'flag type does not support a value: ' + value );

      // value is true if the flag is present, false if absent
      return ( value !== undefined );
    };

    /**
     * Parses the value for a type 'boolean'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string|null} string - value from the query parameter string
     * @returns {boolean}
     */
    const parseBoolean = function( key, schema, string ) {

      const ok = string === 'true' || string === 'false';

      // {boolean|string}
      const value = string === 'true' ? true : false;
      return getValidValue( ok, key, ok ? value : string, schema, `Value was not true|false for key "${key}"` );
    };

    /**
     * Parses the value for a type 'number'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string|null} string - value from the query parameter string
     * @returns {number}
     */
    const parseNumber = function( key, schema, string ) {
      const number = Number( string );
      const ok = !isNaN( number );
      return getValidValue( ok, key, ok ? number : string, schema, `value must be a number for key "${key}"` );
    };

    /**
     * Parses the value for a type 'array'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string|null} value - value from the query parameter string
     * @returns {Array.<*>|null}
     */
    const parseArray = function( key, schema, value ) {

      let returnValue;

      if ( value === null ) {

        // null signifies an empty array. For instance ?screens= would give []
        // See https://github.com/phetsims/query-string-machine/issues/17
        returnValue = [];
      }
      else {

        // Split up the string into an array of values. E.g. ?screens=1,2 would give [1,2]
        returnValue = value.split( schema.separator || DEFAULT_SEPARATOR )
          .map( element => parseValues( key, schema.elementSchema, [ element ] ) );
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
    const parseCustom = function( key, schema, value ) {
      return schema.parse( value );
    };

    // Utilities =======================================================================================================

    /**
     * Determines if value is in a set of valid values, uses deep comparison.
     * @param {*} value
     * @param {Array.<*>} validValues
     * @returns {boolean}
     */
    const isValidValue = function( value, validValues ) {
      let found = false;
      for ( let i = 0; i < validValues.length && !found; i++ ) {
        found = QueryStringMachine.deepEquals( validValues[ i ], value );
      }
      return found;
    };

    /**
     * Query parameters are specified by the user, and are outside the control of the programmer.
     * So the application should throw an Error if query parameters are invalid.
     * @param {boolean} ok - if this condition is false, an Error is throw
     * @param {string} message
     */
    const queryStringMachineAssert = function( ok, message ) {
      if ( !ok ) {
        console && console.log && console.log( message );
        throw new Error( 'Query String Machine Assertion failed: ' + message );
      }
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
    const TYPES = {

      // value is true if present, false if absent
      flag: {
        required: [],
        optional: [ 'private' ],
        validateSchema: null, // no type-specific schema validation
        parse: parseFlag,
        isValidValue: value => value === true || value === false
      },

      // value is either true or false, e.g. showAnswer=true
      boolean: {
        required: [],
        optional: [ 'defaultValue', 'private', 'public' ],
        validateSchema: null, // no type-specific schema validation
        parse: parseBoolean,
        isValidValue: value => value === true || value === false
      },

      // value is a number, e.g. frameRate=100
      number: {
        required: [],
        optional: [ 'defaultValue', 'validValues', 'isValidValue', 'private', 'public' ],
        validateSchema: null, // no type-specific schema validation
        parse: parseNumber,
        isValidValue: value => typeof value === 'number' && !isNaN( value )
      },

      // value is a string, e.g. name=Ringo
      string: {
        required: [],
        optional: [ 'defaultValue', 'validValues', 'isValidValue', 'private', 'public' ],
        validateSchema: null, // no type-specific schema validation
        parse: ( key, schema, string ) => string, // The variable to be parsed is already string, so it is guaranteed to parse as a string.
        isValidValue: value => value === null || typeof value === 'string'
      },

      // value is an array, e.g. screens=1,2,3
      array: {
        required: [ 'elementSchema' ],
        optional: [ 'defaultValue', 'validValues', 'isValidValue', 'separator', 'validValues', 'private', 'public' ],
        validateSchema: validateArraySchema,
        parse: parseArray,
        isValidValue: value => Array.isArray( value ) || value === null
      },

      // value is a custom data type, e.g. color=255,0,255
      custom: {
        required: [ 'parse' ], // TODO: https://github.com/phetsims/joist/issues/593 how to allow custom parse implementations to use getValidValue or otherwise deal with public?
        optional: [ 'defaultValue', 'validValues', 'isValidValue', 'private', 'public' ],
        validateSchema: null, // no type-specific schema validation
        parse: parseCustom,
        isValidValue: value => {

          // TODO do we need to add a property to 'custom' schema that handles validation of custom value's type? see https://github.com/phetsims/query-string-machine/issues/35
          return true;
        }
      }
    };

    return QueryStringMachine;
  } )();
} ) );