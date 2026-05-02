import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime, formatCurrency } from '@/utils/format'

describe('format utils', () => {
  it('formatDate 應格式化日期為 zh-TW', () => {
    const result = formatDate('2026-05-20')
    expect(result).toContain('2026')
    expect(result).toContain('5')
    expect(result).toContain('20')
  })

  it('formatDateTime 應格式化日期時間', () => {
    const result = formatDateTime('2026-05-20T10:30:00')
    expect(result).toContain('2026')
    expect(result).toContain('10')
    expect(result).toContain('30')
  })

  it('formatCurrency 應格式化金額', () => {
    const result = formatCurrency(1234)
    expect(result).toContain('NT$')
    expect(result).toContain('1,234')
  })
})