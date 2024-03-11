'use client'

import { Button, Center, Container, Divider, Grid, Group, LoadingOverlay, Modal, Pagination, rem, ScrollArea, Select, Stack, Table, Text, TextInput } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useState } from 'react'

import * as Display from '@/components/display'
import { FormEmployee } from '@/components/forms'
import guardAccount from '@/guards/AccountGuard'
import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'
import { dateToHuman } from '@/utils'

import classes from './Employees.module.css'

function Employees() {
  // Hooks
  const { isAuthenticated, permissionsData } = useAuth()

  // States
  const [search, setSearch] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [searchOrganization, setSearchOrganization] = useState('')
  const [page, setPage] = useState(1)
  const [register, setRegister] = useState(false)

  // Fetch
  const { data, error, mutate } = useFetch([
    isAuthenticated ? '/admin/employees' : null,
    { search: searchFilter, page, ...(searchOrganization ? { organization_id: searchOrganization } : {}) }
  ])
  const { data: results = [], last_page } = data?.data || {}
  const loading = !data && !error

  const { data: dataOrganizations } = useFetch([permissionsData?.sa ? `/admin/organizations` : null])
  const { data: resultsOrganizations = [] } = dataOrganizations?.data || {}
  const optionsOrganizations =
    resultsOrganizations.map(organization => ({ label: organization.registeredName, value: organization.id.toString() })) || []

  function Th({ children }) {
    return (
      <Table.Th width="auto" className={classes.th}>
        {children}
      </Table.Th>
    )
  }

  // Validations
  if (isAuthenticated === true && permissionsData && !permissionsData.sag) return redirect('/')

  return (
    <Container size="100%" mb="50px">
      <Stack mb="md">
        <Group justify="space-between">
          <Text>Funcionários</Text>

          <Button onClick={() => setRegister(true)}>Adicionar Funcionário</Button>
        </Group>
        <Grid>
          {permissionsData?.sa && (
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
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
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              placeholder="Buscar por nome ou e-mail"
              leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
              value={search}
              onChange={event => setSearch(event.target.value)}
              onBlur={event => setSearchFilter(event.target.value)}
            />
          </Grid.Col>
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
                {permissionsData?.sa && <Th>Empresa</Th>}
                <Th>Nome</Th>
                <Th>E-mail</Th>
                <Th>Cargo</Th>
                <Th>Serviços</Th>
                <Th>Ativo</Th>
                <Th>Data Cadastro</Th>
                <Th><Text inherit ta="right">Ações</Text></Th>
              </Table.Tr>
            </Table.Tbody>
            <Table.Tbody>
              {results.length > 0 ? results.map((row) => {
                return (
                  <Table.Tr key={row.id}>
                    {permissionsData?.sa && <Table.Td className={classes.td}>{row.organization?.tradingName || '--'}</Table.Td>}
                    <Table.Td className={classes.td}>{row.name}</Table.Td>
                    <Table.Td className={classes.td}>{row.email}</Table.Td>
                    <Table.Td className={classes.td}>{row.occupation || '--'}</Table.Td>
                    <Table.Td className={classes.td}>{row.employee_services.length}</Table.Td>
                    <Table.Td className={classes.td}><Display.Status status={row.status} /></Table.Td>
                    <Table.Td className={classes.td}>{row.created_at ? dateToHuman(row.created_at) : '--'}</Table.Td>
                    <Table.Td className={classes.td}>
                      <Group gap="xs" justify="flex-end">
                        <Button size="compact-sm" component={Link} color="orange" title="Editar" href={`/funcionarios/${row.id}`}>Editar</Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                )
              }) : (
                <Table.Tr>
                  <Table.Td colSpan={permissionsData?.sa ? 8 : 7}>
                    <Text fw={500} ta="center">
                      Nenhum funcionário encontrado
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
      
      <Modal opened={register} onClose={() => setRegister(false)} title="Cadastrar funcionário" centered>
        <FormEmployee.Basic onClose={() => {
          setRegister(false)
          mutate()
        }} />
      </Modal>
    </Container>
  )
}

export default guardAccount(Employees)
