import { Button, Grid, Group, LoadingOverlay, Select, Stack, useMantineTheme } from '@mantine/core'
import { useForm, yupResolver } from '@mantine/form'
import { useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import { useSWRConfig } from 'swr'

import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'
import { api, Yup } from '@/utils'

import * as Fields from './Fields'

export default function Basic({ employeeData, onClose }) {
  // Hooks
  const theme = useMantineTheme()
  const isXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs}px)`)
  const { mutate: mutateGlobal } = useSWRConfig()
  const { isValidating, permissionsData } = useAuth()
  const { employeeId } = useParams()

  // Constants
  const editing = !!employeeData

  // States
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form
  const initialValues = {
    organization_id: employeeData?.organization_id?.toString?.() || null,
    name: employeeData?.name || '',
    email: employeeData?.email || '',
    password: '',
    confirmPassword: '',
    type: 'f',
    status: employeeData?.status?.toString?.() || '1',
    services: []
  }

  const schema = Yup.object().shape({
    organization_id: Yup.number().required(),
    name: Yup.string().required(),
    email: Yup.string().email().required(),
    password: Yup.string().nullable(),
    confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Senhas diferentes'),
    status: Yup.string().nullable(),
    services: Yup.array().nullable(),
  })

  // Mantine form
  const form = useForm({
    initialValues,
    validate: yupResolver(schema),
    validateInputOnBlur: true,
    validateInputOnChange: true
  })

  // Fetch
  const { data } = useFetch([permissionsData?.sa ? `/admin/organizations` : null])
  const { data: results = [] } = data?.data || {}
  const optionsOrganizations =
    results.map(organization => ({ label: organization.registeredName, value: organization.id.toString() })) || []

  // Actions
  const handleSubmit = async (newValues) => {
    setIsSubmitting(true)
    if (form.isDirty()) {
      const { password, confirmPassword, ...restValues } = newValues
      return api
        [editing ? 'patch' : 'post'](`/admin/employees${editing ? `/${employeeId}` : ''}`, {
          ...restValues,
          ...(password && password !== '' ? { password: password } : {}),
          ...(confirmPassword ? { password_confirmed: confirmPassword } : {})
        })
        .then(() => {
          if (editing) {
            mutateGlobal(`/admin/employees/${employeeId}`)
            form.resetTouched()
            form.resetDirty()
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
              error.response?.data?.message ||
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
        <Grid.Col span={editing ? { base: 12, sm: 6, md: 4, lg: 3, xl: 2 } : { base: 12 }} hidden={!editing}>
          <Image alt="Foto destaque" src={form.values.picture} width={200} height={200} radius="md" />
        </Grid.Col>
        <Grid.Col span={editing ? { base: 12, md: 8, lg: 6 } : { base: 12 }}>
          <Stack>
            <Grid>
              {permissionsData?.sa && <Grid.Col span={{ base: 12 }}>
                <Fields.OrganizationField
                  inputProps={{
                    ...form.getInputProps('organization_id'),
                    data: optionsOrganizations,
                    disabled: isSubmitting,
                    searchable: true,
                    required: true
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
