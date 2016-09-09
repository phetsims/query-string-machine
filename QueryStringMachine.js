// Copyright 2016, University of Colorado Boulder

/**
 * Query String parser that supports type coercion, defaults, error checking, etc. based on a schema.
 * See QueryStringMachine.get for the description of a schema.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
window.QueryStringMachine = (function() {
  'use strict';

  var QueryStringMachine = {

    /**
     * Returns the value for a single element.
     * @param key
     * @param {Object} schemaElement * required: 'type' or 'parse'
     *                                   * type: one of 'boolean'|'number'|'string'|'flag'
     *                                   * parse: a function that takes a string and returns an object
     *                               * optional: 'defaultValue' - The value to take if no query parameter is provided
     *                               * optional: 'allowedValues' - Array of the allowed values for validation
     *                               * optional: 'validate' - function that takes a parsed object (not string) and checks if it is acceptable
     *
     * @returns {number}
     * @public
     */
    get: function( key, schemaElement ) {
      return this.getForString( window.location.search, key, schemaElement );
    },

    /**
     * Like `get` but for an arbitrary string, for testing
     * @param {string} string
     * @param {string} key
     * @param {Object} schemaElement, see QueryStringMachine.get
     * @returns {*}
     * @public (for-testing)
     */
    getForString: function( string, key, schemaElement ) {
      var result = parseElement( schemaElement, getValues( string, key ) );
      validate( schemaElement, result );
      return result;
    },

    /**
     * Get query parameter values for every key, using the supplied schemas.
     *
     * @param {Object} schema - key is query parameter name and value is the schemaElement (see QueryStringMachine.get)
     * @returns {Object} - key value pairs holding the parsed results
     * @public
     */
    getAll: function( schema ) {
      return this.getAllForString( window.location.search, schema );
    },

    /**
     * Get values for each query parameter, using the supplied schemas.
     *
     * @param string
     * @param schema
     * @returns {Object} - key value pairs holding the parsed results
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

  // Convenience functions for parsing string to other primitive types
  var stringToNumber = function( string ) {
    return Number( string );
  };
  var stringToString = function( string ) {
    return string;
  };
  var stringToBoolean = function( string ) {
    assert && assert( string === 'true' || string === 'false', 'illegal value for boolean: ' + string );
    return string === 'true';
  };

  var validate = function( schemaElement, value ) {
    schemaElement.allowedValues && assert && assert( schemaElement.allowedValues.indexOf( value ) >= 0, 'value not allowed: ' + value + ', allowedValues = ' + schemaElement.allowedValues );
    schemaElement.validate && schemaElement.validate( value );
    schemaElement.type === 'number' && assert && assert( typeof value === 'number', 'should have been a number' );
  };

  /**
   * @param schemaElement TODO add type expression and description
   * @param {Array} values any matches from the query string, could be multiple for ?value=x&value=y for example
   * @returns {*}
   */
  var parseElement = function( schemaElement, values ) {
    assert && assert( !(schemaElement.allowedValues && schemaElement.validate), 'cannot specify allowedValues and validate simultaneously' );

    // TODO: make sure schema default value matches schema type
    if ( values.length === 0 ) {

      // If flag is not supplied, default to false.
      if ( schemaElement.type === 'flag' ) {
        return false;
      }
      else {
        return schemaElement.defaultValue;
      }
    }
    else if ( values.length === 1 ) {
      if ( schemaElement.type === 'number' ) {
        return stringToNumber( values[ 0 ] );
      }
      else if ( schemaElement.type === 'string' ) {
        return stringToString( values[ 0 ] );
      }
      else if ( schemaElement.type === 'boolean' ) {
        return stringToBoolean( values[ 0 ] );
      }
      else if ( schemaElement.type === 'array' ) {
        var subSchemaElement = {};
        for ( var k in schemaElement ) {
          if ( schemaElement.hasOwnProperty( k ) && k !== 'type' ) {
            subSchemaElement[ k ] = schemaElement;
          }
        }
        assert && assert( schemaElement.elementType, 'array element type must be defined' );
        subSchemaElement.type = schemaElement.elementType;
        return values[ 0 ].split( schemaElement.separator ).map( function( element ) {
          return parseElement( subSchemaElement, [ element ] );
        } );
      }
      else if ( schemaElement.type === 'flag' ) {

        // When the value is null, like for ?webgl, default to true
        if ( values[ 0 ] === null ) {
          return true;
        }
        else {
          return stringToBoolean( values[ 0 ] );
        }
      }
      else if ( schemaElement.parse ) {
        return schemaElement.parse( values[ 0 ] );
      }
      else {
        throw new Error( 'not supported' );
      }
    }
    else {
      // In the future we could add support for the form: ?id=1&id=2&id=7 etc
      throw new Error( 'Specifying keys multiple times not supported..... yet?' );
    }
  };

  /**
   * Query strings may show the same key appearing multiple times, such as ?value=2&value=3.  This method recovers all
   * of the string values.  For this example, it would be ['2','3'].
   * @param {string} string - the query string
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