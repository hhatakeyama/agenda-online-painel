const capitalize = (value) => {
  const [firstLetter = '', ...rest] = `${value}`.trim()
  return typeof value === 'string'
    ? firstLetter.toUpperCase() + rest.join('').toLowerCase()
    : undefined
}

export default capitalize
