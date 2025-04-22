"use client";

import React, { useState } from "react";
import { 
  CreditCard, 
  PlusCircle, 
  AlertCircle,
  CheckCircle2,
  X
} from "lucide-react";
import services from "@/services";

type CreateMinervalPanelProps = {
  promotion: any;
  anneeId: string | null;
  onCreateMinerval: (minervalData: any) => Promise<void>;
  setShowFinancePanel: (show: boolean) => void;
};

const CreateMinervalPanel = ({
  promotion,
  anneeId,
  onCreateMinerval,
  setShowFinancePanel
}: CreateMinervalPanelProps) => {
  const { Appariteur } = services;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  const [minervalData, setMinervalData] = useState({
    montant: 0,
    devise: "USD",
    nombreTranches: 1,
    trancheUniqueDate: new Date().toISOString().split('T')[0]
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "montant" || name === "nombreTranches") {
      setMinervalData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setMinervalData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Validation
      if (minervalData.montant <= 0) {
        throw new Error("Le montant doit être supérieur à zéro");
      }
      if (anneeId === null) {
        throw new Error("L'année académique est requise");
        
      }

      // Préparer les données pour l'API
      const submitData = {
        promotionId: promotion._id,
        anneeId: anneeId,
        montant: minervalData.montant,
        devise: minervalData.devise,
        // Si une seule tranche, on utilise le montant total
        tranches: [{
          designation: "Tranche 1",
          montant: minervalData.montant,
          date_fin: new Date(minervalData.trancheUniqueDate)
        }]
      };
      
      const response = await Appariteur.createMinerval(submitData);
      await onCreateMinerval(submitData);
      setSuccess(true);
      
      // Réinitialiser le formulaire
      setMinervalData({
        montant: 0,
        devise: "USD",
        nombreTranches: 1,
        trancheUniqueDate: new Date().toISOString().split('T')[0]
      });
      
      // // Afficher un message de succès pendant quelques secondes
      // setTimeout(() => {
      //   setSuccess(false);
      // }, 3000);
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue lors de la création des frais");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="p-6 border-t border-stroke dark:border-strokedark animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-black dark:text-white">
          Configuration des frais académiques
        </h3>
        <button 
          onClick={() => setShowFinancePanel(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
      </div>
      
      {success && (
        <div className="p-3 mb-4 rounded-md bg-success/20 text-sm text-success flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Frais académiques créés avec succès</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 dark:bg-meta-4 p-4 rounded-md mb-6">
          <h4 className="font-medium text-black dark:text-white mb-2">
            Information sur la promotion
          </h4>
          <p className="text-body-color dark:text-body-color-dark">
            {promotion.niveau} {promotion.mention} {promotion.orientation || ''}
            <span className="block text-sm mt-1">
              {promotion.nombreInscrits || 0} étudiant(s) inscrit(s)
            </span>
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="mb-2.5 block text-black dark:text-white">
              Montant total <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="montant"
                value={minervalData.montant}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent pl-5 pr-20 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                required
              />
              <select
                name="devise"
                value={minervalData.devise}
                onChange={handleChange}
                className="absolute top-0 right-0 h-full rounded-r border-l border-stroke px-3 outline-none transition dark:border-form-strokedark dark:bg-form-input"
              >
                <option value="USD">USD</option>
                <option value="FC">CDF</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <p className="mt-1 text-sm text-meta-5">
              Montant total des frais académiques pour cette année
            </p>
          </div>
          
          <div>
            <label className="mb-2.5 block text-black dark:text-white">
              Date limite de paiement
            </label>
            <input
              type="date"
              name="trancheUniqueDate"
              value={minervalData.trancheUniqueDate}
              onChange={handleChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
            />
            <p className="mt-1 text-sm text-meta-5">
              Date limite pour le paiement intégral des frais
            </p>
          </div>
        </div>
        
        {error && (
          <div className="p-3 rounded-md bg-danger/20 text-sm text-danger flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        
        <div className="border-t border-stroke dark:border-strokedark pt-4 mt-6 flex justify-between items-center">
          <p className="text-sm text-body-color dark:text-body-color-dark">
            Vous pourrez configurer des tranches de paiement après avoir créé les frais
          </p>
          
          <div className="flex justify-end gap-4.5">
            <button
              type="button"
              onClick={() => setShowFinancePanel(false)}
              className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 rounded bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-70"
            >
              {isSubmitting ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              ) : (
                <PlusCircle size={18} />
              )}
              Créer les frais
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateMinervalPanel;