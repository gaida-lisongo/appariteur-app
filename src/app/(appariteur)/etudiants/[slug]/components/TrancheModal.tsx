import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
import services from '@/services';

export type TrancheInitiale = {
  index?: number;
  _id?: string;
  designation: string;
  montant: number;
  date_fin: string;
};

export type TrancheFormData = {
  designation: string;
  montant: number;
  date_fin: string;
};

export interface TrancheModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TrancheFormData) => Promise<void>;
  trancheInitiale?: TrancheInitiale;
  devise: string;
  minerval: any;
  minervalId: string
}

const TrancheModal = ({ isOpen, onClose, onSave, trancheInitiale, devise, minervalId }: TrancheModalProps) => {
  const { Appariteur } = services;
  const [formData, setFormData] = useState<TrancheFormData>({
    designation: trancheInitiale?.designation || "",
    montant: trancheInitiale?.montant || 0,
    date_fin: trancheInitiale?.date_fin || new Date().toISOString().split('T')[0]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Mise à jour des données du formulaire quand trancheInitiale change
  useEffect(() => {
    if (trancheInitiale) {
      setFormData({
        designation: trancheInitiale.designation,
        montant: trancheInitiale.montant,
        date_fin: trancheInitiale.date_fin
      });
    }
  }, [trancheInitiale]);
  
  // Gestion de la fermeture de la modal par clic externe
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'montant') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const payload = {
        id: minervalId,
        data: {
          designation: formData.designation,
          montant: formData.montant,
          date_fin: new Date(formData.date_fin)
        }
    }
    console.log("Payload to create a new tranche:", payload);

    try {
        const response = await Appariteur.createTranche(payload);
        console.log("Response from createTranche:", response);
        if (response.success) {
            onSave(response.data);
            onClose();
            
        }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        ref={modalRef} 
        className="bg-white dark:bg-boxdark p-6 rounded-lg shadow-xl w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-dark dark:text-white">
            {trancheInitiale?.index !== undefined ? 'Modifier la tranche' : 'Ajouter une tranche'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="designation" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                Désignation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label htmlFor="montant" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                Montant <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="montant"
                  name="montant"
                  value={formData.montant}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent pl-5 pr-12 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-body-color dark:text-body-color-dark">
                  {devise}
                </span>
              </div>
            </div>
            
            <div>
              <label htmlFor="date_fin" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                Date limite <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date_fin"
                name="date_fin"
                value={formData.date_fin}
                onChange={handleChange}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                required
              />
            </div>
            
            {(error) && (
              <div className="p-3 mb-3 rounded-md bg-red-50 dark:bg-red-900/30 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stroke rounded-md text-gray-700 dark:text-gray-300 dark:border-strokedark hover:bg-gray-100 dark:hover:bg-meta-4 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 flex items-center gap-2 disabled:opacity-70"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrancheModal;