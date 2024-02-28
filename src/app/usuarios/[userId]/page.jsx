'use client'

import { Container, Group, Stack, Tabs, Text } from '@mantine/core'
import { IconAt, IconUser } from '@tabler/icons-react'
import { redirect, useParams } from 'next/navigation'
import React, { useState } from 'react'

import * as Display from '@/components/display'
import { FormUser } from '@/components/forms'
import guardAccount from '@/guards/AccountGuard'
import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'

import classes from './User.module.css'

function User() {
  // Hooks
  const { isAuthenticated, permissionsData } = useAuth()
  const { userId } = useParams()

  // States
  const [tab, setTab] = useState('profile')

  // Fetch
  const { data, error } = useFetch([isAuthenticated ? `/admin/users/${userId}` : null])
  const { data: userData } = data || {}

  // Constants
  const tabs = [
    { id: 'profile', label: 'Perfil', icon: <IconUser style={{ height: 12, width: 12 }} /> },
  ]

  // Validations
  if ((isAuthenticated === true && permissionsData && !permissionsData.sag) || !!error) return redirect('/')

  return (
    <Container size="100%" mb="50px">
      <Stack>
        <Group wrap="nowrap">
          <div>
            <Display.Status status={userData?.status} />
            <Text fz="lg" fw={500} className={classes.profileName}>
              {userData?.name}
            </Text>
            <Group wrap="nowrap" gap={10} mt={3}>
              <IconAt stroke={1.5} size="1rem" className={classes.profileIcon} />
              <Text fz="xs" c="dimmed">{userData?.email}</Text>
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
            {userData && tab === 'profile' && (
              <Container size="100%" mb="xl" mt="xs">
                <FormUser.Basic userData={userData} />
              </Container>
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}

export default guardAccount(User)
