import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full p-8 rounded-2xl border-2 border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Autentificare</h1>
          <p className="text-gray-600">Intră în contul tău R32</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplu.ro"
              required
              className="mt-2 rounded-xl border-2"
            />
          </div>

          <div>
            <Label htmlFor="password">Parolă</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="mt-2 rounded-xl border-2"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-6 text-lg font-semibold"
          >
            {loading ? 'Se încarcă...' : 'Autentifică-te'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Nu ai cont?{' '}
            <Link to="/register" className="text-green-600 hover:text-green-700 font-semibold">
              Înregistrează-te
            </Link>
          </p>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-900 font-semibold mb-2">Conturi demo:</p>
          <p className="text-xs text-blue-800">Admin: admin@r32.ro / admin123</p>
          <p className="text-xs text-blue-800">User: ion@test.ro / test123</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
