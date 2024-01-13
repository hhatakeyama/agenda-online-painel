import { Select } from '@mantine/core'

export const OrganizationField = ({ inputProps }) => (
  <Select
    {...inputProps}
    label="Empresa"
    placeholder="Empresa"
  />
)

export const CategoryField = ({ inputProps }) => (
  <Select
    {...inputProps}
    label="Categoria"
    placeholder="Categoria"
  />
)
