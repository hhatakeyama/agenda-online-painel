import '@mantine/dates/styles.css';

import { Box, Button, Center, Divider, Grid, Group, Modal, Paper, Stack, Stepper, Text, useMantineTheme } from '@mantine/core'
import { DatePicker } from '@mantine/dates'
import { useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconCheck } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { useFetch } from '@/hooks'
import { useAuth } from '@/providers/AuthProvider'
import { useSchedule } from '@/providers/ScheduleProvider'
import { api, dateToHuman, generateUnavailableHourList, minutesToHours, parseMinutes } from '@/utils'
import { currencyValue } from '@/utils/converter'

import ClientSelector from './ClientSelector';
import EmployeesSelector from './EmployeesSelector'
import HourList from './HourList'
import ScheduleItem from './ScheduleItem'
import ServicesSelector from './ServicesSelector';

export default function Basic({ company }) {
  // Hooks
  const theme = useMantineTheme()
  const router = useRouter()
  const isXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs}px)`)
  const { isAuthenticated } = useAuth()
  const { schedule, selectedServices, smallestDuration, handleChangeSchedule, handleChangeScheduleItem, handleClearSchedule } = useSchedule()

  // Constants
  const today = new Date()
  const todayDayOfWeek = company?.days_of_weeks?.find?.(item => Number(item.day_of_week) === schedule.date?.getDay?.())
  const canSubmit = schedule.date && schedule.start_time && schedule.items.length > 0
  let total = 0
  let totalDuration = 0
  selectedServices.map(item => {
    total += Number(item.price)
    totalDuration += Number(parseMinutes(item.duration))
  })

  // States
  const [step, setStep] = useState(0)
  const [openSelectEmployees, setOpenSelectEmployees] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dayOfWeek, setDayOfWeek] = useState(todayDayOfWeek)

  // Fetch
  const { data, isValidating } = useFetch([
    company?.id && selectedServices && schedule.date ? `/admin/schedules/unavailables` : null,
    {
      company: company?.id,
      date: schedule.date ? new Date(schedule.date).toISOString() : today,
      employees: selectedServices.flatMap(selectedService => selectedService.employees.flatMap(employee => employee.id))
    }
  ])
  const unavailables = data?.data || []
  const unavailableHours = generateUnavailableHourList(selectedServices, smallestDuration, unavailables) || [] // Mount unavailable hour list for each selected service

  // Actions
  const handleSubmit = async () => {
    setIsSubmitting(true)
    const newItems = schedule.items.map(item => {
      // if no employee selected, select random available employee
      if (!item.employee_id) {
        const employees = selectedServices.find(service => service.id === item.service_id)?.employees || []
        const serviceUnavailables = unavailables.filter(scheduleItem => scheduleItem.service_id === item.service_id)
        const availableEmployees = employees.filter(employee => {
          return !serviceUnavailables.find(scheduleItem => {
            return scheduleItem.employee_id === employee.id && parseMinutes(scheduleItem.start_time) === parseMinutes(item.start_time)
          })
        })
        const random = Math.floor(Math.random() * availableEmployees.length)
        return { ...item, employee_id: availableEmployees[random].id }
      }
      return item
    })
    return await api
      .post(`/api/admin/schedules`, {
        company_id: company?.id,
        client_id: schedule.client_id,
        date: schedule.date.toISOString(),
        items: newItems
      })
      .then(() => {
        handleClearSchedule()
        setStep(4)
      })
      .catch(error =>
        notifications.show({
          title: 'Erro',
          message: error?.response?.data?.message ||
            'Erro ao finalizar agendamento. Entre em contato com o administrador do site ou tente novamente mais tarde.',
          color: 'red'
        })
      )
      .finally(() => setIsSubmitting(false))
    setIsSubmitting(false)
  }

  const handleChangeDate = newDate => {
    handleChangeSchedule({ date: newDate, start_time: null, end_time: null })
    const selectedDayOfWeek = company?.days_of_weeks?.find?.(item => Number(item.day_of_week) === newDate.getDay())
    setDayOfWeek(selectedDayOfWeek)
  }

  const handleSelectEmployee = async (itemIndex, employee) => {
    setOpenSelectEmployees(null)
    handleChangeScheduleItem(itemIndex, { employee_id: employee?.id || null })
  }

  return (
    <>
      <Stepper color="orange" active={step} onStepClick={setStep}>
        <Stepper.Step label="Serviços" description="Serviços" disabled={step === 4}>
          {company && <ServicesSelector company={company} />}
        </Stepper.Step>
        <Stepper.Step label="Agendamento" description="Serviços" disabled={selectedServices.length === 0 || step === 4}>
          <Stack pos="relative">
            <Grid>
              <Grid.Col span={{ base: 12, xs: 6, sm: 5 }}>
                <Stack>
                  <Text fw={700}>Selecione uma data</Text>
                  <Paper shadow="sm">
                    <Center>
                      <DatePicker
                        value={schedule.date}
                        maxLevel="month"
                        minDate={today}
                        onChange={newDate => handleChangeDate(newDate)}
                      />
                    </Center>
                  </Paper>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, xs: 6, sm: 7 }}>
                {schedule.date && (
                  <HourList
                    dayOfWeek={dayOfWeek}
                    isValidating={isValidating}
                    totalDuration={totalDuration}
                    unavailableHours={unavailableHours}
                  />
                )}
              </Grid.Col>
            </Grid>

            <Grid justify="center">
              {schedule.items?.map((item, index) => (
                <ScheduleItem
                  key={`scheduleItem-${item.service_id}`}
                  editValues={item}
                  showChangeButton={schedule.start_time}
                  onChangeEmployee={() => setOpenSelectEmployees({ index, item })}
                />
              ))}
            </Grid>

            <Group justify="space-between">
              <Box>
                <Text size="xl"><strong>Total</strong>: {currencyValue(total)}</Text>
                <Text size="xl"><strong>Duração</strong>: {minutesToHours(totalDuration)}{totalDuration > 59 ? 'h' : 'min'}</Text>
              </Box>
              <Button
                color="green"
                type="button"
                size={isXs ? 'sm' : 'md'}
                fullWidth={!!isXs}
                disabled={!canSubmit}
                onClick={() => !isAuthenticated ? setStep(1) : setStep(2)}>
                Continuar
              </Button>
            </Group>
          </Stack>
        </Stepper.Step>
        <Stepper.Step label="Cliente" description="Login/Cadastro" icon={schedule?.client_id ? <IconCheck /> : null} disabled={!canSubmit || step === 4}>
          {selectedServices && schedule.date && step === 2 && <ClientSelector />}
        </Stepper.Step>
        <Stepper.Step label="Resumo" description="Confirmação" disabled={!canSubmit || !schedule?.client_id || step === 4}>
          <Stack>
            <Box>
              <Text size="lg"><strong>Data</strong>: {dateToHuman(schedule.date, 'date')}</Text>
              {schedule.items?.[0] && (
                <Text size="lg"><strong>Hora</strong>: {schedule.items[0].start_time} - {schedule.items[schedule.items.length - 1].end_time} ({totalDuration}min)</Text>
              )}
              <Text>
                <strong>Local</strong>: {company?.name}<br />{company?.address}, {company?.district}, {company?.city?.name}/{company?.state}
              </Text>
            </Box>

            <Text size="lg" fw={700}>Serviços</Text>
            <Grid justify="center">
              {schedule.items?.map((item, index) => (
                <ScheduleItem
                  key={`scheduleItem-${item.service_id}`}
                  editValues={item}
                  showChangeButton={false}
                  onChangeEmployee={() => setOpenSelectEmployees(index)}
                />
              ))}
            </Grid>

            <Group justify="center">
              <Button size="lg" onClick={() => setStep(1)}>Reagendar</Button>
              <Button
                size="lg"
                color="green"
                loading={isSubmitting}
                onClick={handleSubmit}>
                Confirmar agendamento
              </Button>
            </Group>
          </Stack>
        </Stepper.Step>
        <Stepper.Completed disabled={!schedule?.client_id}>
          <Stack>
            <Center>
              <Text c="green" size="xl" fw={700}>Agendamento realizado com sucesso!</Text>
            </Center>
            <Box>
              <Text>Logo enviaremos um e-mail com a confirmação de agendamento para o e-mail cadastrado.</Text>
              <Text>Antes do dia do serviço estaremos enviando um SMS para confirmar seu agendamento.</Text>
            </Box>

            <Divider />

            {true && (
              <Stack>
                <Text size="xl" fw={700}>Instruções</Text>
                <Box>
                  <Text>Um dia antes do atendimento, fique pelo menos 10 horas em jejum para poder realizar o procedimento.</Text>
                  <Text>Caso contrário teremos que reagendar um novo serviço.</Text>
                </Box>
              </Stack>
            )}

            <Group justify="center" my="md">
              <Button onClick={() => router.push('/minha-conta/agendamentos')}>Ver meus agendamentos</Button>
            </Group>
          </Stack>
        </Stepper.Completed>
      </Stepper>

      <Modal opened={openSelectEmployees !== null} onClose={() => setOpenSelectEmployees(null)} title="Selecionar Colaborador" centered size="xl">
        <EmployeesSelector
          scheduleItem={openSelectEmployees}
          unavailables={unavailables}
          onChange={handleSelectEmployee}
        />
      </Modal>
    </>
  )
}
