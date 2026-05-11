const env = import.meta.env as unknown as Record<string, string | undefined>

const locationLabel = env.VITE_LOCATION_LABEL?.trim() || 'Naucalpan, Estado de México'

export const BUSINESS = {
  name: 'Cárnicos Gustavo',
  tagline: 'Centro de Distribución (CEDIS) de Cerdo',
  locationLabel,
}

export const CONTACT = {
  whatsappPhoneE164: env.VITE_WHATSAPP_PHONE?.trim() || '',
}

export const LINKS = {
  googleMapsSearchUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    BUSINESS.locationLabel,
  )}`,
}
