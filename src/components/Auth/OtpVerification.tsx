"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Appariteur } from "@/types/api.types";

interface OtpVerificationProps {
  appariteur: Appariteur;
  onClose: () => void;
}

export default function OtpVerification({ appariteur, onClose }: OtpVerificationProps) {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");

    if (!otp.trim()) {
      setOtpError("Veuillez entrer le code OTP");
      return;
    }

    try {
      setVerifyingOtp(true);
      
      // Appel à l'API pour vérifier l'OTP
      const response = await fetch(`/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          matricule: appariteur.agentId.matricule,
          otp 
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Si l'OTP est valide, on reçoit un token
        import('@/utils/auth').then((auth) => {
          auth.login(data.token);
          // Stocker l'appariteur actif
          import('@/store/useUserStore').then((userStore) => {
            userStore.default.getState().setActiveAppariteur(appariteur);
            router.push('/dashboard');
          });
        });
      } else {
        setOtpError(data.message || "Code OTP invalide");
      }
    } catch (err) {
      console.error("Erreur lors de la vérification de l'OTP:", err);
      setOtpError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-meta-4 dark:hover:text-white"
        >
          <svg
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        
        <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
          Vérification par code OTP
        </h3>
        
        <p className="mb-6 text-sm text-body-color">
          Bonjour <span className="font-bold">{appariteur.agentId.prenom} {appariteur.agentId.nom}</span>, 
          <br />Un code de vérification a été envoyé à l'adresse {appariteur.agentId.email.replace(/^(.{3})(.*)(@.*)$/, "$1***$3")}.
          <br />Veuillez entrer ce code ci-dessous.
        </p>
        
        {otpError && (
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
            <p className="text-sm font-medium">{otpError}</p>
          </div>
        )}
        
        <form onSubmit={handleVerifyOtp}>
          <div className="mb-6">
            <label className="mb-2.5 block font-medium text-black dark:text-white">
              Code OTP
            </label>
            <div className="relative">
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Entrez le code à 6 chiffres"
                maxLength={6}
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                required
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
              disabled={verifyingOtp}
              className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90 disabled:bg-opacity-70"
            >
              {verifyingOtp ? "Vérification..." : "Vérifier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}