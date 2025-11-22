import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Card } from '../../components/ui/card';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Se încarcă...</div>;
  }

  if (!stats) {
    return <div className="p-8">Eroare la încărcarea statisticilor</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 rounded-2xl border-2 border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vânzări Totale</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalSales.toFixed(2)} Lei</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl border-2 border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Comenzi</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl border-2 border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Utilizatori</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalUsers}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl border-2 border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Produse în Stoc</p>
              <p className="text-2xl font-bold text-orange-600">{stats.productsInStock}/{stats.totalProducts}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Sales Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 rounded-2xl border-2 border-gray-100">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Vânzări pe Luni
          </h2>
          <div className="space-y-4">
            {stats.salesByMonth.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{item.month}</span>
                <div className="flex items-center space-x-4">
                  <div className="w-48 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full"
                      style={{ width: `${(item.sales / Math.max(...stats.salesByMonth.map(m => m.sales))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-green-600 w-24 text-right">
                    {item.sales.toFixed(2)} Lei
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Products */}
        <Card className="p-6 rounded-2xl border-2 border-gray-100">
          <h2 className="text-xl font-bold mb-6">Top Produse</h2>
          <div className="space-y-4">
            {stats.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div>
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.quantity} bucăți vândute</p>
                </div>
                <span className="text-green-600 font-bold">{product.revenue.toFixed(2)} Lei</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="p-6 rounded-2xl border-2 border-gray-100">
        <h2 className="text-xl font-bold mb-6">Comenzi Recente</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">ID Comandă</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Data</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{order.orderId}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('ro-RO')}
                  </td>
                  <td className="py-3 px-4 font-semibold text-green-600">{order.total} Lei</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status === 'pending' ? 'Pending' :
                       order.status === 'processing' ? 'În Procesare' :
                       order.status === 'shipped' ? 'Livrată' :
                       order.status === 'delivered' ? 'Finalizată' : 'Anulată'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
