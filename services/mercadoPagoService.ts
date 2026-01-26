/**
 * Mercado Pago Service
 * @description Cliente para interactuar con Mercado Pago API
 */

export interface PaymentData {
    transaction_amount: number;
    description: string;
    payment_method_id: string;
    payer: {
        email: string;
        first_name?: string;
        last_name?: string;
    };
}

export interface PaymentResult {
    id: string;
    status: 'approved' | 'rejected' | 'pending' | 'in_process';
    status_detail: string;
    external_reference?: string;
}

/**
 * Servicio simple de Mercado Pago para el frontend
 * Para operaciones de backend, se usarán Edge Functions de Supabase
 */
class MercadoPagoService {
    private publicKey: string;

    constructor() {
        this.publicKey = import.meta.env.VITE_MP_PUBLIC_KEY || '';
        
        if (!this.publicKey || this.publicKey.includes('xxx')) {
            console.warn('⚠️ Mercado Pago no configurado correctamente');
            console.warn('📝 Obtén tus credenciales en: https://www.mercadopago.com.pe/developers/panel');
        }
    }

    /**
     * Obtiene la public key configurada
     */
    getPublicKey(): string {
        return this.publicKey;
    }

    /**
     * Verifica si MP está configurado correctamente
     */
    isConfigured(): boolean {
        return !!this.publicKey && !this.publicKey.includes('xxx');
    }

    /**
     * Formatea el monto en centavos (Mercado Pago requiere el monto sin decimales)
     * Ejemplo: 50.99 → 50.99
     */
    formatAmount(amount: number): number {
        return Number(amount.toFixed(2));
    }

    /**
     * Obtiene los métodos de pago disponibles en Perú
     */
    getAvailablePaymentMethods() {
        return [
            { id: 'visa', name: 'Visa', type: 'credit_card' },
            { id: 'master', name: 'Mastercard', type: 'credit_card' },
            { id: 'amex', name: 'American Express', type: 'credit_card' },
            { id: 'pagoefectivo_atm', name: 'PagoEfectivo', type: 'ticket' },
        ];
    }
}

// Exportar instancia singleton
export const mercadoPagoService = new MercadoPagoService();
export default mercadoPagoService;
