// Configuración de servicios backend

export const config = {
  // Matchmaking Service
  matchmaking: {
    url: process.env.NEXT_PUBLIC_MATCHMAKING_URL || 'http://localhost:8082',
    apiPrefix: '/api/matchmaking',
  },
  
  // Chat Service
  chat: {
    url: process.env.NEXT_PUBLIC_CHAT_URL || 'http://localhost:3001',
  },
  
  // User Profile Service
  userProfile: {
    url: process.env.NEXT_PUBLIC_USER_PROFILE_URL || 'http://localhost:8080',
    apiPrefix: '/api/profiles',
  },
}

export default config