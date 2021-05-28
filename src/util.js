const ROUND_DECIMAL_PLACES = 10000 // 4 decimal places

const round = (num) =>
  Math.round((num + Number.EPSILON) * ROUND_DECIMAL_PLACES) /
  ROUND_DECIMAL_PLACES

const debug = (msg) => {
  if (window.DEBUG) {
    console.log(msg)
  }
}

export { round, debug }
