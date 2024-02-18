'use client'

import { Center, Container, Loader, Stack, Text } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useAuth } from '@/providers/AuthProvider'

export default function Relatorios() {
  // Hooks
  const router = useRouter()
  const { isAuthenticated, permissionsData } = useAuth()

  // Effects
  useEffect(() => {
    if (isAuthenticated === false) return router.push('/accounts/login')
  }, [isAuthenticated, router])

  // Validations
  if (isAuthenticated === null) return <Center style={{ height: '400px' }}><Loader color="blue" /></Center>

  if (isAuthenticated === true && permissionsData && !permissionsData.sa) return router.push('/')

  return (
    <Container size="100%" mb="50px">
      <Stack>
        <Text>Relatórios</Text>

        <Text>Em Breve</Text>
      </Stack>
    </Container>
  )
}
