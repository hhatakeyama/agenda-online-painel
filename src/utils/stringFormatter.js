export const normalize = (str) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

export const stringCompare = (sentence, searchTerm) =>
  typeof sentence === 'string' &&
  typeof searchTerm === 'string' &&
  normalize(sentence).includes(normalize(searchTerm))

export const slugify = str =>
  str
    .toLowerCase()
    .trim()
    .replace(/[àÀáÁâÂãäÄÅåª]+/g, 'a') // Special Characters #1
    .replace(/[èÈéÉêÊëË]+/g, 'e')     // Special Characters #2
    .replace(/[ìÌíÍîÎïÏ]+/g, 'i')     // Special Characters #3
    .replace(/[òÒóÓôÔõÕöÖº]+/g, 'o')  // Special Characters #4
    .replace(/[ùÙúÚûÛüÜ]+/g, 'u')     // Special Characters #5
    .replace(/[ýÝÿŸ]+/g, 'y')       	// Special Characters #6
    .replace(/[ñÑ]+/g, 'n')       		// Special Characters #7
    .replace(/[çÇ]+/g, 'c')       		// Special Characters #8
    .replace(/[ß]+/g, 'ss')       		// Special Characters #9
    .replace(/[Ææ]+/g, 'ae')       		// Special Characters #10
    .replace(/[Øøœ]+/g, 'oe')       	// Special Characters #11
    .replace(/[%]+/g, 'pct')       		// Special Characters #12
    .replace(/\s+/g, '-')           	// Replace spaces with -
    .replace(/[^\w\-]+/g, '')       	// Remove all non-word chars
    .replace(/\-\-+/g, '-')         	// Replace multiple - with single -
    .replace(/^-+/, '')             	// Trim - from start of text
    .replace(/-+$/, '');            	// Trim - from end of text

export const capitalize = (value) => {
  const [firstLetter = '', ...rest] = `${value}`.trim()
  return typeof value === 'string'
    ? firstLetter.toUpperCase() + rest.join('').toLowerCase()
    : undefined
}