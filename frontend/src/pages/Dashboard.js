import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Building2, Users, Package, FileText, TrendingUp, Calendar } from 'lucide-react';
import api from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, invoicesRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/recent-invoices?limit=5')
      ]);
      setStats(statsRes.data);
      setRecentInvoices(invoicesRes.data);
    } catch (error) {
      toast.error('Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
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

  const statCards = [
    {
      title: 'Companii',
      value: stats?.total_companies || 0,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Clienți',
      value: stats?.total_clients || 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Produse',
      value: stats?.total_products || 0,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Facturi emise',
      value: stats?.total_invoices || 0,
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 fade-in">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Bine ai venit înapoi! Aici este o privire de ansamblu asupra activității tale.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover-lift border-slate-200" data-testid={`stat-card-${stat.title.toLowerCase()}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      <Icon className={stat.color} size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" />
                Venituri luna aceasta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total venituri</p>
                  <p className="text-4xl font-bold text-primary mt-1">
                    {formatCurrency(stats?.monthly_revenue || 0)}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm text-muted-foreground">Facturi emise luna aceasta</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">
                    {stats?.monthly_invoices_count || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={20} className="text-primary" />
                Facturi recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentInvoices.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nicio factură emisă încă
                  </p>
                ) : (
                  recentInvoices.map((invoice) => (
                    <Link
                      key={invoice.id}
                      to={`/invoices/${invoice.id}`}
                      className="block p-3 rounded-lg border border-slate-200 hover:border-primary transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {invoice.series}-{invoice.invoice_number}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(invoice.issue_date)}
                          </p>
                        </div>
                        <p className="font-semibold text-sm text-primary">
                          {formatCurrency(invoice.total)}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
                {recentInvoices.length > 0 && (
                  <Link
                    to="/invoices"
                    className="block text-center text-sm text-primary hover:underline py-2"
                  >
                    Vezi toate facturile
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Venituri totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">
              {formatCurrency(stats?.total_revenue || 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Din {stats?.total_invoices || 0} facturi emise
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;