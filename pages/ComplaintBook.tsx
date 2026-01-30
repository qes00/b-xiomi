import React, { useState } from 'react';
import { useToast } from '../components/Toast';

export const ComplaintBook: React.FC = () => {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        nombre: '',
        primerApellido: '',
        segundoApellido: '',
        tipoDoc: '',
        numDoc: '',
        celular: '',
        departamento: '',
        provincia: '',
        distrito: '',
        direccion: '',
        referencia: '',
        email: '',
        menorEdad: 'no',
        tipoReclamo: '',
        tipoConsumo: 'producto',
        numPedido: '',
        fechaReclamo: new Date().toISOString().split('T')[0],
        proveedor: 'Boutique Xiomi® Peru',
        montoReclamado: '',
        descripcionProducto: '',
        fechaCompra: '',
        fechaConsumo: '',
        fechaCaducidad: '',
        detalleReclamo: '',
        pedidoCliente: '',
        aceptoDeclaracion: false,
        aceptoPolitica: false
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.aceptoDeclaracion || !formData.aceptoPolitica) {
            showToast('error', 'Debe aceptar los términos y la declaración jurada.');
            return;
        }
        showToast('success', 'Reclamo enviado correctamente. Nos pondremos en contacto a la brevedad.');
        console.log('Reclamo enviado:', formData);
    };

    const labelStyle = "block text-xs font-bold text-gray-700 mb-1";
    const inputStyle = "w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm transition-all";
    const sectionTitleStyle = "text-xl font-bold text-gray-800 mb-6 border-b pb-2 border-primary flex items-center";

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 bg-gray-50 min-h-screen">
            <div className="bg-white p-8 shadow-lg border border-gray-200 rounded-sm">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-secondary flex items-center justify-center rounded-sm">
                            <img src="/groupbx.svg" alt="Boutique Xiomi" className="w-12 h-12 object-contain" />
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Sección 1: Identificación Del Consumidor Reclamante */}
                    <section>
                        <h2 className={sectionTitleStyle}>
                            Identificación Del Consumidor Reclamante <span className="text-red-500 text-xs ml-2 font-normal">* Datos Requeridos</span>
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelStyle}>Nombre *</label>
                                <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className={inputStyle} placeholder="Nombre" required />
                            </div>
                            <div>
                                <label className={labelStyle}>Primer apellido *</label>
                                <input type="text" name="primerApellido" value={formData.primerApellido} onChange={handleInputChange} className={inputStyle} placeholder="Primer apellido" required />
                            </div>
                            <div>
                                <label className={labelStyle}>Segundo apellido *</label>
                                <input type="text" name="segundoApellido" value={formData.segundoApellido} onChange={handleInputChange} className={inputStyle} placeholder="Segundo apellido" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                                <label className={labelStyle}>Tipo de documentación *</label>
                                <select name="tipoDoc" value={formData.tipoDoc} onChange={handleInputChange} className={inputStyle} required>
                                    <option value="">Selección de documentación</option>
                                    <option value="DNI">DNI</option>
                                    <option value="CE">C.E.</option>
                                    <option value="Pasaporte">Pasaporte</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelStyle}>Número de documentación *</label>
                                <input type="text" name="numDoc" value={formData.numDoc} onChange={handleInputChange} className={inputStyle} placeholder="Número de documentación" required />
                            </div>
                            <div>
                                <label className={labelStyle}>Celular *</label>
                                <input type="tel" name="celular" value={formData.celular} onChange={handleInputChange} className={inputStyle} placeholder="Celular" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                                <label className={labelStyle}>Departamento *</label>
                                <select name="departamento" value={formData.departamento} onChange={handleInputChange} className={inputStyle} required>
                                    <option value="">Selección departamento</option>
                                    <option value="Arequipa">Arequipa</option>
                                    <option value="Lima">Lima</option>
                                    <option value="Cusco">Cusco</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelStyle}>Provincia *</label>
                                <select name="provincia" value={formData.provincia} onChange={handleInputChange} className={inputStyle} required>
                                    <option value="">Seleccionar de provincia</option>
                                    <option value="Arequipa">Arequipa</option>
                                    <option value="Islay">Islay</option>
                                    <option value="Caylloma">Caylloma</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelStyle}>Distrito *</label>
                                <select name="distrito" value={formData.distrito} onChange={handleInputChange} className={inputStyle} required>
                                    <option value="">Seleccionar de distrito</option>
                                    <option value="Cercado">Arequipa (Cercado)</option>
                                    <option value="Yanahuara">Yanahuara</option>
                                    <option value="Cayma">Cayma</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                                <label className={labelStyle}>Dirección *</label>
                                <input type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} className={inputStyle} placeholder="Dirección" required />
                            </div>
                            <div>
                                <label className={labelStyle}>Referencia</label>
                                <input type="text" name="referencia" value={formData.referencia} onChange={handleInputChange} className={inputStyle} placeholder="Referencia" />
                            </div>
                            <div>
                                <label className={labelStyle}>Correo electrónico *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputStyle} placeholder="Correo electrónico" required />
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-6">
                            <span className="text-xs font-bold text-gray-700">¿Eres menor de edad?</span>
                            <label className="flex items-center gap-2 text-xs">
                                <input type="radio" name="menorEdad" value="si" checked={formData.menorEdad === 'si'} onChange={handleInputChange} /> Si
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                                <input type="radio" name="menorEdad" value="no" checked={formData.menorEdad === 'no'} onChange={handleInputChange} /> No
                            </label>
                        </div>
                    </section>

                    {/* Sección 2: Detalle Del Reclamo Y Orden Del Consumidor */}
                    <section>
                        <h2 className={sectionTitleStyle}>
                            Detalle Del Reclamo Y Orden Del Consumidor <span className="text-red-500 text-xs ml-2 font-normal">* datos requeridos</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelStyle}>Tipo de reclamo *</label>
                                <select name="tipoReclamo" value={formData.tipoReclamo} onChange={handleInputChange} className={inputStyle} required>
                                    <option value="">Tipo de reclamo</option>
                                    <option value="Reclamacion">Reclamación</option>
                                    <option value="Queja">Queja</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelStyle}>Tipo de consumo *</label>
                                <select name="tipoConsumo" value={formData.tipoConsumo} onChange={handleInputChange} className={inputStyle} required>
                                    <option value="producto">Producto</option>
                                    <option value="servicio">Servicio</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelStyle}>N° de pedido *</label>
                                <input type="text" name="numPedido" value={formData.numPedido} onChange={handleInputChange} className={inputStyle} placeholder="N° Pedido" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                                <label className={labelStyle}>Fecha de reclamación / queja</label>
                                <input type="date" name="fechaReclamo" value={formData.fechaReclamo} onChange={handleInputChange} className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}>Proveedor</label>
                                <input type="text" name="proveedor" value={formData.proveedor} className={`${inputStyle} bg-gray-100`} readOnly />
                            </div>
                            <div>
                                <label className={labelStyle}>Monto reclamado (S/.)</label>
                                <input type="text" name="montoReclamado" value={formData.montoReclamado} onChange={handleInputChange} className={inputStyle} placeholder="Monto reclamado" />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className={labelStyle}>Descripción del producto o servicio *</label>
                            <textarea name="descripcionProducto" value={formData.descripcionProducto} onChange={handleInputChange} className={`${inputStyle} h-20`} required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                                <label className={labelStyle}>Fecha de compra</label>
                                <input type="date" name="fechaCompra" value={formData.fechaCompra} onChange={handleInputChange} className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}>Fecha de consumo</label>
                                <input type="date" name="fechaConsumo" value={formData.fechaConsumo} onChange={handleInputChange} className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}>Fecha de caducidad</label>
                                <input type="date" name="fechaCaducidad" value={formData.fechaCaducidad} onChange={handleInputChange} className={inputStyle} />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className={labelStyle}>Detalle de la Reclamación / Queja, según lo indicado por el cliente: *</label>
                            <textarea name="detalleReclamo" value={formData.detalleReclamo} onChange={handleInputChange} className={`${inputStyle} h-24`} required />
                        </div>

                        <div className="mt-4">
                            <label className={labelStyle}>Pedido del Cliente: *</label>
                            <textarea name="pedidoCliente" value={formData.pedidoCliente} onChange={handleInputChange} className={`${inputStyle} h-24`} required />
                        </div>
                    </section>

                    {/* Legal Info */}
                    <div className="text-[10px] text-gray-500 space-y-1">
                        <p><strong>(1) Reclamación:</strong> Desacuerdo relacionado con productos y/o servicios.</p>
                        <p><strong>(2) Queja:</strong> Desacuerdo no relacionado con productos y/o servicios; o, malestar o insatisfacción con la atención al público.</p>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input type="checkbox" name="aceptoDeclaracion" checked={formData.aceptoDeclaracion} onChange={handleInputChange} className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" required />
                            <div className="text-[10px] text-gray-600">
                                <p className="font-bold mb-1">Declaro que soy el dueño del servicio y acepto el contenido de este formulario al declarar bajo Declaración Jurada la veracidad de los hechos descritos.</p>
                                <p className="italic">* La formulación del reclamo no excluye al recurso a otros medios de resolución de controversias ni es un requisito previo para presentar una denuncia ante el Indecopi.</p>
                                <p className="italic">* El proveedor debe responder a la reclamación en un plazo no superior a quince (15) días naturales, pudiendo ampliar el plazo hasta quince días más.</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" name="aceptoPolitica" checked={formData.aceptoPolitica} onChange={handleInputChange} className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" required />
                            <span className="text-[10px] text-gray-600 font-bold">He leído y acepto la Política de privacidad y seguridad y la Política de cookies.</span>
                        </label>
                    </div>

                    <button type="submit" className="w-full bg-primary text-white py-4 rounded-full font-bold uppercase tracking-widest hover:bg-secondary transition-colors shadow-lg">
                        Enviar
                    </button>
                </form>
            </div>

            {/* Book Info Footer */}
            <div className="mt-8 flex flex-col items-center">
                <div className="border-2 border-blue-600 p-2 flex items-center gap-2">
                    <span className="text-blue-600 font-black text-xl leading-none">LIBRO DE <br/> RECLAMACIONES</span>
                    <div className="bg-blue-600 p-1">
                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

