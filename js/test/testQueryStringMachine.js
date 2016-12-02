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

    assert.deepEqual( QueryStringMachine.getAllForString( '', schemaMap ), {
      'height': 6,
      'name': 'Larry',
      'custom': 'abc',
      'isWebGL': false,
      'screens': [],
      'colors': [ 'red', 'green', 'blue' ]
    }, 'A blank query string should provide defaults' );

    assert.deepEqual( QueryStringMachine.getAllForString( '?height=7&isWebGL', schemaMap ), {
      'height': 7,
      'name': 'Larry',
      'custom': 'abc',
      'isWebGL': true,
      'screens': [],
      'colors': [ 'red', 'green', 'blue' ]
    }, 'Query parameter values should be parsed' );

    assert.deepEqual( QueryStringMachine.getAllForString( '?height=7&isWebGL&custom=DEF', schemaMap ), {
      'height': 7,
      'name': 'Larry',
      'custom': 'def',
      'isWebGL': true,
      'screens': [],
      'colors': [ 'red', 'green', 'blue' ]
    }, 'Custom query parameter should be supported' );

    assert.deepEqual( QueryStringMachine.getAllForString( '?isWebGL&screens=1,2,3,5&colors=yellow,orange,pink', schemaMap ), {
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

    }, 'Catch missing required query parameter' );

    assert.deepEqual( QueryStringMachine.getForString( '?ea&hello=1,2,3', 'hello', {
      type: 'array',
      elementSchema: {
        type: 'number'
      },
      validValues: [
        [ 1, 2 ], [ 3, 4 ], [ 1, 2, 3 ]
      ],
      defaultValue: [ 1, 2 ]
    } ), [ 1, 2, 3 ], 'Arrays should support defaultValue and validValues' );

    assert.throws( function() {
      QueryStringMachine.getForString( '?ea&hello=1,2,3,99', 'hello', {
        type: 'array',
        elementSchema: {
          type: 'number'
        },
        validValues: [
          [ 1, 2 ], [ 3, 4 ], [ 1, 2, 3 ]
        ],
        defaultValue: [ 1, 2 ]
      } );
    }, 'Catch invalid value for array' );

    assert.deepEqual( QueryStringMachine.getForString( '?screens=1,2,3', 'screens', {
      type: 'array',
      elementSchema: {
        type: 'number'
      },
      defaultValue: null
    } ), [ 1, 2, 3 ], 'Test array of numbers' );

    // Tests for our own deepEquals method
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
  } );
})();