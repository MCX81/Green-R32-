import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Card } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { useToast } from '../../hooks/use-toast';
import { Eye } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await adminAPI.getOrders(params);
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, { status: newStatus });
      toast({ title: 'Status comandă actualizat cu succes!' });
      loadOrders();
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut actualiza statusul',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'În Așteptare';
      case 'processing': return 'În Procesare';
      case 'shipped': return 'Expediată';
      case 'delivered': return 'Livrată';
      case 'cancelled': return 'Anulată';
      default: return status;
    }
  };

  if (loading) {
    return <div className="p-8">Se încarcă...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Comenzi</h1>
        
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48 rounded-xl border-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate Comenzile</SelectItem>
            <SelectItem value="pending">În Așteptare</SelectItem>
            <SelectItem value="processing">În Procesare</SelectItem>
            <SelectItem value="shipped">Expediate</SelectItem>
            <SelectItem value="delivered">Livrate</SelectItem>
            <SelectItem value="cancelled">Anulate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card className="rounded-2xl border-2 border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">ID Comandă</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Data</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Client</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Total</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    Nu există comenzi
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="border-t hover:bg-gray-50">
                    <td className="py-4 px-6 font-semibold">{order.orderId}</td>
                    <td className="py-4 px-6 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('ro-RO')}
                    </td>
                    <td className="py-4 px-6 text-gray-600">{order.shippingAddress?.name || 'N/A'}</td>
                    <td className="py-4 px-6 font-semibold text-green-600">{order.total} Lei</td>
                    <td className="py-4 px-6">
                      <Select 
                        value={order.status} 
                        onValueChange={(value) => updateOrderStatus(order._id, value)}
                      >
                        <SelectTrigger className={`w-40 rounded-xl ${getStatusColor(order.status)}`}>
                          <SelectValue>{getStatusText(order.status)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">În Așteptare</SelectItem>
                          <SelectItem value="processing">În Procesare</SelectItem>
                          <SelectItem value="shipped">Expediată</SelectItem>
                          <SelectItem value="delivered">Livrată</SelectItem>
                          <SelectItem value="cancelled">Anulată</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-4 px-6">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Orders;
