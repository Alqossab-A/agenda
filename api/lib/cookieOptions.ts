export const COOKIE_NAME = 'sunflow_tokens'

export const cookieOptions = (maxAge: number) =>
  [
    `Max-Age=${maxAge}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ')