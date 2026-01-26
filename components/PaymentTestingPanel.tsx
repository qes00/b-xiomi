import React, { useState } from 'react';
import { 
  paymentGatewayMock,
  processPayment,
  processTestPaymentSuccess,
  processTestPaymentFailure,
  PaymentRequest,
  PaymentResult 
} from '../services/paymentGatewayMock';
import { Button } from './Button';
import { useToast } from './Toast';

/**
 * Panel de Testing para Payment Gateway Mock
 * 
 * Este componente permite probar diferentes escenarios de pago
 * sin tener que realizar compras completas.
 * 
 * USO:
 * Importa este componente en App.tsx o en una ruta de admin/testing
 */

export const PaymentTestingPanel: React.FC = () => {
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<PaymentResult | null>(null);
  const [amount, setAmount] = useState(250);
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'yape' | 'transfer'>('card');

  const testPayment = async (scenario: 'success' | 'card_declined' | 'insufficient_funds' | 'timeout' | 'network_error' | 'normal') => {
    setIsProcessing(true);
    setLastResult(null);

    const request: PaymentRequest = {
      amount,
      currency: 'PEN',
      method: {
        type: selectedMethod,
        metadata: {}
      },
      orderId: `TEST-${Date.now()}`,
      customerEmail: 'test@example.com',
    };

    try {
      let result: PaymentResult;

      switch (scenario) {
        case 'success':
          result = await processTestPaymentSuccess(request);
          break;
        case 'normal':
          result = await processPayment(request);
          break;
        default:
          result = await processTestPaymentFailure(request, scenario);
      }

      setLastResult(result);

      if (result.success) {
        showToast('success', `✅ ${result.message}`);
      } else {
        showToast('error', `❌ ${result.message}`);
      }
    } catch (error) {
      console.error('Error en test:', error);
      showToast('error', 'Error ejecutando test');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateMockConfig = (config: any) => {
    paymentGatewayMock.updateConfig(config);
    showToast('info', '⚙️ Configuración actualizada');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold mb-2">🧪 Payment Gateway Testing Panel</h1>
        <p className="text-purple-100">Prueba diferentes escenarios de pago sin realizar compras reales</p>
      </div>

      {/* Configuración del Pago de Prueba */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📝 Configuración de Pago</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monto (PEN)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="card">💳 Tarjeta</option>
              <option value="yape">📱 Yape</option>
              <option value="transfer">🏦 Transferencia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Escenarios de Prueba */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Escenarios de Prueba</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            onClick={() => testPayment('success')}
            disabled={isProcessing}
            className="px-4 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✅ Éxito Garantizado
          </button>

          <button
            onClick={() => testPayment('normal')}
            disabled={isProcessing}
            className="px-4 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔄 Flujo Normal
          </button>

          <button
            onClick={() => testPayment('card_declined')}
            disabled={isProcessing}
            className="px-4 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ❌ Tarjeta Rechazada
          </button>

          <button
            onClick={() => testPayment('insufficient_funds')}
            disabled={isProcessing}
            className="px-4 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            💸 Sin Fondos
          </button>

          <button
            onClick={() => testPayment('timeout')}
            disabled={isProcessing}
            className="px-4 py-3 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⏱️ Timeout
          </button>

          <button
            onClick={() => testPayment('network_error')}
            disabled={isProcessing}
            className="px-4 py-3 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🌐 Error de Red
          </button>
        </div>
      </div>

      {/* Configuración del Mock */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">⚙️ Configuración del Mock</h2>
        
        <div className="space-y-3">
          <button
            onClick={() => updateMockConfig({ successRate: 1.0 })}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-left"
          >
            100% Éxito (Default)
          </button>

          <button
            onClick={() => updateMockConfig({ successRate: 0.5 })}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-left"
          >
            50% Éxito / 50% Fallo
          </button>

          <button
            onClick={() => updateMockConfig({ minDelay: 100, maxDelay: 300, simulateSteps: false })}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-left"
          >
            ⚡ Modo Rápido (Sin delays)
          </button>

          <button
            onClick={() => updateMockConfig({ minDelay: 1000, maxDelay: 3000, simulateSteps: true })}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-left"
          >
            🐌 Modo Realista (Con delays)
          </button>

          <button
            onClick={() => updateMockConfig({ verbose: true })}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-left"
          >
            🔊 Habilitar Logs Detallados
          </button>

          <button
            onClick={() => updateMockConfig({ verbose: false })}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-left"
          >
            🔇 Deshabilitar Logs
          </button>
        </div>
      </div>

      {/* Resultado del Último Test */}
      {lastResult && (
        <div className={`rounded-xl border-2 p-6 shadow-sm ${
          lastResult.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {lastResult.success ? '✅ Resultado Exitoso' : '❌ Resultado de Error'}
          </h2>
          
          <div className="space-y-2 font-mono text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-600">Status:</div>
              <div className="font-bold text-gray-900">{lastResult.status}</div>

              <div className="text-gray-600">Transaction ID:</div>
              <div className="font-bold text-gray-900 break-all">{lastResult.transactionId}</div>

              <div className="text-gray-600">Mensaje:</div>
              <div className="font-bold text-gray-900">{lastResult.message}</div>

              <div className="text-gray-600">Timestamp:</div>
              <div className="font-bold text-gray-900">{new Date(lastResult.timestamp).toLocaleString()}</div>

              {lastResult.metadata?.authCode && (
                <>
                  <div className="text-gray-600">Auth Code:</div>
                  <div className="font-bold text-green-600">{lastResult.metadata.authCode}</div>
                </>
              )}

              {lastResult.metadata?.fee && (
                <>
                  <div className="text-gray-600">Comisión:</div>
                  <div className="font-bold text-gray-900">S/ {lastResult.metadata.fee.toFixed(2)}</div>
                </>
              )}

              {lastResult.metadata?.errorCode && (
                <>
                  <div className="text-gray-600">Error Code:</div>
                  <div className="font-bold text-red-600">{lastResult.metadata.errorCode}</div>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded-lg">
            <p className="text-xs text-gray-500 mb-1">JSON Response:</p>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(lastResult, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Spinner de Procesamiento */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg font-bold text-gray-900">Procesando pago...</p>
            <p className="text-sm text-gray-500 mt-1">Revisa la consola para logs detallados</p>
          </div>
        </div>
      )}

      {/* Documentación Rápida */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-2">📚 Documentación</h3>
        <p className="text-sm text-blue-700 mb-2">
          Para más información sobre testing de pagos, consulta:
        </p>
        <ul className="text-sm text-blue-600 space-y-1 list-disc list-inside">
          <li><code className="bg-blue-100 px-2 py-1 rounded">docs/PAYMENT_TESTING.md</code> - Guía completa de testing</li>
          <li><code className="bg-blue-100 px-2 py-1 rounded">services/paymentGatewayMock.ts</code> - Código fuente</li>
          <li><code className="bg-blue-100 px-2 py-1 rounded">components/CheckoutPage.tsx</code> - Implementación</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentTestingPanel;
