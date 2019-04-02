// Copyright 2017, University of Colorado Boulder

/**
 * QueryStringMachine tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  QUnit.module( 'QueryStringMachine' );

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
        defaultValue: 'abc',
        validValues: [ 'abc', 'def', 'ghi' ],
        parse: function( string ) {
          return string.toLowerCase();
        }
      },
      isWebGL: {
        type: 'flag'
      },
      screens: {
        type: 'array',
        defaultValue: [],
        elementSchema: {
          type: 'number'
        }
      },
      colors: {
        type: 'array',
        defaultValue: [ 'red', 'green', 'blue' ],
        elementSchema: {
          type: 'string'
        }
      }
    };

    assert.deepEqual( QueryStringMachine.getAllForString( schemaMap, '' ), {
      'height': 6,
      'name': 'Larry',
      'custom': 'abc',
      'isWebGL': false,
      'screens': [],
      'colors': [ 'red', 'green', 'blue' ]
    }, 'A blank query string should provide defaults' );

    assert.deepEqual( QueryStringMachine.getAllForString( schemaMap, '?height=7&isWebGL' ), {
      'height': 7,
      'name': 'Larry',
      'custom': 'abc',
      'isWebGL': true,
      'screens': [],
      'colors': [ 'red', 'green', 'blue' ]
    }, 'Query parameter values should be parsed' );

    assert.deepEqual( QueryStringMachine.getAllForString( schemaMap, '?height=7&isWebGL&custom=DEF' ), {
      'height': 7,
      'name': 'Larry',
      'custom': 'def',
      'isWebGL': true,
      'screens': [],
      'colors': [ 'red', 'green', 'blue' ]
    }, 'Custom query parameter should be supported' );

    assert.deepEqual( QueryStringMachine.getAllForString( schemaMap, '?isWebGL&screens=1,2,3,5&colors=yellow,orange,pink' ), {
      'height': 6,
      'name': 'Larry',
      'custom': 'abc',
      'isWebGL': true,
      'screens': [ 1, 2, 3, 5 ],
      'colors': [ 'yellow', 'orange', 'pink' ]
    }, 'Array should be parsed' );

    // Test that isValidValue is supported for arrays with a contrived check (element sum == 7).
    // With an input of [2,4,0], QSM should throw an error, and it should be caught here.
    assert.throws( function() {
      QueryStringMachine.getAllForString( {
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
      }, '?numbers=2,4,0' );
    }, 'Array error handling should catch exception' );

    assert.throws( function() {
      QueryStringMachine.getAllForString( {
        sim: {
          type: 'string'
        }
      }, '?ea&hello=true' );

    }, 'Catch missing required query parameter' );

    assert.deepEqual( QueryStringMachine.getForString( 'hello', {
      type: 'array',
      elementSchema: {
        type: 'number'
      },
      validValues: [
        [ 1, 2 ], [ 3, 4 ], [ 1, 2, 3 ]
      ],
      defaultValue: [ 1, 2 ]
    }, '?ea&hello=1,2,3' ), [ 1, 2, 3 ], 'Arrays should support defaultValue and validValues' );

    assert.throws( function() {
      QueryStringMachine.getForString( 'hello', {
        type: 'array',
        elementSchema: {
          type: 'number'
        },
        validValues: [
          [ 1, 2 ], [ 3, 4 ], [ 1, 2, 3 ]
        ],
        defaultValue: [ 1, 2 ]
      }, '?ea&hello=1,2,3,99' );
    }, 'Catch invalid value for array' );

    assert.deepEqual( QueryStringMachine.getForString( 'screens', {
      type: 'array',
      elementSchema: {
        type: 'number'
      },
      defaultValue: null
    }, '?screens=1,2,3' ), [ 1, 2, 3 ], 'Test array of numbers' );

  } );

  // Tests for our own deepEquals method
  QUnit.test( 'deepEquals', function( assert ) {
    assert.equal( QueryStringMachine.deepEquals( 7, 7 ), true, '7 should equal itself' );
    assert.equal( QueryStringMachine.deepEquals( 7, 8 ), false, '7 should not equal 8' );
    assert.equal( QueryStringMachine.deepEquals( 7, '7' ), false, '7 should not equal "7"' );
    assert.equal( QueryStringMachine.deepEquals( { 0: 'A' }, 'A' ), false, 'string tests' );
    assert.equal( QueryStringMachine.deepEquals( [ 'hello', 7 ], [ 'hello', 7 ] ), true, 'array equality test' );
    assert.equal( QueryStringMachine.deepEquals( [ 'hello', 7 ], [ 'hello', '7' ] ), false, 'array inequality test' );
    assert.equal( QueryStringMachine.deepEquals( [ 'hello', { hello: true } ], [ 'hello', { hello: true } ] ), true, 'object in array inequality test' );
    assert.equal( QueryStringMachine.deepEquals( [ 'hello', { hello: true } ], [ 'hello', { hello: false } ] ), false, 'object in array  inequality test' );
    assert.equal( QueryStringMachine.deepEquals( { x: [ { y: 'hello' }, true, 123, 'x' ] }, { x: [ { y: 'hello' }, true, 123, 'x' ] } ), true, 'object in array  inequality test' );
    assert.equal( QueryStringMachine.deepEquals( { x: [ { y: 'hello' }, true, 123, 'x' ] }, { x: [ true, { y: 'hello' }, true, 123, 'x' ] } ), false, 'object in array  inequality test' );
    assert.equal( QueryStringMachine.deepEquals( { x: [ { y: 'hello' }, true, 123, 'x' ] }, { y: [ { y: 'hello' }, true, 123, 'x' ] } ), false, 'object in array  inequality test' );
    assert.equal( QueryStringMachine.deepEquals( null, null ), true, 'null null' );
    assert.equal( QueryStringMachine.deepEquals( null, undefined ), false, 'null undefined' );
    assert.equal( QueryStringMachine.deepEquals( undefined, undefined ), true, 'undefined undefined' );
    assert.equal( QueryStringMachine.deepEquals( function() {}, function() {} ), false, 'different implementations of similar functions' );
    var f = function() {};
    assert.equal( QueryStringMachine.deepEquals( f, f ), true, 'same reference function' );
  } );

  QUnit.test( 'removeKeyValuePair', function( assert ) {
    assert.equal( QueryStringMachine.removeKeyValuePair( '?time=now', 'time' ), '', 'Remove single occurrence' );
    assert.equal( QueryStringMachine.removeKeyValuePair( '?time=now&place=here', 'time' ), '?place=here', 'Remove single occurrence but leave other' );
    assert.equal( QueryStringMachine.removeKeyValuePair( '?time=now&time=later', 'time' ), '', 'Remove multiple occurrences' );
    assert.equal( QueryStringMachine.removeKeyValuePair( '?place=here&time=now', 'time' ), '?place=here', 'Different order' );
    assert.equal( QueryStringMachine.removeKeyValuePair( '?time&place', 'time' ), '?place', 'Remove with no values' );
    assert.equal( QueryStringMachine.removeKeyValuePair( '?place&time', 'time' ), '?place', 'Remove with no values' );
  } );

  QUnit.test( 'appendQueryString', function( assert ) {

    var test = function( url, queryParameters, expected ) {
      assert.equal( QueryStringMachine.appendQueryString( url, queryParameters ), expected, url + ' + ' + queryParameters + ' should be ok' );
    };

    test( 'http://localhost.com/hello.html', '', 'http://localhost.com/hello.html' );
    test( 'http://localhost.com/hello.html', '?test', 'http://localhost.com/hello.html?test' );
    test( 'http://localhost.com/hello.html', '&test', 'http://localhost.com/hello.html?test' );
    test( 'http://localhost.com/hello.html?abc', '', 'http://localhost.com/hello.html?abc' );
    test( 'http://localhost.com/hello.html?abc', '?123', 'http://localhost.com/hello.html?abc&123' );
    test( 'http://localhost.com/hello.html?abc', '&123', 'http://localhost.com/hello.html?abc&123' );
  } );
} );