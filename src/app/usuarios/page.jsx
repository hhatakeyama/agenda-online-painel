'use client'

import { Badge, Box, Button, Center, Container, Group, Loader, LoadingOverlay, Pagination, rem, ScrollArea, Stack, Table, Text, TextInput } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'
import { dateToHuman } from '@/utils'

import classes from './Usuarios.module.css'

export default function Usuarios() {
  // Hooks
  const router = useRouter()
  const { isAuthenticated, permissionsData } = useAuth()

  // Constants
  const { permissions } = permissionsData || {}

  // States
  const [search, setSearch] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [pagina, setPagina] = useState(1)

  // Fetch
  const { data, error } = useFetch([isAuthenticated ? '/admin/usuarios/' : null, { busca: searchFilter, pagina }])
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
        <Text>Usuários</Text>

        <Box pos="relative">
          <LoadingOverlay
            visible={loading}
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
            loaderProps={{ color: 'pink', type: 'bars' }}
          />
        </Box>
        <ScrollArea>
          <TextInput
            placeholder="Buscar por nome ou e-mail"
            mb="md"
            leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
            value={search}
            onChange={event => setSearch(event.target.value)}
            onBlur={event => setSearchFilter(event.target.value)}
          />
          <Table horizontalSpacing="xs" verticalSpacing="xs" miw={700}>
            <Table.Tbody>
              <Table.Tr>
                <Th>ID</Th>
                <Th>Nome</Th>
                <Th>E-mail</Th>
                <Th>Ativo</Th>
                <Th>Data Cadastro</Th>
                <Th>Ações</Th>
              </Table.Tr>
            </Table.Tbody>
            <Table.Tbody>
              {data?.data?.length > 0 ? data?.data?.map((row) => {
                return (
                  <Table.Tr key={row.id} className={classes.tr}>
                    <Table.Td className={classes.td}>{row.id}</Table.Td>
                    <Table.Td className={classes.td}>
                      <Box display="flex" style={{ alignItems: 'center', gap: '5px' }}>
                        {row.name}
                      </Box>
                    </Table.Td>
                    <Table.Td className={classes.td}>{row.email}</Table.Td>
                    <Table.Td className={classes.td}>
                      {row.status === '1' ? (
                        <Badge size="sm" color="green">Ativo</Badge>
                      ) : (
                        <Badge size="sm" color="red">Inativo</Badge>
                      )}
                    </Table.Td>
                    <Table.Td className={classes.td}>{row.created_at ? dateToHuman(row.created_at) : ''}</Table.Td>
                    <Table.Td className={classes.td}>
                      <Group gap="xs">
                        <Button size="compact-sm" component="a" color="orange" title="Editar" href={`/usuarios/${row.id}`}>Editar</Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                )
              }) : (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text fw={500} ta="center">
                      Nenhum usuário encontrado
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
