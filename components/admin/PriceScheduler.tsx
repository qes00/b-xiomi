import React, { useState, useEffect } from 'react';
import { ScheduledPrice, Product } from '../../types';
import { formatCurrency } from '../../constants';
import { Button } from '../Button';
import { getProducts } from '../../services/productService';

export const PriceScheduler: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [schedules, setSchedules] = useState<ScheduledPrice[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        productId: '',
        specialPrice: 0,
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (error) {
                console.error('Error cargando productos:', error);
            } finally {
                setLoadingProducts(false);
            }
        };
        loadProducts();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newSchedule: ScheduledPrice = {
            id: Date.now().toString(),
            productId: formData.productId,
            specialPrice: formData.specialPrice,
            startDate: new Date(formData.startDate),
            endDate: new Date(formData.endDate),
            isActive: true,
            createdAt: new Date(),
        };

        setSchedules([...schedules, newSchedule]);
        setIsAdding(false);
        setFormData({
            productId: '',
            specialPrice: 0,
            startDate: '',
            endDate: '',
        });
    };

    const deleteSchedule = (id: string) => {
        if (confirm('¿Seguro que quieres eliminar esta programación?')) {
            setSchedules(schedules.filter(s => s.id !== id));
        }
    };

    const toggleSchedule = (id: string) => {
        setSchedules(schedules.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
    };

    const getProduct = (productId: string) => {
        return products.find(p => p.id === productId);
    };

    const isCurrentlyActive = (schedule: ScheduledPrice) => {
        const now = new Date();
        return schedule.isActive && now >= schedule.startDate && now <= schedule.endDate;
    };

    const getDiscountPercentage = (originalPrice: number, specialPrice: number) => {
        return Math.round(((originalPrice - specialPrice) / originalPrice) * 100);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-black">Programación de Precios</h2>
                <Button onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? 'Cancelar' : '+ Nuevo Precio Programado'}
                </Button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border-2 border-gold-500 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className={styles.label}>Producto</label>
                            {loadingProducts ? (
                                <div className="text-stone-500">Cargando productos...</div>
                            ) : (
                                <select
                                    value={formData.productId}
                                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                    required
                                    className={styles.input}
                                >
                                    <option value="">Selecciona un producto</option>
                                    {products.map(product => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} - {formatCurrency(product.price)}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>


                        <div>
                            <label className={styles.label}>Precio Especial (S/)</label>
                            <input
                                type="number"
                                value={formData.specialPrice}
                                onChange={(e) => setFormData({ ...formData, specialPrice: Number(e.target.value) })}
                                min="0"
                                step="0.01"
                                required
                                className={styles.input}
                            />
                            {formData.productId && formData.specialPrice > 0 && (
                                <p className="text-sm text-green-600 mt-1">
                                    Descuento: {getDiscountPercentage(getProduct(formData.productId)!.price, formData.specialPrice)}%
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={styles.label}>Fecha y Hora de Inicio</label>
                            <input
                                type="datetime-local"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                required
                                className={styles.input}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={styles.label}>Fecha y Hora de Fin</label>
                            <input
                                type="datetime-local"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                required
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full">Programar Precio</Button>
                </form>
            )}

            <div className="grid gap-4">
                {schedules.length === 0 ? (
                    <div className="text-center py-12 bg-stone-50 rounded-xl">
                        <p className="text-stone-500">No hay precios programados</p>
                    </div>
                ) : (
                    schedules.map(schedule => {
                        const product = getProduct(schedule.productId);
                        if (!product) return null;

                        const isActive = isCurrentlyActive(schedule);
                        const discount = getDiscountPercentage(product.price, schedule.specialPrice);

                        return (
                            <div key={schedule.id} className={`${styles.scheduleCard} ${!schedule.isActive && 'opacity-50'}`}>
                                <div className="flex items-start gap-4">
                                    <img src={product.imageUrl} alt={product.name} className="w-20 h-20 rounded object-cover" />

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-bold text-black text-lg">{product.name}</h3>
                                            {isActive && (
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold animate-pulse">
                                                    🔴 ACTIVO AHORA
                                                </span>
                                            )}
                                            {!schedule.isActive && (
                                                <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-xs font-bold">
                                                    Pausado
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-stone-600">Precio Original:</p>
                                                <p className="text-lg font-bold text-stone-400 line-through">{formatCurrency(product.price)}</p>
                                            </div>
                                            <div>
                                                <p className="text-stone-600">Precio Especial:</p>
                                                <p className="text-lg font-bold text-gold-700">{formatCurrency(schedule.specialPrice)}</p>
                                                <span className="text-green-600 font-bold">-{discount}% OFF</span>
                                            </div>
                                            <div>
                                                <p className="text-stone-600">Inicia:</p>
                                                <p className="font-bold">{new Date(schedule.startDate).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-stone-600">Termina:</p>
                                                <p className="font-bold">{new Date(schedule.endDate).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => toggleSchedule(schedule.id)}
                                            className={styles.actionButton}
                                            title={schedule.isActive ? 'Pausar' : 'Activar'}
                                        >
                                            {schedule.isActive ? '⏸️' : '▶️'}
                                        </button>
                                        <button
                                            onClick={() => deleteSchedule(schedule.id)}
                                            className={`${styles.actionButton} hover:bg-red-50`}
                                            title="Eliminar"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

const styles = {
    label: "block text-sm font-bold text-stone-900 mb-1",
    input: "w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none",
    scheduleCard: "bg-white p-4 rounded-xl border border-stone-200 hover:shadow-md transition-shadow",
    actionButton: "p-2 hover:bg-stone-100 rounded-lg transition-colors text-xl"
};
