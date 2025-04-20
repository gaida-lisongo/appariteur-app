import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Ce middleware ne peut pas directement accéder au store Zustand car il s'exécute
// côté serveur, alors que le store est côté client. Nous devons utiliser les cookies.

export function middleware(request: NextRequest) {
  // Chemins qui ne nécessitent pas d'authentification
  const publicPaths = ['/apparitorat', '/sign-in', '/sign-up']
  
  // Vérifier si l'URL actuelle est un chemin public
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )
  
  // Récupérer le token depuis les cookies
  const token = request.cookies.get('user-token')?.value
  
  // Si l'utilisateur est sur une page protégée sans token, rediriger vers la page de connexion
  if (!isPublicPath && !token) {
    const signInUrl = new URL('/apparitorat', request.url)
    return NextResponse.redirect(signInUrl)
  }
  
  // Si l'utilisateur a un token et essaie d'accéder aux pages d'authentification, 
  // le rediriger vers la page d'accueil
  if (isPublicPath && token) {
    const homeUrl = new URL('/', request.url)
    return NextResponse.redirect(homeUrl)
  }
  
  return NextResponse.next()
}

// Configurer le middleware pour s'appliquer à toutes les routes sauf certaines
export const config = {
  matcher: [
    // Appliquer à toutes les routes sauf celles commençant par:
    // public, _next, api (vous pouvez ajuster selon vos besoins)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}