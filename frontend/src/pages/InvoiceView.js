import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Button } from '../components/ui/button';
import { Download, ArrowLeft } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '../lib/utils';

const InvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    try {
      const response = await api.get(`/invoices/${id}`);
      setInvoice(response.data);
    } catch (error) {
      toast.error('Eroare la încărcarea facturii');
      navigate('/facturare/invoices');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`);
      const pdfBase64 = response.data.pdf;
      const blob = new Blob([Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0))], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.series}-${invoice.invoice_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF descarcat');
    } catch (error) {
      toast.error('Eroare la descarcare');
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

  if (!invoice) return null;

  const invoiceTypes = {
    'factura': 'FACTURĂ',
    'proforma': 'FACTURĂ PROFORMĂ',
    'aviz': 'AVIZ DE ÎNSOȚIRE',
    'chitanta': 'CHITANȚĂ'
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto fade-in">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => navigate('/invoices')}>
            <ArrowLeft size={16} className="mr-2" /> Înapoi
          </Button>
          <Button onClick={downloadPDF} className="rounded-full">
            <Download size={16} className="mr-2" /> Descarcă PDF
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <div className="text-center border-b border-slate-200 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{invoiceTypes[invoice.invoice_type]}</h1>
            <p className="text-lg font-mono text-muted-foreground mt-2">Seria: {invoice.series} Nr: {invoice.invoice_number}</p>
            <p className="text-muted-foreground mt-1">Dată: {formatDate(invoice.issue_date)}</p>
            {invoice.due_date && <p className="text-muted-foreground">Scadență: {formatDate(invoice.due_date)}</p>}
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Furnizor</h3>
              <div className="text-sm text-foreground space-y-1">
                <p className="font-semibold">Companie (din BD)</p>
                <p className="text-muted-foreground">Datele companiei vor fi afișate aici</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Client</h3>
              <div className="text-sm text-foreground space-y-1">
                <p className="font-semibold">Client (din BD)</p>
                <p className="text-muted-foreground">Datele clientului vor fi afișate aici</p>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Nr</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Denumire</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Cant.</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">U.M.</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Preț</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">TVA</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-t border-slate-200">
                    <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{item.product_name}</p>
                      {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-foreground">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-right text-muted-foreground">{item.unit}</td>
                    <td className="px-4 py-3 text-sm text-right text-foreground">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3 text-sm text-right text-muted-foreground">{item.vat_rate}%</td>
                    <td className="px-4 py-3 text-sm font-medium text-right text-foreground">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-80 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium text-foreground">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TVA Total:</span>
                <span className="font-medium text-foreground">{formatCurrency(invoice.vat_total)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-3">
                <span className="text-foreground">Total de plată:</span>
                <span className="text-primary">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Observații</h4>
              <p className="text-sm text-foreground">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InvoiceView;