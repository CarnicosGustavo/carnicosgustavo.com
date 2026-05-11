import { useEffect, useMemo, useState } from 'react'

import { BUSINESS } from '../../config'

type NavLink = {
  label: string
  href: string
}

export function Header() {
  const [open, setOpen] = useState(false)
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    function onScroll() {
      setCompact(window.scrollY > 12)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links: NavLink[] = useMemo(
    () => [
      { label: 'Inicio', href: '#inicio' },
      { label: 'Nuestro CEDIS', href: '#cedis' },
      { label: 'Catálogo', href: '#catalogo' },
      { label: 'Restaurantes', href: '#restaurantes' },
      { label: 'Carnicerías', href: '#carnicerias' },
      { label: 'Contacto', href: '#contacto' },
    ],
    [],
  )

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/90 backdrop-blur">
      <div
        className={[
          'mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 transition-all duration-200',
          compact ? 'py-2' : 'py-3',
        ].join(' ')}
      >
        <a
          href="#inicio"
          className="flex items-center gap-2 font-display text-base font-extrabold tracking-tight text-cg-black"
          onClick={() => setOpen(false)}
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-cg-red font-display text-sm font-extrabold text-white">
            CG
          </span>
          <span className="hidden sm:inline">{BUSINESS.name}</span>
        </a>

        <nav className="hidden items-center gap-5 text-sm font-medium text-cg-black md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-cg-red">
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded border border-black/15 px-3 py-2 text-sm font-semibold text-cg-black md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Abrir menú"
        >
          Menú
        </button>
      </div>

      {open && (
        <div className="border-t border-black/10 bg-white md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded px-2 py-2 text-sm font-semibold text-cg-black hover:bg-cg-gray hover:text-cg-red"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
