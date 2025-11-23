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
  const [restoreProgress, setRestoreProgress] = useState(null);
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

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setSelectedFile(file);
        toast({
          title: 'Fișier selectat',
          description: `${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
        });
      } else {
        toast({
          title: 'Eroare',
          description: 'Vă rugăm să selectați un fișier JSON valid.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      toast({
        title: 'Niciun fișier selectat',
        description: 'Vă rugăm să selectați un fișier de backup mai întâi.',
        variant: 'destructive',
      });
      return;
    }

    // Confirm action
    if (!window.confirm('⚠️ ATENȚIE: Restaurarea va ȘTERGE toate datele curente (categorii, produse, review-uri) și le va înlocui cu datele din backup.\n\nSunteți sigur că doriți să continuați?')) {
      return;
    }

    setRestoring(true);
    setRestoreProgress({ status: 'processing', message: 'Se citește fișierul...' });

    try {
      // Read file content
      const fileContent = await selectedFile.text();
      setRestoreProgress({ status: 'processing', message: 'Se încarcă datele în baza de date...' });
      
      // Send to backend with longer timeout for large files
      const response = await api.post('/admin/backup/restore', {
        backup_file: fileContent
      }, {
        timeout: 300000 // 5 minute timeout for large restores
      });

      // Display detailed results
      const { restored, errors, progress, message } = response.data;
      setRestoreProgress({ 
        status: errors && errors.length > 0 ? 'warning' : 'success', 
        message: message,
        details: progress 
      });
      
      // Build detailed description
      let description = '';
      if (restored) {
        const restoredItems = Object.entries(restored)
          .filter(([_, val]) => val > 0)
          .map(([key, val]) => `${key}: ${val}`)
          .join(', ');
        description = `Restaurate: ${restoredItems}`;
      }
      
      // Show progress details if available
      if (progress && progress.length > 0) {
        console.log('Detalii restaurare:', progress);
      }

      // Show appropriate toast based on success/errors
      if (errors && errors.length > 0) {
        toast({
          title: 'Backup restaurat cu avertismente',
          description: `${description}\n\nErori: ${errors.join(', ')}`,
          variant: 'warning',
        });
      } else {
        toast({
          title: '✓ Backup restaurat cu succes!',
          description: description,
        });
      }

      // Reload backup info
      await loadBackupInfo();
      
      // Clear selected file
      setSelectedFile(null);
      
      // Reload page after 2 seconds to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Restore error:', error);
      
      // Extract detailed error message
      let errorMessage = 'Nu s-a putut restaura backup-ul. Verificați formatul fișierului.';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setRestoreProgress({ 
        status: 'error', 
        message: 'Eroare la restaurare',
        details: [errorMessage]
      });
      
      toast({
        title: 'Eroare la restaurare',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setRestoring(false);
      
      // Clear progress after 10 seconds
      setTimeout(() => {
        setRestoreProgress(null);
      }, 10000);
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

      {/* Download Backup Card */}
      <Card className="rounded-2xl border-2 border-gray-100 p-6 mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Download className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Descarcă Backup</h2>
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

      {/* Restore Backup Card */}
      <Card className="rounded-2xl border-2 border-gray-100 p-6 mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">Restaurează Backup</h2>
            <p className="text-sm text-gray-600">
              Încarcă un fișier JSON de backup pentru a restaura datele
            </p>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-800">
              <p className="font-semibold mb-2">⚠️ ATENȚIE - Acțiune Periculoasă!</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Toate categoriile curente vor fi ȘTERSE și înlocuite</li>
                <li>Toate produsele curente vor fi ȘTERSE și înlocuite</li>
                <li>Toate review-urile curente vor fi ȘTERSE și înlocuite</li>
                <li>Comenzile noi vor fi păstrate (nu se șterg)</li>
                <li>Creați un backup înainte de restaurare!</li>
              </ul>
            </div>
          </div>
        </div>

        {/* File Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Selectează fișierul de backup (JSON)
          </label>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileSelect}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
          {selectedFile && (
            <div className="mt-3 p-3 bg-blue-50 rounded-xl flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-800">
                <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(2)} KB)
              </span>
            </div>
          )}
        </div>

        <Button
          onClick={handleRestore}
          disabled={restoring || !selectedFile}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 text-lg font-semibold disabled:opacity-50"
        >
          {restoring ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Se restaurează backup-ul...
            </>
          ) : (
            <>
              <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Restaurează Backup Acum
            </>
          )}
        </Button>

        {/* Restore Progress Display */}
        {restoreProgress && (
          <div className={`mt-6 p-4 rounded-xl border-2 ${
            restoreProgress.status === 'success' ? 'bg-green-50 border-green-200' :
            restoreProgress.status === 'error' ? 'bg-red-50 border-red-200' :
            restoreProgress.status === 'warning' ? 'bg-orange-50 border-orange-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              {restoreProgress.status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {restoreProgress.status === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
              {restoreProgress.status === 'warning' && <AlertCircle className="h-5 w-5 text-orange-600" />}
              {restoreProgress.status === 'processing' && (
                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span className={`font-semibold ${
                restoreProgress.status === 'success' ? 'text-green-800' :
                restoreProgress.status === 'error' ? 'text-red-800' :
                restoreProgress.status === 'warning' ? 'text-orange-800' :
                'text-blue-800'
              }`}>
                {restoreProgress.message}
              </span>
            </div>
            
            {restoreProgress.details && restoreProgress.details.length > 0 && (
              <div className={`text-sm space-y-1 ${
                restoreProgress.status === 'success' ? 'text-green-700' :
                restoreProgress.status === 'error' ? 'text-red-700' :
                restoreProgress.status === 'warning' ? 'text-orange-700' :
                'text-blue-700'
              }`}>
                {restoreProgress.details.map((detail, index) => (
                  <div key={index} className="pl-8">• {detail}</div>
                ))}
              </div>
            )}
          </div>
        )}
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
