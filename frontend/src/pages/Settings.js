import React from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6 fade-in">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Setări</h1>
          <p className="text-muted-foreground mt-1">Gestionează contul și preferințele</p>
        </div>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon size={20} className="text-primary" />
              Informații cont
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nume</p>
                <p className="text-base font-medium text-foreground">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-base font-medium text-foreground">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Integrare e-Factura</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Integrarea cu ANAF e-Factura va fi disponibilă în curând. Veți putea trimite automat facturile către SPV.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;