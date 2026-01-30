import React, { useState, useEffect } from 'react';
import { getAllBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, BlogPost } from '../../services/blogService';
import { uploadImage } from '../../services/imageService';
import { useToast } from '../Toast';

export const BlogManager: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [showModal, setShowModal] = useState(false);
    const { showToast } = useToast();

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        image_url: '',
        author: 'Equipo Allahu Akbar',
        published: false
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const data = await getAllBlogPosts();
            setPosts(data);
        } catch (error) {
            console.error('Error loading blog posts:', error);
            showToast('Error al cargar las entradas del blog', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (post?: BlogPost) => {
        if (post) {
            setEditingPost(post);
            setFormData({
                title: post.title,
                excerpt: post.excerpt || '',
                content: post.content,
                image_url: post.image_url || '',
                author: post.author,
                published: post.published
            });
        } else {
            setEditingPost(null);
            setFormData({
                title: '',
                excerpt: '',
                content: '',
                image_url: '',
                author: 'Equipo Allahu Akbar',
                published: false
            });
        }
        setImageFile(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingPost(null);
        setImageFile(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            setUploading(true);
            
            let imageUrl = formData.image_url;
            
            // Upload image if a new one was selected
            if (imageFile) {
                const result = await uploadImage(imageFile);
                if (result.success && result.imageUrl) {
                    imageUrl = result.imageUrl;
                } else {
                    throw new Error(result.error || 'Error al subir la imagen');
                }
            }

            const postData = {
                ...formData,
                image_url: imageUrl || null,
                excerpt: formData.excerpt || null
            };

            if (editingPost) {
                await updateBlogPost(editingPost.id, postData);
                showToast('Entrada actualizada exitosamente', 'success');
            } else {
                await createBlogPost(postData);
                showToast('Entrada creada exitosamente', 'success');
            }

            handleCloseModal();
            loadPosts();
        } catch (error) {
            console.error('Error saving blog post:', error);
            showToast('Error al guardar la entrada', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta entrada?')) return;

        try {
            await deleteBlogPost(id);
            showToast('Entrada eliminada exitosamente', 'success');
            loadPosts();
        } catch (error) {
            console.error('Error deleting blog post:', error);
            showToast('Error al eliminar la entrada', 'error');
        }
    };

    const handleTogglePublished = async (post: BlogPost) => {
        try {
            await updateBlogPost(post.id, { published: !post.published });
            showToast(`Entrada ${!post.published ? 'publicada' : 'despublicada'} exitosamente`, 'success');
            loadPosts();
        } catch (error) {
            console.error('Error toggling published status:', error);
            showToast('Error al cambiar el estado de publicación', 'error');
        }
    };

    if (loading) {
        return <div className="text-center py-8">Cargando entradas del blog...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#0f1c29]">Gestión de Blog</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-gold-600 text-white rounded hover:bg-gold-700 transition-colors"
                >
                    + Nueva Entrada
                </button>
            </div>

            {/* Blog Posts Table */}
            <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-stone-50 border-b border-stone-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">Título</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">Autor</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">Estado</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">Fecha</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-stone-700">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map((post) => (
                            <tr key={post.id} className="border-b border-stone-100 hover:bg-stone-50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        {post.image_url && (
                                            <img src={post.image_url} alt={post.title} className="w-12 h-12 object-cover rounded" />
                                        )}
                                        <span className="font-medium text-[#0f1c29]">{post.title}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-stone-600">{post.author}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs rounded ${post.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {post.published ? 'Publicado' : 'Borrador'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-stone-600">
                                    {new Date(post.created_at).toLocaleDateString('es-PE')}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleTogglePublished(post)}
                                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                        >
                                            {post.published ? 'Despublicar' : 'Publicar'}
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(post)}
                                            className="px-3 py-1 text-sm bg-stone-100 text-stone-700 rounded hover:bg-stone-200 transition-colors"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {posts.length === 0 && (
                    <div className="text-center py-12 text-stone-500">
                        No hay entradas de blog. Crea una nueva para comenzar.
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-stone-200">
                            <h3 className="text-xl font-bold text-[#0f1c29]">
                                {editingPost ? 'Editar Entrada' : 'Nueva Entrada'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">
                                    Título *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-gold-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">
                                    Extracto
                                </label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-gold-500"
                                    placeholder="Breve descripción de la entrada..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">
                                    Contenido *
                                </label>
                                <textarea
                                    required
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={8}
                                    className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-gold-500"
                                    placeholder="Contenido completo de la entrada..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">
                                    Imagen
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-gold-500"
                                />
                                {formData.image_url && !imageFile && (
                                    <img src={formData.image_url} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">
                                    Autor
                                </label>
                                <input
                                    type="text"
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                    className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-gold-500"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="published"
                                    checked={formData.published}
                                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                    className="w-4 h-4 text-gold-600 border-stone-300 rounded focus:ring-gold-500"
                                />
                                <label htmlFor="published" className="text-sm font-medium text-stone-700">
                                    Publicar inmediatamente
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-stone-700 bg-stone-100 rounded hover:bg-stone-200 transition-colors"
                                    disabled={uploading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-gold-600 text-white rounded hover:bg-gold-700 transition-colors disabled:opacity-50"
                                    disabled={uploading}
                                >
                                    {uploading ? 'Guardando...' : editingPost ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
