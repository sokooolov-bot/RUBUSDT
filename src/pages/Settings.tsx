import React from 'react'
import { db } from '../db'

export const SettingsPage: React.FC = () => {
  const exportJSON = async () => {
    const ops = await db.operations.toArray()
    const cards = await db.cards.toArray()
    const batches = await db.batches.toArray()
    const blob = new Blob([JSON.stringify({ ops, cards, batches }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJSON = async (file: File | null) => {
    if (!file) return
    const text = await file.text()
    try {
      const parsed = JSON.parse(text)
      if (!parsed.ops || !parsed.cards) throw new Error('Invalid format')
      await db.transaction('rw', db.operations, db.cards, db.batches, async () => {
        for (const c of parsed.cards) await db.cards.put(c)
        for (const b of parsed.batches || []) await db.batches.put(b)
        for (const o of parsed.ops) await db.operations.put(o)
      })
      alert('Импорт завершён')
    } catch (e) {
      alert('Ошибка импорта: ' + (e as any).message)
    }
  }

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    importJSON(f)
  }

  const loadDemo = async () => {
    const card = { id: 'card_demo', title: 'Debit • 1234', initial_balance: '100000', bank: 'DemoBank' }
    await db.cards.put(card)
    const buy = {
      id: 'op_buy_1',
      date: new Date().toISOString(),
      type: 'buy',
      amount_rub: '70000',
      amount_usdt: '100',
      rate: '700',
      cardId: 'card_demo',
      fee: '100',
      status: 'done',
      createdAt: new Date().toISOString()
    }
    await db.operations.put(buy)
    await db.batches.put({
      id: 'batch_demo_1',
      opId: buy.id,
      date: buy.date,
      amount_usdt: buy.amount_usdt,
      remaining_usdt: buy.amount_usdt,
      amount_rub: buy.amount_rub,
      rate: buy.rate,
      fee: buy.fee
    })
    alert('Демоданные загружены')
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Настройки и резервное копирование</h2>
      <div className="space-y-3">
        <button onClick={exportJSON} className="px-3 py-2 bg-indigo-600 text-white rounded">Экспорт в JSON</button>
        <div>
          <label className="block text-sm mb-1">Импорт JSON</label>
          <input type="file" accept=".json" onChange={onFile} />
        </div>
        <button onClick={loadDemo} className="px-3 py-2 bg-gray-200 rounded">Загрузить демоданные</button>
      </div>
    </div>
  )
}
