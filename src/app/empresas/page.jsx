'use client'

import { Button, Center, Container, Divider, Grid, Group, LoadingOverlay, Modal, Pagination, rem, ScrollArea, Stack, Table, Text, TextInput } from '@mantine/core'
import { IconExternalLink, IconSearch } from '@tabler/icons-react'
import { redirect } from 'next/navigation'
import { useState } from 'react'

import * as Display from '@/components/display'
import { FormOrganization } from '@/components/forms'
import guardAccount from '@/guards/AccountGuard'
import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'
import { dateToHuman } from '@/utils'

import classes from './Organizations.module.css'

function Organizations() {
  // Hooks
  const { isAuthenticated, permissionsData } = useAuth()

  // States
  const [search, setSearch] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [page, setPage] = useState(1)
  const [register, setRegister] = useState(false)

  // Fetch
  const { data, error, mutate } = useFetch([isAuthenticated ? '/admin/organizations/' : null, { search: searchFilter, page }])
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
  if (isAuthenticated === true && permissionsData && !permissionsData.sa) return redirect('/')

  return (
    <Container size="100%" mb="50px">
      <Stack mb="md">
        <Group justify="space-between">
          <Text>Empresas</Text>

          <Button onClick={() => setRegister(true)}>Adicionar Empresa</Button>
        </Group>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              placeholder="Buscar por razão social, nome fantasia ou cnpj"
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
                <Th>Razão Social</Th>
                <Th>Nome Fantasia</Th>
                <Th>CNPJ</Th>
                <Th>Ativo</Th>
                <Th>Data Cadastro</Th>
                <Th><Text inherit ta="right">Ações</Text></Th>
              </Table.Tr>
            </Table.Tbody>
            <Table.Tbody>
              {results.length > 0 ? results.map((row) => {
                return (
                  <Table.Tr key={row.id}>
                    <Table.Td className={classes.td}>{row.registeredName}</Table.Td>
                    <Table.Td className={classes.td}>{row.tradingName}</Table.Td>
                    <Table.Td className={classes.td}>{row.cnpj}</Table.Td>
                    <Table.Td className={classes.td}><Display.Status status={row.status} /></Table.Td>
                    <Table.Td className={classes.td}>{row.created_at ? dateToHuman(row.created_at) : '--'}</Table.Td>
                    <Table.Td className={classes.td}>
                      <Group gap="xs" justify="flex-end">
                        <Button size="compact-sm" component="a" color="blue" title="Ver Site" href={`${process.env.NEXT_PUBLIC_SITE_DOMAIN}/e/${row.slug}`}><IconExternalLink /> Ver Site</Button>
                        <Button size="compact-sm" component="a" color="orange" title="Editar" href={`/empresas/${row.id}`}>Editar</Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                )
              }) : (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Text fw={500} ta="center">
                      Nenhuma empresa encontrada
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
        {last_page > 1 && (
          <Center>
            <Pagination total={last_page || 0} defaultValue={page || 0} onChange={setPage} />
          </Center>
        )}
      </Stack>

      <Modal opened={register} onClose={() => setRegister(false)} title="Cadastrar empresa" centered>
        <FormOrganization.Basic onClose={() => {
          setRegister(false)
          mutate()
        }} />
      </Modal>
    </Container>
  )
}

export default guardAccount(Organizations)
