import { Appariteur, AppariteurResponse, PromotionResponse } from "@/types/api.types";

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
}

export default AppariteurService