"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { EtudiantsTable } from "@/components/Tables/etudiantsTable";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useUserStore from "@/store/useUserStore";
import { inbtp6 } from "@/assets/banner";
import PromotionBanner from "./components/PromotionBanner";
import ConfigurationFraisPanel from "./components/ConfigurationFraisPanel";
import TrancheModal, { TrancheInitiale, TrancheFormData } from "./components/TrancheModal";
import CreateMinervalPanel from "./components/CreateMinervalPanel";
import services from "@/services";
import { min } from "date-fns";

// Mettre à jour le nombre d'inscrits
interface Promotion {
  _id: string;
  niveau: string;
  mention: string;
  orientation?: string;
  nombreInscrits?: number;
  [key: string]: any; // for other potential properties
}

const PromotionPage = () => {
  const params = useParams();
  const slug = params?.slug as string;
  const { isLoading, minervals, promotion, currentEtudiants : etudiants, setSlug, setMinervals, clearEtudiants, clearMinervals, clearPromotion , setEtudiants } = useUserStore();
  const [promotionId, setPromotionId] = useState<string | null>(null);
  const [anneeId, setAnneeId] = useState<string | null>(null);
  const [showFinancePanel, setShowFinancePanel] = useState(false);
  const [fraisAcad, setFraisAcad] = useState<any>(null);
  const { Appariteur } = services;
  const [createFraisModalIsOpen, setCreateFraisModalIsOpen] = useState(false);
  // État pour la configuration des frais
  const [fraisConfig, setFraisConfig] = useState({
    _id: "",
    anneeAcad: "",
    montantTotal: 0,
    devise: "FC",
    nombreTranches: 1,
    tranches: [{
      _id: "",
      designation: "Tranche 1",
      montant: 0,
      date_fin: new Date().toISOString().split('T')[0]
    }]
  });

  // État pour la modal
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [trancheEnEdition, setTrancheEnEdition] = useState<TrancheInitiale | null>(null);
  const [trancheError, setTrancheError] = useState<string | null>(null);

  useEffect(() => {
    console.log("PromotionPage mounted, with slug:", slug);
    if (slug) {
      const [currentPromotion, currentAnnee] = slug.split("-");
      setPromotionId(currentPromotion);
      setAnneeId(currentAnnee);
      setSlug(slug); // Mettre à jour le slug dans le store
    }
    setTimeout(() => {
      
      console.log("Liste des étudiants:", etudiants);
    
    }, 1000);
    // return () => {
    //   setPromotionId(null);
    //   setAnneeId(null);
    //   clearEtudiants();
    //   clearMinervals();
    //   clearPromotion();
    // };
  }, [etudiants]);

  // Récupérer les infos de la promotion
  useEffect(() => {
    if (minervals) {
      setFraisAcad(minervals[0]);
    }
  }, [minervals]);

  useEffect(() => {
    if (fraisAcad && fraisAcad.length > 0) {
      setFraisConfig(prev => ({
        ...prev,
        anneeAcad: fraisAcad.anneeId.slogan || "",
        montantTotal: fraisAcad.montant || 0,
        devise: fraisAcad.devise || "USD",
        nombreTranches: fraisAcad.tranches?.length || 1,
        tranches: fraisAcad.tranches || [{
          designation: "Tranche 1",
          montant: 0,
          date_fin: new Date().toISOString().split('T')[0]
        }]
      }));
    }
  }, [fraisAcad]);

  // Mise à jour du nombre de tranches
  useEffect(() => {
    const updatedTranches = [...fraisConfig.tranches];

    // Ajouter des tranches si nécessaire
    while (updatedTranches.length < fraisConfig.nombreTranches) {
      updatedTranches.push({
        _id: "",
        designation: `Tranche ${updatedTranches.length + 1}`,
        montant: 0,
        date_fin: new Date().toISOString().split('T')[0]
      });
    }

    // Retirer des tranches si nécessaire
    while (updatedTranches.length > fraisConfig.nombreTranches) {
      updatedTranches.pop();
    }

    // Mettre à jour si changement
    if (updatedTranches.length !== fraisConfig.tranches.length) {
      setFraisConfig(prev => ({
        ...prev,
        tranches: updatedTranches
      }));
    }
  }, [fraisConfig.nombreTranches]);

  // Pour ouvrir la modal d'ajout de tranche
  const ouvrirModalAjoutTranche = () => {
    setTrancheEnEdition({
      designation: `Tranche ${fraisConfig.tranches.length + 1}`,
      montant: 0,
      date_fin: new Date().toISOString().split('T')[0]
    });
    setModalIsOpen(true);
    setTrancheError(null);
  };

  // Pour ouvrir la modal d'édition d'une tranche existante
  const ouvrirModalEditionTranche = (index: number) => {
    setTrancheEnEdition({
      ...fraisConfig.tranches[index],
      index
    });
    setModalIsOpen(true);
    setTrancheError(null);
  };

  // Pour fermer la modal
  const fermerModal = () => {
    setModalIsOpen(false);
    setTrancheEnEdition(null);
    setTrancheError(null);
  };

  // Pour sauvegarder une tranche
  const sauvegarderTranche = async (trancheData: TrancheFormData) => {
    const updatedMinerval = {
      ...fraisAcad,
      ...trancheData
    };
    setMinervals([updatedMinerval]);
    setFraisAcad(updatedMinerval);
  };

  // Pour supprimer une tranche
  const supprimerTranche = async (payload : {id: string, trancheId: string}) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette tranche ?")) {
      try {
        // Mise à jour du state local
        console.log("Tranche à supprimer:", payload);
        const request = await Appariteur.deleteTranche(payload);
        if (request.success) {
          alert("Tranche supprimée avec succès!");
          setMinervals([request.data]);

          window.location.reload();
        }
        
      } catch (error) {
        console.error("Erreur lors de la suppression de la tranche:", error);
        alert("Une erreur est survenue lors de la suppression de la tranche");
      }
    }
  };

  // Répartition égale du montant total entre les tranches
  const distribuerMontantEgal = () => {
    const montantParTranche = fraisConfig.montantTotal / fraisConfig.nombreTranches;
    const updatedTranches = fraisConfig.tranches.map((tranche) => ({
      ...tranche,
      montant: parseFloat(montantParTranche.toFixed(2))
    }));

    setFraisConfig(prev => ({
      ...prev,
      tranches: updatedTranches
    }));
  };

  const handleDeleteEtudiant = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) {
      try {
        const response = await Appariteur.deleteEtudiant({ id });
        if (response.success) {
          alert(response.message);
          window.location.reload();
        } else {
          console.error("Erreur lors de la suppression de l'étudiant:", response.message);
          alert("Une erreur est survenue lors de la suppression de l'étudiant.");
          return;
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Une erreur est survenue lors de la suppression.");
      }
    }
  };

  const refreshEtudiants = async () => {
    window.location.reload();
  };

  const saveFraisAcademiques = async () => {
    console.log("Frais académiques à sauvegarder:", fraisConfig);
    // Implémentation de la sauvegarde des frais académiques
  }

  const handleCreateFrais = async (fraisData: any) => {
    try {
      console.log("Création des frais académiques:", fraisData);
      setMinervals([fraisData]);
      setFraisAcad(fraisData);
      setCreateFraisModalIsOpen(false);

      // Rechargerment de la page
      window.location.reload();
      
    } catch (error) {
      console.error("Erreur lors de la création des frais académiques:", error);
      alert("Une erreur est survenue lors de la création des frais académiques");
    }
  };

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-64">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  //     </div>
  //   );
  // }

  if (!promotion) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-2">Promotion non trouvée</h2>
        <p>La promotion que vous cherchez n'existe pas ou n'est pas accessible.</p>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb pageName={`Étudiants - ${promotion.niveau} ${promotion.mention} ${promotion.orientation || ''}`} />

      {/* Bannière de la promotion */}
      <div className="mb-8 overflow-hidden rounded-lg bg-white shadow-1 dark:bg-boxdark">
        <PromotionBanner
          promotion={promotion}
          backgroundImage={inbtp6}
          showFinancePanel={showFinancePanel}
          setShowFinancePanel={(show) => {
            setShowFinancePanel(show);
          }}
          etudiants={etudiants?.inscrits || []}
        />

        {/* Panneau de création ou configuration des frais académiques */}
        {showFinancePanel && (
          <>
            {fraisAcad && fraisAcad._id ? (
              // Si un minerval existe déjà, afficher le panneau de configuration
              <ConfigurationFraisPanel
                fraisConfig={fraisConfig}
                setFraisConfig={setFraisConfig}
                ouvrirModalAjoutTranche={ouvrirModalAjoutTranche}
                ouvrirModalEditionTranche={ouvrirModalEditionTranche}
                supprimerTranche={supprimerTranche}
                distribuerMontantEgal={distribuerMontantEgal}
                saveFraisAcademiques={saveFraisAcademiques}
                setShowFinancePanel={setShowFinancePanel}
                promotion={promotion}
                minervals={fraisAcad}
              />
            ) : (
              // Si aucun minerval n'existe, afficher le panneau de création
              <CreateMinervalPanel
                promotion={promotion}
                anneeId={anneeId}
                onCreateMinerval={handleCreateFrais}
                setShowFinancePanel={setShowFinancePanel}
              />
            )}
          </>
        )}
      </div>

      {/* Tableau des étudiants */}
      {etudiants && (<div className="space-y-12">
        <EtudiantsTable
          etudiants={etudiants?.inscrits || []}
          promotionId={promotionId || ""}
          anneeId={anneeId || ""}
          onDelete={handleDeleteEtudiant}
          onRefresh={refreshEtudiants}
          isLoading={isLoading}
          promotionInfo = {promotion}
        />
      </div>)}

      {/* Modal pour ajouter ou éditer une tranche */}
      <TrancheModal
        isOpen={modalIsOpen}
        onClose={fermerModal}
        onSave={sauvegarderTranche}
        trancheInitiale={trancheEnEdition || undefined}
        devise={fraisAcad?.devise || "USD"}
        minervalId={fraisAcad?._id}
        minerval={fraisAcad}
      />
    </>
  );
};

export default PromotionPage;
