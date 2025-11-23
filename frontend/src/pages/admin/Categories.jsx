import React, { useEffect, useState } from 'react';
import { categoriesAPI } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '',
    description: '',
    parentId: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory._id, formData);
        toast({ title: 'Categorie actualizată cu succes!' });
      } else {
        await categoriesAPI.create(formData);
        toast({ title: 'Categorie creată cu succes!' });
      }

      setIsDialogOpen(false);
      resetForm();
      loadCategories();
    } catch (error) {
      toast({
        title: 'Eroare',
        description: error.response?.data?.detail || 'A apărut o eroare',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon || '',
      description: category.description || '',
      parentId: category.parentId || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sigur vrei să ștergi această categorie?')) return;

    try {
      await categoriesAPI.delete(id);
      toast({ title: 'Categorie ștearsă cu succes!' });
      loadCategories();
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut șterge categoria',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      icon: '',
      description: '',
      parentId: '',
    });
  };

  if (loading) {
    return <div className="p-8">Se încarcă...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categorii</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-green-600 hover:bg-green-700 rounded-xl"
            >
              <Plus className="h-5 w-5 mr-2" />
              Adaugă Categorie
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Editează Categorie' : 'Adaugă Categorie Nouă'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nume Categorie</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="rounded-xl mt-2"
                />
              </div>

              <div>
                <Label>Slug (URL-friendly)</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  required
                  placeholder="ex: telefoane-tablete"
                  className="rounded-xl mt-2"
                />
              </div>

              <div>
                <Label>Categorie Părinte (opțional)</Label>
                <Select 
                  value={formData.parentId} 
                  onValueChange={(value) => setFormData({...formData, parentId: value})}
                >
                  <SelectTrigger className="rounded-xl mt-2">
                    <SelectValue placeholder="Nicio categorie (categorie principală)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nicio categorie (categorie principală)</SelectItem>
                    {categories.filter(cat => !cat.parentId).map(cat => (
                      <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Icon (Lucide React) - doar pentru categorii principale</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  placeholder="ex: Smartphone, Laptop"
                  className="rounded-xl mt-2"
                />
              </div>

              <div>
                <Label>Descriere</Label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 mt-2"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  className="rounded-xl"
                >
                  Anulează
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 rounded-xl">
                  {editingCategory ? 'Actualizează' : 'Adaugă'} Categorie
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Table */}
      <Card className="rounded-2xl border-2 border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Nume</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Tip</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Slug</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Icon</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Descriere</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const parentCategory = categories.find(cat => cat._id === category.parentId);
                const isSubcategory = !!category.parentId;
                
                return (
                  <tr key={category._id} className="border-t hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className={isSubcategory ? 'pl-6' : ''}>
                        <span className="font-semibold">{category.name}</span>
                        {isSubcategory && parentCategory && (
                          <div className="text-xs text-gray-500 mt-1">
                            Sub: {parentCategory.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                        isSubcategory ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {isSubcategory ? 'Subcategorie' : 'Principală'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{category.slug}</td>
                    <td className="py-4 px-6 text-gray-600">{category.icon || '-'}</td>
                    <td className="py-4 px-6 text-gray-600">{category.description || '-'}</td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(category)}
                          className="rounded-xl"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(category._id)}
                          className="rounded-xl text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Categories;
