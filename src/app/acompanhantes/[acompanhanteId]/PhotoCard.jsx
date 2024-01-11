import { Button, ButtonGroup, Card, Group, Image, TextInput } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconPlus, IconRotate, IconRotateClockwise, IconStar, IconStarFilled, IconX } from '@tabler/icons-react'
import React, { useState } from 'react'

import { api } from '@/utils'

export default function PhotoCard({ acompanhanteData, fotoData, index, mutate }) {
  // Constants
  const newPhoto = !fotoData.id
  const destacado = fotoData.destaque === "1"

  // States
  const [order, setOrder] = useState(index)

  // Actions
  const handleHighlight = () => {
    return api
      .post(`/admin/acompanhantes/${acompanhanteData.usuario.id}/fotos/${fotoData.id}/destacar`)
      .then(() => {
        mutate?.()
        notifications.show({
          title: 'Sucesso',
          message: 'Foto destacada com sucesso!',
          color: 'green'
        })
      })
      .catch(error => {
        notifications.show({
          title: 'Erro',
          message: error?.response?.data?.message || 'Erro ao destacar foto.',
          color: 'red'
        })
      })
  }

  const handleSort = () => {
    if (order && Number(fotoData.ordem) !== Number(order))
      return api
        .post(`/admin/acompanhantes/${acompanhanteData.usuario.id}/fotos/${fotoData.id}/ordenar/${order}`)
        .then(() => {
          mutate?.()
          notifications.show({
            title: 'Sucesso',
            message: 'Foto ordenada com sucesso!',
            color: 'green'
          })
        })
        .catch(error => {
          notifications.show({
            title: 'Erro',
            message: error?.response?.data?.message || 'Erro ao ordenar foto.',
            color: 'red'
          })
        })
  }

  const handleRotate = async (direcao) => {
    let rotacionar = "girar-esquerda"
    if (direcao === "right") {
      rotacionar = "girar-direita"
    }
    await api
      .post(`/admin/acompanhantes/${acompanhanteData.usuario.id}/fotos/${fotoData.id}/${rotacionar}`)
      .then(() => {
        mutate?.()
        notifications.show({
          title: 'Sucesso',
          message: 'Foto girada com sucesso!',
          color: 'green'
        })
      })
      .catch(error => {
        notifications.show({
          title: 'Erro',
          message: error?.response?.data?.message || 'Erro ao girar foto.',
          color: 'red'
        })
      })
  }

  const handleRemove = () => {
    return api
      .delete(`/admin/acompanhantes/${acompanhanteData.usuario.id}/fotos/${fotoData.id}`)
      .then(() => {
        mutate?.()
        notifications.show({
          title: 'Sucesso',
          message: 'Foto deletada com sucesso!',
          color: 'green'
        })
      })
      .catch(error => {
        notifications.show({
          title: 'Erro',
          message: error?.response?.data?.message || 'Erro ao deletar foto.',
          color: 'red'
        })
      })
  }

  return (
    <Card shadow="sm" padding="sm" radius="md" withBorder>
      {newPhoto ? (
        <Card.Section inheritPadding py="xs">
          <Group justify="center">
            <TextInput defaultValue={index} styles={{ label: { textAlign: 'center', width: '100%' }, input: { textAlign: 'center', width: '50px' } }} />
            <Button color="green" leftSection={<IconPlus />}>Novo</Button>
          </Group>
        </Card.Section>
      ) : (
        <Card.Section inheritPadding py="xs">
          <Group justify="center">
            <TextInput
              value={order}
              onChange={e => setOrder(e.target.value || '')}
              onBlur={handleSort}
              styles={{ label: { textAlign: 'center', width: '100%' }, input: { textAlign: 'center', width: '50px' } }}
            />
            <Button variant={destacado ? "filled" : "outline"} color="yellow" onClick={() => !destacado ? handleHighlight(fotoData) : null} leftSection={destacado ? <IconStarFilled /> : <IconStar />}>
              {destacado ? "Destacado" : "Destacar"}
            </Button>
          </Group>
        </Card.Section>
      )}
      <Group justify="center">
        {newPhoto ? (
          <Image alt="Nova foto" color="violet" src={fotoData} radius="xs" width={200} height={200} fit="contain" />
        ) : (
          <Image alt={fotoData.nome} color="violet" src={`${process.env.NEXT_PUBLIC_API_DOMAIN}${fotoData.path}/210x314-${fotoData.nome}?i=${Math.random()}`} radius="xs" width={200} height={200} fit="contain" />
        )}
      </Group>
      <Card.Section inheritPadding py="xs">
        <Group justify="center">
          <ButtonGroup>
            {!newPhoto && (
              <Button title="Rotacionar esquerda" color="blue" onClick={() => handleRotate('left')}>
                <IconRotate />
              </Button>
            )}
            <Button color="red" onClick={handleRemove}>
              <IconX />
            </Button>
            {!newPhoto && (
              <Button title="Rotacionar direita" color="blue" onClick={() => handleRotate('right')}>
                <IconRotateClockwise />
              </Button>
            )}
          </ButtonGroup>
        </Group>
      </Card.Section>
    </Card>
  )
}
