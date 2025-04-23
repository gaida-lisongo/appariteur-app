"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import useUserStore from "@/store/useUserStore";
import { 
  User, 
  Briefcase, 
  BookOpen, 
  Save, 
  Loader2, 
  Calendar,
  GraduationCap,
  PlusCircle,
  Trash2,
  School
} from "lucide-react";
import services from "@/services";
import { set } from "date-fns";
import { id } from "date-fns/locale";

export default function EtudiantPage() {
  const { slug } = useParams();
  const { etudiant, isLoading, setEtudiant, promotions } = useUserStore();
  const { Appariteur } = services;
  
  // État pour gérer les onglets
  const [activeTab, setActiveTab] = useState("personal");
  
  // État pour le message de confirmation/erreur
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // État pour indiquer si une opération est en cours
  const [isSaving, setIsSaving] = useState(false);
  
  // État pour la nouvelle information académique
  const [newAcadInfo, setNewAcadInfo] = useState({
    promotionId: "",
    anneeId: "",
    anneeNom: "",
    promotionNom: "",
    actifs: {}
  });
  
  // État pour la liste des promotions et années disponibles
  const [annees, setAnnees] = useState<Array<{id: string, nom: string}>>([]);
  const [loading, setLoading] = useState(false);
  // États pour les formulaires existants...
  const [personalInfo, setPersonalInfo] = useState({
    nom: etudiant?.infoPerso.nom || "",
    postNom: etudiant?.infoPerso.postNom || "",
    preNom: etudiant?.infoPerso.preNom || "",
    sexe: etudiant?.infoPerso.sexe || "M",
    dateNaissance: etudiant?.infoPerso.dateNaissance || "",
    lieuNaissance: etudiant?.infoPerso.lieuNaissance || "",
    adresse: etudiant?.infoPerso.adresse || "",
  });

  // Autres états pour formulaires...
  const [contactInfo, setContactInfo] = useState({
    etudiantId: etudiant?.infoSec.etudiantId || "",
    email: etudiant?.infoSec.email || "",
    telephone: etudiant?.infoSec.telephone || "",
    optId: etudiant?.infoSec.optId || "",
  });

  const [schoolInfo, setSchoolInfo] = useState({
    section: etudiant?.infoScol.section || "",
    option: etudiant?.infoScol.option || "",
    pourcentage: etudiant?.infoScol.pourcentage?.toString() || "",
  });

  // Charger les promotions et années disponibles au chargement du composant
  useEffect(() => {
    
    // Simulation de chargement des années académiques
    const fetchAnnees = async () => {
      try {
        setLoading(true);
        const response = await Appariteur.getAllAnnees();

        console.log("Réponse des années académiques:", response);
        
        if(response.success) {
            const { data } = response;
            const allAnnees = data.map((annee: any) => ({
                    id: annee._id,
                    nom: annee.slogan,
                })
            );
            setAnnees(allAnnees);
        } else {
            console.error("Erreur lors de la récupération des années académiques:", response.message);
            throw new Error(response.message);
        }

        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des années académiques:", error);
      }
    };
    console.log("Infos Acad :", etudiant?.infoAcad);
    fetchAnnees();
  }, []);

  // Mettre à jour les états quand etudiant change
  useEffect(() => {
    if (etudiant) {
      setPersonalInfo({
        nom: etudiant.infoPerso.nom || "",
        postNom: etudiant.infoPerso.postNom || "",
        preNom: etudiant.infoPerso.preNom || "",
        sexe: etudiant.infoPerso.sexe || "M",
        dateNaissance: etudiant.infoPerso.dateNaissance || "",
        lieuNaissance: etudiant.infoPerso.lieuNaissance || "",
        adresse: etudiant.infoPerso.adresse || "",
      });

      setContactInfo({
        etudiantId: etudiant.infoSec.etudiantId || "",
        email: etudiant.infoSec.email || "",
        telephone: etudiant.infoSec.telephone || "",
        optId: etudiant.infoSec.optId || "",
      });

      setSchoolInfo({
        section: etudiant.infoScol.section || "",
        option: etudiant.infoScol.option || "",
        pourcentage: etudiant.infoScol.pourcentage?.toString() || "",
      });
    }
  }, [etudiant]);

  // Gérer les changements dans les champs des formulaires existants...
  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSchoolChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSchoolInfo(prev => ({ ...prev, [name]: value }));
  };

  // Gérer les changements dans les champs du nouvel élément académique
  const handleNewAcadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Si on change la promotion, trouver son nom pour l'affichage
    if (name === 'promotionId') {
      const selectedPromotion = promotions.find(p => p.id === value);
      setNewAcadInfo(prev => ({ 
        ...prev, 
        [name]: value,
        promotionNom: selectedPromotion?.nom || ""
      }));
    } 
    // Si on change l'année académique, trouver son nom pour l'affichage
    else if (name === 'anneeId') {
      const selectedAnnee = annees.find(a => a.id === value);
      setNewAcadInfo(prev => ({ 
        ...prev, 
        [name]: value,
        anneeNom: selectedAnnee?.nom || ""
      }));
    }
    // Pour tout autre champ
    else {
      setNewAcadInfo(prev => ({ ...prev, [name]: value }));
    }
  };

  // Ajouter une nouvelle information académique
  const handleAddAcadInfo = () => {
    if (!etudiant || !newAcadInfo.promotionId || !newAcadInfo.anneeId) {
      setMessage({
        type: 'error',
        text: 'Veuillez sélectionner une promotion et une année académique'
      });
      return;
    }

    // Vérifier si cette combinaison promotion/année existe déjà
    const exists = etudiant.infoAcad.some(
      info => info.promotionId === newAcadInfo.promotionId && info.anneeId === newAcadInfo.anneeId
    );

    if (exists) {
      setMessage({
        type: 'error',
        text: 'Cette combinaison promotion/année existe déjà pour cet étudiant'
      });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      // Simuler un appel API
      // En production, vous feriez un appel API réel ici
      setTimeout(() => {
        // Créer une nouvelle entrée académique
        const newAcadEntry = {
          promotionId: newAcadInfo.promotionId,
          anneeId: newAcadInfo.anneeId,
          actifs: {}
        };
        
        // Mettre à jour l'étudiant avec la nouvelle information académique
        const updatedEtudiant = {
          ...etudiant,
          infoAcad: [...etudiant.infoAcad, newAcadEntry]
        };
        
        // Mettre à jour le store
        setEtudiant(updatedEtudiant);
        
        // Réinitialiser le formulaire
        setNewAcadInfo({
          promotionId: "",
          anneeId: "",
          anneeNom: "",
          promotionNom: "",
          actifs: {}
        });
        
        setMessage({
          type: 'success',
          text: 'Informations académiques ajoutées avec succès'
        });
        
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erreur lors de l\'ajout des informations académiques'
      });
      setIsSaving(false);
    }
  };

  // Supprimer une information académique
  const handleDeleteAcadInfo = (index: number) => {
    if (!etudiant) return;

    setIsSaving(true);
    setMessage(null);

    try {
      // Simuler un appel API
      // En production, vous feriez un appel API réel ici
      setTimeout(() => {
        // Créer une copie du tableau infoAcad sans l'élément à supprimer
        const updatedInfoAcad = [...etudiant.infoAcad];
        updatedInfoAcad.splice(index, 1);
        
        // Mettre à jour l'étudiant
        const updatedEtudiant = {
          ...etudiant,
          infoAcad: updatedInfoAcad
        };
        
        // Mettre à jour le store
        setEtudiant(updatedEtudiant);
        
        setMessage({
          type: 'success',
          text: 'Informations académiques supprimées avec succès'
        });
        
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erreur lors de la suppression des informations académiques'
      });
      setIsSaving(false);
    }
  };

  // Gestionnaires de soumission des formulaires existants...
  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!etudiant) return;

    setIsSaving(true);
    setMessage(null);

    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mettre à jour le store
      const updatedEtudiant = {
        ...etudiant,
        infoPerso: {
          ...etudiant.infoPerso,
          ...personalInfo
        }
      };
      
      setEtudiant(updatedEtudiant);

      setMessage({
        type: 'success',
        text: 'Informations personnelles mises à jour avec succès'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erreur lors de la mise à jour des informations'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!etudiant) return;

    setIsSaving(true);
    setMessage(null);

    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mettre à jour le store
      const updatedEtudiant = {
        ...etudiant,
        infoSec: {
          ...etudiant.infoSec,
          ...contactInfo
        }
      };
      
      setEtudiant(updatedEtudiant);

      setMessage({
        type: 'success',
        text: 'Informations de contact mises à jour avec succès'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erreur lors de la mise à jour des informations'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!etudiant) return;

    setIsSaving(true);
    setMessage(null);

    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mettre à jour le store
      const updatedEtudiant = {
        ...etudiant,
        infoScol: {
          ...etudiant.infoScol,
          section: schoolInfo.section,
          option: schoolInfo.option,
          pourcentage: schoolInfo.pourcentage ? Number(schoolInfo.pourcentage) : undefined,
        }
      };
      
      setEtudiant(updatedEtudiant);

      setMessage({
        type: 'success',
        text: 'Informations scolaires mises à jour avec succès'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erreur lors de la mise à jour des informations'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Affichage conditionnel pour chargement et erreurs...
  if (isLoading || loading) {
    return (
      <div className="p-5 flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!etudiant) {
    return (
      <div className="bg-danger/10 text-danger p-4 rounded-md">
        <h3 className="font-semibold mb-2">Erreur</h3>
        <p>Impossible de charger les informations de l&apos;étudiant.</p>
      </div>
    );
  }

  // Format d'affichage pour les données académiques
  const getAcadInfoDisplay = (infoAcad: any, index: number) => {
    // Trouver les objets correspondants dans les listes de promotions et années
    const promotion = promotions.find(p => p.id === infoAcad.promotionId);
    const annee = annees.find(a => a.id === infoAcad.anneeId);
    
    // Extraire le nom comme une chaîne de caractères, ou utiliser l'ID si l'objet n'est pas trouvé
    const promotionNom = promotion ? promotion.nom : infoAcad.promotionId;
    const anneeNom = annee ? annee.nom : infoAcad.anneeId;
    
    return (
      <div key={index} className="flex justify-between items-center bg-gray-50 dark:bg-meta-4 p-3 rounded-md mb-2">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span className="font-medium">{typeof promotionNom === 'string' ? promotionNom : JSON.stringify(promotionNom)}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-body-color dark:text-body-color-dark">
            <Calendar className="h-3.5 w-3.5" />
            <span>{typeof anneeNom === 'string' ? anneeNom : JSON.stringify(anneeNom)}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleDeleteAcadInfo(index)}
          className="text-danger hover:text-opacity-80"
          title="Supprimer"
        >
          <Trash2 size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
      {/* Section principale (3/5) */}
      <div className="md:col-span-3 bg-white dark:bg-boxdark rounded-sm border border-stroke shadow-default dark:border-strokedark">
        {/* Navigation par onglets */}
        <div className="border-b border-stroke dark:border-strokedark">
          <nav className="flex flex-wrap -mb-px">
            <button
              onClick={() => setActiveTab("personal")}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === "personal"
                  ? "border-primary text-primary"
                  : "border-transparent text-body-color dark:text-body-color-dark hover:text-black hover:border-black dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>Informations personnelles</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab("contact")}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === "contact"
                  ? "border-primary text-primary"
                  : "border-transparent text-body-color dark:text-body-color-dark hover:text-black hover:border-black dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <Briefcase size={16} />
                <span>Informations de contact</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab("school")}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === "school"
                  ? "border-primary text-primary"
                  : "border-transparent text-body-color dark:text-body-color-dark hover:text-black hover:border-black dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen size={16} />
                <span>Informations scolaires</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="p-6">
          {message && (
            <div className={`p-4 mb-6 rounded-md ${
              message.type === 'success' 
                ? 'bg-success/10 text-success' 
                : 'bg-danger/10 text-danger'
            }`}>
              {message.text}
            </div>
          )}

          {/* Informations personnelles */}
          {activeTab === "personal" && (
            <form onSubmit={handlePersonalSubmit}>
              <h2 className="text-xl font-semibold text-black dark:text-white flex items-center gap-2 mb-6">
                <User className="h-6 w-6 text-primary" />
                Informations personnelles
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label 
                    htmlFor="nom"
                    className="mb-2.5 block text-black dark:text-white"
                  >
                    Nom <span className="text-danger">*</span>
                  </label>
                  <input
                    id="nom"
                    name="nom"
                    value={personalInfo.nom}
                    onChange={handlePersonalChange}
                    required
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label 
                    htmlFor="postNom"
                    className="mb-2.5 block text-black dark:text-white"
                  >
                    Post-nom <span className="text-danger">*</span>
                  </label>
                  <input
                    id="postNom"
                    name="postNom"
                    value={personalInfo.postNom}
                    onChange={handlePersonalChange}
                    required
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                {/* Autres champs d'informations personnelles... */}
                <div>
                  <label 
                    htmlFor="preNom"
                    className="mb-2.5 block text-black dark:text-white"
                  >
                    Prénom
                  </label>
                  <input
                    id="preNom"
                    name="preNom"
                    value={personalInfo.preNom}
                    onChange={handlePersonalChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label 
                    htmlFor="sexe"
                    className="mb-2.5 block text-black dark:text-white"
                  >
                    Sexe <span className="text-danger">*</span>
                  </label>
                  <select
                    id="sexe"
                    name="sexe"
                    value={personalInfo.sexe}
                    onChange={handlePersonalChange}
                    required
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>

                <div>
                  <label 
                    htmlFor="dateNaissance"
                    className="mb-2.5 block text-black dark:text-white"
                  >
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    id="dateNaissance"
                    name="dateNaissance"
                    value={personalInfo.dateNaissance ? new Date(personalInfo.dateNaissance).toISOString().split('T')[0] : ''}
                    onChange={handlePersonalChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label 
                    htmlFor="lieuNaissance"
                    className="mb-2.5 block text-black dark:text-white"
                  >
                    Lieu de naissance
                  </label>
                  <input
                    id="lieuNaissance"
                    name="lieuNaissance"
                    value={personalInfo.lieuNaissance}
                    onChange={handlePersonalChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label 
                    htmlFor="adresse"
                    className="mb-2.5 block text-black dark:text-white"
                  >
                    Adresse
                  </label>
                  <textarea
                    id="adresse"
                    name="adresse"
                    value={personalInfo.adresse}
                    onChange={handlePersonalChange}
                    rows={3}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  ></textarea>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-70"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Informations de contact et scolaires (onglets existants)... */}
          {activeTab === "contact" && (
            <form onSubmit={handleContactSubmit}>
              <h2 className="text-xl font-semibold text-black dark:text-white flex items-center gap-2 mb-6">
                <Briefcase className="h-6 w-6 text-primary" />
                Informations de contact
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label 
                    htmlFor="etudiantId"
                    className="mb-2.5 block text-black dark:text-white"
                  >
                    ID Étudiant
                  </label>
                  <input
                    id="etudiantId"
                    name="etudiantId"
                    value={contactInfo.etudiantId}
                    onChange={handleContactChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label 
                    htmlFor="optId"
                    className="mb-2.5 block text-black dark:text-white"
                  >
                    ID Option
                  </label>
                  <input
                    id="optId"
                    name="optId"
                    value={contactInfo.optId}
                    onChange={handleContactChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label 
                    htmlFor="email"
                    className="mb-2.5 block text-black dark:text-white"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={contactInfo.email}
                    onChange={handleContactChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label 
                    htmlFor="telephone"
                    className="mb-2.5 block text-black dark:text-white"
                  >
                    Téléphone
                  </label>
                  <input
                    id="telephone"
                    name="telephone"
                    value={contactInfo.telephone}
                    onChange={handleContactChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-70"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === "school" && (
            <form onSubmit={handleSchoolSubmit}>
              <h2 className="text-xl font-semibold text-black dark:text-white flex items-center gap-2 mb-6">
                <BookOpen className="h-6 w-6 text-primary" />
                Informations scolaires
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label 
                    htmlFor="section"
                    className="mb-2.5 block text-black dark:text-white"
                  >
                    Section
                  </label>
                  <input
                    id="section"
                    name="section"
                    value={schoolInfo.section}
                    onChange={handleSchoolChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label 
                    htmlFor="option"
                    className="mb-2.5 block text-black dark:text-white"
                  >
                    Option
                  </label>
                  <input
                    id="option"
                    name="option"
                    value={schoolInfo.option}
                    onChange={handleSchoolChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label 
                    htmlFor="pourcentage"
                    className="mb-2.5 block text-black dark:text-white"
                  >
                    Pourcentage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    id="pourcentage"
                    name="pourcentage"
                    value={schoolInfo.pourcentage}
                    onChange={handleSchoolChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                  
                  {schoolInfo.pourcentage && (
                    <div className="mt-2">
                      <div className="w-full h-2 bg-gray-200 dark:bg-meta-4 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            Number(schoolInfo.pourcentage) >= 80 ? 'bg-success' : 
                            Number(schoolInfo.pourcentage) >= 60 ? 'bg-primary' : 
                            Number(schoolInfo.pourcentage) >= 50 ? 'bg-warning' : 'bg-danger'
                          }`}
                          style={{ width: `${Math.min(Number(schoolInfo.pourcentage), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-70"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {/* Section d'informations académiques (2/5) */}
      <div className="md:col-span-2">
        <div className="bg-white dark:bg-boxdark rounded-sm border border-stroke shadow-default dark:border-strokedark p-6">
          <h2 className="text-xl font-semibold text-black dark:text-white flex items-center gap-2 mb-6">
            <School className="h-6 w-6 text-primary" />
            Parcours académique
          </h2>
          
          <div className="mb-6">
            <h3 className="text-md font-medium text-black dark:text-white mb-3">
              Ajouter une nouvelle année académique
            </h3>

            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="promotionId"
                  className="mb-2.5 block text-sm text-black dark:text-white"
                >
                  Promotion
                </label>
                <select
                  id="promotionId"
                  name="promotionId"
                  value={newAcadInfo.promotionId}
                  onChange={handleNewAcadChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="">Sélectionner une promotion</option>
                  {promotions ? promotions.map((promotion) => (
                    <option key={promotion._id} value={promotion._id}>
                      {promotion.niveau} {promotion.mention} {promotion.orientation ? `(${promotion.orientation})` : ""}
                    </option>
                  )) : null}
                </select>
              </div>

              <div>
                <label 
                  htmlFor="anneeId"
                  className="mb-2.5 block text-sm text-black dark:text-white"
                >
                  Année académique
                </label>
                <select
                  id="anneeId"
                  name="anneeId"
                  value={newAcadInfo.anneeId}
                  onChange={handleNewAcadChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="">Sélectionner une année</option>
                  {annees.map((annee) => (
                    <option key={annee.id} value={annee.id}>
                      {annee.nom}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleAddAcadInfo}
                disabled={isSaving || !newAcadInfo.promotionId || !newAcadInfo.anneeId}
                className="flex items-center justify-center gap-2 w-full rounded bg-primary py-2.5 px-4 font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-70"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <PlusCircle size={16} />
                    Ajouter
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="border-t border-stroke dark:border-strokedark pt-6">
            <h3 className="text-md font-medium text-black dark:text-white mb-3">
              Historique académique
            </h3>
            
            {etudiant.infoAcad && etudiant.infoAcad.length > 0 ? (
              <div className="space-y-2">
                {etudiant.infoAcad.map((info, index) => getAcadInfoDisplay(info, index))}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-meta-4 p-4 rounded-md text-body-color dark:text-body-color-dark text-center">
                Aucune information académique enregistrée
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}