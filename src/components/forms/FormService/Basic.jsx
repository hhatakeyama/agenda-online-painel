import { Button, Grid, Group, LoadingOverlay, NumberInput, Select, Stack, Switch, Textarea, TextInput, Tooltip, useMantineTheme } from '@mantine/core'
import { useForm, yupResolver } from '@mantine/form'
import { useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconInfoCircle } from '@tabler/icons-react'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import { useSWRConfig } from 'swr'

import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'
import { api, Yup } from '@/utils'
import errorHandler from '@/utils/errorHandler'

import * as Fields from './Fields'

export default function Basic({ mutate, serviceData, onClose }) {
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
    send_email: serviceData?.send_email === 1 || serviceData?.send_email === "1" || false,
    send_sms: serviceData?.send_sms === 1 || serviceData?.send_sms === "1" || false,
    email_message: serviceData?.email_message || '',
    sms_message: serviceData?.sms_message || '',
    can_choose_random: serviceData?.can_choose_random?.toString?.() || "1",
    can_choose_employee: serviceData?.can_choose_employee?.toString?.() || "1",
    // can_simultaneous: serviceData?.can_simultaneous?.toString?.() || "0",
    status: serviceData?.status?.toString?.() || '1',
  }

  const schema = Yup.object().shape({
    organization_id: Yup.number().required(),
    name: Yup.string().required(),
    description: Yup.string().nullable(),
    serviceCategory_id: Yup.number().required(),
    price: Yup.number().nullable().moreThan(0, "Valor obrigatório").required("Valor obrigatório"),
    duration: Yup.string().required(),
    send_email: Yup.string().required(),
    send_sms: Yup.string().required(),
    email_message: Yup.string().nullable(),
    sms_message: Yup.string().max(160, "Limite de 160 caracteres").nullable(),
    can_choose_random: Yup.number().required(),
    can_choose_employee: Yup.number().required(),
    // can_simultaneous: Yup.boolean().required(),
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
  const { data } = useFetch([permissionsData?.sa ? `/admin/organizations` : null])
  const { data: results = [] } = data?.data || {}
  const optionsOrganizations =
    results.map(organization => ({ label: organization.registeredName, value: organization.id.toString() })) || []
  const { data: dataCategories } = useFetch([`/admin/service-categories`])
  const { data: resultsCategories = [] } = dataCategories?.data || {}
  const optionsCategories =
    resultsCategories.map(category => ({ label: category.name, value: category.id.toString() })) || []

  // Actions
  const handleSubmit = async (newValues) => {
    setIsSubmitting(true)
    if (form.isDirty()) {
      return api
        [editing ? 'patch' : 'post'](
        `/api/admin/services${editing ? `/${serviceId}` : ''}`,
        {
          ...newValues,
          send_email: newValues.send_email ? "1" : "0",
          send_sms: newValues.send_sms ? "1" : "0",
        }
        )
        .then(() => {
          if (editing) {
            mutateGlobal(`/api/admin/services/${serviceId}`)
            form.resetTouched()
            form.resetDirty()
          } else {
            mutate()
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
                <NumberInput
                  {...form.getInputProps(`price`)}
                  disabled={isSubmitting}
                  label="Preço"
                  placeholder="Preço"
                  type="number"
                  decimalScale={2}
                  fixedDecimalScale
                  leftSection="R$"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  {...form.getInputProps(`duration`)}
                  disabled={isSubmitting}
                  label="Duração (de 5 em 5 minutos)"
                  placeholder="Duração"
                  type="time"
                  step={300}
                />
              </Grid.Col>
              <Grid.Col span={{ xs: 12 }}>
                <Stack>
                  <Switch {...form.getInputProps(`send_email`)} checked={form.values.send_email} label="Enviar e-mail" />
                  <Textarea
                    {...form.getInputProps(`email_message`)}
                    disabled={isSubmitting}
                    label="Texto do e-mail"
                    placeholder="Texto do e-mail"
                    rows={5}
                  />
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ xs: 12 }}>
                <Stack>
                  <Switch {...form.getInputProps(`send_sms`)} checked={form.values.send_sms} label="Enviar SMS" />
                  <Textarea
                    {...form.getInputProps(`sms_message`)}
                    disabled={isSubmitting}
                    label={`Texto do SMS (limite ${160 - form.values.sms_message.length} caracteres)`}
                    placeholder="Texto do SMS"
                    rows={5}
                    maxLength={160}
                  />
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label={<>
                    Colaborador aleatório?{" "}
                    <Tooltip label="Permitir usuário deixar plataforma escolher colaborador aleatório disponível?" color="blue">
                      <IconInfoCircle color="#1c7ed6" size={14} />
                    </Tooltip>
                  </>}
                  placeholder="Colaborador aleatório?"
                  data={[{ value: '1', label: 'Sim' }, { value: '0', label: 'Não' }]}
                  disabled={isSubmitting}
                  {...form.getInputProps('can_choose_random')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label={<>
                    Selecionar colaborador?{" "}
                    <Tooltip label="Permitir usuário escolher o próprio colaborador?" color="blue">
                      <IconInfoCircle color="#1c7ed6" size={14} />
                    </Tooltip>
                  </>}
                  placeholder="Selecionar colaborador?"
                  data={[{ value: '1', label: 'Sim' }, { value: '0', label: 'Não' }]}
                  disabled={isSubmitting}
                  {...form.getInputProps('can_choose_employee')}
                />
              </Grid.Col>
              {/* <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label={<>
                    Permite serviços simultâneos?{" "}
                    <Tooltip label="Permitir que serviços sejam executados simultaneamente com outros serviços?" color="blue">
                      <IconInfoCircle color="#1c7ed6" size={14} />
                    </Tooltip>
                  </>}
                  placeholder="Permite serviços simultâneos?"
                  data={[{ value: '1', label: 'Sim' }, { value: '0', label: 'Não' }]}
                  disabled={isSubmitting}
                  {...form.getInputProps('status')}
                />
              </Grid.Col> */}
              <Grid.Col span={{ base: 12, sm: 6 }}>
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
    </form >
  )
}
