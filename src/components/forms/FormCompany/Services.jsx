import { Alert, Button, Group, LoadingOverlay, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import { useForm, yupResolver } from '@mantine/form'
import { useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import React, { useState } from 'react'

import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'
import { api, Yup } from '@/utils'
import errorHandler from '@/utils/errorHandler'

import * as Fields from './Fields'

export default function Services({ companyData, mutate }) {
  // Hooks
  const theme = useMantineTheme()
  const isXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs}px)`)
  const { isValidating, permissionsData, userData } = useAuth()

  // States
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form
  const initialValues = {
    services: companyData?.company_services || [],
  }

  const schema = Yup.object().shape({
    services: Yup.array().nullable().required(),
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
    resultsServices.map(service => ({ label: service.name, value: service.id.toString() })) || []

  // Actions
  const handleSubmit = async (newValues) => {
    setError(null)
    setIsSubmitting(true)
    if (form.isDirty()) {
      return api
        .patch(`/api/admin/companies/${companyData?.id}/services`, { ...newValues }) // Verificar usuário logado no painel
        .then(() => {
          form.reset()
          setTimeout(() => mutate(), 2000)
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

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} style={{ position: 'relative' }}>
      <LoadingOverlay visible={isValidating} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      <Stack>
        <Text>Adicione os serviços</Text>

        <Fields.ServicesField
          inputProps={{
            data: optionsServices,
            value: [],
            disabled: isSubmitting,
            searchable: true,
            onChange: option => { console.log("aq", option) }
          }}
        />

        {form.values.services?.map(companyService => (
          <>
            company_id
            created_at
            description
            duration
            email_message
            id
            price
            send_email
            send_sms
            service_id
            sms_message
            status
            {companyService.service.name}
          </>
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
