// Copyright 2016, University of Colorado Boulder

(function() {
  'use strict';

  var testAssert = function( condition, message ) {
    if ( !condition ) {
      console.log( message );
      throw new Error( message );
    }
  };
  
  var consoleErrorMessage = function( testName, message ) {
    console.log( 'ERROR ' + testName + ': ' + message );
  };

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

    var errors = 0;

    // Look for unexpected keys in the actual result
    var actualProperties = Object.getOwnPropertyNames( actual );
    actualProperties.forEach( function( property ) {
      if ( !expected.hasOwnProperty( property ) ) {
        consoleErrorMessage( testName, 'unexpected key: ' + property );
        errors++;
      }
    } );

    // Look for missing keys and unexpected values
    var expectedProperties = Object.getOwnPropertyNames( expected );
    expectedProperties.forEach( function( property ) {
      if ( !actual.hasOwnProperty( property ) ) {
        consoleErrorMessage( testName, 'missing key:' + property );
        errors++;
      }
      else if ( actual[ property ] instanceof Array ) {

        // array comparison is more involved...
        var actualArray = actual[ property ];
        var expectedArray = expected[ property ];
        if ( actualArray.length !== expectedArray.length ) {

          // array lengths are different, so the arrays must be different
          consoleErrorMessage( testName,
            'unexpected array for key=' + property + ', expected=' + JSON.stringify( expectedArray ) + ', actual=' + JSON.stringify( actualArray ) );
          errors++;
        }
        else {

          // compare elements in the arrays
          actualArray.forEach( function( element ) {
            if ( expectedArray.indexOf( element ) === -1 ) {
              consoleErrorMessage( testName,
                'unexpected array for key=' + property + ', expected=' + JSON.stringify( expectedArray ) + ', actual=' + JSON.stringify( actualArray ) );
              errors++;
            }
          } );
        }
      }
      else if ( actual[ property ] !== expected[ property ] ) {

        //TODO This is going to be problematic for 'custom' type
        // non-array comparison
        consoleErrorMessage( testName,
          'unexpected value for key=' + property + ', expected=' + expected[ property ] + ', actual=' + actual[ property ] );
        errors++;
      }
    } );

    testAssert( errors === 0, testName + ' failed' );
    console.log( testName + ' passed' );
  };

  // Automated tests
  test( 'test1', '', {
    'height': 6,
    'name': 'Larry',
    'custom': 'abc',
    'isWebGL': false,
    'screens': [],
    'colors': [ 'red', 'green', 'blue' ]
  }, schemaMap );

  test( 'test2', '?height=7&isWebGL&wisdom=123', {
    'height': 7,
    'name': 'Larry',
    'custom': 'abc',
    'isWebGL': true,
    'screens': [],
    'colors': [ 'red', 'green', 'blue' ]
  }, schemaMap );

  test( 'test3', '?height=7&isWebGL&wisdom=123&custom=DEF', {
    'height': 7,
    'name': 'Larry',
    'custom': 'def',
    'isWebGL': true,
    'screens': [],
    'colors': [ 'red', 'green', 'blue' ]
  }, schemaMap );

  test( 'test4', '?isWebGL&screens=1,2,3,5&colors=yellow,orange,pink', {
    'height': 6,
    'name': 'Larry',
    'custom': 'abc',
    'isWebGL': true,
    'screens': [ 1, 2, 3, 5 ],
    'colors': [ 'yellow', 'orange', 'pink' ]
  }, schemaMap );

  // Test that isValidValue is supported for arrays with a contrived check (element sum == 7).
  // With an input of [2,4,0], QSM should throw an error, and it should be caught here.
  (function() {
    var arraySum = 0;
    var error = null;
    try {
      QueryStringMachine.getAllForString( '?numbers=2,4,0', {
        numbers: {
          type: 'array',
          elementSchema: {
            type: 'number'
          },
          defaultValue: [ 1, 6, 0 ],
          isValidValue: function( arr ) {
            // Fake test: check that elements sum to 7 for phetsims/query-string-machine#11
            arraySum = arr.reduce( function( a, b ) { return a + b; }, 0 );
            return ( arraySum === 7 );
          }
        }
      } );
    }
    catch( e ) {
      error = e;
      console.log( 'You should see a \"value not allowed\" error above if sum != 7. Computed ' + arraySum );
    }
    // Assert here that there _is_ an error, since the element sum test is supposed to fail.
    testAssert( error, 'Error: Array error handling test failed to catch exception' );
  })();

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

  // If this point is reached, congratulations
  console.log( '\n* All tests passed *' );
})();
