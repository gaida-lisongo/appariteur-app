"use client";

import { useState } from "react";
import {
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Search,
  Trash2,
  UserPlus
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { User, Mail, Calendar, BarChart2, BookOpen, GraduationCap, Hash } from 'lucide-react';
import CreateEtudiantModal from "@/components/Tables/CreateEtudiantModal";
import { ExportModal } from '@/components/Tables/ExportModal';
import { Promotion } from "@/types/api.types";
import useUserStore from "@/store/useUserStore";
import { exportEtudiantsToExcel } from '@/utils/excelExport';

// Type pour les données d'étudiants
type Etudiant = {
  _id: string;
  nom: string;
  prenom: string;
  matricule?: string;
  email?: string;
  telephone?: string;
  sexe: string;
  photo?: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  nationalite?: string;
  adresse?: string;
  statutMarital?: string;
  persAContacter?: string;
  telPersonneContact?: string;
  isPaying?: boolean;  // Indique si l'étudiant paie régulièrement
  hasPaid?: boolean;  // Indique si l'étudiant a payé toutes ses tranches
  inscrits?: any[];  // Ajouter cette propriété
  optId?: string;  // Identifiant optionnel
};

type ExportOptions = {
  title: string;
  filename: string;
  sheetName: string;
  fields?: string[];
  includeHeader?: boolean;
};

type EtudiantsTableProps = {
  etudiants: Etudiant[];
  promotionId: string;
  anneeId: string;
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  promotionInfo: Promotion | null; // Information sur la promotion
};

export function EtudiantsTable({ 
  etudiants = [], 
  promotionId,
  anneeId,
  onDelete,
  onRefresh,
  isLoading = false,
  promotionInfo
}: EtudiantsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string>("nom");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { setEtudiants, fetchEtudiant, activeAppariteur } = useUserStore();
  // Filtrer les étudiants selon le terme de recherche
  const filteredEtudiants = etudiants.filter(
    (etudiant) =>
      etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (etudiant.email && etudiant.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (etudiant.matricule && etudiant.matricule.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Trier les étudiants
  const sortedEtudiants = [...filteredEtudiants].sort((a, b) => {
    const fieldA = a[sortField as keyof Etudiant] || "";
    const fieldB = b[sortField as keyof Etudiant] || "";
    
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === "asc"
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    }
    
    return 0;
  });
  
  // Calculer la pagination
  const totalPages = Math.ceil(sortedEtudiants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEtudiants = sortedEtudiants.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  // Fonction pour gérer la création d'un étudiant
  const handleCreateEtudiant = async (etudiantData: any) => {
    try {
      const newInscrit = {
        _id: etudiantData._id,
        nom: etudiantData?.infoPerso.nom,
        prenom: etudiantData?.infoPerso.preNom,
        email: etudiantData?.infoSec.email,
        matricule: etudiantData?.infoSec.etudiantId,
        telephone: etudiantData?.infoSec.telephone,
        adresse: etudiantData?.infoPerso.adresse,
        sexe: etudiantData?.infoPerso.sexe,
        dateNaissance: etudiantData?.infoPerso.dateNaissance,
        lieuNaissance: etudiantData?.infoPerso.lieuNaissance,
        nationalite: etudiantData?.infoPerso.nationalite,
        section: etudiantData?.infoScol.section,
        option: etudiantData?.infoScol.option,
        pourcentage: etudiantData?.infoScol.pourcentage,
        optId: etudiantData?.infoSec.optId
      }
      // Rechargement de la page
      window.location.reload();
      // Mettre à jour la liste des étudiants dans le store
      const updateInscrits = [{
        promotionId: promotionId,
        inscrits: [...(etudiants[0]?.inscrits || []), newInscrit]
      }];
      
      setEtudiants(updateInscrits);
      // Appel API à implémenter
      // const response = await fetch('/api/etudiants', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(etudiantData),
      // });
      
      // Simulation de délai pour l'exemple
      // await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Rafraîchir la liste après création
      if (onRefresh) onRefresh();
      
      return Promise.resolve();
    } catch (error) {
      console.error("Erreur lors de la création de l'étudiant:", error);
      return Promise.reject(new Error("La création de l'étudiant a échoué"));
    }
  };

  // Ajouter cette fonction pour l'exportation
  const handleExportExcel = async () => {
    let anneeAcademique = activeAppariteur?.anneeId?.slogan ?? '2023/2024'; // Valeur par défaut
    
    try {
      const filename = `liste-etudiants-${promotionInfo?.niveau || 'promotion'}-${anneeAcademique?.replace('/', '-') || '2023-2024'}.xlsx`;
      
      const title = `LISTE DES ÉTUDIANTS - ${promotionInfo?.niveau || ''} ${promotionInfo?.mention || ''} ${promotionInfo?.orientation || ''}`;
      
      await exportEtudiantsToExcel(
        filteredEtudiants, // Exporter tous les étudiants filtrés (pas juste la page actuelle)
        promotionInfo,
        anneeAcademique,
        {
          title,
          filename,
          sheetName: `Étudiants ${promotionInfo?.niveau || ''}`
        }
      );
    } catch (error) {
      console.error("Erreur lors de l'exportation:", error);
    }
  };

  // Fonction pour exporter avec options personnalisées
  const handleCustomExport = async ({ fields, includeHeader }: { fields: string[], includeHeader: boolean }) => {
    let anneeAcademique = activeAppariteur?.anneeId?.slogan ?? '2023/2024'; // Valeur par défaut
    
    try {
      const filename = `liste-etudiants-${promotionInfo?.niveau || 'promotion'}-${anneeAcademique?.replace('/', '-') || '2023-2024'}.xlsx`;
      
      const title = `LISTE DES ÉTUDIANTS - ${promotionInfo?.niveau || ''} ${promotionInfo?.mention || ''} ${promotionInfo?.orientation || ''}`;
      
      // Vous devrez modifier la fonction exportEtudiantsToExcel pour accepter fields et includeHeader
      await exportEtudiantsToExcel(
        filteredEtudiants,
        promotionInfo,
        anneeAcademique,
        {
          title,
          filename,
          sheetName: `Étudiants ${promotionInfo?.niveau || ''}`,
          includeHeader,
          fields
        }
      );
    } catch (error) {
      console.error("Erreur lors de l'exportation:", error);
    }
  };
  
  // Gérer le changement de tri
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  // Pagination
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Formatage de la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR').format(date);
  };

  // Générer un placeholder d'avatar basé sur le nom
  const generateInitials = (nom: string, prenom: string) => {
    return `${nom.charAt(0)}${prenom.charAt(0)}`.toUpperCase();
  };

  // if (isLoading) {
  //   return (
  //     <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
  //       <div className="flex justify-between items-center pb-4 border-b border-stroke dark:border-strokedark">
  //         <h4 className="text-xl font-semibold text-black dark:text-white">
  //           Liste des étudiants
  //         </h4>
  //       </div>
  //       <div className="flex justify-center items-center py-10">
  //         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-stroke pb-4 dark:border-strokedark">
        <h4 className="text-xl font-semibold text-black dark:text-white mb-3 md:mb-0">
          Liste des étudiants
        </h4>
        
        <div className="flex flex-wrap gap-2 md:gap-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-primary py-2 px-4 text-sm font-medium text-white hover:bg-opacity-90"
          >
            <UserPlus className="h-4 w-4" />
            <span>Ajouter</span>
          </button>
          
          <div className="relative group">
            <button
              className="inline-flex items-center gap-2 rounded-md border border-stroke py-2 px-4 text-sm font-medium hover:border-primary hover:text-primary dark:border-strokedark"
              onClick={() => setIsExportModalOpen(true)}
            >
              <Download className="h-4 w-4" />
              <span>Exporter</span>
            </button>
            
            {/* Menu déroulant d'exportation */}
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-boxdark rounded-md shadow-lg border border-stroke dark:border-strokedark hidden group-hover:block z-10">
              <div className="py-1">
                <button
                  onClick={handleExportExcel}
                  className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-meta-4"
                >
                  Export Excel rapide
                </button>
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-meta-4"
                >
                  Export Excel personnalisé
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-4 mb-6 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un étudiant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-auto rounded-md border border-stroke py-2 pl-10 pr-4 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-body-color" />
        </div>
        
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-md border border-stroke py-2 px-4 text-sm font-medium hover:border-primary hover:text-primary dark:border-strokedark">
            <Filter className="h-4 w-4" />
            <span>Filtrer</span>
          </button>
          
          <select 
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="rounded-md border border-stroke py-2 px-4 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
          >
            <option value="10">10 par page</option>
            <option value="20">20 par page</option>
            <option value="50">50 par page</option>
          </select>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th 
                className="py-4 px-4 font-medium text-black dark:text-white cursor-pointer"
                onClick={() => handleSort("nom")}
              >
                <div className="flex items-center gap-1">
                  Étudiant
                  {sortField === "nom" && (
                    <ArrowDown 
                      className={`h-3.5 w-3.5 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`} 
                    />
                  )}
                </div>
              </th>
              <th 
                className="py-4 px-4 font-medium text-black dark:text-white cursor-pointer"
                onClick={() => handleSort("matricule")}
              >
                <div className="flex items-center gap-1">
                  Matricule
                  {sortField === "matricule" && (
                    <ArrowDown 
                      className={`h-3.5 w-3.5 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`} 
                    />
                  )}
                </div>
              </th>
              <th 
                className="py-4 px-4 font-medium text-black dark:text-white cursor-pointer"
                onClick={() => handleSort("sexe")}
              >
                <div className="flex items-center gap-1">
                  Sexe
                  {sortField === "sexe" && (
                    <ArrowDown 
                      className={`h-3.5 w-3.5 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`} 
                    />
                  )}
                </div>
              </th>
              <th 
                className="py-4 px-4 font-medium text-black dark:text-white cursor-pointer"
                onClick={() => handleSort("dateNaissance")}
              >
                <div className="flex items-center gap-1">
                  Date de naissance
                  {sortField === "dateNaissance" && (
                    <ArrowDown 
                      className={`h-3.5 w-3.5 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`} 
                    />
                  )}
                </div>
              </th>
              <th
                className="py-4 px-4 font-medium text-black dark:text-white cursor-pointer"
                onClick={() => handleSort("hasContact")}
              >
                <div className="flex items-center gap-1">
                  ID
                  {sortField === "hasContact" && (
                    <ArrowDown 
                      className={`h-3.5 w-3.5 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`} 
                    />
                  )}
                </div>
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedEtudiants.length > 0 ? (
              paginatedEtudiants.map((etudiant) => (
                <tr key={etudiant._id}>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-300 dark:bg-meta-4 flex items-center justify-center text-sm font-medium text-black dark:text-white">
                        {etudiant.photo ? (
                          <Image 
                            src={etudiant.photo} 
                            alt={`${etudiant.nom} ${etudiant.prenom}`}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          generateInitials(etudiant.nom, etudiant.prenom)
                        )}
                      </div>
                      <div>
                        <h5 className="font-medium text-black dark:text-white">
                          {etudiant.nom} {etudiant.prenom}
                        </h5>
                        {etudiant.email && (
                          <p className="text-sm text-body-color dark:text-body-color-dark">
                            {etudiant.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">{etudiant.optId || "Non défini"}</p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {etudiant.sexe === 'M' || etudiant.sexe === 'masculin' ? "Masculin" : "Féminin"}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">{formatDate(etudiant.dateNaissance)}</p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <div className={`inline-flex rounded-full py-1 px-3 text-sm font-medium ${
                      etudiant.hasPaid 
                        ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300"
                        : etudiant.isPaying
                          ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300"
                    }`}>
                      {etudiant.matricule}
                    </div>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={async () => {
                          const response = await fetchEtudiant(etudiant._id);
                          console.log("Response:", response);
                          if (response && response?._id) {
                            window.location.href = `/etudiant/${etudiant._id}`;
                          }
                          
                        }}
                        className="hover:text-primary"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      
                      {onDelete && (
                        <button
                          onClick={() => onDelete(etudiant._id)}
                          className="hover:text-danger"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="border-b border-[#eee] py-5 px-4 text-center dark:border-strokedark">
                  {searchTerm ? "Aucun étudiant ne correspond à votre recherche" : "Aucun étudiant inscrit dans cette promotion"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 pb-4">
          <div className="text-sm text-body-color dark:text-body-color-dark">
            Affichage de {Math.min(startIndex + 1, filteredEtudiants.length)} à {Math.min(startIndex + itemsPerPage, filteredEtudiants.length)} sur {filteredEtudiants.length} étudiants
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded border border-stroke bg-gray hover:border-primary hover:bg-primary hover:text-white dark:border-strokedark dark:bg-meta-4 dark:hover:border-primary dark:hover:bg-primary disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`flex h-8 w-8 items-center justify-center rounded border ${
                      currentPage === pageNum
                        ? "border-primary bg-primary text-white"
                        : "border-stroke bg-gray hover:border-primary hover:bg-primary hover:text-white dark:border-strokedark dark:bg-meta-4"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded border border-stroke bg-gray hover:border-primary hover:bg-primary hover:text-white dark:border-strokedark dark:bg-meta-4 dark:hover:border-primary dark:hover:bg-primary disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      {/* Ajouter les modals */}
      <CreateEtudiantModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateEtudiant}
        promotionId={promotionId}
        anneeId= {anneeId} // Remplacer par l'ID d'année réel
        promotionNom={promotionInfo?.niveau}
        anneeNom={`${promotionInfo?.mention} ${promotionInfo?.orientation || ""}`}
      />
      
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleCustomExport}
      />
    </div>
  );
}


export default EtudiantsTable;