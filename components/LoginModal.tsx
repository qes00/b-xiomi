import React, { useState } from 'react';
import { Button } from './Button';
import { useAuthStore } from '../stores/authStore';
import { useToast } from './Toast';
import { PrivacyNoticeModal } from './PrivacyNoticeModal';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (email: string, password: string) => void;
    onForgotPassword: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, onForgotPassword }) => {
    const signUp = useAuthStore(state => state.signUp);
    const { showToast } = useToast();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
    const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'register') {
            if (password !== confirmPassword) {
                showToast('error', 'Las contraseñas no coinciden');
                return;
            }
            if (password.length < 8) {
                showToast('error', 'La contraseña debe tener al menos 8 caracteres');
                return;
            }
            if (!firstName || !lastName) {
                showToast('error', 'Por favor ingresa tu nombre completo');
                return;
            }
            if (!acceptedPrivacy) {
                showToast('error', 'Debes aceptar el Aviso de Privacidad para continuar');
                return;
            }
            
            setIsLoading(true);
            const result = await signUp(email, password, firstName, lastName);
            setIsLoading(false);
            
            if (result.success) {
                showToast('success', '¡Registro exitoso! Bienvenido');
                onClose();
                // Reset form
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setFirstName('');
                setLastName('');
                setAcceptedPrivacy(false);
            } else {
                showToast('error', result.error || 'Error al registrar');
            }
            return;
        }

        onLogin(email, password);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {mode === 'register' && (
                        <>
                            <div>
                                <label className={styles.label}>Nombres *</label>
                                <input
                                    type="text"
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className={styles.input}
                                    placeholder="Ej: Juan"
                                />
                            </div>
                            <div>
                                <label className={styles.label}>Apellidos *</label>
                                <input
                                    type="text"
                                    required
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className={styles.input}
                                    placeholder="Ej: Pérez"
                                />
                            </div>
                        </>
                    )}
                    
                    <div>
                        <label className={styles.label}>Correo Electrónico</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            placeholder="tu@email.com"
                        />
                    </div>

                    <div>
                        <label className={styles.label}>Contraseña</label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            placeholder="Mínimo 8 caracteres"
                        />
                    </div>

                    {mode === 'register' && (
                        <div>
                            <label className={styles.label}>Confirmar Contraseña</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={styles.input}
                                placeholder="Repite tu contraseña"
                            />
                        </div>
                    )}

                    {mode === 'register' && (
                        <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
                            <input 
                                type="checkbox" 
                                id="privacy-consent"
                                checked={acceptedPrivacy}
                                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                                className="mt-0.5 w-4 h-4 text-gold-600 border-stone-300 rounded focus:ring-gold-500"
                                required
                            />
                            <label htmlFor="privacy-consent" className={styles.label + " mb-0"}>
                                He leído y acepto el{' '}
                                <button 
                                    type="button"
                                    onClick={() => setShowPrivacyNotice(true)}
                                    className="text-gold-600 hover:text-gold-700 underline font-bold transition-colors"
                                >
                                    Aviso de Privacidad
                                </button>
                                {' '}y autorizo el tratamiento de mis datos personales *
                            </label>
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Procesando...' : mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
                    </Button>

                    {mode === 'login' && (
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onForgotPassword();
                                }}
                                className={styles.forgotPasswordButton}
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                    )}

                    <div className={styles.footer}>
                        <button
                            type="button"
                            onClick={() => {
                                setMode(mode === 'login' ? 'register' : 'login');
                                setPassword('');
                                setConfirmPassword('');
                                setFirstName('');
                                setLastName('');
                                setAcceptedPrivacy(false);
                            }}
                            className={styles.switchButton}
                        >
                            {mode === 'login'
                                ? '¿No tienes cuenta? Regístrate'
                                : '¿Ya tienes cuenta? Inicia sesión'}
                        </button>
                    </div>
                </form>
            </div>
            
            <PrivacyNoticeModal 
                isOpen={showPrivacyNotice} 
                onClose={() => setShowPrivacyNotice(false)} 
            />
        </div>
    );
};

const styles = {
    overlay: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4",
    modal: "bg-white rounded-xl shadow-2xl max-w-md w-full animate-fade-in-up",
    header: "flex items-center justify-between p-6 border-b border-stone-200",
    title: "text-2xl font-bold text-black",
    closeButton: "text-stone-400 hover:text-black transition-colors p-1",
    form: "p-6 space-y-4",
    label: "block text-sm font-bold text-stone-900 mb-1",
    input: "w-full px-4 py-2 border border-stone-300 rounded-lg bg-white text-black font-medium focus:ring-2 focus:ring-gold-500 outline-none",
    forgotPasswordButton: "text-sm text-stone-600 hover:text-gold-700 font-medium transition-colors underline",
    footer: "text-center pt-4 border-t border-stone-200",
    switchButton: "text-sm text-gold-700 hover:text-gold-900 font-bold transition-colors"
};
