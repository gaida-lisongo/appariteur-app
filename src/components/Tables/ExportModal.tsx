import React, { useState } from 'react';
import { X, Download, Check } from 'lucide-react';

type ExportOption = {
  id: string;
  label: string;
  selected: boolean;
};

type ExportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: { fields: string[], includeHeader: boolean }) => void;
};

export function ExportModal({ isOpen, onClose, onExport }: ExportModalProps) {
  // Options d'exportation
  const [exportOptions, setExportOptions] = useState<ExportOption[]>([
    { id: 'nom', label: 'Nom', selected: true },
    { id: 'prenom', label: 'Prénom', selected: true },
    { id: 'matricule', label: 'Matricule', selected: true },
    { id: 'sexe', label: 'Sexe', selected: true },
    { id: 'dateNaissance', label: 'Date de naissance', selected: true },
    { id: 'lieuNaissance', label: 'Lieu de naissance', selected: true },
    { id: 'email', label: 'Email', selected: true },
    { id: 'telephone', label: 'Téléphone', selected: true },
    { id: 'adresse', label: 'Adresse', selected: true },
    { id: 'optId', label: 'ID Option', selected: true },
  ]);

  const [includeHeader, setIncludeHeader] = useState(true);
  
  const handleToggleOption = (id: string) => {
    setExportOptions(options => 
      options.map(option => 
        option.id === id ? { ...option, selected: !option.selected } : option
      )
    );
  };
  
  const handleSelectAll = () => {
    setExportOptions(options => options.map(option => ({ ...option, selected: true })));
  };
  
  const handleSelectNone = () => {
    setExportOptions(options => options.map(option => ({ ...option, selected: false })));
  };
  
  const handleExport = () => {
    const selectedFields = exportOptions
      .filter(option => option.selected)
      .map(option => option.id);
      
    onExport({ fields: selectedFields, includeHeader });
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-stroke dark:border-strokedark">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            Options d'exportation
          </h3>
          <button 
            onClick={onClose}
            className="text-body-color dark:text-body-color-dark hover:text-danger"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <h4 className="font-medium text-black dark:text-white mb-2">Sélectionner les colonnes</h4>
            
            <div className="flex justify-end mb-2 gap-2">
              <button 
                onClick={handleSelectAll}
                className="text-xs text-primary hover:underline"
              >
                Tout sélectionner
              </button>
              <button 
                onClick={handleSelectNone}
                className="text-xs text-body-color dark:text-body-color-dark hover:underline"
              >
                Tout désélectionner
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {exportOptions.map(option => (
                <div key={option.id} className="flex items-center">
                  <input 
                    type="checkbox" 
                    id={`export-${option.id}`}
                    checked={option.selected}
                    onChange={() => handleToggleOption(option.id)}
                    className="w-4 h-4 text-primary border-stroke dark:border-strokedark rounded focus:ring-primary dark:bg-boxdark"
                  />
                  <label 
                    htmlFor={`export-${option.id}`}
                    className="ml-2 text-sm text-black dark:text-white"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="include-header"
                checked={includeHeader}
                onChange={() => setIncludeHeader(!includeHeader)}
                className="w-4 h-4 text-primary border-stroke dark:border-strokedark rounded focus:ring-primary dark:bg-boxdark"
              />
              <label 
                htmlFor="include-header"
                className="ml-2 text-sm text-black dark:text-white"
              >
                Inclure l'en-tête stylisé
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end p-4 border-t border-stroke dark:border-strokedark">
          <button
            onClick={onClose}
            className="mr-2 inline-flex items-center gap-2 rounded-md border border-stroke py-2 px-4 text-sm font-medium hover:border-primary hover:text-primary dark:border-strokedark"
          >
            Annuler
          </button>
          
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-md bg-primary py-2 px-4 text-sm font-medium text-white hover:bg-opacity-90"
          >
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>
    </div>
  );
}