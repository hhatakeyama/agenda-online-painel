'use client'

import { Alert, Button, Container, Group, Stack, Tabs, Text } from '@mantine/core'
import { IconInfoCircle, IconUser } from '@tabler/icons-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { FormService } from '@/components/forms'
import guardAccount from '@/guards/AccountGuard'
import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'

function Service() {
  // Hooks
  const { isAuthenticated, permissionsData } = useAuth()
  const { serviceId } = useParams()
  const router = useRouter()

  // States
  const [tab, setTab] = useState('service')

  // Fetch
  const { data, error } = useFetch([isAuthenticated ? `/admin/services/${serviceId}/` : null])

  // Constants
  const tabs = [
    { id: 'service', label: 'Serviço', icon: <IconUser style={{ height: 12, width: 12 }} /> },
  ]

  // Validations
  if (isAuthenticated === true && permissionsData && !permissionsData.sag) return router.push('/')

  return (
    <Container size="100%" mb="50px">
      <Stack>
        <Group justify="space-between">
          <Text>Serviço {data?.data?.name || ''}</Text>

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
            <Container size="100%" mb="xl" mt="xs">
              {!!error && (
                <Alert color="orange" icon={<IconInfoCircle />}>Serviço não encontrado</Alert>
              )}
              {data?.data && tab === 'service' && (
                <FormService.Basic serviceData={data?.data} />
              )}
            </Container>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}

export default guardAccount(Service)
