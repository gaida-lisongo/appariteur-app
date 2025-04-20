"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useUserStore from "@/store/useUserStore";
import { inbtp } from "@/assets/logo";
import { gt1 } from "@/assets/banner";
import services from "@/services";

export default function SignIn() {
  const router = useRouter();
  const { activeAppariteur, token, setToken, setAgent, makeTokenToCookie } = useUserStore();
  const [matricule, setMatricule] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { Appariteur } = services;
  // Si activeAppariteur existe, pré-remplir le champ matricule
  useEffect(() => {
    if (activeAppariteur?.agentId?.matricule) {
      setMatricule(activeAppariteur.agentId.matricule);
    }

    // Si activeAppariteur n'existe pas, rediriger vers la page de sélection d'appariteur
    if (!activeAppariteur) {
      router.push("/apparitorat");
    } else {
      console.log("Appariteur actif:", activeAppariteur);
      const getOTP = async () => {
        try {
          const response = await Appariteur.generateOtp(activeAppariteur);

          console.log("Réponse de la génération de l'OTP:", response);
          
        } catch (error) {
          console.error("Erreur lors de la récupération de l'OTP:", error);
          setError("Une erreur est survenue lors de la récupération de l'OTP.");
          
        }

      }

      getOTP();
    }
  }, [activeAppariteur]);

  // Redirection si déjà connecté
  useEffect(() => {
    if (token) {
      router.push("/dashboard");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!matricule.trim()) {
      setError("Le matricule est requis");
      return;
    }

    if (!otp.trim()) {
      setError("Le code OTP est requis");
      return;
    }

    try {
      setIsLoading(true);

      if (!activeAppariteur?.agentId?._id) {
        throw new Error("ID de l'appariteur non défini");
      }
      
      const resp = await Appariteur.verifyOtp(activeAppariteur.agentId._id, otp);

      const { data } = resp;

      if (data.success && data.token) {
        // Stocker le token dans le store
        setToken(data.token);
        setAgent(data.agent);
        makeTokenToCookie(data.token);

        // Rediriger vers le tableau de bord
        router.push("/");
      } else {
        setError(data.message || "Échec de l'authentification. Veuillez vérifier vos identifiants.");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
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
                src={inbtp}
                alt="Logo"
                width={176}
                height={32}
              />
            </Link>

            <p className="2xl:px-20">
              Connectez-vous à votre espace appariteur pour gérer vos activités
            </p>

            <span className="mt-15 inline-block">
              <Image src={gt1} alt="Illustration" width={500} height={350} />
            </span>
          </div>
        </div>

        <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l">
          <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
            <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
              Connexion
            </h2>

            {activeAppariteur && (
              <div className="mb-6 p-4 bg-primary bg-opacity-5 rounded-lg border border-primary border-opacity-20">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-lg font-bold text-primary">
                    {activeAppariteur.agentId.prenom[0]}
                    {activeAppariteur.agentId.nom[0]}
                  </div>
                  <div>
                    <h5 className="text-base font-medium text-black dark:text-white">
                      {activeAppariteur.agentId.prenom} {activeAppariteur.agentId.nom}
                    </h5>
                    <p className="text-sm text-body-color">
                      Matricule: {activeAppariteur.agentId.matricule}
                    </p>
                  </div>
                </div>
              </div>
            )}

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

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Matricule
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={matricule}
                    onChange={(e) => setMatricule(e.target.value)}
                    placeholder="Entrez votre matricule"
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    readOnly={!!activeAppariteur}
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
                      <g opacity="0.5">
                        <path
                          d="M11.0001 9.16667C13.5917 9.16667 15.6667 7.09167 15.6667 4.49999C15.6667 1.90833 13.5917 -0.166672 11.0001 -0.166672C8.40841 -0.166672 6.33341 1.90833 6.33341 4.49999C6.33341 7.09167 8.40841 9.16667 11.0001 9.16667ZM11.0001 1.49999C12.6417 1.49999 14.0001 2.85833 14.0001 4.49999C14.0001 6.14167 12.6417 7.49999 11.0001 7.49999C9.35841 7.49999 8.00008 6.14167 8.00008 4.49999C8.00008 2.85833 9.35841 1.49999 11.0001 1.49999Z"
                          fill=""
                        />
                        <path
                          d="M11.0001 11.6667C6.40008 11.6667 2.66675 15.4 2.66675 20C2.66675 20.4583 3.04175 20.8333 3.50008 20.8333H18.5001C18.9584 20.8333 19.3334 20.4583 19.3334 20C19.3334 15.4 15.6001 11.6667 11.0001 11.6667ZM4.42508 19.1667C4.88341 15.8917 7.67508 13.3333 11.0001 13.3333C14.3251 13.3333 17.1167 15.8917 17.5751 19.1667H4.42508Z"
                          fill=""
                        />
                      </g>
                    </svg>
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Code OTP
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Entrez le code à 6 chiffres"
                    maxLength={6}
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
                      <g opacity="0.5">
                        <path
                          d="M16.1547 6.80626V5.91251C16.1547 3.16251 14.0922 0.825009 11.4797 0.618759C10.0359 0.481259 8.59219 0.996884 7.52656 1.95938C6.46094 2.92188 5.84219 4.29688 5.84219 5.70626V6.80626C3.84844 7.18438 2.33594 8.93751 2.33594 11.0688V17.2906C2.33594 19.5594 4.19219 21.3813 6.42656 21.3813H15.5016C17.7703 21.3813 19.6266 19.525 19.6266 17.2563V11C19.6609 8.93751 18.1484 7.21876 16.1547 6.80626ZM8.55781 3.09376C9.31406 2.40626 10.3109 2.06251 11.3422 2.16563C13.1641 2.33751 14.6078 3.98751 14.6078 5.91251V6.70313H7.38906V5.67188C7.38906 4.70938 7.80156 3.78126 8.55781 3.09376ZM18.1141 17.2906C18.1141 18.7 16.9453 19.8688 15.5359 19.8688H6.46094C5.05156 19.8688 3.91719 18.7344 3.91719 17.325V11.0688C3.91719 9.52189 5.15469 8.28438 6.70156 8.28438H15.2953C16.8422 8.28438 18.1141 9.52188 18.1141 11V17.2906Z"
                          fill=""
                        />
                        <path
                          d="M10.9977 11.8594C10.5852 11.8594 10.207 12.2031 10.207 12.65V16.2594C10.207 16.6719 10.5508 17.05 10.9977 17.05C11.4102 17.05 11.7883 16.7063 11.7883 16.2594V12.6156C11.7883 12.2031 11.4102 11.8594 10.9977 11.8594Z"
                          fill=""
                        />
                      </g>
                    </svg>
                  </span>
                </div>
              </div>

              <div className="mb-5">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90 disabled:bg-opacity-70"
                >
                  {isLoading ? "Connexion en cours..." : "Se connecter"}
                </button>
              </div>

              <div className="mt-6 text-center">
                <p>
                  Vous n'avez pas de matricule?{" "}
                  <Link href="/apparitorat" className="text-primary">
                    Sélectionner un apparitorat
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
