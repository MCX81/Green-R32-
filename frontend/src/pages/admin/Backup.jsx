import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Download, Database, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/api';

const Backup = () => {
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [backupInfo, setBackupInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadBackupInfo();
  }, []);

  const loadBackupInfo = async () => {
    try {
      const response = await api.get('/admin/backup/info');
      setBackupInfo(response.data);
    } catch (error) {
      console.error('Error loading backup info:', error);
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    
    try {
      // Get backup data
      const response = await api.get('/admin/backup/export', {
        responseType: 'blob'
      });
      
      // Create download link
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `backup_r32_ecommerce_${timestamp}.json`;
      link.setAttribute('download', filename);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Backup creat cu succes!',
        description: `Fișierul ${filename} a fost descărcat.`,
      });
      
    } catch (error) {
      console.error('Backup error:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut crea backup-ul. Încercați din nou.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingInfo) {
    return <div className="p-8">Se încarcă...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Backup Bază de Date</h1>
        <p className="text-gray-600">
          Descarcă o copie completă a bazei de date pentru siguranță și restaurare
        </p>
      </div>

      {/* Database Info Card */}
      <Card className="rounded-2xl border-2 border-gray-100 p-6 mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Database className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Informații Bază de Date</h2>
            <p className="text-sm text-gray-600">
              Ultima verificare: {backupInfo && new Date(backupInfo.timestamp).toLocaleString('ro-RO')}
            </p>
          </div>
        </div>

        {backupInfo && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-600 mb-1">Categorii</div>
              <div className="text-2xl font-bold text-gray-900">
                {backupInfo.collections.categories}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-600 mb-1">Produse</div>
              <div className="text-2xl font-bold text-gray-900">
                {backupInfo.collections.products}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-600 mb-1">Utilizatori</div>
              <div className="text-2xl font-bold text-gray-900">
                {backupInfo.collections.users}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-600 mb-1">Comenzi</div>
              <div className="text-2xl font-bold text-gray-900">
                {backupInfo.collections.orders}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-600 mb-1">Review-uri</div>
              <div className="text-2xl font-bold text-gray-900">
                {backupInfo.collections.reviews}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Info className="h-5 w-5" />
              <span>Total documente: <strong>{backupInfo?.total_documents || 0}</strong></span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Database className="h-5 w-5" />
              <span>Bază de date: <strong>{backupInfo?.database}</strong></span>
            </div>
          </div>
        </div>
      </Card>

      {/* Backup Action Card */}
      <Card className="rounded-2xl border-2 border-gray-100 p-6 mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Download className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Creează Backup</h2>
            <p className="text-sm text-gray-600">
              Descarcă o copie JSON a întregii baze de date
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-2">Ce include backup-ul?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Toate categoriile și subcategoriile</li>
                <li>Toate produsele cu detalii complete</li>
                <li>Utilizatori (fără parole, doar informații publice)</li>
                <li>Comenzi și istoric comenzi</li>
                <li>Review-uri și rating-uri produse</li>
              </ul>
            </div>
          </div>
        </div>

        <Button
          onClick={handleBackup}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-6 text-lg font-semibold"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Se creează backup-ul...
            </>
          ) : (
            <>
              <Download className="h-6 w-6 mr-2" />
              Descarcă Backup Acum
            </>
          )}
        </Button>
      </Card>

      {/* Instructions Card */}
      <Card className="rounded-2xl border-2 border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Cum să Restaurezi Backup-ul</h2>
            <p className="text-sm text-gray-600">
              Pași pentru restaurarea bazei de date din backup
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-purple-600">
              1
            </div>
            <div>
              <p className="font-semibold">Descarcă fișierul de backup</p>
              <p className="text-sm text-gray-600">
                Click pe butonul "Descarcă Backup Acum" de mai sus. Fișierul va fi salvat cu format: 
                <code className="bg-gray-100 px-2 py-1 rounded ml-1">backup_r32_ecommerce_YYYYMMDD_HHMMSS.json</code>
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-purple-600">
              2
            </div>
            <div>
              <p className="font-semibold">Păstrează fișierul în siguranță</p>
              <p className="text-sm text-gray-600">
                Salvează fișierul într-o locație sigură (Google Drive, Dropbox, etc.) pentru backup pe termen lung.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-purple-600">
              3
            </div>
            <div>
              <p className="font-semibold">Restaurare manuală (dacă e necesar)</p>
              <p className="text-sm text-gray-600">
                Pentru a restaura datele, contactează echipa tehnică cu fișierul de backup. 
                Restaurarea se face prin MongoDB import tools.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-600">
              <p className="font-semibold mb-1">Recomandare:</p>
              <p>
                Creează backup-uri regulate (săptămânal sau lunar) pentru a proteja datele importante. 
                Backup-urile sunt esențiale pentru recuperarea în caz de pierdere accidentală de date.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Backup;
