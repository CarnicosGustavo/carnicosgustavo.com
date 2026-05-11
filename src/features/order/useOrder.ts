import { useEffect, useMemo, useState } from 'react'

import type { Product } from '../../data/products'

export type OrderItem = {
  productId: string
  name: string
  quantity: number
}

const STORAGE_KEY = 'cg_order_v1'

function safeParseOrder(raw: string | null): OrderItem[] {
  if (!raw) return []
  try {
    const value = JSON.parse(raw) as unknown
    if (!Array.isArray(value)) return []
    return value
      .map((item) => {
        if (!item || typeof item !== 'object') return null
        const maybe = item as { productId?: unknown; name?: unknown; quantity?: unknown }
        if (typeof maybe.productId !== 'string') return null
        if (typeof maybe.name !== 'string') return null
        const qty = typeof maybe.quantity === 'number' ? maybe.quantity : Number(maybe.quantity)
        if (!Number.isFinite(qty)) return null
        return { productId: maybe.productId, name: maybe.name, quantity: Math.max(1, Math.floor(qty)) }
      })
      .filter((x): x is OrderItem => Boolean(x))
  } catch {
    return []
  }
}

export function useOrder() {
  const [items, setItems] = useState<OrderItem[]>(
    safeParseOrder(typeof window === 'undefined' ? null : localStorage.getItem(STORAGE_KEY)),
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items],
  )

  function add(product: Product) {
    setItems((current) => {
      const existing = current.find((x) => x.productId === product.id)
      if (!existing) return [...current, { productId: product.id, name: product.name, quantity: 1 }]
      return current.map((x) =>
        x.productId === product.id ? { ...x, quantity: x.quantity + 1 } : x,
      )
    })
  }

  function decrement(productId: string) {
    setItems((current) => {
      const existing = current.find((x) => x.productId === productId)
      if (!existing) return current
      if (existing.quantity <= 1) return current.filter((x) => x.productId !== productId)
      return current.map((x) => (x.productId === productId ? { ...x, quantity: x.quantity - 1 } : x))
    })
  }

  function increment(productId: string) {
    setItems((current) =>
      current.map((x) => (x.productId === productId ? { ...x, quantity: x.quantity + 1 } : x)),
    )
  }

  function remove(productId: string) {
    setItems((current) => current.filter((x) => x.productId !== productId))
  }

  function clear() {
    setItems([])
  }

  return { items, totalItems, add, decrement, increment, remove, clear }
}

