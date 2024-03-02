import { Alert, Button, Grid, Group, LoadingOverlay, Select, Stack, Textarea, TextInput, useMantineTheme } from '@mantine/core'
import { useForm, yupResolver } from '@mantine/form'
import { useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import React, { useState } from 'react'

import { useAuth } from '@/providers/AuthProvider'
import { api, Yup } from '@/utils'
import errorHandler from '@/utils/errorHandler'

import * as Fields from './Fields'

export default function Basic({ scheduleData, mutate }) {
  // Hooks
  const theme = useMantineTheme()
  const isXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs}px)`)
  const { isValidating, permissionsData } = useAuth()

  // Constants
  const editing = !!scheduleData

  // States
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form
  const initialValues = {
    organizationId: scheduleData?.organizationId || null,
    name: scheduleData?.name || '',
    description: scheduleData?.description || '',
    serviceCategoryId: scheduleData?.serviceCategoryId || null,
    price: scheduleData?.price || 0.00,
    duration: scheduleData?.duration || '00:00',
    status: scheduleData?.status || '1',
  }

  const schema = Yup.object().shape({
    organizationId: Yup.number().required(),
    name: Yup.string().required(),
    description: Yup.string(),
    serviceCategoryId: Yup.object().required(),
    price: Yup.number().required(),
    duration: Yup.string().required(),
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
  const optionsOrganizations = [{ label: 'Empresa 1', value: '1' }]

  // Actions
  const handleSubmit = async (newValues) => {
    setError(null)
    setIsSubmitting(true)
    if (form.isDirty()) {
      return api
        .patch(`/api/admin/usuarios/${scheduleData?.id}`, { ...newValues })
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
              {permissionsData?.sa && <Grid.Col span={{ base: 12 }}>
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
                <TextInput {...form.getInputProps('name')} disabled={isSubmitting} label="Serviço" placeholder="Serviço" type="text" required />
              </Grid.Col>
              <Grid.Col span={{ base: 12 }}>
                <Textarea {...form.getInputProps('description')} disabled={isSubmitting} label="Descrição" placeholder="Descrição" minRows={5} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Fields.CategoryField
                  inputProps={{
                    ...form.getInputProps('serviceCategoryId'),
                    data: optionsOrganizations,
                    disabled: isSubmitting,
                    searchable: true,
                    required: true
                  }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput {...form.getInputProps('price')} disabled={isSubmitting} label="Preço (padrão)" placeholder="Preço" type="tel" />
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
