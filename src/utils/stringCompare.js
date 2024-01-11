export const normalize = (str) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const stringCompare = (sentence, searchTerm) =>
  typeof sentence === 'string' &&
  typeof searchTerm === 'string' &&
  normalize(sentence).includes(normalize(searchTerm))

export default stringCompare
