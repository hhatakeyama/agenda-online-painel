'use client'

import { Button, Container, Group, Stack, Tabs } from '@mantine/core'
import { IconBuildingStore, IconChisel } from '@tabler/icons-react'
import { redirect, useParams } from 'next/navigation'
import React, { useState } from 'react'

import { FormCompany } from '@/components/forms'
import guardAccount from '@/guards/AccountGuard'
import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'

function Company() {
  // Hooks
  const { isAuthenticated, permissionsData } = useAuth()
  const { companyId } = useParams()

  // States
  const [tab, setTab] = useState('company')

  // Fetch
  const { data, error } = useFetch([isAuthenticated ? `/admin/companies/${companyId}` : null])
  const { data: companyData } = data || {}

  // Constants
  const tabs = [
    { id: 'company', label: 'Unidade', icon: <IconBuildingStore style={{ height: 12, width: 12 }} /> },
    { id: 'services', label: 'Serviços', icon: <IconChisel style={{ height: 12, width: 12 }} /> },
  ]

  // Validations
  if ((isAuthenticated === true && permissionsData && !permissionsData.sag) || !!error) return redirect('/')

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

export default guardAccount(Company)
