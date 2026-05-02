import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useIdleTimeout } from '@/composables/useIdleTimeout'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

// Mock auth store
const mockLogout = vi.fn()
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn(() => ({
    logout: mockLogout,
  })),
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('useIdleTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('應該在 10 分鐘閒置後顯示對話框', async () => {
    // 模擬已登入
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('user', JSON.stringify({ id: 1, role: 'customer' }))

    const { startMonitoringIfNeeded } = useIdleTimeout()
    startMonitoringIfNeeded()

    // 快轉 10 分鐘
    vi.advanceTimersByTime(10 * 60 * 1000)

    // 驗證是否建立了 overlay
    const overlay = document.querySelector('div[style*="z-index: 9999"]')
    expect(overlay).not.toBeNull()
    expect(overlay?.textContent).toContain('閒置')

    // 清除 overlay（避免影響其他測試）
    overlay?.remove()
  })

  it('若無 token，startMonitoringIfNeeded 不應啟動監控', () => {
    const { startMonitoringIfNeeded } = useIdleTimeout()
    startMonitoringIfNeeded()

    // 快轉時間
    vi.advanceTimersByTime(10 * 60 * 1000)

    // 不應該出現 overlay
    const overlay = document.querySelector('div[style*="z-index: 9999"]')
    expect(overlay).toBeNull()
  })

  it('點擊「繼續使用」應關閉對話框並重置計時器', async () => {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('user', JSON.stringify({ id: 1, role: 'customer' }))

    const { startMonitoringIfNeeded } = useIdleTimeout()
    startMonitoringIfNeeded()

    vi.advanceTimersByTime(10 * 60 * 1000)

    const overlay = document.querySelector('div[style*="z-index: 9999"]')
    expect(overlay).not.toBeNull()

    // 點擊「繼續使用」按鈕
    const continueBtn = overlay?.querySelector('button') // 第一個按鈕是繼續使用
    continueBtn?.dispatchEvent(new MouseEvent('click'))

    // 驗證 overlay 被移除
    expect(document.querySelector('div[style*="z-index: 9999"]')).toBeNull()
  })
})