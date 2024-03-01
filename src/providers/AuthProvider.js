'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { useFetch } from '@/hooks'
import { api, getCookie, removeCookie, setCookie } from '@/utils'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

function useProvideAuth() {
  // Constants
  const cookieTokenString = 'skedyou-admin-token'
  const { token: cookieToken, expiry: cookieExpiry } = getCookie(cookieTokenString) || {}

  // States
  const [loading, setLoading] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [isValidating, setIsValidating] = useState(null)

  // // Fetch
  const { data: userData, isValidating: userIsValidating, mutate: userMutate } = useFetch([
    !!isAuthenticated ? '/admin/me' : null
  ], { revalidateOnFocus: false, dedupingInterval: 60 * 60 * 24 })

  const permissionsData = userData?.data?.type ? {
    s: userData.data.type === 's' || false,
    a: userData.data.type === 'a' || false,
    g: userData.data.type === 'g' || false,
    e: userData.data.type === 'f' || false,
    sa: ['s', 'a'].indexOf(userData.data.type) !== -1 || false,
    sag: ['s', 'a', 'g'].indexOf(userData.data.type) !== -1 || false,
    sage: ['s', 'a', 'g', 'f'].indexOf(userData.data.type) !== -1 || false,
    ag: ['a', 'g'].indexOf(userData.data.type) !== -1 || false,
    ge: ['g', 'f'].indexOf(userData.data.type) !== -1 || false,
  } : null

  // Login with credentials
  const login = async credentials => {
    setLoading(true)
    await api.get('/sanctum/csrf-cookie')
    const response = await api
      .post('/api/admin/login', {
        email: credentials.email,
        password: credentials.password
      })
      .then(response => {
        const { data } = response || {}
        if (data?.token) {
          const date = new Date()
          date.setDate(date.getDate() + 1)
          const tokenData = { expiry: date.toISOString(), token: data.token }
          setCookie(cookieTokenString, tokenData)
          setIsAuthenticated(true)
        } else {
          return { error: 'E-mail ou senha inválidos' }
        }
      })
      .catch(error => {
        return {
          error:
            error?.response?.data?.message === 'Unauthorized'
              ? 'E-mail ou senha inválidos'
              : error?.response?.data?.message
        }
      })
      .finally(() => setLoading(false))

    return response
  }

  // Logout user from API
  const logout = async () => {
    try {
      await api.post('/admin/logout')
    } finally {
      removeCookie(cookieTokenString)
      setIsAuthenticated(false)
    }
  }

  // Send reset password link
  const forgotPassword = async (email) => {
    const response = await api.post('/admin/password-reset', { email })
    return response
  }

  // Reset password
  const resetPassword = async (password, uidb64, hash) => {
    const response = await api.post('/admin/password-reset/confirm', {
      password,
      uidb64,
      token: hash
    })
    return response
  }

  // Verify if token is valid or expired
  const verifyToken = useCallback(() => {
    let expired = true
    if (cookieToken) {
      const expiryDate = new Date(cookieExpiry)
      const nowDate = new Date()

      expired = nowDate.getTime() > expiryDate.getTime()

      if (expired) {
        removeCookie(cookieTokenString)
      }
    }

    return !expired
  }, [cookieToken, cookieExpiry])

  // Effects
  useEffect(() => {
    const isValidToken = verifyToken()
    setIsAuthenticated(!!isValidToken)
  }, [verifyToken, cookieToken])

  useEffect(() => {
    setIsValidating(loading || userIsValidating)
  }, [loading, userIsValidating])

  return {
    login,
    logout,
    forgotPassword,
    resetPassword,
    verifyToken,
    isAuthenticated,
    isValidating,
    userData: userData?.data || null,
    userMutate,
    permissionsData
  }
}

export default function AuthProvider({ children }) {
  const auth = useProvideAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}
