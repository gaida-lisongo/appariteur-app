import useUserStore from '@/store/useUserStore'
import Cookies from 'js-cookie'

// Durée de validité du cookie (7 jours par défaut)
const TOKEN_EXPIRY = 7

export const login = (token: string) => {
  // Mettre à jour le store
  useUserStore.getState().setToken(token)
  
  // Définir le cookie pour que le middleware puisse y accéder
  Cookies.set('user-token', token, { expires: TOKEN_EXPIRY })
}

export const logout = () => {
  // Nettoyer le store
  useUserStore.getState().clearToken()
  
  // Supprimer le cookie
  Cookies.remove('user-token')
}

export const isAuthenticated = () => {
  return !!useUserStore.getState().token
}