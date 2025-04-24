"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { User, Mail, Phone, Calendar, MapPin, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import useUserStore from "@/store/useUserStore";
import { inbtp } from "@/assets/logo";

export default function EtudiantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { slug } = useParams();
  const { etudiant, fetchEtudiant, isLoading, clearEtudiant } = useUserStore();

  useEffect(() => {
    if (slug) {
      fetchEtudiant(slug as string);
    }

    return () => {
      clearEtudiant() // Réinitialiser l'étudiant lors du démontage du composant
    };
  }, [slug, fetchEtudiant]);



  // Formater la date de naissance
  const formatDateNaissance = (dateStr?: string) => {
    if (!dateStr) return "Non renseignée";
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  // if (isLoading) {
  //   return (
  //     <div className="p-5 flex items-center justify-center h-64">
  //       <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
  //     </div>
  //   );
  // }

  if (!etudiant) {
    return (
      <div className="p-5">
        <div className="bg-warning/10 text-warning p-4 rounded-md">
          <h3 className="font-semibold mb-2">Chargement des données</h3>
          <p>Veuillez patienter pendant le chargement des informations de l&apos;étudiant...</p>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-1 dark:bg-boxdark-2">
      {/* Bannière d'informations de l'étudiant */}
      <div className="bg-white dark:bg-boxdark shadow-md mb-5">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
            {/* Photo de profil */}
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-2 dark:bg-meta-4 flex items-center justify-center">
              
              <Image 
                src={inbtp.src} 
                alt={`${etudiant.infoPerso.nom} ${etudiant.infoPerso.postNom}`} 
                width={96} 
                height={96}
                className="object-cover"
              />
            </div>

            {/* Informations principales */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-black dark:text-white">
                {etudiant.infoPerso.nom} {etudiant.infoPerso.postNom} {etudiant.infoPerso.preNom || ""}
              </h1>
              
              <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-3 text-sm">
                {etudiant.infoSec.etudiantId && (
                  <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded">
                    <User size={14} />
                    <span>ID: {etudiant.infoSec.etudiantId}</span>
                  </div>
                )}
                
                {etudiant.infoSec.email && (
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-meta-4 px-2 py-1 rounded">
                    <Mail size={14} />
                    <span>{etudiant.infoSec.email}</span>
                  </div>
                )}
                
                {etudiant.infoSec.telephone && (
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-meta-4 px-2 py-1 rounded">
                    <Phone size={14} />
                    <span>{etudiant.infoSec.telephone}</span>
                  </div>
                )}
              </div>

              {/* Informations secondaires */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="text-primary h-5 w-5" />
                  <div>
                    <p className="text-xs text-body-color dark:text-body-color-dark">Date de naissance</p>
                    <p className="font-medium text-black dark:text-white">
                      {formatDateNaissance(etudiant.infoPerso.dateNaissance)}
                    </p>
                  </div>
                </div>
                
                {etudiant.infoPerso.lieuNaissance && (
                  <div className="flex items-center gap-2">
                    <MapPin className="text-primary h-5 w-5" />
                    <div>
                      <p className="text-xs text-body-color dark:text-body-color-dark">Lieu de naissance</p>
                      <p className="font-medium text-black dark:text-white">
                        {etudiant.infoPerso.lieuNaissance}
                      </p>
                    </div>
                  </div>
                )}
                
                {etudiant.infoScol.section && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="text-primary h-5 w-5" />
                    <div>
                      <p className="text-xs text-body-color dark:text-body-color-dark">Section</p>
                      <p className="font-medium text-black dark:text-white">
                        {etudiant.infoScol.section}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu de la page */}
      <div className="container mx-auto px-4 pb-10">
        {children}
      </div>
    </div>
  );
}