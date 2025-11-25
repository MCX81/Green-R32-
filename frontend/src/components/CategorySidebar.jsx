import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Smartphone, Laptop, Tv, Refrigerator, Gamepad2, Shirt, BookOpen, Home as HomeIcon, Dumbbell, Baby } from 'lucide-react';
import { Card } from './ui/card';
import { categories } from '../mock/mockData';

const CategorySidebar = () => {
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

  return (
    <Card className="rounded-2xl border-2 border-gray-100 overflow-hidden sticky top-24">
      <div className="bg-green-600 text-white p-4 font-bold text-lg">
        Toate Categoriile
      </div>
      <nav className="divide-y divide-gray-100">
        {categories.map((category) => {
          const Icon = iconMap[category.icon] || Smartphone;
          return (
            <Link
              key={category.id}
              to={`/catalog?category=${category.slug}`}
              className="flex items-center justify-between p-4 hover:bg-green-50 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">
                  {category.name}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
            </Link>
          );
        })}
      </nav>
    </Card>
  );
};

export default CategorySidebar;
