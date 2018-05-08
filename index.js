var fs = require('fs')
var raf = require('random-access-file')
var split = require('binary-split')
var pump = require('pump')
var xtend = require('xtend')

module.exports = randomLineAccess

const standardOpts = {omitEmpty: true}

function randomLineAccess (path, opts) {
  const NEWLINE_LENGTH = new Buffer('\n').length
  opts = xtend(standardOpts, opts) || standardOpts
  var lineLengths = []
  var queue = []
  var indices = {}
  var ready = false
  var fr = raf(path)
  var api = {
    get: get,
    set: set,
    ls: ls,
    close: fr.close
  }

  var source = fs.createReadStream(path)
  var dest = split()

  dest.on('data', function (buffer) {
    var snippet = buffer.slice(0,1000).toString()
    var key = snippet.split(opts.sep || /\s{1,}/)[0]
    var objKey = key
    let isQuote = false

    if (opts.quotes && key[0].match(/^("|')/)) {
      key = snippet.match(/^(("|').+("|'))/)[0]
      objKey = key.slice(1, key.length-1)
    }

    var offset = (lineLengths[lineLengths.length-1] || 0)

    indices[objKey] = {key: key, offset: offset , size: buffer.length} 
    lineLengths.push(offset + buffer.length + NEWLINE_LENGTH)
  })

  pump(source, dest, function() {
    ready = true
    for (var i = 0; i < queue.length; i++) {
      let enqueued = queue.pop()
      api[enqueued[0]](enqueued[2], enqueued[3], enqueued[4])
    }
  })

  function get (key, res) {
    if (!ready) {
      queue.push(['get', this, key, res])
      return
    }
    if (!indices[key]) return res(new Error("Key does not exist."))
    fr.read(indices[key].offset, indices[key].size, function (err, buffer) {
      var vectors = []
      var line = opts.raw ? buffer : buffer.toString()
      var keyLen = new Buffer(indices[key].key.trim() + (opts.sep || ' ')).length
      line = line.slice(keyLen)
      if (!opts.raw && opts.sep) {
        //TODO: SUPPORT QUOTES
        line = line.split(opts.sep).map((ea)=>ea.trim())
        if (opts.omitEmpty) {
          line = line.filter((ea)=>ea)
        }
      }
      res(null, line)
    })
  }

  function ls (res){
    if (!ready) {
      queue.push(['ls', this, res])
      return
    }
    res(null, Object.keys(indices))
  }

  function set (key, buffer, res) {
    if (!ready) {
      queue.push(['set', this, key, buffer, res])
      return
    }
    if (opts.sep && buffer instanceof Array) {
      buffer = buffer.join(opts.sep)
    } 
    if (!(buffer instanceof Buffer)) {
      buffer = new Buffer(buffer)
    }

    if (!indices[key]) return res(new Error("Key does not exist: random-line-access does not support adding additional lines at this time. Submit a Pull-Request if you have a clever way to handle this efficiently."))
    let keyBuffer = new Buffer(indices[key].key.trim() + ' ')
    if (indices[key].size < (keyBuffer.length + buffer.length )) {
      return res(new Error("Unsupported insertion: random-line-access does not support expanding-contracting of lines at this time. Submit a Pull-Request if you have a clever way to handle this efficiently."))
    }
    let fillerBuffer = new Buffer(indices[key].size - (keyBuffer.length + buffer.length)).fill(' ')
    let fullBuffer = Buffer.concat([keyBuffer, buffer, fillerBuffer])
    
    fr.write(indices[key].offset, fullBuffer, function (err) {
      if (err) return res(err, false)
      res(null, true)
    })
  }

  return api
}

