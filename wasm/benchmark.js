const bits = require('./')(1e8)

const ite = bits.iterator()

const start = Date.now()
//const idx = bits.length - 1
//bits.set(idx, true)

for (var i = 0; i < 100000000; i++) {
  bits.set(bits.length - 1 - i, true)
  if (ite.seek(0).next(true) !== bits.length - 1 - i) throw new Error('Error!')
}

console.log(Math.round(bits.length / (Date.now() - start)), 'search/ms')
