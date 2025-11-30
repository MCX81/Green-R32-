import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Shield } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('admin@r32.ro');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Use admin-specific login endpoint
      const response = await authAPI.adminLogin({ email, password });
      
      // Store token and user data
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Admin login successful - redirect to admin dashboard
      window.location.href = '/admin';
    } catch (err) {
      console.error('Admin login error:', err);
      if (err.response?.status === 403) {
        setError('Acces interzis. Nu aveți drepturi de administrator.');
      } else {
        setError('Email sau parolă incorectă');
      }
    }
    
    setLoading(false);
  };

  const handleQuickLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Call quick-login endpoint
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/quick-login`);
      const data = await response.json();
      
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/admin');
      } else {
        setError('Nu s-a putut conecta');
      }
    } catch (err) {
      console.error('Quick login error:', err);
      setError('Eroare la conectare rapidă');
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
            data-testid="admin-login-submit"
          >
            {loading ? 'Se verifică...' : 'Autentificare Admin'}
          </Button>
        </form>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-2">Debug: Quick Login</p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleSubmit}
            data-testid="quick-login-button"
          >
            🔧 Quick Admin Login (Debug)
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-900 font-semibold mb-1">Credențiale admin:</p>
          <p className="text-xs text-blue-800">admin@r32.ro / admin123</p>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
