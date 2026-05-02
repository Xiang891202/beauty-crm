import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UsageList from '@/views/admin/usage/UsageList.vue'
import BaseButton from '@/components/common/BaseButton.vue'

// Mock API
vi.mock('@/api/modules/usage', () => ({
  getUsageList: vi.fn(),
}))

import { getUsageList } from '@/api/modules/usage'
const mockGetUsageList = getUsageList as any

describe('UsageList.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('應顯示載入中狀態', () => {
    mockGetUsageList.mockResolvedValue(new Promise(() => {})) // 永遠 pending
    const wrapper = mount(UsageList, {
      global: {
        components: { BaseButton },
      },
    })
    expect(wrapper.find('.loading').exists()).toBe(true)
  })

  it('無資料時應顯示空狀態', async () => {
    mockGetUsageList.mockResolvedValue({
      success: true,
      data: { items: [], total: 0 },
    })
    const wrapper = mount(UsageList, {
      global: {
        components: { BaseButton },
      },
    })

    // 等待非同步
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.empty').exists()).toBe(true)
  })

  it('應正確渲染使用記錄列表', async () => {
    const mockRecords = [
      {
        id: 'log-1',
        type: 'traditional',
        occurred_at: '2026-05-20 10:00:00',
        customer_name: '王美美',
        title: '使用服務：臉部保濕',
        description: '使用項目：臉部保濕',
        notes: '測試備註',
        signature_url: null,
      },
      {
        id: 'log-2',
        type: 'package',
        occurred_at: '2026-05-20 11:00:00',
        customer_name: '張三',
        title: '組合包使用：美白組',
        description: '使用項目：去角質',
        notes: null,
        signature_url: 'https://example.com/sig.png',
      },
    ]
    mockGetUsageList.mockResolvedValue({
      success: true,
      data: { items: mockRecords, total: 2 },
    })

    const wrapper = mount(UsageList, {
      global: {
        components: { BaseButton },
      },
    })

    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    const cards = wrapper.findAll('.record-card')
    expect(cards).toHaveLength(2)
  })
})