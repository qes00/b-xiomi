/**
 * Mock Payment Gateway Service
 * 
 * Simula una pasarela de pagos real para propósitos de testing.
 * Incluye diferentes escenarios de éxito, rechazo, y errores.
 * 
 * USO EN PRODUCCIÓN:
 * Reemplazar este servicio con integraciones reales como:
 * - Culqi (Perú)
 * - MercadoPago
 * - Stripe
 * - PayPal
 */

export interface PaymentMethod {
  type: 'card' | 'yape' | 'plin' | 'transfer' | 'cash';
  metadata?: {
    cardNumber?: string;
    cardHolder?: string;
    phoneNumber?: string;
    bankAccount?: string;
  };
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  method: PaymentMethod;
  orderId?: string;
  customerEmail?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  status: 'approved' | 'rejected' | 'pending' | 'error';
  message: string;
  timestamp: Date;
  metadata?: {
    authCode?: string;
    errorCode?: string;
    fee?: number;
  };
}

/**
 * Configuración del Mock
 */
export interface MockConfig {
  // Probabilidad de éxito (0-1)
  successRate: number;
  
  // Delay mínimo y máximo en ms
  minDelay: number;
  maxDelay: number;
  
  // Habilitar logs detallados
  verbose: boolean;
  
  // Forzar un escenario específico
  forceScenario?: 'success' | 'insufficient_funds' | 'card_declined' | 'timeout' | 'network_error';
  
  // Simular procesamiento por pasos
  simulateSteps: boolean;
}

const DEFAULT_CONFIG: MockConfig = {
  successRate: 1.0, // 100% éxito por defecto para testing
  minDelay: 1000,
  maxDelay: 3000,
  verbose: true,
  simulateSteps: true,
};

class PaymentGatewayMock {
  private config: MockConfig;

  constructor(config: Partial<MockConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Procesa un pago simulado
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    if (this.config.verbose) {
      console.log('🔧 [PAYMENT MOCK] Iniciando procesamiento de pago:', {
        amount: request.amount,
        method: request.method.type,
        orderId: request.orderId,
      });
    }

    // Simular pasos intermedios
    if (this.config.simulateSteps) {
      await this.simulateProcessingSteps(request.method.type);
    }

    // Delay aleatorio para simular procesamiento real
    const delay = this.randomDelay();
    await this.sleep(delay);

    // Generar resultado basado en configuración
    const result = this.generateResult(request);

    if (this.config.verbose) {
      console.log('🔧 [PAYMENT MOCK] Resultado:', result);
    }

    return result;
  }

  /**
   * Simula los pasos intermedios del procesamiento
   */
  private async simulateProcessingSteps(method: string): Promise<void> {
    const steps = this.getStepsForMethod(method);
    
    for (const step of steps) {
      if (this.config.verbose) {
        console.log(`🔄 [PAYMENT MOCK] ${step}`);
      }
      await this.sleep(600);
    }
  }

  /**
   * Obtiene los pasos de procesamiento según el método de pago
   */
  private getStepsForMethod(method: string): string[] {
    const stepsMap: Record<string, string[]> = {
      card: [
        'Validando datos de tarjeta...',
        'Conectando con procesador Visa/Mastercard...',
        'Verificando fondos disponibles...',
        'Autorizando transacción...',
        'Confirmando pago...',
      ],
      yape: [
        'Conectando con Yape...',
        'Generando código QR...',
        'Esperando confirmación del usuario...',
        'Validando pago...',
      ],
      plin: [
        'Conectando con Plin...',
        'Generando código de pago...',
        'Esperando confirmación...',
        'Validando transacción...',
      ],
      transfer: [
        'Generando código CCI...',
        'Validando datos bancarios...',
        'Verificando transferencia...',
        'Confirmando depósito...',
      ],
      cash: [
        'Generando código de pago...',
        'Asignando punto de pago...',
      ],
    };

    return stepsMap[method] || stepsMap.card;
  }

  /**
   * Genera el resultado del pago basado en la configuración
   */
  private generateResult(request: PaymentRequest): PaymentResult {
    const transactionId = this.generateTransactionId();
    const timestamp = new Date();

    // Si hay un escenario forzado, usarlo
    if (this.config.forceScenario) {
      return this.getScenarioResult(this.config.forceScenario, transactionId, timestamp, request);
    }

    // Caso especial: números de tarjeta de prueba
    if (request.method.type === 'card' && request.method.metadata?.cardNumber) {
      const testResult = this.handleTestCards(request.method.metadata.cardNumber, transactionId, timestamp);
      if (testResult) return testResult;
    }

    // Determinar éxito/fallo basado en successRate
    const random = Math.random();
    
    if (random <= this.config.successRate) {
      // Éxito
      return {
        success: true,
        transactionId,
        status: 'approved',
        message: 'Pago procesado exitosamente',
        timestamp,
        metadata: {
          authCode: this.generateAuthCode(),
          fee: this.calculateFee(request.amount, request.method.type),
        },
      };
    } else {
      // Fallo aleatorio
      const failureScenarios: Array<'insufficient_funds' | 'card_declined' | 'network_error'> = [
        'insufficient_funds',
        'card_declined',
        'network_error',
      ];
      const scenario = failureScenarios[Math.floor(Math.random() * failureScenarios.length)];
      return this.getScenarioResult(scenario, transactionId, timestamp, request);
    }
  }

  /**
   * Maneja tarjetas de prueba específicas
   */
  private handleTestCards(cardNumber: string, transactionId: string, timestamp: Date): PaymentResult | null {
    const testCards: Record<string, PaymentResult> = {
      // Tarjetas de prueba estándar
      '4111111111111111': {
        success: true,
        transactionId,
        status: 'approved',
        message: 'Pago aprobado (tarjeta de prueba)',
        timestamp,
        metadata: { authCode: this.generateAuthCode() },
      },
      '4000000000000002': {
        success: false,
        transactionId,
        status: 'rejected',
        message: 'Tarjeta declinada (tarjeta de prueba)',
        timestamp,
        metadata: { errorCode: 'CARD_DECLINED' },
      },
      '4000000000009995': {
        success: false,
        transactionId,
        status: 'rejected',
        message: 'Fondos insuficientes (tarjeta de prueba)',
        timestamp,
        metadata: { errorCode: 'INSUFFICIENT_FUNDS' },
      },
    };

    return testCards[cardNumber] || null;
  }

  /**
   * Obtiene resultado para un escenario específico
   */
  private getScenarioResult(
    scenario: string,
    transactionId: string,
    timestamp: Date,
    request: PaymentRequest
  ): PaymentResult {
    const scenarios: Record<string, PaymentResult> = {
      success: {
        success: true,
        transactionId,
        status: 'approved',
        message: 'Pago procesado exitosamente',
        timestamp,
        metadata: {
          authCode: this.generateAuthCode(),
          fee: this.calculateFee(request.amount, request.method.type),
        },
      },
      insufficient_funds: {
        success: false,
        transactionId,
        status: 'rejected',
        message: 'Fondos insuficientes',
        timestamp,
        metadata: { errorCode: 'INSUFFICIENT_FUNDS' },
      },
      card_declined: {
        success: false,
        transactionId,
        status: 'rejected',
        message: 'Tarjeta rechazada por el banco',
        timestamp,
        metadata: { errorCode: 'CARD_DECLINED' },
      },
      timeout: {
        success: false,
        transactionId,
        status: 'error',
        message: 'Timeout: El procesamiento tomó demasiado tiempo',
        timestamp,
        metadata: { errorCode: 'TIMEOUT' },
      },
      network_error: {
        success: false,
        transactionId,
        status: 'error',
        message: 'Error de red al conectar con el procesador',
        timestamp,
        metadata: { errorCode: 'NETWORK_ERROR' },
      },
    };

    return scenarios[scenario] || scenarios.success;
  }

  /**
   * Genera un ID de transacción único
   */
  private generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11).toUpperCase();
    return `TXN-${timestamp}-${random}`;
  }

  /**
   * Genera un código de autorización
   */
  private generateAuthCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * Calcula la comisión basada en el método de pago
   */
  private calculateFee(amount: number, method: string): number {
    const feeRates: Record<string, number> = {
      card: 0.035, // 3.5%
      yape: 0.015, // 1.5%
      plin: 0.015, // 1.5%
      transfer: 0.01, // 1%
      cash: 0, // Sin comisión
    };

    const rate = feeRates[method] || 0.03;
    return parseFloat((amount * rate).toFixed(2));
  }

  /**
   * Genera un delay aleatorio
   */
  private randomDelay(): number {
    return Math.floor(
      Math.random() * (this.config.maxDelay - this.config.minDelay) + this.config.minDelay
    );
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Actualiza la configuración
   */
  updateConfig(config: Partial<MockConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Instancia singleton para uso global
export const paymentGatewayMock = new PaymentGatewayMock();

// Helpers para casos de prueba específicos

/**
 * Procesa un pago garantizado exitoso (para testing)
 */
export async function processTestPaymentSuccess(request: PaymentRequest): Promise<PaymentResult> {
  const mock = new PaymentGatewayMock({ successRate: 1, forceScenario: 'success' });
  return mock.processPayment(request);
}

/**
 * Procesa un pago garantizado fallido (para testing)
 */
export async function processTestPaymentFailure(
  request: PaymentRequest,
  scenario: 'insufficient_funds' | 'card_declined' | 'timeout' | 'network_error' = 'card_declined'
): Promise<PaymentResult> {
  const mock = new PaymentGatewayMock({ successRate: 0, forceScenario: scenario });
  return mock.processPayment(request);
}

/**
 * Alias para procesamiento normal (usar en checkout)
 */
export async function processPayment(request: PaymentRequest): Promise<PaymentResult> {
  return paymentGatewayMock.processPayment(request);
}
