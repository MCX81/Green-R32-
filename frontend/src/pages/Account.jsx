import React, { useState } from 'react';
import { User, Package, Heart, Settings, LogOut } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const Account = () => {
  const [user] = useState({
    name: 'Ion Popescu',
    email: 'ion.popescu@email.com',
    phone: '0712345678',
    address: 'Str. Exemplu nr. 123, București'
  });

  const mockOrders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'Livrat',
      total: 5499,
      items: 2
    },
    {
      id: 'ORD-002',
      date: '2024-01-10',
      status: 'În Livrare',
      total: 13999,
      items: 1
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Contul Meu</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="p-6 rounded-2xl border-2 border-gray-100 h-fit">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="font-bold text-lg">{user.name}</h2>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>

            <nav className="space-y-2">
              <Button variant="ghost" className="w-full justify-start rounded-xl">
                <User className="h-5 w-5 mr-3" />
                Profilul Meu
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-xl">
                <Package className="h-5 w-5 mr-3" />
                Comenzile Mele
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-xl">
                <Heart className="h-5 w-5 mr-3" />
                Lista de Dorințe
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-xl">
                <Settings className="h-5 w-5 mr-3" />
                Setări
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-xl text-red-600">
                <LogOut className="h-5 w-5 mr-3" />
                Deconectare
              </Button>
            </nav>
          </Card>

          {/* Main Content */}
          <div className="md:col-span-3">
            <Tabs defaultValue="profile">
              <TabsList className="rounded-xl border-2 border-gray-100 mb-6">
                <TabsTrigger value="profile" className="rounded-xl">Profil</TabsTrigger>
                <TabsTrigger value="orders" className="rounded-xl">Comenzi</TabsTrigger>
                <TabsTrigger value="settings" className="rounded-xl">Setări</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card className="p-6 rounded-2xl">
                  <h2 className="text-xl font-bold mb-6">Informații Personale</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nume Complet</Label>
                      <Input
                        id="name"
                        defaultValue={user.name}
                        className="rounded-xl border-2 mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={user.email}
                        className="rounded-xl border-2 mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        defaultValue={user.phone}
                        className="rounded-xl border-2 mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Adresă</Label>
                      <Input
                        id="address"
                        defaultValue={user.address}
                        className="rounded-xl border-2 mt-2"
                      />
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 rounded-xl">
                      Salvează Modificările
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="orders">
                <div className="space-y-4">
                  {mockOrders.map(order => (
                    <Card key={order.id} className="p-6 rounded-2xl">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg mb-2">Comanda {order.id}</h3>
                          <p className="text-sm text-gray-600 mb-1">Data: {order.date}</p>
                          <p className="text-sm text-gray-600">Articole: {order.items}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-xl text-sm font-semibold ${
                            order.status === 'Livrat' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {order.status}
                          </span>
                          <p className="text-lg font-bold mt-2">{order.total} Lei</p>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-4 rounded-xl border-2">
                        Vezi Detalii
                      </Button>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="settings">
                <Card className="p-6 rounded-2xl">
                  <h2 className="text-xl font-bold mb-6">Schimbă Parola</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">Parola Curentă</Label>
                      <Input
                        id="current-password"
                        type="password"
                        className="rounded-xl border-2 mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password">Parolă Nouă</Label>
                      <Input
                        id="new-password"
                        type="password"
                        className="rounded-xl border-2 mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirmă Parola</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        className="rounded-xl border-2 mt-2"
                      />
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 rounded-xl">
                      Actualizează Parola
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
