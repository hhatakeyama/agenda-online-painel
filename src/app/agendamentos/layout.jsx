import ScheduleProvider from '@/providers/ScheduleProvider'

export default function RootLayout({ children }) {
  return (
    <ScheduleProvider>
      {children}
    </ScheduleProvider>
  )
}