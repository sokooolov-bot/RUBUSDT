import React from 'react'
import { Operation } from '../types'
import { db } from '../db'
import { cryptoRandomId } from '../services/calculations'
import Decimal from 'decimal.js'

export const OperationForm: React.FC<{ onClose: () => void; op?: Operation | null }> = ({ onClose, op }) => {
  const isEdit = !!op
  const [type, setType] = React.useState<Operation['type']>(op?.type || 'buy')
  const [date, setDate] = React.useState(op?.date || new Date().toISOString().slice(0, 16))
  const [amountRub, setAmountRub] = React.useState(op?.amount_rub || '')
  const [amountUsdt, setAmountUsdt] = React.useState(op?.amount_usdt || '')
  const [rate, setRate] = React.useState(op?.rate || '')
  const [cardId, setCardId] = React.useState(op?.cardId || '')
  const [fee, setFee] = React.useState(op?.fee || '')
  const [comment, setComment] = React.useState(op?.comment || '')

  const save = async () => {
    if (type === 'buy') {
      if (!amountRub) return alert('Введите сумму в рублях')
      if (!rate && !amountUsdt) return alert('Укажите курс или количество USDT')
    }
    const id = op?.id || cryptoRandomId()
    const operation: Operation = {
      id,
      date: new Date(date).toISOString(),
      type,
      amount_rub: amountRub || undefined,
      amount_usdt: amountUsdt || undefined,
      rate: rate || undefined,
      cardId: cardId || undefined,
      fee: fee || undefined,
      status: 'done',
      createdAt: new Date().toISOString(),
      comment
    }

    try {
      if (type === 'buy') {
        if (!operation.amount_usdt) {
          operation.amount_usdt = new Decimal(operation.amount_rub || '0').div(new Decimal(operation.rate || '1')).toString()
        }
        await db.transaction('rw', db.operations, db.batches, async () => {
          await db.operations.put(operation)
          await db.batches.put({
            id: cryptoRandomId(),
            opId: operation.id,
            date: operation.date,
            amount_usdt: operation.amount_usdt!,
            remaining_usdt: operation.amount_usdt!,
            amount_rub: operation.amount_rub || '0',
            rate: operation.rate || '0',
            fee: operation.fee || '0'
          })
        })
      } else if (type === 'sell') {
        if (!operation.amount_usdt) return alert('Укажите количество USDT для продажи')
        await db.operations.put(operation)
        const { applySaleConsumeBatches } = await import('../services/calculations')
        await applySaleConsumeBatches(operation)
      } else {
        await db.operations.put(operation)
      }
      alert('Операция сохранена')
      onClose()
    } catch (e) {
      console.error(e)
      alert('Ошибка при сохранении: ' + (e as any).message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center p-6">
      <div className="bg-white rounded shadow p-6 w-full max-w-2xl">
        <h3 className="text-lg font-medium mb-4">{isEdit ? 'Редактировать' : 'Новая'} операция</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Тип</label>
            <select value={type} onChange={e => setType(e.target.value as any)} className="w-full border rounded px-2 py-1">
              <option value="buy">Покупка USDT</option>
              <option value="sell">Продажа USDT</option>
              <option value="income">Поступление RUB</option>
              <option value="transfer_card">Перевод между картами</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">Дата</label>
            <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>

          <div>
            <label className="block text-sm">Сумма (RUB)</label>
            <input value={amountRub} onChange={e => setAmountRub(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>

          <div>
            <label className="block text-sm">Кол-во (USDT)</label>
            <input value={amountUsdt} onChange={e => setAmountUsdt(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>

          <div>
            <label className="block text-sm">Курс (RUB / 1 USDT)</label>
            <input value={rate} onChange={e => setRate(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>

          <div>
            <label className="block text-sm">Комиссия</label>
            <input value={fee} onChange={e => setFee(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm">Карта (ID)</label>
            <input value={cardId} onChange={e => setCardId(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm">Комментарий</label>
            <input value={comment} onChange={e => setComment(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded border">Отмена</button>
          <button onClick={save} className="px-3 py-2 rounded bg-indigo-600 text-white">Сохранить</button>
        </div>
      </div>
    </div>
  )
}
