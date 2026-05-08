import { FC }            from 'react'
import { useQuery }      from '@tanstack/react-query'
import { getHamiltonWeather } from '../../services/weather'

const conditionEmoji = (condition: string): string => {
  const c = condition.toLowerCase()
  if (c.includes('thunder'))                      return '⛈️'
  if (c.includes('snow'))                         return '❄️'
  if (c.includes('drizzle'))                      return '🌦️'
  if (c.includes('rain') || c.includes('shower')) return '🌧️'
  if (c.includes('fog'))                          return '🌫️'
  if (c.includes('overcast'))                     return '☁️'
  if (c.includes('partly'))                       return '⛅'
  if (c.includes('clear'))                        return '☀️'
  return '🌡️'
}

interface WeatherWidgetProps { isMobile?: boolean }

export const WeatherWidget: FC<WeatherWidgetProps> = ({ isMobile }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey:       ['weather'],
    queryFn:        getHamiltonWeather,
    refetchInterval: 1000 * 60 * 15,
  })

  if (isLoading) return <span style={{ fontSize: 12, color: '#6b7280' }}>—°C</span>
  if (isError)   return <span style={{ fontSize: 12, color: '#6b7280' }}>Weather unavailable</span>

  if (isMobile) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 18 }}>{conditionEmoji(data?.condition ?? '')}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
          {data?.temp}°C
        </span>
      </div>
    )
  }

  // Desktop — temp, condition, low/high
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
          {data?.temp}°C
        </span>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>
          {data?.condition}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <span style={{ fontSize: 11, color: '#6b7280' }}>
          L: {data?.low}°
        </span>
        <span style={{ fontSize: 11, color: '#6b7280' }}>
          H: {data?.high}°
        </span>
      </div>
    </div>
  )
}