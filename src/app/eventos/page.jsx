'use client'

import { Box, Center, Container, Grid, Loader, LoadingOverlay, Pagination, rem, ScrollArea, Select, Stack, Table, Text, TextInput } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'
import { dateToHuman } from '@/utils'

import classes from './Eventos.module.css'

export default function Eventos() {
  // Hooks
  const router = useRouter()
  const { isAuthenticated, permissionsData } = useAuth()

  // States
  const [search, setSearch] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [evento, setEvento] = useState('')
  const [page, setPage] = useState(1)

  // Fetch
  const { data, error } = useFetch([isAuthenticated ? '/admin/events/' : null, { busca: searchFilter, page, evento }])
  const loading = !data && !error

  function Th({ children }) {
    return (
      <Table.Th width="auto" className={classes.th}>
        {children}
      </Table.Th>
    )
  }

  // Effects
  useEffect(() => {
    if (isAuthenticated === false) return router.push('/accounts/login')
  }, [isAuthenticated, router])

  // Validations
  if (isAuthenticated === null) return <Center style={{ height: '400px' }}><Loader color="blue" /></Center>

  if (isAuthenticated === true && permissionsData && !permissionsData.sa) return router.push('/')

  return (
    <Container size="100%" mb="50px">
      <Stack>
        <Text>Eventos</Text>

        <Box pos="relative">
          <LoadingOverlay
            visible={loading}
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
            loaderProps={{ color: 'pink', type: 'bars' }}
          />
        </Box>
        <ScrollArea>
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                placeholder="Buscar por mensagem"
                mb="md"
                leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                value={search}
                onChange={event => setSearch(event.target.value)}
                onBlur={event => setSearchFilter(event.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                placeholder="Evento"
                data={[{ value: '', label: 'Todos' }, { value: 'whatsapp', label: 'Whatsapp' }, { value: 'telefone', label: 'Telefone' }]}
                onChange={option => setEvento(option)}
              />
            </Grid.Col>
          </Grid>
          <Table horizontalSpacing="xs" verticalSpacing="xs" miw={700}>
            <Table.Tbody>
              <Table.Tr>
                <Th>ID</Th>
                <Th>Evento</Th>
                <Th>Mensagem</Th>
                <Th>URL</Th>
                <Th>Data Evento</Th>
              </Table.Tr>
            </Table.Tbody>
            <Table.Tbody>
              {data?.data?.length > 0 ? data?.data?.map((row) => {
                return (
                  <Table.Tr key={row.id} className={classes.tr}>
                    <Table.Td className={classes.td}>{row.id}</Table.Td>
                    <Table.Td className={classes.td}>
                      <Box display="flex" style={{ alignItems: 'center', gap: '5px' }}>
                        {row.evento}
                      </Box>
                    </Table.Td>
                    <Table.Td className={classes.td}>{row.mensagem}</Table.Td>
                    <Table.Td className={classes.td}>{row.url}</Table.Td>
                    <Table.Td className={classes.td}>{row.created_at ? dateToHuman(row.created_at) : ''}</Table.Td>
                  </Table.Tr>
                )
              }) : (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text fw={500} ta="center">
                      Nenhum evento encontrado
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
            <Table.Tfoot>
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Center>
                    <Pagination total={data?.last_page} defaultValue={page} onChange={setPage} />
                  </Center>
                </Table.Td>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </ScrollArea>
      </Stack>
    </Container>
  )
}
