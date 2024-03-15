'use client'

import { Button, Center, Container, Group, Loader, Stack, Text } from '@mantine/core'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

// import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'

// import Dashboard from './Dashboard'

export default function Home() {
  // Hooks
  const { isAuthenticated, permissionsData, userData } = useAuth()

  // Fetch
  // const { data, error } = useFetch([isAuthenticated ? '/admin/dashboard' : null])
  // const isLoading = !data && !error

  // Effects
  useEffect(() => {
    if (isAuthenticated === false) return redirect('/accounts/login')
  }, [isAuthenticated])

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
          <Button component={Link} href={`/agendamentos${permissionsData?.ge ? '/calendario' : ''}`}>Agendamentos</Button>
          {permissionsData?.sa && (
            <Button component={Link} href="/empresa">Empresa</Button>
          )}
          {permissionsData?.sag && (
            <>
              <Button component={Link} href="/categorias">Categorias</Button>
              <Button component={Link} href="/servicos">Serviços</Button>
              <Button component={Link} href="/funcionarios">Funcionários</Button>
              <Button component={Link} href="/unidades">Unidades</Button>
              <Button component={Link} href="/clientes">Clientes</Button>
              <Button component={Link} href="/usuarios">Usuários</Button>
            </>
          )}
        </Group>
      </Stack>
    </Container>
  )
}
