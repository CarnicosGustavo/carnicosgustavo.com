import { createClient } from '@supabase/supabase-js'

type OrderItem = {
  productId: string
  name: string
  quantity: number
}

type ApiRequest = AsyncIterable<Uint8Array> & {
  method?: string
  body?: unknown
  headers?: Record<string, string | string[] | undefined>
}

type ApiResponse = {
  statusCode: number
  setHeader: (name: string, value: string) => void
  end: (body?: string) => void
}

function json(res: ApiResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

async function readBody(req: ApiRequest): Promise<unknown> {
  if (req.body !== undefined) return req.body
  const chunks: Uint8Array[] = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf-8')
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function asItems(value: unknown): OrderItem[] {
  if (!Array.isArray(value)) return []
  return value
    .map((it) => {
      if (!it || typeof it !== 'object') return null
      const o = it as Record<string, unknown>
      const productId = asString(o.productId).trim()
      const name = asString(o.name).trim()
      const qtyRaw = o.quantity
      const quantity =
        typeof qtyRaw === 'number' ? qtyRaw : typeof qtyRaw === 'string' ? Number(qtyRaw) : NaN
      if (!productId || !name) return null
      if (!Number.isFinite(quantity) || quantity <= 0) return null
      return { productId, name, quantity: Math.floor(quantity) }
    })
    .filter((x): x is OrderItem => Boolean(x))
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method !== 'POST') {
    json(res, 405, { ok: false, error: 'Method not allowed' })
    return
  }

  const supabaseUrl = process.env.SUPABASE_URL?.trim()
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  const table = (process.env.SUPABASE_ORDERS_TABLE?.trim() || 'web_orders').trim()

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    json(res, 500, { ok: false, error: 'Supabase not configured' })
    return
  }

  const body = (await readBody(req)) as Record<string, unknown>

  const businessName = asString(body.businessName).trim()
  const contactName = asString(body.contactName).trim()
  const phone = asString(body.phone).trim()
  const deliveryAddress = asString(body.deliveryAddress).trim()
  const notes = asString(body.notes).trim()
  const locationLabel = asString(body.locationLabel).trim()
  const items = asItems(body.items)
  const whatsappMessage = asString(body.whatsappMessage)

  if (!businessName || !contactName || !phone || items.length === 0) {
    json(res, 400, { ok: false, error: 'Missing required fields' })
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  })

  const payload = {
    source: 'website',
    business_name: businessName,
    contact_name: contactName,
    phone,
    delivery_address: deliveryAddress || null,
    notes: notes || null,
    location_label: locationLabel || null,
    items,
    items_count: items.reduce((acc, it) => acc + it.quantity, 0),
    user_agent: asString(req.headers?.['user-agent']) || null,
    whatsapp_message: whatsappMessage || null,
  }

  const { data, error } = await supabase.from(table).insert(payload).select('id').single()

  if (error) {
    json(res, 500, { ok: false, error: error.message })
    return
  }

  // Nota: La sincronización de web_orders → orders es manejada por un trigger
  // en Supabase en el dashboard. El web API solo inserta en web_orders.

  json(res, 200, { ok: true, id: data?.id })
}
