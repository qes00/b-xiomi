import React, { useState, useMemo, useEffect } from 'react';
import { InventoryItem, Product, VariantType, VariantInventory, ProductImage } from '../../types';
import { formatCurrency } from '../../constants';
import { Button } from '../Button';
import { getProducts, updateProduct } from '../../services/productService';
import { getAllInventory, updateInventory } from '../../services/inventoryService';


// Generate all combinations of variants
const generateCombinations = (variantTypes: VariantType[]): { [key: string]: string }[] => {
    if (variantTypes.length === 0) return [{}];

    const [first, ...rest] = variantTypes;
    const restCombinations = generateCombinations(rest);

    const combinations: { [key: string]: string }[] = [];
    first.values.forEach(value => {
        restCombinations.forEach(combo => {
            combinations.push({ [first.name]: value, ...combo });
        });
    });

    return combinations;
};

// Format variant combination for display
const formatCombination = (combo: { [key: string]: string }): string => {
    return Object.entries(combo).map(([key, value]) => `${key}: ${value}`).join(' | ');
};

interface EditModalProps {
    product: Product | null; // Null means creating new
    initialInventory?: InventoryItem; // Optional for new
    initialVariantTypes?: VariantType[];
    initialVariantInventory?: VariantInventory[];
    onSave: (
        updatedProduct: Product,
        updatedInventory: InventoryItem,
        updatedVariantTypes: VariantType[],
        updatedVariantInventory: VariantInventory[]
    ) => void;
    onClose: () => void;
}

const EditProductModal: React.FC<EditModalProps> = ({
    product,
    initialInventory,
    initialVariantTypes = [],
    initialVariantInventory = [],
    onSave,
    onClose
}) => {
    const isEditing = !!product;

    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || 0,
        category: product?.category || 'General',
        imageUrl: product?.imageUrl || '',
        brand: product?.brand || '',
        lowStockThreshold: initialInventory?.lowStockThreshold || 10,
        isFeatured: product?.isFeatured || false,
        isWhatsappOnly: product?.isWhatsappOnly || false,
    });

    const [images, setImages] = useState<ProductImage[]>(product?.images || []);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newImageColor, setNewImageColor] = useState('');

    const [variantTypes, setVariantTypes] = useState<VariantType[]>(initialVariantTypes);
    const [newTypeName, setNewTypeName] = useState('');
    const [variantInventory, setVariantInventory] = useState<VariantInventory[]>(initialVariantInventory);

    // Calculate all possible combinations
    const combinations = useMemo(() => generateCombinations(variantTypes), [variantTypes]);

    // Calculate total stock from variants
    const totalVariantStock = useMemo(() => {
        return variantInventory.reduce((sum, vi) => sum + vi.stock, 0);
    }, [variantInventory]);

    const addVariantType = () => {
        if (!newTypeName.trim()) return;
        const newType: VariantType = {
            id: Date.now().toString(),
            name: newTypeName.trim(),
            values: []
        };
        setVariantTypes([...variantTypes, newType]);
        setNewTypeName('');
    };

    const removeVariantType = (id: string) => {
        setVariantTypes(variantTypes.filter(vt => vt.id !== id));
        // Remove related inventory entries
        const removedType = variantTypes.find(vt => vt.id === id);
        if (removedType) {
            setVariantInventory(variantInventory.filter(vi =>
                !Object.keys(vi.variantCombination).includes(removedType.name)
            ));
        }
    };

    const addValueToType = (typeId: string, value: string) => {
        if (!value.trim()) return;
        setVariantTypes(variantTypes.map(vt =>
            vt.id === typeId ? { ...vt, values: [...vt.values, value.trim()] } : vt
        ));
    };

    const removeValueFromType = (typeId: string, value: string) => {
        setVariantTypes(variantTypes.map(vt =>
            vt.id === typeId ? { ...vt, values: vt.values.filter(v => v !== value) } : vt
        ));
    };

    const getVariantStock = (combo: { [key: string]: string }): number => {
        const existing = variantInventory.find(vi =>
            JSON.stringify(vi.variantCombination) === JSON.stringify(combo)
        );
        return existing?.stock || 0;
    };

    const setVariantStock = (combo: { [key: string]: string }, stock: number) => {
        const existingIndex = variantInventory.findIndex(vi =>
            JSON.stringify(vi.variantCombination) === JSON.stringify(combo)
        );

        if (existingIndex >= 0) {
            const updated = [...variantInventory];
            updated[existingIndex] = { ...updated[existingIndex], stock };
            setVariantInventory(updated);
        } else {
            setVariantInventory([...variantInventory, {
                id: Date.now().toString(),
                productId: product?.id || 'new-product',
                variantCombination: combo,
                stock,
                reserved: 0
            }]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const handleSave = () => {
        console.log('📝 handleSubmit - variantInventory:', variantInventory);
        console.log('📝 handleSubmit - totalVariantStock:', totalVariantStock);
        
        const productToSave: Product = {
            id: product?.id || crypto.randomUUID(), // Temp ID for new, will be replaced by DB
            name: formData.name,
            description: formData.description,
            price: Number(formData.price),
            category: formData.category,
            imageUrl: formData.imageUrl || images.find(i => i.isPrimary)?.url || images[0]?.url || '',
            images: images,
            brand: formData.brand || undefined,
            sizes: variantTypes.find(vt => vt.name === 'Talla')?.values || [],
            colors: variantTypes.find(vt => vt.name === 'Color')?.values || [],
            isFeatured: formData.isFeatured,
            isWhatsappOnly: formData.isWhatsappOnly,
        };

        const inventoryToSave: InventoryItem = {
            productId: productToSave.id,
            stock: totalVariantStock > 0 ? totalVariantStock : 0,
            reserved: initialInventory?.reserved || 0,
            lowStockThreshold: Number(formData.lowStockThreshold),
            lastUpdated: new Date()
        };

        console.log('📝 handleSubmit - inventoryToSave:', inventoryToSave);
        onSave(productToSave, inventoryToSave, variantTypes, variantInventory);
    };
        handleSave();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b border-stone-200 p-6 flex items-center justify-between z-10">
                    <h2 className="text-2xl font-bold text-black border-l-4 border-gold-500 pl-4">
                    {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                    <button onClick={onClose} className="text-stone-400 hover:text-black transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 flex gap-4">
                            <img src={formData.imageUrl} alt={formData.name} className="w-24 h-24 rounded-lg object-cover border" />
                            <div className="flex-1">
                                <label className={styles.label}>URL de Imagen</label>
                                <input
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className={styles.label}>Nombre del Producto</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={styles.input}
                                required
                            />
                        </div>

                        <div>
                            <label className={styles.label}>Categoría</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className={styles.input}
                            >
                                <option value="Ropa">Ropa</option>
                                <option value="Calzado">Calzado</option>
                                <option value="Accesorios">Accesorios</option>
                            </select>
                        </div>

                        <div>
                            <label className={styles.label}>Precio (S/)</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                className={styles.input}
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={styles.label}>Descripción</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className={styles.input}
                                rows={2}
                            />
                        </div>

                        <div>
                            <label className={styles.label}>Marca</label>
                            <input
                                type="text"
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                className={styles.input}
                            />
                        </div>

                        <div>
                            <label className={styles.label}>Umbral Stock Bajo</label>
                            <input
                                type="number"
                                value={formData.lowStockThreshold}
                                onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                                className={styles.input}
                                min="0"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isFeatured}
                                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                    className="w-4 h-4 accent-gold-500 cursor-pointer"
                                />
                                <span className={styles.label}>⭐ Destacar en página principal</span>
                            </label>
                            <p className="text-xs text-stone-500 mt-1 ml-6">Los productos destacados aparecen en el carrusel de la landing page</p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isWhatsappOnly}
                                    onChange={(e) => setFormData({ ...formData, isWhatsappOnly: e.target.checked })}
                                    className="w-4 h-4 accent-[#25d366] cursor-pointer"
                                />
                                <span className={styles.label}>📲 Solo consultas por WhatsApp</span>
                            </label>
                            <p className="text-xs text-stone-500 mt-1 ml-6">El producto no podrá comprarse directamente, solo se muestra botón de WhatsApp</p>
                        </div>
                    </div>

                    {/* Multi-Image Management */}
                    <div className="border-t border-stone-200 pt-6">
                        <h3 className="text-lg font-bold text-black mb-4">🖼️ Galería de Imágenes</h3>
                        
                        {/* Current Images */}
                        {images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative group">
                                        <img src={img.url} alt={`Image ${idx + 1}`} className="w-full h-32 object-cover rounded-lg border-2 border-stone-200" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = [...images];
                                                    updated[idx] = { ...updated[idx], isPrimary: true };
                                                    updated.forEach((img, i) => { if (i !== idx) img.isPrimary = false; });
                                                    setImages(updated);
                                                }}
                                                className="px-2 py-1 bg-gold-500 text-black rounded text-xs font-bold hover:bg-gold-600"
                                                title="Marcar como principal"
                                            >
                                                {img.isPrimary ? '⭐' : '☆'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                                className="px-2 py-1 bg-red-500 text-white rounded text-xs font-bold hover:bg-red-600"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                        {img.color && (
                                            <span className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                                                {img.color}
                                            </span>
                                        )}
                                        {img.isPrimary && (
                                            <span className="absolute top-2 right-2 text-gold-400 text-lg">⭐</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add New Image */}
                        <div className="bg-stone-50 p-4 rounded-lg">
                            <label className={styles.label}>Agregar Nueva Imagen</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="url"
                                    value={newImageUrl}
                                    onChange={(e) => setNewImageUrl(e.target.value)}
                                    placeholder="URL de la imagen"
                                    className={styles.input}
                                />
                                <select
                                    value={newImageColor}
                                    onChange={(e) => setNewImageColor(e.target.value)}
                                    className={styles.input + ' w-48'}
                                >
                                    <option value="">Sin color</option>
                                    {variantTypes.find(vt => vt.name.toLowerCase() === 'color')?.values.map(color => (
                                        <option key={color} value={color}>{color}</option>
                                    ))}
                                </select>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        if (!newImageUrl.trim()) return;
                                        const newImage: ProductImage = {
                                            url: newImageUrl.trim(),
                                            color: newImageColor || undefined,
                                            isPrimary: images.length === 0,
                                            order: images.length
                                        };
                                        setImages([...images, newImage]);
                                        setNewImageUrl('');
                                        setNewImageColor('');
                                    }}
                                >
                                    + Agregar
                                </Button>
                            </div>
                            <p className="text-xs text-stone-500">
                                💡 Asocia imágenes a colores para que cambien automáticamente al seleccionar variantes
                            </p>
                        </div>
                    </div>

                    {/* Custom Variant Types */}
                    <div className="border-t border-stone-200 pt-6">
                        <h3 className="text-lg font-bold text-black mb-4">📦 Variantes Personalizadas</h3>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newTypeName}
                                onChange={(e) => setNewTypeName(e.target.value)}
                                placeholder="Nueva variante (ej: Material, Estilo...)"
                                className={styles.input}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariantType())}
                            />
                            <Button type="button" onClick={addVariantType}>+ Agregar</Button>
                        </div>

                        <div className="space-y-4">
                            {variantTypes.map(vt => (
                                <div key={vt.id} className="bg-stone-50 p-4 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-bold text-black">{vt.name}</h4>
                                        <button
                                            type="button"
                                            onClick={() => removeVariantType(vt.id)}
                                            className="text-red-500 hover:text-red-700 text-sm font-bold"
                                        >
                                            Eliminar
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {vt.values.map(value => (
                                            <span key={value} className="px-3 py-1 bg-gold-100 text-black rounded-full text-sm font-medium flex items-center gap-1">
                                                {value}
                                                <button
                                                    type="button"
                                                    onClick={() => removeValueFromType(vt.id, value)}
                                                    className="ml-1 text-stone-500 hover:text-red-500"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>

                                    <input
                                        type="text"
                                        placeholder={`Agregar valor a ${vt.name}...`}
                                        className="w-full px-3 py-1 border border-stone-300 rounded text-sm"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addValueToType(vt.id, (e.target as HTMLInputElement).value);
                                                (e.target as HTMLInputElement).value = '';
                                            }
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Variant Inventory Calculator */}
                    {/* Variant Inventory Calculator */}
                    {combinations.length > 1 ? (
                        <div className="border-t border-stone-200 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-black">🧮 Inventario por Variante</h3>
                                <div className="bg-gold-100 px-4 py-2 rounded-lg">
                                    <span className="text-sm text-stone-700">Stock Total: </span>
                                    <span className="text-xl font-bold text-gold-700">{totalVariantStock}</span>
                                </div>
                            </div>

                            <div className="bg-stone-50 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-stone-100 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-bold text-stone-700">Combinación</th>
                                            <th className="px-4 py-2 text-center font-bold text-stone-700 w-32">Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {combinations.map((combo, idx) => (
                                            <tr key={idx} className="border-t border-stone-200 hover:bg-stone-100">
                                                <td className="px-4 py-2 font-medium">{formatCombination(combo)}</td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        value={getVariantStock(combo)}
                                                        onChange={(e) => setVariantStock(combo, Number(e.target.value))}
                                                        className="w-full px-2 py-1 border border-stone-300 rounded text-center"
                                                        min="0"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <p className="text-xs text-stone-500 mt-2">
                                💡 {combinations.length} combinaciones posibles. El stock total se calcula automáticamente.
                            </p>
                        </div>
                    ) : (
                        /* Simple Product Stock Input */
                        <div className="border-t border-stone-200 pt-6">
                            <h3 className="text-lg font-bold text-black mb-4">📦 Inventario</h3>
                            <div className="bg-stone-50 p-4 rounded-lg">
                                <label className={styles.label}>Stock Disponible</label>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="number"
                                        value={getVariantStock({})} // Empty combo for base product
                                        onChange={(e) => setVariantStock({}, Number(e.target.value))}
                                        className={styles.input + " text-lg font-bold w-32"}
                                        min="0"
                                    />
                                    <span className="text-sm text-stone-500">unidades disponibles para venta inmediata.</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 justify-end border-t border-stone-200 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-stone-200 text-black font-bold rounded-lg hover:bg-stone-300"
                        >
                            Cancelar
                        </button>
                        <Button type="submit">Guardar Cambios</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const InventoryManager: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);

    // Store variant types and inventory per product
    const [productVariantTypes, setProductVariantTypes] = useState<{ [productId: string]: VariantType[] }>({});
    const [productVariantInventory, setProductVariantInventory] = useState<{ [productId: string]: VariantInventory[] }>({});

    const [editingProduct, setEditingProduct] = useState<{ product: Product; inventory: InventoryItem } | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [quickEditId, setQuickEditId] = useState<string | null>(null);
    const [quickEditValue, setQuickEditValue] = useState(0);

    const loadData = async () => {
        setLoading(true);
        try {
            const [productsData, inventoryData] = await Promise.all([
                getProducts(),
                getAllInventory()
            ]);

            setProducts(productsData);
            
            // Map real inventory or create default if missing
            const initialInventory = productsData.map(p => {
                const existingInv = inventoryData.find(i => i.productId === p.id);
                return existingInv || {
                    productId: p.id,
                    stock: 0,
                    reserved: 0,
                    lowStockThreshold: 10,
                    lastUpdated: new Date(),
                };
            });
            setInventory(initialInventory);

            // Initialize variant types (based on product data)
            const initialVariantTypes: { [productId: string]: VariantType[] } = {};
            productsData.forEach(p => {
                const types: VariantType[] = [];
                if (p.sizes && p.sizes.length > 0) {
                    types.push({ id: 'size-' + p.id, name: 'Talla', values: p.sizes });
                }
                if (p.colors && p.colors.length > 0) {
                    types.push({ id: 'color-' + p.id, name: 'Color', values: p.colors });
                }
                initialVariantTypes[p.id] = types;
            });
            setProductVariantTypes(initialVariantTypes);
        } catch (error) {
            console.error('Error cargando productos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);


    const getProduct = (productId: string) => products.find(p => p.id === productId);
    const getInventory = (productId: string) => inventory.find(i => i.productId === productId);

    const quickUpdateStock = async (productId: string, newStock: number) => {
        try {
            const updated = await updateInventory(productId, newStock);
            if (updated) {
                setInventory(inventory.map(item =>
                    item.productId === productId ? updated : item
                ));
            }
            setQuickEditId(null);
        } catch (error) {
            console.error('Error updating stock:', error);
            alert('Error al actualizar stock');
        }
    };

    const handleDeepEdit = (product: Product) => {
        const inv = getInventory(product.id);
        if (inv) setEditingProduct({ product, inventory: inv });
    };

    const handleSaveEdit = async (
        updatedProduct: Product,
        updatedInventory: InventoryItem,
        updatedVariantTypes: VariantType[],
        updatedVariantInventory: VariantInventory[]
    ) => {
        try {
            // 1. Save product
            const savedProduct = await updateProduct(updatedProduct.id, updatedProduct);
            
            if (!savedProduct) {
                throw new Error('No se pudo guardar el producto');
            }

            // 2. Save inventory
            const savedInventory = await updateInventory(updatedProduct.id, updatedInventory.stock);

            // Update local state
            setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
            
            if (savedInventory) {
                setInventory(inventory.map(i => i.productId === updatedProduct.id ? savedInventory : i));
            } else {
                // Fallback update local if service fails but product saved (rare)
                setInventory(inventory.map(i => i.productId === updatedProduct.id ? updatedInventory : i));
            }

            setProductVariantTypes({ ...productVariantTypes, [updatedProduct.id]: updatedVariantTypes });
            setProductVariantInventory({ ...productVariantInventory, [updatedProduct.id]: updatedVariantInventory });
            
            setEditingProduct(null);
            alert('✅ Producto e inventario guardados exitosamente');
        } catch (error) {
            console.error('Error guardando:', error);
            alert('❌ Error: ' + (error instanceof Error ? error.message : 'Error desconocido'));
        }
    };

    const getStockStatus = (item: InventoryItem) => {
        const available = item.stock - item.reserved;
        if (available <= 0) return { label: 'Sin Stock', color: 'bg-red-100 text-red-800' };
        if (available <= item.lowStockThreshold) return { label: 'Stock Bajo', color: 'bg-yellow-100 text-yellow-800' };
        return { label: 'En Stock', color: 'bg-green-100 text-green-800' };
    };

    const getVariantCount = (productId: string) => {
        const types = productVariantTypes[productId] || [];
        if (types.length === 0) return 0;
        return types.reduce((acc, t) => acc * (t.values.length || 1), 1);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-black">Gestión de Inventario</h2>
                    <Button onClick={() => setIsCreateModalOpen(true)}>+ Nuevo Producto</Button>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-bold">
                        ✓ {inventory.filter(i => i.stock - i.reserved > i.lowStockThreshold).length} En Stock
                    </span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-bold">
                        ⚠ {inventory.filter(i => i.stock - i.reserved > 0 && i.stock - i.reserved <= i.lowStockThreshold).length} Stock Bajo
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm font-bold">
                        ✕ {inventory.filter(i => i.stock - i.reserved <= 0).length} Sin Stock
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-stone-50 border-b border-stone-200">
                        <tr>
                            <th className={styles.th}>Producto</th>
                            <th className={styles.th}>Destacado</th>
                            <th className={styles.th}>WhatsApp</th>
                            <th className={styles.th}>Imágenes</th>
                            <th className={styles.th}>Variantes</th>
                            <th className={styles.th}>Stock Total</th>
                            <th className={styles.th}>Reservado</th>
                            <th className={styles.th}>Estado</th>
                            <th className={styles.th}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventory.map(item => {
                            const product = getProduct(item.productId);
                            if (!product) return null;

                            const available = item.stock - item.reserved;
                            const status = getStockStatus(item);
                            const variantCount = getVariantCount(item.productId);

                            return (
                                <tr key={item.productId} className="border-b border-stone-100 hover:bg-stone-50">
                                    <td className={styles.td}>
                                        <div className="flex items-center gap-3">
                                            <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded object-cover" />
                                            <div>
                                                <p className="font-bold text-black">{product.name}</p>
                                                <p className="text-sm text-stone-600">{product.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        {product.isFeatured ? (
                                            <span className="text-gold-500 text-lg" title="Destacado en landing page">⭐</span>
                                        ) : (
                                            <span className="text-stone-300" title="No destacado">☆</span>
                                        )}
                                    </td>
                                    <td className={styles.td}>
                                        {product.isWhatsappOnly ? (
                                            <span className="text-[#25d366] text-lg" title="Solo consultas por WhatsApp">📲</span>
                                        ) : (
                                            <span className="text-stone-300" title="Compra normal">🛒</span>
                                        )}
                                    </td>
                                    <td className={styles.td}>
                                        {product.images && product.images.length > 0 ? (
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">
                                                🖼️ {product.images.length}
                                            </span>
                                        ) : (
                                            <span className="text-stone-400 text-xs">1</span>
                                        )}
                                    </td>
                                    <td className={styles.td}>
                                        {variantCount > 0 ? (
                                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-bold">
                                                {variantCount} combinaciones
                                            </span>
                                        ) : (
                                            <span className="text-stone-400 text-xs">Sin variantes</span>
                                        )}
                                    </td>
                                    <td className={styles.td}>
                                        {quickEditId === item.productId ? (
                                            <input
                                                type="number"
                                                value={quickEditValue}
                                                onChange={(e) => setQuickEditValue(Number(e.target.value))}
                                                className="w-20 px-2 py-1 border border-gold-500 rounded"
                                                autoFocus
                                            />
                                        ) : (
                                            <span className="font-bold">{item.stock}</span>
                                        )}
                                    </td>
                                    <td className={styles.td}>
                                        <span className="text-orange-600 font-medium">{item.reserved}</span>
                                    </td>
                                    <td className={styles.td}>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${status.color}`}>
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        {quickEditId === item.productId ? (
                                            <div className="flex gap-2">
                                                <button onClick={() => quickUpdateStock(item.productId, quickEditValue)} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-bold">✓</button>
                                                <button onClick={() => setQuickEditId(null)} className="px-3 py-1 bg-stone-300 text-black rounded hover:bg-stone-400 text-sm font-bold">✕</button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button onClick={() => { setQuickEditId(item.productId); setQuickEditValue(item.stock); }} className="px-3 py-1 bg-gold-500 text-black rounded hover:bg-gold-600 text-sm font-bold" title="Edición rápida">📦</button>
                                                <button onClick={() => handleDeepEdit(product)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-bold" title="Edición completa">✏️</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {editingProduct && (
                <EditProductModal
                    product={editingProduct.product}
                    initialInventory={editingProduct.inventory}
                    initialVariantTypes={productVariantTypes[editingProduct.product.id] || []}
                    initialVariantInventory={productVariantInventory[editingProduct.product.id] || []}
                    onSave={handleSaveEdit}
                    onClose={() => setEditingProduct(null)}
                />
            )}

            {isCreateModalOpen && (
                <EditProductModal
                    product={null} // Null triggers creation mode
                    initialInventory={{} as InventoryItem} // Empty inventory for new product
                    initialVariantTypes={[]}
                    initialVariantInventory={[]}
                    onSave={handleSaveEdit}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            )}
        </div>
    );
};

const styles = {
    th: "px-4 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider",
    td: "px-4 py-3 text-sm text-stone-900",
    label: "block text-sm font-bold text-stone-900 mb-1",
    input: "w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
};
