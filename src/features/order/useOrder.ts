import { useCallback, useEffect, useMemo, useState } from 'react'

import type { Product } from '../../data/products'

export type Unit = 'piezas' | 'kg'

export type OrderItem = {
  productId: string
  name: string
  quantity: number
  unit: Unit
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
        const maybe = item as { productId?: unknown; name?: unknown; quantity?: unknown; unit?: unknown }
        if (typeof maybe.productId !== 'string') return null
        if (typeof maybe.name !== 'string') return null
        const qty = typeof maybe.quantity === 'number' ? maybe.quantity : Number(maybe.quantity)
        if (!Number.isFinite(qty) || qty <= 0) return null
        const unit: Unit = maybe.unit === 'kg' ? 'kg' : 'piezas'
        return { productId: maybe.productId, name: maybe.name, quantity: qty, unit }
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

  const add = useCallback((product: Product) => {
    setItems((current) => {
      const existing = current.find((x) => x.productId === product.id)
      if (!existing)
        return [...current, { productId: product.id, name: product.name, quantity: 1, unit: 'piezas' as Unit }]
      return current.map((x) =>
        x.productId === product.id ? { ...x, quantity: x.quantity + 1 } : x,
      )
    })
  }, [])

  const decrement = useCallback((productId: string) => {
    setItems((current) => {
      const existing = current.find((x) => x.productId === productId)
      if (!existing) return current
      if (existing.quantity <= 1) return current.filter((x) => x.productId !== productId)
      return current.map((x) => (x.productId === productId ? { ...x, quantity: x.quantity - 1 } : x))
    })
  }, [])

  const increment = useCallback((productId: string) => {
    setItems((current) =>
      current.map((x) => (x.productId === productId ? { ...x, quantity: x.quantity + 1 } : x)),
    )
  }, [])

  const setQuantity = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setItems((current) => current.filter((x) => x.productId !== productId))
    } else {
      const rounded = Math.round(qty * 1000) / 1000
      setItems((current) =>
        current.map((x) => (x.productId === productId ? { ...x, quantity: rounded } : x)),
      )
    }
  }, [])

  const setUnit = useCallback((productId: string, unit: Unit) => {
    setItems((current) =>
      current.map((x) => (x.productId === productId ? { ...x, unit } : x)),
    )
  }, [])

  const remove = useCallback((productId: string) => {
    setItems((current) => current.filter((x) => x.productId !== productId))
  }, [])

  const clear = useCallback(() => {
    setItems([])
  }, [])

  return { items, totalItems, add, decrement, increment, setQuantity, setUnit, remove, clear }
}
