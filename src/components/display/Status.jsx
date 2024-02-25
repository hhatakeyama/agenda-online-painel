import { Badge } from '@mantine/core'
import React from 'react'

export default function Status({ status, labels = ['Ativo', 'Inativo'] }) {
  const active = status === 1
  return <Badge size="sm" color={active ? "green" : "red"}>{active ? labels[0] : labels[1]}</Badge>
}
