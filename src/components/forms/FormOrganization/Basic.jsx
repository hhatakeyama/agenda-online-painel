import { Button, Grid, Group, LoadingOverlay, Select, Stack, TextInput, useMantineTheme } from '@mantine/core'
import { useForm, yupResolver } from '@mantine/form'
import { useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import { useSWRConfig } from 'swr'

import { useAuth } from '@/providers/AuthProvider'
import { api, slugify, Yup } from '@/utils'
import errorHandler from '@/utils/errorHandler'

import * as Fields from './Fields'

export default function Basic({ organizationData, onClose }) {
  // Hooks
  const theme = useMantineTheme()
  const isXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs}px)`)
  const { mutate: mutateGlobal } = useSWRConfig()
  const { isValidating, permissionsData } = useAuth()
  const { organizationId } = useParams()

  // Constants
  const editing = !!organizationData

  // States
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form
  const initialValues = {
    registeredName: organizationData?.registeredName || '',
    tradingName: organizationData?.tradingName || '',
    cnpj: organizationData?.cnpj || '',
    status: organizationData?.status?.toString?.() || '1',
  }

  const schema = Yup.object().shape({
    registeredName: Yup.string().required(),
    tradingName: Yup.string().required(),
    cnpj: Yup.string().required(),
    status: Yup.number(),
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
    setIsSubmitting(true)
    if (form.isDirty()) {
      return api
        [editing ? 'patch' : 'post'](`/admin/organizations${editing ? `/update/${organizationId}` : ''}`, {
          ...newValues,
          slug: slugify(newValues.tradingName)
        })
        .then(() => {
          if (editing) {
            mutateGlobal(`/admin/organizations/${organizationId}`)
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
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput {...form.getInputProps('registeredName')} disabled={isSubmitting} label="Razão Social" placeholder="Razão Social" type="text" required />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput {...form.getInputProps('tradingName')} disabled={isSubmitting} label="Nome Fantasia" placeholder="Nome Fantasia" type="text" required />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Fields.TaxDocumentField inputProps={{ ...form.getInputProps('cnpj'), disabled: isSubmitting, required: true }} />
              </Grid.Col>
              {permissionsData?.sa && (
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
