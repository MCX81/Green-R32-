import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await register(formData);
    
    if (result.success) {
      navigate('/');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full p-8 rounded-2xl border-2 border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Înregistrare</h1>
          <p className="text-gray-600">Creează un cont nou R32</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nume complet</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ion Popescu"
              required
              className="mt-2 rounded-xl border-2"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@exemplu.ro"
              required
              className="mt-2 rounded-xl border-2"
            />
          </div>

          <div>
            <Label htmlFor="password">Parolă</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="mt-2 rounded-xl border-2"
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefon (opțional)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0712345678"
              className="mt-2 rounded-xl border-2"
            />
          </div>

          <div>
            <Label htmlFor="address">Adresă (opțional)</Label>
            <Input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              placeholder="Str. Exemplu nr. 123, București"
              className="mt-2 rounded-xl border-2"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-6 text-lg font-semibold mt-6"
          >
            {loading ? 'Se încarcă...' : 'Înregistrează-te'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Ai deja cont?{' '}
            <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
              Autentifică-te
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;
