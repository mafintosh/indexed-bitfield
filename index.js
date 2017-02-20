var bitfield = require('sparse-bitfield')
var flat = require('flat-tree')

module.exports = SkipIndex

function SkipIndex (opts) {
  if (!(this instanceof SkipIndex)) return new SkipIndex(opts)

  this.bitfield = bitfield(opts)
  this._cursor = this.cursor()
}

SkipIndex.prototype.set = function (i, value) {
  i *= 2

  var len = this.bitfield.length

  if (!this.bitfield.set(i, value)) return false

  var skippable = this.bitfield.get(flat.sibling(i)) === value
  var parent = flat.parent(i)

  while (skippable) {
    if (!this.bitfield.set(parent, false)) break
    skippable = this._skippable(flat.sibling(parent), value)
    parent = flat.parent(parent)
  }

  this._notSkippable(parent)
  if (len !== this.bitfield.length) this._expandRoots(len)

  return true
}

SkipIndex.prototype.get = function (i) {
  return this.bitfield.get(2 * i)
}

SkipIndex.prototype.every = function (val, start, end) {
  if (end === 0) return false
  if (!end) end = this.bitfield.length

  var i = this.indexOf(!val, start)
  if (i === -1) i = this.bitfield.length
  return i >= end
}

SkipIndex.prototype.some = function (val, start, end) {
  return !this.every(!val, start, end)
}

SkipIndex.prototype.indexOf = function (value, offset) {
  return this._cursor.seek(offset || 0).next(value)
}

SkipIndex.prototype.cursor = function () {
  return new Cursor(this)
}

SkipIndex.prototype._expandRoots = function (length) {
  var roots = flat.fullRoots(length)
  for (var i = 0; i < roots.length; i++) {
    if (this._skippable(roots[i], true)) this._notSkippable(flat.parent(roots[i]))
  }
}

SkipIndex.prototype._notSkippable = function (tree) {
  while ((tree < this.bitfield.length || flat.leftSpan(tree)) && this.bitfield.set(tree, true)) {
    tree = flat.parent(tree)
  }
}

SkipIndex.prototype._skippable = function (tree, skipValue) {
  // tree should be an odd number (parent)
  if (tree >= this.bitfield.length) return false
  if (this.bitfield.get(tree)) return false
  return this.bitfield.get(flat.leftSpan(tree)) === skipValue
}

function Cursor (index) {
  this.index = index
  this.offset = 0
}

Cursor.prototype.nextTrue = function () {
  return this.next(true)
}

Cursor.prototype.nextFalse = function () {
  return this.next(false)
}

Cursor.prototype.seek = function (pos) {
  this.offset = 2 * pos
  return this
}

Cursor.prototype.next = function (value) {
  while (true) {
    if (this.offset >= this.index.bitfield.length) return -1

    if (this.index.bitfield.get(this.offset) === value) {
      this.offset += 2
      return (this.offset - 2) / 2
    }

    var skip = this.offset
    var parent = flat.parent(skip)

    while (this.index._skippable(parent, !value)) {
      skip = parent
      parent = flat.parent(skip)
    }

    this.offset = flat.rightSpan(skip) + 2
  }
}
