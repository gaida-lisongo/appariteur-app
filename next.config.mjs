/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: ""
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: ""
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: ""
      },
      {
        protocol: "https",
        hostname: "pub-b7fd9c30cdbf439183b75041f5f71b92.r2.dev",
        port: ""
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: ""
      }
    ]
  },
  // Ajouts recommandés pour la production
  productionBrowserSourceMaps: false, // Désactive les source maps en production pour réduire la taille
  poweredByHeader: false, // Supprime l'en-tête X-Powered-By pour une meilleure sécurité
  
  // Vous pouvez aussi ajouter les en-têtes CORS ici si nécessaire
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' }
        ],
      },
    ];
  }
};

export default nextConfig;
