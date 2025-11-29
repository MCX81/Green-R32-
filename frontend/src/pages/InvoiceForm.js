import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

const InvoiceForm = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_id: '',
    client_id: '',
    invoice_type: 'factura',
    series: 'FAC',
    invoice_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: '',
    items: [{ product_name: '', description: '', quantity: 1, unit: 'buc', price: 0, vat_rate: 19, total: 0 }]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [companiesRes, clientsRes, productsRes] = await Promise.all([
        api.get('/companies'),
        api.get('/clients'),
        api.get('/products')
      ]);
      setCompanies(companiesRes.data);
      setClients(clientsRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      toast.error('Eroare la încărcarea datelor');
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_name: '', description: '', quantity: 1, unit: 'buc', price: 0, vat_rate: 19, total: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    if (field === 'quantity' || field === 'price') {
      newItems[index].total = newItems[index].quantity * newItems[index].price;
    }
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_id || !formData.client_id || formData.items.length === 0) {
      toast.error('Completează toate câmpurile obligatorii');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        issue_date: new Date(formData.issue_date).toISOString(),
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null
      };
      const response = await api.post('/invoices', payload);
      toast.success('Factură creată cu succes!');
      navigate(`/facturare/invoices/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Eroare la creare');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto fade-in">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Factură nouă</h1>
          <p className="text-muted-foreground mt-1">Completează detaliile facturii</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Informații generale</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Companie *</Label>
                <Select value={formData.company_id} onValueChange={(value) => setFormData({...formData, company_id: value})} required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selectează" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Client *</Label>
                <Select value={formData.client_id} onValueChange={(value) => setFormData({...formData, client_id: value})} required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selectează" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tip document *</Label>
                <Select value={formData.invoice_type} onValueChange={(value) => setFormData({...formData, invoice_type: value})} required>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="factura">Factură</SelectItem>
                    <SelectItem value="proforma">Proformă</SelectItem>
                    <SelectItem value="aviz">Aviz</SelectItem>
                    <SelectItem value="chitanta">Chitanță</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Serie *</Label>
                  <Input value={formData.series} onChange={(e) => setFormData({...formData, series: e.target.value})} required className="mt-1" />
                </div>
                <div>
                  <Label>Număr *</Label>
                  <Input value={formData.invoice_number} onChange={(e) => setFormData({...formData, invoice_number: e.target.value})} required className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Dată emitere *</Label>
                <Input type="date" value={formData.issue_date} onChange={(e) => setFormData({...formData, issue_date: e.target.value})} required className="mt-1" />
              </div>
              <div>
                <Label>Scadență</Label>
                <Input type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} className="mt-1" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">Produse/Servicii</h3>
              <Button type="button" onClick={addItem} size="sm" variant="outline">
                <Plus size={16} className="mr-2" /> Adaugă linie
              </Button>
            </div>
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="p-4 border border-slate-200 rounded-lg">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-3">
                      <Label>Produs/Serviciu</Label>
                      <Input value={item.product_name} onChange={(e) => updateItem(index, 'product_name', e.target.value)} required className="mt-1" />
                    </div>
                    <div className="col-span-2">
                      <Label>Cantitate</Label>
                      <Input type="number" step="0.01" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)} required className="mt-1" />
                    </div>
                    <div className="col-span-2">
                      <Label>U.M.</Label>
                      <Input value={item.unit} onChange={(e) => updateItem(index, 'unit', e.target.value)} required className="mt-1" />
                    </div>
                    <div className="col-span-2">
                      <Label>Preț</Label>
                      <Input type="number" step="0.01" value={item.price} onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)} required className="mt-1" />
                    </div>
                    <div className="col-span-2">
                      <Label>TVA (%)</Label>
                      <Input type="number" value={item.vat_rate} onChange={(e) => updateItem(index, 'vat_rate', parseFloat(e.target.value) || 0)} required className="mt-1" />
                    </div>
                    <div className="col-span-1 flex items-end">
                      {formData.items.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeItem(index)} className="text-red-600">
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <Label>Descriere</Label>
                    <Input value={item.description || ''} onChange={(e) => updateItem(index, 'description', e.target.value)} className="mt-1" placeholder="Opțional" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Total linie: {item.total.toFixed(2)} RON</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <Label>Observații</Label>
            <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="mt-1" rows={3} placeholder="Observații suplimentare..." />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/facturare/invoices')}>Anulează</Button>
            <Button type="submit" disabled={loading} className="rounded-full">
              {loading ? 'Se salvează...' : 'Creează factură'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default InvoiceForm;