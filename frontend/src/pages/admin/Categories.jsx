import React, { useEffect, useState } from 'react';
import { categoriesAPI } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'main', 'sub'
  const [expandedCategories, setExpandedCategories] = useState(new Set());
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

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getMainCategories = () => {
    return categories.filter(cat => !cat.parentId);
  };

  const getSubcategories = (parentId) => {
    return categories.filter(cat => cat.parentId === parentId);
  };

  const getFilteredCategories = () => {
    if (filterType === 'main') {
      return categories.filter(cat => !cat.parentId);
    } else if (filterType === 'sub') {
      return categories.filter(cat => cat.parentId);
    }
    return categories;
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

      {/* Filter Tabs */}
      <div className="mb-4 flex space-x-2">
        <Button
          variant={filterType === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterType('all')}
          className={`rounded-xl ${filterType === 'all' ? 'bg-green-600 hover:bg-green-700' : ''}`}
        >
          Toate ({categories.length})
        </Button>
        <Button
          variant={filterType === 'main' ? 'default' : 'outline'}
          onClick={() => setFilterType('main')}
          className={`rounded-xl ${filterType === 'main' ? 'bg-green-600 hover:bg-green-700' : ''}`}
        >
          Principale ({categories.filter(c => !c.parentId).length})
        </Button>
        <Button
          variant={filterType === 'sub' ? 'default' : 'outline'}
          onClick={() => setFilterType('sub')}
          className={`rounded-xl ${filterType === 'sub' ? 'bg-green-600 hover:bg-green-700' : ''}`}
        >
          Subcategorii ({categories.filter(c => c.parentId).length})
        </Button>
      </div>

      {/* Categories Hierarchical View */}
      <Card className="rounded-2xl border-2 border-gray-100">
        <div className="p-6 space-y-4">
          {filterType === 'all' ? (
            // Hierarchical view
            getMainCategories().map((mainCat) => {
              const subcats = getSubcategories(mainCat._id);
              const isExpanded = expandedCategories.has(mainCat._id);
              
              return (
                <div key={mainCat._id} className="border-2 border-gray-100 rounded-xl overflow-hidden">
                  {/* Main Category */}
                  <div className="bg-green-50 p-4 flex items-center justify-between">
                    <div className="flex-1 flex items-center space-x-3">
                      <button
                        onClick={() => toggleCategory(mainCat._id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <svg
                          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <div>
                        <div className="font-bold text-lg">{mainCat.name}</div>
                        <div className="text-sm text-gray-600">
                          {mainCat.slug} • {mainCat.icon || 'Fără icon'} • {subcats.length} subcategorii
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(mainCat)}
                        className="rounded-xl bg-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(mainCat._id)}
                        className="rounded-xl bg-white text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Subcategories */}
                  {isExpanded && subcats.length > 0 && (
                    <div className="bg-white divide-y divide-gray-100">
                      {subcats.map((subCat) => (
                        <div key={subCat._id} className="p-4 pl-12 flex items-center justify-between hover:bg-gray-50">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              <span className="font-semibold">{subCat.name}</span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg">Subcategorie</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1 ml-6">{subCat.slug}</div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(subCat)}
                              className="rounded-xl"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(subCat._id)}
                              className="rounded-xl text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            // Flat view for filtered results
            <div className="space-y-2">
              {getFilteredCategories().map((category) => {
                const parentCategory = categories.find(cat => cat._id === category.parentId);
                const isSubcategory = !!category.parentId;
                
                return (
                  <div key={category._id} className={`border-2 border-gray-100 rounded-xl p-4 flex items-center justify-between ${
                    isSubcategory ? 'bg-blue-50' : 'bg-green-50'
                  }`}>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-lg">{category.name}</span>
                        <span className={`px-2 py-1 text-xs rounded-lg font-semibold ${
                          isSubcategory ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {isSubcategory ? 'Subcategorie' : 'Principală'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {category.slug} • {category.icon || 'Fără icon'}
                        {isSubcategory && parentCategory && (
                          <span> • Sub: {parentCategory.name}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(category)}
                        className="rounded-xl bg-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(category._id)}
                        className="rounded-xl bg-white text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Categories;
