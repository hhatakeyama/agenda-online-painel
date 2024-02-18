import { Badge } from '@mantine/core'
import React from 'react'

export default function Status({ status }) {
  const active = status === 1
  return <Badge size="sm" color={active ? "green" : "red"}>{active ? 'Ativo' : 'Inativo'}</Badge>
}
