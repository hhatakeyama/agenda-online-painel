import nookies, {
  destroyCookie as destroyNookiesCookie,
  parseCookies,
  setCookie as setNookiesCookie
} from 'nookies'

const ONE_SECOND = 1
const ONE_MINUTE = ONE_SECOND * 60
const ONE_HOUR = ONE_MINUTE * 60
const ONE_DAY = ONE_HOUR * 24
const ONE_YEAR = ONE_DAY * 365

const getDomain = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ROOT_URL) {
    const currentHost = window.location.origin.replace(`.${process.env.NEXT_PUBLIC_ROOT_URL}`, '')
    const domain = currentHost.includes('.')
      ? window.location.hostname
      : `.${process.env.NEXT_PUBLIC_ROOT_URL.replace(':3000', '')}`
    return domain
  }
  return undefined
}

export const removeCookie = async (name, ctx = null) => {
  if (typeof window !== 'undefined') {
    destroyNookiesCookie(null, name, { path: '/', domain: getDomain() })
  } else {
    nookies.destroy(ctx, name, { path: '/', domain: getDomain() })
  }
}

export const getCookie = (name, isString = false, ctx = null) => {
  let cookies = null
  if (typeof window !== 'undefined') {
    cookies = parseCookies()
  } else {
    const cookies = nookies.get(ctx)
    if (isString) {
      return cookies[name] || ''
    }
  }
  return cookies?.[name] ? JSON.parse(cookies[name]) : ''
}

export const setCookie = (name, value, ctx = null) => {
  if (typeof window !== 'undefined') {
    setNookiesCookie(null, name, JSON.stringify(value), {
      path: '/',
      maxAge: ONE_YEAR,
      domain: getDomain()
    })
  } else {
    nookies.set(ctx, name, JSON.stringify(value), {
      path: '/',
      maxAge: ONE_YEAR,
      domain: getDomain()
    })
  }
}
