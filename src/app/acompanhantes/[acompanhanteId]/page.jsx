'use client'

import { Badge, Button, Center, Container, Group, Image, Loader, Stack, Tabs, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconAt, IconCalendar, IconPhone, IconPhoneCall, IconPhoto, IconUser } from '@tabler/icons-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { AcompanhanteForm } from '@/components/forms'
import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'
import { dateToHuman } from '@/utils'

import classes from './Acompanhante.module.css'
import Agenda from './Agenda'
import Phones from './Phones'
import Photos from './Photos'

export default function Acompanhantes() {
  // Hooks
  const { isAuthenticated } = useAuth()
  const { acompanhanteId } = useParams()
  const router = useRouter()

  // States
  const [tab, setTab] = useState('profile')

  // Fetch
  const { data, error, mutate } = useFetch([isAuthenticated ? `/admin/acompanhantes/${acompanhanteId}` : null])
  
  // Constants
  const tabs = [
    { id: 'profile', label: 'Perfil', icon: <IconUser style={{ height: 12, width: 12 }} /> },
    { id: 'photos', label: 'Fotos', icon: <IconPhoto style={{ height: 12, width: 12 }} /> },
    { id: 'phones', label: 'Telefones', icon: <IconPhone style={{ height: 12, width: 12 }} /> },
    { id: 'agenda', label: 'Agenda', icon: <IconCalendar style={{ height: 12, width: 12 }} /> },
  ]

  // Effects
  useEffect(() => {
    if (isAuthenticated === false) return router.push('/')
  }, [isAuthenticated, router])

  if (error?.response?.data?.message === "Unauthorized") {
    notifications.show({ title: "Erro", message: error?.response?.data?.message, color: 'red' })
    return router.push('/')
  }

  if (isAuthenticated === null) return <Center style={{ height: '400px' }}><Loader color="blue" /></Center>

  const expira = data?.periodos[data?.periodos.length - 1] ? new Date(data?.periodos[data?.periodos.length - 1].data_fim) : false
  // const aviso = new Date("Y-m-d")
  // const dataFim = new Date("d/m/Y")
  // if (expira) {
  //   aviso = date("Y-m-d", strtotime('-7 day', strtotime(expira)))
  //   const dataFimArray = expira.split("-")
  //   dataFim = dataFimArray[2] + "/" + dataFimArray[1] + "/" + dataFimArray[0]
  // }
  let texto = ''
  let whatsapp = '';
  if (data?.telefones && data?.telefones.length > 0 && data?.telefones[0] && data?.url) {
    whatsapp = data?.telefones[0].numero
    const dataInicio = dateToHuman(data?.created_at)
    texto = `Olá ${data?.nome}, aqui é o Rodrigo do time do site Gata Completa.\n
    Você tem um anúncio conosco ativo desde ${dataInicio} e o motivo do contato é para saber se você ainda está realizando serviços como acompanhante.\n\n

    Os dados do seu anúncio são:\n
      Link: ${data?.url}\n\n

    Cidade Atual: ${data?.cidadeAtual}\n
      WhatsApp: ${whatsapp}\n\n

    Os dados acima estão corretos? Precisa alterar algo?\n\n
    
    Obrigado por sua atenção.`
  }
  const fotoDestaque = data?.fotoDestaque && data?.fotoDestaque.length > 0
    ? `${data?.fotoDestaque[0].path}/210x314-${data?.fotoDestaque[0].nome}`
    : (data?.fotos && data?.fotos.length > 0 ? `${data?.fotos[0].path}/210x314-${data?.fotos[0].nome}` : '/img/sem-foto.jpg')

  return (
    <Container size="100%" mb="50px">
      <Stack>
        <Group wrap="nowrap">
          <Image alt="Foto destaque" src={"https://admin.gatacompleta.com" + fotoDestaque} width={200} height={200} radius="md" />

          <div>
            {data?.status === '1' ? (
              <Badge size="sm" color="green">Ativo</Badge>
            ) : (
              <Badge size="sm" color="red">Inativo</Badge>
            )}
            <Text fz="lg" fw={500} className={classes.profileName}>
              {data?.nome}
            </Text>
            <Group wrap="nowrap" gap={10} mt={3}>
              <IconAt stroke={1.5} size="1rem" className={classes.profileIcon} />
              <Text fz="xs" c="dimmed">{data?.usuario.email}</Text>
            </Group>
            {whatsapp && data?.url && (
              <Group wrap="nowrap" gap={10} mt={5}>
                <IconPhoneCall stroke={1.5} size="1rem" className={classes.icon} />
                <Button size="compact-sm" component="a" color="green" title="WhatsApp" href={`https://wa.me/+55${whatsapp}?text=${texto}`}>{whatsapp}</Button>
              </Group>
            )}
            {expira && (
              <Group wrap="nowrap" gap={10} mt={5}>
                <IconCalendar stroke={1.5} size="1rem" className={classes.icon} />
                <Text fz="xs" c="dimmed">expira em {dateToHuman(expira)}</Text>
              </Group>
            )}
          </div>
        </Group>

        <Tabs value={tab} onChange={setTab}>
          <Tabs.List>
            {tabs.map(item => (
              <Tabs.Tab key={item.id} value={item.id} leftSection={item.icon}>
                {item.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <Tabs.Panel value="profile">
            {data && tab === 'profile' && (
              <Container size="100%" mb="xl" mt="xs">
                <AcompanhanteForm.Basic acompanhanteData={data} mutate={mutate} />
              </Container>
            )}
          </Tabs.Panel>
          <Tabs.Panel value="photos">
            {data && tab === 'photos' && (
              <Container size="100%" mb="xl" mt="xs">
                <Photos acompanhanteData={data} mutate={mutate} />
              </Container>
            )}
          </Tabs.Panel>
          <Tabs.Panel value="phones">
            {data && tab === 'phones' && (
              <Container size="100%" mb="xl" mt="xs">
                <Phones acompanhanteData={data} />
              </Container>
            )}
          </Tabs.Panel>
          <Tabs.Panel value="agenda">
            {data && tab === 'agenda' && (
              <Container size="100%" mb="xl" mt="xs">
                <Agenda acompanhanteData={data} mutate={mutate} />
              </Container>
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}
