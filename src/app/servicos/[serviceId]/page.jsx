'use client'

import { Button, Center, Container, Group, Loader, Stack, Tabs } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconUser } from '@tabler/icons-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { FormService } from '@/components/forms'
import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'

export default function Service() {
  // Hooks
  const { isAuthenticated } = useAuth()
  const { serviceId } = useParams()
  const router = useRouter()

  // States
  const [tab, setTab] = useState('service')

  // Fetch
  const { data, error, mutate } = useFetch([isAuthenticated ? `/admin/usuarios/${serviceId}` : null])

  // Constants
  const tabs = [
    { id: 'service', label: 'Serviço', icon: <IconUser style={{ height: 12, width: 12 }} /> },
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
          <Button component="a" href="/servicos">Voltar</Button>
        </Group>
        <Tabs value={tab} onChange={setTab}>
          <Tabs.List>
            {tabs.map(item => (
              <Tabs.Tab key={item.id} value={item.id} leftSection={item.icon}>
                {item.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <Tabs.Panel value="service">
            {data && tab === 'service' && (
              <Container size="100%" mb="xl" mt="xs">
                <FormService.Basic serviceData={data} mutate={mutate} />
              </Container>
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}
