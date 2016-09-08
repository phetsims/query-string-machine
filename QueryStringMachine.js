// Copyright 2016, University of Colorado Boulder

window.QueryStringMachine = (function() {
  'use strict';

  var assert = function( b, text ) {
    if ( !b ) {
      console.log( text );
      throw new Error( text );
    }
  };

  var stringToNumber = function( string ) {
    return Number( string );
  };
  var stringToString = function( string ) {
    return string;
  };
  var stringToBoolean = function( string ) {
    assert( string === 'true' || string === 'false', 'illegal value: ' + string );
    if ( string === 'true' ) {
      return true;
    }
    else if ( string === 'false' ) {
      return false;
    }
    else {
      throw new Error( 'illegal value: ' + string );
    }
  };

  var validate = function( schemaEntry, value ) {
    if ( schemaEntry.allowedValues ) {
      assert( schemaEntry.allowedValues.indexOf( value ) >= 0, 'value not allowed: ' + value );
    }
    else if ( schemaEntry.validate ) {
      schemaEntry.validate( value );
    }
    else if ( schemaEntry.type === 'number' ) {
      assert( typeof value === 'number', 'should have been a number' );
    }
    return value;
  };
  /**
   *
   * @param key
   * @param schemaEntry
   * @param {Array} values any matches from the query string, could be multiple for ?value=x&value=y for example
   * @returns {number}
   */
  var parseElement = function( key, schemaEntry, values ) {
    assert( !(schemaEntry.allowedValues && schemaEntry.validate), 'cannot specify allowedValues and validate simultaneously' );

    // TODO: make sure schema default value matches schema type
    if ( values.length === 0 ) {

      //
      if ( schemaEntry.type === 'flag' ) {
        return validate( schemaEntry, false );
      }
      else {
        return validate( schemaEntry, schemaEntry.defaultValue );
      }
    }
    else if ( values.length === 1 ) {
      if ( schemaEntry.type === 'number' ) {
        return validate( schemaEntry, stringToNumber( values[ 0 ] ) );
      }
      else if ( schemaEntry.type === 'string' ) {
        return validate( schemaEntry, stringToString( values[ 0 ] ) );
      }
      else if ( schemaEntry.type === 'boolean' ) {
        return validate( schemaEntry, stringToBoolean( values[ 0 ] ) );
      }
      else if ( schemaEntry.type === 'flag' ) {
        if ( values[ 0 ] === null ) {
          return validate( schemaEntry, true );
        }
        else {
          return validate( schemaEntry, stringToBoolean( values[ 0 ] ) );
        }
      }
      else if ( schemaEntry.parse ) {
        return validate( schemaEntry, schemaEntry.parse( values[ 0 ] ) );
      }
      else {
        throw new Error( 'not supported' );
      }
    }
    else {
      throw new Error( 'not implemented' );
    }
  };

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
  var QueryStringMachine = {

    // Just invoke for a single value
    get: function( key, schemaElement ) {
      return parseElement( key, schemaElement, getValues( window.location.search, key ) );
    },
    parse: function( schema ) {
      return this.parseString( window.location.search, schema );
    },

    // Return an object hash with keys matching schema
    parseString: function( string, schema ) {
      var result = {};
      for ( var key in schema ) {
        if ( schema.hasOwnProperty( key ) ) {
          result[ key ] = this.get( key, schema[ key ] );
        }
      }
      return result;
    }
  };

  return QueryStringMachine;
})();