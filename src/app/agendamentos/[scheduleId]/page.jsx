'use client'

import { Button, Container, Group, Stack, Tabs } from '@mantine/core'
import { IconBuilding } from '@tabler/icons-react'
import Link from 'next/link'
import { redirect, useParams } from 'next/navigation'
import React, { useState } from 'react'

import { FormSchedule } from '@/components/forms'
import guardAccount from '@/guards/AccountGuard'
import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'

function Agendamento() {
  // Hooks
  const { isAuthenticated, permissionsData } = useAuth()
  const { scheduleId } = useParams()

  // States
  const [tab, setTab] = useState('schedule')

  // Fetch
  const { data, error } = useFetch([isAuthenticated ? `/admin/schedules/${scheduleId}` : null])
  const { data: scheduleData } = data || {}

  // Constants
  const tabs = [
    { id: 'schedule', label: 'Agendamento', icon: <IconBuilding style={{ height: 12, width: 12 }} /> },
  ]

  // Validations
  if ((isAuthenticated === false) || !!error) return redirect('/')

  return (
    <Container size="100%" mb="50px">
      <Stack>
        <Group justify="space-between">
          <Button component={Link} href={permissionsData?.sa ? "/agendamentos" : "/agendamentos/calendario"}>Voltar</Button>
        </Group>
        <Tabs value={tab} onChange={setTab}>
          <Tabs.List>
            {tabs.map(item => (
              <Tabs.Tab key={item.id} value={item.id} leftSection={item.icon}>
                {item.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <Tabs.Panel value="schedule">
            {scheduleData && tab === 'schedule' && (
              <Container size="100%" mb="xl" mt="xs">
                <FormSchedule.Basic scheduleData={scheduleData} />
              </Container>
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}

export default guardAccount(Agendamento)
