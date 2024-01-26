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
  const { permissions } = permissionsData || {}
  const adminAccess = !!permissions?.find(perm => perm === 's' || perm === 'a') || false
  const gerenteAccess = !!permissions?.find(perm => perm === 'g') || false
  const funcionarioAccess = !!permissions?.find(perm => perm === 'f') || false

  const menu = [
    { link: `/agendamentos/${userData?.id}`, label: 'Agendamentos', icon: IconUser, visible: funcionarioAccess },
    { link: `/usuarios/${userData?.id}`, label: 'Perfil', icon: IconUser, visible: funcionarioAccess },
    { link: `/agendamentos`, label: 'Agendamentos', icon: IconCalendar, visible: adminAccess },
    { link: '/empresas', label: 'Empresas', icon: IconBuilding, visible: adminAccess },
    { link: '/categorias', label: 'Categorias', icon: IconCategory, visible: adminAccess || gerenteAccess },
    { link: '/servicos', label: 'Serviços', icon: IconChisel, visible: adminAccess || gerenteAccess },
    { link: '/funcionarios', label: 'Funcionários', icon: IconTools, visible: adminAccess || gerenteAccess },
    { link: '/unidades', label: 'Unidades', icon: IconBuildingStore, visible: adminAccess || gerenteAccess },
    { link: '/clientes', label: 'Clientes', icon: IconUsers, visible: adminAccess },
    { link: '/usuarios', label: 'Usuários', icon: IconUserSquare, visible: adminAccess || gerenteAccess },
    // { link: '/eventos', label: 'Eventos', icon: IconTimelineEventExclamation, visible: adminAccess },
    // { link: '/relatorios', label: 'Relatórios', icon: IconGraph, visible: adminAccess },
  ].filter(item => item.visible)
  const menuItens = menu.map((item) => (
    <a
      className={classes.link}
      data-active={pathname.indexOf(item.link) !== -1 || undefined}
      href={item.link}
      key={item.label}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ))

  if (!isAuthenticated && !userData) return null

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Link href="/" className={classes.header} justify="space-between">
          Agendle
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