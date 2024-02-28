'use client'

import { Box, Button, Center, Container, Group, LoadingOverlay, Modal, Pagination, rem, ScrollArea, Stack, Table, Text, TextInput } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { redirect } from 'next/navigation'
import { Fragment, useState } from 'react'

import * as Display from '@/components/display'
import { FormSchedule } from '@/components/forms'
import guardAccount from '@/guards/AccountGuard'
import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'
import { dateToHuman } from '@/utils'

import classes from './Agendamentos.module.css'

function Agendamentos() {
  // Hooks
  const { isAuthenticated, permissionsData } = useAuth()

  // States
  const [search, setSearch] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [page, setPage] = useState(1)
  const [register, setRegister] = useState(false)

  // Fetch
  const { data, error, mutate } = useFetch([isAuthenticated && permissionsData?.sa ? '/admin/schedules' : null, { search: searchFilter, page }])
  const { data: results = [], last_page } = data?.data || {}
  const loading = !data && !error

  function Th({ children }) {
    return (
      <Table.Th width="auto" className={classes.th}>
        {children}
      </Table.Th>
    )
  }

  // Validations
  if (isAuthenticated === true && permissionsData && !permissionsData.sa) return redirect('/agendamentos/calendario')

  return (
    <Container size="100%" mb="50px">
      <Stack>
        <Group justify="space-between">
          <Text>Agendamentos</Text>

          <Button onClick={() => setRegister(true)}>Adicionar Agendamento</Button>
        </Group>

        <Box pos="relative">
          <LoadingOverlay
            visible={loading}
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
            loaderProps={{ color: 'pink', type: 'bars' }}
          />
        </Box>
        <TextInput
          placeholder="Buscar por cliente"
          mb="md"
          leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
          value={search}
          onChange={event => setSearch(event.target.value)}
          onBlur={event => setSearchFilter(event.target.value)}
        />
        <ScrollArea h={results.length > 15 ? "55vh" : "auto"} offsetScrollbars>
          <Table horizontalSpacing="xs" verticalSpacing="xs" miw={700} highlightOnHover>
            <Table.Tbody>
              <Table.Tr>
                <Th>Cliente</Th>
                <Th>Agendamento</Th>
                <Th>Serviço</Th>
                <Th>Confirmado?</Th>
                <Th>Cancelado?</Th>
                <Th>Realizado?</Th>
                <Th>Data Cadastro</Th>
                <Th>Ações</Th>
              </Table.Tr>
            </Table.Tbody>
            <Table.Tbody>
              {results.length > 0 ? results.map((row) => {
                return (
                  <Table.Tr key={row.id}>
                    <Table.Td className={classes.td}>
                      {row.client?.name}<br />
                      {row.client?.mobilePhone ? <a href={`tel:${row.client?.mobilePhone}`}>{row.client?.mobilePhone}</a> : ''}
                    </Table.Td>
                    <Table.Td className={classes.td}>{row.date ? dateToHuman(`${row.date}T03:00:00.000Z`, 'date') : ''}</Table.Td>
                    <Table.Td className={classes.td}>
                      {row.schedule_items?.map((scheduleItem, index) => (
                        <Fragment key={scheduleItem.id}>
                          - {scheduleItem.service.name} ({scheduleItem.employee.name}){index < row.schedule_items.length - 1 ? <br /> : ""}
                        </Fragment>
                      ))}
                    </Table.Td>
                    <Table.Td className={classes.td}><Display.Status status={row.confirmed} labels={['Sim', 'Não']} /></Table.Td>
                    <Table.Td className={classes.td}><Display.Status status={row.canceled} labels={['Sim', 'Não']} /></Table.Td>
                    <Table.Td className={classes.td}><Display.Status status={row.done} labels={['Sim', 'Não']} /></Table.Td>
                    <Table.Td className={classes.td}>{row.created_at ? dateToHuman(row.created_at) : ''}</Table.Td>
                    <Table.Td className={classes.td}>
                      <Group gap="xs">
                        <Button size="compact-sm" component="a" color="orange" title="Editar" href={`/agendamentos/${row.id}`}>Editar</Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                )
              }) : (
                <Table.Tr>
                  <Table.Td colSpan={8}>
                    <Text fw={500} ta="center">
                      Nenhum agendamento encontrado
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
        {last_page > 1 && (
          <Center>
            <Pagination total={last_page} defaultValue={page} onChange={setPage} />
          </Center>
        )}
      </Stack>

      <Modal opened={register} onClose={() => setRegister(false)} title="Agendar" centered>
        <FormSchedule.Basic mutate={mutate} />
      </Modal>
    </Container>
  )
}

export default guardAccount(Agendamentos)
