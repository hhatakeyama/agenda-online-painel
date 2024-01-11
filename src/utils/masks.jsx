import React from 'react'
import MaskedInput from 'react-text-mask'

// prettier-ignore
const masks = {
  phoneAreaCode: [/\d/, /\d/],
  phoneNumber: (rawValue) =>
    rawValue.replace(/[^\d]/g, '').length > 8
      ? [/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]
      : [/\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
  phoneNumberWithCode: (rawValue) =>
    rawValue.replace(/[^\d]/g, '').length > 10
      ? ['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]
      : ['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
  taxDocumentCPF: [/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/],
  taxDocumentCNPJ: [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/],
  taxDocumentCPFCNPJ: (rawValue) =>
    rawValue.replace(/[^\d]/g, '').length > 11
      ? [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/]
      : [/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/],
  postcode: (rawValue) =>
    rawValue.replace(/[^\d]/g, '').length > 7
      ? [/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/]
      : [/\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/],
  creditCardNumber: [/\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/],
  creditCardNumberAmex: [/\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, /\d/],
  creditCardNumberDiners: [/\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/],
  creditCardValidDate: [/\d/, /\d/, '/', /\d/, /\d/],
  currencyBRL: (rawValue) => {
    if (rawValue.length < 3) return [/\d/, /\d/]
    const newValue = [...rawValue.replace(/^0+/g, '').replace(/[^\d]/g, '')].map((_, i) =>
      i === 0 ? /[1-9]/ : /\d/
    )
    newValue.splice(-2, 0, ',')
    if (newValue.length > 6) newValue.splice(-6, 0, '.')
    if (newValue.length > 10) newValue.splice(-10, 0, '.')
    if (newValue.length > 14) newValue.splice(-14, 0, '.')
    if (newValue.length > 16) newValue.splice(-16, 1)
    return newValue
  }
}

const creditCardNumberMultiple = (rawValue) =>
  rawValue.replace(/[^\d]/g, '').length === 14
    ? masks.creditCardNumberDiners
    : rawValue.replace(/[^\d]/g, '').length === 15
      ? masks.creditCardNumberAmex
      : masks.creditCardNumber

const TextMaskInput = (props) => {
  const { mask, inputRef, ...restProps } = props
  return (
    <MaskedInput
      mask={mask}
      guide={false}
      ref={(ref) => inputRef?.(ref ? ref.inputElement : null)}
      {...restProps}
    />
  )
}

const withMask = (mask) =>
  React.forwardRef((props, ref) => <TextMaskInput mask={mask} inputRef={ref} {...props} />)

const MaskedPhoneAreaCode = withMask(masks.phoneAreaCode)
const MaskedPhoneNumber = withMask(masks.phoneNumber)
const MaskedPhoneNumberWithCode = withMask(masks.phoneNumberWithCode)
const MaskedTaxDocumentCPF = withMask(masks.taxDocumentCPF)
const MaskedTaxDocumentCNPJ = withMask(masks.taxDocumentCNPJ)
const MaskedTaxDocumentCPFCNPJ = withMask(masks.taxDocumentCPFCNPJ)
const MaskedPostcode = withMask(masks.postcode)
const MaskedCreditCardNumber = withMask(masks.creditCardNumber)
const MaskedCreditCardNumberAmex = withMask(masks.creditCardNumberAmex)
const MaskedCreditCardNumberDiners = withMask(masks.creditCardNumberDiners)
const MaskedCreditCardNumberMultiple = withMask(creditCardNumberMultiple)
const MaskedCreditCardValidDate = withMask(masks.creditCardValidDate)
const MaskedCurrencyBRL = withMask(masks.currencyBRL)

export {
  MaskedCreditCardNumber,
  MaskedCreditCardNumberAmex,
  MaskedCreditCardNumberDiners,
  MaskedCreditCardNumberMultiple,
  MaskedCreditCardValidDate,
  MaskedCurrencyBRL,
  MaskedPhoneAreaCode,
  MaskedPhoneNumber,
  MaskedPhoneNumberWithCode,
  MaskedPostcode,
  MaskedTaxDocumentCNPJ,
  MaskedTaxDocumentCPF,
  MaskedTaxDocumentCPFCNPJ
}
