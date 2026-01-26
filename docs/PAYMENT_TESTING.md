# Guía de Testing - Payment Gateway Mock

## 📋 Descripción General

Este documento describe cómo usar el **Payment Gateway Mock** para probar diferentes escenarios de pago en tu aplicación e-commerce.

## 🚀 Uso Básico

El servicio ya está integrado en `CheckoutPage.tsx`. Por defecto, todos los pagos se procesan **exitosamente** (100% success rate).

### Flujo de Pago Normal

1. Agrega productos al carrito
2. Ve al checkout
3. Completa los datos de envío
4. Selecciona un método de pago:
   - 💳 **Tarjeta de Crédito/Débito**
   - 📱 **Yape / Plin**
   - 🏦 **Transferencia Bancaria**
5. Haz clic en "Pagar"
6. Observa los pasos de procesamiento simulados
7. Verifica la confirmación

---

## 🧪 Escenarios de Prueba

### 1. Pago Exitoso (Por Defecto)

Todos los pagos se procesan exitosamente por defecto.

**Resultado esperado:**

- ✅ Transacción aprobada
- ID de transacción generado (ej: `TXN-1737353523456-ABC123XYZ`)
- Código de autorización (ej: `7F8G9H`)
- Orden creada en Supabase con estado `confirmed`

---

### 2. Tarjetas de Prueba Específicas

Si necesitas probar con números de tarjeta específicos, puedes modificar el código para incluir los datos de la tarjeta en el `PaymentRequest`.

#### Tarjetas de Prueba Disponibles:

| Número de Tarjeta  | Resultado               | Descripción            |
| ------------------ | ----------------------- | ---------------------- |
| `4111111111111111` | ✅ Aprobada             | Tarjeta de prueba Visa |
| `4000000000000002` | ❌ Rechazada            | Tarjeta declinada      |
| `4000000000009995` | ❌ Fondos insuficientes | Sin saldo suficiente   |

**Ejemplo de uso** (requiere modificación en el componente):

```tsx
const paymentRequest: PaymentRequest = {
  amount: total,
  currency: "PEN",
  method: {
    type: "card",
    metadata: {
      cardNumber: "4111111111111111", // ✅ Será aprobada
      cardHolder: "Juan Perez",
    },
  },
  orderId: `ORDER-${Date.now()}`,
  customerEmail: formData.email,
};
```

---

### 3. Forzar Escenarios Específicos

Para probar escenarios de error, puedes modificar la configuración del mock:

#### Opción A: Modificar en `CheckoutPage.tsx`

Reemplaza `processPayment` con una versión configurada:

```tsx
import {
  processPayment,
  processTestPaymentFailure,
} from "../services/paymentGatewayMock";

// En handlePayment, reemplaza:
const paymentResult = await processPayment(paymentRequest);

// Por:
const paymentResult = await processTestPaymentFailure(
  paymentRequest,
  "card_declined", // o 'insufficient_funds', 'timeout', 'network_error'
);
```

#### Opción B: Configurar el Mock Globalmente

En `paymentGatewayMock.ts`, modifica la instancia singleton:

```tsx
// Al inicio del archivo
const DEFAULT_CONFIG: MockConfig = {
  successRate: 0.5, // 50% de probabilidad de éxito
  minDelay: 1000,
  maxDelay: 3000,
  verbose: true,
  simulateSteps: true,
  forceScenario: "card_declined", // Forzar este escenario siempre
};
```

---

## 📊 Escenarios de Error Disponibles

### `success` ✅

Pago procesado exitosamente

- Status: `approved`
- Incluye: transactionId, authCode, fee

### `insufficient_funds` ❌

Fondos insuficientes

- Status: `rejected`
- Error: `INSUFFICIENT_FUNDS`

### `card_declined` ❌

Tarjeta rechazada por el banco

- Status: `rejected`
- Error: `CARD_DECLINED`

### `timeout` ⏱️

Timeout en procesamiento

- Status: `error`
- Error: `TIMEOUT`

### `network_error` 🌐

Error de conexión con el procesador

- Status: `error`
- Error: `NETWORK_ERROR`

---

## 🔧 Configuración Avanzada

### Parámetros de MockConfig

```typescript
interface MockConfig {
  // Probabilidad de éxito (0-1)
  successRate: number;

  // Delay mínimo y máximo en ms
  minDelay: number;
  maxDelay: number;

  // Habilitar logs detallados
  verbose: boolean;

  // Forzar un escenario específico
  forceScenario?:
    | "success"
    | "insufficient_funds"
    | "card_declined"
    | "timeout"
    | "network_error";

  // Simular procesamiento por pasos
  simulateSteps: boolean;
}
```

### Ejemplo: Testing Rápido (Sin Delays)

```typescript
paymentGatewayMock.updateConfig({
  minDelay: 100,
  maxDelay: 300,
  simulateSteps: false,
  verbose: false,
});
```

### Ejemplo: Simular Condiciones Reales

```typescript
paymentGatewayMock.updateConfig({
  successRate: 0.95, // 95% éxito, 5% fallos aleatorios
  minDelay: 2000,
  maxDelay: 5000,
  simulateSteps: true,
  verbose: true,
});
```

---

## 💰 Comisiones Simuladas

El mock calcula comisiones basadas en el método de pago:

| Método de Pago | Comisión |
| -------------- | -------- |
| Tarjeta        | 3.5%     |
| Yape / Plin    | 1.5%     |
| Transferencia  | 1.0%     |
| Efectivo       | 0%       |

Estas aparecen en `paymentResult.metadata.fee`

---

## 🔍 Debugging y Logs

El mock imprime logs detallados en la consola cuando `verbose: true`:

```
🔧 [PAYMENT MOCK] Iniciando procesamiento de pago: {amount: 250, method: 'card', orderId: 'ORDER-123'}
🔄 [PAYMENT MOCK] Validando datos de tarjeta...
🔄 [PAYMENT MOCK] Conectando con procesador Visa/Mastercard...
🔄 [PAYMENT MOCK] Verificando fondos disponibles...
🔄 [PAYMENT MOCK] Autorizando transacción...
🔄 [PAYMENT MOCK] Confirmando pago...
🔧 [PAYMENT MOCK] Resultado: {success: true, transactionId: 'TXN-...', ...}
```

---

## 📝 Verificación de Resultados

Después de un pago exitoso, verifica:

### 1. En la Consola del Browser

```
✅ Pedido creado: abc123-def456-...
💳 Transacción: TXN-1737353523456-ABC123XYZ
🔐 Auth Code: 7F8G9H
💰 Fee: 8.75
```

### 2. En Supabase (Table Editor → orders)

- `status`: `confirmed`
- `payment_method`: `card` / `yape` / `transfer`
- `notes`: Incluye transactionId y authCode

### 3. En la UI

- Pantalla de confirmación con número de orden
- Toast con ID de transacción
- Orden visible en "Mis Pedidos"

---

## 🔄 Migración a Producción

Cuando estés listo para integrar una pasarela real, reemplaza el mock:

### Opción 1: Culqi (Perú)

```typescript
// Instalar: npm install culqi-react
import Culqi from "culqi-react";

async function processRealPayment(request: PaymentRequest) {
  const culqi = new Culqi({
    publicKey: process.env.CULQI_PUBLIC_KEY,
  });

  // Implementar lógica de Culqi
  // ...
}
```

### Opción 2: MercadoPago

```typescript
// Instalar: npm install mercadopago
import mercadopago from "mercadopago";

async function processRealPayment(request: PaymentRequest) {
  mercadopago.configure({
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
  });

  // Implementar lógica de MercadoPago
  // ...
}
```

### Opción 3: Stripe

```typescript
// Instalar: npm install @stripe/stripe-js
import { loadStripe } from "@stripe/stripe-js";

async function processRealPayment(request: PaymentRequest) {
  const stripe = await loadStripe(process.env.STRIPE_PUBLIC_KEY);

  // Implementar lógica de Stripe
  // ...
}
```

---

## ✅ Checklist de Testing

Antes de pasar a producción, asegúrate de probar:

- [ ] Pago exitoso con tarjeta
- [ ] Pago exitoso con Yape/Plin
- [ ] Pago exitoso con transferencia
- [ ] Tarjeta rechazada
- [ ] Fondos insuficientes
- [ ] Error de red
- [ ] Timeout
- [ ] Orden se crea correctamente en Supabase
- [ ] Usuario autenticado ve su orden en "Mis Pedidos"
- [ ] Emails de confirmación (si aplica)
- [ ] Webhook de notificación (si aplica)

---

## 🐛 Problemas Comunes

### El pago no se procesa

- Verifica que `processPayment` esté importado correctamente
- Revisa la consola para errores de TypeScript
- Asegúrate de que las dependencias estén instaladas

### Los pasos no se muestran

- Verifica que `simulateSteps: true` en la configuración
- Los toasts pueden no aparecer si hay otro toast activo

### Las órdenes no se crean en Supabase

- Verifica las políticas RLS (ver `TESTING_GUIDE.md`)
- Revisa las credenciales en `.env`
- Asegúrate de que el usuario esté autenticado

---

## 📞 Soporte

Para más información sobre testing, consulta:

- `TESTING_GUIDE.md` - Guía general de testing
- `SUPABASE_SETUP.md` - Configuración de Supabase
- `/services/paymentGatewayMock.ts` - Código fuente del mock

---

**Última actualización:** 2026-01-20
