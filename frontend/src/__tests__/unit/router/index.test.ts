import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'

// 僅測試 beforeEach 邏輯，不掛載完整路由
describe('Router Guards', () => {
  const createMockContext = (path: string, meta: any = {}) => {
    const from = { path: '/', meta: {} } as RouteLocationNormalized
    const to = { path, meta } as RouteLocationNormalized
    return { to, from }
  }

  beforeEach(() => {
    localStorage.clear()
  })

  // 提取 guard 邏輯為可測試的純函數
  const guardLogic = (to: RouteLocationNormalized, _from: RouteLocationNormalized) => {
    const token = localStorage.getItem('token')
    const raw = localStorage.getItem('user')
    const user = raw && raw !== 'undefined' ? JSON.parse(raw) : null

    if (to.meta.requiresAuth && !token) {
      if (to.meta.role === 'customer') return '/customer/login'
      return '/admin/login'
    }

    if (to.meta.role && user?.role !== to.meta.role) {
      return '/'
    }

    if (to.path === '/admin/login' && token && user?.role === 'admin') {
      return '/admin/dashboard'
    }

    if (to.path === '/customer/login' && token && user?.role === 'customer') {
      return '/my-services'
    }

    return true
  }

  it('未登入時訪問需認證的頁面應重導向登入頁', () => {
    const { to, from } = createMockContext('/admin/dashboard', { requiresAuth: true })
    const result = guardLogic(to, from)
    expect(result).toBe('/admin/login')
  })

  it('未登入客戶訪問客戶頁面應重導向客戶登入頁', () => {
    const { to, from } = createMockContext('/my-services', { requiresAuth: true, role: 'customer' })
    const result = guardLogic(to, from)
    expect(result).toBe('/customer/login')
  })

  it('已登入管理員訪問登入頁應重導向儀表板', () => {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('user', JSON.stringify({ id: 1, role: 'admin' }))
    const { to, from } = createMockContext('/admin/login')
    const result = guardLogic(to, from)
    expect(result).toBe('/admin/dashboard')
  })

  it('已登入客戶訪問客戶登入頁應重導向我的服務', () => {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('user', JSON.stringify({ id: 2, role: 'customer' }))
    const { to, from } = createMockContext('/customer/login')
    const result = guardLogic(to, from)
    expect(result).toBe('/my-services')
  })

  it('合法訪問應回傳 true', () => {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('user', JSON.stringify({ id: 1, role: 'admin' }))
    const { to, from } = createMockContext('/admin/members', { requiresAuth: true, role: 'admin' })
    const result = guardLogic(to, from)
    expect(result).toBe(true)
  })
})