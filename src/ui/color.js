const RGBA_REGEX = /^rgba\((\d+),[ ]?(\d+),[ ]?(\d+), [ ]?[\d\.]+\)$/
const RGB_REGEX = /^rgb\((\d+),[ ]?(\d+),[ ]?(\d+)\)$/

const getRGBA = (rgba) => {
  let match = RGBA_REGEX.exec(rgba)
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
      a: parseFloat(match[4]),
    }
  }
  match = RGB_REGEX.exec(rgba)
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
      a: 1,
    }
  }
}

const toColor = ({ r, g, b, a }) => `rgba(${r},${g},${b},${a})`

export { getRGBA, toColor }
