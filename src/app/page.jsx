'use client'

import { Button, Center, Container, Group, Loader, Stack, Text } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'

// import Dashboard from './Dashboard'

export default function Home() {
  // Hooks
  const router = useRouter()
  const { isAuthenticated, permissionsData, userData } = useAuth()

  // Constants
  const { permissions } = permissionsData || {}
  const adminAccess = !!permissions?.find(perm => perm === 's' || perm === 'a') || false
  const gerenteAccess = !!permissions?.find(perm => perm === 'g') || false

  // Fetch
  // const { data, error } = useFetch([isAuthenticated ? '/painel/dashboard/' : null])
  // const isLoading = !data && !error

  // Effects
  useEffect(() => {
    if (isAuthenticated === false) return router.push('/accounts/login')
  }, [isAuthenticated, router])

  if (isAuthenticated === null) return <Center style={{ height: '400px' }}><Loader color="blue" /></Center>

  return (
    <Container>
      <Stack>
        {/* {(adminAccess || gerenteAccess) && (
          <>
            <Text><strong>Dashboard</strong></Text>
            {isLoading ? <Loader color="blue" /> : (
              <Dashboard dashboardData={data} />
            )}
          </>
        )} */}
        <Text>Olá <strong>{userData?.name}</strong>, seja bem-vindo ao painel do Agenda Online.</Text>
        <Text>Acesse o menu abaixo.</Text>

        <Group>
          <Button component="a" href="/agendamentos">Agendamentos</Button>
          {adminAccess && (
            <Button component="a" href="/empresa">Empresa</Button>
          )}
          {(adminAccess || gerenteAccess) && (
            <>
              <Button component="a" href="/categorias">Categorias</Button>
              <Button component="a" href="/servicos">Serviços</Button>
              <Button component="a" href="/funcionarios">Funcionários</Button>
              <Button component="a" href="/unidades">Unidades</Button>
              <Button component="a" href="/clientes">Clientes</Button>
              <Button component="a" href="/usuarios">Usuários</Button>
            </>
          )}
        </Group>
      </Stack>
    </Container>
  )
}
