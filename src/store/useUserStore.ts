import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Appariteur, Etudiant, Inscrits, Minerval, Promotion, PromotionResponse } from '@/types/api.types'
import { Agent } from '@/types/api.types'
import services from '@/services'
import { se } from 'date-fns/locale'

const { Appariteur: AppariteurService } = services
interface UserState {
  token: string | null
  activeAppariteur: Appariteur | null
  agent: Agent | null
  promotions: Promotion[] | null
  promotion: Promotion | null
  etudiants: Inscrits[] | null
  minervals: Minerval[] | null
  etudiant: Etudiant | null
  isLoading: boolean
  setLoading: (isLoading: boolean) => void
  setPromotion: (promotion: Promotion) => void
  setAgent: (agent: Agent) => void
  setToken: (token: string) => void
  setEtudiants: (etudiants: Inscrits[]) => void
  fetchEtudiant: (etudiantId: string) => Promise<Etudiant | null>
  setMinervals: (minervals: Minerval[]) => void
  setEtudiant: (etudiant: Etudiant) => void
  fetchMinervals: (promotionId: string) => Promise<Minerval[]>
  fetchEtudiants: (promotionId: string) => Promise<Inscrits[]>
  makeTokenToCookie: (token: string) => void
  setActiveAppariteur: (appariteur: Appariteur) => void
  fetchPromotions: (sectionId: string) => Promise<PromotionResponse | null>
  clearToken: () => void
  clearActiveAppariteur: () => void
  clear: () => void
}

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      activeAppariteur: null,
      agent: null,
      promotions: null,
      promotion: null,
      etudiants: null,
      minervals: null,
      isLoading: false,
      etudiant: null,
      setEtudiant: (etudiant) => set({ etudiant }),
      setLoading: (isLoading) => set({ isLoading }),
      setEtudiants: (etudiants) => set({ etudiants }),
      setMinervals: (minervals) => set({ minervals }),
      fetchEtudiant: async (etudiantId) => {
        const response = await AppariteurService.getEtudiantById({id: etudiantId})
        set({ isLoading: true })
        if (response.success) {
          const { data } = response
          set({ etudiant: data, isLoading: false })
          return data
        } else {
          set({ isLoading: false })
          return null
        }
      },
      fetchMinervals: async (promotionId) => {
            const response = await AppariteurService.getMinervalByPromotionId(promotionId)
            set({ isLoading: true })
            if (response.success) {
                const { data } = response;
                // get anneeId of activeAppariteur
                const activeAppariteur = useUserStore.getState().activeAppariteur
                const anneeId = activeAppariteur?.anneeId._id
                const currentMinervals = data.filter((item) => item.anneeId._id === anneeId)
                
                if (currentMinervals.length === 0) {
                    set({ isLoading: false })
                    return []
                }
                
                // set the minervals in the store
                set(
                    (state) => {
                        const existingMinervals = state.minervals || []
                        const updatedMinervals = existingMinervals.filter((item) => item?._id !== promotionId)
                        return { minervals: [...updatedMinervals, ...data] }
                    }
                )
                set({ isLoading: false })
                return data
            } else {
                set({ isLoading: false })
                return []
            }
      },
      fetchEtudiants: async (promotionId) => {
        const response = await AppariteurService.getEtudiantsByPromotionId(promotionId)
        set({ isLoading: true })
        if (response.success) {
            const { data } = response;
            let inscrits = {
                promotionId: promotionId,
                inscrits: data.map((etudiant) => ({
                    _id: etudiant._id,
                    nom: etudiant.infoPerso.nom,
                    prenom: etudiant.infoPerso.preNom,
                    email: etudiant.infoSec.email,                    
                    matricule: etudiant.infoSec.etudiantId,
                    telephone: etudiant.infoSec.telephone,
                    adresse: etudiant.infoPerso.adresse,
                    lieuNaissance: etudiant.infoPerso.lieuNaissance,
                    nationalite: etudiant.infoPerso.nationalite,
                    sexe: etudiant.infoPerso.sexe,
                    dateNaissance: etudiant.infoPerso.dateNaissance,
                    section: etudiant.infoScol.section,
                    option: etudiant.infoScol.option,
                    pourcentage: etudiant.infoScol.pourcentage,
                    optId: etudiant.infoSec.optId,
                }))
            }   

            set((state) => {
                const existingEtudiants = state.etudiants || []
                const updatedEtudiants = existingEtudiants.filter((item) => item.promotionId !== promotionId)
                return { etudiants: [...updatedEtudiants, inscrits] }
            })

            set({ isLoading: false })
            return [inscrits]
        } else {
          set({ isLoading: false })
          return []
        }
      },
      setPromotion: (promotion) => set({ promotion }),
      setAgent: (agent) => set({ agent }),
      setToken: (token) => set({ token }),
      makeTokenToCookie: (token) => {
        // Set the token in a cookie or local storage if needed
        document.cookie = `user-token=${token}; path=/; max-age=604800` // 7 days
        set({ token })
      },
      setActiveAppariteur: (appariteur) => set({ activeAppariteur: appariteur }),
      fetchPromotions: async (sectionId) => {
        set({ isLoading: true })
        const response = await AppariteurService.getPromotionsBySectionId(sectionId)
        if (response) {
          const { data } = response
          set({ promotions: data })
          set({ isLoading: false })
          return response
        } else {
          set({ isLoading: false })
          throw new Error('Failed to fetch promotions')
          
        }
      },
      clearToken: () => set({ token: null }),
      clearActiveAppariteur: () => set({ activeAppariteur: null }),
      clear: () => set({ token: null, activeAppariteur: null }),
    }),
    {
      name: 'user-storage', // nom unique pour le stockage
      storage: createJSONStorage(() => localStorage), // utilisation du localStorage
    }
  )
)

export default useUserStore