import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '../context/AuthContext';

const Header = ({ cartCount = 0, wishlistCount = 0 }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          Transport gratuit pentru comenzi peste 300 Lei • Returnare în 30 de zile
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo with Robot Mascot */}
            <Link to="/" className="flex items-center space-x-3">
              {/* Logo */}
              <div className="bg-gradient-to-br from-green-600 to-green-500 text-white font-bold text-2xl px-4 py-2 rounded-xl shadow-lg">
                R32
              </div>
              
              {/* Robot Mascot with Slogan */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_r32-shop/artifacts/woe463o2_generated-image%20%284%29.jpg" 
                    alt="R32 Mascot" 
                    className="w-28 h-28 object-contain"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                </div>
                <div className="hidden sm:block" style={{ 
                  perspective: '400px',
                  perspectiveOrigin: 'center bottom'
                }}>
                  <p className="text-base leading-tight text-green-600" style={{ 
                    fontFamily: "'Star Jedi', sans-serif",
                    transform: 'rotateX(30deg)',
                    transformStyle: 'preserve-3d',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    letterSpacing: '0.1em',
                    fontWeight: 'normal'
                  }}>
                    simple
                    <br />
                    as
                    <br />
                    you
                  </p>
                </div>
              </div>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Caută produse, categorii, branduri..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-6 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 rounded-xl px-6"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </form>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              <Link to="/wishlist">
                <Button variant="ghost" className="relative rounded-xl hover:bg-gray-100">
                  <Heart className="h-6 w-6" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>

              <Link to="/cart">
                <Button variant="ghost" className="relative rounded-xl hover:bg-gray-100">
                  <ShoppingCart className="h-6 w-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              {isAuthenticated ? (
                <Link to="/account">
                  <Button variant="ghost" className="rounded-xl hover:bg-gray-100 flex items-center space-x-2">
                    <User className="h-6 w-6" />
                    {user && <span className="hidden md:inline text-sm">{user.name}</span>}
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button className="bg-green-600 hover:bg-green-700 rounded-xl">
                    Autentificare
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-1 py-3 overflow-x-auto">
            <Button variant="ghost" className="rounded-xl text-sm hover:bg-gray-100">
              <Menu className="h-4 w-4 mr-2" />
              Toate Categoriile
            </Button>
            <Link to="/catalog?filter=oferte">
              <Button variant="ghost" className="rounded-xl text-sm hover:bg-gray-100 text-red-600 font-semibold">
                Oferte
              </Button>
            </Link>
            <Link to="/catalog?filter=noutati">
              <Button variant="ghost" className="rounded-xl text-sm hover:bg-gray-100">
                Noutăți
              </Button>
            </Link>
            <Link to="/catalog?category=telefoane-tablete">
              <Button variant="ghost" className="rounded-xl text-sm hover:bg-gray-100">
                Telefoane & Tablete
              </Button>
            </Link>
            <Link to="/catalog?category=laptop-pc">
              <Button variant="ghost" className="rounded-xl text-sm hover:bg-gray-100">
                Laptop & PC
              </Button>
            </Link>
            <Link to="/catalog?category=tv-audio-video">
              <Button variant="ghost" className="rounded-xl text-sm hover:bg-gray-100">
                TV & Audio
              </Button>
            </Link>
            <Link to="/catalog?category=gaming">
              <Button variant="ghost" className="rounded-xl text-sm hover:bg-gray-100">
                Gaming
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
