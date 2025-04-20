
export interface Agent {
    id: string;
    nom: string;
    prenom: string;
    postnom: string;
    email: string;
    typeAgent: string;
    avatar: string;
    telephone: string;
    matricule: string;
    dateNaissance: string;
    lieuNaissance: string;
    nationalite: string;
    adresse: string;
}

export interface Unite {
    code: string;
    designation: string;
    categorie: string;
    matieres: any[]; // Remplacez par le type approprié si nécessaire
    _id: string;
}

export interface Promotion {
    _id: string;
    sectionId: string;
    niveau: string;
    mention: string;
    orientation: string;
    statut: string;
    unites: Unite[];
    createdAt: string;
    updatedAt: string;
}

export interface PromotionResponse {
    success: boolean;
    count: number;
    data: Promotion[];
}

export interface Appariteur {
    _id: string;
    agentId: {
        _id: string;
        nom: string;
        prenom: string;
        email: string;
        matricule: string;
        typeAgent: string;
        avatar: string;
    };
    anneeId: {
        _id: string;
        slogan: string;
    };
    sectionId: {
        _id: string;
        titre: string;
    };
    balance: number;
    inscriptions: any[]; // Remplacez par le type approprié si nécessaire
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface AppariteurResponse {
    success: boolean;
    count: number;
    data: Appariteur[];
}
