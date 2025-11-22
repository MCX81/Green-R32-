import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">EMAG</h3>
            <p className="text-sm mb-4">
              Magazinul tău online preferat pentru tehnologie și electronice.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="hover:text-green-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-green-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-green-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-green-500 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Link-uri Utile</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/despre" className="hover:text-green-500 transition-colors">
                  Despre Noi
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-green-500 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/livrare" className="hover:text-green-500 transition-colors">
                  Livrare și Returnare
                </Link>
              </li>
              <li>
                <Link to="/garantie" className="hover:text-green-500 transition-colors">
                  Garanție
                </Link>
              </li>
              <li>
                <Link to="/termeni" className="hover:text-green-500 transition-colors">
                  Termeni și Condiții
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Servicii Clienți</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/contul-meu" className="hover:text-green-500 transition-colors">
                  Contul Meu
                </Link>
              </li>
              <li>
                <Link to="/comenzile-mele" className="hover:text-green-500 transition-colors">
                  Comenzile Mele
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-green-500 transition-colors">
                  Lista de Dorințe
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-green-500 transition-colors">
                  Întrebări Frecvente
                </Link>
              </li>
              <li>
                <Link to="/retur" className="hover:text-green-500 transition-colors">
                  Retururi
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Str. Exemplu nr. 123<br />București, România</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>0800 123 456</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>contact@emag.ro</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2024 R32. Toate drepturile rezervate.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
