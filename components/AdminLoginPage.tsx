import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { useAuthStore } from '../stores/authStore';

export const AdminLoginPage: React.FC = () => {
    const navigate = useNavigate();
    const signInWithPassword = useAuthStore(state => state.signInWithPassword);
    const signOut = useAuthStore(state => state.signOut);
    const user = useAuthStore(state => state.user);
    const isLoading = useAuthStore(state => state.isLoading);
    const authError = useAuthStore(state => state.error);
    const clearError = useAuthStore(state => state.clearError);
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [logoutNotice, setLogoutNotice] = useState('');

    // Si ya está logueado, verificar rol
    React.useEffect(() => {
        if (user?.role === 'admin') {
            navigate('/admin');
        } else if (user?.role === 'customer') {
            // Usuario tiene sesión como cliente, cerrar automáticamente
            setLogoutNotice('Cerrando sesión de cliente para acceder al panel de administración...');
            signOut().then(() => {
                setTimeout(() => {
                    setLogoutNotice('');
                }, 2000);
            });
        }
    }, [user, navigate, signOut]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        clearError();

        if (!email || !password) {
            setError('Por favor ingrese email y contraseña');
            return;
        }

        const result = await signInWithPassword(email, password);
        
        if (result.success) {
            // El useEffect redirigirá si es admin
        } else {
            setError(result.error || 'Credenciales inválidas');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.iconContainer}>
                        <svg className="w-12 h-12 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                    </div>
                    <h1 className={styles.title}>Panel de Administración</h1>
                    <p className={styles.subtitle}>Acceso restringido solo para administradores</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {logoutNotice && (
                        <div className={styles.infoAlert}>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                            </svg>
                            <span>{logoutNotice}</span>
                        </div>
                    )}
                    {(error || authError) && (
                        <div className={styles.errorAlert}>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                            </svg>
                            <span>{error || authError}</span>
                        </div>
                    )}

                    <div>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            placeholder="admin@ejemplo.com"
                            disabled={isLoading}
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label className={styles.label}>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            placeholder="••••••••"
                            disabled={isLoading}
                            autoComplete="current-password"
                        />
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full py-3 text-lg"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Iniciando sesión...' : 'Ingresar'}
                    </Button>

                    <div className={styles.footer}>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className={styles.backButton}
                        >
                            ← Volver a la tienda
                        </button>
                    </div>
                </form>

                <div className={styles.securityNote}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                    </svg>
                    <span>Todos los intentos de acceso son registrados</span>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: "min-h-screen bg-gradient-to-br from-stone-100 via-gold-50 to-stone-100 flex items-center justify-center p-4",
    card: "bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-stone-200",
    header: "text-center mb-8",
    iconContainer: "mx-auto w-20 h-20 bg-gold-100 rounded-full flex items-center justify-center mb-4",
    title: "text-2xl font-bold text-black mb-2",
    subtitle: "text-sm text-stone-600 font-medium",
    form: "space-y-6",
    label: "block text-sm font-bold text-stone-900 mb-2",
    input: "w-full px-4 py-3 border border-stone-300 rounded-lg bg-white text-black font-medium focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none disabled:bg-stone-100 disabled:cursor-not-allowed transition-colors",
    infoAlert: "bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium",
    errorAlert: "bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium",
    footer: "text-center pt-4 border-t border-stone-200",
    backButton: "text-sm text-stone-600 hover:text-gold-700 font-medium transition-colors",
    securityNote: "mt-6 flex items-center justify-center gap-2 text-xs text-stone-500 font-medium"
};
