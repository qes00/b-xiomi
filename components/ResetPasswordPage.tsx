import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setIsLoading(true);

        // TODO: Implement backend API call
        // try {
        //   await fetch('/api/auth/reset-password', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ token, password })
        //   });
        //   setIsSuccess(true);
        // } catch (err) {
        //   setError('El enlace ha expirado o es inválido');
        // }

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true);
        }, 1000);
    };

    if (!token) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className="text-center">
                        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h1 className={styles.title}>Enlace inválido</h1>
                        <p className={styles.text}>Este enlace de recuperación no es válido o ha expirado.</p>
                        <button onClick={() => navigate('/')} className={styles.button}>
                            Volver al inicio
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className="text-center">
                        <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h1 className={styles.title}>¡Contraseña actualizada!</h1>
                        <p className={styles.text}>Tu contraseña ha sido restablecida exitosamente.</p>
                        <button onClick={() => navigate('/')} className={styles.button}>
                            Iniciar sesión
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className="text-center mb-8">
                    <svg className="w-12 h-12 text-gold-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    <h1 className={styles.title}>Restablecer contraseña</h1>
                    <p className={styles.text}>Ingresa tu nueva contraseña</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="password" className={styles.label}>Nueva contraseña</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            placeholder="Mínimo 8 caracteres"
                            className={styles.input}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="confirmPassword" className={styles.label}>Confirmar contraseña</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Repite tu contraseña"
                            className={styles.input}
                            disabled={isLoading}
                        />
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={styles.button}
                    >
                        {isLoading ? 'Guardando...' : 'Restablecer contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: "min-h-screen bg-gradient-to-br from-bone via-white to-sun flex items-center justify-center p-4",
    card: "bg-white rounded-2xl shadow-2xl max-w-md w-full p-8",
    title: "text-2xl font-bold text-black mb-2",
    text: "text-stone-600 mb-6",
    label: "block text-sm font-bold text-stone-900 mb-2",
    input: "w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-colors disabled:bg-stone-100",
    button: "w-full bg-gold-500 hover:bg-gold-600 disabled:bg-stone-300 text-black font-bold py-3 px-6 rounded-lg transition-colors"
};
