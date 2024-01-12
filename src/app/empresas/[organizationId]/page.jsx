'use client'

import { Button, Center, Container, Group, Loader, Stack, Tabs } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconBuilding } from '@tabler/icons-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { FormOrganization } from '@/components/forms'
import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'

export default function Organization() {
  // Hooks
  const { isAuthenticated } = useAuth()
  const { organizationId } = useParams()
  const router = useRouter()

  // States
  const [tab, setTab] = useState('organization')

  // Fetch
  const { data, error, mutate } = useFetch([isAuthenticated ? `/admin/usuarios/${organizationId}` : null])

  // Constants
  const tabs = [
    { id: 'organization', label: 'Empresa', icon: <IconBuilding style={{ height: 12, width: 12 }} /> },
  ]

  // Effects
  useEffect(() => {
    if (isAuthenticated === false) return router.push('/')
  }, [isAuthenticated, router])

  if (error?.response?.data?.message === "Unauthorized") {
    notifications.show({ title: "Erro", message: error?.response?.data?.message, color: 'red' })
    return router.push('/')
  }

  if (isAuthenticated === null) return <Center style={{ height: '400px' }}><Loader color="blue" /></Center>

  return (
    <Container size="100%" mb="50px">
      <Stack>
        <Group justify="space-between">
          <Button component="a" href="/empresas">Voltar</Button>
        </Group>
        <Tabs value={tab} onChange={setTab}>
          <Tabs.List>
            {tabs.map(item => (
              <Tabs.Tab key={item.id} value={item.id} leftSection={item.icon}>
                {item.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <Tabs.Panel value="organization">
            {data && tab === 'organization' && (
              <Container size="100%" mb="xl" mt="xs">
                <FormOrganization.Basic organizationData={data} mutate={mutate} />
              </Container>
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}
