import React, { useState } from 'react';
import { Coupon } from '../../types';
import { Button } from '../Button';

export const CouponManager: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage' as 'percentage' | 'fixed',
        discountValue: 0,
        minPurchase: 0,
        maxDiscount: 0,
        expiresAt: '',
        usageLimit: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newCoupon: Coupon = {
            id: Date.now().toString(),
            code: formData.code.toUpperCase(),
            discountType: formData.discountType,
            discountValue: formData.discountValue,
            minPurchase: formData.minPurchase || undefined,
            maxDiscount: formData.maxDiscount || undefined,
            expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
            usageLimit: formData.usageLimit || undefined,
            usedCount: 0,
            isActive: true,
            createdAt: new Date(),
        };

        setCoupons([...coupons, newCoupon]);
        setIsAdding(false);
        setFormData({
            code: '',
            discountType: 'percentage',
            discountValue: 0,
            minPurchase: 0,
            maxDiscount: 0,
            expiresAt: '',
            usageLimit: 0,
        });
    };

    const toggleCouponStatus = (id: string) => {
        setCoupons(coupons.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
    };

    const deleteCoupon = (id: string) => {
        if (confirm('¿Seguro que quieres eliminar este cupón?')) {
            setCoupons(coupons.filter(c => c.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-black">Gestión de Cupones</h2>
                <Button onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? 'Cancelar' : '+ Nuevo Cupón'}
                </Button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border-2 border-gold-500 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className={styles.label}>Código del Cupón</label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                placeholder="VERANO2026"
                                required
                                className={styles.input}
                            />
                        </div>

                        <div>
                            <label className={styles.label}>Tipo de Descuento</label>
                            <select
                                value={formData.discountType}
                                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                                className={styles.input}
                            >
                                <option value="percentage">Porcentaje (%)</option>
                                <option value="fixed">Monto Fijo (S/)</option>
                            </select>
                        </div>

                        <div>
                            <label className={styles.label}>
                                Valor del Descuento {formData.discountType === 'percentage' ? '(%)' : '(S/)'}
                            </label>
                            <input
                                type="number"
                                value={formData.discountValue}
                                onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                                min="0"
                                step="0.01"
                                required
                                className={styles.input}
                            />
                        </div>

                        <div>
                            <label className={styles.label}>Compra Mínima (S/) - Opcional</label>
                            <input
                                type="number"
                                value={formData.minPurchase}
                                onChange={(e) => setFormData({ ...formData, minPurchase: Number(e.target.value) })}
                                min="0"
                                step="0.01"
                                className={styles.input}
                            />
                        </div>

                        {formData.discountType === 'percentage' && (
                            <div>
                                <label className={styles.label}>Descuento Máximo (S/) - Opcional</label>
                                <input
                                    type="number"
                                    value={formData.maxDiscount}
                                    onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                                    min="0"
                                    step="0.01"
                                    className={styles.input}
                                />
                            </div>
                        )}

                        <div>
                            <label className={styles.label}>Fecha de Expiración - Opcional</label>
                            <input
                                type="datetime-local"
                                value={formData.expiresAt}
                                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                className={styles.input}
                            />
                        </div>

                        <div>
                            <label className={styles.label}>Límite de Usos - Opcional</label>
                            <input
                                type="number"
                                value={formData.usageLimit}
                                onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                                min="0"
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full">Crear Cupón</Button>
                </form>
            )}

            <div className="grid gap-4">
                {coupons.length === 0 ? (
                    <div className="text-center py-12 bg-stone-50 rounded-xl">
                        <p className="text-stone-500">No hay cupones creados aún</p>
                    </div>
                ) : (
                    coupons.map(coupon => (
                        <div key={coupon.id} className={`${styles.couponCard} ${!coupon.isActive && 'opacity-50'}`}>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={styles.couponCode}>{coupon.code}</span>
                                        <span className={`${styles.badge} ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-600'}`}>
                                            {coupon.isActive ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                                        <p className="text-stone-700">
                                            <strong>Descuento:</strong> {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `S/ ${coupon.discountValue}`}
                                        </p>
                                        {coupon.minPurchase && (
                                            <p className="text-stone-700">
                                                <strong>Compra mínima:</strong> S/ {coupon.minPurchase}
                                            </p>
                                        )}
                                        {coupon.expiresAt && (
                                            <p className="text-stone-700">
                                                <strong>Expira:</strong> {new Date(coupon.expiresAt).toLocaleDateString()}
                                            </p>
                                        )}
                                        <p className="text-stone-700">
                                            <strong>Usos:</strong> {coupon.usedCount}{coupon.usageLimit && ` / ${coupon.usageLimit}`}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleCouponStatus(coupon.id)}
                                        className={styles.actionButton}
                                        title={coupon.isActive ? 'Desactivar' : 'Activar'}
                                    >
                                        {coupon.isActive ? '🔒' : '🔓'}
                                    </button>
                                    <button
                                        onClick={() => deleteCoupon(coupon.id)}
                                        className={`${styles.actionButton} hover:bg-red-50`}
                                        title="Eliminar"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const styles = {
    label: "block text-sm font-bold text-stone-900 mb-1",
    input: "w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none",
    couponCard: "bg-white p-4 rounded-xl border border-stone-200 hover:shadow-md transition-shadow",
    couponCode: "text-xl font-bold text-gold-700 bg-gold-50 px-3 py-1 rounded-lg",
    badge: "px-2 py-1 rounded text-xs font-bold",
    actionButton: "p-2 hover:bg-stone-100 rounded-lg transition-colors"
};
