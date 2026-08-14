import axios from 'axios';

// 读取环境变量：生产部署到 GitHub Pages 时可指定后端公网域名
// 未配置则走同源（与前端部署在同一台服务器）
const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

// axios 实例
const http = axios.create({
  baseURL: API_BASE || '',
  timeout: 15000
});

// 响应拦截：统一处理 { code, data, message } 契约
http.interceptors.response.use(
  (resp) => {
    const body = resp.data;
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code === 0) return body.data;
      const err = new Error(body.message || '请求失败');
      err.code = body.code;
      return Promise.reject(err);
    }
    return body;
  },
  (error) => {
    const msg =
      error?.response?.data?.message || error?.message || '网络异常，请稍后重试';
    return Promise.reject(new Error(msg));
  }
);

// 业务 API 封装
export const api = {
  // 商品
  getProducts() {
    return http.get('/api/products');
  },
  getProduct(id) {
    return http.get(`/api/products/${id}`);
  },
  // 自提点
  getPickupPoints() {
    return http.get('/api/pickup-points');
  },
  // 订单
  createOrder(payload) {
    return http.post('/api/orders', payload);
  },
  getOrdersByPhone(phone) {
    return http.get('/api/orders/by-phone', { params: { phone } });
  },
  getOrder(id) {
    return http.get(`/api/orders/${id}`);
  },
  // VIP
  checkVip(phone) {
    return http.get('/api/vip/check', { params: { phone } });
  }
};

export { http };
export default http;
