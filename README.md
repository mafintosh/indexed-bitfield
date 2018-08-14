# indexed-bitfield

Indexed bitfield that allows you to search for bits efficiently

```
npm install indexed-bitfield
```

## Usage

``` js
const bitfield = require('indexed-bitfield')

// allocate a bitfield with one billion bits
const bits = bitfield(1e9)

// set bit number one million to true
bits.set(1000000, true)

// returns true
console.log(bits.get(10000000))

const ite = bits.iterator()

// returns 10000000
console.log(ite.next(true))

// returns -1 (no more true bits)
console.log(ite.next(true))
```

## API

#### `bits = bitfield(maxBits)`

Make a new bitfield. Can contain at max `maxBits` bits.

Will in total use `32/248 * maxBits` bytes of memory (so indexing 1.000.000 bits take up roughly 100kb of memory).

#### `updated = bits.set(index, bit)`

Set an index to `true` or `false`. Returns `true` if the underlying bit was flipped
and `false` if it was already set to `bit`.

This operation runs in `O(log32(bitfield.length))` time worst case but often in `O(1)`.


#### `bit = bits.get(index)`

Get the bit at index.

This operation runs in `O(1)`.

#### `bits.length`

The length (or max amount of bits) of the bitfield.

#### `iterator = bits.iterator()`

Create a bit iterator.

#### `index = iterator.next(bit)`

Return the next index `bit` is stored at.
If none found `-1` is returned.

This operation runs in `O(log32(bitfield.length))` time.

#### `iterator.seek(index)`

Move the iterator to a specific index.

This operation runs in `O(1)` time.

#### `iterator.random(bit)`

Returns the position of a random bit of value `bit` (after the current `seek` index)

## Performance

The bitfield index works by using `Math.clz32` to count how many leading zeros bytes per 32 bit integer
and builds a bit search tree using that. The tree is very compact as it only needs one bit of index
per 32 bits of data per level in the tree. This also makes all search operation runs in log32 time.

There is a benchmark included that searches for a single true bit in a 100.000.000 length bitfield.

On my machine (Dell XPS) it returns the following: (YMVV)

```
npm run bench
30211 searches/ms
```

(or roughly 3.000.000 searches per second)

## License

MIT
