const bits = require('./')(1e8)

const ite = bits.iterator()

const start = Date.now()
const idx = bits.length - 1

bits.set(idx, true) // worst case bit

for (var i = 0; i < bits.length; i++) {
  if (ite.seek(0).next(true) !== idx) throw new Error('Error!')
}

console.log(Math.round(bits.length / (Date.now() - start)) + ' searches/ms')
