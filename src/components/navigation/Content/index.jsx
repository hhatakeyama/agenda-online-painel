'use client'

import { Box } from '@mantine/core'
import React from 'react'

import { useAuth } from '@/providers/AuthProvider'

export default function Content({ children }) {
  // Hooks
  const { isAuthenticated } = useAuth()

  return (
    <Box style={{
      marginBottom: '60px',
      left: isAuthenticated === true ? '300px' : '0',
      width: isAuthenticated === true ? 'calc(100% - 300px)' : '100%',
      position: 'absolute'
    }}>
      {children}
    </Box>
  )
}
