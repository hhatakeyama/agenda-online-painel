'use client'

import { Button, Collapse, Group, Input, Paper, Stack, Table, Text, Title } from '@mantine/core'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import React, { useState } from 'react'

import { useSchedule } from '@/providers/ScheduleProvider'
import { currencyValue } from '@/utils/converter'

export default function ServicesSelector({ company }) {
  // Hooks
  const { selectedServices, handleAddRemoveService } = useSchedule()

  // Constants
  const companyServices = company.company_services?.map(companyService => companyService.service) || []
  const categories = []
  if (companyServices.length > 0 && categories.length === 0) {
    companyServices.map(companyService => {
      const serviceCategory = companyService.service_category
      const category = categories.find(category => category.id === serviceCategory.id)
      if (!category) {
        serviceCategory.services = [{ ...companyService }]
        categories.push({ ...serviceCategory })
      } else {
        category.services.push({ ...companyService })
      }
    })
  }

  // States
  const [open, setOpen] = useState([]);
  const [search, setSearch] = useState('');

  // Actions
  const handleOpenService = category => {
    if (open.find(item => item === category)) {
      setOpen(open.filter(item => item !== category))
    } else {
      setOpen(prevState => [...prevState, category])
    }
  }

  return (
    <>
      <Title order={2}>Serviços</Title>
      <Group>
        <Input name="search" placeholder="Buscar por nome" value={search} onChange={e => setSearch(e.target.value)} />
      </Group>

      {categories.map(category => {
        const hasServices = category.services?.filter(itemService => itemService.name.indexOf(search) !== -1).length
        return hasServices ? (
          <Paper shadow="xs" p="sm" key={category.id}>
            <Stack>
              <Group justify="space-between" onClick={() => handleOpenService(category.id)} style={{ cursor: 'pointer' }}>
                <Title order={3}>{category.name}</Title>
                {!!open.find(item => item === category.id) ? <IconChevronUp /> : <IconChevronDown />}
              </Group>
              <Collapse in={!open.find(item => item === category.id)}>
                <Table highlightOnHover>
                  <Table.Tbody>
                    {category.services
                      ?.filter?.(itemService => itemService.name.indexOf(search) !== -1)
                      ?.map(service => {
                        const serviceSelected = selectedServices.find(item => item.id === service.id)
                        return (
                          <Table.Tr key={service.id}>
                            <Table.Td w="60%">
                              <Text>{service.name} - {service.duration}</Text>
                            </Table.Td>
                            <Table.Td align="right">
                              <Group align="center" justify="flex-end" gap={10}>
                                <Text>{currencyValue(service.price)}</Text>
                                <Button color={serviceSelected ? 'red' : 'blue'} onClick={() => handleAddRemoveService(service)}>
                                  {serviceSelected ? 'Remover' : 'Agendar'}
                                </Button>
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        )
                      })}
                  </Table.Tbody>
                </Table>
              </Collapse>
            </Stack>
          </Paper>
        ) : null
      })}
    </>
  )
}
