import { InputBase } from '@mantine/core'
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
