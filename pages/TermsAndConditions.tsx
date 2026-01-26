import React, { useState } from 'react';

export const TermsAndConditions: React.FC = () => {
    const [activeSection, setActiveSection] = useState('bienvenida');

    const sections = [
        { id: 'bienvenida', label: 'Bienvenida' },
        { id: 'identificacion', label: '1. Identificación del Vendedor' },
        { id: 'objeto', label: '2. Objeto' },
        { id: 'condiciones', label: '3. Condiciones de Uso y Compra' },
        { id: 'proceso', label: '4. Proceso de Compra' },
        { id: 'precios', label: '5. Precios y Modalidades de Pago' },
        { id: 'envios', label: '6. Envíos y Entregas' },
        { id: 'cambios', label: '7. Política de Cambios y Devoluciones' },
        { id: 'garantia', label: '8. Garantía de los Productos' },
        { id: 'cupones', label: '9. Cupones y Descuentos' },
        { id: 'propiedad', label: '10. Propiedad Intelectual' },
        { id: 'proteccion', label: '11. Protección de Datos Personales' },
        { id: 'atencion', label: '12. Atención al Cliente' },
        { id: 'modificacion', label: '13. Modificación de los T&C' },
        { id: 'legislacion', label: '14. Legislación Aplicable' },
        { id: 'contacto', label: 'Contacto' },
    ];

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <style>
                {`
                .sidebar-nav {
                    list-style: none;
                    padding: 0;
                    position: sticky;
                    top: 100px;
                }
                .sidebar-nav li {
                    margin-bottom: 5px;
                }
                .sidebar-nav a {
                    display: block;
                    padding: 8px 10px;
                    color: #2c3e50;
                    text-decoration: none;
                    border-left: 3px solid transparent;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .sidebar-nav a:hover {
                    background-color: #f0f0f0;
                }
                .sidebar-nav a.active {
                    border-left: 3px solid #c2ab48;
                    background-color: #f9f6e7;
                    font-weight: bold;
                }
                section {
                    margin-bottom: 40px;
                    padding: 20px;
                    background-color: #fff;
                    border-radius: 5px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                h2 {
                    color: #c2ab48;
                    margin-top: 0;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #eee;
                    font-size: 1.5rem;
                }
                .info-box {
                    background-color: #e7f4ff;
                    padding: 15px;
                    border-left: 4px solid #3498db;
                    margin-bottom: 20px;
                }
                .highlight-box {
                    background-color: #fffde7;
                    padding: 15px;
                    border-left: 4px solid #ffc107;
                    margin-bottom: 20px;
                }
                @media (max-width: 768px) {
                    .container-flex {
                        flex-direction: column;
                    }
                    .sidebar {
                        flex: 1;
                        padding-right: 0 !important;
                        margin-bottom: 20px;
                    }
                    .sidebar-nav {
                        position: static;
                    }
                }
                `}
            </style>

            <header style={{ backgroundColor: '#f8f9fa', padding: '20px', marginBottom: '30px', borderBottom: '1px solid #ddd' }}>
                <h1 style={{ color: '#2c3e50', margin: 0 }}>Términos y Condiciones - Allahu Akbar® Peru</h1>
            </header>

            <div className="container-flex" style={{ display: 'flex', flexWrap: 'wrap' }}>
                <aside className="sidebar" style={{ flex: '0 0 250px', paddingRight: '20px' }}>
                    <ul className="sidebar-nav">
                        {sections.map((section) => (
                            <li key={section.id}>
                                <a
                                    className={activeSection === section.id ? 'active' : ''}
                                    onClick={() => scrollToSection(section.id)}
                                >
                                    {section.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </aside>

                <main style={{ flex: 1 }}>
                    <section id="bienvenida">
                        <h2>Bienvenida a Allahu Akbar® Peru!</h2>
                        <div className="info-box">
                            <p>Esta sección introductoria da la bienvenida a los usuarios y establece el propósito de los Términos y Condiciones. Aquí se explica que el uso de los servicios implica la aceptación de estos términos.</p>
                        </div>
                        <p>Los presentes Términos y Condiciones (en adelante, "T&C") regulan el acceso y uso del sitio web www.allahuakbarperu.com (en adelante, el "Sitio Web"), así como la compra de productos ofrecidos en nuestra tienda física ubicada en Arequipa, Perú, y a través de nuestros canales de venta directa (por ejemplo, redes sociales, WhatsApp) (en adelante, conjuntamente, la "Tienda").</p>
                        <p>Al realizar una compra o utilizar nuestros servicios, usted (en adelante, el "Cliente" o "Usuario") declara haber leído, entendido y aceptado en su totalidad los presentes T&C.</p>
                    </section>

                    <section id="identificacion">
                        <h2>1. Identificación del Vendedor</h2>
                        <div className="info-box">
                            <p>Esta sección proporciona la información legal y de contacto de la tienda. Es fundamental para la transparencia y para que los clientes sepan con quién están tratando.</p>
                        </div>
                        <p><strong>Razón Social:</strong> Allahu Akbar® Peru</p>
                        <p><strong>RUC:</strong> [Pendiente]</p>
                        <p><strong>Domicilio Fiscal:</strong> Calle Los Arces, Arequipa, Perú</p>
                        <p><strong>Tienda Física:</strong> Calle Los Arces, Arequipa, Perú</p>
                        <p><strong>Correo Electrónico:</strong> alahuakbarperu@gmail.com</p>
                        <p><strong>Teléfono de Contacto:</strong> 123456789</p>
                    </section>

                    <section id="objeto">
                        <h2>2. Objeto</h2>
                        <div className="info-box">
                            <p>Aquí se define el propósito principal de los Términos y Condiciones: regular la relación comercial entre la tienda y sus clientes respecto a la compra de productos.</p>
                        </div>
                        <p>El objeto de los presentes T&C es regular la relación entre Allahu Akbar® Peru y el Cliente en lo referente a la adquisición de los productos de moda femenina (en adelante, los "Productos") ofrecidos por la Tienda.</p>
                    </section>

                    <section id="condiciones">
                        <h2>3. Condiciones de Uso y Compra</h2>
                        <div className="info-box">
                            <p>Este apartado detalla los requisitos para los clientes, como la mayoría de edad y la veracidad de la información, así como el compromiso de usar los servicios adecuadamente.</p>
                        </div>
                        <p><strong>Capacidad Legal</strong><br />El Cliente declara ser mayor de edad y contar con la capacidad legal necesaria para contratar y obligarse según estos T&C.</p>
                        <p><strong>Veracidad de la Información</strong><br />El Cliente se compromete a proporcionar información veraz, exacta y completa al momento de registrarse (si aplica) o realizar una compra.</p>
                        <p><strong>Uso Adecuado</strong><br />El Cliente se compromete a utilizar los servicios y Productos de la Tienda de conformidad con la ley peruana.</p>
                    </section>

                    <section id="proceso">
                        <h2>4. Proceso de Compra</h2>
                        <div className="info-box">
                            <p>Describe los pasos que sigue un cliente para adquirir un producto, desde la selección hasta la confirmación del pedido, incluyendo la gestión de la disponibilidad de stock.</p>
                        </div>
                        <p><strong>1. Selección de Productos:</strong> El Cliente podrá seleccionar los Productos de su interés disponibles en la Tienda.</p>
                        <p><strong>2. Disponibilidad:</strong> Todos los pedidos están sujetos a la disponibilidad de los Productos.</p>
                        <p><strong>3. Confirmación del Pedido:</strong> Una vez realizado el pedido y verificado el pago, Allahu Akbar® Peru enviará una confirmación al Cliente.</p>
                    </section>

                    <section id="precios">
                        <h2>5. Precios y Modalidades de Pago</h2>
                        <div className="info-box">
                            <p>Detalla cómo se establecen los precios (incluyendo IGV), el derecho a modificarlos, y las formas de pago aceptadas por la tienda, así como la emisión de comprobantes.</p>
                        </div>
                        <p><strong>Precios:</strong> Los precios de los Productos están expresados en Soles (S/) e incluyen el Impuesto General a las Ventas (IGV).</p>
                        <p><strong>Modalidades de Pago Aceptadas:</strong></p>
                        <ul>
                            <li>Efectivo (en tienda física)</li>
                            <li>Tarjetas (Visa, MasterCard, etc.)</li>
                            <li>Transferencia Bancaria</li>
                            <li>Billeteras (Yape, Plin)</li>
                        </ul>
                    </section>

                    <section id="envios">
                        <h2>6. Envíos y Entregas</h2>
                        <div className="info-box">
                            <p>Explica la política de envíos: cobertura, costos, plazos estimados de entrega, responsabilidad sobre la dirección y el proceso de recepción del pedido.</p>
                        </div>
                        <p><strong>Cobertura:</strong> Realizamos envíos principalmente dentro de la ciudad de Arequipa. Para envíos a otras provincias, por favor consultar.</p>
                        <p><strong>Plazos de Entrega:</strong> Arequipa Ciudad: 1-3 días hábiles una vez confirmado el pago.</p>
                    </section>

                    <section id="cambios">
                        <h2>7. Política de Cambios y Devoluciones</h2>
                        <div className="info-box">
                            <p>Una sección crucial que detalla las condiciones para cambios de productos y devoluciones (solo por falla de fábrica).</p>
                        </div>
                        <div className="highlight-box">
                            <p><strong>Cambios:</strong> Se aceptan cambios de Productos por talla o por otro modelo dentro de los 7 días calendario siguientes a la fecha de compra.</p>
                            <p><strong>Devoluciones:</strong> Solo se aceptarán devoluciones de dinero en caso de que el Producto presente una falla de fábrica comprobada.</p>
                        </div>
                    </section>

                    <section id="garantia">
                        <h2>8. Garantía de los Productos</h2>
                        <div className="info-box">
                            <p>Informa sobre la garantía legal que cubre los productos contra defectos de fabricación, según la normativa peruana.</p>
                        </div>
                        <p>Los Productos ofrecidos por Allahu Akbar® Peru cuentan con la garantía legal establecida por la normativa peruana de protección al consumidor.</p>
                    </section>

                    <section id="cupones">
                        <h2>9. Cupones y Descuentos</h2>
                        <div className="info-box">
                            <p>Establece las reglas para el uso de cupones y promociones: validez, condiciones específicas, no canjeables por efectivo.</p>
                        </div>
                        <p>Los cupones de descuento y las promociones tendrán una vigencia específica, la cual será comunicada claramente al Cliente.</p>
                    </section>

                    <section id="propiedad">
                        <h2>10. Propiedad Intelectual</h2>
                        <div className="info-box">
                            <p>Afirma los derechos de propiedad de la tienda sobre su contenido (logos, marcas, textos, etc.) y prohíbe su uso no autorizado.</p>
                        </div>
                        <p>Todo el contenido de la Tienda, incluyendo logotipos, marcas, nombres comerciales e imágenes, es propiedad de Allahu Akbar® Peru.</p>
                    </section>

                    <section id="proteccion">
                        <h2>11. Protección de Datos Personales</h2>
                        <div className="info-box">
                            <p>Informa sobre el tratamiento de datos personales de los clientes conforme a la ley peruana (Ley N° 29733).</p>
                        </div>
                        <p>De conformidad con la Ley N° 29733, los datos personales proporcionados por el Cliente serán incorporados a un banco de datos de titularidad de Allahu Akbar® Peru.</p>
                    </section>

                    <section id="atencion">
                        <h2>12. Atención al Cliente</h2>
                        <div className="info-box">
                            <p>Proporciona los canales de contacto para consultas o reclamos y menciona la disponibilidad del Libro de Reclamaciones.</p>
                        </div>
                        <p><strong>Email:</strong> alahuakbarperu@gmail.com</p>
                        <p><strong>WhatsApp:</strong> 123456789</p>
                    </section>

                    <section id="modificacion">
                        <h2>13. Modificación de los T&C</h2>
                        <div className="info-box">
                            <p>Indica que la tienda se reserva el derecho de cambiar los T&C.</p>
                        </div>
                        <p>Allahu Akbar® Peru se reserva el derecho de modificar los presentes T&C en cualquier momento.</p>
                    </section>

                    <section id="legislacion">
                        <h2>14. Legislación Aplicable</h2>
                        <div className="info-box">
                            <p>Establece que los T&C se rigen por las leyes peruanas.</p>
                        </div>
                        <p>Los presentes T&C se rigen e interpretan de acuerdo con las leyes de la República del Perú.</p>
                    </section>

                    <section id="contacto">
                        <h2>Contacto</h2>
                        <p><strong>Allahu Akbar® Peru</strong></p>
                        <p>Calle Los Arces, Arequipa, Perú</p>
                        <p>Email: alahuakbarperu@gmail.com</p>
                        <p>Teléfono: 123456789</p>
                        <p className="highlight-box" style={{ textAlign: 'center', marginTop: '20px' }}>¡Gracias por elegir Allahu Akbar® Peru!</p>
                    </section>
                </main>
            </div>

            <footer style={{ marginTop: '50px', padding: '20px', textAlign: 'center', backgroundColor: '#f8f9fa', borderTop: '1px solid #ddd' }}>
                <p>© Allahu Akbar® Peru. Todos los derechos reservados.</p>
                <p style={{ fontSize: '0.8rem', color: '#777' }}>Aplicación interactiva de Términos y Condiciones para facilitar la comprensión.</p>
            </footer>
        </div>
    );
};

