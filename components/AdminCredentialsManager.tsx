import React, { useState, useEffect } from 'react';
import {
    getAllCredentials,
    saveCredential,
    updateCredential,
    deleteCredential,
    getCredential,
    type AdminCredential,
    type AdminCredentialWithValue,
} from '../services/adminCredentialService';

export const AdminCredentialsManager: React.FC = () => {
    const [credentials, setCredentials] = useState<AdminCredential[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCredential, setEditingCredential] = useState<AdminCredential | null>(null);
    const [viewingValue, setViewingValue] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        value: '',
        type: 'api_key' as 'api_key' | 'token' | 'password' | 'other',
        description: '',
    });

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadCredentials();
    }, []);

    const loadCredentials = async () => {
        setLoading(true);
        try {
            const data = await getAllCredentials();
            setCredentials(data);
        } catch (err) {
            setError('Error al cargar credenciales');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            if (editingCredential) {
                await updateCredential(editingCredential.id, formData.value, formData.description);
                setSuccess('Credencial actualizada exitosamente');
            } else {
                await saveCredential(formData.name, formData.value, formData.type, formData.description);
                setSuccess('Credencial guardada exitosamente');
            }
            
            resetForm();
            loadCredentials();
        } catch (err: any) {
            setError(err.message || 'Error al guardar credencial');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta credencial?')) return;

        try {
            await deleteCredential(id);
            setSuccess('Credencial eliminada exitosamente');
            loadCredentials();
        } catch (err: any) {
            setError(err.message || 'Error al eliminar credencial');
        }
    };

    const handleCopyValue = async (credential: AdminCredential) => {
        try {
            const fullCredential = await getCredential(credential.name);
            if (fullCredential) {
                await navigator.clipboard.writeText(fullCredential.value);
                setCopiedId(credential.id);
                setTimeout(() => setCopiedId(null), 2000);
            }
        } catch (err) {
            setError('Error al copiar valor');
        }
    };

    const handleViewValue = async (credential: AdminCredential) => {
        try {
            const fullCredential = await getCredential(credential.name);
            if (fullCredential) {
                setViewingValue(fullCredential.value);
            }
        } catch (err) {
            setError('Error al obtener valor');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', value: '', type: 'api_key', description: '' });
        setShowAddModal(false);
        setEditingCredential(null);
        setViewingValue(null);
    };

    const openEditModal = (credential: AdminCredential) => {
        setEditingCredential(credential);
        setFormData({
            name: credential.name,
            value: '',
            type: credential.credential_type,
            description: credential.description || '',
        });
        setShowAddModal(true);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'api_key': return '🔑';
            case 'token': return '🎫';
            case 'password': return '🔒';
            default: return '📝';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'api_key': return 'API Key';
            case 'token': return 'Token';
            case 'password': return 'Contraseña';
            default: return 'Otro';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>🔐 Credenciales Encriptadas</h2>
                <button onClick={() => setShowAddModal(true)} className={styles.addButton}>
                    ➕ Agregar Credencial
                </button>
            </div>

            {error && (
                <div className={styles.alert + ' ' + styles.alertError}>
                    ⚠️ {error}
                    <button onClick={() => setError(null)} className={styles.closeAlert}>✕</button>
                </div>
            )}

            {success && (
                <div className={styles.alert + ' ' + styles.alertSuccess}>
                    ✓ {success}
                    <button onClick={() => setSuccess(null)} className={styles.closeAlert}>✕</button>
                </div>
            )}

            {loading ? (
                <div className={styles.loading}>Cargando credenciales...</div>
            ) : credentials.length === 0 ? (
                <div className={styles.empty}>
                    <p>No hay credenciales guardadas</p>
                    <p className="text-sm text-stone-500 mt-2">Agrega tu primera credencial encriptada</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {credentials.map(cred => (
                        <div key={cred.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardTitle}>
                                    <span className="text-2xl">{getTypeIcon(cred.credential_type)}</span>
                                    <div>
                                        <h3 className="font-bold text-lg">{cred.name}</h3>
                                        <span className={styles.badge}>{getTypeLabel(cred.credential_type)}</span>
                                    </div>
                                </div>
                            </div>

                            {cred.description && (
                                <p className={styles.description}>{cred.description}</p>
                            )}

                            <div className={styles.cardFooter}>
                                <button
                                    onClick={() => handleCopyValue(cred)}
                                    className={styles.actionButton + ' ' + styles.copyButton}
                                >
                                    {copiedId === cred.id ? '✓ Copiado' : '📋 Copiar'}
                                </button>
                                <button
                                    onClick={() => openEditModal(cred)}
                                    className={styles.actionButton + ' ' + styles.editButton}
                                >
                                    ✏️ Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(cred.id)}
                                    className={styles.actionButton + ' ' + styles.deleteButton}
                                >
                                    🗑️ Eliminar
                                </button>
                            </div>

                            <div className={styles.meta}>
                                <span className="text-xs">🔒 Encriptado con AES-256</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className={styles.modalOverlay} onClick={resetForm}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                {editingCredential ? '✏️ Editar Credencial' : '➕ Nueva Credencial'}
                            </h3>
                            <button onClick={resetForm} className={styles.closeButton}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Nombre *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={styles.input}
                                    placeholder="ej: MercadoPago Access Token"
                                    required
                                    disabled={!!editingCredential}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Tipo *</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    className={styles.input}
                                    disabled={!!editingCredential}
                                >
                                    <option value="api_key">🔑 API Key</option>
                                    <option value="token">🎫 Token</option>
                                    <option value="password">🔒 Contraseña</option>
                                    <option value="other">📝 Otro</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Valor * (será encriptado)</label>
                                <input
                                    type="password"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    className={styles.input}
                                    placeholder="Ingresa el valor secreto"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Descripción (opcional)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className={styles.textarea}
                                    placeholder="Descripción de la credencial"
                                    rows={3}
                                />
                            </div>

                            <div className={styles.modalFooter}>
                                <button type="button" onClick={resetForm} className={styles.cancelButton}>
                                    Cancelar
                                </button>
                                <button type="submit" className={styles.submitButton}>
                                    {editingCredential ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: "space-y-6",
    header: "flex justify-between items-center",
    title: "text-2xl font-bold text-black",
    addButton: "px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors font-bold",
    
    alert: "p-4 rounded-lg flex justify-between items-center",
    alertError: "bg-red-50 text-red-800 border border-red-200",
    alertSuccess: "bg-green-50 text-green-800 border border-green-200",
    closeAlert: "ml-4 text-xl hover:opacity-70",
    
    loading: "text-center py-12 text-stone-500",
    empty: "text-center py-12 text-stone-500",
    
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
    card: "bg-white border border-stone-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow",
    cardHeader: "flex justify-between items-start mb-3",
    cardTitle: "flex items-center gap-3",
    badge: "text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-full",
    description: "text-sm text-stone-600 mb-4",
    cardFooter: "flex gap-2 mb-2",
    actionButton: "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
    copyButton: "bg-blue-50 text-blue-700 hover:bg-blue-100",
    editButton: "bg-stone-50 text-stone-700 hover:bg-stone-100",
    deleteButton: "bg-red-50 text-red-700 hover:bg-red-100",
    meta: "text-center text-stone-400 mt-2 pt-2 border-t border-stone-100",
    
    modalOverlay: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",
    modal: "bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto",
    modalHeader: "flex justify-between items-center p-6 border-b border-stone-200",
    modalTitle: "text-xl font-bold",
    closeButton: "text-2xl text-stone-400 hover:text-stone-600",
    
    form: "p-6 space-y-4",
    formGroup: "space-y-2",
    label: "block text-sm font-bold text-stone-700",
    input: "w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent",
    textarea: "w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none",
    
    modalFooter: "flex gap-3 pt-4",
    cancelButton: "flex-1 px-4 py-2 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors font-medium",
    submitButton: "flex-1 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors font-bold",
};
