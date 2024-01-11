import dayjs from 'dayjs'

const defaultOptions = {
  format: undefined,
  display: {
    date: 'DD/MM/YYYY',
    time: 'HH:mm',
    datetime: 'DD/MM/YYYY HH:mm'
  }
}

export function displayer(inputDayjs, options) {
  if (!dayjs.isDayjs(inputDayjs)) { return { date: undefined, time: undefined, datetime: undefined } }

  if (!options) {
    options = defaultOptions
  }

  return {
    date: inputDayjs.format(options.display.date),
    time: inputDayjs.format(options.display.time),
    datetime: inputDayjs.format(options.display.datetime)
  }
}

function response(input, raw, options) {
  const { format } = options

  return { input, output: raw.format(format), raw, display: displayer(raw, options) }
}

function isDate(value) {
  try {
    // If you call a Date method, like .valueOf(),
    // with a "this" value that's anything
    // other than a Date, a TypeError is thrown.
    Date.prototype.valueOf.call(value)
    return true
  } catch (error) {
    if (error instanceof TypeError) {
      return false
    }
    throw error
  }
}

export function datter(input, options = defaultOptions) {
  const inputIsDayjs = dayjs.isDayjs(input)
  const inputIsDate = isDate(input)
  const inputIsString = typeof input === 'string'

  if (!options) throw Error('Options is mandatory for datter')

  const mergedOptions = { ...defaultOptions, ...options }
  const { format } = mergedOptions

  if (input === undefined) {
    const raw = dayjs()

    return response(raw.format(), raw, mergedOptions)
  }

  if (inputIsDayjs) {
    const raw = input

    return response(input, raw, mergedOptions)
  }

  if (inputIsDate) {
    const raw = dayjs(input)

    return response(input, raw, mergedOptions)
  }

  if (inputIsString) {
    const raw = dayjs(input, format)

    return response(input, raw, mergedOptions)
  }

  return { input, output: null, raw: null, display: displayer(input, mergedOptions) }
}

export const dateToHuman = (date) => {
  const dateObject = new Date(date)
  return new Intl.DateTimeFormat('pt-BR', {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZone: 'UTC',
  }).format(dateObject)
}
