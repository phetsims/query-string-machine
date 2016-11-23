// Copyright 2016, University of Colorado Boulder

//TODO not for production use, see https://github.com/phetsims/query-string-machine/issues/20
/**
 * Query String parser that supports type coercion, defaults, error checking, etc. based on a schema.
 * See QueryStringMachine.get for the description of a schema.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

// UMD, see https://github.com/umdjs/umd/blob/master/templates/returnExports.js
(function( root, factory ) {
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

  // Just return a value to define the module export.
  // This example returns an object, but the module
  // can return a function as the exported value.
  return (function() {

    //TODO assert is enabled by QueryStringMachine in initialize-globals.js, so how can we use assert?
    // Query String Machine has been designed as a zero-dependency module for ease of use in any project.
    // window.assert and assert both check for the existence of a global named assert. However, the latter errors out if the global is not found.
    var assert = typeof window === 'object' ? window.assert : global.assert;

    // valid values for the 'type' field in the schema that describes a query parameter
    var VALID_TYPES = [
      'flag', // value is true if present, false if absent
      'boolean', // value is either true or false, e.g. showAnswer=true
      'number', // value is a number, e.g. frameRate=100
      'string', // value is a string, e.g. name=Ringo
      'array' // value is an array with elementSchema and separator as specified (defaults to ',')
    ];

    //TODO make 'type' unnecessary in required
    // Required and optional schema properties for each type
    var PROPERTIES_BY_TYPE = {

      flag: {
        required: [ 'type' ],
        optional: []
      },

      boolean: {
        required: [ 'type' ],
        optional: [ 'defaultValue' ]
      },

      number: {
        required: [ 'type', 'defaultValue' ],
        optional: [ 'validValues', 'isValidValue' ]
      },

      string: {
        required: [ 'type', 'defaultValue' ],
        optional: [ 'validValues', 'isValidValue' ]
      },

      array: {
        required: [ 'type', 'defaultValue', 'elementSchema' ],
        optional: [ 'validValues', 'isValidValue', 'separator' ]
      }
    };

    // Default string that splits array strings
    var DEFAULT_SEPARATOR = ',';

    var QueryStringMachine = {

      /**
       * Gets the value for a single query parameter.
       *
       * @param {string} key - the query parameter name
       * @param {Object} schema - describes the query parameter, has these fields:
       *   type - see VALID_TYPES
       *   parse - a function that takes a string and returns an Object
       *      - (type and parse are mutually exclusive)
       *   [defaultValue] - The value to take if no query parameter is provided
       *   [validValues] - Array of the valid values for the query parameter
       *   [isValidValue] - function that takes a parsed Object (not string) and checks if it is acceptable
       *      - (validValues and isValidValue are mutually exclusive)
       *   elementSchema - required when type==='array', specifies the schema for elements in the array
       *   [separator] - when type==='array' the array elements are separated by this string, defaults to `,`
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
       * Like `get` but for an arbitrary parameters string.
       *
       * @param {string} key - the query parameter name
       * @param {Object} schema - see QueryStringMachine.get
       * @param {string} string - the parameters string
       * @returns {*} query parameter value, converted to the proper type
       * @public (for testing only)
       */
      getForString: function( key, schema, string ) {
        validateSchema( key, schema );
        return parseValues( key, schema, getValues( key, string ) );
      },

      /**
       * Like `getAll` but for an arbitrary parameters string.
       *
       * @param {Object} schemaMap - key/value pairs, key is query parameter name and value is a schema
       * @param {string} string - the parameters string
       * @returns {Object} - key/value pairs holding the parsed results
       * @public (for testing only)
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
       */
      containsKey: function( key ) {
        return this.containsKeyForString( window.location.search, key );
      },

      containsKeyForString: function( key, string ) {
        var values = getValues( key, string );
        return values.length > 0;
      }
    };

    /**
     * Query strings may show the same key appearing multiple times, such as ?value=2&value=3.
     * This method recovers all of the string values.  For this example, it would be ['2','3'].
     *
     * @param {string} key - the key for which we are finding values.
     * @param {string} string - the parameters string
     * @returns {string[]} - the resulting values
     */
    var getValues = function( key, string ) {
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

    /**
     * Validates the schema for a query parameter.
     *
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     */
    var validateSchema = function( key, schema ) {

      // first, do validation that isn't type specific

      // type and parse are mutually exclusive, one of them is required
      queryStringMachineAssert( !( schema.hasOwnProperty( 'type' ) && schema.hasOwnProperty( 'parse' ) ),
        key, 'type and parse are mutually exclusive' );
      queryStringMachineAssert( ( schema.hasOwnProperty( 'type' ) || schema.hasOwnProperty( 'parse' ) ),
        key, 'type or parse is required' );

      // type is valid
      queryStringMachineAssert( !schema.hasOwnProperty( 'type' ) || VALID_TYPES.indexOf( schema.type ) !== -1,
        key, 'invalid type: ' + schema.type );

      // parse is a function
      queryStringMachineAssert( !schema.hasOwnProperty( 'parse' ) || ( typeof schema.parse === 'function' ),
        key, 'parse must be a function' );

      // validValues and isValidValue are both optional and mutually exclusive
      queryStringMachineAssert( !( schema.hasOwnProperty( 'validValues' ) && schema.hasOwnProperty( 'isValidValue' ) ),
        key, 'validValues and isValidValue are mutually exclusive' );

      // validValues is an Array
      queryStringMachineAssert( !schema.hasOwnProperty( 'validValues' ) || ( schema.validValues instanceof Array ),
        key, 'isValidValue must be a function' );

      // isValidValue is a function
      queryStringMachineAssert( !schema.hasOwnProperty( 'isValidValue' ) || ( typeof schema.isValidValue === 'function' ),
        key, 'isValidValue must be a function' );

      // TODO: validate defaultValue for type 'array'
      // defaultValue is a member of validValues
      if ( schema.hasOwnProperty( 'defaultValue' ) && schema.hasOwnProperty( 'validValues' ) ) {
        queryStringMachineAssert( ( schema.validValues.indexOf( schema.defaultValue ) !== -1 ),
          key, 'defaultValue must be a member of validValues' );
      }

      if ( schema.hasOwnProperty( 'type' ) ) {

        // verify that the schema has appropriate properties
        validateSchemaProperties( key, schema, PROPERTIES_BY_TYPE[ schema.type ].required, PROPERTIES_BY_TYPE[ schema.type ].optional );

        // dispatch further validation to a type-specific function
        if ( schema.type === 'flag' ) {
          validateFlagSchema( key, schema );
        }
        else if ( schema.type === 'boolean' ) {
          validateBooleanSchema( key, schema );
        }
        else if ( schema.type === 'number' ) {
          validateNumberSchema( key, schema );
        }
        else if ( schema.type === 'string' ) {
          validateStringSchema( key, schema );
        }
        else if ( schema.type === 'array' ) {
          validateArraySchema( key, schema );
        }
        else {
          throw new Error( formatErrorMessage( key, 'unsupported type: ' + type ) );
        }
      }
      else if ( schema.hasOwnProperty( 'parse' ) ) {
        //TODO what validation is required? what properties are required and optional?
      }
      else {
        throw new Error( formatErrorMessage( key, 'type or parse is required' ) );
      }
    };

    /**
     * Validates schema for type 'flag'.
     *
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     */
    var validateFlagSchema = function( key, schema ) {
      //TODO anything to do here?
    };

    /**
     * Validates schema for type 'boolean'.
     *
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     */
    var validateBooleanSchema = function( key, schema ) {

      // defaultValue is true or false
      if ( schema.hasOwnProperty( 'defaultValue' ) ) {
        queryStringMachineAssert( schema.defaultValue === true || schema.defaultValue === false,
          key, 'invalid defaultValue: ' + schema.defaultValue );
      }
    };

    /**
     * Validates schema for type 'number'.
     *
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     */
    var validateNumberSchema = function( key, schema ) {

      // defaultValue is a number
      queryStringMachineAssert( typeof schema.defaultValue === 'number',
        key, 'invalid defaultValue: ' + schema.defaultValue );

      // validValues are numbers
      if ( schema.hasOwnProperty( 'validValues' ) ) {
        schema.validValues.forEach( function( value ) {
          queryStringMachineAssert( typeof value === 'number',
            key, 'invalid entry in validValues: ' + value );
        } );
      }
    };

    /**
     * Validates schema for type 'string'.
     *
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     */
    var validateStringSchema = function( key, schema ) {

      // defaultValue is a string or null
      queryStringMachineAssert( typeof schema.defaultValue === 'string' || schema.defaultValue === null,
        key, 'invalid defaultValue: ' + schema.defaultValue );

      // validValues are strings or null
      if ( schema.hasOwnProperty( 'validValues' ) ) {
        schema.validValues.forEach( function( value ) {
          queryStringMachineAssert( typeof value === 'string' || value === null,
            key, 'invalid entry in validValues: ' + value );
        } );
      }
    };

    /**
     * Validates schema for type 'array'.
     *
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     */
    var validateArraySchema = function( key, schema ) {

      // defaultValue can be a string or null
      queryStringMachineAssert( schema.defaultValue instanceof Array || schema.defaultValue === null,
        key, 'invalid defaultValue: ' + schema.defaultValue );

      // validValues are arrays or null
      if ( schema.hasOwnProperty( 'validValues' ) ) {
        schema.validValues.forEach( function( value ) {
          queryStringMachineAssert( value instanceof Array || value === null,
            key, 'invalid entry in validValues: ' + value );
        } );
      }

      // separator is a single character
      if ( schema.hasOwnProperty( 'separator' ) ) {
        queryStringMachineAssert( typeof schema.separator === 'string' && schema.separator.length === 1,
          key, 'invalid separator: ' + schema.separator );
      }

      //TODO validate elementSchema
      //TODO validate elements in defaultValue
      //TODO validate elements in validValues
    };

    /**
     * Verifies that a schema contains only supported properties, and contains all required properties.
     *
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
        console.log( key + ':' + property + ' ' + schemaProperties.indexOf( property ) );//XXX
        queryStringMachineAssert( schemaProperties.indexOf( property ) !== -1,
          key, 'missing required property: ' + property );
      } );

      // verify that there are no unsupported properties
      var supportedProperties = requiredProperties.concat( optionalProperties );
      schemaProperties.forEach( function( property ) {
        queryStringMachineAssert( supportedProperties.indexOf( property ) !== -1,
          key, 'unsupported property: ' + property );
      } );
    };

    /**
     * Uses the supplied schema to convert query parameter value(s) from string to the desired value type.
     *
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string[]} values - any matches from the query string, could be multiple for ?value=x&value=y for example
     * @returns {*} the associated value, converted to the proper type
     */
    var parseValues = function( key, schema, values ) {

      //TODO future support for multiple occurrences?
      queryStringMachineAssert( values.length <= 1, key, 'query parameter cannot occur multiple times' );

      var value = null;

      if ( schema.hasOwnProperty( 'type' ) ) {

        // dispatch parsing to a type-specific function
        if ( schema.type === 'flag' ) {
          value = parseFlag( key, schema, values[ 0 ] );
        }
        else if ( schema.type === 'boolean' ) {
          value = parseBoolean( key, schema, values[ 0 ] );
        }
        else if ( schema.type === 'number' ) {
          value = parseNumber( key, schema, values[ 0 ] );
        }
        else if ( schema.type === 'string' ) {
          value = parseString( key, schema, values[ 0 ] );
        }
        else if ( schema.type === 'array' ) {
          value = parseArray( key, schema, values[ 0 ] );
        }
        else {
          throw new Error( formatErrorMessage( key, 'invalid type: ' + schema.type ) );
        }
      }
      else if ( schema.hasOwnProperty( 'parse' ) ) {

        //TODO is this correct? complete?
        if ( values[ 0 ] ) {
          value = schema.parse( values[ 0 ] );
        }
        else {
          value = null;
        }
      }
      else {
        throw new Error( formatErrorMessage( key, 'type or parse must be specified' ) );
      }

      return value;
    };

    /**
     * Parses the value for a type 'flag'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string} value - value from the query parameter string
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
     * @param {string} value - value from the query parameter string
     * @returns {boolean}
     */
    var parseBoolean = function( key, schema, value ) {

      // determine the value
      var returnValue = null;
      if ( value === undefined ) {

        // query parameter is not present, use defaultValue
        if ( schema.hasOwnProperty( 'defaultValue' ) ) {
          returnValue = schema.defaultValue;
        }
        else {
          returnValue = true; // if no defaultValue is specified, boolean type defaults to true
        }
      }
      else {

        // query parameter is present, use its value
        queryStringMachineAssert( value === 'true' || value === 'false', key, 'invalid value: ' + value );
        returnValue = ( value === 'true' );
      }

      // validate the value
      queryStringMachineAssert( typeof returnValue === 'boolean', key, 'invalid value: ' + returnValue );

      return returnValue;
    };

    /**
     * Parses the value for a type 'number'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string} value - value from the query parameter string
     * @returns {number|null}
     */
    var parseNumber = function( key, schema, value ) {

      // determine the value
      var returnValue = null;
      if ( value === undefined ) {

        // query parameter is not present, use defaultValue
        returnValue = schema.defaultValue;
      }
      else {

        // query parameter is present, use its value
        returnValue = Number( value );
      }

      // validate the value
      queryStringMachineAssert( !isNaN( returnValue ), key, 'invalid value: ' + value ); // Number returns NaN if the string cannot be converted to a number
      queryStringMachineAssert( typeof returnValue === 'number', key, 'invalid value: ' + returnValue );
      if ( schema.hasOwnProperty( 'validValues' ) ) {
        queryStringMachineAssert( schema.validValues.indexOf( returnValue ) !== -1, key, 'invalid value: ' + returnValue )
      }
      else if ( schema.hasOwnProperty( 'isValidValue' ) ) {
        queryStringMachineAssert( schema.isValidValue( returnValue ), key, 'invalid value: ' + returnValue );
      }

      return returnValue;
    };

    /**
     * Parses the value for a type 'string'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string} value - value from the query parameter string
     * @returns {string|null}
     */
    var parseString = function( key, schema, value ) {

      // determine the value
      var returnValue = null;
      if ( value === undefined ) {

        // query parameter is not present, use defaultValue
        returnValue = schema.defaultValue;
      }
      else {

        // query parameter is present, use its value
        returnValue = value;
      }

      // validate the value
      queryStringMachineAssert( returnValue === null || typeof returnValue === 'string', key, 'invalid value: ' + returnValue );
      if ( schema.hasOwnProperty( 'validValues' ) ) {
        queryStringMachineAssert( schema.validValues.indexOf( returnValue ) !== -1, key, 'invalid value: ' + returnValue )
      }
      else if ( schema.hasOwnProperty( 'isValidValue' ) ) {
        queryStringMachineAssert( schema.isValidValue( returnValue ), key, 'invalid value: ' + returnValue );
      }

      return returnValue;
    };

    /**
     * Parses the value for a type 'array'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string} value - value from the query parameter string
     * @returns {*[]|null}
     */
    var parseArray = function( key, schema, value ) {

      // determine the value
      var returnValue = null;
      if ( value === undefined ) {

        // query parameter is not present, use defaultValue
        returnValue = schema.defaultValue;
      }
      else {

        // query parameter is present, use its value
        if ( value === null ) {

          // An empty string signifies an empty array. For instance ?screens= would give []
          // See https://github.com/phetsims/query-string-machine/issues/17
          returnValue = [];
        }
        else {

          // Split up the string into an array of values. E.g. ?screens=1,2 would give [1,2]
          returnValue = value.split( schema.separator || DEFAULT_SEPARATOR ).map( function( element ) {
            return parseValues( key, schema.elementSchema, [ element ] );
          } );
        }
      }

      //TODO validate elements of the array based on elementSchema

      // validate the entire array
      if ( schema.hasOwnProperty( 'validValues' ) ) {
        var arrayJSON = JSON.stringify( returnValue );
        var isValid = false;
        for ( var i = 0; i < schema.validValues.length; i++ ) {
          var validValue = schema.validValues[ i ];

          //TODO this is a dangerous comparison, stringify does not guarantee ordering!!
          if ( JSON.stringify( validValue ) === arrayJSON ) {
            isValid = true;
            break;
          }
        }
        queryStringMachineAssert( isValid, key, 'invalid value: ' + arrayJSON );
      }

      return returnValue;
    };

    /**
     * Query parameters are specified by the user, and are outside the control of the programmer.
     * So the application should throw an Error if query parameters are invalid (even if window.assert is disabled).
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

    return QueryStringMachine;
  })();
} ));