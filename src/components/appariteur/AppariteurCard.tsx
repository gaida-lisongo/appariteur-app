import React from 'react';
import { Appariteur } from '@/types/api.types';
import Image from 'next/image';
import { inbtp } from '@/assets/logo'

interface AppariteurCardProps {
  appariteur: Appariteur;
  onSelect: (appariteur: Appariteur) => void;
}

const AppariteurCard: React.FC<AppariteurCardProps> = ({ appariteur, onSelect }) => {
  // Récupérer les initiales de l'agent pour l'avatar
  const getInitials = () => {
    if (appariteur.agentId?.nom && appariteur.agentId?.prenom) {
      return `${appariteur.agentId.prenom[0]}${appariteur.agentId.nom[0]}`;
    }
    return "AA";
  };

  // Formater la date de création au format local
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark hover:shadow-lg transition-all h-full flex flex-col">
      {/* Partie supérieure: Année académique et Section */}
      <div className="p-5 border-b border-stroke dark:border-strokedark bg-gray-1 dark:bg-meta-4 rounded-t-sm">
        <div className="flex justify-between items-start mb-3">
          <div>
            {appariteur.anneeId?.slogan && (
              <div className="flex items-center mb-2">
                <svg className="w-4 h-4 text-primary mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
                </svg>
                <h4 className="text-base font-semibold text-black dark:text-white">
                  {appariteur.anneeId.slogan}
                </h4>
              </div>
            )}
            
            {appariteur.sectionId?.titre && (
              <div className="flex items-center">
                <svg className="w-4 h-4 text-success mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.532.848L10 15.343l-4.468 2.505A1 1 0 014 17V4zm2 0v11.586l3.468-1.945a1 1 0 01.98 0L14 15.586V4H6z" clipRule="evenodd"></path>
                </svg>
                <span className="text-sm font-medium text-black dark:text-white">
                  {appariteur.sectionId.titre}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            {appariteur.balance > 0 ? (
              <span className="inline-flex px-2.5 py-0.5 rounded-full bg-success bg-opacity-10 text-xs font-medium text-success">
                Solde: {appariteur.balance.toFixed(2)}
              </span>
            ) : (
              <span className="inline-flex px-2.5 py-0.5 rounded-full bg-danger bg-opacity-10 text-xs font-medium text-danger">
                Solde: {appariteur.balance.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs mt-3 text-body-color dark:text-gray-400">
          <span>Inscriptions: {appariteur.inscriptions?.length || 0}</span>
          <span>Créé le {formatDate(appariteur.createdAt)}</span>
        </div>
      </div>
      
      {/* Partie inférieure: Informations de l'agent */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-4 flex items-center gap-3">
          {appariteur.agentId?.avatar ? (
            <Image
              src={appariteur.agentId.avatar || inbtp.src}
              alt="Avatar"
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-lg font-bold text-primary">
              {getInitials()}
            </div>
          )}
          <div>
            <h5 className="text-base font-medium text-black dark:text-white">
              {appariteur.agentId?.prenom} {appariteur.agentId?.nom}
            </h5>
            <p className="text-sm text-body-color">
              {appariteur.agentId?.email}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-body-color dark:text-gray-400">Matricule:</span>
            <span className="font-medium text-black dark:text-white">{appariteur.agentId?.matricule}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-body-color dark:text-gray-400">Type d'agent:</span>
            <span className="font-medium text-black dark:text-white">{appariteur.agentId?.typeAgent}</span>
          </div>
        </div>
        
        <div className="mt-auto">
          <button
            onClick={() => onSelect(appariteur)}
            className="w-full inline-flex items-center justify-center rounded-md border border-primary py-2.5 px-4 text-center font-medium text-primary hover:bg-primary hover:text-white"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            Sélectionner pour connexion
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppariteurCard;