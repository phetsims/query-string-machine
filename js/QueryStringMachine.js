// Copyright 2016, University of Colorado Boulder

/**
 * Query String parser that supports type coercion, defaults, error checking, etc. based on a schema.
 * See QueryStringMachine.get for the description of a schema.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
window.QueryStringMachine = (function() {
  'use strict';

  // valid values for the 'type' field in the schema that describes a query parameter
  var VALID_TYPES = [
    'boolean', // value is either 'true' or 'false', e.g. showAnswer=true
    'flag', // value is true if present, false if absent. If a value is supplied, it is parsed like 'boolean'.
    'number', // value is a number, e.g. frameRate=100
    'string', // value is a string, e.g. name=Ringo
    'array' // value is an array with elementSchema and separator as specified (defaults to ',')
  ];

  /**
   * The application should fail to start if query parameters are invalid (even if window.assert is disabled).
   * @param {boolean} condition
   * @param {string} key - the key name for the query parameter being processed when the error occurred
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
   * @param {string} key
   * @param {string} message
   * @returns {string}
   */
  var formatErrorMessage = function( key, message ) {
    return 'Error for query parameter "' + key + '": ' + message;
  };

  // Default string that splits array strings
  var DEFAULT_SEPARATOR = ',';

  var QueryStringMachine = {

    /**
     * Returns the value for a single query parameter.
     *
     * @param {string} key - the query parameter name
     * @param {Object} schema - describes the query parameter, has these fields:
     *   type - see VALID_TYPES
     *   parse - a function that takes a string and returns an Object
     *      - (type and parse are mutually exclusive)
     *   [defaultValue] - The value to take if no query parameter is provided
     *   [allowedValues] - Array of the allowed values for validation
     *   [validate] - function that takes a parsed Object (not string) and checks if it is acceptable
     *      - (allowedValues and validate are mutually exclusive)
     *   elementSchema - required when type==='array', specifies the schema for elements in the array
     *   [separator] - when type==='array' the array elements are separated by this string, defaults to `,`
     * @returns {*} query parameter value, converted to the proper type
     * @public
     */
    get: function( key, schema ) {
      return this.getForString( window.location.search, key, schema );
    },

    /**
     * Make sure default values and allowed values have the right type.
     * @param {string} key - for error reporting
     * @param {Object} schema - see QueryStringMachine.get
     */
    validateSchema: function( key, schema ) {
      assert && assert( !!schema.type, formatErrorMessage( key, 'all schemas must have a type' ) );
      var i;

      if ( typeof schema.defaultValue !== 'undefined' ) {
        validateValue( key, schema.defaultValue, schema, 'validateSchema.defaultValue: ' );
      }

      if ( schema.allowedValues ) {
        for ( i = 0; i < schema.allowedValues.length; i++ ) {
          validateValue( key, schema.allowedValues[ i ], schema, 'validateSchema.allowedValue: ' );
        }
      }

      // TODO: validate arrays
      if ( typeof schema.defaultValue !== 'undefined' && schema.allowedValues ) {
        var validDefault = ( schema.allowedValues.indexOf( schema.defaultValue ) !== -1 );
        assert && assert( validDefault, formatErrorMessage( key, 'defaultValue must be a member of allowedValues' ) );
      }
    },

    /**
     * Like `get` but for an arbitrary parameters string.
     *
     * @param {string} string - the parameters string
     * @param {string} key - the query parameter name
     * @param {Object} schema - see QueryStringMachine.get
     * @returns {*} query parameter value, converted to the proper type
     * @public (for-testing)
     */
    getForString: function( string, key, schema ) {

      // This code is run for every schema in a map, so it is a good place to validate defaults
      this.validateSchema( key, schema );

      return parseElement( key, schema, getValues( string, key ) );
    },

    /**
     * Gets values for every query parameter, using the specified schema map.
     *
     * @param {Object} schemaMap - see QueryStringMachine.getAllForString
     * @returns {Object} - see QueryStringMachine.getAllForString
     * @public
     */
    getAll: function( schemaMap ) {
      return this.getAllForString( window.location.search, schemaMap );
    },

    /**
     * Like `getAll` but for an arbitrary parameters string.
     *
     * @param {string} string - the parameters string
     * @param {Object} schemaMap - key/value pairs, key is query parameter name and value is a schema
     * @returns {Object} - key/value pairs holding the parsed results
     * @public (for-testing)
     */
    getAllForString: function( string, schemaMap ) {
      var result = {};
      for ( var key in schemaMap ) {
        if ( schemaMap.hasOwnProperty( key ) ) {
          result[ key ] = this.getForString( string, key, schemaMap[ key ] );
        }
      }
      return result;
    }
  };

  /**
   * Converts a string to a number.
   * @param {string} key - the query parameter being processed
   * @param {string} string - the text for the number
   * @returns {number}
   */
  var stringToNumber = function( key, string ) {

    // See the the "Convert numeric strings to numbers" section of
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number
    var value = Number( string );

    // Number returns NaN if the string cannot be converted to a number
    queryStringMachineAssert( !isNaN( value ), key, 'illegal value for type number: ' + string );
    return value;
  };

  /**
   * Converts a string to a boolean.
   * @param string
   * @returns {boolean}
   */
  var stringToBoolean = function( key, string ) {
    queryStringMachineAssert( string === 'true' || string === 'false', key, 'illegal value for boolean: ' + string );
    return ( string === 'true' );
  };

  /**
   * Converts a string to an array.
   *
   * @param {string} key - the query parameter name
   * @param string
   * @param schema
   * @returns {*[]}
   */
  var stringToArray = function( key, string, schema ) {
    queryStringMachineAssert( schema.elementSchema, key, 'array element schema must be defined' );
    return string.split( schema.separator || DEFAULT_SEPARATOR ).map( function( element ) {
      return parseElement( key, schema.elementSchema, [ element ] );
    } );
  };

  /**
   * Converts a 'flag' type to boolean, based on the value (if any) provided for the query parameter.
   *
   * @param {string} key - the query parameter key that is being processed
   * @param {string} string
   * @returns {boolean}
   */
  var flagToBoolean = function( key, string ) {
    if ( string === null ) {
      return true;  // When string is null, like for ?webgl, default to true
    }
    else {
      return stringToBoolean( key, string );
    }
  };

  /**
   * Validates the result of parsing a schema.
   *
   * @param {sting} key - the query parameter key
   * @param {Object} value - see value returned by parseElement
   * @param {Object} schema - see QueryStringMachine.get
   * @param {string} prefix - prefix to output for error messages (such as whether it is during schema validation)
   */
  var validateValue = function( key, value, schema, prefix ) {

    // allowedValues check for type 'array'
    if ( schema.type === 'array' && schema.allowedValues ) {
      var arrayJSON = JSON.stringify( value );
      var matched = false;
      for ( var i = 0; i < schema.allowedValues.length; i++ ) {
        var allowedValue = schema.allowedValues[ i ];
        if ( JSON.stringify( allowedValue ) === arrayJSON ) {
          matched = true;
          break;
        }
      }

      schema.allowedValues && queryStringMachineAssert( matched, key, prefix + 'value not allowed: ' + arrayJSON + ', allowedValues: ' + JSON.stringify( schema.allowedValues ) );
    }
    else {

      // Compare primitives with indexOf
      schema.allowedValues && queryStringMachineAssert( schema.allowedValues.indexOf( value ) >= 0, key, prefix + 'value not allowed: ' + value + ', allowedValues: ' + JSON.stringify( schema.allowedValues ) );
    }
    schema.validate && schema.validate( value );
    schema.type === 'number' && queryStringMachineAssert( typeof value === 'number', key, prefix + 'should have been a number' );
  };

  /**
   * Uses the supplied schema to convert query parameter value(s) from string to the desired value type.
   *
   * @param {string} key - the query parameter name, for helpful error messages
   * @param schema - see QueryStringMachine.get
   * @param {string[]} values - any matches from the query string, could be multiple for ?value=x&value=y for example
   * @returns {*} the associated value, converted to the proper type
   */
  var parseElement = function( key, schema, values ) {

    queryStringMachineAssert( !(schema.type && schema.parse), key, 'type and parse are mutually exclusive' );
    queryStringMachineAssert( !(schema.allowedValues && schema.validate), key, 'allowedValues and validate are mutually exclusive' );

    var value = null;

    // values.length indicates that the key did not appear in the query string.
    // for strings like ?isWebGL (without an equals sign), values.length===1 and values[0]=null
    if ( values.length === 0 ) {

      if ( schema.hasOwnProperty( 'defaultValue' ) ) {
        value = schema.defaultValue;
      }
      else if ( schema.type === 'flag' ) {

        // type "flag" automatically defaults to false to support the most common usage cases.
        // This can be overriden by specifying defaultValue.
        value = false;
      }
      else {
        queryStringMachineAssert( false, key, 'missing value for "' + key + '"' );
      }
    }
    else if ( values.length === 1 ) {
      if ( schema.type ) {

        queryStringMachineAssert( VALID_TYPES.indexOf( schema.type ) >= 0, key, 'invalid type: ' + schema.type );

        if ( schema.type === 'number' ) {
          value = stringToNumber( key, values[ 0 ] );
        }
        else if ( schema.type === 'string' ) {
          value = values[ 0 ];
        }
        else if ( schema.type === 'boolean' ) {
          value = stringToBoolean( values[ 0 ] );
        }
        else if ( schema.type === 'array' ) {
          value = stringToArray( key, values[ 0 ], schema );
        }
        else if ( schema.type === 'flag' ) {
          value = flagToBoolean( key, values[ 0 ] );
        }
        else {
          throw new Error( 'invalid type: ' + schema.type );
        }
      }
      else {
        value = schema.parse( values[ 0 ] );
      }
    }
    else {

      // If the same key appeared multiple times for something in our schema, it is an error.
      // QueryStringMachine only supports arrays via type:'array'
      throw new Error( 'Parameter supplied multiple times' );
    }

    validateValue( key, value, schema, '' );
    return value;
  };

  /**
   * Query strings may show the same key appearing multiple times, such as ?value=2&value=3.
   * This method recovers all of the string values.  For this example, it would be ['2','3'].
   *
   * @param {string} string - the parameters string
   * @param {string} key - the key for which we are finding values.
   * @returns {string[]} - the resulting values
   */
  var getValues = function( string, key ) {
    var values = [];
    var params = string.slice( 1 ).split( '&' );
    for ( var i = 0; i < params.length; i++ ) {
      var nameValuePair = params[ i ].split( '=' ); // Array with key=[0] and value=[1]
      if ( nameValuePair[ 0 ] === key ) {
        if ( nameValuePair[ 1 ] ) {
          values.push( decodeURIComponent( nameValuePair[ 1 ] ) );
        }
        else {
          values.push( null ); // no key provided
        }
      }
    }
    return values;
  };

  return QueryStringMachine;
})();