# Query String Machine
Query String Machine is a query string parser that supports type coercion, default values & validation.  No dependencies.

## Installation
Download [QueryStringMachine.js](blob/master/LICENSE) and include it with a script tag, like:
```html
<script src="QueryStringMachine.js"></script>
```

## Usage
After downloading and including QueryStringMachine, you can use it to obtain values from the query string.  Query String
Machine values can be obtained by calling `QueryStringMachine.get`, which supports the following types:

### boolean
Type: 'boolean' returns a primitive boolean value.  Note this of type boolean, not string.
```js

var audio = QueryStringMachine.get( 'audio', { type: 'boolean' } );

// http://localhost/test.html?audio=false   => audio===false
// http://localhost/test.html?audio=true    => audio===true
```

### flag
Type: 'flag' takes the boolean value true if and only if it is provided
```js

var audio = QueryStringMachine.get( 'audio', { type: 'flag' } );

// http://localhost/test.html            => audio===false
// http://localhost/test.html?audio      => audio===true
```

### number
Type: 'number' provides numeric values.  Note that for each type, a `defaultValue` can be provided. If `defaultValue` is
not provided, then that query parameter is required, or QueryStringMachine will error.
```js
var delay = QueryStringMachine.get( 'delay', { type: 'number', defaultValue: 1000 }};

// http://localhost/test.html            => delay===1000
// http://localhost/test.html?delay=123  => delay===123
```

### string
Type: 'string' provides values as strings:
```js
var name = QueryStringMachine.get( 'name', { type: 'string', defaultValue: 'Alice' }};

// http://localhost/test.html            => name==='Alice'
// http://localhost/test.html?name=Bob   => name==='Bob'
```

### array
Type: 'array' provides values as strings, using a nested element schema
```js
var words = QueryStringMachine.get( 'heights', { type: 'array', elementSchema: { type: 'string' } } };

// http://localhost/test.html?words=hello,there  => words===['hello', 'there']
// http://localhost/test.html?words=hi           => words===['hi']
```

### custom
By providing a `parse` function, you can support arbitrary types:

```js
var lower = QueryStringMachine.get( 'name', {
  parse: function( string ) {
    return string.toLowerCase();
  }
};

// http://localhost/test.html?name=Edward       => name==='edward'
```

## Allowed Values
Each type supports allowed values, which specifies an array of valid values, which are checked with `===`.

```js
var height = QueryStringMachine.get( 'height', {
  type: 'number',
  allowedValues: [ 4, 5, 6, 7, 8 ]
};

// http://localhost/test.html?height=123 => throws an Error
```

## Multiple Values

In addition to `QueryStringMachine.get`, you can use `QueryStringMachine.getAll` which provides multiple values at the same time:

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
      type: 'flag'
    },
    screens: {
      type: 'array',
      elementType: 'number',
      defaultValue: [],
      // separator can be overriden, defaults to ','
    }
  } )
```
returns the following results:

```js
// http://localhost/query-string-machine/test-query-string-machine.html
{
  "height": 6,
  "name": "Larry",
  "custom": "abc",
  "isWebGL": false,
  "screens": []
}

// http://localhost/query-string-machine/test-query-string-machine.html?height=7&isWebGL&wisdom=123
{
  "height": 7,
  "name": "Larry",
  "custom": "abc",
  "isWebGL": true,
  "screens": []
}

// http://localhost/query-string-machine/test-query-string-machine.html?height=7&isWebGL&wisdom=123&custom=DEF
{
  "height": 7,
  "name": "Larry",
  "custom": "def",
  "isWebGL": true,
  "screens": []
}

// http://localhost/query-string-machine/test-query-string-machine.html?height=0
Error( 'value not allowed: 0, allowedValues = 4,5,6,7,8' )

// http://localhost/query-string-machine/test-query-string-machine.html?isWebGL&screens=1,2,3,5
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

## Additional Features
Most use cases are covered by the preceding examples, but in some cases you will want to parse arbitrary strings or
check for the existence of a key.

### Parsing arbitrary strings
By default, Query String Machine parses the browser query string `window.location.search`.  It can also parse values from
provided strings like so:

```js
var text = QueryStringMachine.getForString( 'text', { type: 'string' }, '?text=hello' );
var queryParameters = QueryStringMachine.getAllForString( {
  name: {
    type: 'string'
  },
  age: {
    type: 'number',
    defaultValue: '0',
  }, '?name=Shirley&age=100' );
```

### Checking for the existence of a key

In some cases, it is only important to check for the existence of a key.  This can be done using Query String Machine like so:

```js
var containsAudioKey = QueryStringMachine.containsKey( 'audio' );
var queryParameters = QueryStringMachine.containsKeyForString( 'audio', '?mute' );
```

Launch test-query-string-machine.html for automated tests

## Copyright and License
QueryStringMachine is Copyright 2016-2018, University of Colorado Boulder and licensed under MIT