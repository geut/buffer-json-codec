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
  assert.is(buf.length, 112)

  const newObj = codec.decode(buf)
  assert.equal(newObj, obj)
})

test.run()
