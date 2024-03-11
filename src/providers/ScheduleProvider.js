'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import { getStorage, minutesToHours, parseMinutes, setStorage } from '@/utils'

const ScheduleContext = createContext(null)

export const useSchedule = () => useContext(ScheduleContext)

function useProvideSchedule() {
  // Constants
  const today = new Date()
  const storageSchedule = getStorage('schedule')
  const storageServices = getStorage('services')
  const defaultSchedule = {
    date: today,
    start_time: '00:00',
    items: [],
  }

  // States
  const [openCartMenu, setOpenCartMenu] = useState(false)
  const [schedule, setSchedule] = useState(storageSchedule || defaultSchedule)
  const [selectedServices, setSelectedServices] = useState(storageServices || [])
  const [smallestDuration, setSmallestDuration] = useState('00:30')

  // Actions
  const handleAddRemoveService = service => {
    const serviceAdded = selectedServices?.find?.(item => item.id === service.id)
    if (serviceAdded) {
      const newServices = selectedServices?.filter?.(item => item.id !== service.id)
      setSelectedServices(newServices)
      setStorage('services', newServices)
    } else {
      // eslint-disable-next-line no-unused-vars
      const { employee_services, service_category, ...restService } = service
      const newServices = [...selectedServices, restService]
      setSelectedServices(newServices)
      setStorage('services', newServices)
    }
  }

  const handleChangeSchedule = (newValue) => {
    setSchedule(prevState => ({ ...prevState, ...newValue }))
    if (newValue.start_time && newValue.start_time !== '') {
      let startTimeMinutes = parseMinutes(newValue.start_time)
      const newItems = schedule.items.map(item => {
        const intervalMinutes = parseMinutes(item.duration)
        const endTimeMinutes = startTimeMinutes + intervalMinutes
        const endTime = minutesToHours(endTimeMinutes)
        const newScheduleItem = {
          ...item,
          start_time: minutesToHours(startTimeMinutes),
          end_time: endTime
        }
        startTimeMinutes = endTimeMinutes
        return newScheduleItem
      })
      setSchedule(prevState => ({ ...prevState, items: newItems }))
    } else {
      const newItems = schedule.items.map(item => ({
        ...item, start_time: '', end_time: '', employee_id: null
      }))
      setSchedule(prevState => ({ ...prevState, items: newItems }))
    }
  }

  const handleChangeScheduleItem = (itemIndex, newValue) => {
    schedule.items[itemIndex] = { ...schedule.items[itemIndex], ...newValue }
    setSchedule(prevState => ({ ...prevState, items: [...schedule.items] }))
  }

  const handleClearSchedule = () => {
    setSchedule(defaultSchedule)
    setSelectedServices([])
    setStorage('services', [])
  }

  // Effects
  useEffect(() => {
    const newItems = selectedServices.map(service => {
      const serviceDurationMinutes = parseMinutes(service.duration)
      if (serviceDurationMinutes < smallestDuration) setSmallestDuration(service.duration)
      return {
        service_id: service.id,
        employee_id: null,
        start_time: '',
        end_time: '',
        price: service.price,
        duration: service.duration,
      }
    })
    setSchedule(prevState => ({ ...prevState, start_time: '', items: newItems }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServices])

  return {
    openCartMenu,
    schedule,
    selectedServices,
    smallestDuration,
    setOpenCartMenu,
    setSelectedServices,
    handleAddRemoveService,
    handleChangeSchedule,
    handleChangeScheduleItem,
    handleClearSchedule,
  }
}

export default function ScheduleProvider({ children }) {
  const auth = useProvideSchedule()
  return <ScheduleContext.Provider value={auth}>{children}</ScheduleContext.Provider>
}
