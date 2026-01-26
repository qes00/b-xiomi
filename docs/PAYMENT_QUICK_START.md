# 🚀 QUICK START - Payment Gateway Mock

## ✅ Todo está listo!

El sistema de **Payment Gateway Mock** ya está completamente integrado. No necesitas hacer nada para empezar a usarlo.

## 🧪 Modo Testing (Actual)

Por defecto, todos los pagos se procesan **exitosamente** (100% success rate).

### Probar un pago:

1. Ve a `http://localhost:5173`
2. Agrega productos al carrito
3. Checkout → Completa datos → Selecciona método de pago → Pagar
4. ✅ El pago se procesará exitosamente

## 🎯 Testing Avanzado

### Opción 1: Panel de Testing Interactivo

Agrega el panel de testing a tu app temporalmente:

1. Abre `App.tsx`
2. Importa el componente:
   ```tsx
   import PaymentTestingPanel from "./components/PaymentTestingPanel";
   ```
3. Agrégalo a una ruta (ejemplo):
   ```tsx
   <Route path="/payment-test" element={<PaymentTestingPanel />} />
   ```
4. Visita `http://localhost:5173/payment-test`

### Opción 2: Modificar Configuración Manualmente

Edita `services/paymentGatewayMock.ts`:

```typescript
// Línea 62-68
const DEFAULT_CONFIG: MockConfig = {
  successRate: 0.5, // ← Cambiar a 0.5 para 50% fallos
  forceScenario: "card_declined", // ← Descomentar para forzar error
  // ...
};
```

### Opción 3: Código Rápido en CheckoutPage

Reemplaza `processPayment` por `processTestPaymentFailure`:

```tsx
// En CheckoutPage.tsx, línea ~98
const paymentResult = await processTestPaymentFailure(
  paymentRequest,
  "card_declined", // o 'insufficient_funds', 'timeout', etc.
);
```

## 📊 Escenarios Disponibles

| Escenario            | Código                                                     |
| -------------------- | ---------------------------------------------------------- |
| ✅ Éxito garantizado | `processTestPaymentSuccess(request)`                       |
| ❌ Tarjeta rechazada | `processTestPaymentFailure(request, 'card_declined')`      |
| 💸 Sin fondos        | `processTestPaymentFailure(request, 'insufficient_funds')` |
| ⏱️ Timeout           | `processTestPaymentFailure(request, 'timeout')`            |
| 🌐 Error de red      | `processTestPaymentFailure(request, 'network_error')`      |

## 🔧 Configuración Rápida

```typescript
import { paymentGatewayMock } from "./services/paymentGatewayMock";

// Testing rápido (sin delays)
paymentGatewayMock.updateConfig({
  minDelay: 100,
  maxDelay: 300,
  simulateSteps: false,
});

// Simular condiciones reales
paymentGatewayMock.updateConfig({
  successRate: 0.95, // 95% éxito
  minDelay: 2000,
  maxDelay: 5000,
});
```

## 📝 Verificar Resultados

### En la Consola del Browser:

```
✅ Pedido creado: abc-123
💳 Transacción: TXN-1737353523456-ABC123
🔐 Auth Code: 7F8G9H
💰 Fee: 8.75
```

### En Supabase:

- Table Editor → `orders`
- Busca tu orden por `payment_method` o `notes`

## 🔗 Documentación Completa

- **[PAYMENT_TESTING.md](./PAYMENT_TESTING.md)** - Guía detallada con todos los escenarios
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Guía general de testing

## 🎨 Panel de Testing Visual

El panel de testing (`PaymentTestingPanel.tsx`) incluye:

- ✅ Botones para probar todos los escenarios
- ⚙️ Configuración en vivo del mock
- 📊 Visualización de resultados en tiempo real
- 📋 JSON response completo

## 🚀 Producción

Cuando estés listo para producción, consulta la sección "Migración a Producción" en `PAYMENT_TESTING.md` para integrar pasarelas reales como:

- Culqi (Perú)
- MercadoPago
- Stripe
- PayPal

---

**¿Tienes dudas?** Revisa los archivos de documentación o el código fuente en:

- `services/paymentGatewayMock.ts`
- `components/CheckoutPage.tsx`
- `components/PaymentTestingPanel.tsx`
