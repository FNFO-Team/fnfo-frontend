export const config = {
  matchmaking: {
    url: 'https://matchmaking-service.livelyocean-46fb9704.brazilsouth.azurecontainerapps.io',
    apiPrefix: '/api/matchmaking'
  },
  chat: {
    url: 'https://chat-service.livelyocean-46fb9704.brazilsouth.azurecontainerapps.io'
  },
  userProfile: {
    url: 'http://localhost:8080', // Actualizar cuando despliegues este servicio
    apiPrefix: '/api/profiles'
  }
}