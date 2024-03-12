import { Button, Center, Container, Group, Input, LoadingOverlay, Modal, Pagination, ScrollArea, Stack, Table, Text, Title } from '@mantine/core'
import React, { useState } from 'react'

import { FormUser } from '@/components/forms'
import { useFetch } from '@/hooks'
import { useSchedule } from '@/providers/ScheduleProvider'

import classes from './Schedule.module.css'

export default function ClientSelector() {
  // Hooks
  const { schedule, handleChangeSchedule } = useSchedule()

  // States
  const [register, setRegister] = useState(false)
  const [search, setSearch] = useState('')

  // Fetch
  const { data, error } = useFetch([`/admin/clients`, { status: "1", search }])
  const { data: results = [], last_page } = data?.data || {}
  const loading = !data && !error

  function Th({ children }) {
    return (
      <Table.Th width="auto" className={classes.th}>
        {children}
      </Table.Th>
    )
  }

  return (
    <>
      <Stack>
        <Group justify="space-between">
          <Title order={3}>Clientes</Title>

          <Button size="sm" color="orange" onClick={() => setRegister(true)} style={{ cursor: 'pointer' }}>
            Cadastrar cliente
          </Button>
        </Group>
        <Text c="dimmed" fz="sm">Busque o cliente que vai fazer o atendimento.</Text>

        <Group>
          <Input name="search" placeholder="Buscar por e-mail" value={search} onChange={e => setSearch(e.target.value)} />
        </Group>

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
                  <Th>Nome</Th>
                  <Th>E-mail</Th>
                  <Th>Telefone/Celular</Th>
                  <Th><Text inherit ta="right">Ações</Text></Th>
                </Table.Tr>
              </Table.Tbody>
              <Table.Tbody>
                {results.length > 0 ? results.map((row) => {
                  const selected = schedule?.client_id === row.id
                  return (
                    <Table.Tr key={row.id}>
                      <Table.Td className={classes.td}>{row.name}</Table.Td>
                      <Table.Td className={classes.td}>{row.email}</Table.Td>
                      <Table.Td className={classes.td}>{row.mobilePhone || '--'}</Table.Td>
                      <Table.Td className={classes.td}>
                        <Group justify="flex-end">
                          <Button size="compact-sm" color={selected ? 'orange' : 'blue'} title="Editar" onClick={() => handleChangeSchedule({ client_id: row.id })}>
                            {selected ? 'Selecionado' : 'Selecionar'}
                          </Button>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  )
                }) : (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Text fw={500} ta="center">
                        Nenhum cliente encontrado
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
      </Stack>
      <Modal opened={register} onClose={() => setRegister(false)} title="Cadastrar cliente" centered>
        <Container size="xl" style={{ maxWidth: '400px', width: '100%' }}>
          <Stack>
            <Text c="dimmed" fz="sm" ta="center">
              Preencha os campos abaixo para cadastrar o cliente.
            </Text>
            <FormUser.Basic onClose={() => { }} />
            <Center>
              <Text size="sm" c="orange" component="a" onClick={() => setRegister(false)} style={{ cursor: 'pointer' }}>
                cliente já tem cadastro
              </Text>
            </Center>
          </Stack>
        </Container>
      </Modal>
    </>
  )
}
