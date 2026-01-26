import React, { useEffect } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { mercadoPagoService } from '../services/mercadoPagoService';
import { useToast } from './Toast';

interface MercadoPagoPaymentProps {
    amount: number;
    description: string;
    userEmail: string;
    onPaymentSuccess: (paymentId: string) => void;
    onPaymentError?: (error: string) => void;
    onBack?: () => void;
}

export const MercadoPagoPayment: React.FC<MercadoPagoPaymentProps> = ({
    amount,
    description,
    userEmail,
    onPaymentSuccess,
    onPaymentError,
    onBack
}) => {
    const { showToast } = useToast();
    const [isInitialized, setIsInitialized] = React.useState(false);

    useEffect(() => {
        // Inicializar Mercado Pago SDK
        if (mercadoPagoService.isConfigured()) {
            try {
                initMercadoPago(mercadoPagoService.getPublicKey(), {
                    locale: 'es-PE'
                });
                setIsInitialized(true);
            } catch (error) {
                console.error('Error inicializando Mercado Pago:', error);
                showToast('error', 'Error al cargar el sistema de pagos');
            }
        } else {
            showToast('error', 'Sistema de pagos no configurado');
        }
    }, [showToast]);

    const handlePayment = async (formData: any) => {
        try {
            // El formData contiene el token del pago generado por MP
            console.log('Procesando pago:', formData);
            
            // Aquí normalmente enviarías el formData a tu backend
            // Por ahora, simulamos un pago exitoso
            
            // En producción, harías algo como:
            // const response = await fetch('/api/process-payment', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         token: formData.token,
            //         transaction_amount: amount,
            //         description,
            //         payer: { email: userEmail }
            //     })
            // });

            // Simular respuesta exitosa
            showToast('success', '¡Pago procesado exitosamente!');
            onPaymentSuccess(formData.payment_id || 'mock-payment-id');
            
        } catch (error) {
            console.error('Error procesando pago:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error al procesar el pago';
            showToast('error', errorMessage);
            onPaymentError?.(errorMessage);
        }
    };

    const handleError = (error: any) => {
        console.error('Error en Payment Brick:', error);
        showToast('error', 'Ocurrió un error en el formulario de pago');
        onPaymentError?.('Error en formulario de pago');
    };

    if (!mercadoPagoService.isConfigured()) {
        return (
            <div className={styles.container}>
                <div className={styles.errorCard}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <h3 className={styles.errorTitle}>Sistema de Pagos No Configurado</h3>
                    <p className={styles.errorText}>
                        Por favor configura las credenciales de Mercado Pago en el archivo .env
                    </p>
                    <p className={styles.errorHint}>
                        Obtén tus credenciales en:{' '}
                        <a 
                            href="https://www.mercadopago.com.pe/developers/panel" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={styles.link}
                        >
                            Panel de Desarrolladores
                        </a>
                    </p>
                    {onBack && (
                        <button onClick={onBack} className={styles.backButton}>
                            Volver
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (!isInitialized) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingCard}>
                    <div className={styles.spinner}></div>
                    <p>Cargando sistema de pagos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h2 className={styles.title}>💳 Completa tu Pago</h2>
                    <p className={styles.subtitle}>
                        Total a pagar: <strong>S/ {mercadoPagoService.formatAmount(amount)}</strong>
                    </p>
                </div>

                <div className={styles.paymentBrick}>
                    <Payment
                        initialization={{
                            amount: mercadoPagoService.formatAmount(amount),
                            payer: {
                                email: userEmail,
                            },
                        }}
                        customization={{
                            visual: {
                                style: {
                                    theme: 'default',
                                },
                            },
                            paymentMethods: {
                                creditCard: 'all',
                                debitCard: 'all',
                                ticket: 'all',
                                bankTransfer: 'all',
                                maxInstallments: 12,
                            },
                        }}
                        onSubmit={handlePayment}
                        onError={handleError}
                        onReady={() => console.log('Payment Brick ready')}
                    />
                </div>

                {onBack && (
                    <div className={styles.footer}>
                        <button onClick={onBack} className={styles.backLinkButton}>
                            ← Volver a datos de envío
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: "max-w-3xl mx-auto p-4",
    card: "bg-white rounded-xl shadow-lg p-6 border border-stone-200",
    header: "mb-6 text-center",
    title: "text-2xl font-bold text-black mb-2",
    subtitle: "text-stone-600",
    paymentBrick: "min-h-[400px]",
    footer: "mt-6 text-center border-t border-stone-200 pt-4",
    backLinkButton: "text-gold-600 hover:text-gold-700 font-medium transition-colors",
    
    // Loading state
    loadingCard: "bg-white rounded-xl shadow-lg p-12 text-center border border-stone-200",
    spinner: "animate-spin inline-block w-12 h-12 border-4 border-gold-200 border-t-gold-600 rounded-full mb-4",
    
    // Error state
    errorCard: "bg-red-50 rounded-xl shadow-lg p-8 text-center border-2 border-red-200",
    errorIcon: "text-6xl mb-4",
    errorTitle: "text-xl font-bold text-red-800 mb-2",
    errorText: "text-red-700 mb-4",
    errorHint: "text-sm text-red-600",
    link: "text-blue-600 hover:text-blue-700 underline font-medium",
    backButton: "mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium",
};
