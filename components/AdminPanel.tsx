import React, { useState, useEffect } from 'react';
import { getAllOrders } from '../services/orderService';
import { getAllUsers } from '../services/userService';
import { CouponManager } from './admin/CouponManager';
import { InventoryManager } from './admin/InventoryManager';
import { PriceScheduler } from './admin/PriceScheduler';
import { PopupManager } from './admin/PopupManager';
import { OrderManager } from './admin/OrderManager';
import { DashboardStats } from './admin/DashboardStats';

type TabType = 'dashboard' | 'orders' | 'inventory' | 'coupons' | 'pricing' | 'popups';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  // Dashboard state
  const [dashboardData, setDashboardData] = useState<{ orders: any[], users: any[] }>({ orders: [], users: [] });
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  useEffect(() => {
      const loadDashboardData = async () => {
          if (activeTab === 'dashboard') {
              setLoadingDashboard(true);
              try {
                  const [ordersData, usersData] = await Promise.all([
                      getAllOrders(),
                      getAllUsers()
                  ]);
                  setDashboardData({ orders: ordersData, users: usersData });
              } catch (error) {
                  console.error("Error loading dashboard data:", error);
              } finally {
                  setLoadingDashboard(false);
              }
          }
      };
      loadDashboardData();
  }, [activeTab]);

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: '📊' },
    { id: 'orders' as TabType, label: 'Pedidos', icon: '📋' },
    { id: 'inventory' as TabType, label: 'Inventario', icon: '📦' },
    { id: 'coupons' as TabType, label: 'Cupones', icon: '🎟️' },
    { id: 'pricing' as TabType, label: 'Precios', icon: '💰' },
    { id: 'popups' as TabType, label: 'Popups', icon: '🎪' },
  ];

  return (
    <div className={styles.layout}>
      <h1 className={styles.pageTitle}>Panel de Administración</h1>

      {/* Tab Navigation */}
      <div className={styles.tabContainer}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : styles.tabInactive}`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className={styles.content}>
        {activeTab === 'dashboard' && (
            <DashboardStats 
                orders={dashboardData.orders} 
                users={dashboardData.users} 
                isLoading={loadingDashboard} 
            />
        )}
        
        {activeTab === 'orders' && <OrderManager />}
        {activeTab === 'inventory' && <InventoryManager />}
        {activeTab === 'coupons' && <CouponManager />}
        {activeTab === 'pricing' && <PriceScheduler />}
        {activeTab === 'popups' && <PopupManager />}
      </div>
    </div>
  );
};

const styles = {
  layout: "max-w-7xl mx-auto p-6",
  pageTitle: "text-3xl font-bold text-black mb-6",
  tabContainer: "flex gap-2 mb-6 border-b border-stone-200 overflow-x-auto",
  tab: "flex items-center gap-2 px-4 py-3 font-bold whitespace-nowrap transition-colors",
  tabActive: "border-b-2 border-gold-600 text-gold-700",
  tabInactive: "text-stone-600 hover:text-black",
  content: "mt-6"
};

export default AdminPanel;