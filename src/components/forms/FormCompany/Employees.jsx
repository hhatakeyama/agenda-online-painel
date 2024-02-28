import { Alert, Button, Grid, Group, LoadingOverlay, useMantineTheme } from '@mantine/core'
import { useForm, yupResolver } from '@mantine/form'
import { useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import React, { useState } from 'react'

import { useAuth } from '@/providers/AuthProvider'
import { api, Yup } from '@/utils'
import errorHandler from '@/utils/errorHandler'

export default function Employees({ companyData, mutate }) {
  // Hooks
  const theme = useMantineTheme()
  const isXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs}px)`)
  const { isValidating } = useAuth()

  // States
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form
  const initialValues = {
    employees: companyData?.employees || [],
  }

  const schema = Yup.object().shape({
    employees: Yup.array().nullable().required(),
  })

  // Mantine form
  const form = useForm({
    initialValues,
    validate: yupResolver(schema),
    validateInputOnBlur: true,
    validateInputOnChange: true
  })

  // Actions
  const handleSubmit = async (newValues) => {
    setError(null)
    setIsSubmitting(true)
    if (form.isDirty()) {
      return api
        .patch(`/admin/usuarios/${companyData?.id}`, { ...newValues }) // Verificar usuário logado no painel
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
      <Grid>
        <Grid.Col>
          Selecione os funcionários
        </Grid.Col>
      </Grid>

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
