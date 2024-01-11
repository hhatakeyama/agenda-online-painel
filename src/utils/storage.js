const STORAGE_KEY = '@gatacompleta-cms/'

export const getStorage = (name, isString = false) => {
  if (typeof localStorage !== 'undefined') {
    const storageItem = localStorage.getItem(STORAGE_KEY + name)
    if (storageItem) {
      if (isString) {
        return storageItem
      }
      return JSON.parse(storageItem)
    }
    return null
  }
  return null
}

export const getAsyncStorage = async (name, isString = false) => {
  if (typeof localStorage !== 'undefined') {
    const storageItem = await localStorage.getItem(STORAGE_KEY + name)
    if (storageItem) {
      if (isString) {
        return storageItem
      }
      return JSON.parse(storageItem)
    }
    return null
  }
  return null
}

export const setStorage = (name, value) => {
  let store = value
  if (typeof value !== 'string') {
    store = JSON.stringify(value)
  }
  localStorage.setItem(STORAGE_KEY + name, store)
}

export const setAsyncStorage = async (name, value) => {
  let store = value
  if (typeof value !== 'string') {
    store = JSON.stringify(value)
  }
  await localStorage.setItem(STORAGE_KEY + name, store)
}

export const removeStorage = () => {
  if (typeof name === 'string') {
    localStorage.removeItem(STORAGE_KEY + name)
  } else if (typeof name === 'object') {
    for (let i = 0; i < name.length; i++) {
      localStorage.removeItem(STORAGE_KEY + name[i])
    }
  }
}
