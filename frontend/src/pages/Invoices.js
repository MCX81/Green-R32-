import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, FileText, Eye } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '../lib/utils';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const response = await api.get('/invoices');
      setInvoices(response.data);
    } catch (error) {
      toast.error('Eroare la încărcarea facturilor');
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

  const getInvoiceTypeName = (type) => {
    const types = {
      'factura': 'Factură',
      'proforma': 'Proformă',
      'aviz': 'Aviz',
      'chitanta': 'Chitanță'
    };
    return types[type] || 'Factură';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Facturi</h1>
            <p className="text-muted-foreground mt-1">Gestionează toate facturile emise</p>
          </div>
          <Link to="/facturare/invoices/new">
            <Button className="rounded-full" data-testid="new-invoice-button">
              <Plus size={20} className="mr-2" />
              Factură nouă
            </Button>
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={64} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Nicio factură emisă</h3>
            <p className="text-muted-foreground mb-6">Emite prima ta factură acum.</p>
            <Link to="/invoices/new">
              <Button className="rounded-full">
                <Plus size={20} className="mr-2" />
                Creează factură
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Număr</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tip</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dată</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">e-Factura</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-mono font-medium text-foreground">{invoice.series}-{invoice.invoice_number}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getInvoiceTypeName(invoice.invoice_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground">{formatDate(invoice.issue_date)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-semibold text-foreground">{formatCurrency(invoice.total)}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {invoice.efactura_sent ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Trimisă
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Nu
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/invoices/${invoice.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye size={16} className="mr-2" />
                          Vezi
                        </Button>
                      </Link>
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

export default Invoices;