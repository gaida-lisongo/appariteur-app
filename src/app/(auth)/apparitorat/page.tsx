"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import services from "@/services";
import { Appariteur } from "@/types/api.types";
import OtpVerification from "@/components/Auth/OtpVerification";
import AppariteurCard from "@/components/appariteur/AppariteurCard";
import { inbtp, logo } from "@/assets/logo";
import { gt1 } from '@/assets/banner';

export default function ForgotMatricule() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [appariteurs, setAppariteurs] = useState<Appariteur[]>([]);
  const [filteredAppariteurs, setFilteredAppariteurs] = useState<Appariteur[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppariteur, setSelectedAppariteur] = useState<Appariteur | null>(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const { Appariteur } = services;

  useEffect(() => {
    const fetchAppariteurs = async () => {
      try {
        setIsLoading(true);
        const response = await Appariteur.getAppariteurs();
        const { data } = response;
        if (data) {
          setAppariteurs(data);
          setFilteredAppariteurs(data);
        } else {
          setError("Aucun appariteur trouvé.");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des appariteurs:", error);
        setError("Une erreur est survenue lors de la récupération des données.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppariteurs();
  }, [Appariteur]);

  useEffect(() => {
    // Filtrer les appariteurs en fonction de la recherche
    if (!searchQuery.trim()) {
      setFilteredAppariteurs(appariteurs);
      return;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = appariteurs.filter(
      (app) =>
        (app.agentId?.matricule?.toLowerCase().includes(lowerCaseQuery) || 
        app.agentId?.nom?.toLowerCase().includes(lowerCaseQuery) ||
        app.agentId?.prenom?.toLowerCase().includes(lowerCaseQuery) ||
        app.agentId?.email?.toLowerCase().includes(lowerCaseQuery) ||
        app.agentId?.typeAgent?.toLowerCase().includes(lowerCaseQuery) ||
        app.anneeId?.slogan?.toLowerCase().includes(lowerCaseQuery) ||
        app.sectionId?.titre?.toLowerCase().includes(lowerCaseQuery))
    );
    setFilteredAppariteurs(filtered);
  }, [searchQuery, appariteurs]);

  const handleAppariteurSelect = async (appariteur: Appariteur) => {
    try {
      // Appel à l'API pour générer et envoyer l'OTP
      const otpResponse = await fetch(`/api/auth/generate-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          matricule: appariteur.agentId.matricule,
          email: appariteur.agentId.email 
        }),
      });
      
      const otpData = await otpResponse.json();
      
      if (otpResponse.ok) {
        setSelectedAppariteur(appariteur);
        setShowOtpModal(true);
      } else {
        setError(otpData.message || "Erreur lors de la génération de l'OTP");
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setSelectedAppariteur(null);
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex flex-wrap items-center">
        <div className="hidden w-full xl:block xl:w-1/2">
          <div className="py-17.5 px-26 text-center">
            <Link className="mb-5.5 inline-block" href="/">
              <Image
                className="hidden dark:block"
                src={inbtp}
                alt="Logo"
                width={176}
                height={32}
              />
              <Image
                className="dark:hidden"
                src={logo}
                alt="Logo"
                width={176}
                height={32}
              />
            </Link>
            
            <p className="2xl:px-20">
              Trouvez votre compte d'appariteur et connectez-vous à votre espace de travail
            </p>

            <span className="mt-15 inline-block">
              <Image
                src={gt1}
                alt="Illustration"
                width={500}
                height={350}
              />
            </span>
          </div>
        </div>

        <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l">
          <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
            <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
              Recherche de matricule
            </h2>

            {error && (
              <div className="mb-6 flex w-full items-center rounded-lg border border-red bg-[#FFF5F5] px-6 py-3 text-[#CD191C]">
                <span className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-red">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 5.625C9.31066 5.625 9.5625 5.87684 9.5625 6.1875V10.3125C9.5625 10.6232 9.31066 10.875 9 10.875C8.68934 10.875 8.4375 10.6232 8.4375 10.3125V6.1875C8.4375 5.87684 8.68934 5.625 9 5.625Z"
                      fill="white"
                    />
                    <path
                      d="M9.56445 12.8156C9.56445 12.5049 9.31266 12.2531 9.00199 12.2531H8.99824C8.68758 12.2531 8.43578 12.5049 8.43578 12.8156C8.43578 13.1262 8.68758 13.3781 8.99824 13.3781H9.00199C9.31266 13.3781 9.56445 13.1262 9.56445 12.8156Z"
                      fill="white"
                    />
                    <path
                      d="M9 1.5C4.85775 1.5 1.5 4.85775 1.5 9C1.5 13.1423 4.85775 16.5 9 16.5C13.1423 16.5 16.5 13.1423 16.5 9C16.5 4.85775 13.1423 1.5 9 1.5ZM9 15.375C5.55975 15.375 2.625 12.4403 2.625 9C2.625 5.55975 5.55975 2.625 9 2.625C12.4403 2.625 15.375 5.55975 15.375 9C15.375 12.4403 12.4403 15.375 9 15.375Z"
                      fill="white"
                    />
                  </svg>
                </span>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Barre de recherche */}
            <div className="mb-6">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Recherche
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom, prénom, matricule, département, filière..."
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
                <span className="absolute right-4 top-4">
                  <svg
                    className="fill-current"
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20.8 19.6L16.05 14.85C17.35 13.3 18.15 11.35 18.15 9.2C18.15 4.6 14.35 0.799999 9.75 0.799999C5.15 0.799999 1.35 4.6 1.35 9.2C1.35 13.8 5.15 17.6 9.75 17.6C11.7 17.6 13.5 17 14.95 15.95L19.75 20.75C20 21 20.35 21.1 20.7 20.95C21.05 20.8 21.25 20.45 21.25 20.1C21.35 19.85 21.15 19.65 20.8 19.6ZM9.75 16.1C6 16.1 2.9 13 2.9 9.2C2.9 5.4 5.95 2.3 9.75 2.3C13.55 2.3 16.6 5.4 16.6 9.2C16.6 13 13.55 16.1 9.75 16.1Z"
                      fill=""
                    />
                  </svg>
                </span>
              </div>
            </div>

            {/* Cartes des appariteurs */}
            <div className="max-h-[500px] overflow-auto pr-2">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="h-8 w-8 border-4 border-current border-r-transparent rounded-full animate-spin"></div>
                  <span className="ml-3">Chargement...</span>
                </div>
              ) : filteredAppariteurs.length === 0 ? (
                <div className="flex justify-center items-center py-12 text-center">
                  <div>
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun appariteur trouvé</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Essayez d'autres termes de recherche.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5">
                  {filteredAppariteurs.map((appariteur) => (
                    <AppariteurCard
                      key={appariteur._id}
                      appariteur={appariteur}
                      onSelect={handleAppariteurSelect}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 text-center">
              <p>
                Retour à la{" "}
                <Link href="/auth/sign-in" className="text-primary">
                  connexion
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal OTP */}
      {showOtpModal && selectedAppariteur && (
        <OtpVerification appariteur={selectedAppariteur} onClose={closeOtpModal} />
      )}
    </div>
  );
}