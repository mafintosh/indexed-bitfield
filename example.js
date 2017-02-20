var bits = require('./')()

bits.set(1024, true)
bits.set(100000, true)
bits.set(10000000000, true)

var i = -1

while (true) {
  i = bits.indexOf(true, i + 1)
  if (i === -1) break
  console.log('bits.get(' + i + ') === true')
}
