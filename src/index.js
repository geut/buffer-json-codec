function iterate (x, decode) {
  if (typeof x !== 'object') {
    if (decode && Object.prototype.toString.call(x) === '[object String]' && x.startsWith('base64:')) {
      return Buffer.from(x.slice('base64:'.length), 'base64')
    }
    return x
  }

  let k
  let tmp
  const type = Object.prototype.toString.call(x)

  if (!decode && type === '[object Uint8Array]' && Buffer.isBuffer(x)) {
    return 'base64:' + Buffer.from(x).toString('base64')
  }

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

  return x
}

export class BufferJSONCodec {
  encode (obj) {
    const str = JSON.stringify(iterate({ data: obj }))
    return Buffer.from(str, 'utf-8')
  }

  decode (buf) {
    return iterate(JSON.parse(buf), true).data
  }
}
