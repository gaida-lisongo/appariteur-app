import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Appariteur } from '@/types/api.types'
import { Agent } from '@/types/api.types'

interface UserState {
  token: string | null
  activeAppariteur: Appariteur | null
  agent: Agent | null
  setAgent: (agent: Agent) => void
  setToken: (token: string) => void
  makeTokenToCookie: (token: string) => void
  setActiveAppariteur: (appariteur: Appariteur) => void
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
      setAgent: (agent) => set({ agent }),
      setToken: (token) => set({ token }),
      makeTokenToCookie: (token) => {
        // Set the token in a cookie or local storage if needed
        document.cookie = `user-token=${token}; path=/; max-age=604800` // 7 days
        set({ token })
      },
      setActiveAppariteur: (appariteur) => set({ activeAppariteur: appariteur }),
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