import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { categoriesAPI } from '../services/api';
import { brands, priceRanges } from '../mock/mockData';

const CatalogSidebar = ({ selectedBrands, onBrandToggle, selectedPriceRange, onPriceRangeChange, onResetFilters }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  
  const categorySlug = searchParams.get('category');

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Get main categories (no parentId)
  const mainCategories = categories.filter(cat => !cat.parentId);
  
  // Calculate current state DIRECTLY from URL and categories - NO STATE!
  let currentCategory = null;
  let subcategories = [];
  let displayCategories = mainCategories;
  let title = 'Toate Categoriile';
  
  if (categorySlug && categories.length > 0) {
    // Find the selected category (can be any level)
    const selectedCat = categories.find(cat => cat.slug === categorySlug);
    
    if (selectedCat) {
      currentCategory = selectedCat;
      // Get children of this category
      const children = categories.filter(cat => cat.parentId === selectedCat._id);
      
      if (children.length > 0) {
        // Has children - show them
        subcategories = children;
        displayCategories = children;
        title = selectedCat.name;
      } else {
        // No children - this is a leaf category, show all products from this category
        // Keep the sidebar showing this category selected
        displayCategories = mainCategories;
        title = 'Toate Categoriile';
      }
    }
  }

  return (
    <aside className="w-64 flex-shrink-0 sticky top-24 self-start">
      {/* Categories Card */}
      <Card className="rounded-2xl border-2 border-gray-100 overflow-hidden mb-4">
        <div className="bg-green-600 text-white p-4 font-bold text-lg">
          {title}
        </div>
        <nav className="divide-y divide-gray-100">
          {/* Back button if we're in subcategories */}
          {currentCategory && subcategories.length > 0 && (
            <Link
              to="/"
              className="flex items-center p-4 hover:bg-green-50 transition-colors group"
            >
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 rotate-180 mr-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">
                Înapoi la categorii
              </span>
            </Link>
          )}
          
          {displayCategories.map((cat) => {
            // Check if this category has subcategories
            const hasSubcategories = categories.some(subcat => subcat.parentId === cat._id);
            
            return (
              <Link
                key={cat._id}
                to={`/catalog?category=${cat.slug}`}
                className={`flex items-center justify-between p-4 hover:bg-green-50 transition-colors group ${
                  categorySlug === cat.slug ? 'bg-green-50' : ''
                }`}
              >
                <span className={`text-sm font-medium ${
                  categorySlug === cat.slug ? 'text-green-600' : 'text-gray-700 group-hover:text-green-600'
                }`}>
                  {cat.name}
                </span>
                {/* Only show arrow if category has subcategories */}
                {hasSubcategories && (
                  <ChevronRight className={`h-4 w-4 ${
                    categorySlug === cat.slug ? 'text-green-600' : 'text-gray-400 group-hover:text-green-600'
                  }`} />
                )}
              </Link>
            );
          })}
        </nav>
      </Card>

      {/* Filters Card */}
      <Card className="p-6 rounded-2xl border-2 border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg">Filtre</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
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
                    onPriceRangeChange(checked ? range : null);
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
          <div className="space-y-2">
            {brands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() => onBrandToggle(brand)}
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
      </Card>
    </aside>
  );
};

export default CatalogSidebar;
