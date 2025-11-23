import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { CheckCircle, Package, Truck, Home } from 'lucide-react';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { orderId, orderData } = location.state || {};

  // Redirect if no order data
  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 text-center rounded-2xl max-w-md">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Comandă negăsită</h2>
          <p className="text-gray-500 mb-6">Nu am găsit detalii despre această comandă.</p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-green-600 hover:bg-green-700 rounded-xl"
          >
            Înapoi Acasă
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Comandă Plasată cu Succes!</h1>
          <p className="text-xl text-gray-600">
            Vă mulțumim pentru comanda dvs. #<span className="font-semibold">{orderId.slice(-8)}</span>
          </p>
        </div>

        {/* Order Details */}
        <Card className="p-8 rounded-2xl border-2 border-gray-100 mb-6">
          <h2 className="text-2xl font-bold mb-6">Detalii Comandă</h2>

          {/* Status Timeline */}
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200" style={{ zIndex: 0 }}></div>
            
            <div className="flex flex-col items-center relative z-10">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm font-semibold">Comandă Plasată</p>
              <p className="text-xs text-gray-500">Acum</p>
            </div>

            <div className="flex flex-col items-center relative z-10">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-500">Procesare</p>
              <p className="text-xs text-gray-500">În curând</p>
            </div>

            <div className="flex flex-col items-center relative z-10">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                <Truck className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-500">În Livrare</p>
              <p className="text-xs text-gray-500">24-48h</p>
            </div>

            <div className="flex flex-col items-center relative z-10">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                <Home className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-500">Livrată</p>
              <p className="text-xs text-gray-500">-</p>
            </div>
          </div>

          {/* Shipping Address */}
          {orderData?.shippingAddress && (
            <div className="mb-6">
              <h3 className="font-bold mb-3">Adresă Livrare</h3>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="font-semibold">{orderData.shippingAddress.name}</p>
                <p className="text-gray-600">{orderData.shippingAddress.phone}</p>
                <p className="text-gray-600">{orderData.shippingAddress.address}</p>
                <p className="text-gray-600">
                  {orderData.shippingAddress.city}, {orderData.shippingAddress.county}
                  {orderData.shippingAddress.postalCode && `, ${orderData.shippingAddress.postalCode}`}
                </p>
              </div>
            </div>
          )}

          {/* Products */}
          {orderData?.items && (
            <div className="mb-6">
              <h3 className="font-bold mb-3">Produse Comandate</h3>
              <div className="space-y-3">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        Cantitate: {item.quantity} x {item.price} Lei
                      </p>
                    </div>
                    <p className="font-bold text-green-600">
                      {item.quantity * item.price} Lei
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="border-t pt-6">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">{orderData?.subtotal || 0} Lei</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Livrare:</span>
                <span className="font-semibold">
                  {orderData?.shipping === 0 ? (
                    <span className="text-green-600">Gratuit</span>
                  ) : (
                    `${orderData?.shipping || 0} Lei`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2 border-t">
                <span>Total:</span>
                <span className="text-green-600">{orderData?.total || 0} Lei</span>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>Metodă de plată:</strong>{' '}
                {orderData?.paymentMethod === 'cash' ? 'Numerar la Livrare' : 'Card Online'}
              </p>
            </div>
          </div>
        </Card>

        {/* Email Notification */}
        <Card className="p-6 rounded-2xl border-2 border-gray-100 mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold mb-2">Confirmarea comenzii a fost trimisă pe email</h3>
              <p className="text-gray-600 text-sm">
                Veți primi un email cu detaliile comenzii și informații despre livrare la adresa{' '}
                <span className="font-semibold">{orderData?.shippingAddress?.email || 'emailul dvs.'}</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/catalog">
            <Button variant="outline" className="w-full sm:w-auto rounded-xl border-2 px-8">
              Continuă Cumpărăturile
            </Button>
          </Link>
          <Link to="/">
            <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 rounded-xl px-8">
              Înapoi Acasă
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
