import React, { useMemo } from 'react';
import { Order, UserData } from '../../types';
import { formatCurrency } from '../../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardStatsProps {
    orders: Order[];
    users: any[]; // Using any for now as UserData might need adjustment based on what userService returns for list
    isLoading: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ orders, users, isLoading }) => {
    
    const stats = useMemo(() => {
        const totalEarnings = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalOrders = orders.length;
        const totalCustomers = users.length;
        const averageTicket = totalOrders > 0 ? totalEarnings / totalOrders : 0;

        return {
            totalEarnings,
            totalOrders,
            totalCustomers,
            averageTicket
        };
    }, [orders, users]);

    const chartData = useMemo(() => {
        // Group orders by date (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        return last7Days.map(date => {
            const dayOrders = orders.filter(o => o.createdAt.toISOString().split('T')[0] === date);
            const sales = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
            return {
                name: new Date(date).toLocaleDateString('es-ES', { weekday: 'short' }),
                ventas: sales
            };
        });
    }, [orders]);

    if (isLoading) {
        return <div className="p-8 text-center">Cargando estadísticas...</div>;
    }

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gold-500">
                    <p className="text-stone-500 text-sm font-bold uppercase">Ingresos Totales</p>
                    <p className="text-2xl font-bold text-black">{formatCurrency(stats.totalEarnings)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <p className="text-stone-500 text-sm font-bold uppercase">Pedidos</p>
                    <p className="text-2xl font-bold text-black">{stats.totalOrders}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                    <p className="text-stone-500 text-sm font-bold uppercase">Clientes</p>
                    <p className="text-2xl font-bold text-black">{stats.totalCustomers}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                    <p className="text-stone-500 text-sm font-bold uppercase">Ticket Promedio</p>
                    <p className="text-2xl font-bold text-black">{formatCurrency(stats.averageTicket)}</p>
                </div>
            </div>

            {/* Sales Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-black mb-4">Ventas de la Semana</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `S/.${value}`} />
                            <Tooltip 
                                formatter={(value: number) => [formatCurrency(value), 'Ventas']}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="ventas" fill="#EAB308" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#CA8A04' : '#EAB308'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Customers Preview */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-black mb-4">Últimos Clientes</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-stone-50 text-stone-600 text-sm">
                            <tr>
                                <th className="p-3">Cliente</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Teléfono</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {users.slice(0, 5).map((user, idx) => (
                                <tr key={idx} className="hover:bg-stone-50">
                                    <td className="p-3 font-medium">
                                        {user.firstName ? `${user.firstName} ${user.lastName}` : 'Usuario sin nombre'}
                                    </td>
                                    <td className="p-3 text-stone-600">{user.email}</td>
                                    <td className="p-3 text-stone-500">{user.phone || '-'}</td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-4 text-center text-stone-500">
                                        No hay clientes registrados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
