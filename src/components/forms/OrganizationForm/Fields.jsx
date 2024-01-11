import { InputBase, Select, TextInput } from '@mantine/core'
import { IMaskInput } from 'react-imask'

export const TaxDocumentField = ({ inputProps }) => (
  <InputBase
    {...inputProps}
    label="CNPJ"
    placeholder="CNPJ"
    type="tel"
    component={IMaskInput}
    mask="00.000.000/0000-00"
  />
)

export const StateField = ({ inputProps }) => (
  <Select
    {...inputProps}
    label="UF"
    placeholder="UF"
  />
)

export const CityField = ({ inputProps }) => (
  <Select
    {...inputProps}
    label="Cidade"
    placeholder="Cidade"
  />
)

export const DateField = ({ inputProps }) => (
  <TextInput
    type="date"
    {...inputProps}
  />
)
