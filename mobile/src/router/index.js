import { createRouter, createWebHashHistory } from 'vue-router';

// 路由采用 hash 模式，更稳妥地挂在子路径 /m/ 下
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '好朋友集市' }
  },
  {
    path: '/product/:id',
    name: 'product',
    component: () => import('@/views/ProductDetail.vue'),
    meta: { title: '商品详情 · 好朋友集市' }
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('@/views/Checkout.vue'),
    meta: { title: '确认订单 · 好朋友集市' }
  },
  {
    path: '/payment-result',
    name: 'payment-result',
    component: () => import('@/views/PaymentResult.vue'),
    meta: { title: '支付成功 · 好朋友集市' }
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('@/views/Orders.vue'),
    meta: { title: '查订单 · 好朋友集市' }
  },
  {
    path: '/order/:id',
    name: 'order-detail',
    component: () => import('@/views/OrderDetail.vue'),
    meta: { title: '订单详情 · 好朋友集市' }
  },
  {
    path: '/hero-demo',
    name: 'hero-demo',
    component: () => import('@/views/HeroDemo.vue'),
    meta: { title: 'HERO 方案对比 · 好朋友集市' }
  },
  {
    path: '/vip',
    name: 'vip',
    component: () => import('@/views/Vip.vue'),
    meta: { title: 'VIP 会员中心 · 好朋友集市' }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

router.afterEach((to) => {
  const title = to.meta?.title;
  if (title) document.title = title;
});

export default router;
