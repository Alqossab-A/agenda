import type { CSSProperties } from 'react'
import { FC, useEffect, useRef, useState } from 'react'

interface TimePickerProps {
  value: number                    // total minutes from midnight
  onChange: (v: number) => void
  date?: string                    // 'YYYY-MM-DD'
  onDateChange?: (d: string) => void
}

export const TimePicker: FC<TimePickerProps> = ({ value, onChange, date, onDateChange }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Derive time parts from value
  const totalH = Math.floor(value / 60) % 24
  const totalM = value % 60
  const period = totalH < 12 ? 'AM' : 'PM'
  const hour12 = totalH === 0 ? 12 : totalH > 12 ? totalH - 12 : totalH

  const label = `${hour12}:${String(totalM).padStart(2, '0')} ${period}`

  // Date
  const today = new Date().toLocaleDateString('en-CA')
  const activeDate = date ?? today
  const isToday = activeDate === today
  const dateObj = new Date(`${activeDate}T12:00:00`)
  const dateLabel = isToday
    ? 'Today'
    : dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  const prevDay = () => {
    const d = new Date(`${activeDate}T12:00:00`)
    d.setDate(d.getDate() - 1)
    onDateChange?.(d.toLocaleDateString('en-CA'))
  }
  const nextDay = () => {
    const d = new Date(`${activeDate}T12:00:00`)
    d.setDate(d.getDate() + 1)
    onDateChange?.(d.toLocaleDateString('en-CA'))
  }

  const selectHour = (h: number) => {
    let h24 = h
    if (period === 'AM' && h === 12) h24 = 0
    else if (period === 'PM' && h !== 12) h24 = h + 12
    onChange(h24 * 60 + totalM)
  }

  const selectPeriod = (p: 'AM' | 'PM') => {
    if (p === period) return
    let h24 = totalH
    if (p === 'AM' && h24 >= 12) h24 -= 12
    else if (p === 'PM' && h24 < 12) h24 += 12
    onChange(h24 * 60 + totalM)
  }

  const selectMinute = (m: number) => onChange(totalH * 60 + m)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const cell = (active: boolean): CSSProperties => ({
    padding: '7px 0',
    background: active ? '#6366f1' : '#f5f5f4',
    color: active ? '#fff' : '#44403c',
    fontWeight: active ? 600 : 400,
    border: 'none',
    borderRadius: 5,
    cursor: 'pointer',
    fontSize: 12,
    fontFamily: 'inherit',
    lineHeight: '1',
  })

  const navBtn: CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 18, color: '#a8a29e', padding: '0 6px', lineHeight: 1,
  }

  const sectionLabel: CSSProperties = {
    fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: '#c4bfbb', marginBottom: 6,
    display: 'block',
  }

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: '#fff', color: '#1c1917', border: '1px solid #e7e5e4',
          borderRadius: 6, padding: '6px 10px', fontSize: 13, cursor: 'pointer',
          outline: 'none', minWidth: 90, textAlign: 'left', fontFamily: 'inherit',
        }}
      >
        {label}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 200,
          background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: 224, overflow: 'hidden',
        }}>

          {/* Date row */}
          {onDateChange && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', borderBottom: '1px solid #f5f5f4',
            }}>
              <button onClick={prevDay} style={navBtn}>‹</button>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1c1917' }}>{dateLabel}</span>
              <button onClick={nextDay} style={navBtn}>›</button>
            </div>
          )}

          {/* Hours */}
          <div style={{ padding: '10px 12px 6px' }}>
            <span style={sectionLabel}>Hour</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 3 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => (
                <button key={h} onClick={() => selectHour(h)} style={cell(hour12 === h)}>
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* AM / PM */}
          <div style={{ display: 'flex', gap: 4, padding: '4px 12px 10px' }}>
            {(['AM', 'PM'] as const).map(p => (
              <button key={p} onClick={() => selectPeriod(p)} style={{
                flex: 1, padding: '6px 0', fontSize: 11, fontWeight: 700,
                background: period === p ? '#6366f1' : '#f5f5f4',
                color: period === p ? '#fff' : '#78716c',
                border: 'none', borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit',
              }}>{p}</button>
            ))}
          </div>

          {/* Minutes */}
          <div style={{ padding: '8px 12px 12px', borderTop: '1px solid #f5f5f4' }}>
            <span style={sectionLabel}>Minute</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 }}>
              {[0, 15, 30, 45].map(m => (
                <button key={m} onClick={() => selectMinute(m)} style={cell(totalM === m)}>
                  :{String(m).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}