import React from 'react'
import { db } from '../db'

export const CardsPage: React.FC = () => {
  const [cards, setCards] = React.useState<any[]>([])
  const [title, setTitle] = React.useState('')
  const [initial, setInitial] = React.useState('0')

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      const all = await db.cards.toArray()
      if (!mounted) return
      setCards(all)
    })()
    return () => { mounted = false }
  }, [])

  const add = async () => {
    if (!title) return alert('Введите название')
    const id = 'card_' + Math.random().toString(36).slice(2, 9)
    await db.cards.put({ id, title, initial_balance: initial })
    setTitle(''); setInitial('0')
    const all = await db.cards.toArray(); setCards(all)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Банковские карты</h2>
      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="grid grid-cols-3 gap-3">
          <input placeholder="Название" value={title} onChange={e => setTitle(e.target.value)} className="border rounded px-2 py-1" />
          <input placeholder="Начальный баланс" value={initial} onChange={e => setInitial(e.target.value)} className="border rounded px-2 py-1" />
          <button onClick={add} className="px-3 py-2 bg-indigo-600 text-white rounded">Добавить карту</button>
        </div>
      </div>

      <div className="bg-white rounded shadow">
        <table className="min-w-full">
          <thead className="text-left text-sm text-gray-500"><tr><th className="p-3">Название</th><th className="p-3">Начальный баланс</th></tr></thead>
          <tbody>
            {cards.map(c => (
              <tr key={c.id} className="border-t"><td className="p-3">{c.title}</td><td className="p-3">{c.initial_balance}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
