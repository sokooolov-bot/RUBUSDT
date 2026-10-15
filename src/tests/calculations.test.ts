import { describe, it, expect, beforeEach } from 'vitest'
import Decimal from 'decimal.js'
import { computeFIFOForSale } from '../services/calculations'
import { db } from '../db'

beforeEach(async () => {
  await db.batches.clear()
})

describe('FIFO расчёты', () => {
  it('consumes batches FIFO', async () => {
    await db.batches.bulkAdd([
      { id: 'b1', opId: 'o1', date: '2026-01-01', amount_usdt: '5', remaining_usdt: '5', amount_rub: '3500', rate: '700', fee: '0' },
      { id: 'b2', opId: 'o2', date: '2026-02-01', amount_usdt: '10', remaining_usdt: '10', amount_rub: '7000', rate: '700', fee: '0' }
    ])
    const sale: any = { id: 's1', date: '2026-03-01', type: 'sell', amount_usdt: '12', amount_rub: '8400', rate: '700', status: 'done', createdAt: new Date().toISOString() }
    const res = await computeFIFOForSale(sale)
    const total = new Decimal(res.total_cost_rub)
    expect(total.toNumber()).toBeCloseTo(5 * 700 + 7 * 700)
    expect(res.consumed.length).toBeGreaterThan(0)
  })
})
