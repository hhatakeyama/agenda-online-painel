import { ActionIcon, Alert, Button, Card, Grid, Group, LoadingOverlay, Stack, Switch, Text, TextInput, useMantineTheme } from '@mantine/core'
import { useForm, yupResolver } from '@mantine/form'
import { useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconX } from '@tabler/icons-react'
import React, { useState } from 'react'
import { useSWRConfig } from 'swr'

import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'
import { api, Yup } from '@/utils'
import errorHandler from '@/utils/errorHandler'

import * as Fields from './Fields'

export default function Services({ companyData }) {
  // Hooks
  const theme = useMantineTheme()
  const isXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs}px)`)
  const { mutate: mutateGlobal } = useSWRConfig()
  const { isValidating, permissionsData, userData } = useAuth()

  // States
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form
  const initialValues = {
    services: companyData?.company_services || [],
  }

  const schema = Yup.object().shape({
    services: Yup.array().of(
      Yup.object().shape({
        company_id: Yup.number(),
        description: Yup.string().nullable(),
        duration: Yup.string().nullable(),
        email_message: Yup.string().nullable(),
        price: Yup.number().nullable(),
        send_email: Yup.boolean().nullable(),
        send_sms: Yup.boolean().nullable(),
        service_id: Yup.number(),
        sms_message: Yup.string().nullable(),
        status: Yup.string().nullable(),
      })
    ).nullable().required(),
  })

  // Mantine form
  const form = useForm({
    initialValues,
    validate: yupResolver(schema),
    validateInputOnBlur: true,
    validateInputOnChange: true
  })

  // Fetch
  const { data: dataServices } = useFetch([permissionsData?.sag && userData ? `/admin/services` : null])
  const { data: resultsServices = [] } = dataServices?.data || {}
  const optionsServices =
    resultsServices
      .filter(service => !companyData?.company_services.find(companyService => companyService?.service_id === service.id))
      .map(service => ({ label: service.name, value: service.id.toString() })) || []

  // Actions
  const handleSubmit = async (newValues) => {
    if (form.isDirty()) {
      setError(null)
      setIsSubmitting(true)
      return api
        .patch(`/api/admin/companies/${companyData?.id}/services`, { ...newValues })
        .then(() => {
          mutateGlobal(`/api/admin/companies/${companyData?.id}`)
          form.resetTouched()
          form.resetDirty()
          notifications.show({ title: 'Sucesso', message: 'Dados atualizados com sucesso!', color: 'green' })
        })
        .catch(error => {
          notifications.show({
            title: 'Erro',
            message:
              errorHandler(error.response.data.errors).messages ||
              'Erro ao atualizar os dados. Entre em contato com o administrador do site ou tente novamente mais tarde.',
            color: 'red'
          })
        })
        .finally(() => setIsSubmitting(false))
    }
  }
  
  const handleCreateCompanyService = async (service_id) => {
    if (service_id?.[0]) {
      setIsSubmitting(true)
      return await api
        .post(`/api/admin/companies/${companyData?.id}/services`, { service_id: service_id[0] })
        .then(() => {
          mutateGlobal(`/api/admin/companies/${companyData?.id}`)
          form.resetTouched()
          form.resetDirty()
          notifications.show({ title: 'Sucesso', message: 'Serviço adicionado com sucesso!', color: 'green' })
        })
        .catch(error => {
          notifications.show({
            title: 'Erro',
            message:
                errorHandler(error.response.data.errors).messages ||
                'Erro ao adicionar serviço. Entre em contato com o administrador do site ou tente novamente mais tarde.',
            color: 'red'
          })
        })
        .finally(() => setIsSubmitting(false))
    }
  }
  
  const handleRemoveCompanyService = async (service_id) => {
    setIsSubmitting(true)
    return await api
      .delete(`/api/admin/companies/${companyData?.id}/services/${service_id}`)
      .then(() => {
        mutateGlobal(`/api/admin/companies/${companyData?.id}`)
        form.resetTouched()
        form.resetDirty()
        notifications.show({ title: 'Sucesso', message: 'Serviço removido com sucesso!', color: 'green' })
      })
      .catch(error => {
        notifications.show({
          title: 'Erro',
          message:
            error.response.data.message ||
            'Erro ao remover serviço. Entre em contato com o administrador do site ou tente novamente mais tarde.',
          color: 'red'
        })
      })
      .finally(() => setIsSubmitting(false))
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} style={{ position: 'relative' }}>
      <LoadingOverlay visible={isValidating} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      <Stack>
        <Text>Adicione os serviços</Text>

        <Grid>
          <Grid.Col span={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Fields.ServicesField
              inputProps={{
                data: optionsServices,
                disabled: isSubmitting,
                searchable: true,
                onChange: option => handleCreateCompanyService(option)
              }}
            />
          </Grid.Col>
        </Grid>

        {form.values.services?.map(companyService => (
          <Card key={companyService.id} shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section p="md">
              <Group align="center" justify="space-between">
                <Text fw={700} pb={10}>{companyService.service?.name}</Text>

                <ActionIcon color="red" onClick={() => handleRemoveCompanyService(companyService.service_id)}><IconX /></ActionIcon>
              </Group>
              <Grid>
                <Grid.Col span={{ xs: 12 }}>
                  <TextInput {...form.getInputProps('description')} disabled={isSubmitting} label="Descrição" placeholder="Descrição" type="text" />
                </Grid.Col>
                <Grid.Col span={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <TextInput {...form.getInputProps('price')} disabled={isSubmitting} label="Preço" placeholder="Preço" type="text" />
                </Grid.Col>
                <Grid.Col span={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <TextInput {...form.getInputProps('duration')} disabled={isSubmitting} label="Duração" placeholder="Duração" type="text" />
                </Grid.Col>

                <Grid.Col span={{ xs: 12 }}>
                  <Stack>
                    <Switch name="send_email" defaultChecked label="Enviar e-mail" />
                    <TextInput {...form.getInputProps('email_message')} disabled={isSubmitting} label="Texto do e-mail" placeholder="Texto do e-mail" type="text" />
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ xs: 12 }}>
                  <Stack>
                    <Switch name="send_sms" defaultChecked label="Enviar SMS" />
                    <TextInput {...form.getInputProps('sms_message')} disabled={isSubmitting} label="Texto do SMS" placeholder="Texto do SMS" type="text" />
                  </Stack>
                </Grid.Col>
              </Grid>
            </Card.Section>
          </Card>
        ))}
      </Stack>

      {!!error && <Alert color="red" title="Erro">{error}</Alert>}

      <Group mt="xl">
        <Button
          color="green"
          type="submit"
          size={isXs ? 'sm' : 'md'}
          fullWidth={!!isXs}
          disabled={!form.isValid() || !form.isDirty()}
          loading={isSubmitting}>
          Salvar
        </Button>
      </Group>
    </form>
  )
}
