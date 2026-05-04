import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import SignaturePad from '@/components/signature/SignaturePad.vue'

const mockClear = vi.fn()
const mockIsEmpty = vi.fn()
const mockToDataURL = vi.fn()

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

describe('SignaturePad (新版)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsEmpty.mockReturnValue(false)
    mockToDataURL.mockReturnValue('data:image/png;base64,abc123')
  })

  // 輔助函數：從 modal 中取得指定文字的按鈕
  const getModalButton = (text: string): HTMLButtonElement | undefined => {
    const buttons = document.querySelectorAll('.signature-modal-content button')
    return Array.from(buttons).find(
      (btn) => btn.textContent?.includes(text)
    ) as HTMLButtonElement | undefined
  }

  it('預設渲染灰色觸發區，沒有 canvas', () => {
    const wrapper = mount(SignaturePad)
    expect(wrapper.find('.signature-trigger').exists()).toBe(true)
    expect(wrapper.find('canvas').exists()).toBe(false)
  })

  it('點擊觸發區後打開滿版模態框，canvas 出現', async () => {
    const wrapper = mount(SignaturePad, { attachTo: document.body })
    await wrapper.find('.signature-trigger').trigger('click')
    await nextTick()
    const canvas = document.querySelector('canvas')
    expect(canvas).not.toBeNull()
    wrapper.unmount()
  })

  it('模態框中點擊「清除」按鈕應呼叫 pad.clear', async () => {
    const wrapper = mount(SignaturePad, { attachTo: document.body })
    await wrapper.find('.signature-trigger').trigger('click')
    await nextTick()

    const clearBtn = getModalButton('清除')
    expect(clearBtn).toBeDefined()
    clearBtn!.click()
    expect(mockClear).toHaveBeenCalled()
    wrapper.unmount()
  })

  it('未簽名時點擊「確認」應彈出 alert', async () => {
    mockIsEmpty.mockReturnValue(true)
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const wrapper = mount(SignaturePad, { attachTo: document.body })
    await wrapper.find('.signature-trigger').trigger('click')
    await nextTick()

    const confirmBtn = getModalButton('確認')
    expect(confirmBtn).toBeDefined()
    confirmBtn!.click()
    expect(alertMock).toHaveBeenCalledWith('請先簽名')
    alertMock.mockRestore()
    wrapper.unmount()
  })

  it('已簽名時點擊「確認」應觸發 save 事件、關閉模態框並顯示簽名', async () => {
    mockIsEmpty.mockReturnValue(false)
    const wrapper = mount(SignaturePad, { attachTo: document.body })
    await wrapper.find('.signature-trigger').trigger('click')
    await nextTick()

    const confirmBtn = getModalButton('確認')
    expect(confirmBtn).toBeDefined()
    confirmBtn!.click()

    expect(wrapper.emitted('save')).toBeTruthy()
    expect(wrapper.emitted('save')![0][0]).toBe('data:image/png;base64,abc123')

    await nextTick()
    expect(document.querySelector('.signature-modal-overlay')).toBeNull()
    expect(wrapper.find('.signature-preview').exists()).toBe(true)
    expect(wrapper.find('.signature-preview').attributes('src')).toBe('data:image/png;base64,abc123')

    wrapper.unmount()
  })

  it('點擊「取消」按鈕應關閉模態框且不發送 save', async () => {
    const wrapper = mount(SignaturePad, { attachTo: document.body })
    await wrapper.find('.signature-trigger').trigger('click')
    await nextTick()

    const cancelBtn = getModalButton('取消')
    expect(cancelBtn).toBeDefined()
    cancelBtn!.click()

    await nextTick()
    expect(document.querySelector('.signature-modal-overlay')).toBeNull()
    expect(wrapper.emitted('save')).toBeFalsy()
    wrapper.unmount()
  })
})