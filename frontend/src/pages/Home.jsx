import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Truck, Shield, Headphones, Tag } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import CategorySidebar from '../components/CategorySidebar';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { banners } from '../mock/mockData';
import { productsAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';

const Home = () => {
  const { toast } = useToast();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [offerProducts, setOfferProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // Load offer products
      const offersResponse = await productsAPI.getAll({ discount: true, limit: 3 });
      setOfferProducts(offersResponse.data);

      // Load new products
      const newResponse = await productsAPI.getAll({ is_new: true, limit: 3 });
      setNewProducts(newResponse.data);

      // Load featured products
      const featuredResponse = await productsAPI.getAll({ featured: true, limit: 6 });
      setFeaturedProducts(featuredResponse.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleAddToCart = (product) => {
    toast({
      title: 'Produs adăugat în coș!',
      description: `${product.name} a fost adăugat în coșul tău.`,
    });
  };

  const handleAddToWishlist = (product) => {
    toast({
      title: 'Adăugat la favorite!',
      description: `${product.name} a fost adăugat la lista ta de dorințe.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-6">
          {/* Left Sidebar - Categories */}
          <aside className="w-64 flex-shrink-0">
            <CategorySidebar />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Features as Banners */}
            <section className="grid grid-cols-4 gap-3 mb-4">
              <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4 rounded-xl flex items-center space-x-3">
                <Truck className="h-8 w-8 flex-shrink-0" />
                <div>
                  <div className="font-bold text-sm">Livrare Gratuită</div>
                  <div className="text-xs opacity-90">Peste 300 Lei</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4 rounded-xl flex items-center space-x-3">
                <Shield className="h-8 w-8 flex-shrink-0" />
                <div>
                  <div className="font-bold text-sm">Garanție Extinsă</div>
                  <div className="text-xs opacity-90">Pe toate produsele</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4 rounded-xl flex items-center space-x-3">
                <Headphones className="h-8 w-8 flex-shrink-0" />
                <div>
                  <div className="font-bold text-sm">Suport 24/7</div>
                  <div className="text-xs opacity-90">Mereu disponibil</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4 rounded-xl flex items-center space-x-3">
                <Tag className="h-8 w-8 flex-shrink-0" />
                <div>
                  <div className="font-bold text-sm">Prețuri Competitive</div>
                  <div className="text-xs opacity-90">Cele mai bune oferte</div>
                </div>
              </div>
            </section>

            {/* Hero Banner Carousel */}
            <section className="relative h-[400px] overflow-hidden rounded-2xl mb-6">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentBanner ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
                    <div className="px-8">
                      <h1 className="text-4xl font-bold text-white mb-3">{banner.title}</h1>
                      <p className="text-xl text-white mb-6">{banner.subtitle}</p>
                      <Link to={banner.link}>
                        <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-5 text-lg font-semibold">
                          Descoperă Ofertele
                          <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {/* Banner Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBanner(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentBanner ? 'bg-white w-8' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </section>

            {/* Offer Products */}
            <section className="py-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Oferte Speciale</h2>
                <Link to="/catalog?filter=oferte">
                  <Button variant="ghost" className="text-green-600 hover:text-green-700 rounded-xl">
                    Vezi Toate
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {offerProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                  />
                ))}
              </div>
            </section>

            {/* New Products */}
            <section className="py-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Noutăți</h2>
                <Link to="/catalog?filter=noutati">
                  <Button variant="ghost" className="text-green-600 hover:text-green-700 rounded-xl">
                    Vezi Toate
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {newProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
