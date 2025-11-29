import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Users, Edit, Trash2 } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    company_id: '',
    name: '',
    cui: '',
    reg_com: '',
    address: '',
    city: '',
    county: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [clientsRes, companiesRes] = await Promise.all([
        api.get('/clients'),
        api.get('/companies')
      ]);
      setClients(clientsRes.data);
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
      cui: '',
      reg_com: '',
      address: '',
      city: '',
      county: '',
      phone: '',
      email: '',
    });
    setEditingClient(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.company_id) {
      toast.error('Selectează o companie');
      return;
    }
    
    try {
      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, formData);
        toast.success('Client actualizat');
      } else {
        await api.post('/clients', formData);
        toast.success('Client adăugat');
      }
      loadData();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Eroare la salvare');
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData(client);
    setIsDialogOpen(true);
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm('Sigur doriți să ștergeți acest client?')) return;
    try {
      await api.delete(`/clients/${clientId}`);
      toast.success('Client șters');
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
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Clienți</h1>
            <p className="text-muted-foreground mt-1">Gestionează clienții tăi</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="rounded-full" data-testid="add-client-button">
                <Plus size={20} className="mr-2" />
                Adaugă client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingClient ? 'Editează client' : 'Client nou'}</DialogTitle>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nume *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="cui">CUI *</Label>
                    <Input id="cui" value={formData.cui} onChange={(e) => setFormData({...formData, cui: e.target.value})} required className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reg_com">Reg. Com.</Label>
                  <Input id="reg_com" value={formData.reg_com || ''} onChange={(e) => setFormData({...formData, reg_com: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="address">Adresă *</Label>
                  <Input id="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Oraș *</Label>
                    <Input id="city" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="county">Județ *</Label>
                    <Input id="county" value={formData.county} onChange={(e) => setFormData({...formData, county: e.target.value})} required className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input id="phone" value={formData.phone || ''} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Anulează</Button>
                  <Button type="submit">{editingClient ? 'Actualizează' : 'Adaugă'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {clients.length === 0 ? (
          <div className="text-center py-16">
            <Users size={64} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Niciun client adăugat</h3>
            <p className="text-muted-foreground">Adaugă primul client pentru a emite facturi.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">CUI</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Locație</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{client.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground font-mono">{client.cui}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground">{client.city}, {client.county}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground">{client.phone || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(client)}>
                          <Edit size={16} />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(client.id)} className="text-red-600 hover:text-red-700">
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

export default Clients;