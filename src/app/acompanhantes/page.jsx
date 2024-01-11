'use client'

import { Badge, Box, Button, Center, Container, Group, Loader, Modal, Pagination, rem, ScrollArea, Stack, Table, Text, TextInput } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { IconExternalLink, IconSearch } from '@tabler/icons-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'
import { api, dateToHuman } from '@/utils'

import classes from './TableSort.module.css'

export default function Acompanhantes() {
  // Hooks
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  // States
  const [pagina, setPagina] = useState(1)
  const [search, setSearch] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [opened, setOpened] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch
  const { data, mutate } = useFetch([isAuthenticated ? '/admin/acompanhantes' : null, { busca: searchFilter, pagina }])
  const { data: acompanhantes = [] } = data || {}

  // Actions
  const handleChangeOrdem = (acompanhanteId, value) => {
    return api
      .patch(`/admin/acompanhantes/${acompanhanteId}/ordem`, { ordem: value })
      .then(response => {
        mutate()
        showNotification({ title: 'Sucesso', message: response?.message || 'Ordem da acompanhante atualizada com sucesso!', color: 'green' })
      })
      .catch(response => {
        showNotification({
          title: 'Erro',
          message: response?.message || 'Ocorreu um erro ao atualizar ordem da acompanhante. Tente novamente mais tarde.',
          color: 'red'
        })
      })
  }

  const handleDelete = () => {
    setIsDeleting(true)
    if (opened?.usuario?.id) {
      return api
        .delete(`/admin/acompanhantes/${opened.user_id}`)
        .then(response => {
          mutate?.()
          setOpened(null)
          showNotification({ title: 'Sucesso', message: response?.data?.message || 'Acompanhante desativada com sucesso!', color: 'green' })
        })
        .catch(response => {
          showNotification({
            title: 'Erro',
            message: response?.data?.message || 'Ocorreu um erro ao desativar acompanhante. Tente novamente mais tarde.',
            color: 'red'
          })
        })
        .finally(() => setIsDeleting(false))
    }
  }

  // Effects
  useEffect(() => {
    if (isAuthenticated === false) return router.push('/')
  }, [isAuthenticated, router])

  if (isAuthenticated === null) return <Center style={{ height: '400px' }}><Loader color="blue" /></Center>

  function Th({ children }) {
    return (
      <Table.Th width="auto" className={classes.th}>
        {children}
      </Table.Th>
    )
  }

  return (
    <>
      <Container size="100%" mb="50px">
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
                <Th>Foto</Th>
                <Th>Nome</Th>
                <Th>E-mail</Th>
                <Th>Ativo</Th>
                <Th>Expira em</Th>
                <Th>Ordem</Th>
                <Th>Ações</Th>
              </Table.Tr>
            </Table.Tbody>
            <Table.Tbody>
              {acompanhantes.length > 0 ? acompanhantes?.map((row) => {
                const expira = row.periodoAtual?.data_fim ? new Date(row.periodoAtual.data_fim) : false
                // const aviso = new Date("Y-m-d")
                // const dataFim = new Date("d/m/Y")
                // if (expira) {
                //   aviso = date("Y-m-d", strtotime('-7 day', strtotime(expira)))
                //   const dataFimArray = expira.split("-")
                //   dataFim = dataFimArray[2] + "/" + dataFimArray[1] + "/" + dataFimArray[0]
                // }
                let texto = ''
                if (row.telefones?.[0] && row.url) {
                  const whatsapp = row.telefones[0].numero
                  const dataInicio = dateToHuman(row.created_at)
                  texto = `Olá ${row.nome}, aqui é o Rodrigo do time do site Gata Completa.\n
                  Você tem um anúncio conosco ativo desde ${dataInicio} e o motivo do contato é para saber se você ainda está realizando serviços como acompanhante.\n\n
            
                  Os dados do seu anúncio são:\n
                    Link: ${row.url}\n\n
            
                  Cidade Atual: ${row.cidadeAtual}\n
                    WhatsApp: ${whatsapp}\n\n
            
                  Os dados acima estão corretos? Precisa alterar algo?\n\n
                  
                  Obrigado por sua atenção.`
                }
                const fotoDestaque = row.fotoDestaque && row.fotoDestaque.length > 0
                  ? row.fotoDestaque[0].path + '/210x314-' + row.fotoDestaque[0].nome
                  : (row.fotos && row.fotos.length > 0 ? row.fotos[0].path + '/210x314-' + row.fotos[0].nome : '/img/sem-foto.jpg')
                return (
                  <Table.Tr key={row.user_id} className={classes.tr}>
                    <Table.Td className={classes.td}>{row.user_id}</Table.Td>
                    <Table.Td className={classes.td}>
                      <Image alt="" src={"https://admin.gatacompleta.com" + fotoDestaque} width={54} height={80} />
                    </Table.Td>
                    <Table.Td className={classes.td}>
                      <Box display="flex" style={{ alignItems: 'center', gap: '5px' }}>
                        {row.nome}
                        {row.url ? <a href={row.url} style={{ display: 'flex' }} target="_blank" rel="noreferrer"><IconExternalLink size="18" /></a> : null}
                      </Box>
                    </Table.Td>
                    <Table.Td className={classes.td}>{row.usuario.email}</Table.Td>
                    <Table.Td className={classes.td}>
                      {row.status === '1' ? (
                        <Badge size="sm" color="green">Ativo</Badge>
                      ) : (
                        <Badge size="sm" color="red">Inativo</Badge>
                      )}
                    </Table.Td>
                    <Table.Td className={classes.td}>{expira ? dateToHuman(expira) : ''}</Table.Td>
                    <Table.Td className={classes.td}>
                      <TextInput
                        defaultValue={row.ordem}
                        placeholder="Ordem"
                        onBlur={e => {
                          const { value } = e.target || {}
                          if (Number(value) !== Number(row.ordem)) handleChangeOrdem(row.user_id, value)
                        }}
                      />
                    </Table.Td>
                    <Table.Td className={classes.td}>
                      <Group gap="xs">
                        {row.whatsapp && row.url &&
                          <Button size="compact-sm" component="a" color="green" title="WhatsApp" href={`https://wa.me/+55${row.whatsapp}?text=${texto}`}>WhatsApp</Button>
                        }
                        <Button size="compact-sm" component="a" color="blue" title="Agenda" href={`/acompanhantes/${row.user_id}/agendas`}>Agenda</Button>
                        <Button size="compact-sm" component="a" color="orange" title="Editar" href={`/acompanhantes/${row.user_id}`}>Editar</Button>
                        <Button size="compact-sm" color="red" title="Desativar" disabled={isDeleting} onClick={() => setOpened(row)}>Desativar</Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                )
              }) : (
                <Table.Tr>
                  <Table.Td colSpan={8}>
                    <Text fw={500} ta="center">
                      Nenhuma acompanhante encontrada
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
            <Table.Tfoot>
              <Table.Tr>
                <Table.Td colSpan={8}>
                  <Center>
                    <Pagination total={data?.last_page} defaultValue={pagina} onChange={setPagina} />
                  </Center>
                </Table.Td>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </ScrollArea>
      </Container>
      <Modal centered opened={!!opened} onClose={() => setOpened(null)} title="Desativar acompanhante">
        <Stack>
          <Text>Tem certeza que deseja desativar a acompanhante <strong>{opened?.nome}</strong>?</Text>
          <Box>
            <Button color="red" onClick={handleDelete}>Desativar</Button>
          </Box>
        </Stack>
      </Modal>
    </>
  )
}
