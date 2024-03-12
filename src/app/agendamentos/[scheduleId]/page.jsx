'use client'

import { Box, Button, Container, Grid, Group, Stack, Tabs, Text } from '@mantine/core'
import { IconBuilding } from '@tabler/icons-react'
import Link from 'next/link'
import { redirect, useParams } from 'next/navigation'
import React, { useState } from 'react'

import ScheduleItem from '@/components/forms/FormSchedule/ScheduleItem'
import guardAccount from '@/guards/AccountGuard'
import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'
import { dateToHuman } from '@/utils'

function Agendamento() {
  // Hooks
  const { isAuthenticated, permissionsData } = useAuth()
  const { scheduleId } = useParams()

  // Fetch
  const { data, error } = useFetch([isAuthenticated ? `/admin/schedules/${scheduleId}` : null])
  const { data: scheduleData } = data || {}

  // Validations
  if ((isAuthenticated === false) || !!error) return redirect('/')

  return (
    <Container size="100%" mb="50px">
      <Stack>
        <Group justify="space-between">
          <Button component={Link} href={permissionsData?.sa ? "/agendamentos" : "/agendamentos/calendario"}>Voltar</Button>
        </Group>
        <Stack>
          <Box>
            <Text size="lg"><strong>Data</strong>: {scheduleData?.date ? dateToHuman(scheduleData?.date, 'date') : ''}</Text>
            {/* {scheduleData?.schedule_items?.[0] && (
              <Text size="lg"><strong>Hora</strong>: {scheduleData?.schedule_items[0].start_time} - {scheduleData?.schedule_items[scheduleData?.schedule_items.length - 1].end_time} ({totalDuration}min)</Text>
            )} */}
            <Text>
              <strong>Local</strong>: {scheduleData?.company?.name}<br />{scheduleData?.company?.address}, {scheduleData?.company?.district}, {scheduleData?.company?.city?.name}/{scheduleData?.company?.state}
            </Text>
          </Box>

          <Text size="lg" fw={700}>Serviços</Text>
          <Grid justify="center">
            {scheduleData?.schedule_items?.map((item, index) => (
              <ScheduleItem
                key={`scheduleItem-${item.service_id}`}
                editValues={item}
                showChangeButton={false}
              />
            ))}
          </Grid>

          <Group justify="center">
            <Button
              size="lg"
              color="green"
              onClick={() => {}}>
              Confirmar agendamento
            </Button>
            <Button size="lg" color="red" onClick={() => {}}>Cancelar agendamento</Button>
          </Group>
        </Stack>
      </Stack>
    </Container>
  )
}

export default guardAccount(Agendamento)
