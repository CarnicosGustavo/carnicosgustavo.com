import type { OrderItem } from './useOrder'

export type CheckoutInfo = {
  businessName: string
  contactName: string
  phone: string
  deliveryAddress?: string
  notes?: string
}

export function buildWhatsAppMessage(params: {
  checkout: CheckoutInfo
  items: OrderItem[]
  locationLabel: string
}) {
  const { checkout, items, locationLabel } = params

  const lines: string[] = []
  lines.push('Solicitud de cotización / pedido (B2B)')
  lines.push(`CEDIS: ${locationLabel}`)
  lines.push('')
  lines.push(`Negocio: ${checkout.businessName}`)
  lines.push(`Contacto: ${checkout.contactName}`)
  lines.push(`Teléfono: ${checkout.phone}`)
  if (checkout.deliveryAddress?.trim()) lines.push(`Entrega: ${checkout.deliveryAddress.trim()}`)
  if (checkout.notes?.trim()) lines.push(`Notas: ${checkout.notes.trim()}`)
  lines.push('')
  lines.push('Productos:')
  for (const item of items) {
    lines.push(`- ${item.quantity} x ${item.name}`)
  }
  lines.push('')
  lines.push('Gracias.')

  return lines.join('\n')
}

export function buildWhatsAppUrl(params: { phoneE164: string; message: string }) {
  const phone = params.phoneE164.replace(/[^\d]/g, '')
  return `https://wa.me/${phone}?text=${encodeURIComponent(params.message)}`
}

