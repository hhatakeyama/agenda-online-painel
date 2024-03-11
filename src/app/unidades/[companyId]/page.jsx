'use client'

import { Button, Container, Grid, Group, LoadingOverlay, MultiSelect, Stack, Tabs, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconBuildingStore, IconChisel } from '@tabler/icons-react'
import Link from 'next/link'
import { redirect, useParams } from 'next/navigation'
import React, { useState } from 'react'

import { FormCompany } from '@/components/forms'
import guardAccount from '@/guards/AccountGuard'
import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'
import { api } from '@/utils'

function Company() {
  // Hooks
  const { isAuthenticated, permissionsData, userData } = useAuth()
  const { companyId } = useParams()

  // States
  const [tab, setTab] = useState('company')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch
  const { data, error, isValidating, mutate } = useFetch([isAuthenticated ? `/admin/companies/${companyId}` : null])
  const { data: companyData } = data || {}

  const { data: dataServices, mutate: mutateServices } = useFetch([
    permissionsData?.sag && userData ? `/admin/services` : null,
    { organization_id: companyData?.organization_id }
  ])
  const { data: resultsServices = [] } = dataServices?.data || {}
  const optionsServices =
    resultsServices
      .filter(service => !companyData?.company_services.find(companyService => companyService?.service_id === service.id))
      .map(service => ({ label: service.name, value: service.id.toString() })) || []

  // Constants
  const tabs = [
    { id: 'company', label: 'Unidade', icon: <IconBuildingStore style={{ height: 12, width: 12 }} /> },
    { id: 'services', label: 'Serviços', icon: <IconChisel style={{ height: 12, width: 12 }} /> },
  ]

  // Validations
  if ((isAuthenticated === true && permissionsData && !permissionsData.sag) || !!error) return redirect('/')

  // Actions
  const handleCreateCompanyService = async (service_id) => {
    if (service_id?.[0]) {
      setIsSubmitting(true)
      return await api
        .post(`/api/admin/companies/${companyData?.id}/services`, { service_id: service_id[0] })
        .then(() => {
          mutate()
          mutateServices()
          notifications.show({ title: 'Sucesso', message: 'Serviço adicionado com sucesso!', color: 'green' })
        })
        .catch(error => {
          notifications.show({
            title: 'Erro',
            message:
              errorHandler(error.response.data.errors).messages ||
              'Erro ao adicionar serviço. Entre em contato com o administrador do site ou tente novamente mais tarde.',
            color: 'red'
          })
        })
        .finally(() => setIsSubmitting(false))
    }
  }

  const handleRemoveCompanyService = async (service_id) => {
    setIsSubmitting(true)
    return await api
      .delete(`/api/admin/companies/${companyData?.id}/services/${service_id}`)
      .then(() => {
        mutate()
        mutateServices()
        notifications.show({ title: 'Sucesso', message: 'Serviço removido com sucesso!', color: 'green' })
      })
      .catch(error => {
        notifications.show({
          title: 'Erro',
          message:
            error.response.data.message ||
            'Erro ao remover serviço. Entre em contato com o administrador do site ou tente novamente mais tarde.',
          color: 'red'
        })
      })
      .finally(() => setIsSubmitting(false))
  }

  return (
    <Container size="100%" mb="50px">
      <Stack>
        <Group justify="space-between">
          <Button component={Link} href="/unidades">Voltar</Button>
        </Group>
        <Tabs value={tab} onChange={setTab}>
          <Tabs.List>
            {tabs.map(item => (
              <Tabs.Tab key={item.id} value={item.id} leftSection={item.icon}>
                {item.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <Tabs.Panel value="company">
            {companyData && tab === 'company' && (
              <Container size="100%" mb="xl" mt="xs">
                <FormCompany.Basic companyData={companyData} />
              </Container>
            )}
          </Tabs.Panel>
          <Tabs.Panel value="services">
            {companyData && tab === 'services' && (
              <Container size="100%" mb="xl" mt="xs">
                <LoadingOverlay visible={isValidating} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                <Stack>
                  <Text>Adicione os serviços</Text>

                  <Grid>
                    <Grid.Col span={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <MultiSelect
                        label="Serviços"
                        placeholder="Serviços"
                        data={optionsServices}
                        disabled={isSubmitting}
                        searchable={true}
                        onChange={option => handleCreateCompanyService(option)}
                      />
                    </Grid.Col>
                  </Grid>

                  {companyData?.company_services?.map(companyService => (
                    <FormCompany.Services
                      key={companyService.id}
                      mutate={mutate}
                      serviceData={companyService}
                      onRemove={handleRemoveCompanyService}
                    />
                  ))}
                </Stack>
              </Container>
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container >
  )
}

export default guardAccount(Company)
