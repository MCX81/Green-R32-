import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Shield } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(email, password);
    
    if (result.success) {
      // Check if user has admin role
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (userData && userData.role === 'admin') {
        // Admin login successful
        window.location.href = '/admin';
      } else {
        // Not an admin
        setError('Acces interzis. Nu aveți drepturi de administrator.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      setError('Email sau parolă incorectă');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full p-8 rounded-2xl border-2 border-gray-100 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-600">Panou de Administrare R32</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email Administrator</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@r32.ro"
              required
              className="mt-2 rounded-xl border-2"
            />
          </div>

          <div>
            <Label htmlFor="password">Parola</Label>
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
            {loading ? 'Se verifică...' : 'Autentificare Admin'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-900 font-semibold mb-1">Credențiale admin:</p>
          <p className="text-xs text-blue-800">admin@r32.ro / admin123</p>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
