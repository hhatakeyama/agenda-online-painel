import { Avatar, Button, Divider, Grid, Paper, Stack, Text, Title } from '@mantine/core'
import React from 'react'

import { useSchedule } from '@/providers/ScheduleProvider'
import { currencyValue } from '@/utils/converter'

export default function ScheduleItem({ editValues, showChangeButton = true, onChangeEmployee }) {
  // Hooks
  const { selectedServices } = useSchedule()

  // Constants
  const service = selectedServices.find(item => item.id === editValues.service_id) || {}
  const selectedEmployee = service?.employees?.find?.(item => item.id === editValues.employee_id)
  const canChooseEmployee = service?.can_choose_employee === 1

  return (
    <Grid.Col span={{ base: 12 }}>
      <Paper p="md" radius="md" withBorder>
        <Grid>
          <Grid.Col span={{ base: 12, xs: 4 }}>
            <Stack align="center" gap={2}>
              <Avatar src={canChooseEmployee ? selectedEmployee?.picture : ''} size={50} />
              <Text size="sm" fw={700}>{canChooseEmployee && selectedEmployee ? selectedEmployee.name.split(' ')[0] : 'Disponível'}</Text>
              {showChangeButton && <Button size="xs" onClick={onChangeEmployee}>Alterar</Button>}
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 8 }}>
            <Stack align="center" gap={2}>
              <Title order={4} fw={700} align="center">{service.name || ''}</Title>
              <Divider />
              <Text fw={700} c="orange">{service.price ? currencyValue(service.price) : ''}</Text>
              <Text size="sm">Agendado: <strong>{editValues.start_time || '--'} - {editValues.end_time || '--'}</strong></Text>
              <Text size="sm">Duração: <strong>{service.duration || ''}</strong></Text>
            </Stack>
          </Grid.Col>
        </Grid>
      </Paper>
    </Grid.Col>
  )
}
