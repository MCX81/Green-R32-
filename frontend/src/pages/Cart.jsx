import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';

const Cart = () => {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Samsung Galaxy S24 Ultra 256GB',
      price: 5499,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200&q=80'
    },
    {
      id: 2,
      name: 'MacBook Pro 16" M3 Pro 512GB',
      price: 13999,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&q=80'
    }
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item => item.id === id ? { ...item, quantity: newQuantity } : item)
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
    toast({
      title: 'Produs eliminat!',
      description: 'Produsul a fost eliminat din coș.',
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 300 ? 0 : 30;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Coșul Meu</h1>

        {cartItems.length === 0 ? (
          <Card className="p-12 text-center rounded-2xl">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">Coșul tău este gol</p>
            <Link to="/catalog">
              <Button className="bg-green-600 hover:bg-green-700 rounded-xl">
                Începe cumpărăturile
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <Card key={item.id} className="p-6 rounded-2xl border-2 border-gray-100">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <Link to={`/product/${item.id}`}>
                        <h3 className="font-semibold text-lg mb-2 hover:text-green-600 transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-2xl font-bold text-green-600">{item.price} Lei</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border-2 border-gray-200 rounded-xl">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="rounded-l-xl"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-4 font-semibold">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="rounded-r-xl"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="p-6 rounded-2xl border-2 border-gray-100 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Sumar Comandă</h2>

                <div className="space-y-4 mb-6">
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
                  {shipping > 0 && (
                    <p className="text-sm text-gray-500">
                      Adăugați încă {300 - subtotal} Lei pentru livrare gratuită!
                    </p>
                  )}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-green-600">{total} Lei</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Input
                    type="text"
                    placeholder="Cod promosţional"
                    className="rounded-xl border-2"
                  />
                  <Button variant="outline" className="w-full rounded-xl border-2">
                    Aplică Cod
                  </Button>
                </div>

                <Button className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white rounded-xl py-6 text-lg font-semibold">
                  Finalizează Comanda
                </Button>

                <Link to="/catalog">
                  <Button variant="outline" className="w-full mt-3 rounded-xl border-2">
                    Continuă Cumpărăturile
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
