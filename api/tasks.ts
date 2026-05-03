import { Hono }   from 'hono'
import { handle } from 'hono/vercel'

export const config = { runtime: 'edge' }

const app = new Hono()

app.all('*', (c) => {
  return c.json({ 
    path: c.req.path,
    url:  c.req.url,
  })
})

export default handle(app)