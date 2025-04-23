"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { ContactForm } from "../forms/form-layout/_components/contact-form";
import { SignInForm } from "../forms/form-layout/_components/sign-in-form";
import { SignUpForm } from "../forms/form-layout/_components/sign-up-form";
import { use, useEffect, useState } from "react";
import { UserPlus, FileUpIcon, Save, X } from "lucide-react";
import useUserStore from "@/store/useUserStore";
import { Inscrits } from "@/types/api.types";

// Ce composant ne peut pas exporter de metadata car il est côté client
// export const metadata: Metadata = {
//   title: "Form Layout",
// };

export default function EtudiantsLayout({ children }: { children: React.ReactNode }) {
  const [formType, setFormType] = useState<"new" | "import" | null>(null);
  const { etudiants } = useUserStore();
  const [inscrits, setInscrits] = useState<Inscrits[] | []>([]);
  const [stats, setStats] = useState<{
    total: number;
    hommes: number;
    femmes: number;
  } | null>(null);
  
  useEffect(() => {
    if (etudiants) {
      etudiants.forEach((etudiant) => {
        const allInscrits = etudiant.inscrits.map((inscrit: any) => {
          return inscrit;
        })
        
        setInscrits(allInscrits);
      })
      // const allInscrits = etudiants.reduce((acc: Inscrits[], current: any) => {
      //   if (current.inscrits && Array.isArray(current.inscrits)) {
      //     return [...acc, ...current.inscrits];
      //   }
      //   return acc;
      // }, []);
      // setInscrits(allInscrits);
    }
  }, [etudiants])

  useEffect(() => {
    if (inscrits.length > 0) {
      const total = inscrits.length;
      const hommes = inscrits.filter((etudiant) => etudiant?.sexe == "M").length;
      const femmes = inscrits.filter((etudiant) => etudiant.sexe == "F").length;
      setStats({ total, hommes, femmes });
    } else {
      setStats(null);
    }
  }, [inscrits]);
  // Fonction pour fermer le formulaire actif
  const closeForm = () => setFormType(null);

  if (!inscrits) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
    
  }

  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        {/* Contenu principal - prend 2/3 de l'espace (8/12 colonnes) */}
        <div className="col-span-12 lg:col-span-9">
          {children}
        </div>

        {/* Sidebar de formulaire - prend 1/3 de l'espace (4/12 colonnes) */}
        <div className="col-span-12 lg:col-span-3">
          {/* Boutons d'action quand aucun formulaire n'est affiché */}
          {!formType && (
            <div className="mb-6 flex flex-col gap-4">
              
              <button
                onClick={() => setFormType("import")}
                className="flex items-center justify-center gap-2 rounded-lg border border-primary py-3 px-4 font-medium text-primary hover:bg-primary hover:text-white"
              >
                <FileUpIcon size={18} />
                Importer un CSV
              </button>
            </div>
          )}
          
          {/* Formulaire d'importation CSV */}
          {formType === "import" && (
            <div className="rounded-sm border border-stroke bg-white px-5 pb-5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex items-center justify-between mb-4 border-b border-stroke pb-3 dark:border-strokedark">
                <h3 className="text-xl font-semibold text-dark dark:text-white">
                  Importer des étudiants
                </h3>
                <button
                  onClick={closeForm}
                  className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-meta-4"
                >
                  <X size={18} />
                </button>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    Promotion <span className="text-meta-1">*</span>
                  </label>
                  <select className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white">
                    <option value="">Sélectionnez une promotion</option>
                    <option value="L1">L1 Informatique</option>
                    <option value="L2">L2 Informatique</option>
                    <option value="L3">L3 Informatique</option>
                  </select>
                </div>
                
                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    Fichier CSV <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent font-medium outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-stroke file:bg-whiter file:py-3 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
                  />
                  <p className="mt-2 text-xs text-meta-1">Format accepté: CSV. Taille max: 5 Mo</p>
                </div>
                
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2.5 rounded-md bg-primary py-2 px-3 text-center font-medium text-white hover:bg-opacity-90"
                  >
                    <span>
                      <FileUpIcon size={16} />
                    </span>
                    Importer les étudiants
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2.5 rounded-md border border-primary py-2 px-3 text-center font-medium text-primary hover:bg-primary hover:text-white"
                  >
                    Télécharger le modèle CSV
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Éléments du layout original si nécessaire */}
          {!formType && (
            <>
              <div className="mb-6 rounded-sm border border-stroke bg-white px-5 pb-5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <h3 className="text-xl font-semibold text-dark dark:text-white mb-4 border-b border-stroke pb-3 dark:border-strokedark">
                  Statistiques
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-body-color dark:text-body-color-dark">Total étudiants:</span>
                    <span className="font-semibold text-dark dark:text-white">{stats?.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-color dark:text-body-color-dark">Hommes:</span>
                    <span className="font-semibold text-dark dark:text-white">{stats?.hommes} ({stats?.total ? (stats.hommes*100 / stats.total).toFixed(2) : 0 }%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-color dark:text-body-color-dark">Femmes:</span>
                    <span className="font-semibold text-dark dark:text-white">{stats?.femmes} ({stats?.total ? (stats.femmes*100 / stats.total).toFixed(2) : 0 }%)</span>
                  </div>
                  {/* <div className="flex justify-between">
                    <span className="text-body-color dark:text-body-color-dark">Promotions:</span>
                    <span className="font-semibold text-dark dark:text-white">15</span>
                  </div> */}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
