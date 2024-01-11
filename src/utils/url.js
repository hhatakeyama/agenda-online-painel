export const getUrlString = (url) => {
  const urlString = Array.isArray(url) ? url[0] : url
  return urlString
}

export const contactTypeUrl = (type, contact) => {
  if (type === 'phone') {
    const phone = contact.replace(/[^\d]/g, '')
    return `tel:${phone}`
  } else if (type === 'email') {
    return `mailto:${contact}`
  } else if (type === 'whatsapp') {
    const phone = contact.replace(/[^\d]/g, '')
    return `https://wa.me/55${phone}`
  }
  return contact
}
