import React from 'react';

export const AboutUs: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
                <div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0f1c29] mb-6">Sobre Nosotros</h1>
                    <div className="prose prose-lg text-[#3c6e96]">
                        <p className="mb-4">
                            Bienvenidos a <span className="font-bold text-[#0f1c29]">Allahu Akbar Shop</span>, una tienda virtual híbrida que fusiona la riqueza de la tradición peruana con la modernidad del comercio electrónico global.
                        </p>
                        <p className="mb-4">
                            Nuestra misión es llevar la calidad peruana a cada rincón del país y del mundo, ofreciendo una selección curada de tecnología, moda y artesanía. Creemos en el poder de la identidad y la elegancia.
                        </p>
                        <p>
                            Más que una tienda, somos un punto de encuentro donde la excelencia es la norma. Gracias por elegirnos como su destino de compras preferido.
                        </p>
                    </div>
                </div>
                <div className="bg-stone-100 h-96 rounded-lg flex items-center justify-center relative overflow-hidden">
                     {/* Placeholder image or abstract design */}
                     <div className="absolute inset-0 bg-linear-to-tr from-[#0f1c29] to-transparent opacity-20"></div>
                     <span className="text-[#0f1c29] font-serif italic text-2xl z-10">Excelencia Peruana</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center bg-white p-12 rounded-xl shadow-sm border border-stone-50">
                <div>
                    <div className="text-gold-500 text-4xl mb-4">★</div>
                    <h3 className="text-xl font-bold text-[#0f1c29] mb-2">Calidad Premium</h3>
                    <p className="text-[#3c6e96]">Productos seleccionados rigurosamente para garantizar la mejor experiencia.</p>
                </div>
                <div>
                    <div className="text-gold-500 text-4xl mb-4">✈</div>
                    <h3 className="text-xl font-bold text-[#0f1c29] mb-2">Envíos Rápidos</h3>
                    <p className="text-[#3c6e96]">Logística eficiente para que reciba su pedido lo antes posible.</p>
                </div>
                <div>
                    <div className="text-gold-500 text-4xl mb-4">♥</div>
                    <h3 className="text-xl font-bold text-[#0f1c29] mb-2">Atención Personalizada</h3>
                    <p className="text-[#3c6e96]">Estamos aquí para escucharlo y atender todas sus necesidades.</p>
                </div>
            </div>
        </div>
    );
};
