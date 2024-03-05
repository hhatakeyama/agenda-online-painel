import { ActionIcon, Button, Card, Grid, Group, NumberInput, Stack, Switch, Text, Textarea, TextInput, useMantineTheme } from '@mantine/core'
import { useForm, yupResolver } from '@mantine/form'
import { useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconX } from '@tabler/icons-react'
import React, { useState } from 'react'

import { api, Yup } from '@/utils'

export default function Services({ mutate, serviceData, onRemove }) {
  // Hooks
  const theme = useMantineTheme()
  const isXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs}px)`)

  // States
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form
  const initialValues = {
    company_id: serviceData?.company_id || '',
    description: serviceData?.description || '',
    duration: serviceData?.duration || '',
    email_message: serviceData?.email_message || '',
    price: serviceData?.price || '0,00',
    send_email: serviceData?.send_email === 1 || serviceData?.send_email === "1" || false,
    send_sms: serviceData?.send_sms === 1 || serviceData?.send_sms === "1" || false,
    service_id: serviceData?.service_id || '',
    sms_message: serviceData?.sms_message || '',
    status: serviceData?.status || '1',
  }

  const schema = Yup.object().shape({
    company_id: Yup.number(),
    description: Yup.string().nullable(),
    duration: Yup.string().nullable(),
    email_message: Yup.string().nullable(),
    price: Yup.number().moreThan(0, "Valor obrigatório").required("Valor obrigatório"),
    send_email: Yup.boolean().nullable(),
    send_sms: Yup.boolean().nullable(),
    service_id: Yup.number(),
    sms_message: Yup.string().nullable(),
    status: Yup.string().nullable(),
  })

  // Mantine form
  const form = useForm({
    initialValues,
    validate: yupResolver(schema),
    validateInputOnBlur: true,
    validateInputOnChange: true
  })

  // Actions
  const handleSubmit = async newValues => {
    if (form.isDirty()) {
      setIsSubmitting(true)
      return api
        .patch(
          `/api/admin/companies/${serviceData?.company_id}/services/${serviceData.id}`,
          { ...newValues, send_email: newValues.send_email ? "1" : "0", send_sms: newValues.send_sms ? "1" : "0" }
        )
        .then(() => {
          mutate()
          form.resetTouched()
          form.resetDirty()
          notifications.show({ title: 'Sucesso', message: 'Dados atualizados com sucesso!', color: 'green' })
        })
        .catch(error => {
          notifications.show({
            title: 'Erro',
            message:
              error.response?.data?.message ||
              'Erro ao atualizar os dados. Entre em contato com o administrador do site ou tente novamente mais tarde.',
            color: 'red'
          })
        })
        .finally(() => setIsSubmitting(false))
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Card key={serviceData.id} shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section p="md">
          <Group align="center" justify="space-between">
            <Text fw={700} pb={10}>{serviceData.service?.name}</Text>

            <ActionIcon color="red" onClick={() => onRemove(serviceData.service_id)}><IconX /></ActionIcon>
          </Group>
          <Grid>
            <Grid.Col span={{ xs: 12 }}>
              <TextInput
                {...form.getInputProps(`description`)}
                disabled={isSubmitting}
                label="Descrição"
                placeholder="Descrição"
                type="text"
              />
            </Grid.Col>
            <Grid.Col span={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <NumberInput
                {...form.getInputProps(`price`)}
                disabled={isSubmitting}
                label="Preço"
                placeholder="Preço"
                type="number"
                decimalScale={2}
                fixedDecimalScale
                leftSection="R$"
              />
            </Grid.Col>
            <Grid.Col span={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <TextInput
                {...form.getInputProps(`duration`)}
                disabled={isSubmitting}
                label="Duração (de 5 em 5 minutos)"
                placeholder="Duração"
                type="time"
                step={300}
              />
            </Grid.Col>

            <Grid.Col span={{ xs: 12 }}>
              <Stack>
                <Switch {...form.getInputProps(`send_email`)} checked={form.values.send_email} label="Enviar e-mail" />
                <Textarea
                  {...form.getInputProps(`email_message`)}
                  disabled={isSubmitting}
                  label="Texto do e-mail"
                  placeholder="Texto do e-mail"
                  rows={5}
                />
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ xs: 12 }}>
              <Stack>
                <Switch {...form.getInputProps(`send_sms`)} checked={form.values.send_sms} label="Enviar SMS" />
                <Textarea
                  {...form.getInputProps(`sms_message`)}
                  disabled={isSubmitting}
                  label={`Texto do SMS (limite ${160 - form.values.sms_message.length} caracteres)`}
                  placeholder="Texto do SMS"
                  rows={5}
                  maxLength={160}
                />
              </Stack>
            </Grid.Col>
          </Grid>
        </Card.Section>
        <Card.Section p="md">
          <Button
            color="green"
            type="submit"
            size={isXs ? 'sm' : 'md'}
            fullWidth={!!isXs}
            disabled={!form.isValid() || !form.isDirty()}
            loading={isSubmitting}>
            Salvar
          </Button>
        </Card.Section>
      </Card>
    </form>
  )
}
