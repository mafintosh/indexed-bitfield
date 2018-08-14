const wat = require('./bitfield')

module.exports = size => new Bitfield(size)

class Bitfield {
  constructor (size) {
    const mod = wat({
      imports: {
        console: {
          log: function (p, a) {
            console.log('debug:', p, a)
          }
        }
      }
    })

    this.buffer = Buffer.from(mod.memory.buffer)
    this.length = size

    this._exports = mod.exports

    var prev = Math.ceil(size / 64)
    var ptr = 4
    this.buffer.writeUInt32LE(0, 0)
    this.buffer.writeUInt32LE(prev * 8, 4)
    while (prev > 1) {
      prev = Math.ceil(prev / 64)
      this.buffer.writeUInt32LE(this.buffer.readUInt32LE(ptr) + prev * 8, ptr += 4)
    }
  }

  set (index, bit) {
    return this._exports.set(index) !== 0
  }

  get (index) {
    return this._exports.get(index) !== 0
  }

  iterator () {
    return new Iterator(this)
  }
}

class Iterator {
  constructor (bitfield) {
    this.length = bitfield.length
    this.index = 0

    this._exports = bitfield._exports
  }

  seek (index) {
    this.index = index
    return this
  }

  next (bit) {
    if (this.index >= this.length) return -1
    const i = this._exports.next_true(this.index)
    if (i === -1) return -1
    this.index = i + 1
    return i
  }
}
