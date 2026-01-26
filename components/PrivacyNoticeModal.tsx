import React from 'react';
import { Button } from './Button';

interface PrivacyNoticeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PrivacyNoticeModal: React.FC<PrivacyNoticeModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>📋 Aviso de Privacidad</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div className={styles.content}>
                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Responsable del Tratamiento</h3>
                        <p className={styles.text}>
                            <strong>ALLAHU AKBAR SHOP PERÚ</strong><br />
                            Contacto: <a href="mailto:alahuakbarperu@gmail.com" className={styles.link}>alahuakbarperu@gmail.com</a>
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Datos que Recopilamos</h3>
                        <ul className={styles.list}>
                            <li><strong>Nombres y Apellidos:</strong> Para personalizar tu experiencia y comunicaciones</li>
                            <li><strong>Correo Electrónico:</strong> Para autenticación, notificaciones de pedidos y comunicaciones</li>
                            <li><strong>Teléfono:</strong> Para coordinar entregas (opcional durante la compra)</li>
                            <li><strong>Dirección de Envío:</strong> Para procesar y entregar tus pedidos</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Finalidad del Tratamiento</h3>
                        <ul className={styles.list}>
                            <li>Crear y gestionar tu cuenta de usuario</li>
                            <li>Procesar, confirmar y entregar tus pedidos</li>
                            <li>Enviarte notificaciones sobre el estado de tus pedidos</li>
                            <li>Mejorar tu experiencia como usuario</li>
                            <li>Cumplir con nuestras obligaciones legales y tributarias</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Base Legal</h3>
                        <p className={styles.text}>
                            El tratamiento de tus datos se basa en:
                        </p>
                        <ul className={styles.list}>
                            <li><strong>Tu consentimiento expreso</strong> (Art. 5 de la Ley N° 29733 - LPDP)</li>
                            <li><strong>Ejecución del contrato</strong> de compra-venta entre tú y nosotros</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Tus Derechos (ARCO)</h3>
                        <p className={styles.text}>
                            Como titular de tus datos personales, tienes derecho a:
                        </p>
                        <ul className={styles.list}>
                            <li><strong>Acceso:</strong> Conocer qué datos tenemos sobre ti</li>
                            <li><strong>Rectificación:</strong> Corregir datos incorrectos o desactualizados</li>
                            <li><strong>Cancelación:</strong> Solicitar la eliminación de tus datos (salvo obligaciones legales)</li>
                            <li><strong>Oposición:</strong> Oponerte a ciertos tratamientos de tus datos</li>
                            <li><strong>Portabilidad:</strong> Obtener una copia de tus datos en formato estructurado</li>
                        </ul>
                        <p className={styles.text}>
                            Para ejercer estos derechos, contáctanos en: <a href="mailto:alahuakbarperu@gmail.com" className={styles.link}>alahuakbarperu@gmail.com</a>
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Seguridad de tus Datos</h3>
                        <p className={styles.text}>
                            Protegemos tus datos mediante:
                        </p>
                        <ul className={styles.list}>
                            <li>Almacenamiento en Supabase con <strong>encriptación en tránsito y en reposo</strong></li>
                            <li>Acceso restringido solo a personal autorizado</li>
                            <li>Medidas técnicas y organizativas de seguridad</li>
                            <li><strong>No compartimos</strong> tus datos con terceros sin tu consentimiento expreso</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Periodo de Conservación</h3>
                        <ul className={styles.list}>
                            <li><strong>Datos de cuenta:</strong> Mientras tu cuenta esté activa</li>
                            <li><strong>Datos de pedidos:</strong> 5 años (por obligaciones contables y tributarias)</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Actualización del Aviso</h3>
                        <p className={styles.text}>
                            Nos reservamos el derecho de actualizar este aviso. Te notificaremos de cambios significativos por correo electrónico.
                        </p>
                    </section>

                    <div className={styles.footer}>
                        <p className={styles.footerText}>
                            <strong>Última actualización:</strong> Enero 2026
                        </p>
                        <Button onClick={onClose} className="w-full">
                            He Leído y Entendido
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-y-auto",
    modal: "bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 animate-fade-in-up",
    header: "flex items-center justify-between p-6 border-b border-stone-200 sticky top-0 bg-white rounded-t-xl z-10",
    title: "text-2xl font-bold text-black",
    closeButton: "text-stone-400 hover:text-black transition-colors p-1",
    content: "p-6 space-y-6 max-h-[70vh] overflow-y-auto",
    section: "space-y-3",
    sectionTitle: "text-lg font-bold text-black flex items-center gap-2",
    text: "text-stone-700 leading-relaxed",
    list: "list-disc list-inside space-y-2 text-stone-700 pl-2",
    link: "text-gold-600 hover:text-gold-700 underline font-medium",
    footer: "border-t border-stone-200 pt-4 space-y-4",
    footerText: "text-sm text-stone-600 text-center"
};
