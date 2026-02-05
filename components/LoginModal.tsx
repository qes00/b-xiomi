import React from 'react';
import { useAuthStore } from '../stores/authStore';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const signInWithGoogle = useAuthStore(state => state.signInWithGoogle);
    const isLoading = useAuthStore(state => state.isLoading);
    const error = useAuthStore(state => state.error);
    const clearError = useAuthStore(state => state.clearError);

    if (!isOpen) return null;

    const handleGoogleLogin = async () => {
        clearError();
        await signInWithGoogle();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Bienvenido</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div className={styles.content}>
                    <div className={styles.brandWrapper}>
                        <div className={styles.logoCircle}>
                            <svg className="w-12 h-12 text-gold-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                            </svg>
                        </div>
                        <h3 className={styles.subtitle}>Boutique Xiomi</h3>
                        <p className={styles.description}>
                            Inicia sesión para gestionar tus pedidos y acceder a beneficios exclusivos.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100 animate-shake">
                            {error}
                        </div>
                    )}

                    <button 
                        onClick={handleGoogleLogin} 
                        className={styles.googleButton}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Conectando...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                <span>Continuar con Google</span>
                            </div>
                        )}
                    </button>

                    <p className={styles.privacyNote}>
                        Al continuar, aceptas nuestros 
                        <span className="text-gold-600 font-bold ml-1 cursor-pointer hover:underline">
                            Términos y Condiciones
                        </span>.
                    </p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: "fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in",
    modal: "bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-slide-up",
    header: "flex items-center justify-between p-4 border-b border-stone-100",
    title: "text-lg font-bold text-stone-900",
    closeButton: "text-stone-400 hover:text-stone-900 transition-colors p-1",
    content: "p-8 flex flex-col items-center space-y-8",
    brandWrapper: "text-center space-y-3",
    logoCircle: "w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center shadow-inner mx-auto",
    subtitle: "text-2xl font-black text-stone-900 tracking-tight",
    description: "text-stone-500 text-sm leading-relaxed max-w-[240px] mx-auto",
    googleButton: "w-full py-4 px-6 bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-xl font-bold flex items-center justify-center transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:active:scale-100",
    privacyNote: "text-[11px] text-stone-400 text-center leading-relaxed"
};
