import React, { useState } from 'react';
import { PromotionalPopup } from '../../types';
import { Button } from '../Button';

export const PopupManager: React.FC = () => {
    const [popups, setPopups] = useState<PromotionalPopup[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        imageUrl: '',
        ctaText: '',
        ctaLink: '',
        startDate: '',
        endDate: '',
        showOnce: false,
        delaySeconds: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newPopup: PromotionalPopup = {
            id: Date.now().toString(),
            title: formData.title,
            message: formData.message,
            imageUrl: formData.imageUrl || undefined,
            ctaText: formData.ctaText || undefined,
            ctaLink: formData.ctaLink || undefined,
            startDate: new Date(formData.startDate),
            endDate: new Date(formData.endDate),
            displayRules: {
                showOnce: formData.showOnce,
                delaySeconds: formData.delaySeconds || 0,
            },
            isActive: true,
            createdAt: new Date(),
        };

        setPopups([...popups, newPopup]);
        setIsAdding(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            title: '',
            message: '',
            imageUrl: '',
            ctaText: '',
            ctaLink: '',
            startDate: '',
            endDate: '',
            showOnce: false,
            delaySeconds: 0,
        });
    };

    const deletePopup = (id: string) => {
        if (confirm('¿Seguro que quieres eliminar este popup?')) {
            setPopups(popups.filter(p => p.id !== id));
        }
    };

    const togglePopup = (id: string) => {
        setPopups(popups.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
    };

    const isCurrentlyActive = (popup: PromotionalPopup) => {
        const now = new Date();
        return popup.isActive && now >= popup.startDate && now <= popup.endDate;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-black">Popups Promocionales</h2>
                <Button onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? 'Cancelar' : '+ Nuevo Popup'}
                </Button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border-2 border-gold-500 space-y-4">
                    <div className="space-y-4">
                        <div>
                            <label className={styles.label}>Título del Popup</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="¡Gran Descuento de Verano!"
                                required
                                className={styles.input}
                            />
                        </div>

                        <div>
                            <label className={styles.label}>Mensaje</label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Obtén hasta 50% de descuento en productos seleccionados..."
                                required
                                rows={3}
                                className={styles.input}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className={styles.label}>URL de Imagen (Opcional)</label>
                                <input
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    placeholder="https://..."
                                    className={styles.input}
                                />
                            </div>

                            <div>
                                <label className={styles.label}>Texto del Botón (Opcional)</label>
                                <input
                                    type="text"
                                    value={formData.ctaText}
                                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                                    placeholder="Ver Ofertas"
                                    className={styles.input}
                                />
                            </div>

                            <div>
                                <label className={styles.label}>Enlace del Botón (Opcional)</label>
                                <input
                                    type="text"
                                    value={formData.ctaLink}
                                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                                    placeholder="/shop"
                                    className={styles.input}
                                />
                            </div>

                            <div>
                                <label className={styles.label}>Retraso (segundos)</label>
                                <input
                                    type="number"
                                    value={formData.delaySeconds}
                                    onChange={(e) => setFormData({ ...formData, delaySeconds: Number(e.target.value) })}
                                    min="0"
                                    className={styles.input}
                                />
                            </div>

                            <div>
                                <label className={styles.label}>Fecha de Inicio</label>
                                <input
                                    type="datetime-local"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    required
                                    className={styles.input}
                                />
                            </div>

                            <div>
                                <label className={styles.label}>Fecha de Fin</label>
                                <input
                                    type="datetime-local"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    required
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.showOnce}
                                    onChange={(e) => setFormData({ ...formData, showOnce: e.target.checked })}
                                    className="w-4 h-4 accent-gold-500"
                                />
                                <span className="text-sm font-medium text-stone-900">Mostrar solo una vez por usuario</span>
                            </label>
                        </div>
                    </div>

                    <Button type="submit" className="w-full">Crear Popup</Button>
                </form>
            )}

            <div className="grid gap-4">
                {popups.length === 0 ? (
                    <div className="text-center py-12 bg-stone-50 rounded-xl">
                        <p className="text-stone-500">No hay popups creados</p>
                    </div>
                ) : (
                    popups.map(popup => {
                        const isActive = isCurrentlyActive(popup);

                        return (
                            <div key={popup.id} className={`${styles.popupCard} ${!popup.isActive && 'opacity-50'}`}>
                                <div className="flex gap-4">
                                    {popup.imageUrl && (
                                        <img src={popup.imageUrl} alt={popup.title} className="w-32 h-32 rounded object-cover" />
                                    )}

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-bold text-black text-lg">{popup.title}</h3>
                                            {isActive && (
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold animate-pulse">
                                                    🔴 MOSTRANDO
                                                </span>
                                            )}
                                            {!popup.isActive && (
                                                <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-xs font-bold">
                                                    Pausado
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-stone-700 mb-3">{popup.message}</p>

                                        <div className="grid md:grid-cols-3 gap-2 text-sm">
                                            <div>
                                                <p className="text-stone-600">Inicia:</p>
                                                <p className="font-bold">{new Date(popup.startDate).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-stone-600">Termina:</p>
                                                <p className="font-bold">{new Date(popup.endDate).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-stone-600">Retraso:</p>
                                                <p className="font-bold">{popup.displayRules.delaySeconds || 0}s</p>
                                            </div>
                                        </div>

                                        {popup.ctaText && popup.ctaLink && (
                                            <div className="mt-2">
                                                <span className="text-xs text-stone-600">Botón: </span>
                                                <span className="text-sm font-bold text-gold-700">{popup.ctaText} → {popup.ctaLink}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => togglePopup(popup.id)}
                                            className={styles.actionButton}
                                            title={popup.isActive ? 'Pausar' : 'Activar'}
                                        >
                                            {popup.isActive ? '⏸️' : '▶️'}
                                        </button>
                                        <button
                                            onClick={() => deletePopup(popup.id)}
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
    popupCard: "bg-white p-4 rounded-xl border border-stone-200 hover:shadow-md transition-shadow",
    actionButton: "p-2 hover:bg-stone-100 rounded-lg transition-colors text-xl"
};
