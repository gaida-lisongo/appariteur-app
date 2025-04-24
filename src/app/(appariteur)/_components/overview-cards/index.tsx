"use client";
import { compactFormat } from "@/lib/format-number";
import { getOverviewData } from "../../fetch";
import { OverviewCard } from "./card";
import * as icons from "./icons";
import useUserStore from "@/store/useUserStore";
import { useEffect, useState } from "react";
import services from "@/services";

export function OverviewCardsGroup() {
  const { isLoading, promotions, activeAppariteur, fetchEtudiants, fetchMinervals } = useUserStore();
  const { Appariteur } = services;

  const [data, setData] = useState<{
    views: { value: number; growthRate: number };
    profit: { value: number; growthRate: number };
    products: { value: number; growthRate: number };
    users: { value: number; growthRate: number };
  } | null>(null);

  const [metriques, setMetriques] = useState<{
    promotions: { value: string; growthRate: number; label: string };
    etudiants: { value: string; growthRate: number; label: string };
    inscriptions: { value: string; growthRate: number; label: string };
    retraits: { value: string; growthRate: number; label: string };    
  } | null>(null);

  useEffect(() => {
    // Fonction pour charger toutes les données métriques à la fois
    const loadAllMetrics = async () => {
      try {
        // 1. Obtenir les données des promotions
        let promotionsMetric = {
          value: '0',
          growthRate: 0,
          label: "Promotions"
        };
        
        try {
          const responsePromotions = await Appariteur.getAllPromotions();
          if (responsePromotions.success) {
            const { count } = responsePromotions;
            promotionsMetric = {
              value: `${promotions?.length ?? 0}`,
              growthRate: count > 0 ? parseFloat((((promotions?.length ?? 0) / count) * 100).toFixed(2)) : 0,
              label: "Promotions"
            };
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des promotions:", error);
        }
        
        // 2. Obtenir les données des étudiants
        let etudiantsMetric = {
          value: '0',
          growthRate: 0,
          label: "Étudiants"
        };
        
        try {
          if (promotions && promotions.length > 0) {
            const promises = promotions.map(promotion => fetchEtudiants(promotion._id));
            const studentsResults = await Promise.all(promises);

            let allStudentsResults : any[] = [];

            studentsResults.forEach((result) => {
              if (result) {

                allStudentsResults = [...allStudentsResults, ...result];
              }
            });
            // Compter le nombre total d'étudiants en additionnant les longueurs des tableaux
            const totalStudents = allStudentsResults.reduce((total, result) => {
              // Vérifier si result.inscrits existe et est un tableau
              return total + (result?.inscrits?.length || 0);
            }, 0);

            const responseEtudiants = await Appariteur.getAllEtudiants();
            if (responseEtudiants.success) {
              const { count } = responseEtudiants;
              etudiantsMetric = {
                value: `${totalStudents}`,
                growthRate: count > 0 ? parseFloat((((totalStudents) / count) * 100).toFixed(2)) : 0,
                label: "Étudiants"
              };
            }
            
            etudiantsMetric = {
              value: `${totalStudents}`,
              growthRate: promotions.length > 0 ? parseFloat((totalStudents / promotions.length).toFixed(2)) : 0,
              label: "Étudiants"
            };
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des étudiants:", error);
        }
        
        // 3. Placeholder pour les inscriptions (à implémenter selon votre logique)
        const inscriptionsMetric = {
          value: activeAppariteur ? `${activeAppariteur.inscriptions.length}` : '0',
          growthRate: promotions && activeAppariteur ? parseFloat((activeAppariteur.inscriptions.length / promotions.length).toFixed(2)) : 0,
          label: "Inscriptions"
        };

        
        // 4. Placeholder pour les retraits (à implémenter selon votre logique)
        let retraitsMetric = {
          value: '0',
          growthRate: 0,
          label: "Frais Academiques"
        };

        try {
          if (promotions && promotions.length > 0) {
            const minervals = promotions.map(async (promotion) => fetchMinervals(promotion._id));
            const allMinervals = await Promise.all(minervals);

            let allMinervalsResults : any[] = [];

            allMinervals.forEach((result) => {
              if (result) {
                allMinervalsResults = [...allMinervalsResults, ...result];
              }
            });

            console.log("allMinervalsResults", allMinervalsResults);

            // Compter le nombre total d'étudiants en additionnant les longueurs des tableaux
            const totalMinerval = allMinervalsResults.reduce((total, minerval) => {
              // Vérifier si result.inscrits existe et est un tableau
              return total + (parseFloat(minerval.montant) || 0);
            }, 0);
            
            retraitsMetric = {
              value: `${totalMinerval}`,
              growthRate: promotions.length > 0 ? parseFloat((totalMinerval / promotions.length).toFixed(2)) : 0,
              label: "Frais Academiques (CDF)"
            };
          }
          
        } catch (error) {
          console.error("Erreur lors de la récupération des retraits:", error);          
        }
        
        // Mettre à jour l'état avec toutes les métriques
        setMetriques({
          promotions: promotionsMetric,
          etudiants: etudiantsMetric,
          inscriptions: inscriptionsMetric,
          retraits: retraitsMetric
        });
        
      } catch (error) {
        console.error("Erreur lors du chargement des métriques:", error);
      }
    };

    console.log("Données de l'appariteur : ", activeAppariteur);
    // Charger les données de l'API d'overview (à garder si nécessaire)
    const fetchData = async () => {
      const response = await getOverviewData();
      setData(response);
    };

    // Exécuter les deux fonctions de chargement
    fetchData();  
    loadAllMetrics();
    
  }, []);

  if(data && isLoading) {
    return (
      //Loader
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <div className="loader" />
        <div className="loader" />
        <div className="loader" />
        <div className="loader" />
      </div>
    );
  }

  
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      {metriques ? (
        <>
          <OverviewCard
            label="Promotions"
            data={{
              value: metriques.promotions.value,
              growthRate: metriques.promotions.growthRate,
            }}
            Icon={icons.Views}
          />

          <OverviewCard
            label="Moy. Etudiants"
            data={{
              value: metriques.etudiants.value,
              growthRate: metriques.etudiants.growthRate,
            }}
            Icon={icons.Users}
          />

          <OverviewCard
            label="Moy. Inscriptions"
            data={{
              value: metriques.inscriptions.value,
              growthRate: metriques.inscriptions.growthRate,
            }}
            Icon={icons.Product}
          />

          <OverviewCard
            label="Moy. Frais"
            data={{
              value: metriques.retraits.value,
              growthRate: metriques.retraits.growthRate,
            }}
            Icon={icons.Profit}
          />
        </>
      ) : data ? (
        <>
          <OverviewCard
            label="Total Views"
            data={{
              ...data.views,
              value: compactFormat(data.views.value),
            }}
            Icon={icons.Views}
          />

          <OverviewCard
            label="Total Profit"
            data={{
              ...data.profit,
              value: "$" + compactFormat(data.profit.value),
            }}
            Icon={icons.Profit}
          />

          <OverviewCard
            label="Total Products"
            data={{
              ...data.products,
              value: compactFormat(data.products.value),
            }}
            Icon={icons.Product}
          />

          <OverviewCard
            label="Total Users"
            data={{
              ...data.users,
              value: compactFormat(data.users.value),
            }}
            Icon={icons.Users}
          />
        </>
      ) : null}
    </div>
  );
}
