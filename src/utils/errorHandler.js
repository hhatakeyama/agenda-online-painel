export default function errorHandler(error) {
  let fieldErrors = []
  let fields = []

  const errorCheck = (errors) => {
    if (!!errors && typeof errors === 'object' && !Array.isArray(errors)) {
      const keys = Object.keys(errors)
      if (!keys.length) return
      keys.forEach(key => {
        if (Array.isArray(errors[key])) {
          fields = [...fields, key]
          fieldErrors = [...fieldErrors, ...errors[key]]
        } else {
          errorCheck(errors[key])
        }
      })
    }
    return null
  }

  errorCheck(error)

  fieldErrors = fieldErrors.filter(err => typeof err === 'string')
  fields = fields.filter(err => typeof err === 'string')

  const stringFilter = (string, index, array) =>
    index === array.findIndex((item) => item === string)

  return {
    messages: [...fieldErrors].filter(stringFilter) || null,
    fields: fields.filter(stringFilter)
  }
}
