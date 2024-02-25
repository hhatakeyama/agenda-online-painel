'use client'

import { Center, Container, Loader, Stack, Text } from '@mantine/core'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

import { useAuth } from '@/providers/AuthProvider'

export default function Anuncios() {
  // Hooks
  const { isAuthenticated, permissionsData } = useAuth()

  // Effects
  useEffect(() => {
    if (isAuthenticated === false) return redirect('/accounts/login')
  }, [isAuthenticated])

  // Validations
  if (isAuthenticated === null) return <Center style={{ height: '400px' }}><Loader color="blue" /></Center>

  if (isAuthenticated === true && permissionsData && !permissionsData.sa) return redirect('/')

  return (
    <Container size="100%" mb="50px">
      <Stack>
        <Text>Anúncios</Text>

        <Text>Em Breve</Text>
      </Stack>
    </Container>
  )
}
