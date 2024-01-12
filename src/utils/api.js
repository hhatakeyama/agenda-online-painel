import axios from 'axios'

import { getCookie, removeCookie } from '@/utils'

const cookieTokenString = 'agenda-online-painel-token'
const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_ENTRYPOINT}`
})

api.interceptors.request.use(
  config => {
    const { token } = getCookie(cookieTokenString) || {}

    if (
      token &&
      (!config.headers?.Authorization || !config.headers?.authorization) &&
      config.headers
    ) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => Promise.reject(error)
)

api.interceptors.response.use(
  function (response) {
    return response
  },
  function (error) {
    if (error.response?.status === 401 && error.response?.data?.detail === 'Token inválido.')
      removeCookie(cookieTokenString)
    return Promise.reject(error)
  }
)

export default api
