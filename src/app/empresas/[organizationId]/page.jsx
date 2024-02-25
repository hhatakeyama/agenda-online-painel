'use client'

import { Button, Container, Group, Stack, Tabs, Text } from '@mantine/core'
import { IconBuilding } from '@tabler/icons-react'
import { redirect, useParams } from 'next/navigation'
import React, {  useState } from 'react'

import { FormOrganization } from '@/components/forms'
import guardAccount from '@/guards/AccountGuard'
import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'

function Organization() {
  // Hooks
  const { isAuthenticated, permissionsData } = useAuth()
  const { organizationId } = useParams()

  // States
  const [tab, setTab] = useState('organization')

  // Fetch
  const { data } = useFetch([isAuthenticated ? `/admin/organizations/${organizationId}/` : null])

  // Constants
  const tabs = [
    { id: 'organization', label: 'Empresa', icon: <IconBuilding style={{ height: 12, width: 12 }} /> },
  ]

  // Validations
  if (isAuthenticated === true && permissionsData && !permissionsData.sa) return redirect('/')

  return (
    <Container size="100%" mb="50px">
      <Stack>
        <Group justify="space-between">
          <Text>Empresa {data?.data?.registeredName || ''}</Text>

          <Button component="a" href="/empresas">Voltar</Button>
        </Group>

        <Tabs value={tab} onChange={setTab}>
          <Tabs.List>
            {tabs.map(item => (
              <Tabs.Tab key={item.id} value={item.id} leftSection={item.icon}>
                {item.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <Tabs.Panel value="organization">
            {data?.data && tab === 'organization' && (
              <Container size="100%" mb="xl" mt="xs">
                <FormOrganization.Basic organizationData={data?.data} />
              </Container>
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}

export default guardAccount(Organization)
