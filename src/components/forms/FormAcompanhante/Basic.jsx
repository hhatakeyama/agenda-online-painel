import { Alert, Button, Grid, Group, LoadingOverlay, Select, Stack, Textarea, TextInput, useMantineTheme } from '@mantine/core'
import { useForm, yupResolver } from '@mantine/form'
import { useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconBrandSkype, IconBrandYoutube } from '@tabler/icons-react'
import React, { useState } from 'react'

import { useAuth } from '@/providers/AuthProvider'
import { api, Yup } from '@/utils'
import errorHandler from '@/utils/errorHandler'

import * as Fields from './Fields'

export default function Basic({ acompanhanteData, mutate }) {
  // Hooks
  const { isValidating } = useAuth()
  const theme = useMantineTheme()
  const isXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs}px)`)

  // States
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Constants
  const initialValues = {
    name: acompanhanteData?.usuario?.name || '',
    email: acompanhanteData?.usuario?.email || '',
    password: '',
    confirmPassword: '',
    sobre: acompanhanteData?.sobre || '',
    ordem: acompanhanteData?.ordem || '',
    virtual: acompanhanteData?.virtual || '0',
    verificado: acompanhanteData?.verificado || '0',
    status: acompanhanteData?.status || '0',
    tipo_id: acompanhanteData?.tipo_id || '',
    cabelo_id: acompanhanteData?.cabelo_id || '',
    idade: acompanhanteData?.idade || '',
    olho_id: acompanhanteData?.olho_id || '',
    altura: acompanhanteData?.altura || '',
    peso: acompanhanteData?.peso || '',
    busto: acompanhanteData?.busto || '',
    cintura: acompanhanteData?.cintura || '',
    quadril: acompanhanteData?.quadril || '',
    manequim: acompanhanteData?.manequim || '',
    cache: acompanhanteData?.cache || '',
    duracao: acompanhanteData?.duracao || '',
    dia_inteiro: acompanhanteData?.dia_inteiro || '0',
    observacao_horario: acompanhanteData?.observacao_horario || '',
    video: acompanhanteData?.video || '',
    skype: acompanhanteData?.skype || '',
    acessorios: acompanhanteData?.acessorios || '',
    atende: acompanhanteData?.atende || '',
    locais: acompanhanteData?.locais || '',
    viagem: acompanhanteData?.viagem || '',
    anal: acompanhanteData?.anal || '',
    adicionais: acompanhanteData?.adicionais || '',
  }

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    email: Yup.string().email().required(),
    password: Yup.string().nullable(),
    confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Senhas diferentes'),
    sobre: Yup.string().nullable(),
    ordem: Yup.string().nullable(),
    virtual: Yup.string().nullable(),
    verificado: Yup.string().nullable(),
    status: Yup.string().nullable(),
    tipo_id: Yup.number().required("Tipo obrigatório"),
    cabelo_id: Yup.number().nullable(),
    idade: Yup.string().nullable(),
    cabelo_id: Yup.number().nullable(),
    altura: Yup.string().nullable(),
    peso: Yup.string().nullable(),
    busto: Yup.string().nullable(),
    cintura: Yup.string().nullable(),
    quadril: Yup.string().nullable(),
    manequim: Yup.string().nullable(),
    cache: Yup.string().nullable(),
    duracao: Yup.string().nullable(),
    dia_inteiro: Yup.string().nullable(),
    observacao_horario: Yup.string().nullable(),
    video: Yup.string().nullable(),
    skype: Yup.string().nullable(),
    acessorios: Yup.string().nullable(),
    atende: Yup.string().nullable(),
    locais: Yup.string().nullable(),
    viaja: Yup.string().nullable(),
    anal: Yup.string().nullable(),
    adicionais: Yup.string().nullable(),
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
    if (form.isDirty()) {
      return api
        .patch(`/admin/acompanhantes/${acompanhanteData?.user_id}/`, {
          ...newValues, ...(newValues ? { password_confirmation: newValues.confirmPassword } : {})
        }) // Verificar usuário logado no painel
        .then(() => {
          form.resetDirty()
          form.resetTouched()
          setTimeout(() => mutate(), 2000)
          notifications.show({
            title: 'Sucesso',
            message: 'Dados atualizados com sucesso!',
            color: 'green'
          })
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
        <Grid.Col span={{ base: 12, lg: 6 }}>
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
              <Grid.Col span={12}>
                <Textarea {...form.getInputProps('sobre')} disabled={isSubmitting} label="Sobre" placeholder="Sobre" rows={6} />
              </Grid.Col>
              {/* <Grid.Col span={4}>
                <Fields.StateField inputProps={{ ...form.getInputProps('uf'), disabled: isSubmitting }} />
              </Grid.Col>
              <Grid.Col span={8}>
                <Fields.CityField inputProps={{ ...form.getInputProps('cidade_id'), disabled: isSubmitting }} />
              </Grid.Col> */}
              <Grid.Col span={6}>
                <TextInput {...form.getInputProps('ordem')} disabled={isSubmitting} label="Ordem" placeholder="Ordem" type="number" />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Atende virtualmente?"
                  placeholder="Atende virtualmente?"
                  data={[{ value: '1', label: 'Sim' }, { value: '0', label: 'Não' }]}
                  disabled={isSubmitting}
                  clearable
                  {...form.getInputProps('virtual')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Conta verificada?"
                  placeholder="Conta verificada?"
                  data={[{ value: '1', label: 'Sim' }, { value: '0', label: 'Não' }]}
                  disabled={isSubmitting}
                  clearable
                  {...form.getInputProps('verificado')}
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
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Stack>
            <Grid>
              <Grid.Col span={6}>
                <Select
                  required
                  label="Tipo"
                  placeholder="Tipo"
                  data={[
                    { value: '1', label: 'Mulher' },
                    { value: '2', label: 'Travesti' },
                    { value: '3', label: 'Casal' },
                    { value: '4', label: 'Homem' },
                  ]}
                  disabled={isSubmitting}
                  {...form.getInputProps('tipo_id')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Cabelo"
                  placeholder="Cabelo"
                  data={[
                    { value: '1', label: 'Loira' },
                    { value: '2', label: 'Morena' },
                    { value: '3', label: 'Mestiça' },
                    { value: '4', label: 'Mulata' },
                    { value: '5', label: 'Oriental' },
                    { value: '6', label: 'Ruiva' },
                  ]}
                  disabled={isSubmitting}
                  clearable
                  {...form.getInputProps('cabelo_id')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput {...form.getInputProps('idade')} disabled={isSubmitting} label="Idade" placeholder="Idade" type="number" />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Olhos"
                  placeholder="Olhos"
                  data={[
                    { value: '1', label: 'Azul' },
                    { value: '2', label: 'Castanho' },
                    { value: '3', label: 'Castanho Claro' },
                    { value: '4', label: 'Castanho Escuro' },
                    { value: '5', label: 'Castanho Esverdeado' },
                    { value: '6', label: 'Mel' },
                    { value: '7', label: 'Preto' },
                    { value: '8', label: 'Verde' },
                  ]}
                  disabled={isSubmitting}
                  clearable
                  {...form.getInputProps('olho_id')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput {...form.getInputProps('altura')} disabled={isSubmitting} label="Altura" placeholder="Altura" type="text" />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput {...form.getInputProps('peso')} disabled={isSubmitting} label="Peso" placeholder="Peso" type="text" />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput {...form.getInputProps('busto')} disabled={isSubmitting} label="Busto" placeholder="Busto" type="text" />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput {...form.getInputProps('cintura')} disabled={isSubmitting} label="Cintura" placeholder="Cintura" type="text" />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput {...form.getInputProps('quadril')} disabled={isSubmitting} label="Quadril" placeholder="Quadril" type="text" />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput {...form.getInputProps('manequim')} disabled={isSubmitting} label="Manequim" placeholder="Manequim" type="text" />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput {...form.getInputProps('cache')} disabled={isSubmitting} label="Cachê" placeholder="Cachê" type="text" />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput {...form.getInputProps('duracao')} disabled={isSubmitting} label="Duração" placeholder="Duração" type="text" />
              </Grid.Col>
              <Grid.Col span={4}>
                <Select
                  label="Dia inteiro"
                  placeholder="Dia inteiro"
                  data={[{ value: '1', label: 'Sim' }, { value: '0', label: 'Não' }]}
                  disabled={isSubmitting}
                  clearable
                  {...form.getInputProps('dia_inteiro')}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea {...form.getInputProps('observacao_horario')} disabled={isSubmitting} label="Observação de horário" placeholder="Observação de horário" />
              </Grid.Col>
              <Grid.Col span={12}>
                <TextInput {...form.getInputProps('video')} disabled={isSubmitting} label="Vídeo destaque (url)" placeholder="Vídeo destaque (url)" type="text" leftSection={<IconBrandYoutube />} />
              </Grid.Col>
              <Grid.Col span={12}>
                <TextInput {...form.getInputProps('skype')} disabled={isSubmitting} label="Skype" placeholder="Skype" type="text" leftSection={<IconBrandSkype />} />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea {...form.getInputProps('acessorios')} disabled={isSubmitting} label="Acessórios" placeholder="Acessórios" />
              </Grid.Col>
              <Grid.Col span={12}>
                <TextInput {...form.getInputProps('atende')} disabled={isSubmitting} label="Atende (homem, mulher, casal, etc...)" placeholder="Atende (homem, mulher, casal, etc...)" type="text" />
              </Grid.Col>
              <Grid.Col span={12}>
                <TextInput {...form.getInputProps('locais')} disabled={isSubmitting} label="Atende em (atende em motel, local próprio, etc...)" placeholder="Atende em (atende em motel, local próprio, etc...)" type="text" />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput {...form.getInputProps('viagem')} disabled={isSubmitting} label="Viaja (sim, não, a combinar, etc...)" placeholder="Viaja" type="text" />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput {...form.getInputProps('anal')} disabled={isSubmitting} label="Anal (sim, não, a combinar, etc...)" placeholder="Anal" type="text" />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea {...form.getInputProps('adicionais')} disabled={isSubmitting} label="Texto adicional" placeholder="Texto adicional" />
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
