import { FC, useState } from 'react'

const DAYS   = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

export const MiniCalendar: FC = () => {
  const today = new Date()
  const [viewing, setViewing] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )

  const year  = viewing.getFullYear()
  const month = viewing.getMonth()

  // First day of month (0=Sun, 1=Mon, ...)
  const firstDow    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const isToday = (d: number) =>
    d === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()

  const prevMonth = () => setViewing(new Date(year, month - 1, 1))
  const nextMonth = () => setViewing(new Date(year, month + 1, 1))

  // Build grid cells (nulls for leading empty days)
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div style={{ marginBottom: 12 }}>
      {/* Month header */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        marginBottom:   8,
      }}>
        <button
          onClick={prevMonth}
          style={{
            background:   'transparent',
            border:       'none',
            color:        '#6b7280',
            cursor:       'pointer',
            fontSize:     14,
            padding:      '0 4px',
            lineHeight:   1,
          }}
        >‹</button>

        <span style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.05em' }}>
          {MONTHS[month]} {year}
        </span>

        <button
          onClick={nextMonth}
          style={{
            background:   'transparent',
            border:       'none',
            color:        '#6b7280',
            cursor:       'pointer',
            fontSize:     14,
            padding:      '0 4px',
            lineHeight:   1,
          }}
        >›</button>
      </div>

      {/* Day of week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{
            textAlign:  'center',
            fontSize:   10,
            color:      '#4b5563',
            fontWeight: 600,
            padding:    '2px 0',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => (
          <div
            key={i}
            style={{
              textAlign:    'center',
              fontSize:     11,
              padding:      '3px 0',
              borderRadius: 4,
              color:        day === null
                ? 'transparent'
                : isToday(day as number)
                  ? '#fff'
                  : '#9ca3af',
              background:   isToday(day as number) ? '#4f46e5' : 'transparent',
              fontWeight:   isToday(day as number) ? 700 : 400,
            }}
          >
            {day ?? ''}
          </div>
        ))}
      </div>
    </div>
  )
}