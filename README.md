# random-line-access [![stability][0]][1]
[![npm version][2]][3] [![build status][4]][5] [![test coverage][6]][7]
[![downloads][8]][9] [![js-standard-style][10]][11]

Provides random access to keyed lines of arbitrarily sized files. 

If you have a file larger than memory that you want to retrieve rows 
from at random, and your file happens to be structured such that the 
first word of each line can be regarded as a key for the entire line,
well, then this is what you've been looking for.


## Usage
huge.csv
```csv
example1,1,2,3,4
example2,hamburger,rango,,,martians
somemore,ozone,zone,zoneout
"wow complex",margarine,bananas,,,robot
```
example.js
```js
const randomLineAccess = require('random-line-access')

let rla = randomLineAccess('huge.csv', {sep: ','})

rla.ls(function(err, ls) {
  console.log(ls) // ['example1', 'example2', 'somemore', '"wow']
})

rla.get('example2', function(err, data) {
  console.log(data) // ['hamburger', 'rango', 'martians']
})

let rla = randomLineAccess('huge.csv', {sep: ','})
rla.get('example2', function(err, data) {
  console.log(data) // ['hamburger', 'rango', 'martians']
})


let rla = randomLineAccess('huge.csv')
rla.get('example1', function(err, data) {
  console.log(data) // '1,2,3,4'
})

let rla = randomLineAccess('huge.csv', {sep: ',', quotes: true})
rla.ls(function(err, ls) {
  console.log(ls) // ['example1', 'example2', 'somemore', 'wow complex']
})

rla.get('wow complex', function(err, data) {
  console.log(data) // ['margarine', 'bananas', 'robot']
})

rla.set('wow complex', ['molasses'], function(err, data) {
  console.log(data) // ['molasses']
})

rla.close()

```

## API
### randomLineAccess
* randomLineAccess(filePath, opts)
   **Careful: the set operator has write permission**


  Options include:
    - `omitEmpty` Expects a boolean, defaults to true. Removes empty values.
    - `quotes` Expects a boolean, defaults to false. Accepts quotes in the key value (IS IGNORED IN SEPARATED VALUES)
    - `sep` Expects a string. When provided, returns values seperated by the separator, and inserts arrays joined by seperator.

  Returns an instance. 

  But, if you are curious: what it does concretely is scan the provided file for line breaks, stores the offsets to each key, length of each line in a hash. On get, it uses these together to calculate and pluck the lines on request.

#### Instance
* `get(key, callback)`

  Takes a key and returns the value retrieved to the callback.

* `set(key, buffer, callback)` **Careful: the set operator has write permission, and no undo**

  Takes a key, and either a buffer or a string. If the resulting buffer from the string or buffer is
longer than the line in the document then this will raise an error. Dynamic reassignment of sizes is
not supported because the author did not need it, nor did the author know an easy way to implement
non-destructive insertion and efficient offset updates.

* `ls(callback)`

  Returns all keys found in the document. Remember, keys are assumed to be the first string in the beginning of each line in the document.

* `close(callback)`

  Closes the file.

## Installation
```sh
$ npm install random-line-access
```

## License
[MIT](https://tldrlegal.com/license/mit-license)

[0]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
[2]: https://img.shields.io/npm/v/random-line-access.svg?style=flat-square
[3]: https://npmjs.org/package/random-line-access
[4]: https://img.shields.io/travis/jdvorak/random-line-access/master.svg?style=flat-square
[5]: https://travis-ci.org/jdvorak/random-line-access
[6]: https://img.shields.io/codecov/c/github/jdvorak/random-line-access/master.svg?style=flat-square
[7]: https://codecov.io/github/jdvorak/random-line-access
[8]: http://img.shields.io/npm/dm/random-line-access.svg?style=flat-square
[9]: https://npmjs.org/package/random-line-access
[10]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[11]: https://github.com/feross/standard
