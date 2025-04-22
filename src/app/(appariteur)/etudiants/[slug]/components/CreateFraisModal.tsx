"use client";

import React, { useState } from "react";
import { X, AlertCircle, CreditCard } from "lucide-react";

type CreateFraisModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fraisData: FraisInitialData) => Promise<void>;
  promotion: any;
};

type FraisInitialData = {
  montant: number;
  devise: string;
  promotionId: string;
  anneeId: string;
};

const CreateFraisModal = ({ isOpen, onClose, onSave, promotion }: CreateFraisModalProps) => {
  const [formData, setFormData] = useState<FraisInitialData>({
    montant: 0,
    devise: "USD",
    promotionId: promotion?._id || "",
    anneeId: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "montant") {
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
    
    try {
      await onSave(formData);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue lors de la création des frais académiques");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-boxdark p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-dark dark:text-white">
            Configurer les frais académiques
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
              <h4 className="mb-2 font-medium text-black dark:text-white">
                Promotion: {promotion.niveau} {promotion.mention} {promotion.orientation || ''}
              </h4>
              <p className="text-sm text-body-color dark:text-body-color-dark">
                Configuration des frais académiques pour l'année en cours
              </p>
            </div>
            
            <div>
              <label htmlFor="montant" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                Montant total <span className="text-red-500">*</span>
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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent pl-5 pr-20 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  required
                />
                <select
                  id="devise"
                  name="devise"
                  value={formData.devise}
                  onChange={handleChange}
                  className="absolute right-0 top-0 h-full rounded-r border-l border-stroke px-3 outline-none transition dark:border-form-strokedark dark:bg-form-input"
                >
                  <option value="USD">USD</option>
                  <option value="FC">CDF</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
            
            {error && (
              <div className="p-3 mb-3 rounded-md bg-red-50 dark:bg-red-900/30 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            
            <p className="text-xs text-body-color dark:text-body-color-dark mt-2">
              Vous pourrez configurer les tranches de paiement après avoir créé les frais académiques.
            </p>
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
              <CreditCard size={16} />
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFraisModal;