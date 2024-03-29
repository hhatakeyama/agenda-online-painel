import { Alert, Button, FileButton, Grid, Group, Image, LoadingOverlay, Select, Stack, Text, TextInput, useMantineTheme } from '@mantine/core'
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

export default function Basic({ companyData }) {
  // Hooks
  const theme = useMantineTheme()
  const isXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs}px)`)
  const { mutate: mutateGlobal } = useSWRConfig()
  const { isValidating, permissionsData, userData } = useAuth()
  const { companyId } = useParams()

  // Constants
  const editing = !!companyData

  // States
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [socialMedias, setSocialMedias] = useState(companyData?.socialMedia ? JSON.parse(companyData?.socialMedia) : { "facebook": "https://facebook.com/", "twitter": "https://twitter.com/", "instagram": "https://instagram.com/" })
  const [file, setFile] = useState(null)
  const srcPicture = companyData?.thumb?.indexOf('http') !== -1 ? companyData?.thumb : `${process.env.NEXT_PUBLIC_API_DOMAIN}/storage/companies/original-${companyData?.thumb}`
  const srcPictureFile = file ? URL.createObjectURL(file) : (srcPicture || '')

  // Form
  const initialValues = {
    organization_id: companyData?.organization_id?.toString() || '',
    name: companyData?.name || '',
    address: companyData?.address || '',
    district: companyData?.district || '',
    cep: companyData?.cep || '',
    city_id: companyData?.city_id?.toString() || '',
    state: companyData?.state || '',
    thumb: companyData?.thumb || '',
    phone: companyData?.phone || '',
    mobilePhone: companyData?.mobilePhone || '',
    email: companyData?.email || '',
    socialMedia: companyData?.socialMedia || '',
    status: companyData?.status?.toString() || '1',
    employees: companyData?.company_employees?.flatMap?.(companyEmployee => companyEmployee.employee_id.toString()) || [],
    services: companyData?.company_services?.flatMap?.(companyService => companyService.service_id.toString()) || [],
  }

  const schema = Yup.object().shape({
    organization_id: permissionsData?.sa ? Yup.number().nullable() : Yup.number().required(),
    name: Yup.string().required(),
    address: Yup.string().nullable(),
    district: Yup.string().nullable(),
    cep: Yup.string().nullable(),
    city_id: Yup.string().nullable(),
    state: Yup.string().nullable(),
    thumb: Yup.string().nullable(),
    phone: Yup.string().nullable(),
    mobilePhone: Yup.string().nullable(),
    email: Yup.string().nullable().email(),
    socialMedia: Yup.string().nullable(),
    status: Yup.string().nullable(),
    employees: Yup.array().nullable(),
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
  const { data } = useFetch([`/states`])
  const optionsStates = data?.data?.map(state => ({ value: state.id.toString(), label: state.name })) || []
  
  const { data: dataCities } = useFetch([form.values.state ? `/states/${form.values.state}/cities` : null])
  const optionsCities = dataCities?.data?.map(city => ({ value: city.id.toString(), label: city.name })) || []
  
  const { data: organizationsData } = useFetch([permissionsData?.sa ? `/admin/organizations` : null])
  const { data: { data: list = [] } } = organizationsData || { data: {} }
  const organizationsOptions = list?.map(item => ({ label: item.registeredName, value: item.id.toString() }))
  const optionsOrganizations = [{ label: 'Sem Empresa', value: '0' }, ...organizationsOptions]
  
  const { data: dataEmployees } = useFetch([permissionsData?.sag && userData ? `/admin/employees` : null])
  const { data: resultsEmployees = [] } = dataEmployees?.data || {}
  const optionsEmployees =
    resultsEmployees.map(service => ({ label: service.name, value: service.id.toString() })) || []

  // Actions
  const handleSubmit = async (newValues) => {
    setError(null)
    setIsSubmitting(true)
    const { ...restValues } = newValues
    return api
      [editing ? 'patch' : 'post'](`/api/admin/companies${editing ? `/${companyData?.id}` : ''}`, {
        ...restValues,
        ...(permissionsData?.g && userData ? { organization_id: userData.organization_id } : {}),
        socialMedia: JSON.stringify(socialMedias)
      })
      .then(() => {
        if (editing) {
          mutateGlobal(`/api/admin/companies/${companyId}`)
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

  const handleFileChange = async file => {
    setFile(file)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileName', file.name)
    await api
      .post(`/api/admin/companies/${companyId}/thumb`, formData, {
        headers: { "Content-Type": 'multipart/form-data' }
      })
      .then(() => {
        notifications.show({
          title: 'Sucesso',
          message: 'Foto de capa atualizada com sucesso!',
          color: 'green'
        })
      })
      .catch(error => {
        notifications.show({
          title: 'Erro',
          message: error?.response?.data?.error ||
            'Erro ao atualizar foto de capa. Entre em contato com o administrador do site ou tente novamente mais tarde.',
          color: 'red'
        })
      })
  }

  const handleSocialMedias = (type, value) => {
    const newData = { ...socialMedias, [type]: value }
    setSocialMedias(newData)
    form.setFieldValue('socialMedia', JSON.stringify(newData))
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} style={{ position: 'relative' }}>
      <LoadingOverlay visible={isValidating} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      <Grid>
        <Grid.Col span={editing ? { base: 12, lg: 6 } : { base: 12 }}>
          <Stack>
            <Grid>
              {permissionsData?.sa && (
                <Grid.Col span={{ base: 12 }}>
                  <Fields.OrganizationField
                    inputProps={{
                      ...form.getInputProps('organization_id'),
                      data: optionsOrganizations,
                      disabled: isSubmitting,
                      searchable: true,
                      required: permissionsData?.ge
                    }}
                  />
                </Grid.Col>
              )}
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
                    data: optionsStates,
                    disabled: isSubmitting,
                    searchable: true,
                    ...form.getInputProps('state'),
                  }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 8 }}>
                {optionsCities.length > 0 && <Fields.CityField
                  inputProps={{
                    data: optionsCities,
                    disabled: !form.values.state || isSubmitting,
                    searchable: true,
                    ...form.getInputProps('city_id'),
                  }}
                />}
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Fields.WhatsappField inputProps={{ ...form.getInputProps('mobilePhone'), disabled: isSubmitting }} />
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
          {editing && (
            <Stack gap={5} align="center">
              <FileButton onChange={handleFileChange} accept="image/png,image/jpeg">
                {(props) =>
                  <>
                    <Image {...props} alt="Capa" src={srcPictureFile} radius="md" fit="contain" fallbackSrc="https://placehold.co/600x300?text=Sem imagem" />
                    <Text {...props} style={{ textWrap: 'nowrap' }}>{userData?.picture ? 'Alterar foto' : 'Selecionar foto'}</Text>
                    <Text size="sm">733px x 100px</Text>
                  </>
                }
              </FileButton>
            </Stack>
          )}

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput disabled={isSubmitting} label="Facebook" placeholder="Facebook" type="text" value={socialMedias.facebook} onChange={e => handleSocialMedias('facebook', e.target.value)} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput disabled={isSubmitting} label="Instagram" placeholder="Instagram" type="text" value={socialMedias.twitter} onChange={e => handleSocialMedias('twitter', e.target.value)} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput disabled={isSubmitting} label="YouTube" placeholder="YouTube" type="text" value={socialMedias.instagram} onChange={e => handleSocialMedias('instagram', e.target.value)} />
            </Grid.Col>
          </Grid>
        </Grid.Col>
      </Grid>
      <Fields.EmployeesField
        inputProps={{
          ...form.getInputProps('employees'),
          data: optionsEmployees,
          disabled: isSubmitting,
          searchable: true,
        }}
      />

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
