import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Appariteur, Promotion, PromotionResponse } from '@/types/api.types'
import { Agent } from '@/types/api.types'
import services from '@/services'

const { Appariteur: AppariteurService } = services

interface UserState {
  token: string | null
  activeAppariteur: Appariteur | null
  agent: Agent | null
  promotions: Promotion[] | null
  promotion: Promotion | null
  setPromotion: (promotion: Promotion) => void
  setAgent: (agent: Agent) => void
  setToken: (token: string) => void
  makeTokenToCookie: (token: string) => void
  setActiveAppariteur: (appariteur: Appariteur) => void
  fetchPromotions: (sectionId: string) => Promise<PromotionResponse>
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
        const response = await AppariteurService.getPromotionsBySectionId(sectionId)
        if (response) {
          const { data } = response
          set({ promotions: data })
          
          return response
        } else {
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