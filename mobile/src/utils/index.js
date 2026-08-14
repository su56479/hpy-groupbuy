// 通用工具：图片地址处理、价格格式化、引导标记
import axios from 'axios';

// 读取环境变量（与 api/index.js 保持一致）
const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

// 统一 axios 实例，供 api 调用之外的请求使用（首页 settings 等）
export const http = axios.create({ baseURL: API_BASE || '', timeout: 15000 });
http.interceptors.response.use(
  (resp) => {
    const body = resp.data;
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code === 0) return body.data;
      return Promise.reject(new Error(body.message || '请求失败'));
    }
    return body;
  },
  (err) => Promise.reject(err)
);

/**
 * 处理商品图片地址
 * 后端存储格式如 /uploads/xxx.jpg；若已是完整 URL 则直接返回
 * @param {string} img
 * @returns {string}
 */
export function resolveImg(img) {
  if (!img) return '';
  if (/^https?:\/\//i.test(img)) return img;
  if (img.startsWith('/uploads')) return img;
  if (img.startsWith('/')) return img;
  return '/' + img;
}

/**
 * 价格格式化（保留两位小数）
 * @param {number|string} val
 * @returns {string}
 */
export function formatPrice(val) {
  const n = Number(val || 0);
  return n.toFixed(2);
}

/**
 * 商品名首字（用于无图占位）
 */
export function firstChar(name) {
  if (!name) return '团';
  return name.trim().charAt(0);
}

/* ============ 引导状态（仅引导状态，非订单数据）============ */
const GUIDE_KEY = 'hpy_guided_shown';

/**
 * 判断是否已展示过引导
 */
export function isGuided() {
  try {
    return localStorage.getItem(GUIDE_KEY) === '1';
  } catch (e) {
    return false;
  }
}

/**
 * 标记引导已展示（首次之后不再重复弹出）
 */
export function markGuided() {
  try {
    localStorage.setItem(GUIDE_KEY, '1');
  } catch (e) {
    /* 忽略隐私模式异常 */
  }
}

/**
 * 订单状态文案映射
 */
export function statusText(status) {
  const map = {
    pending_pay: '待支付',
    pending_pickup: '待自提',
    completed: '已完成',
    closed: '已关闭'
  };
  return map[status] || status;
}

/**
 * 订单状态对应标签类型（Vant Tag type）
 */
export function statusTagType(status) {
  const map = {
    pending_pay: 'warning',
    pending_pickup: 'primary',
    completed: 'success',
    closed: 'default'
  };
  return map[status] || 'default';
}
