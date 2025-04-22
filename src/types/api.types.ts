export interface Minerval {
    _id: string;
    promotionId: {
        _id: string;
        niveau: string;
        mention: string;
        orientation: string;
    };
    anneeId: {
        _id: string;
        slogan: string;
    };
    montant: number;
    devise: string;
    tranches: any[]; // Remplacez par le type approprié si nécessaire
    paiements: any[]; // Remplacez par le type approprié si nécessaire
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface MinervalResponse {
    success: boolean;
    count: number;
    data: Minerval[];
}

export interface Etudiant {
    _id: string;
    infoPerso: {
        nom: string;
        postNom: string;
        preNom: string;
        sexe: string;
        dateNaissance: string;
        adresse: string;
    };
    infoSec: {
        etudiantId: string;
        email: string;
        telephone: string;
        optId: string;
    };
    infoScol: {
        section: string;
        option: string;
        pourcentage: number;
    };
    infoAcad: {
        promotionId: {
            _id: string;
            sectionId: string;
            niveau: string;
            mention: string;
            orientation: string;
            statut: string;
            unites: Unite[];
            createdAt: string;
            updatedAt: string;
        };
        anneeId: {
            _id: string;
            slogan: string;
        };
        actifs: {
            travaux: any[]; // Remplacez par le type approprié si nécessaire
            enrollments: any[]; // Remplacez par le type approprié si nécessaire
            bulletins: any[]; // Remplacez par le type approprié si nécessaire
        };
        _id: string;
    }[];
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface EtudiantResponse {
    success: boolean;
    count: number;
    data: Etudiant[];
}


export interface Inscrits {
    promotionId: string;
    inscrits: {
        _id: string;
        nom: string;
        prenom: string;
        email: string;
        matricule: string;
        sexe: string;
        dateNaissance: string;
        section: string;
        option: string;
        pourcentage: number;
        optId: string;
    }[]
}

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
