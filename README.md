# indexed-bitfield

A bitfield that supports fast `.indexOf(bool)` and other array like operations

```
npm install indexed-bitfield
```

## Usage

``` js
var bitfield = require('indexed-bitfield')
var bits = bitfield()

bits.set(1000000, true)
bits.set(5000000, true)

console.log(bits.indexOf(false)) // returns  0
console.log(bits.indexOf(true)) // returns 1000000
console.log(bits.indexOf(true, 1000001)) // returns 5000000
console.log(bits.indexOf(true, 5000001)) // returns -1
```

The `indexOf` operator runs in `O(log(bitfieldLength))`.

For every bit stored the indexed bitfield uses another bit to index this value.
The index looks like this

```
index bits  :         0
            :     0       0
            :   0   0   0   0
stored bits :  0 0 0 0 0 0 0 0
```

If an index bit is `0` then all bits in the tree below it are the same, otherwise the index bit is `1`.

For example this is a bitfield where bit 3 and 4 are set to `1`.

```
index bits  :         1
            :     1       0
            :   0   0   0   0
stored bits :  0 0 1 1 0 0 0 0
```

## API

#### `var bits = bitfield([options])`

Create a new indexed bitfield. Options are forwarded to the [sparse-bitfield](https://github.com/mafintosh/sparse-bitfield) constructor.

#### `bits.bitfield`

A [sparse-bitfield](https://github.com/mafintosh/sparse-bitfield) instance that will store the bits and index.

#### `var updated = bits.set(index, bool)`

Update a value in the bitfield. `updated` will be set to `true` if the bitfield was updated and `false` if `index` was already set to `bool`.

Runs in `O(log(bitfieldLength))` time.

#### `var bool = bits.get(index)`

Get a value from the bitfield.

Runs in `O(1)` time.

#### `var index = bits.indexOf(bool, [offset])`

Find a value in the bitfield.

Returns `-1` if it could not be found. Optionally you can set `offset` to the index you wanna start searching at.

Runs in `O(log(bitfieldLength))` time.

#### `var bool = bits.every(bool, start, end)`

Check if a range in the bitfield only contains a specific bool.

Runs in `O(log(bitfieldLength))` time.

#### `var bool = bits.some(bool, start, end)`

Check if a range in the bitfield contains at least one specific bool.

Runs in `O(log(bitfieldLength))` time.

## License

MIT
