import { Appariteur, AppariteurResponse, EtudiantResponse, MinervalResponse, PromotionResponse } from "@/types/api.types";

class AppariteurService {
    baseUrl: string;
    headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;        
    }

    async getAppariteurs() : Promise<AppariteurResponse> {
        try {
            const request = await fetch(`${this.baseUrl}/appariteurs`);
            if (!request.ok) {
                throw new Error(`HTTP error! status: ${request.status}`);
            }
            const appariteurs = await request.json();
            return appariteurs;
        } catch (error) {
            console.error('Error fetching appariteurs:', error);
            throw error; // Rethrow the error to be handled by the caller            
        }
    }

    async generateOtp(appariteur: Appariteur) : Promise<any> {
        try {
            const request = await fetch(`${this.baseUrl}/agents/login`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    matricule: appariteur.agentId.matricule
                })
            })

            if (!request.ok) {
                throw new Error(`HTTP error! status: ${request.status}`);
            }

            const response = await request.json();
            if (response.success) {
                return response;
            } else {
                throw new Error(response.message || 'Failed to generate OTP');
            }
        } catch (error) {
            console.error('Error generating OTP:', error);
            throw error; // Rethrow the error to be handled by the caller            
            
        }
    }

    async verifyOtp(id: string, otp: string) : Promise<any> {
        try {
            const request = await fetch(`${this.baseUrl}/agents/verify`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    id,
                    otp
                })
            })

            if (!request.ok) {
                throw new Error(`HTTP error! status: ${request.status}`);
            }

            const response = await request.json();
            if (response.success) {
                return response;
            } else {
                throw new Error(response.message || 'Failed to verify OTP');
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            throw error; // Rethrow the error to be handled by the caller            
        }
    }

    async getPromotionsBySectionId(sectionId: string) : Promise<PromotionResponse> {
        try {
            const request = await fetch(`${this.baseUrl}/promotions/section/${sectionId}`);
            if (!request.ok) {
                throw new Error(`HTTP error! status: ${request.status}`);
            }
            const response = await request.json();
            return response;
        } catch (error) {
            console.error('Error fetching promotions:', error);
            throw error; // Rethrow the error to be handled by the caller            
        }
    }

    async getAllPromotions() : Promise<PromotionResponse> {
        try {
            const request = await fetch(`${this.baseUrl}/promotions`);
            if (!request.ok) {
                throw new Error(`HTTP error! status: ${request.status}`);
            }
            const response = await request.json();
            return response;
        } catch (error) {
            console.error('Error fetching promotions:', error);
            throw error; // Rethrow the error to be handled by the caller
        }
    }

    async getEtudiantsByPromotionId(promotionId: string) : Promise<EtudiantResponse> {
        try {
            const request = await fetch(`${this.baseUrl}/etudiants/find`,
                {
                    method: 'POST',
                    headers: this.headers,
                    body: JSON.stringify({
                        promotionId
                    })
                }
            );
            if (!request.ok) {
                throw new Error(`HTTP error! status: ${request.status}`);
            }
            const response = await request.json();
            return response;
        } catch (error) {
            console.error('Error fetching etudiants:', error);
            throw error; // Rethrow the error to be handled by the caller            
        }
    }

    async getAllEtudiants() : Promise<EtudiantResponse> {
        try {
            const request = await fetch(`${this.baseUrl}/etudiants/find`,
                {
                    method: 'POST',
                    headers: this.headers
                }
            );
            if (!request.ok) {
                throw new Error(`HTTP error! status: ${request.status}`);
            }
            const response = await request.json();
            return response;
        } catch (error) {
            console.error('Error fetching etudiants:', error);
            throw error; // Rethrow the error to be handled by the caller            
        }
    }

    async getMinervalByPromotionId(promotionId: string) : Promise<MinervalResponse> {
        try {
            const request = await fetch(`${this.baseUrl}/minervals/promotion/${promotionId}`);
            
            // if (!request.ok) {
            //     throw new Error(`HTTP error! status: ${request.status}`);
            // }
            const response = await request.json();
            console.log('Minerval response:', response);
            return response;
        } catch (error) {
            console.error('Error fetching minerval:', error);
            throw error; // Rethrow the error to be handled by the caller            
        }
    }

    async createMinerval({promotionId, anneeId, montant, devise = "CDF", tranches=[]}: {promotionId: string, anneeId: string, montant: number, devise?: string, tranches?: Array<{designation: string, montant: number, date_fin: Date}>}) : Promise<any> {
        
        try {
            const request = await fetch(`${this.baseUrl}/minervals`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    promotionId,
                    anneeId,
                    montant,
                    devise,
                    tranches
                })
            });

            console.log('Create minerval request:', request.ok)
            if (!request.ok) {
                throw new Error(`HTTP error! status: ${request.status}`);
            }
            const response = await request.json();
            return response;
        } catch (error) {
            console.error('Error creating minerval:', error);
            throw error; // Rethrow the error to be handled by the caller            
        }
    }

    async createTranche({id, data}: {id: string, data: {designation: string, montant: number, date_fin: Date}}) : Promise<any> {
        try {
            const request = await fetch(`${this.baseUrl}/minervals/${id}/tranches`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(data)
            });
            if (!request.ok) {
                throw new Error(`HTTP error! status: ${request.status}`);
            }
            const response = await request.json();
            return response;
        } catch (error) {
            console.error('Error creating tranche:', error);
            throw error; // Rethrow the error to be handled by the caller            
        }
    }

    async deleteTranche({id, trancheId}: {id: string, trancheId: string}) : Promise<any> {
        try {
            const request = await fetch(`${this.baseUrl}/minervals/${id}/tranches/${trancheId}`, {
                method: 'DELETE',
                headers: this.headers
            });
            if (!request.ok) {
                throw new Error(`HTTP error! status: ${request.status}`);
            }
            const response = await request.json();
            return response;
        } catch (error) {
            console.error('Error deleting tranche:', error);
            throw error; // Rethrow the error to be handled by the caller            
        }
    }
    
    async createEtudiant({data}: {data: any}) : Promise<any> {
        console.log('Creating etudiant with data:', data);
        try {
            const request = await fetch(`${this.baseUrl}/etudiants`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(data)
            });
            if (!request.ok) {
                throw new Error(`HTTP error! status: ${request?.message}`);
            }
            const response = await request.json();
            
            return response;
        } catch (error) {
            console.error('Error creating etudiant:', error);
            throw error; // Rethrow the error to be handled by the caller            
        }
    }

    async deleteEtudiant({id}: {id: string}) : Promise<any> {
        try {
            const request = await fetch(`${this.baseUrl}/etudiants/${id}`, {
                method: 'DELETE',
                headers: this.headers
            });
            if (!request.ok) {
                throw new Error(`HTTP error! status: ${request.status}`);
            }
            const response = await request.json();
            return response;
        } catch (error) {
            console.error('Error deleting etudiant:', error);
            throw error; // Rethrow the error to be handled by the caller            
        }
    }
}

export default AppariteurService