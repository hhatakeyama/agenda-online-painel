import { MultiSelect, Select, TextInput } from '@mantine/core'

export const NameField = ({ inputProps }) => (
  <TextInput {...inputProps} label="Nome" placeholder="Nome" type="text" />
)

export const EmailField = ({ inputProps }) => (
  <TextInput {...inputProps} label="E-mail" placeholder="E-mail" type="email" />
)

export const PasswordField = ({ inputProps }) => (
  <TextInput {...inputProps} label="Senha" placeholder="Senha" type="password" />
)

export const ConfirmPasswordField = ({ inputProps }) => (
  <TextInput
    {...inputProps}
    label="Confirmar Senha"
    placeholder="Confirmar Senha"
    type="password"
  />
)

export const OccupationField = ({ inputProps }) => (
  <TextInput {...inputProps} label="Cargo" placeholder="Cargo" type="text" />
)

export const OrganizationField = ({ inputProps }) => (
  <Select
    {...inputProps}
    label="Empresa"
    placeholder="Empresa"
  />
)

export const ServicesField = ({ inputProps }) => (
  <MultiSelect
    {...inputProps}
    label="Serviços"
    placeholder="Serviços"
  />
)
