import { InputBase, Select } from "@mantine/core"
import { IMaskInput } from "react-imask"

export const PhoneNumberField = ({ inputProps }) => (
  <InputBase
    {...inputProps}
    label="Telefone"
    placeholder="Telefone"
    type="tel"
    component={IMaskInput}
    mask="(00) 000000000"
  />
)

export const WhatsappField = ({ inputProps }) => (
  <InputBase
    {...inputProps}
    label="Celular / Whatsapp"
    placeholder="Celular / Whatsapp"
    type="tel"
    component={IMaskInput}
    mask="(00) 000000000"
  />
)

export const CepField = ({ inputProps }) => (
  <InputBase
    {...inputProps}
    label="CEP"
    placeholder="CEP"
    type="tel"
    component={IMaskInput}
    mask="00000-000"
  />
)

export const OrganizationField = ({ inputProps }) => (
  <Select
    {...inputProps}
    label="Empresa"
    placeholder="Empresa"
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
