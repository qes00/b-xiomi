import React from 'react';
import { Link } from 'react-router-dom';

export const Campaigns: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0f1c29] mb-8 text-center">Nuestras Campañas</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Campaign Card 1 */}
                <div className="group relative overflow-hidden rounded-xl bg-[#0f1c29] h-[400px] shadow-lg">
                    <img src="https://images.unsplash.com/photo-1607083206868-24c3305275ef?q=80&w=2070&auto=format&fit=crop" alt="Campaña Verano" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                    <div className="absolute inset-0 flex flex-col justify-end p-8">
                        <span className="text-gold-400 font-bold tracking-widest uppercase text-sm mb-2">Temporada 2024</span>
                        <h2 className="text-3xl font-serif font-bold text-white mb-4">Verano de Lujo</h2>
                        <p className="text-gray-300 mb-6 max-w-md">Descubre nuestra colección exclusiva de verano con descuentos de hasta el 30% en prendas seleccionadas.</p>
                        <Link to="/shop" className="inline-block w-fit px-6 py-3 bg-gold-500 text-[#0f1c29] font-bold rounded hover:bg-white transition-colors">
                            Ver Colección
                        </Link>
                    </div>
                </div>

                {/* Campaign Card 2 */}
                <div className="group relative overflow-hidden rounded-xl bg-stone-800 h-[400px] shadow-lg">
                    <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop" alt="Campaña Tech" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                    <div className="absolute inset-0 flex flex-col justify-end p-8">
                        <span className="text-gold-400 font-bold tracking-widest uppercase text-sm mb-2">Tecnología</span>
                        <h2 className="text-3xl font-serif font-bold text-white mb-4">Cyber Days</h2>
                        <p className="text-gray-300 mb-6 max-w-md">La mejor tecnología a precios increíbles. Renovamos tu oficina o setup gamer con ofertas imperdibles.</p>
                        <Link to="/shop" className="inline-block w-fit px-6 py-3 bg-transparent border-2 border-white text-white font-bold rounded hover:bg-white hover:text-[#0f1c29] transition-colors">
                            Explorar Ofertas
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mt-16 text-center">
                <p className="text-[#3c6e96] italic">Mantente atento a nuestras próximas campañas suscribiéndote a nuestro boletín.</p>
            </div>
        </div>
    );
};
