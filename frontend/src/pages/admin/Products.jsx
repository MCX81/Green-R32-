import React, { useEffect, useState } from 'react';
import { productsAPI, categoriesAPI } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    price: '',
    oldPrice: '',
    image: '',
    stock: '',
    inStock: true,
    isNew: false,
    discount: 0,
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
        stock: parseInt(formData.stock),
        discount: parseInt(formData.discount),
        images: formData.image ? [formData.image] : [],
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct._id, data);
        toast({ title: 'Produs actualizat cu succes!' });
      } else {
        await productsAPI.create(data);
        toast({ title: 'Produs creat cu succes!' });
      }

      setIsDialogOpen(false);
      resetForm();
      loadProducts();
    } catch (error) {
      toast({
        title: 'Eroare',
        description: error.response?.data?.detail || 'A apărut o eroare',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      brand: product.brand,
      price: product.price.toString(),
      oldPrice: product.oldPrice?.toString() || '',
      image: product.image,
      stock: product.stock.toString(),
      inStock: product.inStock,
      isNew: product.isNew,
      discount: product.discount,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sigur vrei să ștergi acest produs?')) return;

    try {
      await productsAPI.delete(id);
      toast({ title: 'Produs șters cu succes!' });
      loadProducts();
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut șterge produsul',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      brand: '',
      price: '',
      oldPrice: '',
      image: '',
      stock: '',
      inStock: true,
      isNew: false,
      discount: 0,
    });
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="p-8">Se încarcă...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Produse</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-green-600 hover:bg-green-700 rounded-xl"
            >
              <Plus className="h-5 w-5 mr-2" />
              Adaugă Produs
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editează Produs' : 'Adaugă Produs Nou'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nume Produs</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="rounded-xl mt-2"
                  />
                </div>
                
                <div>
                  <Label>Brand</Label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    required
                    className="rounded-xl mt-2"
                  />
                </div>

                <div>
                  <Label>Categorie</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger className="rounded-xl mt-2">
                      <SelectValue placeholder="Selectează categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat._id} value={cat.slug}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Preț (Lei)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                    className="rounded-xl mt-2"
                  />
                </div>

                <div>
                  <Label>Preț Vechi (opțional)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.oldPrice}
                    onChange={(e) => setFormData({...formData, oldPrice: e.target.value})}
                    className="rounded-xl mt-2"
                  />
                </div>

                <div>
                  <Label>Stoc</Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    required
                    className="rounded-xl mt-2"
                  />
                </div>

                <div>
                  <Label>Discount (%)</Label>
                  <Input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: e.target.value})}
                    className="rounded-xl mt-2"
                  />
                </div>
              </div>

              <div>
                <Label>URL Imagine</Label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  required
                  className="rounded-xl mt-2"
                />
              </div>

              <div>
                <Label>Descriere</Label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 mt-2"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({...formData, inStock: e.target.checked})}
                    className="rounded"
                  />
                  <span>În Stoc</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isNew}
                    onChange={(e) => setFormData({...formData, isNew: e.target.checked})}
                    className="rounded"
                  />
                  <span>Produs Nou</span>
                </label>
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
                  {editingProduct ? 'Actualizează' : 'Adaugă'} Produs
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Caută produse..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-2"
          />
        </div>
      </div>

      {/* Products Table */}
      <Card className="rounded-2xl border-2 border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Produs</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Categorie</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Preț</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Stoc</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id} className="border-t hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-700">{product.category}</td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-bold text-green-600">{product.price} Lei</p>
                      {product.oldPrice && (
                        <p className="text-sm text-gray-400 line-through">{product.oldPrice} Lei</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">{product.stock}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                      product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {product.inStock ? 'În Stoc' : 'Indisponibil'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                        className="rounded-xl"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(product._id)}
                        className="rounded-xl text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Products;
