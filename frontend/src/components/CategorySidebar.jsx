import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Smartphone, Laptop, Tv, Refrigerator, Gamepad2, Shirt, BookOpen, Home as HomeIcon, Dumbbell, Baby } from 'lucide-react';
import { Card } from './ui/card';
import { categoriesAPI } from '../services/api';

const CategorySidebar = () => {
  const [categories, setCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });
  const categoryRefs = useRef({});
  const leaveTimeoutRef = useRef(null);
  const location = useLocation();
  
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
    
    // Cleanup timeout on unmount
    return () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  // Reset hover state when location changes (navigation between pages)
  useEffect(() => {
    setHoveredCategory(null);
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  }, [location.pathname]);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
      console.log(`CategorySidebar: Loaded ${response.data.length} categories`);
      // Reset refs when categories change
      categoryRefs.current = {};
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

  const handleCategoryHover = (categoryId) => {
    // Clear any pending leave timeout
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    
    // Check if category has subcategories before showing panel
    const subcategories = getSubcategories(categoryId);
    console.log(`CategorySidebar: Hover on category ${categoryId}, found ${subcategories.length} subcategories`);
    
    if (subcategories.length === 0) {
      console.log(`CategorySidebar: No subcategories, not showing panel`);
      return; // Don't show panel if no subcategories
    }
    
    setHoveredCategory(categoryId);
    console.log(`CategorySidebar: Set hoveredCategory to ${categoryId}`);
    
    // Calculate position
    const element = categoryRefs.current[categoryId];
    if (element) {
      const rect = element.getBoundingClientRect();
      const position = {
        top: rect.top,
        left: rect.right + 2 // Reduced gap from 8 to 2
      };
      setPanelPosition(position);
      console.log(`CategorySidebar: Panel position set to`, position);
    } else {
      console.log(`CategorySidebar: Element ref not found for category ${categoryId}`);
    }
  };
  
  const handleCategoryLeave = () => {
    // Add a delay before hiding the panel
    leaveTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 150); // 150ms delay
  };
  
  const handlePanelEnter = () => {
    // Clear the leave timeout when entering the panel
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  };
  
  const handlePanelLeave = () => {
    // Hide panel immediately when leaving it
    setHoveredCategory(null);
  };

  return (
    <>
      <Card className="rounded-2xl border-2 border-gray-100 overflow-hidden sticky top-24">
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
                ref={(el) => categoryRefs.current[category._id] = el}
                className="relative"
              >
                <Link
                  to={`/catalog?category=${category.slug}`}
                  className="flex items-center justify-between p-4 hover:bg-green-50 transition-colors group relative"
                  onMouseEnter={() => handleCategoryHover(category._id)}
                  onMouseLeave={handleCategoryLeave}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">
                      {category.name}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
                </Link>
              </div>
            );
          })}
        </nav>
      </Card>
      
      {/* Subcategories Floating Panel - Rendered outside Card */}
      {hoveredCategory && mainCategories.map((category) => {
        if (hoveredCategory !== category._id) return null;
        
        const subcategories = getSubcategories(category._id);
        if (subcategories.length === 0) return null;
        
        return (
          <div
            key={`floating-${category._id}`}
            className="fixed bg-white border-2 border-gray-100 rounded-2xl shadow-2xl p-2"
            style={{
              left: `${panelPosition.left}px`,
              top: `${panelPosition.top}px`,
              width: '256px',
              zIndex: 9999
            }}
            onMouseEnter={handlePanelEnter}
            onMouseLeave={handlePanelLeave}
          >
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
        );
      })}
    </>
  );
};

export default CategorySidebar;
