export type OperationType =
  | 'income'
  | 'buy'
  | 'sell'
  | 'transfer_card'
  | 'transfer_wallet'
  | 'fee'
  | 'adjust'

export type OperationStatus = 'planned' | 'done' | 'cancelled'

export interface Operation {
  id: string
  date: string
  type: OperationType
  amount_rub?: string
  amount_usdt?: string
  rate?: string
  cardId?: string | null
  walletId?: string | null
  counterparty?: string
  fee?: string
  status: OperationStatus
  relatedIds?: string[]
  comment?: string
  createdAt: string
  updatedAt?: string
}

export interface Card {
  id: string
  title: string
  bank?: string
  last4?: string
  initial_balance: string
  archived?: boolean
  comment?: string
}

export interface PurchaseBatch {
  id: string
  opId: string
  date: string
  amount_usdt: string
  remaining_usdt: string
  amount_rub: string
  rate: string
  fee: string
}
