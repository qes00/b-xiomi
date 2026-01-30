import React from 'react';

export const AboutUs: React.FC = () => {
    return (
        <div className="w-full bg-white pb-20">
            {/* Header Section (Mockup: ABOUT US strip) */}
            <div className="w-full bg-white py-8 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl md:text-4xl font-serif tracking-widest text-primary uppercase text-center border-y border-primary py-4">
                        Nuestra Historia
                    </h1>
                </div>
            </div>

            {/* Content Section (Desktop: Overlap, Mobile: Stacked) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-20">
                {/* Desktop Layout */}
                <div className="hidden md:block relative min-h-[600px]">
                    {/* Image Background (Right) */}
                    <div className="absolute top-0 right-0 w-[60%] h-full bg-stone-200 pl-12 pb-12">
                        <img 
                            src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop" 
                            alt="Photography Store" 
                            className="w-full h-full object-cover shadow-sm"
                        />
                    </div>
                    
                    {/* Text Card (Left, Overlapping) */}
                    <div className="relative z-10 w-[50%] bg-white border border-primary p-12 top-24 shadow-2xl">
                         <h2 className="text-2xl font-serif font-bold text-primary mb-6">Nuestra Historia</h2>
                         <div className="prose prose-lg text-primary/70 font-light">
                            <p className="mb-6 leading-relaxed">
                                Bienvenidos a <span className="font-bold text-primary">Boutique Xiomi</span>. Somos una tienda dedicada a vestir con magia y elegancia a las más pequeñas.
                            </p>
                            <p className="mb-6 leading-relaxed">
                                Nuestra misión es ofrecer excelencia en cada producto, desde tecnología hasta moda, curado para clientes exigentes que buscan calidad y distinción.
                            </p>
                            <p className="leading-relaxed">
                                Creemos en el diseño como una forma de vida y en la satisfacción del cliente como nuestro mayor compromiso.
                            </p>
                         </div>
                    </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden flex flex-col gap-8">
                    {/* Text Section */}
                    <div className="bg-white border border-primary p-6 shadow-lg">
                        <h2 className="text-2xl font-serif font-bold text-primary mb-4">Nuestra Historia</h2>
                        <div className="prose text-primary/70 font-light">
                            <p className="mb-4">
                                Bienvenidos a <span className="font-bold text-primary">Boutique Xiomi</span>. Somos una tienda virtual que fusiona la tradición con la modernidad.
                            </p>
                            <p className="mb-4">
                                Nuestra misión es ofrecer excelencia en cada producto, desde tecnología hasta moda.
                            </p>
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="w-full h-80 bg-stone-200">
                         <img 
                            src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop" 
                            alt="Photography Store" 
                            className="w-full h-full object-cover shadow-md"
                        />
                    </div>
                </div>
            </div>

            {/* Find Us / Info Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Mobile Title */}
                <div className="md:hidden w-full border border-primary py-3 text-center mb-8">
                    <h2 className="text-lg font-serif font-bold text-primary uppercase tracking-widest">Encuéntranos</h2>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Map Section (Desktop: Left, Mobile: Bottom) */}
                    <div className="w-full md:w-2/3 order-2 md:order-1 h-[400px] border border-primary p-2 bg-white">
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.964956637841!2d-77.03099568518866!3d-12.046033991467475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8b6a3f01235%3A0x6734138b812976!2sPlaza%20Mayor%20de%20Lima!5e0!3m2!1sen!2spe!4v1620000000000!5m2!1sen!2spe" 
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen={true} 
                            loading="lazy" 
                            title="Mapa de Ubicación"
                            className="grayscale contrast-125"
                        ></iframe>
                    </div>

                    {/* Info Section (Desktop: Right, Mobile: Top) */}
                    <div className="w-full md:w-1/3 order-1 md:order-2">
                         <div className="h-full border border-primary p-8 flex flex-col justify-center bg-white shadow-sm">
                            <h3 className="text-xl font-serif font-bold text-primary mb-8 text-center md:text-left border-b border-gray-200 pb-4">INFORMACIÓN</h3>
                            
                            <div className="space-y-8">
                                <div className="text-center md:text-left">
                                    <h4 className="font-bold text-primary mb-2 uppercase tracking-wide text-sm">Teléfonos</h4>
                                    <p className="text-primary/70 font-light">+51 987 654 321</p>
                                    <p className="text-primary/70 font-light">+51 123 456 789</p>
                                </div>

                                <div className="text-center md:text-left">
                                    <h4 className="font-bold text-primary mb-2 uppercase tracking-wide text-sm">Correos</h4>
                                    <p className="text-primary/70 font-light">contacto@boutiquexiomi.pe</p>
                                    <p className="text-primary/70 font-light">ventas@boutiquexiomi.pe</p>
                                </div>

                                <div className="text-center md:text-left">
                                     <h4 className="font-bold text-primary mb-2 uppercase tracking-wide text-sm">Horario</h4>
                                     <p className="text-primary/70 font-light">Lun - Vie: 9:00am - 6:00pm</p>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
