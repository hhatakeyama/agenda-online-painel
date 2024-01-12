'use client'

import { Alert, Anchor, Box, Button, Center, Container, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'
import React, { useState } from 'react'

export default function ForgotPassword({ onBack, onSubmit }) {
  // States
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [email, setEmail] = useState('')

  // Actions
  const handleSubmit = async () => {
    setError(null)
    setMessage(null)
    const response = await onSubmit?.(email)
    if (response.error) {
      setError(response.error)
    } else {
      setMessage(response.message)
    }
  }

  return (
    <Container my={40} style={{ maxWidth: '400px', width: '100%' }}>
      <Title ta="center">Esqueceu sua senha?</Title>
      <Text c="dimmed" fz="sm" ta="center">
        Digite seu e-mail para receber um link para redefinir sua senha.
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <Stack>
          <TextInput label="E-mail" placeholder="Seu e-mail" value={email} onChange={e => setEmail(e.target.value)} required />
          <Group justify="space-between">
            <Anchor c="dimmed" size="sm" onClick={onBack}>
              <Center inline>
                <IconArrowLeft style={{ width: 12, height: 12 }} stroke={1.5} />
                <Box ml={5}>Voltar para o login</Box>
              </Center>
            </Anchor>
            <Button onClick={handleSubmit}>Resetar senha</Button>
          </Group>
          
          {error && (
            <Alert color="red" title="Erro">{error}</Alert>
          )}
          {message && (
            <Alert title="Sucesso">{message}</Alert>
          )}
        </Stack>
      </Paper>
    </Container>
  )
}
