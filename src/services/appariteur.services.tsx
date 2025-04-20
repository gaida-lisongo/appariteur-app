import { AppariteurResponse } from "@/types/api.types";

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
}

export default AppariteurService