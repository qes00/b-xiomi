import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';

export const NotFoundPage: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* Animated 404 */}
                <div className={styles.errorCode}>
                    <span className="animate-float inline-block">4</span>
                    <span className="animate-float inline-block" style={{ animationDelay: '0.2s' }}>0</span>
                    <span className="animate-float inline-block" style={{ animationDelay: '0.4s' }}>4</span>
                </div>

                <h1 className={styles.title}>¡Oops! Página no encontrada</h1>
                <p className={styles.description}>
                    Parece que esta página se perdió en el camino. No te preocupes, puedes volver al inicio o explorar nuestra tienda.
                </p>

                <div className={styles.actions}>
                    <Link to="/">
                        <Button className="px-8 py-3">Volver al Inicio</Button>
                    </Link>
                    <Link to="/shop">
                        <button className={styles.secondaryButton}>
                            Explorar Tienda →
                        </button>
                    </Link>
                </div>

                {/* Decorative Elements */}
                <div className={styles.decoration}>
                    <span className="text-6xl animate-bounce" style={{ animationDelay: '0s' }}>🛍️</span>
                    <span className="text-4xl animate-bounce" style={{ animationDelay: '0.3s' }}>✨</span>
                    <span className="text-5xl animate-bounce" style={{ animationDelay: '0.6s' }}>🏷️</span>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: "min-h-[70vh] flex items-center justify-center px-4 bg-gradient-to-b from-bone to-white",
    content: "max-w-lg text-center",
    errorCode: "text-9xl font-black text-gradient mb-8 tracking-tight",
    title: "text-3xl font-bold text-black mb-4",
    description: "text-stone-600 mb-8 leading-relaxed",
    actions: "flex flex-col sm:flex-row gap-4 justify-center mb-12",
    secondaryButton: "px-8 py-3 bg-stone-100 text-black font-bold rounded-lg hover:bg-stone-200 transition-colors",
    decoration: "flex justify-center gap-6 opacity-50"
};

export default NotFoundPage;
