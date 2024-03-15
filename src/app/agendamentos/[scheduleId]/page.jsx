'use client'

import { Avatar, Box, Button, Container, Divider, Grid, Group, Paper, Stack, Text, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconMail, IconPhone } from '@tabler/icons-react'
import Link from 'next/link'
import { redirect, useParams } from 'next/navigation'
import React from 'react'

import * as Display from '@/components/display'
import guardAccount from '@/guards/AccountGuard'
import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'
import { api, dateToHuman, parseMinutes } from '@/utils'
import { currencyValue } from '@/utils/converter'

function Agendamento() {
  // Hooks
  const { isAuthenticated, permissionsData } = useAuth()
  const { scheduleId } = useParams()

  // Constants
  const typesMessages = {
    cancel: 'cancelado',
    confirm: 'confirmado',
    done: 'realizado',
  }

  // Fetch
  const { data, error, mutate } = useFetch([isAuthenticated ? `/admin/schedules/${scheduleId}` : null])
  const { data: scheduleData } = data || {}

  let total = 0;
  let totalDuration = 0;
  scheduleData?.schedule_items?.map(item => {
    total += Number(item.price)
    totalDuration += Number(parseMinutes(item.duration))
  })

  // Validations
  if ((isAuthenticated === false) || !!error) return redirect('/')

  // Actions
  const handleChangeSchedule = (type, status) => {
    return api
      .patch(`/api/admin/schedules/${scheduleId}/${type}`, { status })
      .then(() => {
        mutate()
        notifications.show({
          title: 'Sucesso',
          message: `Serviço atualizado para '${status === 0 ? 'não ' : ''}${typesMessages[type]}' com sucesso!`,
          color: 'green'
        })
      })
      .catch(e => {
        notifications.show({
          title: 'Erro',
          message: e.response?.data?.message ||
            `Ocorreu um erro ao tentar ${typesMessages[type]} o agendamento. Tente novamente mais tarde.`,
          color: 'red'
        })
      })
  }

  return (
    <Container size="100%" mb="50px">
      <Stack>
        <Group justify="space-between">
          <Button component={Link} href={permissionsData?.sa ? "/agendamentos" : "/agendamentos/calendario"}>Voltar</Button>
        </Group>
        <Stack>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Paper p="md" withBorder>
                <Title order={2} mb="md">Agendamento</Title>
                <Text size="lg">
                  <strong>Data: {scheduleData?.date ? dateToHuman(scheduleData?.date, 'date') : ''}</strong>
                </Text>
                {scheduleData?.schedule_items?.length && (
                  <>
                    <Text>
                      <strong>Hora</strong>:{' '}
                      {scheduleData?.schedule_items[0].start_time}{' - '}
                      {scheduleData?.schedule_items[scheduleData?.schedule_items.length - 1].end_time}{' '}
                      ({totalDuration}min)
                    </Text>
                    <Text><strong>Preço</strong>: {currencyValue(total)}</Text>
                  </>
                )}
                <Text>
                  <strong>Local</strong>:{' '}
                  {scheduleData?.company?.name}<br />
                  {scheduleData?.company?.address}, {scheduleData?.company?.district}, {scheduleData?.company?.city?.name}/{scheduleData?.company?.state}
                </Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Paper p="md" withBorder>
                <Title order={2} mb="md">Cliente</Title>
                <Stack>
                  <Box>
                    <Text><strong>Nome</strong>: {scheduleData?.client?.name}</Text>
                    <Text><strong>Confirmado?</strong>: <Display.Status status={scheduleData?.confirmed} labels={['Sim', 'Não']} /></Text>
                    <Text><strong>Cancelado?</strong>: <Display.Status status={scheduleData?.canceled} labels={['Sim', 'Não']} /></Text>
                    <Text><strong>Realizado?</strong>: <Display.Status status={scheduleData?.done} labels={['Sim', 'Não']} /></Text>
                  </Box>
                  {scheduleData?.client?.email && (
                    <Box>
                      <Button
                        component="a"
                        href={`mailto:${scheduleData.client.email}`}
                        leftSection={<IconMail />}>
                        {scheduleData.client.email}
                      </Button>
                    </Box>
                  )}
                  {scheduleData?.client?.mobilePhone && (
                    <Box>
                      <Button
                        component="a"
                        href={`tel:${scheduleData.client.mobilePhone}`}
                        leftSection={<IconPhone />}>
                        {scheduleData.client.mobilePhone}
                      </Button>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>

          <Text size="lg" fw={700}>Serviços</Text>
          <Grid justify="center">
            {scheduleData?.schedule_items?.map(item => (
              <Grid.Col span={{ base: 12 }} key={`scheduleItem-${item.id}`}>
                <Paper p="md" radius="md" withBorder>
                  <Grid>
                    <Grid.Col span={{ base: 12, xs: 4 }}>
                      <Stack align="center" gap={2}>
                        <Avatar src={item.employee?.picture || ''} size={50} />
                        <Text size="sm" fw={700}>{item.employee?.name}</Text>
                      </Stack>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, xs: 8 }}>
                      <Stack align="center" gap={2}>
                        <Title order={4} fw={700} align="center">{item.service?.name || ''}</Title>
                        <Divider />
                        <Text fw={700} c="orange">{item.service?.price ? currencyValue(item.service.price) : ''}</Text>
                        <Text size="sm">Agendado: <strong>{item.start_time || '--'} - {item.end_time || '--'}</strong></Text>
                        <Text size="sm">Duração: <strong>{item.service.duration || ''}</strong></Text>
                      </Stack>
                    </Grid.Col>
                  </Grid>
                </Paper>
              </Grid.Col>
            ))}
          </Grid>

          <Group justify="center">
            <Button
              size="lg"
              onClick={() => handleChangeSchedule('confirm', scheduleData?.confirmed === 1 ? 0 : 1)}>
              {scheduleData?.confirmed === 1 ? "Confirmado" : "Confirmar agendamento"}
            </Button>
            <Button
              size="lg"
              color="green"
              onClick={() => handleChangeSchedule('done', scheduleData?.done === 1 ? 0 : 1)}>
              {scheduleData?.done === 1 ? "Finalizado" : "Finalizar agendamento"}
            </Button>
            <Button
              size="lg"
              color="red"
              onClick={() => handleChangeSchedule('cancel', scheduleData?.canceled === 1 ? 0 : 1)}>
              {scheduleData?.canceled === 1 ? "Cancelado" : "Cancelar agendamento"}
            </Button>
          </Group>
        </Stack>
      </Stack>
    </Container>
  )
}

export default guardAccount(Agendamento)
