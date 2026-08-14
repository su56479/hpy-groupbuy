import { reactive } from 'vue'

// 鉴权状态：token 与角色。token 持久化到 localStorage；订单数据不缓存到本地。
const TOKEN_KEY = 'hpy_admin_token'
const ROLE_KEY = 'hpy_admin_role'
const USERNAME_KEY = 'hpy_admin_username'

export const state = reactive({
  token: localStorage.getItem(TOKEN_KEY) || '',
  role: localStorage.getItem(ROLE_KEY) || '',
  username: localStorage.getItem(USERNAME_KEY) || ''
})

export function setAuth({ token, role, username }) {
  state.token = token
  state.role = role
  state.username = username
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ROLE_KEY, role)
  localStorage.setItem(USERNAME_KEY, username)
}

export function clearAuth() {
  state.token = ''
  state.role = ''
  state.username = ''
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(USERNAME_KEY)
}

export function useAuth() {
  return state
}

// 是否管理员
export function isAdmin() {
  return state.role === 'admin'
}

// 核销员仅可访问订单管理
export function canAccess(path) {
  if (state.role === 'admin') return true
  if (state.role === 'verifier') {
    return path === '/orders' || path.startsWith('/orders')
  }
  return false
}

export default state
