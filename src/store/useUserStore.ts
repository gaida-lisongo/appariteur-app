import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Appariteur } from '@/types/api.types'

interface UserState {
  token: string | null
  activeAppariteur: Appariteur | null
  setToken: (token: string) => void
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
      setToken: (token) => set({ token }),
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