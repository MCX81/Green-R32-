import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { wishlistAPI, cartAPI } from '../services/api';
import { useCart } from '../context/CartContext';

const Wishlist = () => {
  const { toast } = useToast();
  const { refreshCounts } = useCart();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      // Get wishlist (returns {_id, userId, products: ['id1', 'id2', ...], updatedAt})
      const wishlistResponse = await wishlistAPI.get();
      const productIds = wishlistResponse.data?.products || [];
      
      console.log('[WISHLIST] Product IDs:', productIds);
      
      if (productIds.length === 0) {
        setWishlistProducts([]);
        return;
      }
      
      // Fetch full product details for each ID
      const productsAPI = (await import('../services/api')).productsAPI;
      const productDetails = await Promise.all(
        productIds.map(async (productId) => {
          try {
            const response = await productsAPI.getById(productId);
            return response.data;
          } catch (error) {
            console.error(`Failed to fetch product ${productId}:`, error);
            return null;
          }
        })
      );
      
      // Filter out null values (failed fetches)
      const validProducts = productDetails.filter(p => p !== null);
      console.log('[WISHLIST] Loaded products:', validProducts.length);
      setWishlistProducts(validProducts);
      
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlistProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await cartAPI.addItem({ productId: product._id, quantity: 1 });
      // Refresh header counts
      refreshCounts();
      toast({
        title: 'Produs adăugat în coș!',
        description: `${product.name} a fost adăugat în coșul tău.`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Eroare!',
        description: 'Nu s-a putut adăuga produsul în coș.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveFromWishlist = async (product) => {
    try {
      await wishlistAPI.remove(product._id);
      setWishlistProducts(products => products.filter(p => p._id !== product._id));
      // Refresh header counts
      refreshCounts();
      toast({
        title: 'Eliminat din favorite!',
        description: `${product.name} a fost eliminat din lista de dorințe.`,
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: 'Eroare!',
        description: 'Nu s-a putut elimina produsul.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

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
