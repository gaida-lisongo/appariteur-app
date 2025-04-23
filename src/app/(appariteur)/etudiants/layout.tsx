"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { useEffect, useState, useRef } from "react";
import { UserPlus, FileUpIcon, Save, X, Download, Edit, Check, AlertTriangle, CheckCircle2, UploadCloud } from "lucide-react";
import useUserStore from "@/store/useUserStore";
import { Inscrits } from "@/types/api.types";
import { generateExcelTemplate } from "@/utils/excelExport";
import { parseCsvExcel } from "@/utils/csvParser";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import services from "@/services";

// Type pour les données importées des étudiants
type ImportedStudent = {
  id?: string; // ID temporaire pour l'interface
  nom: string;
  postNom: string;
  preNom?: string;
  sexe: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  adresse?: string;
  etudiantId?: string;
  email?: string;
  telephone?: string;
  optId?: string;
  section?: string;
  option?: string;
  pourcentage?: number;
  promotionId: string;
  anneeId: string;
  isSelected: boolean;
  hasError: boolean;
  errors: string[];
}

export default function EtudiantsLayout({ children }: { children: React.ReactNode }) {
  const [formType, setFormType] = useState<"new" | "import" | null>(null);
  const { etudiants, promotions, activeAppariteur, minervals, addMultipleEtudiants } = useUserStore();
  const [inscrits, setInscrits] = useState<Inscrits[] | []>([]);
  const [stats, setStats] = useState<{
    total: number;
    hommes: number;
    femmes: number;
  } | null>(null);

  const [selectedPromotion, setSelectedPromotion] = useState("");
  const [selectedAnnee, setSelectedAnnee] = useState("");
  const { Appariteur } = services
  // États pour l'importation
  const [importedStudents, setImportedStudents] = useState<ImportedStudent[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    error: number;
    total: number;
    progress?: number;
  } | null>(null);
  
  // Référence au champ de fichier pour le réinitialiser
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (etudiants) {
      etudiants.forEach((etudiant) => {
        const allInscrits = etudiant.inscrits.map((inscrit: any) => {
          return inscrit;
        });

        setInscrits(allInscrits);
      });
    }
  }, [etudiants]);

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

  const closeForm = () => {
    setFormType(null);
    setImportedStudents([]);
    setImportFile(null);
    setShowPreviewModal(false);
    // Réinitialiser le champ de fichier
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    const selectedPromo = promotions?.find((p) => p._id === selectedPromotion);

    generateExcelTemplate(
      selectedPromo || null,
      selectedAnnee || "2024-2025",
      {
        filename: `modele-import-etudiants${selectedPromo ? "-" + selectedPromo.niveau : ""}.xlsx`,
        sheetName: "Modèle d'importation",
      }
    );
  };

  // Gestion du fichier importé
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
    }
  };

  // Prévisualisation des données
  const handlePreviewImport = async () => {
    if (!importFile || !selectedPromotion || !selectedAnnee) return;
    
    setIsLoading(true);

    try {
      // Parser le fichier CSV/Excel avec ExcelJS
      const data = await parseCsvExcel(importFile);
      
      // Validation des données et mappage
      const validatedData: ImportedStudent[] = data.map((row, index) => {
        const errors: string[] = [];
        
        // Validation basique
        if (!row.nom) errors.push("Le nom est obligatoire");
        if (!row.postNom) errors.push("Le post-nom est obligatoire");
        if (!row.sexe || !["M", "F"].includes(row.sexe.toUpperCase())) errors.push("Le sexe doit être 'M' ou 'F'");
        
        // Standardisation du sexe
        if (row.sexe) {
          row.sexe = row.sexe.toUpperCase().trim();
        }
        
        // Si promotionId n'est pas défini, utiliser celui sélectionné
        if (!row.promotionId) {
          row.promotionId = selectedPromotion;
        }
        
        // Si anneeId n'est pas défini, utiliser celui sélectionné
        if (!row.anneeId) {
          row.anneeId = selectedAnnee;
        }
        
        return {
          ...row,
          id: `temp-${index}`,
          isSelected: errors.length === 0, // Sélectionner automatiquement les entrées sans erreur
          hasError: errors.length > 0,
          errors,
        };
      });
      
      setImportedStudents(validatedData);
      setShowPreviewModal(true);
    } catch (error) {
      console.error("Erreur lors de l'analyse du fichier:", error);
      alert("Erreur lors de l'analyse du fichier. Veuillez vérifier le format.");
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion des checkboxes pour sélectionner/désélectionner les étudiants
  const handleToggleSelectStudent = (id: string) => {
    setImportedStudents(students => 
      students.map(student => 
        student.id === id ? { ...student, isSelected: !student.isSelected } : student
      )
    );
  };

  // Sélectionner/désélectionner tous les étudiants
  const handleToggleSelectAll = (select: boolean) => {
    setImportedStudents(students => 
      students.map(student => ({ ...student, isSelected: select }))
    );
  };

  // Modifier un étudiant dans la liste d'importation
  const handleUpdateStudent = (id: string, data: Partial<ImportedStudent>) => {
    setImportedStudents(students => 
      students.map(student => 
        student.id === id ? { ...student, ...data } : student
      )
    );
  };

  // Supprimer un étudiant de la liste d'importation
  const handleRemoveStudent = (id: string) => {
    setImportedStudents(students => students.filter(student => student.id !== id));
  };

  // Fonction pour enregistrer les étudiants sélectionnés
  const handleSaveSelectedStudents = async () => {
    const selectedStudents = importedStudents.filter(student => student.isSelected);
    if (selectedStudents.length === 0) return;
    
    setIsUploading(true);
    
    // Résultats de l'importation
    const importResults = {
      success: 0,
      error: 0,
      total: selectedStudents.length,
      completed: 0,
      results: [] as {
        original: ImportedStudent,
        response?: any,
        success: boolean,
        error?: string,
        dbId?: string
      }[]
    };
    
    try {
      // Créer les étudiants un par un
      for (let i = 0; i < selectedStudents.length; i++) {
        const student = selectedStudents[i];
        
        // Préparer l'objet étudiant au format attendu par votre API
        const studentData = {
          infoPerso: {
            nom: student.nom,
            postNom: student.postNom,
            preNom: student.preNom || '',
            sexe: student.sexe,
            dateNaissance: student.dateNaissance ? new Date(student.dateNaissance) : Date.now(),
            lieuNaissance: student.lieuNaissance || '',
            adresse: student.adresse || '',
          },
          infoSec: {
            etudiantId: student.etudiantId || '',
            email: student.email || '',
            telephone: student.telephone || '',
            optId: student.optId || '',
          },
          infoScol: {
            section: student.section || '',
            option: student.option || '',
            pourcentage: student.pourcentage || 0,
          },
          infoAcad: [
            {
              promotionId: student.promotionId,
              anneeId: activeAppariteur?.anneeId._id || selectedAnnee,
            }
          ]
        };
        
        console.log("Données de l'étudiant à créer:", studentData);
        try {
          // Appeler l'API pour créer un étudiant
          const response = await Appariteur.createEtudiant({data: studentData});
          
          // Stocker le résultat de création
          importResults.results.push({
            original: student,
            response: response.data,
            success: true,
            dbId: response.data._id
          });
          
          importResults.success++;
        } catch (error: any) {
          // Gérer l'erreur pour cet étudiant
          importResults.results.push({
            original: student,
            success: false,
            error: error.message || "Erreur inconnue"
          });
          
          importResults.error++;
        }
        
        // Mettre à jour la progression
        importResults.completed = i + 1;
        
        // Mettre à jour l'état pour afficher la progression
        setImportResult({
          success: importResults.success,
          error: importResults.error,
          total: importResults.total,
          progress: Math.round((importResults.completed / importResults.total) * 100)
        });
      }
      
      // Exportation des résultats en Excel
      await exportImportResults(importResults);
      
      // Fermer la modal de prévisualisation
      setShowPreviewModal(false);
      
      // Réinitialiser les données d'importation
      setImportedStudents([]);
      setImportFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de l'ajout des étudiants:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Fonction pour exporter les résultats d'importation
  const exportImportResults = async (results: {
    success: number;
    error: number;
    total: number;
    completed: number;
    results: {
      original: ImportedStudent;
      response?: any;
      success: boolean;
      error?: string;
      dbId?: string;
    }[];
  }) => {
    try {
      // Créer un classeur Excel
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'INBTP App';
      workbook.lastModifiedBy = 'Système d\'Appariteur';
      workbook.created = new Date();
      workbook.modified = new Date();

      // Ajouter une feuille
      const worksheet = workbook.addWorksheet('Résultats importation');

      // En-tête 1: République
      const headerRow1 = worksheet.addRow(['République Démocratique du Congo']);
      headerRow1.height = 25;
      headerRow1.eachCell((cell) => {
        cell.font = { bold: true, size: 14 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      worksheet.mergeCells('A1:K1');

      // En-tête 2: Ministère
      const headerRow2 = worksheet.addRow(['Ministère de l\'enseignement Supérieur et Universitaire']);
      headerRow2.height = 22;
      headerRow2.eachCell((cell) => {
        cell.font = { bold: true, size: 12 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      worksheet.mergeCells('A2:K2');

      // En-tête 3: Institut
      const headerRow3 = worksheet.addRow(['Institut National du Bâtiment et des Travaux Publics']);
      headerRow3.height = 25;
      headerRow3.eachCell((cell) => {
        cell.font = { bold: true, size: 14 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      worksheet.mergeCells('A3:K3');

      // En-tête 4: INBTP/KINSHASA
      const headerRow4 = worksheet.addRow(['INBTP/KINSHASA']);
      headerRow4.height = 30;
      headerRow4.eachCell((cell) => {
        cell.font = { bold: true, size: 16 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      worksheet.mergeCells('A4:K4');

      // Ajouter un espace
      worksheet.addRow([]);

      // Titre du rapport
      const titleRow = worksheet.addRow(['RAPPORT D\'IMPORTATION DES ÉTUDIANTS']);
      titleRow.height = 28;
      titleRow.eachCell((cell) => {
        cell.font = { bold: true, size: 16, underline: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      worksheet.mergeCells('A6:K6');

      // Ajouter un espace
      worksheet.addRow([]);

      // Date d'importation
      const dateRow = worksheet.addRow([`Date d'importation: ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}`]);
      dateRow.height = 22;
      dateRow.eachCell((cell) => {
        cell.font = { bold: true, size: 12 };
      });
      worksheet.mergeCells('A8:K8');

      // Statistiques d'importation
      worksheet.addRow([`Total traité: ${results.total} étudiants`]);
      worksheet.mergeCells('A9:K9');

      const successRow = worksheet.addRow([`Succès: ${results.success} étudiants`]);
      successRow.eachCell(cell => {
        cell.font = { color: { argb: '006100' } }; // Vert foncé
      });
      worksheet.mergeCells('A10:K10');

      const errorRow = worksheet.addRow([`Échecs: ${results.error} étudiants`]);
      if (results.error > 0) {
        errorRow.eachCell(cell => {
          cell.font = { color: { argb: 'C00000' } }; // Rouge
        });
      }
      worksheet.mergeCells('A11:K11');

      // Ajouter un espace
      worksheet.addRow([]);

      // En-têtes du tableau de résultats
      const headerRow = worksheet.addRow([
        'Statut', 'ID Base de données', 'Nom', 'Post-nom', 'Prénom', 'Sexe', 
        'Email', 'Téléphone', 'Détails/Erreur'
      ]);

      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '4472C4' } // Bleu
        };
        cell.font = {
          bold: true,
          color: { argb: 'FFFFFF' } // Blanc
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Ajouter les données des résultats
      results.results.forEach((result) => {
        const row = worksheet.addRow([
          result.success ? 'Succès' : 'Échec',
          result.dbId || '-',
          result.original.nom,
          result.original.postNom,
          result.original.preNom || '',
          result.original.sexe,
          result.original.email || '',
          result.original.telephone || '',
          result.error || '-'
        ]);

        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });

        // Colorer les lignes selon le statut
        if (result.success) {
          row.getCell(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'C6EFCE' } // Vert clair
          };
        } else {
          row.getCell(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFCCCC' } // Rouge clair
          };
        }
      });

      // Ajuster la largeur des colonnes
      worksheet.columns.forEach(column => {
        column.width = 18;
      });

      // Convertir le classeur en buffer
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Créer un Blob à partir du buffer
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Enregistrer le fichier
      saveAs(blob, `rapport-importation-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error("Erreur lors de l'exportation des résultats:", error);
    }
  };

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
        <div className="col-span-12 lg:col-span-9">{children}</div>

        <div className="col-span-12 lg:col-span-3">
          {!formType && (
            <div className="mb-6 flex flex-col gap-4">
              <button
                onClick={() => setFormType("import")}
                className="flex items-center justify-center gap-2 rounded-lg border border-primary py-3 px-4 font-medium text-primary hover:bg-primary hover:text-white"
              >
                <FileUpIcon size={18} />
                Importer un fichier Excel/CSV
              </button>
            </div>
          )}

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
                  <select
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    value={selectedPromotion}
                    onChange={(e) => setSelectedPromotion(e.target.value)}
                  >
                    <option value="">Sélectionnez une promotion</option>
                    {promotions &&
                      promotions.map((promo) => (
                        <option key={promo._id} value={promo._id}>
                          {promo.niveau} {promo.mention}{" "}
                          {promo.orientation ? `(${promo.orientation})` : ""}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    Année académique <span className="text-meta-1">*</span>
                  </label>
                  <select
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    value={selectedAnnee}
                    onChange={(e) => setSelectedAnnee(e.target.value)}
                  >
                    <option value="">Sélectionnez une année académique</option>
                  {
                    activeAppariteur?.anneeId && (
                      <option value={activeAppariteur.anneeId._id}>
                        {activeAppariteur.anneeId.slogan}
                      </option>
                    )
                  }
                  </select>
                </div>

                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    Fichier Excel/CSV <span className="text-meta-1">*</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent font-medium outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-stroke file:bg-whiter file:py-3 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
                  />
                  <p className="mt-2 text-xs text-meta-1">
                    Format accepté: Excel (.xlsx, .xls) ou CSV (.csv, séparé par ;). Taille max: 5 Mo
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-2 px-3 font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-70"
                    onClick={handlePreviewImport}
                    disabled={isLoading || !importFile || !selectedPromotion || !selectedAnnee}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Chargement...</span>
                      </>
                    ) : (
                      <>
                        <FileUpIcon size={16} />
                        <span>Prévisualiser les données</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="inline-flex items-center justify-center gap-2.5 rounded-md border border-primary py-2 px-3 font-medium text-primary hover:bg-primary hover:text-white"
                  >
                    <Download size={16} />
                    Télécharger le modèle Excel
                  </button>
                </div>
                
                {/* Message de résultat */}
                {importResult && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    importResult.success > 0 && importResult.error === 0 
                      ? "bg-success/10 text-success" 
                      : importResult.error > 0 
                        ? "bg-danger/10 text-danger"
                        : "bg-warning/10 text-warning"
                  }`}>
                    <div className="flex items-center gap-2">
                      {importResult.success > 0 && importResult.error === 0 ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <AlertTriangle size={20} />
                      )}
                      <div>
                        <p className="font-medium">
                          {importResult.success > 0 && importResult.error === 0 
                            ? "Importation réussie!" 
                            : "Importation avec des erreurs"}
                        </p>
                        <p className="text-sm">
                          {importResult.success} sur {importResult.total} étudiants importés.
                          {importResult.error > 0 && ` ${importResult.error} erreurs.`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}

          {!formType && (
            <>
              <div className="mb-6 rounded-sm border border-stroke bg-white px-5 pb-5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <h3 className="text-xl font-semibold text-dark dark:text-white mb-4 border-b border-stroke pb-3 dark:border-strokedark">
                  Statistiques
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-body-color dark:text-body-color-dark">
                      Total étudiants:
                    </span>
                    <span className="font-semibold text-dark dark:text-white">
                      {stats?.total}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-color dark:text-body-color-dark">Hommes:</span>
                    <span className="font-semibold text-dark dark:text-white">
                      {stats?.hommes} (
                      {stats?.total ? ((stats.hommes * 100) / stats.total).toFixed(2) : 0}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-color dark:text-body-color-dark">Femmes:</span>
                    <span className="font-semibold text-dark dark:text-white">
                      {stats?.femmes} (
                      {stats?.total ? ((stats.femmes * 100) / stats.total).toFixed(2) : 0}%)
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de prévisualisation pour le prétraitement */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto py-10">
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-stroke dark:border-strokedark">
              <h3 className="text-xl font-semibold text-black dark:text-white">
                Prétraitement des données importées
              </h3>
              <button 
                onClick={() => setShowPreviewModal(false)}
                className="text-body-color dark:text-body-color-dark hover:text-danger"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 border-b border-stroke dark:border-strokedark">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-body-color dark:text-body-color-dark">
                    <span className="font-medium text-black dark:text-white">{importedStudents.length}</span> étudiants trouvés dans le fichier
                  </p>
                  <p className="text-sm text-body-color dark:text-body-color-dark">
                    <span className="font-medium text-black dark:text-white">
                      {importedStudents.filter(s => s.isSelected).length}
                    </span> étudiants sélectionnés pour importation
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleToggleSelectAll(true)}
                    className="inline-flex items-center gap-1 text-xs py-1 px-2 rounded-md border border-stroke bg-white dark:border-strokedark dark:bg-meta-4 hover:border-primary hover:text-primary"
                  >
                    <Check size={14} />
                    Tout sélectionner
                  </button>
                  <button 
                    onClick={() => handleToggleSelectAll(false)}
                    className="inline-flex items-center gap-1 text-xs py-1 px-2 rounded-md border border-stroke bg-white dark:border-strokedark dark:bg-meta-4 hover:border-primary hover:text-primary"
                  >
                    <X size={14} />
                    Tout désélectionner
                  </button>
                </div>
              </div>
            </div>
            
            {/* Tableau des étudiants */}
            <div className="overflow-auto flex-1 p-2">
              <table className="w-full min-w-max">
                <thead className="sticky top-0 bg-white dark:bg-boxdark">
                  <tr className="text-left">
                    <th className="p-2 border-b border-stroke dark:border-strokedark">Sélection</th>
                    <th className="p-2 border-b border-stroke dark:border-strokedark">Nom</th>
                    <th className="p-2 border-b border-stroke dark:border-strokedark">Post-nom</th>
                    <th className="p-2 border-b border-stroke dark:border-strokedark">Prénom</th>
                    <th className="p-2 border-b border-stroke dark:border-strokedark">Sexe</th>
                    <th className="p-2 border-b border-stroke dark:border-strokedark">Date naiss.</th>
                    <th className="p-2 border-b border-stroke dark:border-strokedark">Email</th>
                    <th className="p-2 border-b border-stroke dark:border-strokedark">Téléphone</th>
                    <th className="p-2 border-b border-stroke dark:border-strokedark">ID</th>
                    <th className="p-2 border-b border-stroke dark:border-strokedark">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {importedStudents.map(student => (
                    <tr 
                      key={student.id} 
                      className={`
                        ${student.hasError ? 'bg-danger/5' : student.isSelected ? 'bg-success/5' : ''} 
                        hover:bg-gray-50 dark:hover:bg-meta-4
                      `}
                    >
                      <td className="p-2 border-b border-stroke dark:border-strokedark">
                        <input 
                          type="checkbox" 
                          checked={student.isSelected} 
                          onChange={() => handleToggleSelectStudent(student.id || '')}
                          className="rounded border-stroke text-primary focus:ring-primary dark:border-strokedark"
                        />
                      </td>
                      <td className="p-2 border-b border-stroke dark:border-strokedark">{student.nom}</td>
                      <td className="p-2 border-b border-stroke dark:border-strokedark">{student.postNom}</td>
                      <td className="p-2 border-b border-stroke dark:border-strokedark">{student.preNom}</td>
                      <td className="p-2 border-b border-stroke dark:border-strokedark">{student.sexe}</td>
                      <td className="p-2 border-b border-stroke dark:border-strokedark">
                        {student.dateNaissance}
                      </td>
                      <td className="p-2 border-b border-stroke dark:border-strokedark">{student.email}</td>
                      <td className="p-2 border-b border-stroke dark:border-strokedark">{student.telephone}</td>
                      <td className="p-2 border-b border-stroke dark:border-strokedark">{student.etudiantId}</td>
                      <td className="p-2 border-b border-stroke dark:border-strokedark">
                        <div className="flex items-center gap-2">
                          {/* Bouton d'édition - implémentation simplifiée */}
                          <button 
                            title="Éditer" 
                            className="text-primary hover:text-primary-dark"
                            onClick={() => {
                              // Implémentez ici l'édition en ligne ou dans une modal
                              alert(`Édition de l'étudiant ${student.nom} ${student.postNom}`);
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          
                          {/* Bouton de suppression */}
                          <button 
                            title="Supprimer" 
                            className="text-danger hover:text-danger-dark"
                            onClick={() => handleRemoveStudent(student.id || '')}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {importedStudents.length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center p-4 text-body-color dark:text-body-color-dark">
                        Aucune donnée à afficher
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Messages d'erreurs éventuelles */}
            {importedStudents.some(s => s.hasError) && (
              <div className="px-4 py-2 bg-danger/10 text-danger text-sm">
                <p>Des erreurs ont été détectées dans certaines lignes. Veuillez les corriger avant importation.</p>
              </div>
            )}
            
            {/* Pied de la modal avec les boutons d'action */}
            <div className="flex justify-end p-4 border-t border-stroke dark:border-strokedark">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="mr-2 inline-flex items-center gap-2 rounded-md border border-stroke py-2 px-4 text-sm font-medium hover:border-primary hover:text-primary dark:border-strokedark"
              >
                Annuler
              </button>
              
              <button
                onClick={handleSaveSelectedStudents}
                disabled={isUploading || importedStudents.filter(s => s.isSelected).length === 0}
                className="inline-flex items-center gap-2 rounded-md bg-primary py-2 px-4 text-sm font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-70"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Importation...
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    Importer {importedStudents.filter(s => s.isSelected).length} étudiant(s)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
