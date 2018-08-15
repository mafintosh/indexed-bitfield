module.exports = size => new Bitfield(size)

const MASK = []
for (var i = 0; i < 32; i++) MASK[i] = Math.pow(2, 31 - i) - 1

class Bitfield {
  constructor (size) {
    if (!(size > 0)) throw new Error('Size must be > 0')

    this.buffer = new Uint32Array(Math.ceil(size / 32))
    this.length = size

    this._oneOne = [this.buffer]
    this._allOne = [this.buffer]

    while (true) {
      const prev = this._allOne[this._allOne.length - 1].length
      if (prev === 1) break
      const len = Math.ceil(prev / 32)
      this._oneOne.push(new Uint32Array(len))
      this._allOne.push(new Uint32Array(len))
    }
  }

  every (bit) {
    if (!bit) return this._oneOne[this._oneOne.length - 1][0] === 0

    var b = 0
    var i = this._allOne.length - 1

    while (i) {
      b = b * 32 + Math.clz32(~this._allOne[i--][b])
    }

    if (b >= this.buffer.length) return true
    return b * 32 + Math.clz32(~this._allOne[0][b]) >= this.length
  }

  some (bit) {
    return !this.every(!bit)
  }

  set (index, bit) {
    const r = index & 31
    const b = (index - r) / 32
    const prev = this.buffer[b]

    this.buffer[b] = bit ? (prev | (0x80000000 >>> r)) : (prev & ~(0x80000000 >>> r))

    const upd = this.buffer[b]
    if (upd === prev) return false

    this._updateAllOne(b, upd)
    this._updateOneOne(b, upd)

    return true
  }

  get (index) {
    const r = index & 31
    const b = (index - r) / 32

    return (this.buffer[b] & (0x80000000 >>> r)) !== 0
  }

  iterator () {
    return new Iterator(this)
  }

  _updateAllOne (b, upd) {
    for (var i = 1; i < this._allOne.length; i++) {
      const buf = this._allOne[i]
      const r = b & 31
      b = (b - r) / 32
      const prev = buf[b]
      buf[b] = upd === 0xffffffff ? (prev | (0x80000000 >>> r)) : (prev & ~(0x80000000 >>> r))
      upd = buf[b]
      if (upd === prev) break
    }
  }

  _updateOneOne (b, upd) {
    for (var i = 1; i < this._oneOne.length; i++) {
      const buf = this._oneOne[i]
      const r = b & 31
      b = (b - r) / 32
      const prev = buf[b]
      buf[b] = upd !== 0 ? (prev | (0x80000000 >>> r)) : (prev & ~(0x80000000 >>> r))
      upd = buf[b]
      if (upd === prev) break
    }
  }
}

class Iterator {
  constructor (bitfield) {
    this.index = 0
    this.length = bitfield.length
    this._oneOne = bitfield._oneOne
    this._allOne = bitfield._allOne
  }

  next (bit) {
    return bit ? this.nextTrue() : this.nextFalse()
  }

  seek (index) {
    this.index = index
    return this
  }

  random (bit) {
    const index = this.index
    const i = this.seek(index + Math.floor(Math.random() * (this.length - index))).next(bit)
    return i === -1 ? this.seek(index).next(bit) : i
  }

  nextTrue () {
    if (this.index >= this.length) return -1

    var r = this.index & 31
    var b = (this.index - r) / 32
    var mask = 0xffffffff >>> r

    for (var i = 0; i < this._oneOne.length; i++) {
      const clz = Math.clz32(this._oneOne[i][b] & mask)
      if (clz !== 32) return this._downLeftTrue(i, b, clz)
      r = b & 31
      b = (b - r) / 32
      mask = MASK[r]
    }

    return -1
  }

  nextFalse () {
    if (this.index >= this.length) return -1

    var r = this.index & 31
    var b = (this.index - r) / 32
    var mask = 0xffffffff >>> r

    for (var i = 0; i < this._allOne.length; i++) {
      const clz = Math.clz32((~this._allOne[i][b]) & mask)
      if (clz !== 32) return this._downLeftFalse(i, b, clz)
      r = b & 31
      b = (b - r) / 32
      mask = MASK[r]
    }

    return -1
  }

  _downLeftFalse (i, b, clz) {
    while (i) {
      b = b * 32 + clz
      clz = Math.clz32(~this._allOne[--i][b])
    }

    b = b * 32 + clz
    if (b >= this.length) return -1

    this.index = b + 1
    return b
  }

  _downLeftTrue (i, b, clz) {
    while (i) {
      b = b * 32 + clz
      clz = Math.clz32(this._oneOne[--i][b])
    }

    b = b * 32 + clz
    this.index = b + 1
    return b
  }
}
