import { Button, Grid, Group, LoadingOverlay, Select, Stack, Textarea, TextInput, useMantineTheme } from '@mantine/core'
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

export default function Basic({ serviceData, onClose }) {
  // Hooks
  const theme = useMantineTheme()
  const isXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs}px)`)
  const { mutate: mutateGlobal } = useSWRConfig()
  const { isValidating, permissionsData } = useAuth()
  const { serviceId } = useParams()

  // Constants
  const editing = !!serviceData

  // States
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form
  const initialValues = {
    organization_id: serviceData?.organization_id?.toString?.() || null,
    name: serviceData?.name || '',
    description: serviceData?.description || '',
    serviceCategory_id: serviceData?.serviceCategory_id?.toString?.() || null,
    price: serviceData?.price || 0.00,
    duration: serviceData?.duration || '00:00',
    status: serviceData?.status?.toString?.() || '1',
  }

  const schema = Yup.object().shape({
    organization_id: Yup.number().required(),
    name: Yup.string().required(),
    description: Yup.string(),
    serviceCategory_id: Yup.number().required(),
    price: Yup.number().required(),
    duration: Yup.string().required(),
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
  const { data: dataCategories } = useFetch([`/admin/service-categories/`])
  const { data: resultsCategories = [] } = dataCategories?.data || {}
  const optionsCategories =
    resultsCategories.map(category => ({ label: category.name, value: category.id.toString() })) || []

  // Actions
  const handleSubmit = async (newValues) => {
    setIsSubmitting(true)
    if (form.isDirty()) {
      return api
        [editing ? 'patch' : 'post'](`/admin/services${editing ? `/${serviceId}` : ''}/`, { ...newValues }) // Verificar usuário logado no painel
        .then(() => {
          if (editing) {
            mutateGlobal(`/admin/services/${serviceId}/`)
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
                    ...form.getInputProps('organization_id'),
                    data: optionsOrganizations,
                    disabled: isSubmitting,
                    searchable: true,
                    required: true
                  }}
                />
              </Grid.Col>}
              <Grid.Col span={{ base: 12 }}>
                <TextInput {...form.getInputProps('name')} disabled={isSubmitting} label="Serviço" placeholder="Serviço" type="text" required />
              </Grid.Col>
              <Grid.Col span={{ base: 12 }}>
                <Textarea {...form.getInputProps('description')} disabled={isSubmitting} label="Descrição" placeholder="Descrição" minRows={5} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Fields.CategoryField
                  inputProps={{
                    ...form.getInputProps('serviceCategory_id'),
                    data: optionsCategories,
                    disabled: isSubmitting,
                    searchable: true,
                    required: true
                  }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput {...form.getInputProps('price')} disabled={isSubmitting} label="Preço (padrão)" placeholder="Preço" type="number" />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput {...form.getInputProps('duration')} disabled={isSubmitting} label="Duração (padrão)" placeholder="Duração" type="time" />
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
