import type { WeatherData } from '../types'

export const getHamiltonWeather = async (): Promise<WeatherData> => {
  const res = await fetch('/api/wx')
  if (!res.ok) throw new Error('Failed to fetch weather')
  return res.json()
}