"use client"

import { Center, Loader } from "@mantine/core"
import { redirect, usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

import { useAuth } from "@/providers/AuthProvider"

const publicRoutes = ['/accounts/login']

export default function guardAccount(Component) {
  return function IsAuth(props) {
    // Hooks
    const { isAuthenticated, isValidating } = useAuth()
    const pathname = usePathname()
    const search = useSearchParams()

    // Constants
    const redirectCallback = search.get('redirectCallback')

    // Effects
    useEffect(() => {
      if (publicRoutes.indexOf(pathname) === -1 && isValidating === false && isAuthenticated === false)
        redirect(`/accounts/login?redirectCallback=${pathname}`)
    }, [isAuthenticated, isValidating, pathname])

    useEffect(() => {
      if (publicRoutes.indexOf(pathname) !== -1 && isAuthenticated === true) {
        if (redirectCallback) redirect(redirectCallback)
        redirect('/')
      }
    }, [isAuthenticated, pathname, redirectCallback, search])
  
    if (isAuthenticated === null) return <Center style={{ height: '400px' }}><Loader color="blue" /></Center>

    return <Component {...props} />
  }
}