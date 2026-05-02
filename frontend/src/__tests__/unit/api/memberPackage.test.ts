import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  purchasePackage,
  getCustomerPackages,
  useService,
  adjustRemaining,
  getMyPackages,
  getMyUsageLogs,
} from '@/api/modules/memberPackage'

// Mock http 模組
vi.mock('@/api/http', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import http from '@/api/http'
const mockHttp = http as any

describe('memberPackage API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('purchasePackage 應發送正確的 POST 請求', async () => {
    const data = { customer_id: 1, package_id: 'pkg-1', purchase_date: '2026-05-01' }
    mockHttp.post.mockResolvedValue({ success: true, data: { id: 'mp-1' } })

    const result = await purchasePackage(data)

    expect(mockHttp.post).toHaveBeenCalledWith('/admin/member-packages/purchase', data)
    expect(result.data.id).toBe('mp-1')
  })

  it('getCustomerPackages 應發送正確的 GET 請求', async () => {
    mockHttp.get.mockResolvedValue({ success: true, data: [] })

    await getCustomerPackages(1)

    expect(mockHttp.get).toHaveBeenCalledWith('/admin/member-packages/packages', {
      params: { customer_id: 1 },
    })
  })

  it('useService 應發送正確的 POST 請求', async () => {
    const payload = {
      member_package_id: 'mp-1',
      selected_service_ids: [1, 2],
      signature_url: 'sig',
    }
    mockHttp.post.mockResolvedValue({ success: true, data: { id: 'log-1' } })

    await useService(payload)

    expect(mockHttp.post).toHaveBeenCalledWith('/admin/member-packages/use', payload)
  })

  it('adjustRemaining 應發送正確的 POST 請求', async () => {
    const data = { member_package_id: 'mp-1', delta: 2 }
    mockHttp.post.mockResolvedValue({ success: true })

    await adjustRemaining(data)

    expect(mockHttp.post).toHaveBeenCalledWith('/admin/member-packages/adjust', data)
  })

  it('getMyPackages 應發送正確的 GET 請求', async () => {
    mockHttp.get.mockResolvedValue({ success: true, data: [] })

    await getMyPackages()

    expect(mockHttp.get).toHaveBeenCalledWith('/public/my/service-packages')
  })

  it('getMyUsageLogs 應發送正確的 GET 請求', async () => {
    mockHttp.get.mockResolvedValue({ success: true, data: [] })

    await getMyUsageLogs()

    expect(mockHttp.get).toHaveBeenCalledWith('/public/my/usage-logs')
  })
})