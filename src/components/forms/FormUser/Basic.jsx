import { Button, Grid, Group, LoadingOverlay, Select, Stack, useMantineTheme } from '@mantine/core'
import { useForm, yupResolver } from '@mantine/form'
import { useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import { useSWRConfig } from 'swr'

import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'
import { api, Yup } from '@/utils'
import errorHandler from '@/utils/errorHandler'

import * as Fields from './Fields'

export default function Basic({ userData, onClose }) {
  // Hooks
  const theme = useMantineTheme()
  const isXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs}px)`)
  const { mutate: mutateGlobal } = useSWRConfig()
  const { isValidating, permissionsData, userMutate } = useAuth()
  const { userId } = useParams()

  // Constants
  const tipos = [
    { value: 's', label: 'Superadmin', visible: permissionsData?.s },
    { value: 'a', label: 'Administrador', visible: permissionsData?.sa },
    { value: 'g', label: 'Gerente', visible: permissionsData?.sag },
  ].filter(item => item.visible)
  const editing = !!userData

  // States
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form
  const initialValues = {
    organization_id: userData?.organization_id?.toString?.() || null,
    name: userData?.name || '',
    email: userData?.email || '',
    password: '',
    confirmPassword: '',
    type: userData?.type || 'g',
    status: userData?.status?.toString?.() || '1',
  }

  const schema = Yup.object().shape({
    organization_id: Yup.number().nullable(),
    name: Yup.string().required(),
    email: Yup.string().email().required(),
    password: Yup.string().nullable(),
    confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Senhas diferentes'),
    type: Yup.string().required("Tipo obrigatório"),
    status: Yup.number(),
  })

  // Mantine form
  const form = useForm({
    initialValues,
    validate: yupResolver(schema),
    validateInputOnBlur: true,
    validateInputOnChange: true
  })

  // Fetch
  const { data } = useFetch([permissionsData?.sa ? `/admin/organizations/` : null])
  const { data: results = [] } = data?.data || {}
  const optionsOrganizations =
    results.map(organization => ({ label: organization.registeredName, value: organization.id.toString() })) || []

  // Actions
  const handleSubmit = async (newValues) => {
    setIsSubmitting(true)
    if (form.isDirty()) {
      const { password, confirmPassword, ...restValues } = newValues
      return await api
        [editing ? 'patch' : 'post'](`/admin/users${editing ? `/${permissionsData?.ge ? userData?.id : userId}` : ''}/`, {
          ...restValues,
          ...(password && password !== '' ? { password: password } : {}),
          ...(confirmPassword ? { password_confirmed: confirmPassword } : {})
        })
        .then(() => {
          if (editing) {
            mutateGlobal(`/admin/users/${userId}/`)
            form.resetTouched()
            form.resetDirty()
            if (permissionsData?.ge) userMutate?.()
          } else {
            onClose?.()
          }
          notifications.show({
            title: 'Sucesso',
            message: `Dados ${editing ? 'atualizados' : 'cadastrados'} com sucesso!`,
            color: 'green'
          })
        })
        .catch(error => {
          notifications.show({
            title: 'Erro',
            message:
              errorHandler(error.response.data.errors).messages ||
              `Erro ao ${editing ? 'atualizar' : 'cadastrar'} os dados. Entre em contato com o administrador do site ou tente novamente mais tarde.`,
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
        <Grid.Col span={editing ? { base: 12, lg: 6 } : { base: 12 }}>
          <Stack>
            <Grid>
              {permissionsData?.sa && <Grid.Col span={{ base: 12 }}>
                <Fields.OrganizationField
                  inputProps={{
                    data: optionsOrganizations,
                    disabled: isSubmitting,
                    searchable: true,
                    required: permissionsData?.g,
                    clearable: true,
                    ...form.getInputProps('organization_id')
                  }}
                />
              </Grid.Col>}
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Fields.NameField inputProps={{ ...form.getInputProps('name'), required: true, disabled: isSubmitting }} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Fields.EmailField inputProps={{ ...form.getInputProps('email'), required: true, disabled: permissionsData?.ge || isSubmitting }} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Fields.PasswordField inputProps={{ ...form.getInputProps('password'), disabled: isSubmitting }} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Fields.ConfirmPasswordField inputProps={{ ...form.getInputProps('confirmPassword'), disabled: isSubmitting }} />
              </Grid.Col>
              {permissionsData?.sa && (
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
              )}
              {permissionsData.sa && (
                <Grid.Col span={6}>
                  <Select
                    label="Conta ativa?"
                    placeholder="Conta ativa?"
                    data={[{ value: '1', label: 'Sim' }, { value: '0', label: 'Não' }]}
                    disabled={isSubmitting}
                    {...form.getInputProps('status')}
                  />
                </Grid.Col>
              )}
            </Grid>
          </Stack>
        </Grid.Col>
      </Grid>

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
