import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { formatCurrency } from '../constants';
import { getOrdersByUser } from '../services/orderService';

interface MyOrdersProps {
    userId: string;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: string; description: string }> = {
    pending: { label: 'Pendiente', color: 'bg-yellow-500', icon: '⏳', description: 'Tu pedido está siendo revisado' },
    confirmed: { label: 'Confirmado', color: 'bg-blue-500', icon: '✓', description: 'Pago verificado, pronto prepararemos tu pedido' },
    processing: { label: 'Preparando', color: 'bg-purple-500', icon: '📦', description: 'Estamos empacando tu pedido' },
    shipped: { label: 'Enviado', color: 'bg-indigo-500', icon: '🚚', description: 'Tu pedido está en camino' },
    delivered: { label: 'Entregado', color: 'bg-green-500', icon: '✅', description: '¡Pedido entregado!' },
    cancelled: { label: 'Cancelado', color: 'bg-red-500', icon: '❌', description: 'Este pedido fue cancelado' }
};

const ORDER_STEPS: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export const MyOrders: React.FC<MyOrdersProps> = ({ userId }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const data = await getOrdersByUser(userId);
                setOrders(data);
            } catch (error) {
                console.error('Error cargando pedidos:', error);
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, [userId]);

    const getStepIndex = (status: OrderStatus) => {
        if (status === 'cancelled') return -1;
        return ORDER_STEPS.indexOf(status);
    };

    if (loading) {
        return (
            <div className="text-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-stone-600">Cargando pedidos...</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-6xl mb-4">📦</p>
                <h3 className="text-xl font-bold text-black mb-2">No tienes pedidos aún</h3>
                <p className="text-stone-500">Cuando realices una compra, podrás rastrear tus pedidos aquí</p>
            </div>
        );
    }


    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black">Mis Pedidos</h2>

            {orders.map(order => {
                const isExpanded = expandedOrder === order.id;
                const currentStep = getStepIndex(order.status);

                return (
                    <div key={order.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                        {/* Order Header */}
                        <div
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors"
                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    {order.items.slice(0, 3).map((item, idx) => (
                                        <img key={idx} src={item.productImage} alt="" className="w-12 h-12 rounded-lg border-2 border-white object-cover" />
                                    ))}
                                </div>
                                <div>
                                    <p className="font-bold text-black">{order.id}</p>
                                    <p className="text-sm text-stone-500">{order.createdAt.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${STATUS_CONFIG[order.status].color}`}>
                                    {STATUS_CONFIG[order.status].icon} {STATUS_CONFIG[order.status].label}
                                </span>
                                <span className="font-bold text-gold-600">{formatCurrency(order.total)}</span>
                                <svg className={`w-5 h-5 text-stone-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                            <div className="border-t border-stone-200 p-6 space-y-6 bg-stone-50">
                                {/* Progress Timeline */}
                                {order.status !== 'cancelled' && (
                                    <div className="bg-white rounded-xl p-6 border border-stone-200">
                                        <h4 className="font-bold text-black mb-4">Estado del Envío</h4>
                                        <div className="flex items-center justify-between">
                                            {ORDER_STEPS.map((step, idx) => (
                                                <React.Fragment key={step}>
                                                    <div className="flex flex-col items-center">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${idx <= currentStep
                                                                ? STATUS_CONFIG[step].color + ' text-white'
                                                                : 'bg-stone-200 text-stone-400'
                                                            }`}>
                                                            {STATUS_CONFIG[step].icon}
                                                        </div>
                                                        <span className={`text-xs mt-2 font-medium ${idx <= currentStep ? 'text-black' : 'text-stone-400'}`}>
                                                            {STATUS_CONFIG[step].label}
                                                        </span>
                                                    </div>
                                                    {idx < ORDER_STEPS.length - 1 && (
                                                        <div className={`flex-1 h-1 mx-2 rounded ${idx < currentStep ? 'bg-green-500' : 'bg-stone-200'}`} />
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                        <p className="text-center text-stone-600 mt-4 text-sm">{STATUS_CONFIG[order.status].description}</p>
                                    </div>
                                )}

                                {/* Products */}
                                <div className="bg-white rounded-xl p-6 border border-stone-200">
                                    <h4 className="font-bold text-black mb-4">Productos</h4>
                                    <div className="space-y-3">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4">
                                                <img src={item.productImage} alt="" className="w-16 h-16 rounded-lg object-cover" />
                                                <div className="flex-1">
                                                    <p className="font-bold text-black">{item.productName}</p>
                                                    <p className="text-sm text-stone-500">Cantidad: {item.quantity}</p>
                                                </div>
                                                <p className="font-bold text-gold-600">{formatCurrency(item.price * item.quantity)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Details */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-white rounded-xl p-4 border border-stone-200">
                                        <h4 className="font-bold text-black mb-2">Dirección de Envío</h4>
                                        <p className="text-sm text-stone-700">{order.shippingAddress.address}</p>
                                        <p className="text-sm text-stone-500">{order.shippingAddress.district}, {order.shippingAddress.city}</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-stone-200">
                                        <h4 className="font-bold text-black mb-2">Resumen</h4>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between"><span className="text-stone-500">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                                            <div className="flex justify-between"><span className="text-stone-500">Envío</span><span>{order.shipping === 0 ? 'GRATIS' : formatCurrency(order.shipping)}</span></div>
                                            <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span className="text-gold-600">{formatCurrency(order.total)}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
