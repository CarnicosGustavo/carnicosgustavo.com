import { useMemo, useState } from 'react'

import { BUSINESS, CONTACT } from '../../config'
import type { OrderItem } from './useOrder'
import { buildWhatsAppMessage, buildWhatsAppUrl } from './whatsapp'

function canSendWhatsApp(phoneE164: string) {
  const digits = phoneE164.replace(/[^\d]/g, '')
  return digits.length >= 11
}

export function OrderPanel(props: {
  open: boolean
  items: OrderItem[]
  onClose: () => void
  onIncrement: (productId: string) => void
  onDecrement: (productId: string) => void
  onRemove: (productId: string) => void
  onClear: () => void
}) {
  const { open, items, onClose, onIncrement, onDecrement, onRemove, onClear } = props
  const [businessName, setBusinessName] = useState('')
  const [contactName, setContactName] = useState('')
  const [phone, setPhone] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [notes, setNotes] = useState('')

  const totalUnits = useMemo(() => items.reduce((acc, x) => acc + x.quantity, 0), [items])
  const sendEnabled = items.length > 0 && canSendWhatsApp(CONTACT.whatsappPhoneE164)

  if (!open) return null

  function sendToWhatsApp() {
    const message = buildWhatsAppMessage({
      checkout: { businessName, contactName, phone, deliveryAddress, notes },
      items,
      locationLabel: BUSINESS.locationLabel,
    })
    const url = buildWhatsAppUrl({ phoneE164: CONTACT.whatsappPhoneE164, message })
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const missing = []
  if (!businessName.trim()) missing.push('Negocio')
  if (!contactName.trim()) missing.push('Contacto')
  if (!phone.trim()) missing.push('Teléfono')

  const formValid = missing.length === 0

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
                        <div className="min-w-10 text-center text-sm font-extrabold text-cg-black">
                          {item.quantity}
                        </div>
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded border border-black/15 text-lg font-extrabold text-cg-black hover:bg-cg-gray"
                          onClick={() => onIncrement(item.productId)}
                          aria-label="Aumentar"
                        >
                          +
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

              {!canSendWhatsApp(CONTACT.whatsappPhoneE164) && (
                <div className="rounded border border-cg-red/20 bg-cg-red/5 p-3 text-xs text-black/70">
                  Falta configurar el WhatsApp de ventas (variable{' '}
                  <span className="font-bold">VITE_WHATSAPP_PHONE</span>).
                </div>
              )}

              <button
                type="button"
                disabled={!sendEnabled || !formValid}
                onClick={sendToWhatsApp}
                className="inline-flex items-center justify-center rounded bg-cg-red px-4 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Enviar pedido por WhatsApp
              </button>

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
