'use client'

import '@mantine/dates/styles.css';

import { Button, Center, Container, Divider, Grid, Group, LoadingOverlay, Modal, MultiSelect, Paper, rem, ScrollArea, Select, Stack, Table, Text, TextInput } from '@mantine/core'
import { DatePicker } from '@mantine/dates'
import { IconSearch } from '@tabler/icons-react'
import Link from 'next/link';
import { redirect } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'

import * as Display from '@/components/display'
import { FormSchedule } from '@/components/forms';
import guardAccount from '@/guards/AccountGuard'
import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'
import { dateToHuman } from '@/utils'
import { dateToDatabase, generateHourList } from '@/utils/dateFormatter';

import classes from './Calendar.module.css'

function Calendar() {
  // Hooks
  const { isAuthenticated, permissionsData, userData } = useAuth()

  // Constants
  const today = new Date()

  // States
  const [search, setSearch] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [searchOrganization, setSearchOrganization] = useState('')
  const [searchCompany, setSearchCompany] = useState('')
  const [searchServices, setSearchServices] = useState([])
  const [searchEmployees, setSearchEmployees] = useState([])
  const [date, setDate] = useState(today)
  const [register, setRegister] = useState(false)

  // Fetch
  const { data, error, mutate } = useFetch([isAuthenticated ? `/admin/companies` : null, { organization_id: userData?.organization_id || searchOrganization }])
  const { data: resultsCompanies = [] } = data?.data || {}
  const optionsCompanies =
    resultsCompanies.map(company => ({ label: company.name, value: company.id.toString() })) || []

  const { data: dataServices } = useFetch([
    permissionsData?.sag ? `/admin/services` : null,
    {
      organization_id: searchOrganization,
      ...(optionsCompanies.length > 1 && searchCompany ? { company: searchCompany } : {})
    }
  ])
  const { data: resultsServices = [] } = dataServices?.data || {}
  const optionsServices =
    resultsServices.map(employee => ({ label: employee.name, value: employee.id.toString() })) || []

  const { data: dataEmployees } = useFetch([
    permissionsData?.sag ? `/admin/employees` : null,
    {
      organization_id: searchOrganization,
      ...(searchServices ? { services: searchServices } : {})
    }
  ])
  const { data: resultsEmployees = [] } = dataEmployees?.data || {}
  const optionsEmployees =
    resultsEmployees.map(employee => ({ label: employee.name, value: employee.id.toString() })) || []

  const { data: dataSchedules } = useFetch([
    isAuthenticated ? '/admin/schedules/calendar' : null,
    {
      search: searchFilter,
      date: dateToDatabase(date),
      ...(searchCompany ? { company: searchCompany } : {}),
      ...(searchEmployees ? { employees: searchEmployees } : {})
    }
  ])
  const { data: results = [] } = dataSchedules || {}
  const loading = !data && !error

  const selectedCompany = resultsCompanies.find(company => company.id === Number(searchCompany))
  const dayOfWeeks = selectedCompany?.days_of_weeks?.find(dayOfWeek => dayOfWeek.day_of_week === date.getDay()) || []
  const hourList = generateHourList(date, dayOfWeeks, '00:30')

  function Th({ children }) {
    return (
      <Table.Th width="auto" className={classes.th}>
        {children}
      </Table.Th>
    )
  }

  // Effects
  useEffect(() => {
    if (resultsCompanies.length === 1) setSearchCompany(resultsCompanies[0].id.toString())
  }, [resultsCompanies])

  // Validations
  if (isAuthenticated === true && permissionsData && !permissionsData.ge) return redirect('/agendamentos')

  return (
    <>
      <Container size="100%" mb="50px">
        <Stack>
          <Group justify="space-between">
            <Text>Agendamentos</Text>

            <Button onClick={() => setRegister(true)}>Adicionar Agendamento</Button>
          </Group>
          <Center>
            <Paper shadow="sm" style={{ backgroundColor: '#333333' }}>
              <DatePicker
                value={date}
                maxLevel="month"
                minDate={today}
                onChange={setDate}
              />
            </Paper>
          </Center>
          <Grid>
            {permissionsData?.sa && (
              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Select
                  placeholder="Empresa"
                  data={optionsOrganizations}
                  value={searchOrganization}
                  onChange={setSearchOrganization}
                  searchable
                  clearable
                />
              </Grid.Col>
            )}
            {optionsCompanies.length > 1 && (
              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Select
                  placeholder="Unidade"
                  data={optionsCompanies}
                  value={searchCompany}
                  onChange={setSearchCompany}
                  searchable
                  clearable
                />
              </Grid.Col>
            )}
            <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
              <TextInput
                placeholder="Buscar por nome ou e-mail do cliente"
                leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                value={search}
                onChange={event => setSearch(event.target.value)}
                onBlur={event => setSearchFilter(event.target.value)}
              />
            </Grid.Col>
            {permissionsData?.sag && (
              <>
                <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                  <MultiSelect
                    placeholder="Serviços"
                    data={optionsServices}
                    searchable
                    value={searchServices}
                    onChange={option => setSearchServices(option)}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                  <MultiSelect
                    placeholder="Colaboradores"
                    data={optionsEmployees}
                    searchable
                    value={searchEmployees}
                    onChange={option => setSearchEmployees(option)}
                  />
                </Grid.Col>
              </>
            )}
          </Grid>
          <Divider />
        </Stack>

        <Stack pos="relative">
          <LoadingOverlay
            visible={loading}
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
            loaderProps={{ type: 'bars' }}
          />
          <ScrollArea h={results.length > 15 ? "55vh" : "auto"} offsetScrollbars>
            <Table horizontalSpacing="xs" verticalSpacing="xs" miw={700} highlightOnHover>
              <Table.Tbody>
                <Table.Tr>
                  <Th>Horário</Th>
                  <Th>Cliente</Th>
                  <Th>Serviço</Th>
                  <Th>Horário</Th>
                  <Th>Confirmado?</Th>
                  <Th>Cancelado?</Th>
                  <Th>Realizado?</Th>
                  <Th>Data Cadastro</Th>
                  <Th>Ações</Th>
                </Table.Tr>
              </Table.Tbody>
              <Table.Tbody>
                {hourList.map(hour => {
                  const scheduleItems = results.filter(scheduleItem => scheduleItem.start_time === hour)
                  return (
                    <Fragment key={hour}>
                      {scheduleItems.length > 0 ? scheduleItems.map((row, index) => {
                        return (
                          <Table.Tr key={row.id}>
                            {index === 0 && <Table.Td className={classes.td} rowSpan={scheduleItems.length}>
                              <strong>{hour}</strong>
                            </Table.Td>}
                            <Table.Td className={classes.td}>
                              {row.schedule?.client?.name}<br />
                              {row.schedule?.client?.mobilePhone ? <a href={`tel:${row.schedule?.client?.mobilePhone}`}>{row.schedule?.client?.mobilePhone}</a> : ''}
                            </Table.Td>
                            <Table.Td className={classes.td}>
                              {row.employee.name}<br />
                              {row.service.name}
                            </Table.Td>
                            <Table.Td className={classes.td}>
                              {row.start_time} - {row.end_time}
                            </Table.Td>
                            <Table.Td className={classes.td}><Display.Status status={row.confirmed} labels={['Sim', 'Não']} /></Table.Td>
                            <Table.Td className={classes.td}><Display.Status status={row.canceled} labels={['Sim', 'Não']} /></Table.Td>
                            <Table.Td className={classes.td}><Display.Status status={row.done} labels={['Sim', 'Não']} /></Table.Td>
                            <Table.Td className={classes.td}>{row.created_at ? dateToHuman(row.created_at) : ''}</Table.Td>
                            <Table.Td className={classes.td}>
                              <Group gap="xs">
                                <Button size="compact-sm" component={Link} color="orange" title="Editar" href={`/agendamentos/${row.schedule_id}`}>Editar</Button>
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        )
                      }) : (
                        <Table.Tr className={classes.tr}>
                          <Table.Td className={classes.td}><strong>{hour}</strong></Table.Td>
                          <Table.Td className={classes.td} colSpan={8}></Table.Td>
                        </Table.Tr>
                      )}
                    </Fragment>
                  )
                })}
                {hourList.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={9}>
                      <Text fw={500} ta="center">
                        Nenhum horário disponível
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Stack>
      </Container>

      <Modal opened={register} onClose={() => setRegister(false)} title="Agendar" centered>
        <FormSchedule.Basic mutate={mutate} />
      </Modal>
    </>
  )
}

export default guardAccount(Calendar)
