import Dexie from 'dexie'
import { Operation, Card, PurchaseBatch } from './types'

export class AppDB extends Dexie {
  operations!: Dexie.Table<Operation, string>
  cards!: Dexie.Table<Card, string>
  batches!: Dexie.Table<PurchaseBatch, string>
  settings!: Dexie.Table<{ key: string; value: any }, string>

  constructor() {
    super('rub_usdt_notion')
    this.version(1).stores({
      operations: '&id, date, type, cardId, walletId',
      cards: '&id, title',
      batches: '&id, opId, date',
      settings: '&key'
    })
  }
}

export const db = new AppDB()
