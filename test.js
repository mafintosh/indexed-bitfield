const tape = require('tape')
const bitfield = require('./')

tape('basic', function (t) {
  const bits = bitfield(1000)
  t.notOk(bits.get(0))
  t.ok(bits.set(0, true))
  t.notOk(bits.set(0, true))
  t.ok(bits.get(0))
  t.end()
})

tape('search', function (t) {
  const bits = bitfield(100000)

  bits.set(1, true)
  bits.set(4, true)
  bits.set(42, true)
  bits.set(10004, true)

  const ite = bits.iterator()

  t.same(ite.next(true), 1)
  t.same(ite.next(true), 4)
  t.same(ite.next(true), 42)
  t.same(ite.next(true), 10004)
  t.same(ite.next(true), -1)

  ite.seek(0)

  t.same(ite.next(false), 0)
  t.same(ite.next(false), 2)
  t.same(ite.next(false), 3)
  t.same(ite.next(false), 5)

  t.end()
})

tape('random bits (true)', function (t) {
  const bits = bitfield(100000)
  const set = []

  for (var i = 0; i < 50; i++) {
    const idx = bits.iterator().random(false)
    set.push(idx)
    t.notOk(bits.get(idx))
    bits.set(idx, true)
  }

  set.sort((a, b) => a - b)
  const ite = bits.iterator()

  while (set.length) {
    const i = ite.next(true)
    t.same(i, set.shift())
  }

  t.end()
})

tape('random bits (false)', function (t) {
  const bits = bitfield(100000)
  const set = []

  for (var j = 0; j < bits.length; j++) {
    bits.set(j, true)
  }

  for (var i = 0; i < 50; i++) {
    const idx = bits.iterator().random(true)
    set.push(idx)
    t.ok(bits.get(idx))
    bits.set(idx, false)
  }

  set.sort((a, b) => a - b)
  const ite = bits.iterator()

  while (set.length) {
    const i = ite.next(false)
    t.same(i, set.shift())
  }

  t.end()
})
