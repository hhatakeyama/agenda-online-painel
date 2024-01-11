import { Button, Grid, Group } from '@mantine/core'
import { useForm, yupResolver } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import React, { useState } from 'react'

import { api, Yup } from '@/utils'

import * as Fields from './Fields'

export default function Phones({ acompanhanteId, phoneData, onSuccess }) {
  // States
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Constants
  const initialValues = {
    acompanhante_id: acompanhanteId,
    numero: phoneData?.numero || '',
    whatsapp: phoneData?.whatsapp === "1" ? true : false,
    operadora_id: "1",
    status: "1",
  }

  const schema = Yup.object().shape({
    numero: Yup.string(),
    whatsapp: Yup.string(),
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
    if (phoneData) {
      return api
        .patch(`/admin/acompanhantes/${acompanhanteId}/telefones/${phoneData.id}`, newValues)
        .then(response => {
          onSuccess?.()
          showNotification({ title: 'Sucesso', message: response?.data?.message || 'Telefone atualizado com sucesso!', color: 'green' })
        })
        .catch(response => {
          showNotification({ title: 'Erro', message: response?.data?.message || 'Ocorreu um erro ao atualizar o telefone. Tente novamente mais tarde.', color: 'red' })
        })
        .finally(() => {
          setIsSubmitting(false)
          form.resetDirty()
          form.resetTouched()
        })
    } else {
      return api
        .post(`/admin/acompanhantes/${acompanhanteId}/telefones`, newValues)
        .then(response => {
          onSuccess?.()
          showNotification({ title: 'Sucesso', message: response?.data?.message || 'Telefone cadastrado com sucesso!', color: 'green' })
        })
        .catch(response => {
          showNotification({
            title: 'Erro',
            message: response?.data?.message || 'Ocorreu um erro ao cadastrar o telefone. Tente novamente mais tarde.',
            color: 'red'
          })
        })
        .finally(() => {
          setIsSubmitting(false)
          form.reset()
        })
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    if (phoneData) {
      return api
        .delete(`/admin/acompanhantes/${acompanhanteId}/telefones/${phoneData.id}`)
        .then(response => {
          onSuccess?.()
          showNotification({ title: 'Sucesso', message: response?.data?.message || 'Telefone removido com sucesso!', color: 'green' })
        })
        .catch(response => {
          showNotification({
            title: 'Erro',
            message: response?.data?.message || 'Ocorreu um erro ao remover o telefone. Tente novamente mais tarde.',
            color: 'red'
          })
        })
        .finally(() => setIsSubmitting(false))
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} style={{ position: 'relative' }}>
      <Grid align="center">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Fields.PhoneNumberField
            inputProps={{
              ...form.getInputProps('numero'),
              disabled: isSubmitting,
            }}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Fields.WhatsappCheckboxField
            inputProps={{
              ...form.getInputProps('whatsapp', { type: 'checkbox' }),
              disabled: isSubmitting
            }}
          />
        </Grid.Col>
      </Grid>
      <Group mt="xl">
        {phoneData && (
          <Button
            color="red"
            type="button"
            size="sm"
            onClick={handleDelete}
            loading={isSubmitting}>
            Remover
          </Button>
        )}
        <Button
          color="green"
          type="submit"
          size="sm"
          disabled={!form.isValid() || !form.isDirty()}
          loading={isSubmitting}>
          {phoneData ? "Editar" : "Salvar"}
        </Button>
      </Group>
    </form>
  )
}
