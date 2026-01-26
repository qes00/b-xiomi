import React, { useState, useEffect } from 'react';
import { UserProfile, CartItem, UserAddress } from '../types';
import { Button } from './Button';
import { formatCurrency } from '../constants';
import { useNavigate } from 'react-router-dom';
import { MyOrders } from './MyOrders';
import { useAuthStore } from '../stores/authStore';
import { getUserProfile, changePassword, verifyCurrentPassword } from '../services/userService';

interface UserPanelProps {
  cart: CartItem[];
}


const UserPanel: React.FC<UserPanelProps> = ({ cart }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'shipping' | 'security' | 'cart'>('profile');
  const authUser = useAuthStore(state => state.user);
  
  // User profile state - inicializa con datos del authStore
  const [user, setUser] = useState<UserProfile>({
    firstName: authUser?.firstName || '',
    lastName: authUser?.lastName || '',
    email: authUser?.email || '',
    phone: authUser?.phone || '',
    documentType: 'DNI',
    documentNumber: '',
    addresses: []
  });
  
  const [isEditing, setIsEditing] = useState(false);

  // Cargar perfil completo del usuario desde Supabase
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!authUser?.id) return;
      
      const profile = await getUserProfile(authUser.id);
      if (profile) {
        setUser({
          firstName: profile.firstName || authUser.firstName,
          lastName: profile.lastName || authUser.lastName,
          email: profile.email || authUser.email,
          phone: profile.phone || authUser.phone,
          documentType: profile.documentType || 'DNI',
          documentNumber: profile.documentNumber || '',
          addresses: profile.addresses || []
        });
      }
    };
    
    loadUserProfile();
  }, [authUser]);

  // Password State - Sistema de 2 fases
  const [passwordPhase, setPasswordPhase] = useState<1 | 2>(1); // Fase 1: verificar actual, Fase 2: nueva contraseña
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    alert("Datos actualizados correctamente.");
  };


  // FASE 1: Verificar contraseña actual
  const handleVerifyCurrentPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.current) {
      alert("Por favor ingresa tu contraseña actual.");
      return;
    }

    try {
      setIsVerifyingPassword(true);
      const { success, error } = await verifyCurrentPassword(passwordForm.current);
      
      if (success) {
        setPasswordPhase(2); // Pasar a fase 2
      } else {
        alert(error || "La contraseña actual es incorrecta");
      }
    } catch (err) {
      alert("Ocurrió un error inesperado.");
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  // FASE 2: Cambiar a nueva contraseña
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new.length < 8) {
      alert("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      alert("Las nuevas contraseñas no coinciden.");
      return;
    }

    try {
      setIsChangingPassword(true);
      const { success, error } = await changePassword(passwordForm.current, passwordForm.new);
      
      if (success) {
        alert("Tu contraseña ha sido actualizada correctamente.");
        setPasswordForm({ current: '', new: '', confirm: '' });
        setPasswordPhase(1); // Volver a fase 1
      } else {
        alert(error || "Error al actualizar la contraseña");
      }
    } catch (err) {
      alert("Ocurrió un error inesperado.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Cancelar cambio de contraseña y volver a fase 1
  const handleCancelPasswordChange = () => {
    setPasswordPhase(1);
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  const handleDeleteAccount = () => {
    const isConfirmed = window.confirm(
      "¿ESTÁS SEGURO?\n\nEsta acción eliminará permanentemente tu cuenta, historial de pedidos y datos personales. Esta acción no se puede deshacer."
    );

    if (isConfirmed) {
      alert("Eliminando datos...");
      setTimeout(() => {
        alert("Tu cuenta ha sido eliminada. Lamentamos verte partir.");
        navigate('/');
        window.location.reload();
      }, 1500);
    }
  };

  const renderSidebar = () => (
    <div className={styles.sidebar.container}>
      <div className={styles.sidebar.header}>
        <div className="flex items-center gap-3">
          <div className={styles.sidebar.avatar}>
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-black">{user.firstName}</p>
            <p className="text-xs text-stone-600 font-medium">Miembro desde 2024</p>
          </div>
        </div>
      </div>
      <nav className={styles.sidebar.nav}>
        <button onClick={() => setActiveTab('profile')} className={getTabStyle(activeTab === 'profile')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          Datos Personales
        </button>
        <button onClick={() => setActiveTab('orders')} className={getTabStyle(activeTab === 'orders')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
          Mis Pedidos
        </button>
        <button onClick={() => setActiveTab('shipping')} className={getTabStyle(activeTab === 'shipping')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          Direcciones de Envío
        </button>
        <button onClick={() => setActiveTab('security')} className={getTabStyle(activeTab === 'security')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          Seguridad & Privacidad
        </button>
        <button onClick={() => setActiveTab('cart')} className={getTabStyle(activeTab === 'cart')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          Mi Carrito Activo
          {cart.length > 0 && <span className={styles.sidebar.cartBadge}>{cart.reduce((a, c) => a + c.quantity, 0)}</span>}
        </button>
      </nav>
    </div>
  );

  return (
    <div className={styles.layout.container}>
      <h1 className={styles.layout.title}>Mi Cuenta</h1>

      <div className={styles.layout.grid}>
        {renderSidebar()}

        <div className="flex-1">
          {activeTab === 'orders' && <MyOrders userId="current-user" />}

          {activeTab === 'profile' && (
            <div className={styles.card.container}>
              <div className={styles.card.header}>
                <h2 className={styles.card.title}>Datos Personales</h2>
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="text-sm">
                  {isEditing ? 'Cancelar' : 'Editar Datos'}
                </Button>
              </div>

              <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={styles.form.label}>Nombres</label>
                  <input type="text" disabled={!isEditing} defaultValue={user.firstName} className={styles.form.input} />
                </div>
                <div>
                  <label className={styles.form.label}>Apellidos</label>
                  <input type="text" disabled={!isEditing} defaultValue={user.lastName} className={styles.form.input} />
                </div>
                <div>
                  <label className={styles.form.label}>Tipo de Documento</label>
                  <select disabled={!isEditing} defaultValue={user.documentType} className={styles.form.input}>
                    <option value="DNI">DNI</option>
                    <option value="RUC">RUC</option>
                    <option value="CE">Carnet Extranjería</option>
                  </select>
                </div>
                <div>
                  <label className={styles.form.label}>Número de Documento</label>
                  <input type="text" disabled={!isEditing} defaultValue={user.documentNumber} className={styles.form.input} />
                </div>
                <div className="md:col-span-2">
                  <label className={styles.form.label}>Correo Electrónico</label>
                  <input type="email" disabled defaultValue={user.email} className={styles.form.disabledInput} />
                  <p className="text-xs text-stone-500 mt-1">Para cambiar tu correo, contacta a soporte.</p>
                </div>

                {isEditing && (
                  <div className="md:col-span-2 flex justify-end">
                    <Button type="submit">Guardar Cambios</Button>
                  </div>
                )}
              </form>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className={styles.card.container}>
              <div className={styles.card.header}>
                <h2 className={styles.card.title}>Mis Direcciones</h2>
                <Button className="text-sm">Nueva Dirección</Button>
              </div>

              <div className="space-y-4">
                {user.addresses.map(addr => (
                  <div key={addr.id} className={styles.address.card}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-black">{addr.district}, {addr.province}</span>
                        <span className={styles.address.badge}>Principal</span>
                      </div>
                      <p className="text-stone-800 font-medium">{addr.street}</p>
                      <p className="text-sm text-stone-600 mt-1">{addr.department}</p>
                      {addr.reference && <p className="text-xs text-stone-500 mt-2 italic">Ref: {addr.reference}</p>}
                    </div>
                    <div className={styles.address.actions}>
                      <button className="text-gold-700 hover:text-gold-900 text-sm font-bold">Editar</button>
                      <button className="text-red-600 hover:text-red-800 text-sm font-bold">Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}



          {activeTab === 'security' && (
            <div className={styles.card.container}>
              <h2 className={`${styles.card.title} mb-6`}>Gestión de Contraseña</h2>

              {/* FASE 1: Verificar contraseña actual */}
              {passwordPhase === 1 && (
                <form onSubmit={handleVerifyCurrentPassword} className="max-w-md space-y-4 mb-12">
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                    <p className="text-sm text-blue-800 font-medium">
                      <strong>Paso 1 de 2:</strong> Por seguridad, primero verifica tu contraseña actual.
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Límite: Máximo 2 cambios de contraseña por día.
                    </p>
                  </div>
                  <div>
                    <label className={styles.form.label}>Contraseña Actual</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                      className={styles.form.input}
                      placeholder="Ingresa tu contraseña actual"
                    />
                  </div>
                  <Button type="submit" disabled={isVerifyingPassword}>
                    {isVerifyingPassword ? 'Verificando...' : 'Verificar Contraseña'}
                  </Button>
                </form>
              )}

              {/* FASE 2: Nueva contraseña (solo visible si fase 1 fue exitosa) */}
              {passwordPhase === 2 && (
                <form onSubmit={handlePasswordChange} className="max-w-md space-y-4 mb-12">
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                    <p className="text-sm text-green-800 font-medium">
                      <strong>Paso 2 de 2:</strong> ¡Contraseña verificada! Ahora ingresa tu nueva contraseña.
                    </p>
                  </div>
                  <div>
                    <label className={styles.form.label}>Nueva Contraseña</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                      className={styles.form.input}
                      placeholder="Mínimo 8 caracteres"
                    />
                    <p className="text-xs text-stone-500 mt-1 font-medium">Mínimo 8 caracteres.</p>
                  </div>
                  <div>
                    <label className={styles.form.label}>Confirmar Nueva Contraseña</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                      className={styles.form.input}
                      placeholder="Repite la nueva contraseña"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" disabled={isChangingPassword}>
                      {isChangingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancelPasswordChange}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}

              <div className="border-t border-stone-200 pt-8">
                <h2 className="text-xl font-bold text-red-700 mb-4">Zona de Peligro</h2>
                <div className={styles.dangerZone.container}>
                  <div>
                    <h3 className="font-bold text-red-900">Eliminar Cuenta</h3>
                    <p className="text-sm text-red-700 mt-1 max-w-lg font-medium">
                      Al eliminar tu cuenta, se borrarán todos tus datos personales, direcciones guardadas, métodos de pago e historial de pedidos. Esta acción <strong>no se puede deshacer</strong>.
                    </p>
                  </div>
                  <Button variant="danger" onClick={handleDeleteAccount}>
                    Eliminar mi Cuenta
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cart' && (
            <div className={styles.card.container}>
              <h2 className={`${styles.card.title} mb-6`}>Carrito Guardado</h2>
              {cart.length === 0 ? (
                <p className="text-stone-500 font-medium">No tienes productos en tu carrito.</p>
              ) : (
                <div className="space-y-6">
                  {cart.map(item => (
                    <div key={item.id} className={styles.cartItem.container}>
                      <img src={item.imageUrl} alt={item.name} className={styles.cartItem.image} />
                      <div>
                        <h3 className="font-bold text-black">{item.name}</h3>
                        <p className="text-sm text-stone-600 font-medium">{item.description}</p>
                        <div className="mt-2 flex items-center gap-4">
                          <span className="font-bold text-gold-700">{formatCurrency(item.price)}</span>
                          <span className="text-sm text-stone-500 font-medium">x {item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className={styles.cartItem.totalRow}>
                    <span className="text-lg font-bold text-black">Total Estimado</span>
                    <span className="text-2xl font-bold text-gold-700">
                      {formatCurrency(cart.reduce((sum, i) => sum + (i.price * i.quantity), 0))}
                    </span>
                  </div>
                  <Button className="w-full">Proceder al Pago</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Styles & Helpers ---

const getTabStyle = (isActive: boolean) =>
  `w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${isActive ? 'bg-gold-100 text-black font-bold' : 'text-stone-700 hover:bg-stone-50'
  }`;

const styles = {
  layout: {
    container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
    title: "text-3xl font-bold text-black mb-8",
    grid: "flex flex-col md:flex-row gap-8"
  },
  sidebar: {
    container: "w-full md:w-64 bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden h-fit",
    header: "p-6 bg-gold-50 border-b border-gold-200",
    avatar: "w-12 h-12 rounded-full bg-gold-500 text-black flex items-center justify-center font-bold text-xl border-2 border-gold-400 shadow-sm",
    nav: "p-2",
    cartBadge: "ml-auto bg-black text-gold-500 text-xs px-2 py-0.5 rounded-full font-bold"
  },
  card: {
    container: "bg-white rounded-xl shadow-sm border border-stone-200 p-8",
    header: "flex justify-between items-center mb-6",
    title: "text-xl font-bold text-black"
  },
  form: {
    label: "block text-sm font-bold text-stone-900 mb-1",
    input: "w-full px-4 py-2 border border-stone-300 rounded-lg bg-[#fcfcfc] disabled:text-stone-600 text-black font-medium focus:ring-2 focus:ring-gold-500 outline-none",
    disabledInput: "w-full px-4 py-2 border border-stone-300 rounded-lg bg-stone-100 text-stone-500 cursor-not-allowed font-medium"
  },
  address: {
    card: "border border-stone-200 rounded-lg p-4 hover:border-gold-300 transition-colors flex justify-between items-start group",
    badge: "bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-bold",
    actions: "flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
  },
  security: {
    box: "bg-gold-50 border-l-4 border-gold-400 p-4 mb-6"
  },
  cardList: {
    item: "flex items-center justify-between p-4 border border-stone-200 rounded-lg bg-stone-50",
    brand: "w-12 h-8 bg-stone-200 rounded flex items-center justify-center text-xs font-bold text-stone-600 uppercase",
    token: "text-xs font-mono text-green-700 bg-green-100 px-2 py-1 rounded font-bold"
  },
  dangerZone: {
    container: "border border-red-200 bg-red-50 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
  },
  cartItem: {
    container: "flex gap-4 border-b border-stone-100 pb-4 last:border-0",
    image: "w-24 h-24 object-cover rounded-lg bg-stone-100",
    totalRow: "pt-4 border-t border-stone-200 flex justify-between items-center"
  }
};

export default UserPanel;