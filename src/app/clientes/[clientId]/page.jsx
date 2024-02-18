'use client'

import { Center, Container, Group, Loader, Stack, Tabs, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconAt, IconUser } from '@tabler/icons-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import * as Display from '@/components/display'
import { FormClient } from '@/components/forms'
import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'

import classes from './Client.module.css'

export default function Client() {
  // Hooks
  const { isAuthenticated } = useAuth()
  const { clientId } = useParams()
  const router = useRouter()

  // States
  const [tab, setTab] = useState('profile')

  // Fetch
  const { data, error, mutate } = useFetch([isAuthenticated ? `/painel/clients/${clientId}` : null])
  const { data: clientData } = data || {}

  // Constants
  const tabs = [
    { id: 'profile', label: 'Perfil', icon: <IconUser style={{ height: 12, width: 12 }} /> },
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
        <Group wrap="nowrap">
          <div>
            <Display.Status status={clientData?.status} />
            <Text fz="lg" fw={500} className={classes.profileName}>
              {clientData?.name}
            </Text>
            <Group wrap="nowrap" gap={10} mt={3}>
              <IconAt stroke={1.5} size="1rem" className={classes.profileIcon} />
              <Text fz="xs" c="dimmed">{clientData?.email}</Text>
            </Group>
          </div>
        </Group>

        <Tabs value={tab} onChange={setTab}>
          <Tabs.List>
            {tabs.map(item => (
              <Tabs.Tab key={item.id} value={item.id} leftSection={item.icon}>
                {item.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <Tabs.Panel value="profile">
            {clientData && tab === 'profile' && (
              <Container size="100%" mb="xl" mt="xs">
                <FormClient.Basic clientData={clientData} mutate={mutate} />
              </Container>
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}
