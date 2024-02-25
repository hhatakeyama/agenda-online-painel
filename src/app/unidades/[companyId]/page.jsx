'use client'

import { Button, Center, Container, Group, Loader, Stack, Tabs } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconBuildingStore, IconChisel, IconTools } from '@tabler/icons-react'
import { redirect, useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { FormCompany } from '@/components/forms'
import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'

export default function Service() {
  // Hooks
  const { isAuthenticated } = useAuth()
  const { companyId } = useParams()

  // States
  const [tab, setTab] = useState('company')

  // Fetch
  const { data, error } = useFetch([isAuthenticated ? `/painel/companies/${companyId}` : null])
  const { data: companyData } = data || {}

  // Constants
  const tabs = [
    { id: 'company', label: 'Unidade', icon: <IconBuildingStore style={{ height: 12, width: 12 }} /> },
    { id: 'employees', label: 'Funcionários', icon: <IconTools style={{ height: 12, width: 12 }} /> },
    { id: 'services', label: 'Serviços', icon: <IconChisel style={{ height: 12, width: 12 }} /> },
  ]

  // Effects
  useEffect(() => {
    if (isAuthenticated === false) return redirect('/')
  }, [isAuthenticated])

  if (error?.response?.data?.message === "Unauthorized") {
    notifications.show({ title: "Erro", message: error?.response?.data?.message, color: 'red' })
    return redirect('/')
  }

  if (isAuthenticated === null) return <Center style={{ height: '400px' }}><Loader color="blue" /></Center>

  return (
    <Container size="100%" mb="50px">
      <Stack>
        <Group justify="space-between">
          <Button component="a" href="/unidades">Voltar</Button>
        </Group>
        <Tabs value={tab} onChange={setTab}>
          <Tabs.List>
            {tabs.map(item => (
              <Tabs.Tab key={item.id} value={item.id} leftSection={item.icon}>
                {item.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <Tabs.Panel value="company">
            {companyData && tab === 'company' && (
              <Container size="100%" mb="xl" mt="xs">
                <FormCompany.Basic companyData={companyData} />
              </Container>
            )}
          </Tabs.Panel>
          <Tabs.Panel value="employees">
            {companyData && tab === 'employees' && (
              <Container size="100%" mb="xl" mt="xs">
                <FormCompany.Employees companyData={companyData} />
              </Container>
            )}
          </Tabs.Panel>
          <Tabs.Panel value="services">
            {companyData && tab === 'services' && (
              <Container size="100%" mb="xl" mt="xs">
                <FormCompany.Services companyData={companyData} />
              </Container>
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}
