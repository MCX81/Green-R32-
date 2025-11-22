import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Truck, Shield, Headphones, Tag } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { products, categories, banners } from '../mock/mockData';
import { useToast } from '../hooks/use-toast';

const Home = () => {
  const { toast } = useToast();
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const offerProducts = products.filter(p => p.discount > 0).slice(0, 4);
  const newProducts = products.filter(p => p.isNew).slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner Carousel */}
      <section className="relative h-[500px] overflow-hidden rounded-3xl mx-4 mt-4">
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
              <div className="max-w-7xl mx-auto px-8">
                <h1 className="text-5xl font-bold text-white mb-4">{banner.title}</h1>
                <p className="text-2xl text-white mb-8">{banner.subtitle}</p>
                <Link to={banner.link}>
                  <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-8 py-6 text-lg font-semibold">
                    Descoperă Ofertele
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Banner Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
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

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 rounded-2xl border-2 border-gray-100 hover:border-green-500 transition-all">
            <Truck className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">Livrare Gratuită</h3>
            <p className="text-sm text-gray-600">Pentru comenzi peste 300 Lei</p>
          </Card>
          <Card className="p-6 rounded-2xl border-2 border-gray-100 hover:border-green-500 transition-all">
            <Shield className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">Garanție Extinsă</h3>
            <p className="text-sm text-gray-600">Pe toate produsele</p>
          </Card>
          <Card className="p-6 rounded-2xl border-2 border-gray-100 hover:border-green-500 transition-all">
            <Headphones className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">Suport 24/7</h3>
            <p className="text-sm text-gray-600">Echipa noastră e mereu aici</p>
          </Card>
          <Card className="p-6 rounded-2xl border-2 border-gray-100 hover:border-green-500 transition-all">
            <Tag className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">Prețuri Competitive</h3>
            <p className="text-sm text-gray-600">Cele mai bune oferte</p>
          </Card>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Explorează Categoriile</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link key={category.id} to={`/catalog?category=${category.slug}`}>
              <Card className="p-6 text-center rounded-2xl border-2 border-gray-100 hover:border-green-500 hover:shadow-lg transition-all group">
                <div className="bg-green-100 rounded-2xl p-4 mb-4 mx-auto w-fit group-hover:bg-green-600 transition-colors">
                  <div className="h-12 w-12 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-sm">{category.name}</h3>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Offer Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Oferte Speciale</h2>
          <Link to="/catalog?filter=oferte">
            <Button variant="ghost" className="text-green-600 hover:text-green-700 rounded-xl">
              Vezi Toate
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Noutăți</h2>
          <Link to="/catalog?filter=noutati">
            <Button variant="ghost" className="text-green-600 hover:text-green-700 rounded-xl">
              Vezi Toate
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
  );
};

export default Home;
