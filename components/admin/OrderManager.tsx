import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../types';
import { formatCurrency } from '../../constants';
import { getAllOrders, updateOrderStatus as updateOrderStatusService } from '../../services/orderService';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: string }> = {
    pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
    confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800', icon: '✓' },
    processing: { label: 'Preparando', color: 'bg-purple-100 text-purple-800', icon: '📦' },
    shipped: { label: 'Enviado', color: 'bg-indigo-100 text-indigo-800', icon: '🚚' },
    delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: '✅' },
    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: '❌' }
};

export const OrderManager: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const data = await getAllOrders();
            setOrders(data);
        } catch (error) {
            console.error('Error cargando pedidos:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(o => o.status === filterStatus);

    const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
        try {
            await updateOrderStatusService(orderId, newStatus);
            setOrders(orders.map(order =>
                order.id === orderId
                    ? { ...order, status: newStatus, updatedAt: new Date() }
                    : order
            ));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus, updatedAt: new Date() });
            }
        } catch (error) {
            console.error('Error actualizando estado:', error);
            alert('Error al actualizar el estado del pedido');
        }
    };

    const getStatusCounts = () => {
        return {
            pending: orders.filter(o => o.status === 'pending').length,
            processing: orders.filter(o => o.status === 'processing' || o.status === 'confirmed').length,
            shipped: orders.filter(o => o.status === 'shipped').length,
            delivered: orders.filter(o => o.status === 'delivered').length
        };
    };

    const counts = getStatusCounts();

    if (loading) {
        return (
            <div className="text-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-stone-600">Cargando pedidos...</p>
            </div>
        );
    }


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-black">Gestión de Pedidos</h2>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-bold">⏳ {counts.pending} Pendientes</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-sm font-bold">📦 {counts.processing} Preparando</span>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-sm font-bold">🚚 {counts.shipped} Enviados</span>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-stone-200 pb-4">
                {(['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${filterStatus === status ? 'bg-gold-500 text-black' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                    >
                        {status === 'all' ? 'Todos' : STATUS_CONFIG[status].label}
                    </button>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Orders List */}
                <div className="lg:col-span-2 space-y-4">
                    {filteredOrders.map(order => (
                        <div
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            className={`bg-white rounded-xl p-4 border-2 cursor-pointer transition-all hover:shadow-lg ${selectedOrder?.id === order.id ? 'border-gold-500 shadow-gold' : 'border-stone-200'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="font-bold text-black">{order.id}</p>
                                    <p className="text-sm text-stone-500">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_CONFIG[order.status].color}`}>
                                    {STATUS_CONFIG[order.status].icon} {STATUS_CONFIG[order.status].label}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                                {order.items.slice(0, 3).map((item, idx) => (
                                    <img key={idx} src={item.productImage} alt="" className="w-10 h-10 rounded object-cover" />
                                ))}
                                {order.items.length > 3 && (
                                    <span className="w-10 h-10 bg-stone-100 rounded flex items-center justify-center text-xs font-bold text-stone-600">
                                        +{order.items.length - 3}
                                    </span>
                                )}
                                <span className="ml-auto font-bold text-gold-600">{formatCurrency(order.total)}</span>
                            </div>

                            <div className="flex items-center justify-between text-xs text-stone-500">
                                <span>{order.createdAt.toLocaleDateString('es-PE')}</span>
                                <span>{order.items.reduce((sum, i) => sum + i.quantity, 0)} productos</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Details Panel */}
                <div className="bg-white rounded-xl border border-stone-200 p-6 h-fit sticky top-24">
                    {selectedOrder ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-black">{selectedOrder.id}</h3>
                                <button onClick={() => setSelectedOrder(null)} className="text-stone-400 hover:text-black">✕</button>
                            </div>

                            {/* Status Selector */}
                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-2">Estado del Pedido</label>
                                <select
                                    value={selectedOrder.status}
                                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)}
                                    className="w-full px-4 py-2 border border-stone-300 rounded-lg font-bold"
                                >
                                    <option value="pending">⏳ Pendiente</option>
                                    <option value="confirmed">✓ Confirmado</option>
                                    <option value="processing">📦 Preparando</option>
                                    <option value="shipped">🚚 Enviado</option>
                                    <option value="delivered">✅ Entregado</option>
                                    <option value="cancelled">❌ Cancelado</option>
                                </select>
                            </div>

                            {/* Customer Info */}
                            <div className="border-t border-stone-200 pt-4">
                                <h4 className="font-bold text-black mb-2">Cliente</h4>
                                <p className="text-sm text-stone-700">{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                                <p className="text-sm text-stone-500">{selectedOrder.shippingAddress.email}</p>
                                <p className="text-sm text-stone-500">{selectedOrder.shippingAddress.phone}</p>
                            </div>

                            {/* Shipping Address */}
                            <div className="border-t border-stone-200 pt-4">
                                <h4 className="font-bold text-black mb-2">Dirección de Envío</h4>
                                <p className="text-sm text-stone-700">{selectedOrder.shippingAddress.address}</p>
                                <p className="text-sm text-stone-500">{selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.city}</p>
                            </div>

                            {/* Products */}
                            <div className="border-t border-stone-200 pt-4">
                                <h4 className="font-bold text-black mb-2">Productos</h4>
                                <div className="space-y-2">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <img src={item.productImage} alt="" className="w-12 h-12 rounded object-cover" />
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-black">{item.productName}</p>
                                                <p className="text-xs text-stone-500">Cant: {item.quantity}</p>
                                            </div>
                                            <p className="font-bold text-gold-600">{formatCurrency(item.price * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="border-t border-stone-200 pt-4 space-y-1">
                                <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(selectedOrder.subtotal)}</span></div>
                                <div className="flex justify-between text-sm"><span>Envío</span><span>{selectedOrder.shipping === 0 ? 'GRATIS' : formatCurrency(selectedOrder.shipping)}</span></div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span className="text-gold-600">{formatCurrency(selectedOrder.total)}</span></div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-stone-500 py-10">
                            <p className="text-4xl mb-4">📋</p>
                            <p>Selecciona un pedido para ver los detalles</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
