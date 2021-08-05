import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { BufferJSONCodec } from '../src/index.js'

test('encode/decode', () => {
  const obj = {
    string: 'test',
    number: 10,
    array: [{
      string: 'test'
    }],
    child: {
      string: 'test'
    },
    buf: Buffer.from('buf')
  }

  const codec = new BufferJSONCodec()

  const buf = codec.encode(obj)
  assert.instance(buf, Buffer)
  assert.is(buf.length, 113)

  const newObj = codec.decode(buf)
  assert.equal(newObj, obj)

  const buf2 = Buffer.from('test')
  assert.equal(codec.decode(codec.encode(buf2)), buf2)
})

test('offset', () => {
  const obj = {
    string: 'test'
  }

  const codec = new BufferJSONCodec()

  const length = codec.encodingLength(obj) + 4
  const buf = Buffer.alloc(length)
  buf.write('1234')
  const encoded = codec.encode(obj, buf, 4)
  const decoded = codec.decode(encoded, 4)
  assert.is(buf.slice(0, 4).toString(), '1234')
  assert.equal(decoded, obj)
})

test.run()
