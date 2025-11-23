import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ordersAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';
import { CheckCircle, Package, Truck, CreditCard, MapPin } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get cart data from navigation state
  const { cartItems = [], total = 0, subtotal = 0, shipping = 0 } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: '',
    county: '',
    postalCode: '',
    notes: '',
    paymentMethod: 'cash'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Autentificare necesară',
        description: 'Trebuie să fiți autentificat pentru a plasa o comandă.',
        variant: 'destructive',
      });
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: 'Coș gol',
        description: 'Adăugați produse în coș înainte de a finaliza comanda.',
        variant: 'destructive',
      });
      navigate('/cart');
      return;
    }

    setLoading(true);

    try {
      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          productId: item._id || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        shippingAddress: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          county: formData.county,
          postalCode: formData.postalCode
        },
        paymentMethod: formData.paymentMethod,
        subtotal: subtotal,
        shipping: shipping,
        total: total,
        notes: formData.notes,
        status: 'pending'
      };

      // Create order
      const response = await ordersAPI.create(orderData);
      
      // Clear cart (you might want to implement this in a cart context)
      localStorage.removeItem('cart');
      
      toast({
        title: 'Comandă plasată cu succes!',
        description: `Comanda dvs. #${response.data._id} a fost înregistrată.`,
      });
      
      // Navigate to order confirmation
      navigate('/order-confirmation', { 
        state: { 
          orderId: response.data._id,
          orderData: response.data 
        } 
      });
      
    } catch (error) {
      console.error('Order creation error:', error);
      toast({
        title: 'Eroare',
        description: error.response?.data?.detail || 'Nu s-a putut plasa comanda. Încercați din nou.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Redirect if no cart data
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 text-center rounded-2xl max-w-md">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Coș gol</h2>
          <p className="text-gray-500 mb-6">Adăugați produse în coș pentru a continua.</p>
          <Button 
            onClick={() => navigate('/catalog')}
            className="bg-green-600 hover:bg-green-700 rounded-xl"
          >
            Mergi la Catalog
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Finalizare Comandă</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <Card className="p-6 rounded-2xl border-2 border-gray-100">
                <div className="flex items-center space-x-2 mb-6">
                  <Truck className="h-6 w-6 text-green-600" />
                  <h2 className="text-xl font-bold">Date Livrare</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nume Complet *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-2 rounded-xl border-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefon *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="mt-2 rounded-xl border-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-2 rounded-xl border-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="address">Adresă *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="Strada, Număr, Bloc, Scară, Apartament"
                      className="mt-2 rounded-xl border-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">Oraș *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="mt-2 rounded-xl border-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="county">Județ *</Label>
                    <Input
                      id="county"
                      name="county"
                      value={formData.county}
                      onChange={handleChange}
                      required
                      className="mt-2 rounded-xl border-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="postalCode">Cod Poștal</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="mt-2 rounded-xl border-2"
                    />
                  </div>
                </div>
              </Card>

              {/* Payment Method */}
              <Card className="p-6 rounded-2xl border-2 border-gray-100">
                <div className="flex items-center space-x-2 mb-6">
                  <CreditCard className="h-6 w-6 text-green-600" />
                  <h2 className="text-xl font-bold">Metodă de Plată</h2>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-green-500 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">Numerar la Livrare</p>
                      <p className="text-sm text-gray-500">Plătiți când primiți comanda</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-green-500 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">Card Online</p>
                      <p className="text-sm text-gray-500">Plată securizată cu cardul</p>
                    </div>
                  </label>
                </div>
              </Card>

              {/* Additional Notes */}
              <Card className="p-6 rounded-2xl border-2 border-gray-100">
                <Label htmlFor="notes">Observații (opțional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Instrucțiuni speciale pentru livrare..."
                  className="mt-2 rounded-xl border-2"
                  rows={3}
                />
              </Card>

              {/* Mobile Summary - visible only on small screens */}
              <div className="lg:hidden">
                <Card className="p-6 rounded-2xl border-2 border-gray-100">
                  <h3 className="font-bold mb-4">Sumar Comandă</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-semibold">{subtotal} Lei</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Livrare:</span>
                      <span className="font-semibold">{shipping === 0 ? 'Gratuit' : `${shipping} Lei`}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-green-600">{total} Lei</span>
                    </div>
                  </div>
                </Card>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-6 text-lg font-semibold"
              >
                {loading ? 'Se procesează...' : 'Plasează Comanda'}
              </Button>
            </form>
          </div>

          {/* Order Summary - Desktop */}
          <div className="hidden lg:block">
            <Card className="p-6 rounded-2xl border-2 border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Sumar Comandă</h2>

              {/* Products */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id || item._id} className="flex space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm line-clamp-2">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x {item.price} Lei
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">{subtotal} Lei</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Livrare:</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-green-600">Gratuit</span>
                    ) : (
                      `${shipping} Lei`
                    )}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">{total} Lei</span>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Livrare rapidă 24-48h</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Retur gratuit 30 zile</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Plată securizată</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
