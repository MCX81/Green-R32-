import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import { formatCurrency } from '../lib/utils';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    company_id: '',
    name: '',
    description: '',
    unit: 'buc',
    price: 0,
    vat_rate: 19,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, companiesRes] = await Promise.all([
        api.get('/products'),
        api.get('/companies')
      ]);
      setProducts(productsRes.data);
      setCompanies(companiesRes.data);
    } catch (error) {
      toast.error('Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      company_id: '',
      name: '',
      description: '',
      unit: 'buc',
      price: 0,
      vat_rate: 19,
    });
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.company_id) {
      toast.error('Selectează o companie');
      return;
    }
    
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData);
        toast.success('Produs actualizat');
      } else {
        await api.post('/products', formData);
        toast.success('Produs adăugat');
      }
      loadData();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Eroare la salvare');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Sigur doriți să ștergeți acest produs?')) return;
    try {
      await api.delete(`/products/${productId}`);
      toast.success('Produs șters');
      loadData();
    } catch (error) {
      toast.error('Eroare la ștergere');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Produse & Servicii</h1>
            <p className="text-muted-foreground mt-1">Gestionează produsele și serviciile tale</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="rounded-full" data-testid="add-product-button">
                <Plus size={20} className="mr-2" />
                Adaugă produs
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Editează produs' : 'Produs nou'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="company_id">Companie *</Label>
                  <Select value={formData.company_id} onValueChange={(value) => setFormData({...formData, company_id: value})} required>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selectează compania" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="name">Denumire *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="description">Descriere</Label>
                  <Textarea id="description" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} className="mt-1" rows={3} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="unit">U.M. *</Label>
                    <Input id="unit" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} required className="mt-1" placeholder="buc, kg, ora" />
                  </div>
                  <div>
                    <Label htmlFor="price">Preț *</Label>
                    <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})} required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="vat_rate">TVA (%) *</Label>
                    <Input id="vat_rate" type="number" value={formData.vat_rate} onChange={(e) => setFormData({...formData, vat_rate: parseFloat(e.target.value)})} required className="mt-1" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Anulează</Button>
                  <Button type="submit">{editingProduct ? 'Actualizează' : 'Adaugă'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <Package size={64} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Niciun produs adăugat</h3>
            <p className="text-muted-foreground">Adaugă primul produs sau serviciu.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Produs/Serviciu</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">U.M.</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preț</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">TVA</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{product.name}</p>
                      {product.description && <p className="text-sm text-muted-foreground mt-1">{product.description}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground">{product.unit}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-medium text-foreground">{formatCurrency(product.price)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm text-muted-foreground">{product.vat_rate}%</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                          <Edit size={16} />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-700">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Products;
