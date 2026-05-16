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
  const apiKey = process.env.PIRATE_WEATHER_KEY;
  
  if (!apiKey) {
    console.error("Missing PIRATE_WEATHER_KEY");
    return c.json({ error: 'Server configuration error' }, 500);
  }

  const lat = '43.2557';
  const lon = '-79.8711';
  
  const url = `https://api.pirateweather.net/forecast/${apiKey}/${lat},${lon}?version=2&units=ca&exclude=minutely,hourly,alerts,flags`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Pirate Weather responded with ${response.status}`);
      return c.json({ error: 'Weather provider unavailable' }, 503);
    }

    const data = await response.json();
    
    const cur = data.currently || {};
    const today = data.daily?.data?.[0] || {};

    return c.json({
      temp:      Math.round(cur.temperature ?? 0),
      condition: cur.summary ?? 'Clear',
      wind:      Math.round(cur.windSpeed ?? 0),
      humidity:  Math.round((cur.humidity ?? 0) * 100), 
      station:   'Hamilton, ON (HRRR High-Res)',
      low:       today.temperatureMin !== undefined ? Math.round(today.temperatureMin) : null,
      high:      today.temperatureMax !== undefined ? Math.round(today.temperatureMax) : null,
    });

  } catch (err) {
    console.error("Fetch error:", err);
    return c.json({ error: 'Failed to fetch weather data' }, 500);
  }
});

export default handle(app);