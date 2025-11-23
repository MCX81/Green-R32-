import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Trash2, Shield, User } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      toast({ title: 'Rol utilizator actualizat cu succes!' });
      loadUsers();
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut actualiza rolul',
        variant: 'destructive',
      });
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Sigur vrei să ștergi acest utilizator?')) return;

    try {
      await adminAPI.deleteUser(userId);
      toast({ title: 'Utilizator șters cu succes!' });
      loadUsers();
    } catch (error) {
      toast({
        title: 'Eroare',
        description: error.response?.data?.detail || 'Nu s-a putut șterge utilizatorul',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="p-8">Se încarcă...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Utilizatori</h1>
        <div className="text-gray-600">
          Total: {users.length} utilizatori
        </div>
      </div>

      {/* Users Table */}
      <Card className="rounded-2xl border-2 border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Nume</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Email</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Telefon</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Rol</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Data Înregistrare</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        {user.role === 'admin' ? (
                          <Shield className="h-5 w-5 text-green-600" />
                        ) : (
                          <User className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <span className="font-semibold">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{user.email}</td>
                  <td className="py-4 px-6 text-gray-600">{user.phone || '-'}</td>
                  <td className="py-4 px-6">
                    <Select 
                      value={user.role} 
                      onValueChange={(value) => updateUserRole(user._id, value)}
                    >
                      <SelectTrigger className={`w-32 rounded-xl ${
                        user.role === 'admin' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('ro-RO')}
                  </td>
                  <td className="py-4 px-6">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteUser(user._id)}
                      className="rounded-xl text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

export default Users;
