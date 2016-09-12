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
    'array' // value is an array with elementType one of the VALID_TYPES and separator as specified (defaults to ',')
  ];

  /**
   * The application should fail to start if query parameters are invalid (even if window.assert is disabled).
   * @param {boolean} condition
   * @param {string} message
   */
  var queryStringMachineAssert = function( condition, message ) {
    if ( !condition ) {
      console && console.log && console.log( 'Query String Machine Assertion failed: ' + message );
      throw new Error( 'Assertion failed: ' + message );
    }
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
     *   elementType - required when type==='array', specifies the type of the elements in the array
     *   [separator] - when type==='array' the array elements are separated by this string, defaults to `,`
     * @returns {*} query parameter value, converted to the proper type
     * @public
     */
    get: function( key, schema ) {
      return this.getForString( window.location.search, key, schema );
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
      return parseElement( schema, getValues( string, key ) );
    },

    /**
     * Gets values for every query parameter, using the specified schema.
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
   * @param string
   * @returns {number}
   */
  var stringToNumber = function( string ) {
    var value = Number( string );
    // Number returns NaN if the string cannot be converted to a number
    queryStringMachineAssert( !isNaN( value ), 'illegal value for type number: ' + string );
    return value;
  };

  /**
   * Converts a string to a boolean.
   * @param string
   * @returns {boolean}
   */
  var stringToBoolean = function( string ) {
    queryStringMachineAssert( string === 'true' || string === 'false', 'illegal value for boolean: ' + string );
    return ( string === 'true' );
  };

  /**
   * Converts a string to an array.
   *
   * @param string
   * @param schema
   * @returns {*[]}
   */
  var stringToArray = function( string, schema ) {
    queryStringMachineAssert( schema.elementSchema, 'array element schema must be defined' );
    return string.split( schema.separator || DEFAULT_SEPARATOR ).map( function( element ) {
      return parseElement( schema.elementSchema, [ element ] );
    } );
  };

  /**
   * Converts a 'flag' type to boolean, based on the value (if any) provided for the query parameter.
   *
   * @param {string} string
   * @returns {boolean}
   */
  var flagToBoolean = function( string ) {
    if ( string === null ) {
      return true;  // When string is null, like for ?webgl, default to true
    }
    else {
      return stringToBoolean( string );
    }
  };

  /**
   * Validates the result of parsing a schema.
   *
   * @param value - see value returned by parseElement
   * @param {Object} schema - see QueryStringMachine.get
   */
  var validateValue = function( value, schema ) {

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

      schema.allowedValues && queryStringMachineAssert( matched, 'value not allowed: ' + arrayJSON + ', allowedValues: ' + JSON.stringify( schema.allowedValues ) );
    }
    else {

      // Compare primitives with indexOf
      schema.allowedValues && queryStringMachineAssert( schema.allowedValues.indexOf( value ) >= 0, 'value not allowed: ' + value + ', allowedValues: ' + JSON.stringify( schema.allowedValues ) );
    }
    schema.validate && schema.validate( value );
    schema.type === 'number' && queryStringMachineAssert( typeof value === 'number', 'should have been a number' );
  };

  /**
   * Uses the supplied schema to convert query parameter value(s) from string to the desired value type.
   *
   * @param schema - see QueryStringMachine.get
   * @param {string[]} values - any matches from the query string, could be multiple for ?value=x&value=y for example
   * @returns {*} the associated value, converted to the proper type
   */
  var parseElement = function( schema, values ) {

    queryStringMachineAssert( !(schema.type && schema.parse), 'type and parse are mutually exclusive' );
    queryStringMachineAssert( !(schema.allowedValues && schema.validate), 'allowedValues and validate are mutually exclusive' );

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
        queryStringMachineAssert( false, 'Value cannot be determined.' );
      }
    }
    else if ( values.length === 1 ) {
      if ( schema.type ) {

        queryStringMachineAssert( VALID_TYPES.indexOf( schema.type ) >= 0, 'invalid type: ' + schema.type );

        if ( schema.type === 'number' ) {
          value = stringToNumber( values[ 0 ] );
        }
        else if ( schema.type === 'string' ) {
          value = values[ 0 ];
        }
        else if ( schema.type === 'boolean' ) {
          value = stringToBoolean( values[ 0 ] );
        }
        else if ( schema.type === 'array' ) {
          value = stringToArray( values[ 0 ], schema );
        }
        else if ( schema.type === 'flag' ) {
          value = flagToBoolean( values[ 0 ] );
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

    validateValue( value, schema );
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