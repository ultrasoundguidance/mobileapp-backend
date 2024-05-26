import GhostAdminAPI from '@tryghost/admin-api'
import 'dotenv/config'

// Configure client
export const ghostAdminApi = new GhostAdminAPI({
  url: 'https://ultrasoundguidance.ghost.io',
  // Admin API key goes here
  key: process.env.GHOST_KEY,
  version: 'v5.81',
})
