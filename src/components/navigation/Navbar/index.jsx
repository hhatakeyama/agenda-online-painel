'use client'

import { IconBuilding, IconBuildingStore, IconCalendar, IconCategory, IconChisel, IconLogout, IconTools, IconUser, IconUsers, IconUserSquare } from '@tabler/icons-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useAuth } from '@/providers/AuthProvider'

import classes from './Navbar.module.css'

export default function Navbar() {
  // Hooks
  const { isAuthenticated, logout, permissionsData, userData } = useAuth()
  const pathname = usePathname()

  // Constants
  const menu = [
    { link: '/agendamentos/calendario', label: 'Agendamentos', icon: IconCalendar, visible: permissionsData?.ge },
    { link: '/accounts/perfil', label: 'Perfil', icon: IconUser, visible: permissionsData?.ge },
    { link: '/agendamentos', label: 'Agendamentos', icon: IconCalendar, visible: permissionsData?.sa },
    { link: '/empresas', label: 'Empresas', icon: IconBuilding, visible: permissionsData?.sa },
    { link: '/categorias', label: 'Categorias', icon: IconCategory, visible: permissionsData?.sag },
    { link: '/servicos', label: 'Serviços', icon: IconChisel, visible: permissionsData?.sag },
    { link: '/funcionarios', label: 'Funcionários', icon: IconTools, visible: permissionsData?.sag },
    { link: '/unidades', label: 'Unidades', icon: IconBuildingStore, visible: permissionsData?.sag },
    { link: '/clientes', label: 'Clientes', icon: IconUsers, visible: permissionsData?.sa },
    { link: '/usuarios', label: 'Usuários', icon: IconUserSquare, visible: permissionsData?.sag },
    // { link: '/eventos', label: 'Eventos', icon: IconTimelineEventExclamation, visible: permissionsData?.sa },
    // { link: '/relatorios', label: 'Relatórios', icon: IconGraph, visible: permissionsData?.sa },
  ].filter(item => item.visible)
  const menuItens = menu.map((item) => (
    <Link
      className={classes.link}
      data-active={pathname.indexOf(item.link) !== -1 || undefined}
      href={item.link}
      key={item.label}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </Link>
  ))

  if (!isAuthenticated && !userData) return null

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Link href="/" className={classes.header} justify="space-between" style={{ color: '#FFFFFF', textDecoration: 'none' }}>
          Skedyou
        </Link>
        {isAuthenticated && menuItens}
      </div>
      {isAuthenticated && (
        <div className={classes.footer}>
          <a href="#" className={classes.link} onClick={(event) => {
            event.preventDefault()
            logout?.()
          }}>
            <IconLogout className={classes.linkIcon} stroke={1.5} />
            <span>Logout</span>
          </a>
        </div>
      )}
    </nav>
  )
}