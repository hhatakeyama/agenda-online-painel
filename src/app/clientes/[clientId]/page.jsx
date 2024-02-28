'use client'

import { Container, Group, Stack, Tabs, Text } from '@mantine/core'
import { IconAt, IconUser } from '@tabler/icons-react'
import { redirect, useParams } from 'next/navigation'
import React, { useState } from 'react'

import * as Display from '@/components/display'
import { FormClient } from '@/components/forms'
import guardAccount from '@/guards/AccountGuard'
import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'

import classes from './Client.module.css'

function Client() {
  // Hooks
  const { isAuthenticated, permissionsData } = useAuth()
  const { clientId } = useParams()

  // States
  const [tab, setTab] = useState('profile')

  // Fetch
  const { data, error } = useFetch([isAuthenticated ? `/admin/clients/${clientId}` : null])
  const { data: clientData } = data || {}

  // Constants
  const tabs = [
    { id: 'profile', label: 'Perfil', icon: <IconUser style={{ height: 12, width: 12 }} /> },
  ]

  // Validations
  if ((isAuthenticated === true && permissionsData && !permissionsData.sa) || !!error) return redirect('/')

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
                <FormClient.Basic clientData={clientData} />
              </Container>
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}

export default guardAccount(Client)
