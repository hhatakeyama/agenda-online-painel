'use client'

import { Card, Center, Grid, Loader, Stack } from '@mantine/core'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

import { FormAcompanhante } from '@/components/forms'
import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'

export default function Phones() {
  // Hooks
  const { isAuthenticated } = useAuth()
  const { acompanhanteId } = useParams()
  const router = useRouter()

  // Fetch
  const { data, mutate } = useFetch([isAuthenticated ? `/admin/acompanhantes/${acompanhanteId}` : null])

  // Effects
  useEffect(() => {
    if (isAuthenticated === false) return router.push('/')
  }, [isAuthenticated, router])

  if (isAuthenticated === null) return <Center style={{ height: '400px' }}><Loader color="blue" /></Center>

  return (
    <Stack>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Stack>
            {data?.telefones?.map(telefone => (
              <Card key={telefone.id} style={{ width: '100%' }}>
                <FormAcompanhante.Phones acompanhanteId={data?.id} phoneData={telefone} onSuccess={() => mutate()} />
              </Card>
            ))}
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          Novo Telefone
          <Card>
            <FormAcompanhante.Phones acompanhanteId={data?.id} onSuccess={() => mutate()} />
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  )
}
