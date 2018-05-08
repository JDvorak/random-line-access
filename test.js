const test = require('tape')
const fs = require('fs')
const rla = require('./')

function trim (s) {
  if (!/^\r?\n/.test(s)) return s
  return deindent(s).trim()
}

function deindent (s) {
  if (!/^\r?\n/.test(s)) return s
  var indent = (s.match(/\n([ ]+)/m) || [])[1] || ''
  s = indent + s
  return s.split('\n')
    .map(l => replace(indent, l))
    .join('\n')
}

function replace (prefix, line) {
  return line.slice(0, prefix.length) === prefix ? line.slice(prefix.length) : line
}

test('should retrieve lines by key defined in the first word', function (t) {
  t.plan(7)
  fs.writeFileSync('test.txt', trim(`
    example 2 3 4 5 6
    another 1 2 3 4 cat
    third mango pinata long string  another
    "bafloon mango" george chai
  `))
  let rl = rla('test.txt')
  rl.get('example', function (err, str) {
    t.equal(str, '2 3 4 5 6')
    rl.get('another', function (err, str) {
      t.equal(str, '1 2 3 4 cat', 'failed to retrieve string with text')
      rl.get('third', function (err, str) {
        t.equal(str, 'mango pinata long string  another')
        rl.get('"bafloon mango"', function (err, str) {
          t.error()
          rl.ls(function (err, keys) {
            t.deepEqual(keys, ['example', 'another', 'third', '"bafloon'])
            var newValue = 'hippy hooperango'
            rl.set('third', newValue, function (err, ok) {
              t.ok(ok)
              rl.get('third', function (err, value) {
                t.equal(value.trim(), newValue)
              })
            })
          })
        })
      })
    })
  })
})

test('should retrieve lines from csv sets as well', function (t) {
  t.plan(7)
  fs.writeFileSync('test.txt', trim(`
    example,2,3,4,5,6
    another,1,2,3,4,cat
    third,mango,pinata,long,string,,another
    "bafloon mango",george,chai,,,
  `))
  let rl = rla('test.txt', {sep: ',', quotes: true})
  rl.get('example', function (err, str) {
    t.deepEqual(str, ['2', '3', '4', '5', '6'])
    rl.get('another', function (err, str) {
      t.deepEqual(str, ['1', '2', '3', '4', 'cat'], 'failed to retrieve string with text')
      rl.get('third', function (err, str) {
        t.deepEqual(str, ['mango', 'pinata', 'long', 'string','another'])
        rl.get('bafloon mango', function (err, str) {
          t.deepEqual(str, ['george', 'chai'])
          rl.ls(function (err, keys) {
            t.deepEqual(keys, ['example', 'another', 'third', 'bafloon mango'])
            var newValue = ['hippy', 'hooperango']
            rl.set('third', newValue, function (err, ok) {
              t.ok(ok)
              rl.get('third', function (err, value) {
                t.deepEqual(value, newValue)
              })
            })
          })
        })
      })
    })
  })
})

test('should retrieve lines by key defined in the first word, including those wrapped in quotes', function (t) {
  t.plan(7)
  fs.writeFileSync('test.txt', trim(`
    'example' 2 3 4 5 6
    "another" 1 2 3 4 cat
    "third" mango pinata long string  another
    "bafloon mango" george chai
  `))
  let rl = rla('test.txt', {quotes: true})
  rl.get('example', function (err, str) {
    t.equal(str, '2 3 4 5 6')
    rl.get('another', function (err, str) {
      t.equal(str, '1 2 3 4 cat', 'failed to retrieve string with text')
      rl.get('third', function (err, str) {
        t.equal(str, 'mango pinata long string  another')
        rl.get('bafloon mango', function (err, str) {
          t.equal(str, 'george chai')
          rl.ls(function (err, keys) {
            t.deepEqual(keys, ['example', 'another', 'third', 'bafloon mango'])
            var newValue = 'hippy hooperango'
            rl.set('third', newValue, function (err, ok) {
              t.ok(ok)
              rl.get('third', function (err, value) {
                t.equal(value.trim(), newValue)
              })
            })
          })
        })
      })
    })
  })
})

test('should retrieve lines as space separated sets', function (t) {
  t.plan(7)
  fs.writeFileSync('test.txt', trim(`
    example 2 3 4 5 6
    another 1 2 3 4 cat
    third mango pinata long string  another
    "bafloon mango" george chai
  `))
  let rl = rla('test.txt', {sep: ' ', quotes: true})
  rl.get('example', function (err, str) {
    t.deepEqual(str, ['2', '3', '4', '5', '6'])
    rl.get('another', function (err, str) {
      t.deepEqual(str, ['1', '2', '3', '4', 'cat'], 'failed to retrieve string with text')
      rl.get('third', function (err, str) {
        t.deepEqual(str, ['mango', 'pinata', 'long', 'string', 'another'])
        rl.get('bafloon mango', function (err, str) {
          t.deepEqual(str, ['george', 'chai'])
          rl.ls(function (err, keys) {
            t.deepEqual(keys, ['example', 'another', 'third', 'bafloon mango'])
            var newValue = ['hippy', 'hooperango']
            rl.set('third', newValue, function (err, ok) {
              t.ok(ok)
              rl.get('third', function (err, value) {
                t.deepEqual(value, newValue)
              })
            })
          })
        })
      })
    })
  })
})
