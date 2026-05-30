import { useEffect, useMemo, useState } from 'react'

import { BUSINESS, CONTACT } from '../../config'
import type { OrderItem } from './useOrder'
import { buildWhatsAppMessage, buildWhatsAppUrl } from './whatsapp'

function canSendWhatsApp(phoneE164: string) {
  const digits = phoneE164.replace(/[^\d]/g, '')
  return digits.length >= 11
}

type SaveState = 'idle' | 'saving' | 'success' | 'error'

export function OrderPanel(props: {
  open: boolean
  items: OrderItem[]
  onClose: () => void
  onIncrement: (productId: string) => void
  onDecrement: (productId: string) => void
  onSetUnit: (productId: string, unit: 'piezas' | 'kg') => void
  onSetQuantity: (productId: string, qty: number) => void
  onRemove: (productId: string) => void
  onClear: () => void
}) {
  const { open, items, onClose, onIncrement, onDecrement, onSetUnit, onSetQuantity, onRemove, onClear } = props
  const [businessName, setBusinessName] = useState('')
  const [contactName, setContactName] = useState('')
  const [phone, setPhone] = useState('')

  // Pre-rellena el teléfono si el link trae ?tel= o ?phone=
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const urlPhone = (params.get('tel') ?? params.get('phone') ?? '').replace(/[^\d]/g, '')
      if (urlPhone.length >= 7) setPhone(urlPhone)
    } catch {
      /* noop */
    }
  }, [])
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  const totalUnits = useMemo(() => items.reduce((acc, x) => acc + x.quantity, 0), [items])
  const hasWhatsApp = canSendWhatsApp(CONTACT.whatsappPhoneE164)
  const isSavingOrLoading = saveState === 'saving'

  if (!open) return null

  const missing = []
  if (!businessName.trim()) missing.push('Negocio')
  if (!contactName.trim()) missing.push('Contacto')
  if (!phone.trim()) missing.push('Teléfono')

  const formValid = missing.length === 0

  async function saveOrder() {
    if (!formValid || items.length === 0) return

    setSaveState('saving')
    setSaveError(null)
    setOrderId(null)

    try {
      const resp = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          contactName,
          phone,
          deliveryAddress,
          notes,
          locationLabel: BUSINESS.locationLabel,
          items,
        }),
      })

      if (!resp.ok) {
        let detail = ''
        try {
          const data = (await resp.json()) as { error?: unknown }
          detail = typeof data?.error === 'string' ? data.error : ''
        } catch {
          detail = ''
        }
        throw new Error(detail || `HTTP ${resp.status}`)
      }

      const data = (await resp.json()) as { ok?: boolean; id?: string }
      if (data.id) {
        setSaveState('success')
        setOrderId(data.id)
      } else {
        throw new Error('No se recibió ID del pedido')
      }
    } catch (e) {
      setSaveState('error')
      setSaveError(e instanceof Error ? e.message : 'No se pudo guardar el pedido')
    }
  }

  function shareWhatsApp() {
    const message = buildWhatsAppMessage({
      checkout: { businessName, contactName, phone, deliveryAddress, notes },
      items,
      locationLabel: BUSINESS.locationLabel,
    })

    const url = buildWhatsAppUrl({ phoneE164: CONTACT.whatsappPhoneE164, message })
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function resetForm() {
    setBusinessName('')
    setContactName('')
    setPhone('')
    setDeliveryAddress('')
    setNotes('')
    setSaveState('idle')
    setSaveError(null)
    setOrderId(null)
    onClear()
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      <div className="absolute inset-x-0 bottom-0 mx-auto max-h-[90svh] w-full max-w-2xl overflow-hidden rounded-t-2xl bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
          <div>
            <div className="text-sm font-extrabold text-cg-black">Tu pedido</div>
            <div className="text-xs text-black/60">
              {items.length} productos · {totalUnits} unidades
            </div>
          </div>
          <button
            type="button"
            className="rounded border border-black/15 px-3 py-2 text-sm font-extrabold text-cg-black hover:bg-cg-gray"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

        <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
          <div className="max-h-[70svh] overflow-auto p-4">
            {items.length === 0 ? (
              <div className="rounded bg-cg-gray p-4 text-sm text-black/70">
                Aún no agregas productos. Ve al catálogo y arma tu pedido.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-start justify-between gap-3 rounded border border-black/10 bg-white p-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-extrabold text-cg-black">{item.name}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded border border-black/15 text-lg font-extrabold text-cg-black hover:bg-cg-gray"
                          onClick={() => onDecrement(item.productId)}
                          aria-label="Disminuir"
                        >
                          −
                        </button>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={String(item.quantity)}
                          onChange={(e) => {
                            let raw = e.target.value.replace(/[^\d.]/g, '')
                            const d = raw.indexOf('.')
                            if (d !== -1) raw = raw.slice(0, d + 1) + raw.slice(d + 1).replace(/\./g, '')
                            const v = parseFloat(raw)
                            if (Number.isFinite(v) && v > 0) onSetQuantity(item.productId, v)
                          }}
                          onFocus={(e) => e.currentTarget.select()}
                          className="h-9 w-14 rounded border border-black/15 text-center text-sm font-extrabold text-cg-black outline-none focus:border-cg-red"
                        />
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded border border-black/15 text-lg font-extrabold text-cg-black hover:bg-cg-gray"
                          onClick={() => onIncrement(item.productId)}
                          aria-label="Aumentar"
                        >
                          +
                        </button>
                      </div>
                      {/* Selector de unidad */}
                      <div className="mt-2 inline-flex overflow-hidden rounded border border-black/15">
                        <button
                          type="button"
                          onClick={() => onSetUnit(item.productId, 'piezas')}
                          className={[
                            'px-3 py-1 text-xs font-extrabold',
                            item.unit === 'piezas' ? 'bg-cg-red text-white' : 'bg-white text-cg-black',
                          ].join(' ')}
                        >
                          Piezas
                        </button>
                        <button
                          type="button"
                          onClick={() => onSetUnit(item.productId, 'kg')}
                          className={[
                            'px-3 py-1 text-xs font-extrabold',
                            item.unit === 'kg' ? 'bg-cg-red text-white' : 'bg-white text-cg-black',
                          ].join(' ')}
                        >
                          Kg
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded border border-black/15 px-2 py-1 text-xs font-extrabold text-black/70 hover:bg-cg-gray"
                      onClick={() => onRemove(item.productId)}
                    >
                      Quitar
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="rounded border border-black/15 px-3 py-2 text-sm font-extrabold text-cg-black hover:bg-cg-gray"
                  onClick={onClear}
                >
                  Vaciar pedido
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-black/10 p-4 md:border-l md:border-t-0">
            <div className="text-sm font-extrabold text-cg-black">Datos para la cotización</div>
            <div className="mt-1 text-xs text-black/60">
              Esto arma el mensaje que se enviará por WhatsApp.
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-black/70">Nombre del negocio</label>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="mt-1 w-full rounded border border-black/15 px-3 py-2 text-sm outline-none focus:border-cg-red"
                  placeholder="Ej. Taquería Los Amigos"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-black/70">Nombre de contacto</label>
                <input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="mt-1 w-full rounded border border-black/15 px-3 py-2 text-sm outline-none focus:border-cg-red"
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-black/70">Teléfono</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded border border-black/15 px-3 py-2 text-sm outline-none focus:border-cg-red"
                  placeholder="Ej. 55 1234 5678"
                  inputMode="tel"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-black/70">
                  Dirección de entrega (opcional)
                </label>
                <input
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="mt-1 w-full rounded border border-black/15 px-3 py-2 text-sm outline-none focus:border-cg-red"
                  placeholder="Colonia, calle y número"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-black/70">Notas (opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 min-h-20 w-full resize-none rounded border border-black/15 px-3 py-2 text-sm outline-none focus:border-cg-red"
                  placeholder="Preferencias de corte, empaque, horarios, etc."
                />
              </div>

              {saveState === 'success' && orderId && (
                <div className="rounded border border-green-500/20 bg-green-500/5 p-3 text-xs text-green-700">
                  ✓ Pedido guardado exitosamente (ID: {orderId})
                </div>
              )}

              {saveState === 'error' && saveError && (
                <div className="rounded border border-cg-red/20 bg-cg-red/5 p-3 text-xs text-black/70">
                  ✗ Error: {saveError}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={!formValid || items.length === 0 || isSavingOrLoading}
                  onClick={saveOrder}
                  className="inline-flex items-center justify-center rounded bg-cg-red px-4 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saveState === 'saving' ? 'Guardando…' : 'Guardar pedido'}
                </button>

                {saveState === 'success' && hasWhatsApp && (
                  <button
                    type="button"
                    onClick={shareWhatsApp}
                    className="inline-flex items-center justify-center rounded border-2 border-cg-red px-4 py-3 text-sm font-extrabold text-cg-red hover:bg-cg-red/5"
                  >
                    Compartir por WhatsApp (opcional)
                  </button>
                )}

                {saveState === 'success' && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center justify-center rounded border border-black/15 px-4 py-3 text-sm font-extrabold text-cg-black hover:bg-cg-gray"
                  >
                    Nuevo pedido
                  </button>
                )}
              </div>

              {!formValid && (
                <div className="text-xs text-black/60">
                  Completa: {missing.join(', ')}.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
