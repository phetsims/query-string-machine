// Copyright 2016, University of Colorado Boulder

(function() {
  'use strict';

  // assert shadows window.assert
  QUnit.test( 'basic tests', function( assert ) {
    var value = 'hello';
    assert.equal( value, 'hello', 'We expect value to be hello' );

    var schemaMap = {
      height: {
        type: 'number',
        defaultValue: 6,
        validValues: [ 4, 5, 6, 7, 8 ]
      },
      name: {
        type: 'string',
        defaultValue: 'Larry',
        isValidValue: function( str ) {
          return ( str.indexOf( 'Z' ) !== 0 ); // Name cannot start with 'Z'
        }
      },
      custom: {
        type: 'custom',
        parse: function( string ) {
          return string.toLowerCase();
        },
        validValues: [ 'abc', 'def', 'ghi' ],
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
        // validValues is optional, for instance-- validValues: [ [ 1, 1, 2 ], [ 2, 3, 5 ] ]
        // separator is optional, defaults to ','
      },
      colors: {
        type: 'array',
        defaultValue: [ 'red', 'green', 'blue' ],
        elementSchema: {
          type: 'string'
        }
      }
    };
    var values = QueryStringMachine.getAll( schemaMap );
    console.log( 'Based on URL: ' + JSON.stringify( values, null, 2 ) );

    /**
     * Automated testing function
     *
     * @param  {string} testName - identifier for the test being run
     * @param  {string} queryString - the query string to be parsed
     * @param  {Object} expected - expected result to test against
     * @param  {Object} schema - specification for use in parsing queryString
     */
    var test = function( testName, queryString, expected, schema ) {

      // the actual result
      var actual = QueryStringMachine.getAllForString( queryString, schema );

      assert.deepEqual( actual, expected, testName );
    };

    // Automated tests
    test( 'A blank query string should provide defaults', '', {
      'height': 6,
      'name': 'Larry',
      'custom': 'abc',
      'isWebGL': false,
      'screens': [],
      'colors': [ 'red', 'green', 'blue' ]
    }, schemaMap );

    test( 'Query parameter values should be parsed', '?height=7&isWebGL&wisdom=123', {
      'height': 7,
      'name': 'Larry',
      'custom': 'abc',
      'isWebGL': true,
      'screens': [],
      'colors': [ 'red', 'green', 'blue' ]
    }, schemaMap );

    test( 'Custom query parameter should be supported', '?height=7&isWebGL&wisdom=123&custom=DEF', {
      'height': 7,
      'name': 'Larry',
      'custom': 'def',
      'isWebGL': true,
      'screens': [],
      'colors': [ 'red', 'green', 'blue' ]
    }, schemaMap );

    test( 'Array should be parsed', '?isWebGL&screens=1,2,3,5&colors=yellow,orange,pink', {
      'height': 6,
      'name': 'Larry',
      'custom': 'abc',
      'isWebGL': true,
      'screens': [ 1, 2, 3, 5 ],
      'colors': [ 'yellow', 'orange', 'pink' ]
    }, schemaMap );

    // Test that isValidValue is supported for arrays with a contrived check (element sum == 7).
    // With an input of [2,4,0], QSM should throw an error, and it should be caught here.
    assert.throws( function() {
      QueryStringMachine.getAllForString( '?numbers=2,4,0', {
        numbers: {
          type: 'array',
          elementSchema: {
            type: 'number'
          },
          defaultValue: [ 1, 6, 0 ],
          isValidValue: function( arr ) {
            // Fake test: check that elements sum to 7 for phetsims/query-string-machine#11
            var arraySum = arr.reduce( function( a, b ) { return a + b; }, 0 );
            return ( arraySum === 7 );
          }
        }
      } );
    }, 'Array error handling should catch exception' );

    assert.throws( function() {
      QueryStringMachine.getAllForString( '?ea&hello=true', {
        sim: {
          type: 'string'
        }
      } );

    }, 'missing query parameter should be caught' );

    // If this point is reached, congratulations
    console.log( '\n* All tests passed *' );
  } );

})();