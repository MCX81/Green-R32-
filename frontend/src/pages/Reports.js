import React from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart3, TrendingUp } from 'lucide-react';

const Reports = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 fade-in">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Rapoarte</h1>
          <p className="text-muted-foreground mt-1">Analizează performanța financiară</p>
        </div>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} className="text-primary" />
              Rapoarte disponibile în curând
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <TrendingUp size={64} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Rapoarte și analize</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Această secțiune va conține rapoarte detaliate despre venituri, clienți, produse și multe altele.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;