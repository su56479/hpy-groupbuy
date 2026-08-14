import axios from 'axios'
import { ElMessage } from 'element-plus'
import { state, clearAuth } from '../stores/auth'

// 读取环境变量：GitHub Pages 部署时指定后端公网地址
const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

// 统一 axios 实例
const service = axios.create({
  baseURL: API_BASE ? `${API_BASE}/api` : '/api',
  timeout: 30000
})

// 请求拦截器：自动携带 Authorization
service.interceptors.request.use(
  (config) => {
    if (state.token) {
      config.headers['Authorization'] = 'Bearer ' + state.token
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一处理 code!=0 与 401
service.interceptors.response.use(
  (response) => {
    const res = response.data
    // 文件流（blob）直接返回
    if (res instanceof Blob) return response
    if (res && typeof res === 'object' && 'code' in res) {
      if (res.code === 0) {
        return res
      }
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    // 非标准结构直接返回
    return res
  },
  (error) => {
    const status = error.response && error.response.status
    const data = error.response && error.response.data
    const message = (data && (data.message || data.error)) || error.message
    if (status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      clearAuth()
      // 跳转登录页（hash 模式）
      if (location.hash.indexOf('#/login') === -1) {
        location.hash = '#/login'
      }
    } else if (status === 403) {
      ElMessage.error('无权限执行该操作')
    } else {
      ElMessage.error(message || '网络错误')
    }
    return Promise.reject(error)
  }
)

// ---- 鉴权 ----
export const login = (data) => service.post('/admin/login', data)
export const getMe = () => service.get('/admin/me')

// ---- 商品 ----
export const getProducts = () => service.get('/products', { params: { all: 1 } })
export const getProduct = (id) => service.get(`/products/${id}`)
export const createProduct = (data) => service.post('/products', data)
export const updateProduct = (id, data) => service.put(`/products/${id}`, data)
export const patchProductStatus = (id, status) =>
  service.patch(`/products/${id}/status`, { status })
export const deleteProduct = (id) => service.delete(`/products/${id}`)

// ---- 自提点 ----
export const getPickupPoints = () => service.get('/pickup-points')
export const createPickupPoint = (data) => service.post('/pickup-points', data)
export const updatePickupPoint = (id, data) => service.put(`/pickup-points/${id}`, data)
export const deletePickupPoint = (id) => service.delete(`/pickup-points/${id}`)

// ---- 订单 ----
export const getOrders = (params) => service.get('/orders', { params })
export const getOrder = (id) => service.get(`/orders/${id}`)
export const verifyOrder = (keyword) => service.post('/orders/verify', { keyword })
export const deleteOrder = (id) => service.delete(`/orders/${id}`)

// ---- VIP ----
export const getVipList = (params) => service.get('/vip', { params })
export const grantVip = (data) => service.post('/vip/grant', data)
export const revokeVip = (id) => service.post(`/vip/revoke/${id}`)

// ---- 图片上传 ----
export const uploadImage = (file) => {
  const form = new FormData()
  form.append('file', file)
  return service.post('/upload/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// ---- 导出（blob 下载） ----
export const exportOrders = (params) =>
  service.get('/export/orders', { params, responseType: 'blob' })
export const exportPickupCodes = (params) =>
  service.get('/export/pickup-codes', { params, responseType: 'blob' })
export const exportPurchase = (params) =>
  service.get('/export/purchase', { params, responseType: 'blob' })

// ---- 系统设置：支付宝收款二维码 ----
// 公开接口（无需 token），但仍然复用统一实例以便走代理
export const getAlipayQrcode = () => service.get('/settings/alipay-qrcode')
// 上传支付宝收款二维码（multipart，field='file'，需管理员）
export const uploadAlipayQrcode = (formData) =>
  service.post('/settings/alipay-qrcode', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
// 删除支付宝收款二维码（需管理员）
export const deleteAlipayQrcode = () => service.delete('/settings/alipay-qrcode')

// ---- 系统设置：自提码导出模板 ----
// 获取当前模板状态（需登录）
export const getPickupTemplate = () => service.get('/settings/pickup-template')
// 上传自提码导出模板（multipart，field='file'，仅 .xlsx/.xls，需管理员）
export const uploadPickupTemplate = (formData) =>
  service.post('/settings/pickup-template', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
// 删除自提码导出模板（需管理员）
export const deletePickupTemplate = () => service.delete('/settings/pickup-template')

export default service
