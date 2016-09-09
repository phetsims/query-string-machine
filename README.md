# query-string-machine
Query String parser that supports type coercion, defaults, error checking, etc. based on a schema.

For example:
```js
QueryStringMachine.getAll( {
    height: {
      type: 'number',
      defaultValue: 6,
      allowedValues: [ 4, 5, 6, 7, 8 ]
    },
    name: {
      type: 'string',
      defaultValue: 'Larry',
      validate: function( str ) {
        assert && assert( str.indexOf( 'Z' ) !== 0, 'Name cannot start with Z: ' + str );
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
      type: 'flag'  // If no equals sign, then presence indicates true
                    // If there is an equals sign, then parse string as boolean
    },
    screens: {
      type: 'array',
      elementType: 'number',
      defaultValue: [],
      separator: ',' // such as ?screens=1,2,3.  http://stackoverflow.com/questions/2366260/whats-valid-and-whats-not-in-a-uri-query says go for commas
    }
  } )
```
returns the following results:

```
http://localhost/query-string-machine/test-query-string-machine.html
{
  "height": 6,
  "name": "Larry",
  "custom": "abc",
  "isWebGL": false,
  "screens": []
}

http://localhost/query-string-machine/test-query-string-machine.html?height=7&isWebGL&wisdom=123
{
  "height": 7,
  "name": "Larry",
  "custom": "abc",
  "isWebGL": true,
  "screens": []
}

http://localhost/query-string-machine/test-query-string-machine.html?height=7&isWebGL&wisdom=123&custom=DEF
{
  "height": 7,
  "name": "Larry",
  "custom": "def",
  "isWebGL": true,
  "screens": []
}

http://localhost/query-string-machine/test-query-string-machine.html?height=0
value not allowed: 0, allowedValues = 4,5,6,7,8

http://localhost/query-string-machine/test-query-string-machine.html?isWebGL&screens=1,2,3,5
{
  "height": 6,
  "name": "Larry",
  "custom": "abc",
  "isWebGL": true,
  "screens": [
    1,
    2,
    3,
    5
  ]
}
```

QueryStringMachine is Copyright 2016, University of Colorado Boulder and licensed under MIT

Sam Reid
PhET Interactive Simulations
September 9, 2016