import Decimal from 'decimal.js'
import { db } from '../db'
import { PurchaseBatch, Operation } from '../types'

export async function computeFIFOForSale(
  saleOp: Operation
): Promise<{
  consumed: { batchId: string; amount_usdt: string; cost_rub: string }[]
  total_cost_rub: string
}> {
  if (!saleOp.amount_usdt) throw new Error('amount_usdt required')
  const remainingToSell = new Decimal(saleOp.amount_usdt)
  const consumed: { batchId: string; amount_usdt: string; cost_rub: string }[] = []
  let left = remainingToSell

  const batches = await db.batches.orderBy('date').filter(b => new Decimal(b.remaining_usdt).gt(0)).toArray()

  for (const b of batches) {
    if (left.lte(0)) break
    const batchRem = new Decimal(b.remaining_usdt)
    if (batchRem.lte(0)) continue
    const take = Decimal.min(batchRem, left)
    const cost_rub = take.mul(new Decimal(b.rate))
    consumed.push({
      batchId: b.id,
      amount_usdt: take.toString(),
      cost_rub: cost_rub.toString()
    })
    left = left.minus(take)
  }

  const total_cost_rub = consumed.reduce((acc, c) => new Decimal(acc).plus(new Decimal(c.cost_rub)), new Decimal(0)).toString()
  return { consumed, total_cost_rub }
}

export async function applySaleConsumeBatches(saleOp: Operation) {
  return db.transaction('rw', db.batches, db.operations, async () => {
    const { consumed } = await computeFIFOForSale(saleOp)
    let left = new Decimal(saleOp.amount_usdt || '0')
    for (const c of consumed) {
      if (left.lte(0)) break
      const batch = await db.batches.get(c.batchId)
      if (!batch) continue
      const take = Decimal.min(new Decimal(batch.remaining_usdt), left)
      const newRem = new Decimal(batch.remaining_usdt).minus(take)
      await db.batches.update(batch.id, { remaining_usdt: newRem.toString() })
      left = left.minus(take)
    }
    await db.operations.put(saleOp)
  })
}

export async function createBatchFromBuy(op: Operation) {
  if (!op.amount_usdt) throw new Error('amount_usdt required')
  const batch = {
    id: cryptoRandomId(),
    opId: op.id,
    date: op.date,
    amount_usdt: op.amount_usdt,
    remaining_usdt: op.amount_usdt,
    amount_rub: op.amount_rub || '0',
    rate: op.rate || '0',
    fee: op.fee || '0'
  }
  await db.transaction('rw', db.batches, db.operations, async () => {
    await db.operations.put(op)
    await db.batches.put(batch)
  })
}

export function cryptoRandomId() {
  return 'id_' + Math.random().toString(36).slice(2, 9)
}
