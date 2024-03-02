import { Avatar, Button, FileButton, Grid, Group, LoadingOverlay, Select, Stack, Text, useMantineTheme } from '@mantine/core'
import { useForm, yupResolver } from '@mantine/form'
import { useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
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
  const { isValidating, permissionsData, userData } = useAuth()
  const { employeeId } = useParams()

  // Constants
  const editing = !!employeeData

  // States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [file, setFile] = useState(null)
  const srcPicture = employeeData?.picture?.indexOf('http') !== -1 ? employeeData?.picture : `${process.env.NEXT_PUBLIC_API_DOMAIN}/storage/employees/original-${employeeData?.picture}`
  const srcPictureFile = file ? URL.createObjectURL(file) : (srcPicture || '')

  // Form
  const initialValues = {
    organization_id: employeeData?.organization_id?.toString?.() || null,
    name: employeeData?.name || '',
    email: employeeData?.email || '',
    password: '',
    confirmPassword: '',
    occupation: employeeData?.occupation || '',
    type: 'f',
    status: employeeData?.status?.toString?.() || '1',
    services: employeeData?.employee_services?.flatMap?.(employeeService => employeeService.service_id.toString()) || [],
  }

  const schema = Yup.object().shape({
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
  const { data: dataServices } = useFetch([permissionsData?.sag && userData ? `/admin/services` : null])
  const { data: resultsServices = [] } = dataServices?.data || {}
  const optionsServices =
    resultsServices.map(service => ({ label: service.name, value: service.id.toString() })) || []

  // Actions
  const handleSubmit = async (newValues) => {
    setIsSubmitting(true)
    if (form.isDirty()) {
      const { password, confirmPassword, ...restValues } = newValues
      return api
        [editing ? 'patch' : 'post'](`/api/admin/employees${editing ? `/${employeeId}` : ''}`, {
          ...restValues,
          ...(permissionsData?.g && userData ? { organization_id: userData.organization_id } : {}),
          ...(password && password !== '' ? { password: password } : {}),
          ...(confirmPassword ? { password_confirmed: confirmPassword } : {})
        })
        .then(() => {
          if (editing) {
            mutateGlobal(`/api/admin/employees/${employeeId}`)
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

  const handleFileChange = async file => {
    setFile(file)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileName', file.name)
    await api
      .post(`/api/admin/employees/${employeeId}/picture`, formData, {
        headers: { "Content-Type": 'multipart/form-data' }
      })
      .then(() => {
        notifications.show({
          title: 'Sucesso',
          message: 'Foto atualizada com sucesso!',
          color: 'green'
        })
      })
      .catch(error => {
        notifications.show({
          title: 'Erro',
          message: error?.response?.data?.error ||
            'Erro ao atualizar foto. Entre em contato com o administrador do site ou tente novamente mais tarde.',
          color: 'red'
        })
      })
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} style={{ position: 'relative' }}>
      <LoadingOverlay visible={isValidating} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      <Stack gap={5}>
        <Group align="flex-start" wrap="nowrap">
          {editing && (
            <Stack gap={5} align="center">
              <FileButton onChange={handleFileChange} accept="image/png,image/jpeg">
                {(props) =>
                  <>
                    <Avatar size="xl" {...props} src={srcPictureFile} />
                    <Text {...props} style={{ textWrap: 'nowrap' }}>{userData?.picture ? 'Alterar foto' : 'Selecionar foto'}</Text>
                    <Text size="sm">84px x 84px</Text>
                  </>
                }
              </FileButton>
            </Stack>
          )}
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
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Fields.OccupationField inputProps={{ ...form.getInputProps('occupation'), disabled: isSubmitting }} />
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
              <Grid.Col span={{ base: 12 }}>
                <Fields.ServicesField
                  inputProps={{
                    ...form.getInputProps('services'),
                    data: optionsServices,
                    disabled: isSubmitting,
                    searchable: true,
                    required: true,
                  }}
                />
              </Grid.Col>
            </Grid>
          </Stack>
        </Group>
      </Stack>

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
