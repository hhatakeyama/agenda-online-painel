import { Box, Button, Grid, Group, Modal, Stack, Text } from '@mantine/core'
import { useForm, yupResolver } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import React, { useState } from 'react'

import { useFetch } from '@/hooks'
import { api, Yup } from '@/utils'

import * as Fields from './Fields'

export default function Agenda({ acompanhanteData, agendaData, onSuccess }) {
  // States
  const [remove, setRemove] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Constants
  const initialValues = {
    acompanhante_id: acompanhanteData.id,
    estado_id: agendaData?.estado_id || '',
    cidade_id: agendaData?.cidade_id || '',
    data_inicio: agendaData?.data_inicio || '',
    data_fim: agendaData?.data_fim || '',
  }

  const schema = Yup.object().shape({
    estado_id: Yup.string().required("Selecione o estado da agenda da acompanhante"),
    cidade_id: Yup.string().required("Selecione a cidade da agenda da acompanhante"),
    data_inicio: Yup.string().required("Digite uma data início da agenda"),
    data_fim: Yup.string().required("Digite uma data fim da agenda"),
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
    if (agendaData) {
      return api
        .patch(`/admin/acompanhantes/${acompanhanteData.user_id}/agendas/${agendaData.id}`, newValues)
        .then(response => {
          onSuccess?.()
          showNotification({ title: 'Sucesso', message: response?.message || 'Agenda atualizada com sucesso!', color: 'green' })
        })
        .catch(response => {
          showNotification({ title: 'Erro', message: response?.message || 'Ocorreu um erro ao atualizar a agenda. Tente novamente mais tarde.', color: 'red' })
        })
        .finally(() => {
          setIsSubmitting(false)
          form.resetDirty()
          form.resetTouched()
        })
    } else {
      return api
        .post(`/admin/acompanhantes/${acompanhanteData.user_id}/agendas`, newValues)
        .then(response => {
          onSuccess?.()
          showNotification({ title: 'Sucesso', message: response?.message || 'Agenda cadastrada com sucesso!', color: 'green' })
        })
        .catch(response => {
          showNotification({
            title: 'Erro',
            message: response?.message || 'Ocorreu um erro ao cadastrar a agenda. Tente novamente mais tarde.',
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
    if (remove) {
      return api
        .delete(`/admin/acompanhantes/${acompanhanteData.user_id}/agendas/${remove.id}`)
        .then(response => {
          onSuccess?.()
          showNotification({ title: 'Sucesso', message: response?.data?.message || 'Agenda removida com sucesso!', color: 'green' })
        })
        .catch(response => {
          showNotification({
            title: 'Erro',
            message: response?.data?.message || 'Ocorreu um erro ao remover a agenda. Tente novamente mais tarde.',
            color: 'red'
          })
        })
        .finally(() => setIsSubmitting(false))
    }
  }

  // Fetch
  const { data } = useFetch([`/admin/estados/`])
  const { data: dataCidades } = useFetch([form.values.estado_id ? `/admin/estados/${form.values.estado_id}/cidades` : null])
  const optionsEstados = data?.map(estado => ({ value: estado.id, label: estado.nome })) || []
  const optionsCidades = dataCidades?.map(cidade => ({ value: cidade.id.toString(), label: cidade.nome })) || []

  return (
    <>
      <form onSubmit={form.onSubmit(handleSubmit)} style={{ position: 'relative' }}>
        <Grid align="center">
          <Grid.Col span={4}>
            <Fields.StateField
              inputProps={{
                ...form.getInputProps('estado_id'),
                data: optionsEstados,
                disabled: isSubmitting,
                searchable: true,
              }}
            />
          </Grid.Col>
          <Grid.Col span={8}>
            {optionsCidades.length > 0 && <Fields.CityField
              inputProps={{
                ...form.getInputProps('cidade_id'),
                data: optionsCidades,
                disabled: !form.values.estado_id || isSubmitting,
                searchable: true,
              }}
            />}
          </Grid.Col>
          <Grid.Col span={6}>
            <Fields.DateField
              inputProps={{ ...form.getInputProps('data_inicio'), label: 'Data Início', disabled: isSubmitting }}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Fields.DateField
              inputProps={{ ...form.getInputProps('data_fim'), label: 'Data Fim', disabled: isSubmitting }}
            />
          </Grid.Col>
        </Grid>
        <Group mt="xl">
          {agendaData && (
            <Button
              color="red"
              type="button"
              size="sm"
              onClick={() => setRemove(agendaData)}
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
            {agendaData ? "Editar" : "Salvar"}
          </Button>
        </Group>
      </form>
      <Modal centered opened={!!remove} onClose={() => setRemove(null)} title="Remover agenda">
        <Stack>
          <Text>Tem certeza que deseja remover a agenda de {remove?.cidade?.nome} / {remove?.estado_id}?</Text>
          <Box>
            <Button
              color="red"
              type="button"
              size="sm"
              onClick={handleDelete}>
              Remover
            </Button>
          </Box>
        </Stack>
      </Modal>
    </>
  )
}
