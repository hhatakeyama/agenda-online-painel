import { Button, Checkbox, FileInput, InputBase, Select, TextInput } from '@mantine/core'
import { IconFileUpload } from '@tabler/icons-react'
import { IMaskInput } from 'react-imask'

const acceptTypes = ['image/gif', 'image/png', 'image/jpeg']

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

export const OldPasswordField = ({ inputProps }) => (
  <TextInput {...inputProps} label="Senha Antiga" placeholder="Senha Antiga" type="password" />
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

export const PhoneNumberField = ({ inputProps }) => (
  <InputBase
    {...inputProps}
    placeholder="Número com ddd"
    type="tel"
    component={IMaskInput}
    mask="(00) 000000000"
  />
)

export const WhatsappCheckboxField = ({ inputProps }) => (
  <Checkbox {...inputProps} label="Whatsapp?" />
)

export const PictureField = ({ inputProps }) => (
  <Button color="violet" leftIcon={<IconFileUpload />} component="label" fullWidth>
    Alterar foto
    <FileInput
      {...inputProps}
      multiple
      accept={acceptTypes.join(',')}
      style={{ display: 'none' }}
    />
  </Button>
)
