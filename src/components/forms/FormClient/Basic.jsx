import { Alert, Button, Grid, Group, LoadingOverlay, Select, Stack, useMantineTheme } from '@mantine/core'
import { useForm, yupResolver } from '@mantine/form'
import { useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import Image from 'next/image'
import React, { useState } from 'react'

import { useAuth } from '@/providers/AuthProvider'
import { api, Yup } from '@/utils'
import errorHandler from '@/utils/errorHandler'

import * as Fields from './Fields'

export default function Basic({ clientData }) {
  // Hooks
  const theme = useMantineTheme()
  const isXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs}px)`)
  const { isValidating } = useAuth()

  // Constants
  const editing = !!clientData

  // States
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form
  const initialValues = {
    name: clientData?.name || '',
    email: clientData?.email || '',
    picture: clientData?.picture || '',
    password: '',
    confirmPassword: '',
    status: clientData?.status?.toString?.() || '1',
  }

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    email: Yup.string().email().required(),
    picture: Yup.string(),
    password: Yup.string().nullable(),
    confirmPassword: Yup.string().nullable().oneOf([Yup.ref('password'), null], 'Senhas diferentes'),
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
  const handleSubmit = async (newValues) => {
    setError(null)
    setIsSubmitting(true)
    const { password, confirmPassword, ...restValues } = newValues
    return await api
      [editing ? 'patch' : 'post'](`/painel/clients/${editing ? `update/${clientData?.id}` : 'create'}/`, {
        ...restValues,
        ...(password && password !== '' ? { password: password } : {}),
        ...(confirmPassword ? { password_confirmed: confirmPassword } : {})
      })
      .then(() => {
        notifications.show({
          title: 'Sucesso',
          message: 'Dados atualizados com sucesso!',
          color: 'green'
        })
        if (editing) mutateGlobal(`/painel/clients/${clientData.id}/`)
        else window.location = '/clientes'
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

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} style={{ position: 'relative' }}>
      <LoadingOverlay visible={isValidating} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      <Grid>
        <Grid.Col span={editing ? { base: 12, sm: 6, md: 4, lg: 3, xl: 2 } : { base: 12 }} hidden={!editing}>
          <Image alt="Foto destaque" src={"https://admin.gatacompleta.com"} width={200} height={200} radius="md" />
        </Grid.Col>
        <Grid.Col span={editing ? { base: 12, lg: 6 } : { base: 12 }}>
          <Stack>
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Fields.NameField inputProps={{ ...form.getInputProps('name'), required: true, disabled: isSubmitting }} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Fields.EmailField inputProps={{ ...form.getInputProps('email'), required: true, disabled: isSubmitting }} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Fields.PasswordField inputProps={{ ...form.getInputProps('password'), disabled: isSubmitting }} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Fields.ConfirmPasswordField inputProps={{ ...form.getInputProps('confirmPassword'), disabled: isSubmitting }} />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Conta ativa?"
                  placeholder="Conta ativa?"
                  data={[{ value: '1', label: 'Sim' }, { value: '0', label: 'Não' }]}
                  disabled={isSubmitting}
                  {...form.getInputProps('status')}
                />
              </Grid.Col>
            </Grid>
          </Stack>
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
