-- ============================================================================
-- SCRIPT PARA HABILITAR SINCRONIZACIÓN
-- Ejecuta esto en: https://supabase.co/dashboard/project/uajezdrnqujmutjokwfo/sql
-- ============================================================================

-- PASO 1: VERIFICAR EL PROBLEMA
-- Ejecuta primero esto para confirmar que RLS está bloqueando:

SELECT 'Checking orders table...' as step;
SELECT id, user_uid, status, created_at
FROM orders
WHERE user_uid = 'system'
ORDER BY created_at DESC
LIMIT 5;

-- Si devuelve 0 resultados, RLS está bloqueando.
-- Continúa con PASO 2.

-- ============================================================================
-- PASO 2: SOLUCIÓN RÁPIDA - Deshabilitar RLS (TEMPORAL)
-- ============================================================================

-- OPCIÓN A: Solo si quieres que funcione rápido (desarrollo/testing)
-- Uncomment las líneas de abajo:

-- ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Después de ejecutar, redeploy la web en Vercel y haz un pedido de prueba.

-- ============================================================================
-- PASO 3: SOLUCIÓN SEGURA - Crear políticas RLS correctas
-- ============================================================================

-- Este enfoque es SEGURO para producción.
-- Permite que el service role (el API) inserte datos.

-- 3.1: Habilitar RLS en orders (si no está habilitado)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 3.2: Crear política para permitir inserciones del service role
CREATE POLICY "Allow service role and system user to insert orders"
ON orders
FOR INSERT
WITH CHECK (
  auth.role() = 'service_role' OR user_uid = 'system'
);

-- 3.3: Crear política para SELECT
CREATE POLICY "Allow service role and system user to read orders"
ON orders
FOR SELECT
USING (
  auth.role() = 'service_role' OR user_uid = 'system' OR user_uid = auth.uid()
);

-- ============================================================================
-- 3.4: Hacer lo mismo para order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role to insert order_items"
ON order_items
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role to read order_items"
ON order_items
FOR SELECT
USING (
  auth.role() = 'service_role'
  OR EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_uid = 'system' OR orders.user_uid = auth.uid())
  )
);

-- ============================================================================
-- 3.5: Hacer lo mismo para customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role to insert customers"
ON customers
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role to read customers"
ON customers
FOR SELECT
USING (
  auth.role() = 'service_role'
  OR user_uid = auth.uid()
);

-- ============================================================================
-- PASO 4: VERIFICAR QUE FUNCIONÓ
-- Ejecuta después de hacer un pedido en la web:
-- ============================================================================

SELECT 'Verification:' as step;

-- Debería haber registros con user_uid = 'system'
SELECT 'Orders with system user_uid:' as check, COUNT(*) as count
FROM orders
WHERE user_uid = 'system';

-- Debería haber items en order_items
SELECT 'Order items created:' as check, COUNT(*) as count
FROM order_items;

-- Debería haber clientes creados
SELECT 'Customers from web:' as check, COUNT(*) as count
FROM customers
WHERE user_uid = 'system';

-- ============================================================================
-- ALTERNATIVA: SOLUCIÓN CON TRIGGER (AUTOMÁTICA)
-- ============================================================================
-- Si prefieres que sea completamente automático sin modificar el API:

-- Crear función trigger que sincronice automáticamente
CREATE OR REPLACE FUNCTION sync_web_order_to_dashboard()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_id INTEGER;
  v_order_id INTEGER;
BEGIN
  -- Solo sincronizar si es un pedido desde website
  IF NEW.source = 'website' THEN

    -- 1. Crear o actualizar cliente
    INSERT INTO customers (
      whatsapp_phone,
      name,
      phone,
      address,
      notes,
      status,
      user_uid,
      created_at,
      updated_at
    ) VALUES (
      NEW.phone,
      NEW.business_name,
      NEW.phone,
      NEW.delivery_address,
      NEW.notes,
      'active',
      'system',
      NOW(),
      NOW()
    )
    ON CONFLICT (whatsapp_phone) DO UPDATE SET
      name = EXCLUDED.name,
      address = EXCLUDED.address,
      updated_at = NOW()
    RETURNING id INTO v_customer_id;

    -- 2. Obtener customer_id si no se insertó
    IF v_customer_id IS NULL THEN
      SELECT id INTO v_customer_id
      FROM customers
      WHERE whatsapp_phone = NEW.phone
      LIMIT 1;
    END IF;

    -- 3. Crear orden en dashboard
    INSERT INTO orders (
      customer_id,
      status,
      total_amount,
      user_uid,
      notes,
      delivery_address,
      requires_weighing,
      created_at,
      updated_at
    ) VALUES (
      v_customer_id,
      'pending',
      '0.00',
      'system',
      NEW.notes,
      NEW.delivery_address,
      FALSE,
      NOW(),
      NOW()
    )
    RETURNING id INTO v_order_id;

    -- 4. Crear items en orden (si web_orders tiene items en JSON)
    -- Nota: Esto asume que NEW.items es un JSON array
    -- Si necesitas esto, avísame y lo ajusto

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Crear trigger
DROP TRIGGER IF EXISTS sync_web_orders_trigger ON web_orders;
CREATE TRIGGER sync_web_orders_trigger
AFTER INSERT ON web_orders
FOR EACH ROW
EXECUTE FUNCTION sync_web_order_to_dashboard();

-- ============================================================================
-- ¡LISTO! Ahora prueba:
-- ============================================================================
-- 1. Ve a https://carnicosgustavo.com
-- 2. Haz un pedido
-- 3. Verifica en dashboard: https://dashboard.carnicosgustavo.com/admin/orders
-- 4. ¡Debe aparecer el pedido! 🎉
