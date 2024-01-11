const SESSION_KEY = '@gatacompleta-cms/'

export const removeSession = (name) => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(`${SESSION_KEY}${name}`)
  }
}

export const getSession = (name, isString = false) => {
  if (typeof window !== 'undefined') {
    const sessionValue = sessionStorage.getItem(`${SESSION_KEY}${name}`)
    if (isString) {
      return sessionValue || ''
    }
    return sessionValue ? JSON.parse(sessionValue) : ''
  }
  return null
}

export const setSession = (name, value) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(`${SESSION_KEY}${name}`, JSON.stringify(value))
  }
}
