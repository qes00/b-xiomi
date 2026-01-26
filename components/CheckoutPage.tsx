import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem, UserData, Order, OrderStatus } from '../types';
import { formatCurrency } from '../constants';
import { Button } from './Button';
import { useToast } from './Toast';
import { createOrder } from '../services/orderService';
import { processPayment, PaymentRequest } from '../services/paymentGatewayMock';
import { useAuthStore } from '../stores/authStore';
import { MercadoPagoPayment } from './MercadoPagoPayment';



interface CheckoutPageProps {
    cart: CartItem[];
    onClearCart: () => void;
    isAuthenticated?: boolean;
    onShowLogin?: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
    cart,
    onClearCart,
    isAuthenticated = true,
    onShowLogin
}) => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const authUser = useAuthStore(state => state.user);
    
    // Datos del usuario desde authStore en lugar de mock
    const userData: UserData = authUser ? {
        id: authUser.id,
        email: authUser.email,
        firstName: authUser.firstName,
        lastName: authUser.lastName,
        phone: authUser.phone || '',
        address: '',
        district: '',
        city: 'Lima'
    } : {
        id: '',
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        district: '',
        city: ''
    };
    const [step, setStep] = useState<'info' | 'payment' | 'processing' | 'success'>('info');
    const [isLoading, setIsLoading] = useState(false);
    const hasShownToast = React.useRef(false); // Bandera para evitar bucle de toast

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        district: '',
        city: '',
        notes: ''
    });

    // Auto-fill form data when user is authenticated
    useEffect(() => {
        if (isAuthenticated && userData && !hasShownToast.current) {
            setFormData({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                phone: userData.phone || '',
                address: userData.address || '',
                district: userData.district || '',
                city: userData.city || '',
                notes: ''
            });
            showToast('info', 'Datos autocompletados desde tu perfil');
            hasShownToast.current = true; // Marcar como mostrado
        }
    }, [isAuthenticated, userData, showToast]);

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shipping = subtotal > 150 ? 0 : 15;
    const total = subtotal + shipping;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmitInfo = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address) {
            showToast('error', 'Por favor completa todos los campos obligatorios');
            return;
        }
        setStep('payment');
        showToast('success', 'Datos guardados correctamente');
    };

    const [orderId, setOrderId] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>('mercadopago');
    const [useMercadoPago, setUseMercadoPago] = useState(true); // Toggle entre MP y mock

    const handlePayment = async () => {
        setStep('processing');
        setIsLoading(true);

        try {
            // 🔧 MODO TEST: Usando PaymentGatewayMock
            // En producción, reemplazar con integración real (Culqi, MercadoPago, etc.)
            
            const paymentRequest: PaymentRequest = {
                amount: total,
                currency: 'PEN',
                method: {
                    type: paymentMethod as any,
                    metadata: {
                        // En producción, aquí irían los datos reales de la tarjeta/método
                    }
                },
                orderId: `ORDER-${Date.now()}`,
                customerEmail: formData.email,
            };

            const paymentResult = await processPayment(paymentRequest);

            if (!paymentResult.success) {
                throw new Error(paymentResult.message || 'El pago fue rechazado');
            }

            // Crear el pedido en Supabase con el estado "confirmed" ya que el pago fue exitoso
            const orderData = {
                userId: userData?.id || '',
                items: cart.map(item => ({
                    productId: item.product.id,
                    productName: item.product.name,
                    productImage: item.product.imageUrl,
                    price: item.product.price,
                    quantity: item.quantity,
                })),
                subtotal,
                shipping,
                total,
                status: 'confirmed' as OrderStatus, // Pago confirmado
                shippingAddress: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    district: formData.district,
                    city: formData.city,
                },
                paymentMethod: paymentMethod,
                notes: formData.notes 
                    ? `${formData.notes} | Transacción: ${paymentResult.transactionId} | Auth: ${paymentResult.metadata?.authCode || 'N/A'}` 
                    : `Transacción: ${paymentResult.transactionId} | Auth: ${paymentResult.metadata?.authCode || 'N/A'}`,
            };

            const createdOrder = await createOrder(orderData);
            
            if (createdOrder) {
                setOrderId(createdOrder.id);
                console.log('✅ Pedido creado:', createdOrder.id);
                console.log('💳 Transacción:', paymentResult.transactionId);
                console.log('🔐 Auth Code:', paymentResult.metadata?.authCode);
                console.log('💰 Fee:', paymentResult.metadata?.fee);
            }

            showToast('success', `¡Pago completado! ID: ${paymentResult.transactionId}`);
            setStep('success');
            onClearCart();
        } catch (error) {
            console.error('❌ Error en el proceso de pago:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error al procesar el pago';
            showToast('error', errorMessage);
            setStep('payment');
        } finally {
            setIsLoading(false);
        }
    };

    // Handler para pago exitoso con Mercado Pago
    const handleMercadoPagoSuccess = async (paymentId: string) => {
        console.log('✅ Pago exitoso con Mercado Pago:', paymentId);
        setStep('processing');
        setIsLoading(true);

        try {
            // Crear el pedido en Supabase - estructura igual que handlePayment
            const orderData = {
                userId: userData?.id || '',
                items: cart.map(item => ({
                    productId: item.product.id,
                    productName: item.product.name,
                    productImage: item.product.imageUrl,
                    price: item.product.price,
                    quantity: item.quantity,
                })),
                subtotal,
                shipping,
                total,
                status: 'confirmed' as OrderStatus, // Pago confirmado por Mercado Pago
                shippingAddress: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    district: formData.district,
                    city: formData.city,
                },
                paymentMethod: 'Mercado Pago',
                notes: formData.notes 
                    ? `${formData.notes} | Mercado Pago ID: ${paymentId}` 
                    : `Mercado Pago ID: ${paymentId}`,
            };

            const createdOrder = await createOrder(orderData);
            
            if (createdOrder) {
                setOrderId(createdOrder.id);
                console.log('✅ Pedido creado:', createdOrder.id);
                console.log('💳 Mercado Pago Payment ID:', paymentId);
            }
            
            showToast('success', '¡Pago confirmado! Tu pedido ha sido recibido');
            setStep('success');
            onClearCart();
        } catch (error) {
            console.error('Error creando orden:', error);
            showToast('error', 'Error al procesar el pedido');
            setStep('payment');
        } finally {
            setIsLoading(false);
        }
    };

    // Handler para error de pago con Mercado Pago
    const handleMercadoPagoError = (error: string) => {
        console.error('❌ Error en pago Mercado Pago:', error);
        showToast('error', `Error en el pago: ${error}`);
        setStep('payment');
    };




    // Show login prompt if not authenticated
    if (!isAuthenticated && cart.length > 0) {
        return (
            <div className={styles.authRequired}>
                <div className="text-7xl mb-6">🔐</div>
                <h2 className="text-2xl font-bold text-black mb-4">Inicia sesión para continuar</h2>
                <p className="text-stone-600 mb-6 max-w-md">
                    Para realizar tu compra necesitas una cuenta. Así podremos guardar tus datos de envío y rastrear tus pedidos.
                </p>
                <div className="flex gap-4 flex-wrap justify-center">
                    <Button onClick={onShowLogin}>Iniciar Sesión</Button>
                    <button onClick={() => navigate('/shop')} className="px-6 py-3 bg-stone-100 text-stone-700 font-bold rounded-lg hover:bg-stone-200 transition-colors">
                        Seguir Comprando
                    </button>
                </div>
                <div className="mt-8 p-4 bg-gold-50 border border-gold-200 rounded-xl max-w-md">
                    <p className="text-sm text-stone-700">
                        <strong>¿No tienes cuenta?</strong> Regístrate gratis y obtén envío gratis en tu primera compra.
                    </p>
                </div>
            </div>
        );
    }

    if (cart.length === 0 && step !== 'success') {
        return (
            <div className={styles.emptyState}>
                <div className="text-6xl mb-4">🛒</div>
                <h2 className="text-2xl font-bold text-black mb-2">Tu carrito está vacío</h2>
                <p className="text-stone-600 mb-6">Agrega productos para continuar con la compra</p>
                <Button onClick={() => navigate('/shop')}>Ir a la Tienda</Button>
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className={styles.successState}>
                <div className="text-8xl mb-6 animate-bounce">🎉</div>
                <h1 className="text-3xl font-bold text-black mb-4">¡Pedido Confirmado!</h1>
                <p className="text-stone-600 mb-2">Gracias por tu compra, {formData.firstName}</p>
                <p className="text-stone-500 mb-8">Te enviaremos un correo de confirmación a <strong>{formData.email}</strong></p>

                <div className="bg-gold-50 border border-gold-200 rounded-xl p-6 mb-8 text-left max-w-md">
                    <p className="text-sm text-stone-600 mb-1">Número de orden:</p>
                    <p className="text-xl font-bold text-black mb-4">#{orderId || Date.now().toString().slice(-8)}</p>
                    <p className="text-sm text-stone-600 mb-1">Total pagado:</p>
                    <p className="text-2xl font-bold text-gold-600">{formatCurrency(total)}</p>
                </div>

                <div className="flex gap-4 flex-wrap justify-center">
                    <Button onClick={() => navigate('/user/orders')}>Ver Mis Pedidos</Button>
                    <button onClick={() => navigate('/')} className="px-6 py-3 bg-stone-100 text-stone-700 font-bold rounded-lg hover:bg-stone-200 transition-colors">
                        Volver al Inicio
                    </button>
                </div>
            </div>

        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Finalizar Compra</h1>

            {/* Progress Steps */}
            <div className={styles.progress}>
                <div className={`${styles.progressStep} ${step === 'info' || step === 'payment' || step === 'processing' ? styles.progressActive : ''}`}>
                    <span className={styles.progressNumber}>1</span>
                    <span>Datos de Envío</span>
                </div>
                <div className={styles.progressLine} />
                <div className={`${styles.progressStep} ${step === 'payment' || step === 'processing' ? styles.progressActive : ''}`}>
                    <span className={styles.progressNumber}>2</span>
                    <span>Pago</span>
                </div>
                <div className={styles.progressLine} />
                <div className={`${styles.progressStep} ${step === 'processing' ? styles.progressActive : ''}`}>
                    <span className={styles.progressNumber}>3</span>
                    <span>Confirmación</span>
                </div>
            </div>

            <div className={styles.grid}>
                {/* Left Column - Form */}
                <div className={styles.formSection}>
                    {step === 'info' && (
                        <form onSubmit={handleSubmitInfo} className="space-y-6">
                            <h2 className={styles.sectionTitle}>📍 Datos de Envío</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={styles.label}>Nombres *</label>
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className={styles.input} required />
                                </div>
                                <div>
                                    <label className={styles.label}>Apellidos *</label>
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className={styles.input} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={styles.label}>Email *</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={styles.input} required />
                                </div>
                                <div>
                                    <label className={styles.label}>Teléfono *</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={styles.input} placeholder="+51" required />
                                </div>
                            </div>

                            <div>
                                <label className={styles.label}>Dirección *</label>
                                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className={styles.input} placeholder="Calle, número, referencia" required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={styles.label}>Distrito</label>
                                    <input type="text" name="district" value={formData.district} onChange={handleInputChange} className={styles.input} />
                                </div>
                                <div>
                                    <label className={styles.label}>Ciudad</label>
                                    <select name="city" value={formData.city} onChange={handleInputChange} className={styles.input}>
                                        <option value="">Seleccionar</option>
                                        <option value="Lima">Lima</option>
                                        <option value="Arequipa">Arequipa</option>
                                        <option value="Trujillo">Trujillo</option>
                                        <option value="Cusco">Cusco</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className={styles.label}>Notas adicionales</label>
                                <textarea name="notes" value={formData.notes} onChange={handleInputChange} className={styles.input} rows={3} placeholder="Instrucciones para la entrega..." />
                            </div>

                            <Button type="submit" className="w-full py-4 text-lg">Continuar al Pago →</Button>
                        </form>
                    )}

                    {step === 'payment' && (
                        <div className="space-y-6">
                            <h2 className={styles.sectionTitle}>💳 Método de Pago</h2>

                            <div className={styles.paymentMethods}>
                                <label className={styles.paymentOption}>
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        value="card" 
                                        checked={paymentMethod === 'card'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-5 h-5 text-gold-600" 
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-black">Tarjeta de Crédito/Débito</p>
                                        <p className="text-sm text-stone-500">Visa, Mastercard, American Express</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-2xl">💳</span>
                                    </div>
                                </label>

                                <label className={styles.paymentOption}>
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        value="yape" 
                                        checked={paymentMethod === 'yape'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-5 h-5 text-gold-600" 
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-black">Yape / Plin</p>
                                        <p className="text-sm text-stone-500">Pago instantáneo desde tu app</p>
                                    </div>
                                    <span className="text-2xl">📱</span>
                                </label>

                                <label className={styles.paymentOption}>
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        value="transfer" 
                                        checked={paymentMethod === 'transfer'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-5 h-5 text-gold-600" 
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-black">Transferencia Bancaria</p>
                                        <p className="text-sm text-stone-500">BCP, Interbank, BBVA, Scotiabank</p>
                                    </div>
                                    <span className="text-2xl">🏦</span>
                                </label>
                            </div>


                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                                <span className="text-2xl">🔒</span>
                                <div>
                                    <p className="font-bold text-blue-800">Pago 100% Seguro</p>
                                    <p className="text-sm text-blue-600">Tus datos están protegidos con encriptación SSL</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setStep('info')} className={styles.backButton}>← Volver</button>
                                <Button onClick={handlePayment} className="flex-1 py-4 text-lg">Pagar {formatCurrency(total)}</Button>
                            </div>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                            <h2 className="text-2xl font-bold text-black mb-2">Procesando tu pago...</h2>
                            <p className="text-stone-600">Por favor no cierres esta ventana</p>
                        </div>
                    )}
                </div>

                {/* Right Column - Order Summary */}
                <div className={styles.summarySection}>
                    <h2 className={styles.sectionTitle}>🛒 Resumen del Pedido</h2>

                    <div className="space-y-4 mb-6">
                        {cart.map(item => (
                            <div key={item.product.id} className={styles.cartItem}>
                                <img src={item.product.imageUrl} alt={item.product.name} className={styles.cartItemImage} />
                                <div className="flex-1">
                                    <p className="font-bold text-black line-clamp-1">{item.product.name}</p>
                                    <p className="text-sm text-stone-500">Cantidad: {item.quantity}</p>
                                </div>
                                <p className="font-bold text-gold-600">{formatCurrency(item.product.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>

                    <div className={styles.summaryRows}>
                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Envío</span>
                            <span>{shipping === 0 ? <span className="text-green-600 font-bold">GRATIS</span> : formatCurrency(shipping)}</span>
                        </div>
                        {shipping > 0 && (
                            <p className="text-xs text-stone-500 mt-1">Envío gratis en compras mayores a S/ 150</p>
                        )}
                        <div className={styles.summaryTotal}>
                            <span>Total</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: "max-w-6xl mx-auto px-4 py-10",
    title: "text-3xl font-bold text-black mb-8",

    progress: "flex items-center justify-center gap-4 mb-10",
    progressStep: "flex items-center gap-2 text-stone-400 font-medium",
    progressActive: "text-gold-600",
    progressNumber: "w-8 h-8 rounded-full bg-current text-white flex items-center justify-center text-sm font-bold",
    progressLine: "w-16 h-0.5 bg-stone-200",

    grid: "grid lg:grid-cols-3 gap-8",
    formSection: "lg:col-span-2 bg-white rounded-2xl p-8 border border-stone-200 shadow-sm",
    summarySection: "bg-white rounded-2xl p-6 border border-stone-200 shadow-sm h-fit sticky top-24",

    sectionTitle: "text-xl font-bold text-black mb-6",
    label: "block text-sm font-bold text-stone-700 mb-1",
    input: "w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none text-black",

    paymentMethods: "space-y-3",
    paymentOption: "flex items-center gap-4 p-4 border-2 border-stone-200 rounded-xl cursor-pointer hover:border-gold-500 transition-colors has-[:checked]:border-gold-500 has-[:checked]:bg-gold-50",
    backButton: "px-6 py-4 bg-stone-100 text-stone-700 font-bold rounded-lg hover:bg-stone-200 transition-colors",

    cartItem: "flex items-center gap-4",
    cartItemImage: "w-16 h-16 rounded-lg object-cover",

    summaryRows: "border-t border-stone-200 pt-4 space-y-2",
    summaryRow: "flex justify-between text-stone-600 font-medium",
    summaryTotal: "flex justify-between text-xl font-bold text-black border-t border-stone-200 pt-4 mt-4",

    emptyState: "max-w-md mx-auto text-center py-20",
    successState: "max-w-lg mx-auto text-center py-16",
    authRequired: "max-w-lg mx-auto text-center py-20"
};

export default CheckoutPage;
