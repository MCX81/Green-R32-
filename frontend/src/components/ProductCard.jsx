import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

const ProductCard = ({ product, onAddToCart, onAddToWishlist }) => {
  const { _id, name, price, oldPrice, rating, reviews, image, inStock, isNew, discount } = product;

  return (
    <Card className="group relative overflow-hidden rounded-2xl border-2 border-gray-100 hover:border-green-500 hover:shadow-xl transition-all duration-300">
      <Link to={`/product/${_id}`} className="block">
        <div className="relative overflow-hidden bg-gray-50 rounded-t-2xl">
          <img
            src={image}
            alt={name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discount > 0 && (
              <Badge className="bg-red-500 text-white rounded-xl px-3 py-1 font-bold">
                -{discount}%
              </Badge>
            )}
            {isNew && (
              <Badge className="bg-green-600 text-white rounded-xl px-3 py-1 font-bold">
                NOU
              </Badge>
            )}
            {!inStock && (
              <Badge className="bg-gray-500 text-white rounded-xl px-3 py-1 font-bold">
                STOC EPUIZAT
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToWishlist?.(product);
            }}
            className="absolute top-3 right-3 bg-white p-2 rounded-xl shadow-lg hover:bg-red-50 transition-colors"
          >
            <Heart className="h-5 w-5 text-gray-600 hover:text-red-500" />
          </button>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/product/${id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-green-600 transition-colors">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">({reviews})</span>
        </div>

        {/* Price */}
        <div className="mb-4">
          {oldPrice && (
            <span className="text-sm text-gray-400 line-through mr-2">{oldPrice} Lei</span>
          )}
          <span className="text-2xl font-bold text-green-600">{price} Lei</span>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={(e) => {
            e.preventDefault();
            onAddToCart?.(product);
          }}
          disabled={!inStock}
          className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-6 font-semibold transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          {inStock ? 'Adaugă în Coș' : 'Indisponibil'}
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;
