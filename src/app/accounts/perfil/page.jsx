'use client'

import { Container, Group, Stack, Tabs, Text } from '@mantine/core'
import { IconAt, IconUser } from '@tabler/icons-react'
import React, { useState } from 'react'

import * as Display from '@/components/display'
import { FormEmployee, FormUser } from '@/components/forms'
import guardAccount from '@/guards/AccountGuard'
import { useAuth } from '@/providers/AuthProvider'

import classes from './Profile.module.css'

function Profile() {
  // Hooks
  const { permissionsData, userData } = useAuth()

  // States
  const [tab, setTab] = useState('profile')

  // Constants
  const tabs = [
    { id: 'profile', label: 'Perfil', icon: <IconUser style={{ height: 12, width: 12 }} /> },
  ]

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
                {permissionsData.sag ? <FormUser.Basic userData={userData} /> : <FormEmployee.Basic employeeData={userData} />}
              </Container>
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}

export default guardAccount(Profile)
