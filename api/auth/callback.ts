import { Hono }                 from 'hono'
import { handle }               from 'hono/vercel'
import { setCookie }            from 'hono/cookie'

export const config = { runtime: 'edge' }

import { exchangeCodeForTokens, serializeTokenCookie } from '../lib/token'
import { COOKIE_NAME }                                 from '../lib/cookieOptions'

const app = new Hono()

app.get('/api/auth/callback', async (c) => {
  const code  = c.req.query('code')
  const error = c.req.query('error')

  if (error || !code) {
    return c.text(`OAuth error: ${error ?? 'missing code'}`, 400)
  }

  try {
    const tokens    = await exchangeCodeForTokens(code)
    const cookieVal = serializeTokenCookie(tokens)

    setCookie(c, COOKIE_NAME, cookieVal, {
      maxAge:   60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: 'Lax',
      secure:   process.env.NODE_ENV === 'production',
      path:     '/',
    })

    return c.redirect('/')
  } catch (err) {
    console.error('Callback error:', err)
    return c.text('Authentication failed', 500)
  }
})

export default handle(app)