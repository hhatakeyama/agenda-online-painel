'use client'

import { Anchor, Container, Group } from '@mantine/core'

import { useAuth } from '@/providers/AuthProvider'

import classes from './Footer.module.css'

const links = [
  { link: '#', label: 'Contato' },
  { link: '#', label: 'Política de Privacidade' },
]

export default function Footer() {
  // Hooks
  const { isAuthenticated } = useAuth()
  
  // Constants
  const items = links.map((link) => (
    <Anchor
      key={link.label}
      href={link.link}
      onClick={(event) => event.preventDefault()}
      size="sm"
    >
      {link.label}
    </Anchor>
  ))

  return (
    <div className={classes.footer} style={{ left: isAuthenticated === true ? '300px' : '0', width: isAuthenticated === true ? 'calc(100% - 300px)' : '100%' }}>
      <Container className={classes.inner} size="full">
        <Group className={classes.links}>{items}</Group>
      </Container>
    </div>
  )
}