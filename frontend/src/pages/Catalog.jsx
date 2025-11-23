import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import CatalogSidebar from '../components/CatalogSidebar';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { productsAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';

const Catalog = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(true);

  const category = searchParams.get('category');
  const filter = searchParams.get('filter');
  const search = searchParams.get('search');

  useEffect(() => {
    loadProducts();
  }, [category, filter, search, selectedBrands, selectedPriceRange, sortBy]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      
      // Apply filters
      if (category) params.category = category;
      if (search) params.search = search;
      
      // Special filters
      if (filter === 'oferte') {
        params.discount = true;
      } else if (filter === 'noutati') {
        params.is_new = true;
      }
      
      // Brand filter (client-side for now, can be moved to backend)
      if (selectedBrands.length > 0) {
        params.brand = selectedBrands[0]; // Backend supports single brand, we'll filter rest client-side
      }
      
      // Price range
      if (selectedPriceRange) {
        params.min_price = selectedPriceRange.min;
        params.max_price = selectedPriceRange.max;
      }
      
      // Sorting
      const sortMapping = {
        'price-asc': 'price_asc',
        'price-desc': 'price_desc',
        'rating': 'rating',
        'name': 'name'
      };
      if (sortBy && sortBy !== 'default') {
        params.sort_by = sortMapping[sortBy];
      }
      
      const response = await productsAPI.getAll(params);
      let products = response.data;
      
      // Additional client-side filtering for multiple brands
      if (selectedBrands.length > 1) {
        products = products.filter(p => selectedBrands.includes(p.brand));
      }
      
      setFilteredProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut încărca produsele.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const handleResetFilters = () => {
    setSelectedBrands([]);
    setSelectedPriceRange(null);
  };

  const getCategoryName = () => {
    if (category) {
      // Try to get category name from URL parameter
      return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    return 'Toate Produsele';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar with Categories and Filters */}
          <CatalogSidebar 
            selectedBrands={selectedBrands}
            onBrandToggle={handleBrandToggle}
            selectedPriceRange={selectedPriceRange}
            onPriceRangeChange={setSelectedPriceRange}
            onResetFilters={handleResetFilters}
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">
                {filter === 'oferte' ? 'Oferte Speciale' : 
                 filter === 'noutati' ? 'Noutăți' :
                 search ? `Rezultate pentru: "${search}"` :
                 getCategoryName()}
              </h1>
              <p className="text-gray-600">{filteredProducts.length} produse găsite</p>
            </div>

            {/* Sort */}
            <div className="flex items-center justify-between mb-6">
              <div></div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sortează după:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 rounded-xl border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Implicit</SelectItem>
                    <SelectItem value="price-asc">Preț crescator</SelectItem>
                    <SelectItem value="price-desc">Preț descrescator</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="name">Nume A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Products */}
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onAddToWishlist={handleAddToWishlist}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center rounded-2xl">
                    <p className="text-gray-500 text-lg">Nu au fost găsite produse.</p>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;
