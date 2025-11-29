import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Toate câmpurile sunt obligatorii');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Autentificare reușită!');
      navigate('/facturare/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Eroare la autentificare');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary tracking-tight mb-2">FinRo</h1>
            <p className="text-muted-foreground">Autentificare în cont</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplu.com"
                disabled={loading}
                data-testid="email-input"
                className="mt-1"
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
                disabled={loading}
                data-testid="password-input"
                className="mt-1"
              />
            </div>

            <div className="text-right">
              <Link
                to="/reset-password"
                className="text-sm text-primary hover:underline"
              >
                Ai uitat parola?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              data-testid="login-button"
              className="w-full h-11 rounded-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se autentifică...
                </>
              ) : (
                'Autentificare'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Nu ai cont?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Înregistrează-te
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;