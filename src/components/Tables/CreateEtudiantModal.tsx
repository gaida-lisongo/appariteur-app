"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Save, User, BookOpen, Briefcase, FileText } from "lucide-react";
import services from "@/services";
import useUserStore from "@/store/useUserStore";

type CreateEtudiantModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (etudiantData: EtudiantFormData) => Promise<void>;
  promotionId: string;
  anneeId: string;
  promotionNom?: string;
  anneeNom?: string;
};

// Structure complète des données du formulaire
type EtudiantFormData = {
  infoPerso: {
    profile?: string;
    nom: string;
    postNom: string;
    preNom?: string;
    sexe: "M" | "F";
    dateNaissance?: string;
    lieuNaissance?: string;
    adresse?: string;
  };
  infoSec: {
    etudiantId?: string;
    email?: string;
    telephone?: string;
    optId?: string;
    mdp?: string;
  };
  infoScol: {
    section?: string;
    option?: string;
    pourcentage?: number;
  };
  infoAcad: {
    promotionId: string;
    anneeId: string;
    actifs?: {
      // Données supplémentaires si nécessaire
    };
  };
};

const CreateEtudiantModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  promotionId,
  anneeId,
  promotionNom = "",
  anneeNom = "",
}: CreateEtudiantModalProps) => {
  // États pour le contrôle de l'étape courante
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { Appariteur } = services;
  
  // État pour les données du formulaire
  const [formData, setFormData] = useState<EtudiantFormData>({
    infoPerso: {
      nom: "",
      postNom: "",
      preNom: "",
      sexe: "M",
    },
    infoSec: {},
    infoScol: {},
    infoAcad: {
      promotionId,
      anneeId,
    }
  });
  
  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setIsSubmitting(false);
      setError(null);
      setFormData({
        infoPerso: {
          nom: "",
          postNom: "",
          preNom: "",
          sexe: "M",
        },
        infoSec: {},
        infoScol: {},
        infoAcad: {
          promotionId,
          anneeId,
        }
      });
    }
  }, [isOpen, promotionId, anneeId]);
  
  // Gérer les changements dans les champs
  const handleChange = (
    section: "infoPerso" | "infoSec" | "infoScol" | "infoAcad",
    field: string,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };
  
  // Validation de l'étape courante
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Infos personnelles
        if (!formData.infoPerso.nom || !formData.infoPerso.postNom) {
          setError("Le nom et le post-nom sont obligatoires");
          return false;
        }
        break;
        
      case 2: // Infos secondaires
        if (
          formData.infoSec.email && 
          !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,7})+$/.test(formData.infoSec.email)
        ) {
          setError("Format d'email invalide");
          return false;
        }
        break;
        
      case 3: // Infos scolaires
        if (
          formData.infoScol.pourcentage !== undefined && 
          (formData.infoScol.pourcentage < 0 || formData.infoScol.pourcentage > 100)
        ) {
          setError("Le pourcentage doit être entre 0 et 100");
          return false;
        }
        break;
    }
    
    setError(null);
    return true;
  };
  
  // Navigation entre les étapes
  const goToNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };
  
  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError(null);
  };
  
  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log("Données du formulaire:", formData);
      // Envoi des données au serveur
      const response = await Appariteur.createEtudiant({ data: formData });
      if (!response.success) {
        throw new Error(response.message || "Erreur lors de la création de l'étudiant");
      }

      // Appel de la fonction de sauvegarde passée en props
      console.log("Données de l'étudiant:", response.data);

      await onSave(response.data);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue lors de la création de l'étudiant");
      }
      setIsSubmitting(false);
    }
  };
  
  // Rendu conditionnel des étapes
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informations personnelles
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nom" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nom"
                  value={formData.infoPerso.nom}
                  onChange={(e) => handleChange("infoPerso", "nom", e.target.value.toUpperCase())}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="postNom" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Post-nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="postNom"
                  value={formData.infoPerso.postNom}
                  onChange={(e) => handleChange("infoPerso", "postNom", e.target.value.toUpperCase())}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="preNom" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Prénom
                </label>
                <input
                  type="text"
                  id="preNom"
                  value={formData.infoPerso.preNom || ""}
                  onChange={(e) => handleChange("infoPerso", "preNom", e.target.value.toUpperCase())}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              
              <div>
                <label htmlFor="sexe" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Sexe <span className="text-red-500">*</span>
                </label>
                <select
                  id="sexe"
                  value={formData.infoPerso.sexe}
                  onChange={(e) => handleChange("infoPerso", "sexe", e.target.value as "M" | "F")}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                >
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="dateNaissance" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Date de naissance
                </label>
                <input
                  type="date"
                  id="dateNaissance"
                  value={formData.infoPerso.dateNaissance || ""}
                  onChange={(e) => handleChange("infoPerso", "dateNaissance", e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              
              <div>
                <label htmlFor="lieuNaissance" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Lieu de naissance
                </label>
                <input
                  type="text"
                  id="lieuNaissance"
                  value={formData.infoPerso.lieuNaissance || ""}
                  onChange={(e) => handleChange("infoPerso", "lieuNaissance", e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="adresse" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                Adresse
              </label>
              <textarea
                id="adresse"
                value={formData.infoPerso.adresse || ""}
                onChange={(e) => handleChange("infoPerso", "adresse", e.target.value)}
                rows={2}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Informations secondaires
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="etudiantId" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  ID Étudiant
                </label>
                <input
                  type="text"
                  id="etudiantId"
                  value={formData.infoSec.etudiantId || ""}
                  onChange={(e) => handleChange("infoSec", "etudiantId", e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.infoSec.email || ""}
                  onChange={(e) => handleChange("infoSec", "email", e.target.value.toLowerCase())}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              
              <div>
                <label htmlFor="telephone" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="telephone"
                  value={formData.infoSec.telephone || ""}
                  onChange={(e) => handleChange("infoSec", "telephone", e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              
              <div>
                <label htmlFor="optId" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  ID Option
                </label>
                <input
                  type="text"
                  id="optId"
                  value={formData.infoSec.optId || ""}
                  onChange={(e) => handleChange("infoSec", "optId", e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              
              <div>
                <label htmlFor="mdp" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="mdp"
                  value={formData.infoSec.mdp || ""}
                  onChange={(e) => handleChange("infoSec", "mdp", e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Informations scolaires
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="section" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Section
                </label>
                <input
                  type="text"
                  id="section"
                  value={formData.infoScol.section || ""}
                  onChange={(e) => handleChange("infoScol", "section", e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              
              <div>
                <label htmlFor="option" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Option
                </label>
                <input
                  type="text"
                  id="option"
                  value={formData.infoScol.option || ""}
                  onChange={(e) => handleChange("infoScol", "option", e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              
              <div>
                <label htmlFor="pourcentage" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Pourcentage
                </label>
                <input
                  type="number"
                  id="pourcentage"
                  min="0"
                  max="100"
                  value={formData.infoScol.pourcentage || ""}
                  onChange={(e) => handleChange("infoScol", "pourcentage", Number(e.target.value))}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-meta-4 p-4 rounded-md mt-2">
              <h4 className="font-medium text-black dark:text-white mb-2">
                Informations académiques
              </h4>
              <p className="text-body-color dark:text-body-color-dark">
                Niveau: <span className="font-medium text-black dark:text-white">{promotionNom}</span>
              </p>
              <p className="text-body-color dark:text-body-color-dark">
               Filière: <span className="font-medium text-black dark:text-white">{anneeNom}</span>
              </p>
            </div>
          </div>
        );
        
      case 4: // Résumé
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Résumé des informations
            </h3>
            
            <div className="space-y-5">
              <div className="bg-gray-50 dark:bg-meta-4 p-4 rounded-md">
                <h4 className="font-medium text-black dark:text-white mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Informations personnelles
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <p className="text-sm">
                    <span className="text-body-color dark:text-body-color-dark">Nom:</span>{" "}
                    <span className="font-medium text-black dark:text-white">{formData.infoPerso.nom}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-body-color dark:text-body-color-dark">Post-nom:</span>{" "}
                    <span className="font-medium text-black dark:text-white">{formData.infoPerso.postNom}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-body-color dark:text-body-color-dark">Prénom:</span>{" "}
                    <span className="font-medium text-black dark:text-white">{formData.infoPerso.preNom || "-"}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-body-color dark:text-body-color-dark">Sexe:</span>{" "}
                    <span className="font-medium text-black dark:text-white">
                      {formData.infoPerso.sexe === "M" ? "Masculin" : "Féminin"}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="text-body-color dark:text-body-color-dark">Date de naissance:</span>{" "}
                    <span className="font-medium text-black dark:text-white">
                      {formData.infoPerso.dateNaissance ? new Date(formData.infoPerso.dateNaissance).toLocaleDateString() : "-"}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="text-body-color dark:text-body-color-dark">Lieu de naissance:</span>{" "}
                    <span className="font-medium text-black dark:text-white">{formData.infoPerso.lieuNaissance || "-"}</span>
                  </p>
                  <p className="text-sm col-span-2">
                    <span className="text-body-color dark:text-body-color-dark">Adresse:</span>{" "}
                    <span className="font-medium text-black dark:text-white">{formData.infoPerso.adresse || "-"}</span>
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-meta-4 p-4 rounded-md">
                <h4 className="font-medium text-black dark:text-white mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Informations secondaires
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <p className="text-sm">
                    <span className="text-body-color dark:text-body-color-dark">ID Étudiant:</span>{" "}
                    <span className="font-medium text-black dark:text-white">{formData.infoSec.etudiantId || "-"}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-body-color dark:text-body-color-dark">Email:</span>{" "}
                    <span className="font-medium text-black dark:text-white">{formData.infoSec.email || "-"}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-body-color dark:text-body-color-dark">Téléphone:</span>{" "}
                    <span className="font-medium text-black dark:text-white">{formData.infoSec.telephone || "-"}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-body-color dark:text-body-color-dark">ID Option:</span>{" "}
                    <span className="font-medium text-black dark:text-white">{formData.infoSec.optId || "-"}</span>
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-meta-4 p-4 rounded-md">
                <h4 className="font-medium text-black dark:text-white mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Informations scolaires et académiques
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <p className="text-sm">
                    <span className="text-body-color dark:text-body-color-dark">Section:</span>{" "}
                    <span className="font-medium text-black dark:text-white">{formData.infoScol.section || "-"}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-body-color dark:text-body-color-dark">Option:</span>{" "}
                    <span className="font-medium text-black dark:text-white">{formData.infoScol.option || "-"}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-body-color dark:text-body-color-dark">Pourcentage:</span>{" "}
                    <span className="font-medium text-black dark:text-white">
                      {formData.infoScol.pourcentage !== undefined ? `${formData.infoScol.pourcentage}%` : "-"}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="text-body-color dark:text-body-color-dark">Promotion:</span>{" "}
                    <span className="font-medium text-black dark:text-white">{promotionNom}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-body-color dark:text-body-color-dark">Année académique:</span>{" "}
                    <span className="font-medium text-black dark:text-white">{anneeNom}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50 p-4">
      <div className="relative bg-white dark:bg-boxdark rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white dark:bg-boxdark border-b border-stroke dark:border-strokedark p-5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-black dark:text-white">
            {currentStep < 4 ? "Ajout d'un nouvel étudiant" : "Vérification des informations"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5 pt-0">
          {/* Indicateur de progression */}
          <div className="my-6">
            <div className="flex items-center justify-between relative">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`z-10 flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= step
                      ? "bg-primary text-white"
                      : "bg-gray-200 dark:bg-meta-4 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {step}
                </div>
              ))}
              
              {/* Ligne de progression */}
              <div className="absolute top-5 h-0.5 w-full bg-gray-200 dark:bg-meta-4 -z-1"></div>
              <div
                className="absolute top-5 h-0.5 bg-primary -z-1"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between mt-2">
              <span className="text-xs font-medium text-primary">Infos personnelles</span>
              <span className={`text-xs font-medium ${currentStep >= 2 ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}>
                Infos secondaires
              </span>
              <span className={`text-xs font-medium ${currentStep >= 3 ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}>
                Infos scolaires
              </span>
              <span className={`text-xs font-medium ${currentStep >= 4 ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}>
                Résumé
              </span>
            </div>
          </div>
          
          {/* Message d'erreur */}
          {error && (
            <div className="mb-5 p-3 rounded-md bg-danger/20 text-sm text-danger flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}
          
          {/* Contenu de l'étape courante */}
          <form onSubmit={currentStep === 4 ? handleSubmit : (e) => e.preventDefault()}>
            <div className="min-h-[20rem]">
              {renderStepContent()}
            </div>
            
            {/* Boutons de navigation */}
            <div className="flex justify-between mt-8 pt-5 border-t border-stroke dark:border-strokedark">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  className="flex items-center gap-1 rounded-md border border-stroke py-2 px-4 text-sm font-medium text-black hover:border-primary hover:text-primary dark:border-strokedark dark:text-white"
                >
                  <ChevronLeft size={16} />
                  Précédent
                </button>
              ) : (
                <div></div>
              )}
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="flex items-center gap-1 rounded-md bg-primary py-2 px-4 text-sm font-medium text-white hover:bg-opacity-90"
                >
                  Suivant
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1 rounded-md bg-primary py-2 px-4 text-sm font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-70"
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></span>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Enregistrer
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEtudiantModal;