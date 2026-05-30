# 🔍 DIAGNÓSTICO - POR QUÉ NO FUNCIONA LA SINCRONIZACIÓN

## Problema:
✅ Pedido se guarda en `web_orders`  
❌ Pedido NO aparece en `orders` (dashboard)

## Causa Probable: Row Level Security (RLS)

Las tablas en Supabase tienen RLS habilitado:
- `customers` ✅ RLS habilitado
- `orders` ✅ RLS habilitado  
- `order_items` ✅ RLS habilitado

**El problema:** El API intenta insertar con `user_uid: 'system'`, pero RLS **NO permite** inserciones de usuarios no autenticados.

---

## ¿CÓMO VERIFICAR?

### Opción 1: Revisar los logs de Vercel

1. Ir a: https://vercel.com/carnicosgustavos-projects/carnicosgustavo-com
2. Click en "Deployments"
3. Ver el último deployment
4. Click en "Logs" o "Functions"
5. Buscar errores de Supabase

### Opción 2: Test directo en Supabase

Ejecuta esta query en SQL Editor:

```sql
-- 1. Ver si RLS está habilitado en orders
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('orders', 'customers', 'order_items');

-- 2. Ver políticas de RLS
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'orders';

-- 3. Ver si hay registros con user_uid = 'system'
SELECT id, user_uid, status, created_at 
FROM orders 
WHERE user_uid = 'system' 
ORDER BY created_at DESC 
LIMIT 5;
```

Si la query 3 devuelve NADA, significa que RLS está bloqueando las inserciones.

---

## SOLUCIÓN 1: Deshabilitar RLS (FÁCIL pero INSEGURO)

**⚠️ SOLO para desarrollo/testing**

```sql
-- Deshabilitar RLS en orders
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS en order_items
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS en customers
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
```

Después, reintentar hacer un pedido en la web.

---

## SOLUCIÓN 2: Crear política RLS correcta (SEGURO)

**✅ RECOMENDADO para producción**

Crear una política que permita al service role insertar:

```sql
-- En orders
CREATE POLICY "Allow service role to insert" 
ON orders 
FOR INSERT 
WITH CHECK (true)
USING (auth.role() = 'service_role' OR user_uid = 'system');

-- En order_items  
CREATE POLICY "Allow service role to insert"
ON order_items
FOR INSERT
WITH CHECK (true)
USING (auth.role() = 'service_role');

-- En customers
CREATE POLICY "Allow service role to insert"
ON customers
FOR INSERT
WITH CHECK (true)
USING (auth.role() = 'service_role');
```

---

## SOLUCIÓN 3: Usar el servicio Supabase (MEJOR)

En lugar de insertar directamente desde el API, usar un SQL function o trigger en Supabase.

```sql
-- Crear función que sincronice automáticamente
CREATE OR REPLACE FUNCTION sync_web_order_to_dashboard()
RETURNS TRIGGER AS $$
BEGIN
  -- Crear cliente si no existe
  INSERT INTO customers (
    whatsapp_phone, name, phone, status, user_uid, created_at
  ) VALUES (
    NEW.phone,
    NEW.business_name,
    NEW.phone,
    'active',
    'system',
    NOW()
  ) ON CONFLICT (whatsapp_phone) DO NOTHING;

  -- Obtener customer_id
  DECLARE customer_id INTEGER;
  BEGIN
    SELECT id INTO customer_id FROM customers WHERE phone = NEW.phone LIMIT 1;
    
    -- Crear orden
    INSERT INTO orders (
      customer_id, status, total_amount, user_uid, notes, 
      delivery_address, created_at, updated_at
    ) VALUES (
      customer_id, 'pending', '0.00', 'system', NEW.notes,
      NEW.delivery_address, NEW.created_at, NOW()
    );
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger
CREATE TRIGGER sync_web_orders
AFTER INSERT ON web_orders
FOR EACH ROW
WHEN (NEW.source = 'website')
EXECUTE FUNCTION sync_web_order_to_dashboard();
```

---

## PASOS A SEGUIR:

### Paso 1: Verificar el problema

```bash
# En Supabase SQL Editor, ejecuta:
SELECT id, user_uid, status, created_at 
FROM orders 
WHERE user_uid = 'system' 
ORDER BY created_at DESC 
LIMIT 5;

# Si devuelve 0 resultados → RLS está bloqueando ❌
```

### Paso 2: Aplicar SOLUCIÓN 1 (Temporal)

Si quieres que funcione AHORA:

```sql
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
```

### Paso 3: Testear

1. Ir a https://carnicosgustavo.com
2. Hacer un pedido
3. Verificar en Supabase:
   - ¿Aparece en `web_orders`? ✅
   - ¿Aparece en `customers`? ✅
   - ¿Aparece en `orders`? ✅
   - ¿Aparece en `order_items`? ✅

### Paso 4: Verificar en Dashboard

1. Ir a https://dashboard.carnicosgustavo.com/admin/orders
2. ¿Aparece el pedido nuevo? ✅

---

## CHECKLIST:

- [ ] Verificar logs de Vercel
- [ ] Ejecutar SQL para verificar si RLS está bloqueando
- [ ] Aplicar SOLUCIÓN 1 o SOLUCIÓN 2
- [ ] Hacer pedido de prueba
- [ ] Verificar en Supabase
- [ ] Verificar en Dashboard
- [ ] ¡Listo! 🎉

---

## Variables de Entorno Necesarias en Vercel:

Verificar que existan en: Vercel → Project Settings → Environment Variables

```
SUPABASE_URL=https://uajezdrnqujmutjokwfo.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ORDERS_TABLE=web_orders
```

Si faltan, agregarlas en Vercel y redeploy.

---

## Resumen:

**El código está correcto ✅**  
**El problema es RLS de Supabase ⚠️**  
**La solución es habilitar permiso para 'system' ✅**
