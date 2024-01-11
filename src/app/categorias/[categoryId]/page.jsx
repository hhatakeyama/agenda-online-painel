'use client'

import { Button, Center, Container, Group, Loader, Stack, Tabs } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconCategory } from '@tabler/icons-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { CategoryForm } from '@/components/forms'
import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'

export default function Category() {
  // Hooks
  const { isAuthenticated } = useAuth()
  const { categoryId } = useParams()
  const router = useRouter()

  // States
  const [tab, setTab] = useState('category')

  // Fetch
  const { data, error, mutate } = useFetch([isAuthenticated ? `/admin/usuarios/${categoryId}` : null])

  // Constants
  const tabs = [
    { id: 'category', label: 'Categoria', icon: <IconCategory style={{ height: 12, width: 12 }} /> },
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
        <Group justify="space-between">
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
            {data && tab === 'category' && (
              <Container size="100%" mb="xl" mt="xs">
                <CategoryForm.Basic categoryData={data} mutate={mutate} />
              </Container>
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}
