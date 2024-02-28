'use client'

import { Container } from '@mantine/core'
import { useState } from 'react'

import { FormLogin } from '@/components/forms'
import { useAuth } from '@/providers/AuthProvider'

export default function Login() {
  // Hooks
  const { login } = useAuth()

  // States
  const [forgotPassword, setForgotPassword] = useState(false)

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
