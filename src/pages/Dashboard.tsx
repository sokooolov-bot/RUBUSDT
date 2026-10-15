import React from 'react'
import { db } from '../db'
import { fmtAmount } from '../utils/format'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = React.useState({
    rubTotal: '0',
    usdtTotal: '0',
    opsCount: 0
  })

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      const cards = await db.cards.toArray()
      const batches = await db.batches.toArray()
      const opsCount = await db.operations.count()
      const Decimal = (await import('decimal.js')).default
      const rubTotal = cards.reduce((acc: any, c: any) => acc.plus(new Decimal(c.initial_balance || '0')), new Decimal(0))
      const usdtTotal = batches.reduce((acc: any, b: any) => acc.plus(new Decimal(b.remaining_usdt || '0')), new Decimal(0))
      if (!mounted) return
      setSummary({
        rubTotal: rubTotal.toString(),
        usdtTotal: usdtTotal.toString(),
        opsCount
      })
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div>
      <header className="mb-6">
        <h2 className="text-2xl font-semibold">Главная</h2>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow-sm">
          <div className="text-sm text-gray-500">Рубли (по картам)</div>
          <div className="text-2xl font-medium mt-2">{fmtAmount(summary.rubTotal, 2)} ₽</div>
        </div>
        <div className="bg-white p-4 rounded shadow-sm">
          <div className="text-sm text-gray-500">USDT</div>
          <div className="text-2xl font-medium mt-2">{fmtAmount(summary.usdtTotal, 6)} USDT</div>
        </div>
        <div className="bg-white p-4 rounded shadow-sm">
          <div className="text-sm text-gray-500">Операций</div>
          <div className="text-2xl font-medium mt-2">{summary.opsCount}</div>
        </div>
      </div>

      <section className="mt-6 bg-white p-4 rounded shadow-sm">
        <h3 className="font-medium mb-4">Динамика (демо)</h3>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[
              { date: '2026-10-01', value: 100000 },
              { date: '2026-10-05', value: 95000 },
              { date: '2026-10-10', value: 102000 },
              { date: '2026-10-15', value: 98000 }
            ]}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line dataKey="value" stroke="#4f46e5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
