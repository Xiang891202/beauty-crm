import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAdjustments, createAdjustment } from '@/api/modules/adjustment'

vi.mock('@/api/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import http from '@/api/http'
const mockHttp = http as any

describe('adjustment API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAdjustments 應發送正確的 GET 請求', async () => {
    mockHttp.get.mockResolvedValue({ success: true, data: { items: [], total: 0 } })

    await getAdjustments({ page: 1, limit: 10, customer_name: '王' })

    expect(mockHttp.get).toHaveBeenCalledWith('/adjustments', {
      params: { page: 1, limit: 10, customer_name: '王' },
    })
  })

  it('createAdjustment 應發送正確的 POST 請求', async () => {
    const data = { member_service_id: 10, adjustment_type: 'INCREASE', amount: 2, reason: 'test' }
    mockHttp.post.mockResolvedValue({ success: true, data: { id: 1 } })

    await createAdjustment(data)

    expect(mockHttp.post).toHaveBeenCalledWith('/adjustments', data)
  })
})