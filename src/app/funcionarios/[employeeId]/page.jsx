'use client'

import { Button, Container, Group, Stack, Tabs, Text } from '@mantine/core'
import { IconAt, IconUser } from '@tabler/icons-react'
import { redirect, useParams } from 'next/navigation'
import React, { useState } from 'react'

import * as Display from '@/components/display'
import { FormEmployee } from '@/components/forms'
import guardAccount from '@/guards/AccountGuard'
import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'

import classes from './Employee.module.css'

function Employee() {
  // Hooks
  const { isAuthenticated, permissionsData } = useAuth()
  const { employeeId } = useParams()

  // States
  const [tab, setTab] = useState('profile')

  // Fetch
  const { data, error } = useFetch([isAuthenticated ? `/admin/employees/${employeeId}` : null])
  const { data: employeeData } = data || {}

  // Constants
  const tabs = [
    { id: 'profile', label: 'Perfil', icon: <IconUser style={{ height: 12, width: 12 }} /> },
    // { id: 'services', label: 'Serviços', icon: <IconChisel style={{ height: 12, width: 12 }} /> },
  ]

  // Validations
  if ((isAuthenticated === true && permissionsData && !permissionsData.sag) || !!error) return redirect('/')

  return (
    <Container size="100%" mb="50px">
      <Stack>
        <Group justify="space-between" wrap="nowrap">
          <div>
            <Display.Status status={employeeData?.status} />
            <Text fz="lg" fw={500} className={classes.profileName}>
              {employeeData?.name}
            </Text>
            <Group wrap="nowrap" gap={10} mt={3}>
              <IconAt stroke={1.5} size="1rem" className={classes.profileIcon} />
              <Text fz="xs" c="dimmed">{employeeData?.email}</Text>
            </Group>
          </div>

          <Button component="a" href="/funcionarios">Voltar</Button>
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
            <Container size="100%" mb="xl" mt="xs">
              {employeeData && (
                <FormEmployee.Basic employeeData={employeeData} />
              )}
            </Container>
          </Tabs.Panel>
          {/* <Tabs.Panel value="services">
            <Container size="100%" mb="xl" mt="xs">
              <FormEmployee.Services employeeData={employeeData} />
              {employeeData?.employee_services?.map?.(employeeService => (
                <>{employeeService.service.name}</>
              ))}
            </Container>
          </Tabs.Panel> */}
        </Tabs>
      </Stack>
    </Container>
  )
}

export default guardAccount(Employee)
