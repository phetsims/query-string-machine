// Copyright 2016, University of Colorado Boulder

(function() {
  'use strict';

  var testAssert = function( b, text ) {
    if ( !b ) {
      console.log( text );
      throw new Error( text );
    }
  };

  var schemaMap = {
    height: {
      type: 'number',
      defaultValue: 6,
      allowedValues: [ 4, 5, 6, 7, 8 ]
    },
    name: {
      type: 'string',
      defaultValue: 'Larry',
      validate: function( str ) {
        testAssert( str.indexOf( 'Z' ) !== 0, 'Name cannot start with Z: ' + str );
      }
    },
    custom: {
      parse: function( string ) {
        return string.toLowerCase();
      },
      allowedValues: [ 'abc', 'def', 'ghi' ],
      defaultValue: 'abc'
    },
    isWebGL: {
      type: 'flag' // If no equals sign, then presence indicates true
      // If there is an equals sign, then parse string as boolean
    },
    screens: {
      type: 'array',
      elementSchema: {
        type: 'number'
      },
      defaultValue: []
      // allowedValues is optional, for instance-- allowedValues: [ [ 1, 1, 2 ], [ 2, 3, 5 ] ]
      // separator is optional, defaults to ','
    }
  };
  var values = QueryStringMachine.getAll( schemaMap );
  console.log( JSON.stringify( values, null, 2 ) );

  /**
   * Automated testing function
   *
   * @param  {string} testName - identifier for the test being run
   * @param  {string} queryString - the query string to be parsed
   * @param  {Object} expected - expected result to test against
   * @param  {Object} schema - specification for use in parsing queryString
   */
  var test = function( testName, queryString, expected, schema ) {
    var parsedQueryString = QueryStringMachine.getAllForString( queryString, schema );
    var a = JSON.stringify( parsedQueryString );
    var b = JSON.stringify( expected );
    if ( a !== b ) {
      console.log('Mismatch: ' + a + ' vs. ' + b );
    }
    testAssert( a === b, testName );
    console.log( testName + ' passed' );
  };

  // Automated tests
  test( 'test1', '', {
    'height': 6,
    'name': 'Larry',
    'custom': 'abc',
    'isWebGL': false,
    'screens': []
  }, schemaMap );

  test( 'test2', '?height=7&isWebGL&wisdom=123', {
    'height': 7,
    'name': 'Larry',
    'custom': 'abc',
    'isWebGL': true,
    'screens': []
  }, schemaMap );

  test( 'test3', '?height=7&isWebGL&wisdom=123&custom=DEF', {
    'height': 7,
    'name': 'Larry',
    'custom': 'def',
    'isWebGL': true,
    'screens': []
  }, schemaMap );

  test( 'test4', '?isWebGL&screens=1,2,3,5', {
    'height': 6,
    'name': 'Larry',
    'custom': 'abc',
    'isWebGL': true,
    'screens': [
      1,
      2,
      3,
      5
    ]
  }, schemaMap );

  // example schema for nested arrays
  var minefieldArraySchema = {
    minefield: {
      type: 'array',
      separator: '/',
      elementSchema: {
        type: 'array',
        separator: ',',
        elementSchema: {
          type: 'number',
          allowedValues: [ 1, 2, 3, 4 ]
        }
      }
    }
  };

  test( 'test5', '?minefield=1,2,3/4,3,2', {
    'minefield': [[ 1, 2, 3 ], [ 4, 3, 2 ]]
  }, minefieldArraySchema );

  // Test required parameter 'sim'
  var error = null;
  try {
    QueryStringMachine.getAllForString( '?ea&hello=true', {
      sim: {
        type: 'string'
      }
    } );
  }
  catch( e ) {
    error = e;
    console.log( 'Kindly ignore the preceding error log, it was expected when testing for missing query parameter.' );
  }
  testAssert( error, 'missing query parameter should be caught' );
  console.log( 'test passed' );

})();
