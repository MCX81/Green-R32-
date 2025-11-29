import React from 'react';
import Sidebar from './Sidebar';
import { Toaster } from '../ui/sonner';

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className="ml-64">
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default DashboardLayout;