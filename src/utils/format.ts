import Decimal from 'decimal.js'

export function fmtAmount(value?: string | number | Decimal, precision = 2) {
  if (value === undefined || value === null || value === '') return ''
  const d = new Decimal(value.toString())
  return d.toFixed(precision).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export function parseDec(v?: string | number) {
  if (v === undefined || v === null || v === '') return new Decimal(0)
  return new Decimal(v.toString())
}
