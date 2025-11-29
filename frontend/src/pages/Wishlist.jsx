import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { products } from '../mock/mockData';
import { useToast } from '../hooks/use-toast';

const Wishlist = () => {
  const { toast } = useToast();
  const [wishlistProducts] = useState(products.slice(0, 4));

  const handleAddToCart = (product) => {
    toast({
      title: 'Produs adăugat în coș!',
      description: `${product.name} a fost adăugat în coșul tău.`,
    });
  };

  const handleRemoveFromWishlist = (product) => {
    toast({
      title: 'Eliminat din favorite!',
      description: `${product.name} a fost eliminat din lista de dorințe.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Lista Mea de Dorințe</h1>

        {wishlistProducts.length === 0 ? (
          <Card className="p-12 text-center rounded-2xl">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">Lista ta de dorințe este goală</p>
            <Link to="/catalog">
              <Button className="bg-green-600 hover:bg-green-700 rounded-xl">
                Explorează Produsele
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {wishlistProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleRemoveFromWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
