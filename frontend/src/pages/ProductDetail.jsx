import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, ChevronRight, Minus, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import ProductCard from '../components/ProductCard';
import { products } from '../mock/mockData';
import { useToast } from '../hooks/use-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const product = products.find(p => p.id === parseInt(id));
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 rounded-2xl">
          <p className="text-gray-500 text-lg">Produsul nu a fost găsit.</p>
          <Link to="/catalog">
            <Button className="mt-4 bg-green-600 hover:bg-green-700 rounded-xl">
              Înapoi la Catalog
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const relatedProducts = products.filter(
    p => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const handleAddToCart = () => {
    toast({
      title: 'Produs adăugat în coș!',
      description: `${quantity}x ${product.name} adăugat în coș.`,
    });
  };

  const handleAddToWishlist = () => {
    toast({
      title: 'Adăugat la favorite!',
      description: `${product.name} a fost adăugat la lista ta de dorințe.`,
    });
  };

  const mockReviews = [
    { id: 1, user: 'Ion Popescu', rating: 5, date: '2024-01-15', comment: 'Produs excelent! Recomandat cu încredere.' },
    { id: 2, user: 'Maria Ionescu', rating: 4, date: '2024-01-10', comment: 'Foarte bun raport calitate-preț.' },
    { id: 3, user: 'Andrei Gheorghe', rating: 5, date: '2024-01-05', comment: 'Livrare rapidă și produs ca în poze.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-green-600">Acasă</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/catalog" className="hover:text-green-600">Catalog</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-semibold">{product.name}</span>
        </div>

        {/* Product Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div>
            <Card className="p-4 rounded-2xl border-2 border-gray-100 mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-cover rounded-xl"
              />
            </Card>
            <div className="grid grid-cols-4 gap-4">
              {[product.image, product.image, product.image, product.image].map((img, idx) => (
                <Card
                  key={idx}
                  className={`p-2 rounded-xl cursor-pointer border-2 transition-all ${
                    selectedImage === idx ? 'border-green-600' : 'border-gray-100'
                  }`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img src={img} alt="" className="w-full h-20 object-cover rounded-lg" />
                </Card>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge className="bg-gray-100 text-gray-700 rounded-xl mb-2">{product.brand}</Badge>
                {product.isNew && (
                  <Badge className="bg-green-600 text-white rounded-xl ml-2">NOU</Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAddToWishlist}
                className="rounded-xl hover:bg-red-50"
              >
                <Heart className="h-6 w-6" />
              </Button>
            </div>

            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center mb-6">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600 ml-2">({product.reviews} recenzii)</span>
            </div>

            {/* Price */}
            <Card className="p-6 rounded-2xl border-2 border-green-200 bg-green-50 mb-6">
              <div className="flex items-baseline justify-between">
                <div>
                  {product.oldPrice && (
                    <span className="text-lg text-gray-400 line-through mr-3">
                      {product.oldPrice} Lei
                    </span>
                  )}
                  <span className="text-4xl font-bold text-green-600">{product.price} Lei</span>
                </div>
                {product.discount > 0 && (
                  <Badge className="bg-red-500 text-white rounded-xl px-4 py-2 text-lg">
                    -{product.discount}%
                  </Badge>
                )}
              </div>
            </Card>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center border-2 border-gray-200 rounded-xl">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-l-xl"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-6 font-semibold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded-r-xl"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl py-6 text-lg font-semibold disabled:bg-gray-300"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Adaugă în Coș
              </Button>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.inStock ? (
                <p className="text-green-600 font-semibold">✓ În stoc</p>
              ) : (
                <p className="text-red-600 font-semibold">✗ Stoc epuizat</p>
              )}
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Truck className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold">Livrare gratuită</p>
                  <p className="text-sm text-gray-600">Pentru comenzi peste 300 Lei</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold">Garanție 2 ani</p>
                  <p className="text-sm text-gray-600">Conform legislației în vigoare</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold">Returnare 30 zile</p>
                  <p className="text-sm text-gray-600">Fără costuri suplimentare</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="rounded-xl border-2 border-gray-100">
            <TabsTrigger value="description" className="rounded-xl">Descriere</TabsTrigger>
            <TabsTrigger value="specs" className="rounded-xl">Specificații</TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-xl">Recenzii ({product.reviews})</TabsTrigger>
          </TabsList>

          <TabsContent value="description">
            <Card className="p-6 rounded-2xl">
              <p className="text-gray-700 leading-relaxed">
                {product.description || 'Descriere detaliată a produsului. Acest produs oferă caracteristici excelente și performanță de înaltă calitate.'}
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="specs">
            <Card className="p-6 rounded-2xl">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-semibold">Brand:</span>
                  <span>{product.brand}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-semibold">Model:</span>
                  <span>{product.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-semibold">Cod produs:</span>
                  <span>EMG-{product.id.toString().padStart(6, '0')}</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card className="p-6 rounded-2xl">
              <div className="space-y-6">
                {mockReviews.map(review => (
                  <div key={review.id} className="border-b pb-6 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{review.user}</span>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Produse Similare</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {relatedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => handleAddToCart(product)}
                onAddToWishlist={() => handleAddToWishlist(product)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
