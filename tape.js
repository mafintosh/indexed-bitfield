var tape = require('tape')
var bitfield = require('./')

tape('set and get', function (t) {
  var bits = bitfield()

  t.same(bits.get(1), false)
  t.same(bits.set(1, true), true)
  t.same(bits.set(1, true), false)
  t.same(bits.get(1), true)
  t.same(bits.get(0), false)

  t.end()
})

tape('indexOf one value', function (t) {
  var bits = bitfield()

  bits.set(100000, true)

  t.same(bits.indexOf(true), 100000)
  t.same(bits.indexOf(true, 100000), 100000)
  t.same(bits.indexOf(true, 100001), -1)
  t.same(bits.indexOf(false), 0)
  t.same(bits.indexOf(false, 100000), 100001)

  t.end()
})

tape('indexOf more values', function (t) {
  var bits = bitfield()

  bits.set(1, true)
  bits.set(100000, true)
  bits.set(1000001, true)

  t.same(bits.indexOf(true), 1)
  t.same(bits.indexOf(true, 2), 100000)
  t.same(bits.indexOf(true, 100001), 1000001)
  t.same(bits.indexOf(true, 1000002), -1)

  t.end()
})

tape('every', function (t) {
  var bits = bitfield()

  bits.set(1, true)
  bits.set(2, true)

  t.same(bits.every(true, 0, 10), false)
  t.same(bits.every(true, 1, 3), true)

  t.end()
})
