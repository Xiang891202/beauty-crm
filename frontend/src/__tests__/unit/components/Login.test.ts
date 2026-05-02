import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import Login from '@/views/admin/auth/Login.vue'

// Mock router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock auth store
const mockLogin = vi.fn()
const mockLogout = vi.fn()
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => ({
    login: mockLogin,
    logout: mockLogout,
    user: { role: 'admin' },
  }),
}))

describe('Login.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('應渲染登入表單', () => {
    const wrapper = mount(Login)
    expect(wrapper.find('h2').text()).toBe('管理員登入')
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
  })

  it('提交表單應呼叫 authStore.login', async () => {
    mockLogin.mockResolvedValue({})
    const wrapper = mount(Login)

    await wrapper.find('input[type="email"]').setValue('test@test.com')
    await wrapper.find('input[type="password"]').setValue('password')
    await wrapper.find('form').trigger('submit.prevent')

    expect(mockLogin).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password' })
  })

  it('登入失敗應顯示錯誤訊息', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'))
    const wrapper = mount(Login)

    await wrapper.find('input[type="email"]').setValue('test@test.com')
    await wrapper.find('input[type="password"]').setValue('wrong')
    await wrapper.find('form').trigger('submit.prevent')

    await wrapper.vm.$nextTick()
    expect(wrapper.find('.error').text()).toContain('Invalid credentials')
  })
})