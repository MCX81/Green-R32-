import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import CategorySidebar from '../components/CategorySidebar';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Slider } from '../components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { products, categories, brands, priceRanges } from '../mock/mockData';
import { useToast } from '../hooks/use-toast';

const Catalog = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(true);

  const category = searchParams.get('category');
  const filter = searchParams.get('filter');
  const search = searchParams.get('search');

  useEffect(() => {
    let result = [...products];

    // Filter by category
    if (category) {
      result = result.filter(p => p.category === category);
    }

    // Filter by special filters
    if (filter === 'oferte') {
      result = result.filter(p => p.discount > 0);
    } else if (filter === 'noutati') {
      result = result.filter(p => p.isNew);
    }

    // Search filter
    if (search) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }

    // Price range filter
    if (selectedPriceRange) {
      result = result.filter(p => 
        p.price >= selectedPriceRange.min && p.price <= selectedPriceRange.max
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  }, [category, filter, search, selectedBrands, selectedPriceRange, sortBy]);

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

  const getCategoryName = () => {
    const cat = categories.find(c => c.slug === category);
    return cat ? cat.name : 'Toate Produsele';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Categories Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <CategorySidebar />
          </aside>

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

            <div className="flex gap-6">
              {/* Filters Sidebar */}
              <aside className={`${showFilters ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden flex-shrink-0`}>
                <Card className="p-6 rounded-2xl border-2 border-gray-100 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg">Filtre</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedBrands([]);
                    setSelectedPriceRange(null);
                  }}
                  className="text-sm text-green-600 hover:text-green-700 rounded-xl"
                >
                  Resetează
                </Button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Preț</h3>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <div key={range.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`price-${range.id}`}
                        checked={selectedPriceRange?.id === range.id}
                        onCheckedChange={(checked) => {
                          setSelectedPriceRange(checked ? range : null);
                        }}
                        className="rounded-md"
                      />
                      <label
                        htmlFor={`price-${range.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {range.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Brand</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {brands.map((brand) => (
                    <div key={brand} className="flex items-center space-x-2">
                      <Checkbox
                        id={`brand-${brand}`}
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={() => handleBrandToggle(brand)}
                        className="rounded-md"
                      />
                      <label
                        htmlFor={`brand-${brand}`}
                        className="text-sm cursor-pointer"
                      >
                        {brand}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock Status */}
              <div>
                <h3 className="font-semibold mb-3">Disponibilitate</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="in-stock" className="rounded-md" />
                    <label htmlFor="in-stock" className="text-sm cursor-pointer">
                      În stoc
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="on-sale" className="rounded-md" />
                    <label htmlFor="on-sale" className="text-sm cursor-pointer">
                      Cu reducere
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort and Filter Toggle */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-xl border-2"
              >
                <SlidersHorizontal className="h-5 w-5 mr-2" />
                {showFilters ? 'Ascunde Filtre' : 'Afișează Filtre'}
              </Button>

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
  );
};

export default Catalog;
