import { Alert, Button, Grid, LoadingOverlay, Stack, Text } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import React from 'react'

import { useSchedule } from '@/providers/ScheduleProvider'
import { generateHourList, verifyAvailableHour } from '@/utils'

export default function HourList({ dayOfWeek, isValidating, totalDuration, unavailableHours }) {
  // Hooks
  const { schedule, smallestDuration, handleChangeSchedule } = useSchedule()

  // Fetch
  const hourList = generateHourList(schedule.date, dayOfWeek, smallestDuration, unavailableHours) || [] // Mount available hour list
  const availableHourList = hourList.filter(hour => verifyAvailableHour(hourList, dayOfWeek, totalDuration, hour, unavailableHours))

  return (
    <>
      <LoadingOverlay visible={isValidating} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      {schedule.date && (
        <Stack>
          <Text fw={700}>Horários disponíveis</Text>
          {availableHourList.length > 0 ? (
            <Grid gutter={10}>
              {availableHourList.map(hour => (
                <Grid.Col key={hour} span={{ base: 3, md: 2 }}>
                  <Button
                    color="orange"
                    variant={schedule.start_time === hour ? "filled" : "outline"}
                    fullWidth
                    p={0}
                    onClick={() => handleChangeSchedule({ start_time: hour })}>
                    {hour}
                  </Button>
                </Grid.Col>
              ))}
            </Grid>
          ) : (
            <Alert variant="light" color="orange" title="Data indisponível" icon={<IconAlertCircle />}>
              Nenhum horário disponível para esta data, selecione outra data.
            </Alert>
          )}
        </Stack>
      )}
    </>
  )
}
