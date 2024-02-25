'use client'

import { Alert, Button, Container, Group, Stack, Tabs, Text } from '@mantine/core'
import { IconCategory, IconInfoCircle } from '@tabler/icons-react'
import { redirect, useParams } from 'next/navigation'
import React, { useState } from 'react'

import { FormCategory } from '@/components/forms'
import guardAccount from '@/guards/AccountGuard'
import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'

function Category() {
  // Hooks
  const { isAuthenticated, permissionsData } = useAuth()
  const { categoryId } = useParams()

  // States
  const [tab, setTab] = useState('category')

  // Fetch
  const { data, error } = useFetch([isAuthenticated ? `/admin/service-categories/${categoryId}/` : null])

  // Constants
  const tabs = [
    { id: 'category', label: 'Categoria', icon: <IconCategory style={{ height: 12, width: 12 }} /> },
  ]

  // Validations
  if (isAuthenticated === true && permissionsData && !permissionsData.sag) return redirect('/')

  return (
    <Container size="100%" mb="50px">
      <Stack>
        <Group justify="space-between">
          <Text>Categoria {data?.data?.name || ''}</Text>

          <Button component="a" href="/categorias">Voltar</Button>
        </Group>

        <Tabs value={tab} onChange={setTab}>
          <Tabs.List>
            {tabs.map(item => (
              <Tabs.Tab key={item.id} value={item.id} leftSection={item.icon}>
                {item.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <Tabs.Panel value="category">
            <Container size="100%" mb="xl" mt="xs">
              {!!error && (
                <Alert color="orange" icon={<IconInfoCircle />}>Categoria não encontrada</Alert>
              )}
              {data?.data && tab === 'category' && (
                <FormCategory.Basic categoryData={data?.data} />
              )}
            </Container>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}

export default guardAccount(Category)
