'use client'

import { Box, Button, Card, Center, Grid, Loader, Modal, Stack } from '@mantine/core'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { AcompanhanteForm } from '@/components/forms'
import { useAuth } from '@/providers/AuthProvider'

export default function Agenda({ acompanhanteData, mutate }) {
  // Hooks
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  // States
  const [opened, setOpened] = useState(false)

  // Effects
  useEffect(() => {
    if (isAuthenticated === false) return router.push('/')
  }, [isAuthenticated, router])

  if (isAuthenticated === null) return <Center style={{ height: '400px' }}><Loader color="blue" /></Center>

  return (
    <>
      <Stack>
        <Box>
          <Button onClick={() => setOpened(true)}>Adicionar Agenda</Button>
        </Box>
        {acompanhanteData?.periodos.length > 0 && (
          <Grid>
            {acompanhanteData?.periodos?.map(periodo => (
              <Grid.Col key={periodo.id} span={{ base: 12, lg: 6 }}>
                <Card style={{ width: '100%' }}>
                  <AcompanhanteForm.Agenda acompanhanteData={acompanhanteData} agendaData={periodo} onSuccess={() => mutate()} />
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Stack>
      <Modal centered opened={opened} onClose={() => setOpened(false)} title="Nova agenda">
        <AcompanhanteForm.Agenda acompanhanteData={acompanhanteData} onSuccess={() => {
          mutate()
          setOpened(false)
        }} />
      </Modal>
    </>
  )
}
