const name = 'easymap'

const message = msg => {
  return `[easymap]: ${msg}`
}

export default {
  error: msg => {
    throw new Error(message(msg))
  },
  warn: msg => {
    console.warn(message(msg))
  }
}