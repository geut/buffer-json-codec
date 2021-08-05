import varint from 'varint'

function iterate (x, decode) {
  const type = Object.prototype.toString.call(x)

  let tmp, k

  if (type === '[object Object]') {
    tmp = {}
    for (k in x) {
      tmp[k] = iterate(x[k], decode)
    }
    return tmp
  }

  if (type === '[object Array]') {
    k = x.length
    for (tmp = Array(k); k--;) {
      tmp[k] = iterate(x[k], decode)
    }
    return tmp
  }

  if (decode) {
    if (type === '[object String]' && x.startsWith('base64:')) return Buffer.from(x.slice('base64:'.length), 'base64')
  } else {
    if (type === '[object Uint8Array]') return 'base64:' + Buffer.from(x).toString('base64')
  }

  return x
}

export class BufferJSONCodec {
  constructor () {
    this._lastObj = null
    this._lastStr = null
    this._lastLength = null
  }

  encode (obj, buf, offset = 0) {
    if (Buffer.isBuffer(obj)) {
      buf = buf || Buffer.allocUnsafe(obj.length + 1)
      varint.encode(1, buf, offset)
      obj.copy(buf, offset + varint.encode.bytes)
      return buf
    }

    let str
    let strLength

    if (this._lastObj === obj) {
      str = this._lastStr
      strLength = this._lastLength
    } else {
      str = JSON.stringify(iterate({ data: obj }))
      strLength = Buffer.byteLength(str, 'utf8')
    }

    const bufferLength = strLength + 1

    buf = buf || Buffer.allocUnsafe(bufferLength)
    varint.encode(0, buf, offset)
    buf.write(str, offset + varint.encode.bytes, strLength, 'utf8')
    this._lastObj = null
    this._lastStr = null
    this._lastLength = null
    return buf
  }

  decode (buf, start = 0, end = buf.length) {
    start = start || 0
    end = end || buf.length
    buf = buf.slice(start, end)
    const isBuffer = varint.decode(buf) === 1
    buf = buf.slice(varint.decode.bytes)
    if (isBuffer) return buf
    return iterate(JSON.parse(buf), true).data
  }

  encodingLength (obj) {
    if (Buffer.isBuffer(obj)) return obj.length + 1
    this._lastObj = obj
    this._lastStr = JSON.stringify(iterate({ data: obj }))
    this._lastLength = Buffer.byteLength(this._lastStr, 'utf8')
    return this._lastLength + 1
  }
}
