// src/__tests__/unit/components/SignaturePad.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SignaturePad from '@/components/signature/SignaturePad.vue'

const mockClear = vi.fn()
const mockIsEmpty = vi.fn()
const mockToDataURL = vi.fn()

// 將 mock 設定為可被 new 的 class
vi.mock('signature_pad', () => ({
  default: class {
    clear = mockClear
    isEmpty = mockIsEmpty
    toDataURL = mockToDataURL
    penColor = ''
    off = vi.fn()
    on = vi.fn()
    addEventListener = vi.fn()
    removeEventListener = vi.fn()
  },
}))

describe('SignaturePad', () => {
  it('應成功渲染 canvas', () => {
    const wrapper = mount(SignaturePad)
    const canvas = wrapper.find('canvas')
    expect(canvas.exists()).toBe(true)
  })

  it('點擊清除按鈕應呼叫 pad.clear', async () => {
    const wrapper = mount(SignaturePad)
    const clearBtn = wrapper.findAll('button').filter(b => b.text().includes('清除'))[0]
    await clearBtn.trigger('click')
    expect(mockClear).toHaveBeenCalled()
  })

  it('若簽名為空，點擊確認應彈出提示', async () => {
    mockIsEmpty.mockReturnValue(true) // 簽名為空
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const wrapper = mount(SignaturePad)
    const saveBtn = wrapper.findAll('button').filter(b => b.text().includes('確認'))[0]
    await saveBtn.trigger('click')
    expect(alertMock).toHaveBeenCalled()
    alertMock.mockRestore()
  })
})