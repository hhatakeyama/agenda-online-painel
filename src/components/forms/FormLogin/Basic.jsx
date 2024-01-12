import { Alert, Button, Container, LoadingOverlay, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core'
import React, { useState } from 'react'

import { useAuth } from '@/providers/AuthProvider'

export default function Basic({ onForgotPassword, onSubmit }) {
  // Hooks
  const { isValidating } = useAuth()

  // States
  const [error, setError] = useState(null)
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })

  // Actions
  const handleSubmit = async () => {
    setError(null)
    const response = await onSubmit?.(credentials)
    if (response?.error) {
      setError(response.error)
    }
  }

  return (
    <Container size="xl" my={40} style={{ maxWidth: '400px', width: '100%' }}>
      <Title ta="center">
        Bem-vindo(a)!
      </Title>
      <Text c="dimmed" fz="sm" ta="center">
        Faça seu login abaixo.
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md" pos="relative">
        <LoadingOverlay visible={isValidating} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        <Stack>
          <TextInput
            label="E-mail"
            placeholder="Seu e-mail"
            value={credentials.email}
            onChange={e => setCredentials({ ...credentials, email: e.target.value })}
            required
          />
          <PasswordInput
            label="Senha"
            placeholder="Sua senha"
            value={credentials.password}
            onChange={e => setCredentials({ ...credentials, password: e.target.value })}
            required
          />
          {/* <Group justify="space-between" mt="lg" style={{ display: 'none' }}>
            <Anchor component="button" size="sm" onClick={onForgotPassword}>
              Esqueceu a senha?
            </Anchor>
          </Group> */}

          {!!error && (
            <Alert color="red" title="Erro">{error}</Alert>
          )}
          <Button type="submit" fullWidth onClick={handleSubmit}>Login</Button>
        </Stack>
      </Paper>
    </Container>
  )
}
