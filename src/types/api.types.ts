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
