import React from 'react'
import { db } from '../db'
import { fmtAmount } from '../utils/format'
import { Operation } from '../types'
import { OperationForm } from '../components/OperationForm'

export const OperationsPage: React.FC = () => {
  const [ops, setOps] = React.useState<Operation[]>([])
  const [showForm, setShowForm] = React.useState(false)
  const [editOp, setEditOp] = React.useState<Operation | null>(null)

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      const all = await db.operations.orderBy('date').reverse().toArray()
      if (!mounted) return
      setOps(all)
    })()
    return () => { mounted = false }
  }, [])

  const openAdd = () => { setEditOp(null); setShowForm(true) }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Все операции</h2>
        <div>
          <button onClick={openAdd} className="px-3 py-2 bg-indigo-600 text-white rounded">Добавить операцию</button>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm">
        <table className="min-w-full table-auto">
          <thead className="text-left text-sm text-gray-500">
            <tr>
              <th className="p-3">Дата</th>
              <th className="p-3">Тип</th>
              <th className="p-3">RUB</th>
              <th className="p-3">USDT</th>
              <th className="p-3">Карта</th>
              <th className="p-3">Комментарий</th>
            </tr>
          </thead>
          <tbody>
            {ops.map(o => (
              <tr key={o.id} className="border-t">
                <td className="p-3 text-sm">{new Date(o.date).toLocaleString()}</td>
                <td className="p-3 text-sm">{o.type}</td>
                <td className="p-3 text-sm">{fmtAmount(o.amount_rub, 2)}</td>
                <td className="p-3 text-sm">{fmtAmount(o.amount_usdt, 6)}</td>
                <td className="p-3 text-sm">{o.cardId}</td>
                <td className="p-3 text-sm">{o.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && <OperationForm onClose={() => { setShowForm(false); window.location.reload() }} op={editOp} />}
    </div>
  )
}
