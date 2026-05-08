import { FC, useEffect, useRef, useState } from 'react'

interface TimeOption {
  label: string
  totalMinutes: number
}

const generateTimeOptions = (): TimeOption[] => {
  const options: TimeOption[] = []
  for (let totalMinutes = 0; totalMinutes < 24 * 60; totalMinutes += 15) {
    const h    = Math.floor(totalMinutes / 60)
    const m    = totalMinutes % 60
    const ampm = h < 12 ? 'AM' : 'PM'
    const h12  = h === 0 ? 12 : h > 12 ? h - 12 : h
    const mStr = m === 0 ? '00' : String(m)
    options.push({ label: `${h12}:${mStr} ${ampm}`, totalMinutes })
  }
  return options
}

const TIME_OPTIONS = generateTimeOptions()

interface TimePickerProps {
  value: number       // total minutes from midnight
  onChange: (totalMinutes: number) => void
}

export const TimePicker: FC<TimePickerProps> = ({ value, onChange }) => {
  const [open, setOpen]   = useState<boolean>(false)
  const ref               = useRef<HTMLDivElement>(null)
  const listRef           = useRef<HTMLDivElement>(null)

  const label = TIME_OPTIONS.find(t => t.totalMinutes === value)?.label ?? ''

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Scroll selected option into view when opened
  useEffect(() => {
    if (!open || !listRef.current) return
    const selected = listRef.current.querySelector('[data-selected="true"]') as HTMLElement
    if (selected) {
      selected.scrollIntoView({ block: 'center' })
    }
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background:   '#1f2937',
          color:        '#e5e7eb',
          border:       '1px solid #374151',
          borderRadius: 6,
          padding:      '6px 10px',
          fontSize:     13,
          cursor:       'pointer',
          outline:      'none',
          minWidth:     80,
          textAlign:    'left',
          fontFamily:   'inherit',
        }}
      >
        {label}
      </button>

      {/* Popout */}
      {open && (
        <div
          ref={listRef}
          style={{
            position:     'absolute',
            top:          '100%',
            left:         0,
            marginTop:    4,
            background:   '#1f2937',
            border:       '1px solid #374151',
            borderRadius: 8,
            zIndex:       100,
            width:        120,
            maxHeight:    200,
            overflowY:    'auto',
            boxShadow:    '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          {TIME_OPTIONS.map(opt => {
            const selected = opt.totalMinutes === value
            return (
              <div
                key={opt.totalMinutes}
                data-selected={selected}
                onClick={() => { onChange(opt.totalMinutes); setOpen(false) }}
                style={{
                  padding:         '7px 12px',
                  fontSize:        13,
                  cursor:          'pointer',
                  color:           selected ? '#fff' : '#d1d5db',
                  background:      selected ? '#4f46e5' : 'transparent',
                  fontWeight:      selected ? 600 : 400,
                }}
                onMouseEnter={e => {
                  if (!selected) (e.currentTarget as HTMLElement).style.background = '#374151'
                }}
                onMouseLeave={e => {
                  if (!selected) (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                {opt.label}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}