import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { BUSINESS, CONTACT, LINKS } from './config'
import { PRODUCTS } from './data/products'
import { CatalogSection } from './features/catalog/CatalogSection'
import { OrderPanel } from './features/order/OrderPanel'
import { useOrder } from './features/order/useOrder'

function App() {
  const order = useOrder()
  const [orderOpen, setOrderOpen] = useState(false)

  const whatsappDigits = useMemo(
    () => CONTACT.whatsappPhoneE164.replace(/[^\d]/g, ''),
    [],
  )
  const whatsappUrl = useMemo(
    () => (whatsappDigits.length >= 11 ? `https://wa.me/${whatsappDigits}` : ''),
    [whatsappDigits],
  )

  const mapEmbedUrl = useMemo(() => {
    const q = encodeURIComponent(BUSINESS.locationLabel)
    return `https://www.google.com/maps?q=${q}&output=embed`
  }, [])

  return (
    <div className="min-h-svh bg-white text-cg-black">
      <Header />

      <main>
        <section id="inicio" className="relative overflow-hidden bg-cg-black">
          <img
            src="/images/hero_cerdo_premium.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/40 to-black/80" />
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08 } },
            }}
            className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 md:py-24"
          >
            <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-start">
              <motion.div
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="order-1 flex justify-center md:order-2 md:col-span-5 md:justify-end"
              >
                <img
                  src="/images/logo3.png"
                  alt="Cárnicos Gustavo"
                  className="h-28 w-auto drop-shadow-[0_18px_38px_rgba(0,0,0,0.55)] sm:h-32 md:h-44 lg:h-52"
                  loading="eager"
                />
              </motion.div>

              <div className="order-2 md:order-1 md:col-span-7">
              <motion.div
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="mt-4 inline-flex items-center gap-2 rounded bg-white/10 px-3 py-2 text-xs font-extrabold tracking-wide text-white"
              >
                {BUSINESS.tagline}
              </motion.div>
              <motion.h1
                variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
                className="mt-6 font-display text-4xl font-extrabold tracking-tight text-white md:text-6xl"
              >
                Abastecemos el éxito de tu negocio con la mejor selección de cerdo.
              </motion.h1>
              <motion.p
                variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
                className="mt-5 max-w-2xl text-base leading-relaxed text-white/80"
              >
                En el Centro de Distribución Cárnicos Gustavo, somos más que proveedores: somos el aliado
                estratégico de restaurantes y carnicerías que no comprometen la calidad en productos de
                cerdo. Llevamos frescura y rendimiento directamente a tu puerta.
              </motion.p>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <a
                  href="#catalogo"
                  className="inline-flex items-center justify-center rounded bg-cg-red px-5 py-3 text-sm font-extrabold text-white hover:brightness-110"
                >
                  Ver catálogo de cerdo
                </a>
                <motion.button
                  type="button"
                  onClick={() => setOrderOpen(true)}
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity }}
                  className="inline-flex items-center justify-center rounded border border-white/30 bg-white/10 px-5 py-3 text-sm font-extrabold text-white hover:bg-white/15"
                >
                  Solicitar cotización mayorista
                </motion.button>
              </motion.div>
              </div>
            </div>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
            >
              {[
                { title: 'Calidad garantizada', text: 'Selección rigurosa de canales de cerdo para asegurar sabor y textura constantes.' },
                { title: 'Cadena de frío certificada', text: 'Procesos logísticos estrictos que preservan la integridad de cada producto.' },
                { title: 'Precios de distribución', text: 'Maximizamos tu margen de utilidad con precios competitivos por volumen.' },
                { title: 'Entrega puntual', text: 'Entendemos el ritmo de tu cocina y tu mostrador; llegamos cuando nos necesitas.' },
              ].map((b) => (
                <motion.div
                  key={b.title}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="rounded border border-white/10 bg-white/5 p-4"
                >
                  <div className="text-sm font-extrabold text-white">{b.title}</div>
                  <div className="mt-2 text-sm text-white/75">{b.text}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        <section id="cedis" className="py-16">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 md:grid-cols-2 md:items-center">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-cg-black">
                Infraestructura y pasión por la calidad en productos de cerdo.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-black/70">
                Con años de experiencia en el mercado, Cárnicos Gustavo ha evolucionado para convertirse
                en un Centro de Distribución de vanguardia, especializado en productos de cerdo. Nuestras
                instalaciones cuentan con tecnología de refrigeración de última generación y procesos de
                higiene que superan los estándares locales.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { k: '10+', v: 'Años de experiencia' },
                  { k: 'B2B', v: 'Mayoristas' },
                  { k: 'Frío', v: 'Cadena controlada' },
                ].map((s) => (
                  <div key={s.v} className="rounded bg-cg-gray p-4">
                    <div className="text-xl font-extrabold text-cg-black">{s.k}</div>
                    <div className="mt-1 text-xs font-semibold text-black/60">{s.v}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="overflow-hidden rounded bg-cg-gray shadow-soft ring-1 ring-black/5"
            >
              <img
                src="/images/canal_cerdo.png"
                alt="Canal de cerdo"
                className="h-72 w-full object-cover md:h-96"
                loading="lazy"
              />
            </motion.div>
          </div>
        </section>

        <CatalogSection
          products={PRODUCTS}
          items={order.items}
          onAdd={order.add}
          onIncrement={order.increment}
          onDecrement={order.decrement}
        />

        <section id="restaurantes" className="py-16">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 md:grid-cols-2 md:items-center">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="order-2 md:order-1"
            >
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-cg-black">
                Soluciones a la medida para el sector gastronómico: especialistas en cerdo.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-black/70">
                Sabemos que en la cocina profesional, cada gramo cuenta. Por ello, ofrecemos a nuestros
                clientes del sector Horeca un servicio de cortes de cerdo personalizados y porcionados
                según sus necesidades operativas.
              </p>
              <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-black/70">
                <li>Asesoría técnica en rendimientos por corte de cerdo.</li>
                <li>Estandarización de productos de cerdo para mantener la consistencia en tus platillos.</li>
                <li>Programación de entregas semanales para optimizar tu inventario de cerdo.</li>
              </ul>
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => setOrderOpen(true)}
                  className="inline-flex items-center justify-center rounded bg-cg-red px-5 py-3 text-sm font-extrabold text-white hover:brightness-110"
                >
                  ¡Haz tu pedido de cerdo mayorista ahora!
                </button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="order-1 overflow-hidden rounded bg-cg-gray shadow-soft ring-1 ring-black/5 md:order-2"
            >
              <img
                src="/images/costillar.png"
                alt="Costillar de cerdo"
                className="h-72 w-full object-cover md:h-96"
                loading="lazy"
              />
            </motion.div>
          </div>
        </section>

        <section id="carnicerias" className="bg-cg-gray py-16">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 md:grid-cols-2 md:items-center">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="overflow-hidden rounded bg-white shadow-soft ring-1 ring-black/5"
            >
              <img
                src="/images/espalda_cerdo.png"
                alt="Espaldilla de cerdo"
                className="h-72 w-full object-cover md:h-96"
                loading="lazy"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-cg-black">
                Fortalece tu mostrador con la mejor carne de cerdo de Cárnicos Gustavo.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-black/70">
                Si buscas que tus clientes regresen siempre por la mejor carne de cerdo de la zona,
                nuestro CEDIS es tu mejor opción de suministro. Proveemos a carnicerías locales con
                canales y cortes primarios de cerdo de la más alta frescura.
              </p>
              <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-black/70">
                <li>Suministro constante de cerdo durante todo el año.</li>
                <li>Variedad en cortes de cerdo en un solo lugar.</li>
                <li>Soporte logístico que te ahorra tiempo y costos de transporte.</li>
              </ul>
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => setOrderOpen(true)}
                  className="inline-flex items-center justify-center rounded border border-black/15 bg-white px-5 py-3 text-sm font-extrabold text-cg-black hover:bg-white/80"
                >
                  Hablar con un asesor de ventas
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="contacto" className="py-16">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 md:grid-cols-2 md:items-start">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-cg-black">
                Pedidos y contacto
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-black/70">
                Arma tu pedido desde el catálogo y envíalo por WhatsApp. También puedes encontrarnos en{' '}
                <span className="font-semibold">{BUSINESS.locationLabel}</span>.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setOrderOpen(true)}
                  className="inline-flex items-center justify-center rounded bg-cg-red px-5 py-3 text-sm font-extrabold text-white hover:brightness-110"
                >
                  Abrir pedido
                </button>
                <a
                  href={LINKS.googleMapsSearchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded border border-black/15 px-5 py-3 text-sm font-extrabold text-cg-black hover:bg-cg-gray"
                >
                  Ver ubicación
                </a>
              </div>

              <div className="mt-10 rounded bg-cg-gray p-4 text-sm text-black/70">
                <div className="text-sm font-extrabold text-cg-black">Horario y datos</div>
                <div className="mt-2 text-xs text-black/60">
                  {whatsappUrl ? (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-cg-black underline decoration-black/20 underline-offset-4 hover:text-cg-red"
                    >
                      WhatsApp de ventas: +{whatsappDigits}
                    </a>
                  ) : (
                    <span>Configura WhatsApp de ventas (VITE_WHATSAPP_PHONE).</span>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="overflow-hidden rounded bg-cg-gray shadow-soft ring-1 ring-black/5"
            >
              <iframe
                title="Ubicación"
                src={mapEmbedUrl}
                className="h-80 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />

      <motion.button
        type="button"
        onClick={() => setOrderOpen(true)}
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 2.6, ease: 'easeInOut', repeat: Infinity }}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-cg-red px-5 py-3 text-sm font-extrabold text-white shadow-soft hover:brightness-110"
      >
        Pedido <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">{order.totalItems}</span>
      </motion.button>

      <OrderPanel
        open={orderOpen}
        items={order.items}
        onClose={() => setOrderOpen(false)}
        onIncrement={order.increment}
        onDecrement={order.decrement}
        onSetUnit={order.setUnit}
        onSetQuantity={order.setQuantity}
        onRemove={order.remove}
        onClear={order.clear}
      />
    </div>
  )
}

export default App
