import { createRouter, createWebHashHistory } from 'vue-router'
import { state, canAccess } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    component: () => import('../layout/index.vue'),
    redirect: '/orders',
    children: [
      {
        path: 'products',
        name: 'products',
        component: () => import('../views/Products.vue'),
        meta: { title: '商品管理', role: 'admin' }
      },
      {
        path: 'orders',
        name: 'orders',
        component: () => import('../views/Orders.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'vip',
        name: 'vip',
        component: () => import('../views/Vip.vue'),
        meta: { title: 'VIP管理', role: 'admin' }
      },
      {
        path: 'pickup-points',
        name: 'pickup-points',
        component: () => import('../views/PickupPoints.vue'),
        meta: { title: '自提点管理', role: 'admin' }
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('../views/Settings.vue'),
        meta: { title: '系统设置', role: 'admin' }
      }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/orders' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 全局前置守卫：无 token 跳登录；核销员访问受限页跳转
router.beforeEach((to, from, next) => {
  const hasToken = !!state.token
  if (to.meta.public) {
    // 已登录访问登录页则回首页
    if (to.name === 'login' && hasToken) return next('/orders')
    return next()
  }
  if (!hasToken) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }
  // 角色限制：核销员仅订单页
  if (to.meta.role === 'admin' && state.role !== 'admin') {
    return next('/orders')
  }
  if (!canAccess(to.path)) {
    return next('/orders')
  }
  next()
})

export default router
