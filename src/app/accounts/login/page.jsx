'use client'

import { Container } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { FormLogin } from '@/components/forms'
import { useAuth } from '@/providers/AuthProvider'

export default function Login() {
  // Hooks
  const { isAuthenticated, login, userData } = useAuth()
  const router = useRouter()

  // States
  const [forgotPassword, setForgotPassword] = useState(false)

  useEffect(() => {
    if (isAuthenticated === true) router.push('/')
  }, [isAuthenticated, router, userData])

  return (
    <Container>
      {forgotPassword ? (
        <FormLogin.ForgotPassword onBack={() => setForgotPassword(false)} onSubmit={login} />
      ) : (
        <FormLogin.Basic onForgotPassword={() => setForgotPassword(true)} onSubmit={login} />
      )}
    </Container>
  )
}
