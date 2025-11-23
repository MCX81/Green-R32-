import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Smartphone, Laptop, Tv, Refrigerator, Gamepad2, Shirt, BookOpen, Home as HomeIcon, Dumbbell, Baby } from 'lucide-react';
import { Card } from './ui/card';
import { categoriesAPI } from '../services/api';

const CategorySidebar = () => {
  const [categories, setCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  
  const iconMap = {
    'Smartphone': Smartphone,
    'Laptop': Laptop,
    'Tv': Tv,
    'Refrigerator': Refrigerator,
    'Gamepad2': Gamepad2,
    'Shirt': Shirt,
    'BookOpen': BookOpen,
    'Home': HomeIcon,
    'Dumbbell': Dumbbell,
    'Baby': Baby,
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Get only main categories (no parentId)
  const mainCategories = categories.filter(cat => !cat.parentId);
  
  // Get subcategories for a parent
  const getSubcategories = (parentId) => {
    return categories.filter(cat => cat.parentId === parentId);
  };

  return (
    <div className="relative" style={{ position: 'relative', zIndex: 10 }}>
      <Card className="rounded-2xl border-2 border-gray-100 overflow-visible sticky top-24">
        <div className="bg-green-600 text-white p-4 font-bold text-lg">
          Toate Categoriile
        </div>
        <nav className="divide-y divide-gray-100 relative" style={{ overflow: 'visible' }}>
          {mainCategories.map((category, index) => {
            const Icon = iconMap[category.icon] || Smartphone;
            const subcategories = getSubcategories(category._id);
            const hasSubcategories = subcategories.length > 0;
            
            return (
              <div
                key={category._id}
                onMouseEnter={() => setHoveredCategory(category._id)}
                onMouseLeave={() => setHoveredCategory(null)}
                className="relative"
                style={{ position: 'relative' }}
              >
                <Link
                  to={`/catalog?category=${category.slug}`}
                  className="flex items-center justify-between p-4 hover:bg-green-50 transition-colors group relative"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">
                      {category.name}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
                </Link>
                
                {/* Subcategories Panel */}
                {hasSubcategories && hoveredCategory === category._id && (
                  <div 
                    className="absolute bg-white border-2 border-gray-100 rounded-2xl shadow-2xl"
                    style={{ 
                      left: '100%',
                      top: 0,
                      marginLeft: '4px',
                      width: '256px',
                      zIndex: 9999,
                      position: 'absolute'
                    }}
                    onMouseEnter={() => setHoveredCategory(category._id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <div className="p-2">
                      <div className="font-bold text-sm text-gray-900 p-3 border-b">
                        {category.name}
                      </div>
                      {subcategories.map((subcat) => (
                        <Link
                          key={subcat._id}
                          to={`/catalog?category=${subcat.slug}`}
                          className="block p-3 hover:bg-green-50 rounded-xl transition-colors"
                        >
                          <span className="text-sm text-gray-700 hover:text-green-600">
                            {subcat.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </Card>
    </div>
  );
};

export default CategorySidebar;
