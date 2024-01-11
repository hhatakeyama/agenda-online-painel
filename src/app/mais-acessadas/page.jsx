'use client'

import { Box, Center, Container, Grid, Loader, LoadingOverlay, Pagination, rem, ScrollArea, Select, Stack, Table, Text, TextInput } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'

import classes from './MaisAcessadas.module.css'

export default function MaisAcessadas() {
  // Hooks
  const router = useRouter()
  const { isAuthenticated, permissionsData } = useAuth()

  // Constants
  const { permissions } = permissionsData || {}

  // States
  const [search, setSearch] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [evento, setEvento] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [pagina, setPagina] = useState(1)

  // Fetch
  const { data, error } = useFetch([isAuthenticated ? '/admin/events/paginasMaisAcessadas' : null, { busca: searchFilter, evento, dataInicio, dataFim, pagina }])
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

  if (permissions?.find(item => item !== 's' && item !== 'a')) return router.push('/')

  return (
    <Container size="100%" mb="50px">
      <Stack>
        <Text>Mais acessadas</Text>

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
            <Grid.Col span={3}>
              <TextInput
                placeholder="Buscar por mensagem ou URL"
                mb="md"
                leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                value={search}
                onChange={event => setSearch(event.target.value)}
                onBlur={event => setSearchFilter(event.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Select
                placeholder="Evento"
                data={[{ value: '', label: 'Todos' }, { value: 'whatsapp', label: 'Whatsapp' }, { value: 'telefone', label: 'Telefone' }]}
                onChange={option => setEvento(option)}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput
                placeholder="Data Início"
                type="date"
                value={dataInicio}
                onChange={event => setDataInicio(event.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput
                placeholder="Data Fim"
                type="date"
                value={dataFim}
                onChange={event => setDataFim(event.target.value)}
              />
            </Grid.Col>
          </Grid>
          <Table horizontalSpacing="xs" verticalSpacing="xs" miw={700}>
            <Table.Tbody>
              <Table.Tr>
                <Th>Evento</Th>
                <Th>Mensagem</Th>
                <Th>Acessos</Th>
              </Table.Tr>
            </Table.Tbody>
            <Table.Tbody>
              {data?.data?.length > 0 ? data?.data?.map((row) => {
                return (
                  <Table.Tr key={row.id} className={classes.tr}>
                    <Table.Td className={classes.td}>{row.evento}</Table.Td>
                    <Table.Td className={classes.td}>{row.url}</Table.Td>
                    <Table.Td className={classes.td}>{row.count}</Table.Td>
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
                    <Pagination total={data?.last_page} defaultValue={pagina} onChange={setPagina} />
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
