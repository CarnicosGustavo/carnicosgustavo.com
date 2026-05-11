import { BUSINESS } from '../../config'

export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-10 text-sm text-black/70">
        <div className="font-semibold text-cg-black">{BUSINESS.name}</div>
        <div>{BUSINESS.tagline}</div>
        <div className="pt-4 text-xs text-black/60">Cárnicos Gustavo © 2026. Calidad que se nota en cada corte de cerdo.</div>
      </div>
    </footer>
  )
}

