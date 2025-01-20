// Authentication configuration
export const AUTH_CONFIG = {
  tokenExpiration: '24h',
  passwordMinLength: 8,
  saltRounds: 10,
  sessionDuration: '7d'
} as const;
