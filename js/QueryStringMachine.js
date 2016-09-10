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

  // Default string that splits array strings
  var DEFAULT_SEPARATOR = ',';

  var QueryStringMachine = {

    /**
     * Returns the value for a single query parameter.
     *
     * @param {string} key - the query parameter name
     * @param {Object} schemaElement - describes the query parameter, has these fields:
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
    get: function( key, schemaElement ) {
      return this.getForString( window.location.search, key, schemaElement );
    },

    /**
     * Like `get` but for an arbitrary parameters string.
     *
     * @param {string} string - the parameters string
     * @param {string} key - the query parameter name
     * @param {Object} schemaElement - see QueryStringMachine.get
     * @returns {*} query parameter value, converted to the proper type
     * @public (for-testing)
     */
    getForString: function( string, key, schemaElement ) {
      return parseElement( schemaElement, getValues( string, key ) );
    },

    /**
     * Gets values for every query parameter, using the specified schema.
     *
     * @param {Object} schema - see QueryStringMachine.getAllForString
     * @returns {Object} - see QueryStringMachine.getAllForString
     * @public
     */
    getAll: function( schema ) {
      return this.getAllForString( window.location.search, schema );
    },

    /**
     * Like `getAll` but for an arbitrary parameters string.
     *
     * @param string - the parameters string
     * @param schema - key/value pairs, key is query parameter name and value is a schemaElement
     * @returns {Object} - key/value pairs holding the parsed results
     * @public (for-testing)
     */
    getAllForString: function( string, schema ) {
      var result = {};
      for ( var key in schema ) {
        if ( schema.hasOwnProperty( key ) ) {
          result[ key ] = this.getForString( string, key, schema[ key ] );
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
    assert && assert( !isNaN( value ), 'illegal value for type number: ' + string );
    return value;
  };

  /**
   * Converts a string to a boolean.
   * @param string
   * @returns {boolean}
   */
  var stringToBoolean = function( string ) {
    assert && assert( string === 'true' || string === 'false', 'illegal value for boolean: ' + string );
    return ( string === 'true' );
  };

  /**
   * Converts a string to an array.
   *
   * @param string
   * @param schemaElement
   * @returns {*[]}
   */
  var stringToArray = function( string, schemaElement ) {
    var subSchemaElement = {};
    for ( var k in schemaElement ) {
      if ( schemaElement.hasOwnProperty( k ) && k !== 'type' ) {
        subSchemaElement[ k ] = schemaElement[ k ];
      }
    }
    assert && assert( schemaElement.elementType, 'array element type must be defined' );
    subSchemaElement.type = schemaElement.elementType;
    delete subSchemaElement.allowedValues; // for arrays
    return string.split( schemaElement.separator || DEFAULT_SEPARATOR ).map( function( element ) {
      return parseElement( subSchemaElement, [ element ] );
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
   * Validates the result of parsing a schemaElement.
   *
   * @param value - see value returned by parseElement
   * @param {Object} schemaElement - see QueryStringMachine.get
   */
  var validateValue = function( value, schemaElement ) {
    if ( assert ) {

      // allowedValues check for type 'array'
      if ( schemaElement.type === 'array' && schemaElement.allowedValues ) {
        var arrayJSON = JSON.stringify( value );
        var matched = false;
        for ( var i = 0; i < schemaElement.allowedValues.length; i++ ) {
          var allowedValue = schemaElement.allowedValues[ i ];
          if ( JSON.stringify( allowedValue ) === arrayJSON ) {
            matched = true;
            break;
          }
        }

        schemaElement.allowedValues && assert( matched, 'value not allowed: ' + arrayJSON + ', allowedValues: ' + JSON.stringify( schemaElement.allowedValues ) );
      }
      else {

        // Compare primitives with indexOf
        schemaElement.allowedValues && assert( schemaElement.allowedValues.indexOf( value ) >= 0, 'value not allowed: ' + value + ', allowedValues: ' + JSON.stringify( schemaElement.allowedValues ) );
      }
      schemaElement.validate && schemaElement.validate( value );
      schemaElement.type === 'number' && assert( typeof value === 'number', 'should have been a number' );
    }
  };

  /**
   * Uses the supplied schemaElement to convert query parameter value(s) from string to the desired value type.
   *
   * @param schemaElement - see QueryStringMachine.get
   * @param {string[]} values - any matches from the query string, could be multiple for ?value=x&value=y for example
   * @returns {*} the associated value, converted to the proper type
   */
  var parseElement = function( schemaElement, values ) {

    assert && assert( !(schemaElement.type && schemaElement.parse), 'type and parse are mutually exclusive' );
    assert && assert( !(schemaElement.allowedValues && schemaElement.validate), 'allowedValues and validate are mutually exclusive' );

    var value = null;

    // TODO: make sure schemaElement.defaultValue matches schemaElement.type (how to do that if parse is provided instead of type?)
    if ( values.length === 0 ) {

      //TODO Why is flag treated specially here? Why can't it have a defaultValue? If it can't have defaultValue, assert that somewhere.
      // If flag is not supplied, default to false.
      if ( schemaElement.type === 'flag' ) {
        value = false;
      }
      else {
        value = schemaElement.defaultValue;
      }
    }
    else if ( values.length === 1 ) {
      if ( schemaElement.type ) {

        assert && assert( VALID_TYPES.indexOf( schemaElement.type ) >= 0, 'invalid type: ' + schemaElement.type );

        if ( schemaElement.type === 'number' ) {
          value = stringToNumber( values[ 0 ] );
        }
        else if ( schemaElement.type === 'string' ) {
          value = values[ 0 ];
        }
        else if ( schemaElement.type === 'boolean' ) {
          value = stringToBoolean( values[ 0 ] );
        }
        else if ( schemaElement.type === 'array' ) {
          value = stringToArray( values[ 0 ], schemaElement );
        }
        else if ( schemaElement.type === 'flag' ) {
          value = flagToBoolean( values[ 0 ] );
        }
        else {
          throw new Error( 'invalid type: ' + schemaElement.type );
        }
      }
      else {
        value = schemaElement.parse( values[ 0 ] );
      }
    }
    else {
      //TODO add support for duplicate parameters, e.g.: ?id=1&id=2&id=7
      throw new Error( 'duplicate parameters are not currently supported' );
    }

    assert && validateValue( value, schemaElement );
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