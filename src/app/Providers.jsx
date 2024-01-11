'use client'

import 'dayjs/locale/pt-br'

import { MantineProvider } from '@mantine/core'
import { DatesProvider } from '@mantine/dates'
import { SWRConfig } from 'swr'

import AuthProvider from '@/providers/AuthProvider'
import { fetcher } from '@/utils'

export default function Providers({ children }) {
  return (
    <SWRConfig value={{ fetcher, revalidateOnFocus: false }}>
      <MantineProvider defaultColorScheme="dark">
        <DatesProvider settings={{ locale: 'pt-br', firstDayOfWeek: 0, weekendDays: [0], timezone: 'America/Sao_Paulo' }}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </DatesProvider>
      </MantineProvider>
    </SWRConfig>
  )
}