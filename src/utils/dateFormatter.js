export const daysOfWeekString = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"]

const isToday = (date) => {
  const today = new Date()
  return date.getYear() === today.getYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDay() === today.getDay()
}

function hoursToMinutes(hoursMinutes) {
  return hoursMinutes.hours * 60 + hoursMinutes.minutes
}

export const dateToDatabase = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth() < 10 ? `0${date.getMonth() + 1}` : date.getMonth()
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
  return `${year}-${month}-${day}`
}

export const dateToHuman = (date, type = 'datetime') => {
  const dateObject = new Date(date)
  let format = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZone: 'UTC',
  }
  if (type === 'date') {
    format = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }
  }
  return new Intl.DateTimeFormat('pt-BR', format).format(dateObject)
}

export function minutesToHours(minutes) {
  const hours = Math.floor(minutes / 60)
  const restMinutes = minutes % 60
  return `${hours >= 10 ? hours : `0${hours}`}:${restMinutes >= 10 ? restMinutes : `0${restMinutes}`}`
}

export function parseMinutes(time) {
  const timeArray = time.split(":")
  const timeHour = Number(timeArray[0])
  const timeMinute = Number(timeArray[1])

  return hoursToMinutes({ hours: timeHour, minutes: timeMinute })
}

export function generateUnavailableHourInterval(startTime, endTime, interval) {
  const hourList = []
  if (startTime && endTime && interval) {
    const startTimeMinutes = parseMinutes(startTime)
    const endTimeMinutes = parseMinutes(endTime)
    const intervalMinutes = parseMinutes(interval)
    for (var index = startTimeMinutes; index < endTimeMinutes; index += intervalMinutes) {
      hourList.push(index)
    }
  }

  return hourList
}

export function generateUnavailableEmployeesHourList(employees, smallestDuration, unavailables) {
  const employeesUnavailable = employees.flatMap(employee => {
    const serviceEmployeesUnavailables =
      unavailables.filter(unavailable => unavailable.employee_id === employee.id)
    return serviceEmployeesUnavailables.flatMap(unavailable => {
      const unavailableHourInterval = generateUnavailableHourInterval(unavailable.start_time, unavailable.end_time, smallestDuration)
      return unavailableHourInterval.map(hour => ({ employee_id: unavailable.employee_id, hour }))
    })
  })
  return employeesUnavailable
}

export function generateUnavailableHourList(selectedServices, smallestDuration, unavailables) {
  if (unavailables.length === 0) return []
  
  const unavailableHourList = []
  selectedServices.map(selectedService => {
    const employeesIds = selectedService.employees.flatMap(employee => employee.id)

    const serviceEmployeesUnavailableHoursInterval =
      generateUnavailableEmployeesHourList(selectedService.employees, smallestDuration, unavailables).flatMap(item => item.hour)
    const unavailableHours = []
    serviceEmployeesUnavailableHoursInterval.map(unavailableHour => {
      let countHour = 0
      serviceEmployeesUnavailableHoursInterval.forEach(unavailable => {
        if (unavailable === unavailableHour) countHour++
      })
      if (countHour === employeesIds.length && !unavailableHours.find(item => item === unavailableHour))
        unavailableHours.push(unavailableHour)
    })
    unavailableHours.map(hour => {
      if (!unavailableHourList.find(item => item === hour)) unavailableHourList.push(hour)
    })
  })
  return unavailableHourList
}

// Generate hour interval if hour not unavailable
export function generateHourInterval(date, startTime, endTime, intervalMinutes, unavailable) {
  const startTimeMinutes = parseMinutes(startTime)
  const endTimeMinutes = parseMinutes(endTime)

  // Check today min hour to display
  const today = new Date()
  const timeNow = hoursToMinutes({ hours: today.getHours(), minutes: today.getMinutes() }) + 60
  const minTime = isToday(date) ? timeNow : 0

  const hourList = []
  for (var index = startTimeMinutes; index < endTimeMinutes; index = index + intervalMinutes) {
    const addHour = minutesToHours(index)
    if (!unavailable.find(item => Number(item) === Number(index)) && index > minTime)
      hourList.push(addHour)
  }
  return hourList
}

// Mount hour list based on the dayOfWeek open hours
export function generateHourList(date, dayOfWeek, interval, unavailable = []) {
  const hourList = []
  const intervalMinutes = parseMinutes(interval) || 0
  if (dayOfWeek && intervalMinutes) {
    const startTime = dayOfWeek.start_time
    const endTime = dayOfWeek.end_time
    if (startTime && endTime) {
      hourList.push(...generateHourInterval(date, startTime, endTime, intervalMinutes, unavailable))
    }
    [2, 3, 4].map(index => {
      const startTimeIndex = dayOfWeek[`start_time_${index}`]
      const endTimeIndex = dayOfWeek[`end_time_${index}`]
      if (startTimeIndex && endTimeIndex) {
        hourList.push(...generateHourInterval(date, startTimeIndex, endTimeIndex, intervalMinutes, unavailable))
      }
    })
  }
  return hourList
}

// Verify in the dayOfWeek start and ent_time available hours, if hour is less than services total duration and unavailableHours not within hour and hour service duration
export function verifyAvailableHour(hourList, dayOfWeek, totalDuration, hour, unavailableHours) {
  const hourInMinutes = hour ? parseMinutes(hour) : 0
  const servicesDuration = hourInMinutes + totalDuration
  if (hourList.length > 0) {
    const endTime = dayOfWeek?.end_time ? parseMinutes(dayOfWeek.end_time) - totalDuration : 0
    const startTime2 = dayOfWeek?.start_time_2 ? parseMinutes(dayOfWeek.start_time_2) : 0
    const endTime2 = dayOfWeek?.end_time_2 ? parseMinutes(dayOfWeek.end_time_2) - totalDuration : 0
    const startTime3 = dayOfWeek?.start_time_3 ? parseMinutes(dayOfWeek.start_time_3) : 0
    const endTime3 = dayOfWeek?.end_time_3 ? parseMinutes(dayOfWeek.end_time_3) - totalDuration : 0
    const startTime4 = dayOfWeek?.start_time_4 ? parseMinutes(dayOfWeek.start_time_4) : 0
    const endTime4 = dayOfWeek?.end_time_4 ? parseMinutes(dayOfWeek.end_time_4) - totalDuration : 0

    if (unavailableHours.filter(item => hourInMinutes < item && servicesDuration > item).length)
      return false
    if (endTime4) {
      return (hourInMinutes < endTime) ||
        (
          !endTime2 || (
            endTime2 > 0 &&
            hourInMinutes >= startTime2 &&
            hourInMinutes < endTime2
          )
        ) ||
        (
          !endTime3 || (
            endTime3 > 0 &&
            hourInMinutes >= startTime3 &&
            hourInMinutes < endTime3
          )
        ) ||
        (
          !endTime4 || (
            endTime4 > 0 &&
            hourInMinutes >= startTime4 &&
            hourInMinutes < endTime4
          )
        )
    }
    if (endTime3) {
      return (hourInMinutes < endTime) ||
        (
          !endTime2 || (
            endTime2 > 0 &&
            hourInMinutes >= startTime2 &&
            hourInMinutes < endTime2
          )
        ) ||
        (
          !endTime3 || (
            endTime3 > 0 &&
            hourInMinutes >= startTime3 &&
            hourInMinutes < endTime3
          )
        )
    }
    if (endTime2) {
      return (hourInMinutes <= endTime) ||
        (
          !endTime2 || (
            endTime2 > 0 &&
            hourInMinutes >= startTime2 &&
            hourInMinutes <= endTime2
          )
        )
    }
    return hourInMinutes <= endTime
  }
  return false
}
