import { Hono }   from 'hono'
import { handle } from 'hono/vercel'

export const config = { runtime: 'edge' }

const app = new Hono()

const weatherLabel = (code: number): string => {
  if (code === 0)        return 'Clear'
  if (code <= 2)         return 'Partly Cloudy'
  if (code === 3)        return 'Overcast'
  if (code <= 48)        return 'Foggy'
  if (code <= 57)        return 'Drizzle'
  if (code <= 67)        return 'Rain'
  if (code <= 77)        return 'Snow'
  if (code <= 82)        return 'Showers'
  if (code <= 99)        return 'Thunderstorm'
  return 'Unknown'
}

app.get('*', async (c) => {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    '?latitude=43.2557&longitude=-79.8711' +
    '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code' +
    '&daily=temperature_2m_max,temperature_2m_min' +
    '&timezone=America%2FToronto'

  const response = await fetch(url)
  if (!response.ok) return c.json({ error: 'Upstream error' }, 500)

  const data = await response.json()
  const cur  = data.current
  const daily = data.daily

  return c.json({
    temp:      Math.round(cur.temperature_2m),
    condition: weatherLabel(cur.weather_code),
    wind:      Math.round(cur.wind_speed_10m),
    humidity:  cur.relative_humidity_2m,
    station:   'Hamilton, ON',
    low:       Math.round(daily.temperature_2m_min[0]),   // ← today's low
    high:      Math.round(daily.temperature_2m_max[0]),   // ← today's high
  })
})

export default handle(app)