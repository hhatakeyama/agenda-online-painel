import { Alert, Button, Grid, Group, LoadingOverlay, Select, Stack, TextInput, useMantineTheme } from '@mantine/core'
import { useForm, yupResolver } from '@mantine/form'
import { useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import React, { useState } from 'react'

import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'
import { api, Yup } from '@/utils'
import errorHandler from '@/utils/errorHandler'

import * as Fields from './Fields'

export default function Basic({ companyData, mutate }) {
  // Hooks
  const theme = useMantineTheme()
  const isXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs}px)`)
  const { isValidating, permissionsData } = useAuth()

  // Constants
  const editing = !!companyData
  const { permissions } = permissionsData || {}
  const adminAccess = !!permissions?.find(perm => perm === 's' || perm === 'a') || false

  // States
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form
  const initialValues = {
    organizationId: companyData?.organizationId || null,
    name: companyData?.name || '',
    address: companyData?.address || '',
    district: companyData?.district || '',
    cep: companyData?.cep || '',
    city: companyData?.city || '',
    state: companyData?.state || '',
    thumb: companyData?.thumb || '',
    whatsapp: companyData?.whatsapp || '',
    phone: companyData?.phone || '',
    mobilePhone: companyData?.mobilePhone || '',
    email: companyData?.email || '',
    socialMedia: companyData?.socialMedia || '',
    status: companyData?.status || '1',
  }

  const schema = Yup.object().shape({
    organizationId: Yup.number().required(),
    name: Yup.string().required(),
    address: Yup.string().nullable(),
    district: Yup.string().nullable(),
    cep: Yup.string().nullable(),
    city: Yup.string().nullable(),
    state: Yup.string().nullable(),
    thumb: Yup.string().nullable(),
    whatsapp: Yup.string().nullable(),
    phone: Yup.string().nullable(),
    mobilePhone: Yup.string().nullable(),
    email: Yup.string().nullable().email(),
    socialMedia: Yup.string().nullable(),
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
  const { data } = useFetch([`/admin/estados/`])
  const { data: dataCities } = useFetch([form.values.state ? `/admin/estados/${form.values.state}/cidades` : null])
  const optionsStates = data?.map(state => ({ value: state.id, label: state.nome })) || []
  const optionsCities = dataCities?.map(city => ({ value: city.id.toString(), label: city.nome })) || []
  const optionsOrganizations = [{ label: 'Empresa 1', value: '1' }]

  // Actions
  const handleSubmit = async (newValues) => {
    setError(null)
    setIsSubmitting(true)
    if (form.isDirty()) {
      return api
        .patch(`/admin/usuarios/${companyData?.id}/`, { ...newValues }) // Verificar usuário logado no painel
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
        <Grid.Col span={editing ? { base: 12, lg: 6 } : { base: 12 }}>
          <Stack>
            <Grid>
              {adminAccess && <Grid.Col span={{ base: 12 }}>
                <Fields.OrganizationField
                  inputProps={{
                    ...form.getInputProps('organizationId'),
                    data: optionsOrganizations,
                    disabled: isSubmitting,
                    searchable: true,
                    required: true
                  }}
                />
              </Grid.Col>}
              <Grid.Col span={{ base: 12 }}>
                <TextInput {...form.getInputProps('name')} disabled={isSubmitting} label="Nome" placeholder="Nome" type="text" required />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Fields.CepField inputProps={{ ...form.getInputProps('cep'), disabled: isSubmitting }} />
              </Grid.Col>
              <Grid.Col span={{ base: 12 }}>
                <TextInput {...form.getInputProps('address')} disabled={isSubmitting} label="Endereço" placeholder="Endereço" type="text" />
              </Grid.Col>
              <Grid.Col span={{ base: 12 }}>
                <TextInput {...form.getInputProps('district')} disabled={isSubmitting} label="Bairro" placeholder="Bairro" type="text" />
              </Grid.Col>
              <Grid.Col span={{ base: 4 }}>
                <Fields.StateField
                  inputProps={{
                    ...form.getInputProps('state'),
                    data: optionsStates,
                    disabled: isSubmitting,
                    searchable: true,
                  }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 8 }}>
                {optionsCities.length > 0 && <Fields.CityField
                  inputProps={{
                    ...form.getInputProps('city'),
                    data: optionsCities,
                    disabled: !form.values.state || isSubmitting,
                    searchable: true,
                  }}
                />}
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Fields.WhatsappField inputProps={{ ...form.getInputProps('whatsapp'), disabled: isSubmitting }} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Fields.PhoneNumberField inputProps={{ ...form.getInputProps('phone'), disabled: isSubmitting }} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput {...form.getInputProps('email')} disabled={isSubmitting} label="E-mail" placeholder="E-mail" type="email" />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Ativo?"
                  placeholder="Ativo?"
                  data={[{ value: '1', label: 'Sim' }, { value: '0', label: 'Não' }]}
                  disabled={isSubmitting}
                  {...form.getInputProps('status')}
                />
              </Grid.Col>
            </Grid>
          </Stack>
        </Grid.Col>
        <Grid.Col span={editing ? { base: 12, lg: 6 } : { base: 12 }} hidden={!editing}>
          thumb
          
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput {...form.getInputProps('socialMedia')} disabled={isSubmitting} label="Facebook" placeholder="Facebook" type="text" />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput {...form.getInputProps('socialMedia')} disabled={isSubmitting} label="Instagram" placeholder="Instagram" type="text" />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput {...form.getInputProps('socialMedia')} disabled={isSubmitting} label="YouTube" placeholder="YouTube" type="text" />
            </Grid.Col>
          </Grid>
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
