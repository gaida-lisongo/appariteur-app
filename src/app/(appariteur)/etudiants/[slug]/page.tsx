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
import CreateFraisModal from "./components/CreateFraisModal";
import services from "@/services";

const PromotionPage = () => {
  const params = useParams();
  const slug = params?.slug as string;
  const { promotions, fetchEtudiants, isLoading, setLoading, minervals = {}, setMinervals, fetchMinervals } = useUserStore();
  const [promotionId, setPromotionId] = useState<string | null>(null);
  const [anneeId, setAnneeId] = useState<string | null>(null);
  const [promotion, setPromotion] = useState<any>(null);
  const [showFinancePanel, setShowFinancePanel] = useState(false);
  const [etudiants, setEtudiants] = useState<any[]>([]);
  const [fraisAcad, setFraisAcad] = useState<any>(null);
  const { Appariteur } = services;
  const [createFraisModalIsOpen, setCreateFraisModalIsOpen] = useState(false);
  // État pour la configuration des frais
  const [fraisConfig, setFraisConfig] = useState({
    _id: "",
    anneeAcad: "",
    montantTotal: 0,
    devise: "USD",
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

  const currentMinerval = async (promotionId: string) => {
    const response = await fetchMinervals(promotionId);
    console.log("Current minerval:", response);

    if (response && response.success) {
      setMinervals(response.data);
    }
  }
  useEffect(() => {
    setLoading(true);
    if (slug) {
      const [currentPromotion, currentAnnee] = slug.split("-");
      setPromotionId(currentPromotion);
      setAnneeId(currentAnnee);
      setLoading(false);

      currentMinerval(currentPromotion);
    }
  }, []);

  // Récupérer les infos de la promotion
  useEffect(() => {

    const loadData = async () => {
      try {
        setLoading(true);
        // Trouver la promotion par son ID
        const selectedPromotion = promotions?.find(p => p._id === promotionId);
        if (selectedPromotion) {
          setPromotion(selectedPromotion);

          // Charger les étudiants de cette promotion
          const etudiantsData = await fetchEtudiants(selectedPromotion._id);
          if (etudiantsData && etudiantsData.length > 0 && etudiantsData[0].inscrits) {
            setEtudiants(etudiantsData[0].inscrits);
          }
          // Mettre à jour le nombre d'inscrits
          setPromotion(prev => ({
            ...prev,
            nombreInscrits: etudiantsData[0]?.inscrits.length || 0
          }));
          // Si des frais existent déjà, les charger
          if (selectedPromotion) {
            const allFraisAcademique = await fetchMinervals(selectedPromotion._id);
            console.log("Frais académiques de la promotion:", allFraisAcademique);
            setFraisAcad(allFraisAcademique);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    if (promotionId) {
      loadData();
    }
  }, [promotionId, promotions, fetchEtudiants, fetchMinervals]);

  useEffect(() => {
    console.log("Frais académiques:", fraisAcad);
    if (fraisAcad && fraisAcad.length > 0) {
      setFraisConfig(prev => ({
        ...prev,
        anneeAcad: fraisAcad[0].anneeId.slogan || "",
        montantTotal: fraisAcad[0].montant || 0,
        devise: fraisAcad[0].devise || "USD",
        nombreTranches: fraisAcad[0].tranches?.length || 1,
        tranches: fraisAcad[0].tranches || [{
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
    try {
      setTrancheError(null);
      console.log("Données de la tranche à sauvegarder:", trancheData);
      
      // Préparation des données pour l'API
      const payload = {
        id: minervals._id,
        tranche: {
          ...trancheData,
          _id: trancheEnEdition?._id || "" // Utilisez l'ID existant en cas de modification
        }
      };
      
      let updatedMinerval;
      
      // Si c'est une édition
      if (trancheEnEdition && trancheEnEdition.index !== undefined) {
        // Appel API - décommentez quand vous êtes prêt
        // const response = await Appariteur.updateTranche(payload);
        // updatedMinerval = response.data;
        
        // Pour le développement, simuler une mise à jour
        const updatedTranches = [...minervals.tranches];
        updatedTranches[trancheEnEdition.index] = {
          ...updatedTranches[trancheEnEdition.index],
          ...trancheData
        };
        
        updatedMinerval = {
          ...minervals,
          tranches: updatedTranches
        };
      } 
      // Si c'est un ajout
      else {
        // Appel API - décommentez quand vous êtes prêt
        // const response = await Appariteur.addTranche(payload);
        // updatedMinerval = response.data;
        
        // Pour le développement, simuler un ajout
        updatedMinerval = {
          ...minervals,
          tranches: [
            ...minervals.tranches,
            {
              _id: `tranche-${Date.now()}`,
              ...trancheData
            }
          ]
        };
      }
      
      // Mise à jour du state global
      setMinervals(updatedMinerval);
      
      // Mise à jour du state local fraisConfig
      setFraisConfig(prev => ({
        ...prev,
        tranches: updatedMinerval.tranches,
        nombreTranches: updatedMinerval.tranches.length
      }));
      
      // Fermer la modal
      fermerModal();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la tranche:", error);
      setTrancheError("Une erreur est survenue lors de la sauvegarde de la tranche");
    }
  };

  // Pour supprimer une tranche
  const supprimerTranche = async (payload : {id: string, trancheId: string}) => {
    if (minervals.tranches.length <= 1) {
      alert("Il doit y avoir au moins une tranche!");
      return;
    }

    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette tranche ?")) {
      try {
        // Mise à jour du state local
        console.log("Tranche à supprimer:", payload);
        const request = await Appariteur.deleteTranche(payload);
        if (request.success) {

          console.log("Tranche supprimée avec succès:", request.data);
          alert("Tranche supprimée avec succès!");
          setMinervals(request.data);
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
        alert("Étudiant supprimé avec succès!");
        setEtudiants(prev => prev.filter(e => e._id !== id));
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Une erreur est survenue lors de la suppression.");
      }
    }
  };

  const refreshEtudiants = async () => {
    try {
      setLoading(true);
      const etudiantsData = await fetchEtudiants(promotionId);
      if (etudiantsData && etudiantsData.length > 0 && etudiantsData[0].inscrits) {
        setEtudiants(etudiantsData[0].inscrits);
      }
    } catch (error) {
      console.error("Erreur lors de l'actualisation des données:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveFraisAcademiques = async () => {
    console.log("Frais académiques à sauvegarder:", fraisConfig);
    // Implémentation de la sauvegarde des frais académiques
  }

  const handleCreateFrais = async (fraisData: any) => {
    try {
      console.log("Création des frais académiques:", fraisData);
      
      // Préparation des données pour l'API
      const minervalData = {
        promotionId: promotion._id,
        anneeId: anneeId,
        montant: fraisData.montant,
        devise: fraisData.devise,
        // Ajoutez d'autres champs nécessaires à votre API
      };
      
      // Appel à l'API - décommentez quand vous êtes prêt à l'utiliser
      // const response = await Appariteur.createMinerval(minervalData);
      // const newMinerval = response.data;
      
      // Simuler une réponse réussie pour l'instant
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Créer un objet minerval avec une seule tranche initiale
      const newMinerval = {
        _id: `minerval-${Date.now()}`,
        promotionId: promotion._id,
        anneeId: anneeId,
        montant: fraisData.montant,
        devise: fraisData.devise,
        tranches: [{
          _id: `tranche-${Date.now()}`,
          designation: "Tranche 1",
          montant: fraisData.montant,
          date_fin: new Date().toISOString().split('T')[0]
        }]
      };
      
      // Mise à jour du state global
      setMinervals(newMinerval);
      setCreateFraisModalIsOpen(false);
      
      // Afficher le panneau de configuration
      setShowFinancePanel(true);
      
      // Mettre à jour fraisConfig pour refléter le nouveau minerval
      setFraisConfig({
        _id: newMinerval._id,
        anneeAcad: anneeId || "",
        montantTotal: newMinerval.montant,
        devise: newMinerval.devise,
        nombreTranches: 1,
        tranches: newMinerval.tranches
      });
      
    } catch (error) {
      console.error("Erreur lors de la création des frais académiques:", error);
      alert("Une erreur est survenue lors de la création des frais académiques");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
            // Si on ouvre le panneau et qu'il n'y a pas de minerval, on ouvre la modale
            if (show && (!minervals || !minervals._id)) {
              setCreateFraisModalIsOpen(true);
            } else {
              setShowFinancePanel(show);
            }
          }}
        />

        {/* Panneau de configuration des frais académiques - uniquement si minervals existe */}
        {showFinancePanel && minervals && minervals._id && (
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
            minervals={minervals}
          />
        )}
      </div>

      {/* Tableau des étudiants */}
      <div className="space-y-10">
        <EtudiantsTable
          etudiants={etudiants}
          promotionId={promotionId || ""}
          onDelete={handleDeleteEtudiant}
          onRefresh={refreshEtudiants}
          isLoading={isLoading}
        />
      </div>

      {/* Modal pour ajouter ou éditer une tranche */}
      <TrancheModal
        isOpen={modalIsOpen}
        onClose={fermerModal}
        onSave={sauvegarderTranche}
        trancheInitiale={trancheEnEdition || undefined}
        devise={minervals?.devise || "USD"}
        minervalId={minervals?._id}
      />
      
      {/* Modal pour créer les frais académiques */}
      <CreateFraisModal
        isOpen={createFraisModalIsOpen}
        onClose={() => setCreateFraisModalIsOpen(false)}
        onSave={handleCreateFrais}
        promotion={promotion}
      />
    </>
  );
};

export default PromotionPage;
