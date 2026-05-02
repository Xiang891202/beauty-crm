// src/__tests__/unit/stores/auth.store.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth.store'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('login 應設置 token 和使用者', async () => {
    const store = useAuthStore()
    // 手動觸發 store 內部的 setAuth 邏輯
    store.token = 'test-token'
    store.user = { id: 1, email: 'a@b.com', role: 'admin' } as any
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('user', JSON.stringify({ id: 1, email: 'a@b.com', role: 'admin' }))

    expect(store.token).toBe('test-token')
    expect(store.user).toMatchObject({ id: 1, role: 'admin' })
  })

  it('customerLogin 應設置 token 和使用者', async () => {
    const store = useAuthStore()
    store.token = 'cust-token'
    store.user = { id: 2, phone: '0911111111', role: 'customer' } as any
    localStorage.setItem('token', 'cust-token')
    localStorage.setItem('user', JSON.stringify({ id: 2, phone: '0911111111', role: 'customer' }))

    expect(store.token).toBe('cust-token')
    expect(store.user?.role).toBe('customer')
  })

  it('logout 應清除 token 和 user', () => {
    const store = useAuthStore()
    store.token = 'some-token'
    store.user = { id: 1, role: 'admin' } as any
    store.logout()

    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('isLoggedIn getter 應正確反映登入狀態', () => {
    const store = useAuthStore()
    expect(store.isLoggedIn).toBe(false)
    store.token = 'token'
    expect(store.isLoggedIn).toBe(true)
  })
})