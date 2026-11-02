/** Simple on-screen calculator (like the ones in online tests). Evaluates left to right per operator press. */
import { useState } from 'react'
import { Button } from './kit'

type Op = '+' | '−' | '×' | '÷'

function apply(a: number, b: number, op: Op): number {
  switch (op) {
    case '+':
      return a + b
    case '−':
      return a - b
    case '×':
      return a * b
    case '÷':
      return b === 0 ? NaN : a / b
  }
}

function show(v: number): string {
  if (!Number.isFinite(v)) return 'Fehler'
  const s = Number(v.toPrecision(12)).toString()
  return s.replace('.', ',')
}

export function Calculator({ onClose }: { onClose: () => void }) {
  const [display, setDisplay] = useState('0')
  const [acc, setAcc] = useState<number | null>(null)
  const [op, setOp] = useState<Op | null>(null)
  const [fresh, setFresh] = useState(true)
  const value = () => Number(display.replace(',', '.'))
  const digit = (d: string) => {
    if (fresh) {
      setDisplay(d === ',' ? '0,' : d)
      setFresh(false)
    } else if (!(d === ',' && display.includes(','))) setDisplay(display === '0' && d !== ',' ? d : display + d)
  }
  const operator = (o: Op) => {
    const v = value()
    const r = acc !== null && op && !fresh ? apply(acc, v, op) : v
    setAcc(r)
    setDisplay(show(r))
    setOp(o)
    setFresh(true)
  }
  const equals = () => {
    if (acc === null || !op) return
    const r = apply(acc, value(), op)
    setDisplay(show(r))
    setAcc(null)
    setOp(null)
    setFresh(true)
  }
  const keys: (string | Op)[] = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', ',', '=', '+']
  return (
    <div role="dialog" aria-label="Taschenrechner" className="card fixed right-3 bottom-[calc(env(safe-area-inset-bottom)+6rem)] z-40 w-[264px] p-3 shadow-2xl">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold">Taschenrechner</span>
        <button type="button" onClick={onClose} aria-label="Taschenrechner schließen" className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[var(--surface-2)]">
          ✕
        </button>
      </div>
      <div className="tabnums mb-2 overflow-hidden rounded-lg bg-[var(--surface-2)] px-3 py-2 text-right text-2xl font-semibold" aria-live="polite">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        <Button
          className="col-span-2 min-h-10"
          onClick={() => {
            setDisplay('0')
            setAcc(null)
            setOp(null)
            setFresh(true)
          }}
        >
          C
        </Button>
        <Button className="col-span-2 min-h-10" onClick={() => setDisplay(fresh ? display : display.length > 1 ? display.slice(0, -1) : '0')}>
          ⌫
        </Button>
        {keys.map((k) => (
          <Button key={k} variant={k === '=' ? 'primary' : 'secondary'} className="min-h-11 px-0 text-lg" onClick={() => (k === '=' ? equals() : ['+', '−', '×', '÷'].includes(k) ? operator(k as Op) : digit(k))}>
            {k}
          </Button>
        ))}
      </div>
    </div>
  )
}
