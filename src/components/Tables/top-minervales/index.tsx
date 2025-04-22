"use client";

import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "./skeleton";
import useUserStore from "@/store/useUserStore";
import { Minerval } from "@/types/api.types";

// Créons un composant Badge simple puisque celui-ci semble manquer
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      className
    )}>
      {children}
    </span>
  );
}

export function TopMinervales() {
  const [isLoading, setIsLoading] = useState(true);
  const [minervales, setMinervales] = useState<Minerval[]>([]);
  const { activeAppariteur, minervals : frais } = useUserStore();

  useEffect(() => {
    const fetchMinervales = async () => {
      console.log("Fetching minervales...", frais);
    };

    fetchMinervales();
  }, []);

  if (isLoading) {
    return <Skeleton />;
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-7.5 pb-5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:pb-7.5">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Minervales
        </h2>
        
        <a 
          href="/minervales"
          className="inline-flex items-center rounded-md border border-stroke px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
        >
          Voir tout
          <ArrowRightIcon className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>

      <div className="mb-3 border-b-2 border-stroke px-7.5 dark:border-strokedark">
        <div className="flex -mx-4">
          <div className="w-6/12 px-4 py-3">
            <h5 className="text-sm font-medium text-body-color">
              Promotion
            </h5>
          </div>
          <div className="w-2/12 px-4 py-3">
            <h5 className="text-sm font-medium text-body-color">
              Montant
            </h5>
          </div>
          <div className="w-2/12 px-4 py-3">
            <h5 className="text-sm font-medium text-body-color">
              Tranches
            </h5>
          </div>
          <div className="w-2/12 px-4 py-3 text-center">
            <h5 className="text-sm font-medium text-body-color">
              Statut
            </h5>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {frais.length > 0 ? (
          frais.map((minerval) => (
            <MinervalRow key={minerval._id} minerval={minerval} />
          ))
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-center text-body-color">
              Aucune minervale trouvée
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface MinervalRowProps {
  minerval: Minerval;
}

function MinervalRow({ minerval }: MinervalRowProps) {
  const getStatusBadge = (nombreTranches: number, nombrePaiements: number) => {
    if (nombrePaiements >= nombreTranches) {
      return <Badge className="bg-green-100 text-green-800">Complété</Badge>;
    } else if (nombrePaiements > 0) {
      return <Badge className="bg-yellow-100 text-yellow-800">Partiel</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Non payé</Badge>;
    }
  };

  return (
    <div className="flex items-center border-b border-stroke px-7.5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4">
      <div className="w-6/12 px-4">
        <div className="flex items-center">
          <div>
            <h5 className="font-medium text-dark dark:text-white">
              {minerval.promotionId?.niveau} {minerval.promotionId?.mention} {minerval.promotionId?.orientation || ""}
            </h5>
            <p className="text-sm text-body-color">
              {minerval.anneeId?.slogan}
            </p>
          </div>
        </div>
      </div>
      
      <div className="w-2/12 px-4">
        <p className="font-medium text-primary">
          {minerval.montant} {minerval.devise}
        </p>
      </div>
      
      <div className="w-2/12 px-4">
        <p className="text-dark dark:text-white">
          {minerval.tranches?.length || 0} tranches
        </p>
        <p className="text-xs text-body-color">
          {minerval.paiements?.length || 0} paiements
        </p>
      </div>
      
      <div className="w-2/12 px-4 text-center">
        {getStatusBadge(
          minerval.tranches?.length || 0,
          minerval.paiements?.length || 0
        )}
      </div>
    </div>
  );
}