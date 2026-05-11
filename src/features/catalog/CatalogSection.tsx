import { useMemo, useState } from 'react'

import type { Product } from '../../data/products'
import type { OrderItem } from '../order/useOrder'

function getQuantity(items: OrderItem[], productId: string) {
  return items.find((x) => x.productId === productId)?.quantity ?? 0
}

export function CatalogSection(props: {
  products: Product[]
  items: OrderItem[]
  onAdd: (product: Product) => void
  onIncrement: (productId: string) => void
  onDecrement: (productId: string) => void
}) {
  const { products, items, onAdd, onIncrement, onDecrement } = props
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => p.name.toLowerCase().includes(q))
  }, [products, query])

  return (
    <section id="catalogo" className="bg-cg-gray py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-cg-black">
              Catálogo de Cerdo
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-black/70">
              Identifica los cortes que necesitas y arma tu pedido. Al final lo envías por WhatsApp para
              cotización mayorista.
            </p>
          </div>
          <div className="w-full md:w-80">
            <label className="text-xs font-semibold text-black/70">Buscar producto</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej. TOCINO, LOMO, CANAL…"
              className="mt-1 w-full rounded border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-cg-red"
            />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => {
            const quantity = getQuantity(items, product.id)

            return (
              <div
                key={product.id}
                className="flex flex-col overflow-hidden rounded bg-white shadow-soft ring-1 ring-black/5"
              >
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-44 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-gradient-to-br from-cg-black to-cg-red">
                    <div className="rounded bg-white/10 px-3 py-2 text-xs font-bold tracking-wide text-white">
                      PRODUCTO
                    </div>
                  </div>
                )}

                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="text-sm font-extrabold text-cg-black">{product.name}</div>
                  <div className="text-sm text-black/70">{product.description}</div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    {quantity <= 0 ? (
                      <button
                        type="button"
                        onClick={() => onAdd(product)}
                        className="inline-flex items-center justify-center rounded bg-cg-red px-3 py-2 text-sm font-extrabold text-white hover:brightness-110"
                      >
                        Añadir a pedido
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onDecrement(product.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded border border-black/15 text-lg font-extrabold text-cg-black hover:bg-cg-gray"
                          aria-label="Disminuir"
                        >
                          −
                        </button>
                        <div className="min-w-10 text-center text-sm font-extrabold text-cg-black">
                          {quantity}
                        </div>
                        <button
                          type="button"
                          onClick={() => onIncrement(product.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded border border-black/15 text-lg font-extrabold text-cg-black hover:bg-cg-gray"
                          aria-label="Aumentar"
                        >
                          +
                        </button>
                      </div>
                    )}

                    <div className="text-xs font-semibold text-black/50">Mayorista</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 text-xs text-black/60">
          Resultados: {filtered.length} / {products.length}
        </div>
      </div>
    </section>
  )
}

