import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateName = (name, field) => {
    // Nu permite cifre în nume
    if (/\d/.test(name)) {
      return `${field} nu poate conține cifre`;
    }
    // Nu permite o singură literă
    if (name.trim().length < 2) {
      return `${field} trebuie să aibă cel puțin 2 caractere`;
    }
    // Doar litere, spații și caractere românești
    if (!/^[a-zA-ZăâîșțĂÂÎȘȚ\s-]+$/.test(name)) {
      return `${field} poate conține doar litere`;
    }
    return null;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Email invalid';
    }
    return null;
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Parola trebuie să aibă minim 6 caractere';
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    // Validări
    const newErrors = {};
    
    const firstNameError = validateName(formData.firstName, 'Prenumele');
    if (firstNameError) newErrors.firstName = firstNameError;
    
    const lastNameError = validateName(formData.lastName, 'Numele de familie');
    if (lastNameError) newErrors.lastName = lastNameError;
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Parolele nu se potrivesc';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      toast({
        title: 'Eroare validare',
        description: 'Te rog corectează câmpurile marcate cu roșu.',
        variant: 'destructive',
      });
      return;
    }
    
    // Combină prenume și nume
    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
    
    const result = await register({
      name: fullName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      address: formData.address,
    });
    
    if (result.success) {
      toast({
        title: 'Cont creat cu succes!',
        description: 'Bun venit pe R32!',
      });
      navigate('/');
    } else {
      toast({
        title: 'Eroare',
        description: result.error || 'Nu s-a putut crea contul.',
        variant: 'destructive',
      });
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
            <Label htmlFor="firstName">Prenume *</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Ion"
              required
              className={`mt-2 rounded-xl border-2 ${errors.firstName ? 'border-red-500' : ''}`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="lastName">Nume de familie *</Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Popescu"
              required
              className={`mt-2 rounded-xl border-2 ${errors.lastName ? 'border-red-500' : ''}`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@exemplu.ro"
              required
              className={`mt-2 rounded-xl border-2 ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Parolă *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={6}
              className={`mt-2 rounded-xl border-2 ${errors.password ? 'border-red-500' : ''}`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">Minim 6 caractere</p>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmă Parola *</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className={`mt-2 rounded-xl border-2 ${errors.confirmPassword ? 'border-red-500' : ''}`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
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
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-6 text-lg font-semibold mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
