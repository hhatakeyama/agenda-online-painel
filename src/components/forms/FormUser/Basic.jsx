import { Alert, Button, Grid, Group, LoadingOverlay, Select, Stack, useMantineTheme } from '@mantine/core'
import { useForm, yupResolver } from '@mantine/form'
import { useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import React, { useState } from 'react'
import { useSWRConfig } from 'swr'

import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'
import { api, Yup } from '@/utils'
import errorHandler from '@/utils/errorHandler'

import * as Fields from './Fields'

export default function Basic({ userData }) {
  // Hooks
  const theme = useMantineTheme()
  const { mutate: mutateGlobal } = useSWRConfig()
  const isXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs}px)`)
  const { isAuthenticated, isValidating, permissionsData } = useAuth()

  // Constants
  const tipos = [
    { value: 's', label: 'Superadmin', visible: permissionsData?.s },
    { value: 'a', label: 'Administrador', visible: permissionsData?.sa },
    { value: 'g', label: 'Gerente', visible: permissionsData?.sag },
  ]
  const editing = !!userData

  // States
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form
  const initialValues = {
    organization_id: userData?.organization_id?.toString?.() || 0,
    name: userData?.name || '',
    email: userData?.email || '',
    password: '',
    confirmPassword: '',
    type: userData?.type || 'f',
    status: userData?.status.toString() || '1',
  }

  const schema = Yup.object().shape({
    organization_id: Yup.number().required(),
    name: Yup.string().required(),
    email: Yup.string().email().required(),
    password: Yup.string().nullable(),
    confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Senhas diferentes'),
    type: Yup.string().required("Tipo obrigatório"),
    status: Yup.string().nullable(),
  })

  // Mantine form
  const form = useForm({
    initialValues,
    validate: yupResolver(schema),
    validateInputOnBlur: true,
    validateInputOnChange: true
  })

  // Fetch
  const { data } = useFetch([isAuthenticated ? `/painel/organizations/` : null])
  const { data: { data: list = [] } } = data || { data: {} }
  const organizationsOptions = list?.map(item => ({ label: item.registeredName, value: item.id.toString() }))
  const optionsOrganizations = [{ label: 'Sem Empresa', value: '0' }, ...organizationsOptions]

  // Actions
  const handleSubmit = async (newValues) => {
    setError(null)
    setIsSubmitting(true)
    const { password, confirmPassword, ...restValues } = newValues
    return await api
      [editing ? 'patch' : 'post'](`/painel/users/${editing ? `update/${userData?.id}` : 'create'}/`, {
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
        if (editing) mutateGlobal(`/painel/users/${userData.id}/`)
        else window.location = '/usuarios'
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
        <Grid.Col span={editing ? { base: 12, lg: 6 } : { base: 12 }}>
          <Stack>
            <Grid>
              {permissionsData?.sa && <Grid.Col span={{ base: 12 }}>
                <Fields.OrganizationField
                  inputProps={{
                    data: optionsOrganizations,
                    disabled: isSubmitting,
                    searchable: true,
                    required: true,
                    clearable: true,
                    ...form.getInputProps('organization_id')
                  }}
                />
              </Grid.Col>}
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
                  required
                  label="Tipo"
                  placeholder="Tipo"
                  data={tipos}
                  disabled={isSubmitting}
                  {...form.getInputProps('type')}
                />
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
