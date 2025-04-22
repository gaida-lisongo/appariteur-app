import Image from "next/image";
import { Users, Calculator, ChevronDown } from "lucide-react";

type PromotionBannerProps = {
  promotion: {
    niveau: string;
    mention: string;
    orientation?: string;
    nombreInscrits?: number;
  };
  backgroundImage?: any; // Pour l'image de fond
  showFinancePanel: boolean;
  setShowFinancePanel: (show: boolean) => void;
};

const PromotionBanner = ({
  promotion,
  backgroundImage,
  showFinancePanel,
  setShowFinancePanel,
}: PromotionBannerProps) => {   
  return (
    <div className="relative h-80 bg-gradient-to-r from-primary/80 to-primary">
      {/* Image de couverture (facultative) */}
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt="Bannière promotion"
          fill
          className="object-cover opacity-20"
        />
      )}

      <div className="absolute inset-0 bg-black/10"></div>

      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col md:flex-row justify-between items-start md:items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {promotion.niveau} {promotion.mention}
          </h1>
          {promotion.orientation && (
            <h2 className="text-xl text-white/90 mt-1">{promotion.orientation}</h2>
          )}
          <div className="flex items-center mt-2">
            <Users className="h-5 w-5 text-white/80 mr-2" />
            <span className="text-white/90 font-medium">
              {promotion.nombreInscrits || 0} étudiants
            </span>
          </div>
        </div>

        <div className="mt-4 md:mt-0">
          <button
            onClick={() => setShowFinancePanel(!showFinancePanel)}
            className="flex items-center gap-2 rounded-md bg-white py-2 px-4 font-medium text-primary transition hover:bg-opacity-90"
          >
            <Calculator className="h-5 w-5" />
            Frais académiques
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                showFinancePanel ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionBanner;