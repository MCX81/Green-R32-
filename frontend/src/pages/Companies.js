import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Plus, Building2, Edit, Trash2 } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    cui: '',
    reg_com: '',
    address: '',
    city: '',
    county: '',
    postal_code: '',
    phone: '',
    email: '',
    bank_account: '',
    bank_name: '',
    vat_rate: 19,
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const response = await api.get('/factura/companies');
      setCompanies(response.data);
    } catch (error) {
      toast.error('Eroare la încărcarea companiilor');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      cui: '',
      reg_com: '',
      address: '',
      city: '',
      county: '',
      postal_code: '',
      phone: '',
      email: '',
      bank_account: '',
      bank_name: '',
      vat_rate: 19,
    });
    setEditingCompany(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await api.put(`/companies/${editingCompany.id}`, formData);
        toast.success('Companie actualizată');
      } else {
        await api.post('/factura/companies', formData);
        toast.success('Companie adăugată');
      }
      loadCompanies();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Eroare la salvare');
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      cui: company.cui,
      reg_com: company.reg_com,
      address: company.address,
      city: company.city,
      county: company.county,
      postal_code: company.postal_code || '',
      phone: company.phone || '',
      email: company.email || '',
      bank_account: company.bank_account || '',
      bank_name: company.bank_name || '',
      vat_rate: company.vat_rate,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (companyId) => {
    if (!window.confirm('Sigur doriți să ștergeți această companie?')) return;
    try {
      await api.delete(`/companies/${companyId}`);
      toast.success('Companie ștearsă');
      loadCompanies();
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
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Companii</h1>
            <p className="text-muted-foreground mt-1">Gestionează companiile tale</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="rounded-full" data-testid="add-company-button">
                <Plus size={20} className="mr-2" />
                Adaugă companie
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCompany ? 'Editează companie' : 'Companie nouă'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="company-form">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nume companie *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cui">CUI *</Label>
                    <Input
                      id="cui"
                      value={formData.cui}
                      onChange={(e) => setFormData({...formData, cui: e.target.value})}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reg_com">Reg. Com. *</Label>
                    <Input
                      id="reg_com"
                      value={formData.reg_com}
                      onChange={(e) => setFormData({...formData, reg_com: e.target.value})}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vat_rate">Cotă TVA (%) *</Label>
                    <Input
                      id="vat_rate"
                      type="number"
                      value={formData.vat_rate}
                      onChange={(e) => setFormData({...formData, vat_rate: parseFloat(e.target.value)})}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Adresă *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">Oraș *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="county">Județ *</Label>
                    <Input
                      id="county"
                      value={formData.county}
                      onChange={(e) => setFormData({...formData, county: e.target.value})}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postal_code">Cod poștal</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bank_account">IBAN</Label>
                    <Input
                      id="bank_account"
                      value={formData.bank_account}
                      onChange={(e) => setFormData({...formData, bank_account: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bank_name">Bancă</Label>
                    <Input
                      id="bank_name"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Anulează
                  </Button>
                  <Button type="submit" data-testid="save-company-button">
                    {editingCompany ? 'Actualizează' : 'Adaugă'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {companies.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Building2 size={64} className="text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Nicio companie adăugată</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Începe prin a adăuga prima ta companie pentru a putea emite facturi.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Card key={company.id} className="hover-lift border-slate-200" data-testid={`company-card-${company.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="text-primary" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{company.name}</h3>
                        <p className="text-sm text-muted-foreground font-mono">CUI: {company.cui}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>{company.address}</p>
                    <p>{company.city}, {company.county}</p>
                    {company.phone && <p>Tel: {company.phone}</p>}
                    <p className="font-medium text-primary">TVA: {company.vat_rate}%</p>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(company)}
                      className="flex-1"
                      data-testid={`edit-company-${company.id}`}
                    >
                      <Edit size={16} className="mr-2" />
                      Editează
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(company.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      data-testid={`delete-company-${company.id}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Companies;