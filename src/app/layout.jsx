import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css';

import { Box, ColorSchemeScript, Group, Stack } from '@mantine/core'
import { Notifications } from '@mantine/notifications';

import Content from '@/components/navigation/Content'
import Footer from '@/components/navigation/Footer'
import Header from '@/components/navigation/Header'
import Navbar from '@/components/navigation/Navbar'

import Providers from './Providers'

export const metadata = {
  title: 'Agendle Admin',
  description: 'Painel',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <Providers>
          <Notifications position="top-right" autoClose={10000} zIndex={10000} top={95} />
          <Stack gap={0}>
            <Group gap={0} align="top">
              <Navbar />

              <Box style={{ left: 0, paddingTop: '95px', position: 'absolute', width: '100%' }}>
                <Header />
                <Content>
                  {children}
                </Content>
                <Footer />
              </Box>
            </Group>
          </Stack>
        </Providers>
      </body>
    </html >
  )
}