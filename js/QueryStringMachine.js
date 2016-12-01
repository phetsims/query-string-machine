// Copyright 2016, University of Colorado Boulder

/**
 * Query String parser that supports type coercion, defaults, error checking, etc. based on a schema.
 * See QueryStringMachine.get for the description of a schema.
 *
 * Implemented as a UMD (Universal Module Definition) so that it's capable of working everywhere.
 * See https://github.com/umdjs/umd/blob/master/templates/returnExports.js
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
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

  // Default string that splits array strings
  var DEFAULT_SEPARATOR = ',';

  // Support assertions in the browser (window.assert) and in node (global.assert)
  var assert = typeof window === 'object' ? window.assert : global.assert;

  // Just return a value to define the module export.
  // This example returns an object, but the module
  // can return a function as the exported value.
  return (function() {

    var QueryStringMachine = {

      /**
       * Gets the value for a single query parameter.
       *
       * @param {string} key - the query parameter name
       * @param {Object} schema`
       * @returns {*} query parameter value, converted to the proper type
       * @public
       */
      get: function( key, schema ) {
        return this.getForString( window.location.search, key, schema );
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
       * Like `get` but for an arbitrary parameter string.
       *
       * @param {string} string - the parameters string
       * @param {string} key - the query parameter name
       * @param {Object} schema - see QueryStringMachine.get
       * @returns {*} query parameter value, converted to the proper type
       * @public (for testing only)
       */
      getForString: function( string, key, schema ) {
        validateSchema( key, schema );

        assert && assert( string.length === 0 || string.indexOf( '?' ) === 0, 'Query strings should be either the empty ' +
                                                                              'string or start with a "?": ' + string );

        return parseValues( key, schema, getValues( key, string ) );
      },

      /**
       * Like `getAll` but for an arbitrary parameters string.
       *
       * @param {string} string - the parameters string
       * @param {Object} schemaMap - key/value pairs, key is query parameter name and value is a schema
       * @returns {Object} - key/value pairs holding the parsed results
       * @public (for testing only)
       */
      getAllForString: function( string, schemaMap ) {
        var result = {};
        for ( var key in schemaMap ) {
          if ( schemaMap.hasOwnProperty( key ) ) {
            result[ key ] = this.getForString( string, key, schemaMap[ key ] );
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

      containsKeyForString: function( string, key ) {
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

      // type is required
      queryStringMachineAssert( schema.hasOwnProperty( 'type' ),
        key, 'type field is required' );

      // type is valid
      queryStringMachineAssert( TYPES.hasOwnProperty( schema.type ),
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

      // defaultValue is a member of validValues
      if ( schema.hasOwnProperty( 'defaultValue' ) && schema.hasOwnProperty( 'validValues' ) ) {

        // Validate defaultValue for type 'array'
        if ( schema.type === 'array' ) {

          var matched = false;
          schema.validValues.forEach( function( validValue ) {
            if ( _.isEqual( validValue, schema.defaultValue ) ) {
              matched = true;
            }
          } );
          queryStringMachineAssert( matched, key, 'defaultValue must be a member of validValues' );
        }
        else {
          queryStringMachineAssert( ( schema.validValues.indexOf( schema.defaultValue ) !== -1 ),
            key, 'defaultValue must be a member of validValues' );
        }
      }

      // verify that the schema has appropriate properties
      validateSchemaProperties( key, schema, TYPES[ schema.type ].required, TYPES[ schema.type ].optional );

      // dispatch further validation to a type-specific function
      TYPES[ schema.type ].validate( key, schema );
    };

    /**
     * Validates schema for type 'flag'.
     *
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     */
    var validateFlag = function( key, schema ) {

      // Nothing specific to do for validating flag type, all necessary validation (making sure the right keys and
      // values are supplied) is done in validateSchema
    };

    /**
     * Validates schema for type 'boolean'.
     *
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     */
    var validateBoolean = function( key, schema ) {

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
    var validateNumber = function( key, schema ) {

      if ( schema.hasOwnProperty( 'defaultValue' ) ) {
        queryStringMachineAssert( typeof schema.defaultValue === 'number',
          key, 'invalid defaultValue: ' + schema.defaultValue );
      }

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
    var validateString = function( key, schema ) {

      // defaultValue is a string or null
      if ( schema.hasOwnProperty( 'defaultValue' ) ) {
        queryStringMachineAssert( typeof schema.defaultValue === 'string' || schema.defaultValue === null,
          key, 'invalid defaultValue: ' + schema.defaultValue );
      }

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
    var validateArray = function( key, schema ) {

      // defaultValue can be a string or null
      if ( schema.hasOwnProperty( 'defaultValue' ) ) {
        queryStringMachineAssert( schema.defaultValue instanceof Array || schema.defaultValue === null,
          key, 'invalid defaultValue: ' + schema.defaultValue );
      }

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

      validateSchema( key + '.element', schema.elementSchema );
      //TODO validate elements in defaultValue
      //TODO validate elements in validValues
    };

    /**
     * Validates schema for type 'custom'.
     *
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     */
    var validateCustom = function( key, schema ) {

      //TODO provide custom validation rules in the element schemas (instead of just a parse function that doesn't tolerate errors)
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
      // validation that is independent of type
      queryStringMachineAssert( values.length <= 1, key, 'query parameter cannot occur multiple times' );
      if ( schema.type !== 'flag' ) {
        queryStringMachineAssert( values[ 0 ] !== undefined || schema.hasOwnProperty( 'defaultValue' ),
          key, 'missing required query parameter' );
      }

      // dispatch parsing to a type-specific function
      return TYPES[ schema.type ].parse( key, schema, values[ 0 ] );
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
        returnValue = schema.defaultValue;
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
        queryStringMachineAssert( schema.validValues.indexOf( returnValue ) !== -1, key, 'invalid value: ' + returnValue );
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
        queryStringMachineAssert( schema.validValues.indexOf( returnValue ) !== -1, key, 'invalid value: ' + returnValue );
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

      // validate the entire array
      if ( schema.hasOwnProperty( 'validValues' ) ) {
        var isValid = false;

        for ( var i = 0; i < schema.validValues.length; i++ ) {
          var validValue = schema.validValues[ i ];
          if ( _.isEqual( validValue, returnValue ) ) {
            isValid = true;
            break;
          }
        }
        queryStringMachineAssert( isValid, key, 'invalid value: ' + JSON.stringify( returnValue ) );
      }
      else if ( schema.hasOwnProperty( 'isValidValue' ) ) {
        queryStringMachineAssert( schema.isValidValue( returnValue ), key, 'invalid value: ' + returnValue );
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

      // determine the value
      var returnValue = null;
      if ( value === undefined ) {
        returnValue = schema.defaultValue;
      }
      else {
        returnValue = schema.parse( value );
      }

      // validate the value
      if ( schema.hasOwnProperty( 'validValues' ) ) {
        queryStringMachineAssert( schema.validValues.indexOf( returnValue ) !== -1, key, 'invalid value: ' + returnValue );
      }
      else if ( schema.hasOwnProperty( 'isValidValue' ) ) {
        queryStringMachineAssert( schema.isValidValue( returnValue ), key, 'invalid value: ' + returnValue );
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
        optional: [],
        validate: validateFlag,
        parse: parseFlag
      },

      // value is either true or false, e.g. showAnswer=true
      boolean: {
        required: [],
        optional: [ 'defaultValue' ],
        validate: validateBoolean,
        parse: parseBoolean
      },

      // value is a number, e.g. frameRate=100
      number: {
        required: [],
        optional: [ 'defaultValue', 'validValues', 'isValidValue' ],
        validate: validateNumber,
        parse: parseNumber
      },

      // value is a string, e.g. name=Ringo
      string: {
        required: [],
        optional: [ 'defaultValue', 'validValues', 'isValidValue' ],
        validate: validateString,
        parse: parseString
      },

      // value is an array, e.g. screens=1,2,3
      array: {
        required: [ 'elementSchema' ],
        optional: [ 'defaultValue', 'validValues', 'isValidValue', 'separator', 'validValues' ],
        validate: validateArray,
        parse: parseArray
      },

      // value is a custom data type, e.g. color=255,0,255
      custom: {
        required: [ 'parse' ],
        optional: [ 'defaultValue', 'validValues', 'isValidValue' ],
        validate: validateCustom,
        parse: parseCustom
      }
    };

    return QueryStringMachine;
  })();
} ));