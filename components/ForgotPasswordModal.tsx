import React, { useState } from 'react';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // TODO: Implement backend API call
        // await fetch('/api/auth/forgot-password', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ email })
        // });

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsSubmitted(true);
        }, 1000);
    };

    const handleClose = () => {
        setEmail('');
        setIsSubmitted(false);
        setIsLoading(false);
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button onClick={handleClose} className={styles.closeButton}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>

                <div className={styles.content}>
                    {!isSubmitted ? (
                        <>
                            <div className="text-center mb-6">
                                <div className={styles.iconContainer}>
                                    <svg className="w-12 h-12 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                                    </svg>
                                </div>
                                <h2 className={styles.title}>¿Olvidaste tu contraseña?</h2>
                                <p className={styles.subtitle}>
                                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <label htmlFor="email" className={styles.label}>Correo electrónico</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="tu@email.com"
                                        className={styles.input}
                                        disabled={isLoading}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={styles.submitButton}
                                >
                                    {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <div className="text-center">
                                <div className={styles.successIcon}>
                                    <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <h2 className={styles.title}>¡Correo enviado!</h2>
                                <p className={styles.subtitle}>
                                    Si existe una cuenta asociada a <strong>{email}</strong>, recibirás un correo con instrucciones para restablecer tu contraseña.
                                </p>
                                <p className="text-sm text-stone-500 mt-4">
                                    El enlace expirará en 30 minutos por seguridad.
                                </p>
                                <button onClick={handleClose} className={styles.closeButtonBottom}>
                                    Cerrar
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4",
    modal: "bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative",
    closeButton: "absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors",
    content: "mt-4",
    iconContainer: "flex justify-center mb-4",
    successIcon: "flex justify-center mb-6",
    title: "text-2xl font-bold text-black mb-2",
    subtitle: "text-stone-600 text-sm leading-relaxed",
    label: "block text-sm font-bold text-stone-900 mb-2",
    input: "w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-colors disabled:bg-stone-100",
    submitButton: "w-full bg-gold-500 hover:bg-gold-600 disabled:bg-stone-300 text-black font-bold py-3 px-6 rounded-lg transition-colors",
    closeButtonBottom: "mt-6 w-full bg-stone-100 hover:bg-stone-200 text-black font-bold py-3 px-6 rounded-lg transition-colors"
};
