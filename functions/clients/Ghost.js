import GhostAdminAPI from '@tryghost/admin-api'
import 'dotenv/config'

// Configure client
export const GhostURL = 'https://ultrasoundguidance.ghost.io'
export const ghostAdminApi = new GhostAdminAPI({
  url: GhostURL,
  // Admin API key goes here
  key: process.env.GHOST_KEY,
  version: 'v5.81',
})
