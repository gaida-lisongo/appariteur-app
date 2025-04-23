"use client";

import React, { useEffect } from "react";
import { 
  PlusCircle, 
  RefreshCcw, 
  Trash2, 
  CreditCard 
} from "lucide-react";
import { TrancheInitiale } from "./TrancheModal";
import useUserStore from "@/store/useUserStore";
import { Promotion } from "@/types/api.types";

type Tranche = {
  _id: string;
  designation: string;
  montant: number;
  date_fin: string;
};

type FraisConfig = {
  _id: string;
  anneeAcad: string;
  montantTotal: number;
  devise: string;
  nombreTranches: number;
  tranches: Tranche[];
};

type ConfigurationFraisPanelProps = {
  fraisConfig: FraisConfig;
  setFraisConfig: React.Dispatch<React.SetStateAction<FraisConfig>>;
  ouvrirModalAjoutTranche: () => void;
  ouvrirModalEditionTranche: (index: number) => void;
  supprimerTranche: (params: { id: string; trancheId: string }) => void;
  distribuerMontantEgal: () => void;
  saveFraisAcademiques: () => Promise<void>;
  setShowFinancePanel: (show: boolean) => void;
  promotion: Promotion;
  minervals: any; // Ajout de cette prop
};

const ConfigurationFraisPanel = ({
  fraisConfig,
  setFraisConfig,
  ouvrirModalAjoutTranche,
  ouvrirModalEditionTranche,
  supprimerTranche,
  distribuerMontantEgal,
  saveFraisAcademiques,
  setShowFinancePanel,
  promotion,
  minervals
}: ConfigurationFraisPanelProps) => {
    const { isLoading, setLoading, fetchMinervals, setMinervals } = useUserStore();
  useEffect(()=>{
    console.log("Current promotion:", promotion);
    console.log("Current minerval:", minervals);
    
    return () => setMinervals([]);
  }, []);
  interface IMinerval {
    _id: string;
    montant: number;
    devise: string;
    tranches: Tranche[];
  }

  const totalTransactions: number = (minervals as IMinerval).tranches.reduce(
    (acc: number, tranche: Tranche) => acc + (tranche.montant || 0),
    0
  );
  
  const isBalanced = minervals.montant === totalTransactions;

  return (
    <div className="p-6 border-t border-stroke dark:border-strokedark">
      <h3 className="text-lg font-semibold mb-4 text-dark dark:text-white">
        Configuration des frais académiques
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="mb-2.5 block text-black dark:text-white">
            Montant total
          </label>
          <div className="relative">
            <input
              type="number"
              value={minervals.montant}
              onChange={(e) => setFraisConfig(prev => ({
                ...prev,
                montantTotal: parseFloat(e.target.value) || 0
              }))}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent pl-5 pr-20 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
            />
            <select
              value={minervals.devise}
              onChange={(e) => setFraisConfig(prev => ({
                ...prev,
                devise: e.target.value
              }))}
              className="absolute top-0 right-0 h-full rounded-r border-l border-stroke px-3 outline-none transition dark:border-form-strokedark dark:bg-form-input"
            >
              <option value="USD">USD</option>
              <option value="FC">CDF</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="mb-2.5 block text-black dark:text-white">
            Nombre de tranches
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max="10"
              value={minervals.tranches.length}
              onChange={(e) => setFraisConfig(prev => ({
                ...prev,
                nombreTranches: parseInt(e.target.value) || 1
              }))}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
            />
            <button
              type="button"
              onClick={distribuerMontantEgal}
              className="flex items-center gap-1 rounded bg-primary py-2 px-4 text-white hover:bg-opacity-90"
              title="Répartir également entre les tranches"
            >
              <RefreshCcw size={16} />
              <span className="hidden sm:inline">Répartir</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-black dark:text-white font-medium">Tranches configurées</h4>
          <button
            type="button"
            onClick={ouvrirModalAjoutTranche}
            className="flex items-center gap-1 rounded bg-primary py-1 px-3 text-sm text-white hover:bg-opacity-90"
          >
            <PlusCircle size={16} />
            Ajouter une tranche
          </button>
        </div>
        
        {minervals.tranches.length > 0 ? (
            <div className="space-y-4">
            {minervals.tranches.map((tranche: Tranche, index: number) => (
              <div key={tranche._id || index} className="grid grid-cols-1 sm:grid-cols-7 gap-4 items-center border border-stroke p-4 rounded-md dark:border-strokedark">
              <div className="sm:col-span-2">
                <h5 className="font-medium text-black dark:text-white">{tranche.designation}</h5>
              </div>
              
              <div className="sm:col-span-2">
                <span className="text-primary font-semibold">{tranche.montant} {minervals.devise}</span>
              </div>
              
              <div className="sm:col-span-2">
                <span className="text-sm text-body-color dark:text-body-color-dark">
                Date limite: {new Date(tranche.date_fin).toLocaleDateString()}
                </span>
              </div>
              
              <div className="sm:col-span-1 flex justify-end gap-2">
                
                <button
                type="button"
                onClick={() => supprimerTranche({id: minervals._id, trancheId: tranche._id})}
                className="flex items-center justify-center h-8 w-8 rounded-md border border-stroke hover:bg-danger hover:text-white dark:border-strokedark"
                aria-label="Supprimer la tranche"
                >
                <Trash2 size={16} />
                </button>
              </div>
              </div>
            ))}
            </div>
        ) : (
          <div className="text-center py-6 border border-dashed border-stroke rounded-md dark:border-strokedark">
            <p className="text-body-color dark:text-body-color-dark">
              Aucune tranche configurée. Cliquez sur "Ajouter une tranche" pour commencer.
            </p>
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center bg-gray-2 dark:bg-meta-4 p-3 rounded-md">
          <div>
            <span className="text-sm font-medium">Total configuré: </span>
            <span className="font-bold">
                {minervals.tranches.reduce((acc: number, tranche: Tranche) => acc + (tranche.montant || 0), 0)} {minervals.devise}
            </span>
          </div>
          
          <div className="text-sm">
            {isBalanced ? (
              <span className="text-success">✓ Montants équilibrés</span>
            ) : (
              <span className="text-warning">⚠ Le total des tranches ne correspond pas au montant total</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-4.5">
        <button
          onClick={() => setShowFinancePanel(false)}
          className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
        >
          Annuler
        </button>
        <button
          onClick={saveFraisAcademiques}
          className="flex items-center justify-center gap-2 rounded bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90"
        >
          <CreditCard size={18} />
          Enregistrer
        </button>
      </div>
    </div>
  );
};

export default ConfigurationFraisPanel;