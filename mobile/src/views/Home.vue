<template>
  <div class="page-wrap home-page">
    <!-- ===== 1. TopBar 渐变蓝导航 ===== -->
    <header class="topbar">
      <div class="topbar-inner">
        <div class="topbar-left" @click="scrollTop">
          <div class="logo-circle">好</div>
          <div class="brand">{{ setting.platform_name || '好朋友集市' }}</div>
        </div>
        <div class="search-box" @click="showSearchTip = true">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"></circle>
            <path d="M21 21l-4.3-4.3"></path>
          </svg>
          <span class="ph">搜索好物…</span>
        </div>
        <router-link to="/orders" class="topbar-icon" aria-label="我的订单">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 11l3 3L22 4"></path>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        </router-link>
      </div>
    </header>

    <!-- ===== 2. 菜单栏（可来回切换） ===== -->
    <div class="chips-scroll fade-in" id="chips-scroll">
      <span
        v-for="c in categories"
        :key="c.key"
        class="chip"
        :class="{ active: activeCategory === c.key }"
        @click="onTabChange(c.key)"
      >
        {{ c.label }}
      </span>
    </div>

    <!-- ===== 3. HERO 方案B：双拼卡片版（沃尔玛/超市促销卡结构）+ 后台可配置 ===== -->
    <div class="hero-b fade-in" @click="scrollProducts">
      <div class="left-gradient">
        <div class="left-eyebrow">
          {{ setting.hero_eyebrow || '好朋友 · 精选团购' }}
        </div>
        <div class="left-title" v-html="setting.hero_title || '甄选好物<br/>新鲜直达'"></div>
        <div class="left-sub">
          {{ setting.hero_sub || '今日下单 · 明日自提' }}
        </div>
        <button class="btn-pill small" style="background:#fff; color:#1677FF; margin-top: 12px;">
          {{ setting.hero_btn || '立即选购 →' }}
        </button>
      </div>
      <div class="right-card-stack">
        <div class="card card-top">
          <img
            v-if="setting.hero_image_1"
            :src="resolveImg(setting.hero_image_1)"
            class="fruit-img"
            alt=""
          />
          <div v-else class="fruit-orange-2"></div>
          <div class="card-pill blue" v-if="setting.hero_tag_1">{{ setting.hero_tag_1 }}</div>
          <div class="card-pill blue" v-else>3人拼团</div>
          <div class="price-tag" v-if="setting.hero_price_1">¥{{ setting.hero_price_1 }}<small>起</small></div>
        </div>
        <div class="card card-bottom">
          <img
            v-if="setting.hero_image_2"
            :src="resolveImg(setting.hero_image_2)"
            class="fruit-img"
            alt=""
          />
          <div v-else class="fruit-berry"></div>
          <div class="card-pill red" v-if="setting.hero_tag_2">{{ setting.hero_tag_2 }}</div>
          <div class="card-pill red" v-else>限时特惠</div>
          <div class="price-tag" v-if="setting.hero_price_2">¥{{ setting.hero_price_2 }}<small>起</small></div>
        </div>
        <div class="hot-tag">🔥 HOT</div>
      </div>
    </div>

    <!-- ===== 4. 4 格功能入口 ===== -->
    <div class="quick-grid">
      <div class="quick-item" @click="goPickupTab">
        <div class="icon-circle lg">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 3h15v13H1z"></path>
            <path d="M16 8h4l3 3v5h-7V8z"></path>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        </div>
        <div class="label">自提码</div>
      </div>
      <div class="quick-item" @click="goOrders">
        <div class="icon-circle lg">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="3" width="16" height="18" rx="2"></rect>
            <line x1="8" y1="8" x2="16" y2="8"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
            <line x1="8" y1="16" x2="13" y2="16"></line>
          </svg>
        </div>
        <div class="label">我的订单</div>
      </div>
      <div class="quick-item" @click="openCoupon">
        <div class="icon-circle lg" style="position: relative;">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 10V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 1 0 0 4v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2a2 2 0 1 0 0-4z"></path>
            <path d="M13 7v10"></path>
          </svg>
          <span class="hot-dot"></span>
        </div>
        <div class="label">领券中心</div>
      </div>
      <div class="quick-item" @click="openPickupNearby">
        <div class="icon-circle lg">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div class="label">附近自提点</div>
      </div>
    </div>

    <!-- ===== 5. 栏目头 + 2列商品网格 ===== -->
    <div id="products" class="section-header">
      <div class="title">{{ currentCategoryTitle }}</div>
      <div class="more">查看全部
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </div>
    </div>

    <div class="product-grid" v-if="filteredProducts.length">
      <div
        v-for="p in filteredProducts"
        :key="p.id"
        class="product-card"
        @click="goDetail(p.id)"
      >
        <div class="tag" v-if="p.tag_class">
          <span class="tag-capsule" :class="p.tag_class">{{ p.tag_label }}</span>
        </div>
        <div class="thumb">
          <img v-if="resolveImg(p.main_image)" :src="resolveImg(p.main_image)" :alt="p.name" loading="lazy" />
          <div v-else class="placeholder-char">{{ firstChar(p.name) }}</div>
        </div>
        <div class="name">{{ p.name }}</div>
        <div class="stock">库存 {{ p.stock }} 件</div>
        <div class="meta">
          <div class="price"><small>¥</small>{{ formatPrice(p.price) }}</div>
          <button
            class="qty-btn"
            aria-label="购买"
            @click.stop="goDetail(p.id)"
          >+</button>
        </div>
      </div>
    </div>

    <div v-else class="empty-wrap">
      <div class="empty-cart-circle">
        <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4"></path>
          <path d="M7 13L5.4 5"></path>
          <circle cx="9" cy="20" r="1.5"></circle>
          <circle cx="17" cy="20" r="1.5"></circle>
        </svg>
      </div>
      <div class="empty-title">暂无团购商品</div>
      <div class="empty-sub">换个分类看看或明日再来</div>
    </div>

    <div style="height: 80px"></div>

    <!-- ===== 6. 底部 TabBar（分单删除：首页/自提/订单/VIP） ===== -->
    <nav class="tabbar">
      <div
        class="tab-item"
        :class="{ active: tab === 'home' }"
        @click="switchTab('home')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9.5L12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z"></path>
          <path d="M9 22V12h6v10"></path>
        </svg>
        <span>首页</span>
      </div>
      <div
        class="tab-item"
        :class="{ active: tab === 'pickup' }"
        @click="switchTab('pickup')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
        <span>自提</span>
      </div>
      <div
        class="tab-item"
        :class="{ active: tab === 'orders' }"
        @click="switchTab('orders')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
        <span>订单</span>
      </div>
      <div
        class="tab-item"
        :class="{ active: tab === 'vip' }"
        @click="switchTab('vip')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 3 22 7 12 22 2 7"></polygon>
          <polyline points="2 7 22 7 12 22 5 3"></polyline>
          <path d="M9 12h6"></path>
        </svg>
        <span>VIP</span>
      </div>
    </nav>

    <!-- ===== 领券中心弹窗 ===== -->
    <transition name="fade">
      <div v-if="couponOpen" class="mask" @click.self="couponOpen = false">
        <div class="sheet">
          <div class="sheet-header">
            <div class="sheet-title">领券中心</div>
            <span class="close-btn" @click="couponOpen = false">×</span>
          </div>
          <div class="coupon-list">
            <div
              v-for="(c, idx) in coupons"
              :key="idx"
              class="coupon-card"
              :class="{ claimed: c.claimed }"
            >
              <div class="coupon-left">
                <div class="coupon-amount">
                  <small>¥</small>{{ c.amount }}
                </div>
                <div class="coupon-cond">满{{ c.threshold }}可用</div>
              </div>
              <div class="coupon-right">
                <div class="coupon-name">{{ c.name }}</div>
                <div class="coupon-exp">有效期至 {{ c.expire }}</div>
                <button class="claim-btn" :disabled="c.claimed" @click="c.claimed = true">
                  {{ c.claimed ? '已领取' : '立即领取' }}
                </button>
              </div>
            </div>
          </div>
          <div style="height: 24px"></div>
        </div>
      </div>
    </transition>

    <!-- ===== 附近自提点弹窗 ===== -->
    <transition name="fade">
      <div v-if="nearbyOpen" class="mask" @click.self="nearbyOpen = false">
        <div class="sheet">
          <div class="sheet-header">
            <div class="sheet-title">附近自提点</div>
            <span class="close-btn" @click="nearbyOpen = false">×</span>
          </div>
          <div v-if="!pickupPoints.length" class="empty-wrap">
            <div class="empty-title">暂无自提点</div>
          </div>
          <div v-else class="pickup-list">
            <div
              v-for="p in pickupPoints"
              :key="p.id"
              class="pickup-card"
            >
              <div class="pickup-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div class="pickup-info">
                <div class="pickup-name">{{ p.name }}</div>
                <div class="pickup-addr">📍 {{ p.address }}</div>
                <div class="pickup-contact" v-if="p.contact_phone">📞 {{ p.contact_phone }}</div>
              </div>
              <div class="pickup-distance">{{ p.distance || '1.2km' }}</div>
            </div>
          </div>
          <div style="height: 24px"></div>
        </div>
      </div>
    </transition>

    <!-- 查订单动画引导（全局入口，首次打开时） -->
    <transition name="fade">
      <div v-if="showSearchTip" class="mask mask-soft" @click.self="showSearchTip = false">
        <div class="guide-card bounce-in">
          <div class="guide-arrow-top">↑</div>
          <div class="guide-emoji">🔎</div>
          <div class="guide-title">如何查订单？</div>
          <ol class="guide-steps">
            <li><b>步骤①</b>：点击「<span class="g-blue">底部 Tab 订单</span>」进入订单页</li>
            <li><b>步骤②</b>：输入下单时的 <span class="g-blue">手机号</span>（11 位）</li>
            <li><b>步骤③</b>：点击查询，即可看到所有订单+自提码</li>
          </ol>
          <div class="guide-hand" aria-hidden="true">👇</div>
          <button class="btn-pill primary small" @click="showSearchTip = false; goOrders()">
            好的，去查订单
          </button>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { onMounted, ref, reactive, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/api';
import { firstChar, formatPrice, resolveImg, http } from '@/utils';

const router = useRouter();
const products = ref([]);
const pickupPoints = ref([]);
const activeCategory = ref('all');
const tab = ref('home');

const setting = reactive({
  platform_name: '',
  hero_eyebrow: '',
  hero_title: '',
  hero_sub: '',
  hero_btn: '',
  hero_image_1: '',
  hero_image_2: '',
  hero_tag_1: '',
  hero_tag_2: '',
  hero_price_1: '',
  hero_price_2: ''
});
const showSearchTip = ref(false);
const couponOpen = ref(false);
const nearbyOpen = ref(false);

const categories = [
  { key: 'all', label: '本期团购' },
  { key: 'fresh', label: '生鲜果蔬' },
  { key: 'grain', label: '粮油日用' },
  { key: 'flash', label: '限时特惠' },
  { key: 'drink', label: '乳品饮料' },
  { key: 'more', label: '更多' }
];

const currentCategoryTitle = computed(() => {
  const c = categories.find(x => x.key === activeCategory.value);
  return c ? c.label : '本期团购';
});

const FRESH_KEYS = ['果', '蔬', '菜', '鲜', '肉', '鱼', '鸡', '蛋', '蓝莓', '橙', '苹果', '猕猴桃', '莓'];
const GRAIN_KEYS = ['米', '面', '油', '粮', '粉', '盐', '酱', '醋', '纸', '洗', '日用'];
const DRINK_KEYS = ['奶', '乳', '饮', '咖啡', '茶', '啤酒', '酒', '饮料'];
function hasKey(name, keys) {
  const n = name || '';
  for (const k of keys) if (n.indexOf(k) !== -1) return true;
  return false;
}

const filteredProducts = computed(() => {
  const k = activeCategory.value;
  const list = products.value;
  if (k === 'all') return list;
  if (k === 'fresh') return list.filter((p) => hasKey(p.name, FRESH_KEYS));
  if (k === 'grain') return list.filter((p) => hasKey(p.name, GRAIN_KEYS));
  if (k === 'flash') return list.filter((p) => { const pr = Number(p.price) || 0; return pr < 20 || p.stock < 100; });
  if (k === 'drink') return list.filter((p) => hasKey(p.name, DRINK_KEYS));
  return list;
});

const coupons = ref([
  { name: '新人立减券', amount: 5, threshold: 20, expire: '2026-12-31', claimed: false },
  { name: '团购满减券', amount: 10, threshold: 50, expire: '2026-12-31', claimed: false },
  { name: '超级会员券', amount: 30, threshold: 200, expire: '2026-12-31', claimed: false },
  { name: '生鲜专属券', amount: 8, threshold: 40, expire: '2026-12-31', claimed: false }
]);

function tagFor(p) {
  const price = Number(p.price) || 0;
  if (price < 10) return { label: '限时秒杀', cls: 'orange' };
  if (p.stock < 150) return { label: '3人拼团', cls: 'blue' };
  if (price > 100) return { label: '限时特惠', cls: 'red' };
  return { label: '精选团购', cls: 'soft-blue' };
}

async function loadSettings() {
  try {
    const s = await http.get('/api/settings', {
      params: { keys: ['platform_name','hero_eyebrow','hero_title','hero_sub','hero_btn','hero_image_1','hero_image_2','hero_tag_1','hero_tag_2','hero_price_1','hero_price_2'] }
    });
    Object.assign(setting, s || {});
  } catch (e) {}
}

async function loadProducts() {
  try {
    const res = await api.getProducts({ pageSize: 50 });
    const list = res.items || [];
    list.forEach((p) => {
      const t = tagFor(p);
      p.tag_label = t.label;
      p.tag_class = t.cls;
    });
    products.value = list;
  } catch (e) {
    console.error(e);
  }
}

async function loadPickupPoints() {
  try {
    const list = await api.getPickupPoints();
    pickupPoints.value = Array.isArray(list) ? list : (list.data || []);
  } catch (e) {}
}

function onTabChange(k) {
  activeCategory.value = k;
  const el = document.getElementById('chips-scroll');
  if (el) {
    const target = el.querySelector(`.chip.active`);
    if (target) target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
  // 菜单栏切换时高亮滚动到商品区
  setTimeout(() => {
    const p = document.getElementById('products');
    if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 250);
}

function scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
function scrollProducts() {
  const el = document.getElementById('products');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function goDetail(id) { router.push(`/product/${id}`); }
function goOrders() { router.push('/orders?guide=1'); }
function goPickupTab() { switchTab('pickup'); }
function openCoupon() { couponOpen.value = true; }
function openPickupNearby() { nearbyOpen.value = true; }

function switchTab(t) {
  tab.value = t;
  if (t === 'home') scrollTop();
  if (t === 'pickup' || t === 'orders') router.push(t === 'pickup' ? '/orders?tab=pickup&guide=1' : '/orders?guide=1');
  if (t === 'vip') router.push('/vip');
}

// 首次进入动画引导
watch(() => router.currentRoute.value, (r) => {
  if (r.path === '/' && !sessionStorage.getItem('hp_home_guided')) {
    setTimeout(() => { sessionStorage.setItem('hp_home_guided', '1'); showSearchTip.value = true; }, 400);
  }
}, { immediate: true });

onMounted(() => {
  loadSettings();
  loadProducts();
  loadPickupPoints();
});
</script>

<style scoped>
.home-page { padding-bottom: 0; }
/* 1. TopBar */
.topbar {
  position: sticky; top: 0; z-index: 60;
  background: linear-gradient(135deg, #1677FF 0%, #4096FF 100%);
  padding-top: env(safe-area-inset-top);
}
.topbar-inner {
  height: 58px; padding: 0 14px;
  display: flex; align-items: center; gap: 10px;
}
.logo-circle {
  width: 32px; height: 32px; border-radius: 50%;
  background: #fff; color: #1677FF; font-size: 16px; font-weight: 800;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.10);
}
.brand {
  color: #fff; font-size: 17px; font-weight: 800; letter-spacing: 0.4px;
  margin-right: 6px; white-space: nowrap;
}
.search-box {
  flex: 1; height: 32px; padding: 0 12px;
  display: inline-flex; align-items: center; gap: 6px;
  border-radius: 999px;
  background: rgba(255,255,255,0.22);
  color: rgba(255,255,255,0.85);
  min-width: 0;
}
.search-box .ph {
  font-size: 13px; font-weight: 500; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.topbar-icon {
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(255,255,255,0.22);
  color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* 2. Chips 菜单栏可来回切换 */
.chips-scroll {
  background: #fff;
  padding: 10px 12px;
  position: sticky;
  top: calc(58px + env(safe-area-inset-top));
  z-index: 55;
  box-shadow: 0 1px 0 rgba(0,0,0,0.04);
}

/* 3. HERO 方案B：双拼卡片版 */
.hero-b {
  margin: 14px 12px 8px;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 10px;
  height: 168px;
}
.hero-b .left-gradient {
  position: relative;
  border-radius: 18px;
  background: linear-gradient(135deg, #1677FF 0%, #4096FF 100%);
  padding: 16px 16px 14px;
  color: #fff;
  overflow: hidden;
  box-shadow: 0 14px 30px rgba(22,119,255,0.28);
}
.hero-b .left-gradient::after {
  content: "";
  position: absolute; right: -40px; bottom: -40px;
  width: 180px; height: 180px; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.20), rgba(255,255,255,0) 60%);
}
.left-eyebrow {
  display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
  padding: 3px 10px; background: rgba(255,255,255,0.22);
  border-radius: 999px;
  backdrop-filter: blur(6px);
}
.left-title {
  margin-top: 10px;
  font-size: 24px; line-height: 1.15;
  font-weight: 800; letter-spacing: 0.4px;
}
.left-sub {
  margin-top: 6px; font-size: 12px; opacity: 0.88; font-weight: 500;
}
.hero-b .right-card-stack {
  position: relative;
}
.hero-b .card {
  position: absolute;
  width: 100%;
  border-radius: 16px;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 10px 22px rgba(15, 67, 148, 0.14);
}
.hero-b .card-top {
  top: 0; right: 0;
  height: 100px;
  background: linear-gradient(135deg, #FFF4CE 0%, #FFE6A8 100%);
}
.hero-b .card-bottom {
  bottom: 0; left: 0;
  height: 100px;
  background: linear-gradient(135deg, #FFE1E8 0%, #FFC3D4 100%);
  transform: translateX(14px);
}
.fruit-img { width: 100%; height: 100%; object-fit: cover; }
.card-pill {
  position: absolute; top: 8px; left: 8px;
  padding: 3px 8px; border-radius: 999px;
  font-size: 11px; font-weight: 700;
  color: #fff;
  backdrop-filter: blur(6px);
}
.card-pill.blue { background: rgba(22, 119, 255, 0.88); }
.card-pill.red  { background: rgba(245, 63, 63, 0.88); }
.price-tag {
  position: absolute; right: 8px; bottom: 8px;
  padding: 2px 8px; border-radius: 8px;
  background: rgba(0,0,0,0.55); color: #fff;
  font-size: 12px; font-weight: 800;
  backdrop-filter: blur(4px);
}
.price-tag small { font-size: 9px; font-weight: 500; margin-left: 1px; opacity: 0.85; }
.hot-tag {
  position: absolute; top: -4px; right: -4px; z-index: 4;
  padding: 2px 8px; border-radius: 10px;
  background: #F53F3F; color: #fff; font-size: 11px; font-weight: 700;
  box-shadow: 0 4px 10px rgba(245,63,63,0.35);
}
.fruit-orange-2 {
  position: absolute; right: 10px; top: 14px;
  width: 70px; height: 70px; border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #FFE58A, #FF9F1A 85%);
  box-shadow: inset -6px -10px 20px rgba(255,140,0,0.25);
}
.fruit-orange-2::after {
  content: ""; position: absolute; top: -8px; left: 50%; transform: translateX(-60%) rotate(-20deg);
  width: 16px; height: 12px; border-radius: 50%;
  background: linear-gradient(145deg, #33C74F, #1BA53C);
  clip-path: polygon(50% 0, 100% 45%, 85% 100%, 0 80%, 20% 30%);
}
.fruit-berry {
  position: absolute; left: 14px; top: 14px;
  width: 70px; height: 70px; border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #FF5B77, #C60E32 85%);
  box-shadow: inset -6px -10px 20px rgba(130,10,30,0.25);
}
.fruit-berry::before {
  content: ""; position: absolute; top: -2px; left: 10px; width: 12px; height: 12px; background: #1BA53C; clip-path: polygon(50% 0, 100% 45%, 85% 100%, 0 80%, 20% 30%); transform: rotate(-20deg);
}

/* 4格入口 */
.quick-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 8px; padding: 6px 12px 4px;
}
.quick-item {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 10px 0; gap: 6px; cursor: pointer;
}
.quick-item .label { font-size: 12px; color: #4E5969; font-weight: 500; }
.hot-dot {
  position: absolute; top: 4px; right: 4px;
  width: 10px; height: 10px; border-radius: 50%;
  background: #F53F3F; border: 2px solid #fff;
  box-sizing: border-box;
}

/* 栏目头 */
#products.section-header {
  padding: 16px 14px 10px;
}
#products.section-header .title {
  position: relative; font-size: 18px; font-weight: 800;
  color: #1D2129; padding-left: 10px;
}
#products.section-header .title::before {
  content: ""; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
  width: 3px; height: 16px; border-radius: 3px;
  background: linear-gradient(180deg, #1677FF, #4096FF);
}
#products.section-header .more {
  color: #1677FF; font-weight: 600; font-size: 13px;
  display: inline-flex; align-items: center; gap: 2px;
}

/* 空态 */
.empty-wrap { padding: 40px 16px 60px; text-align: center; }
.empty-cart-circle {
  width: 140px; height: 140px; margin: 0 auto 16px; border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, rgba(22,119,255,0.10), rgba(22,119,255,0.02) 70%);
  color: #1677FF;
  display: inline-flex; align-items: center; justify-content: center;
}
.empty-title { font-size: 15px; font-weight: 700; color: #1D2129; }
.empty-sub { margin-top: 4px; color: #86909C; font-size: 13px; }

/* 底部 TabBar（4 项：首页/自提/订单/VIP） */
.tabbar {
  position: fixed; left: 0; right: 0; bottom: 0;
  background: #fff; border-top: 1px solid #F2F3F5;
  z-index: 80; padding-bottom: env(safe-area-inset-bottom);
  display: grid; grid-template-columns: repeat(4, 1fr);
}
.tab-item {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 6px 0 4px; gap: 2px;
  color: #86909C; font-size: 11px; font-weight: 500;
  position: relative; cursor: pointer;
}
.tab-item.active { color: #1677FF; font-weight: 800; }
.tab-item.active::after {
  content: ""; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 22px; height: 3px; border-radius: 0 0 3px 3px;
  background: linear-gradient(135deg, #1677FF, #4096FF);
}
.tab-item svg { width: 22px; height: 22px; }

/* 通用按钮 */
.btn-pill {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 7px 16px; border-radius: 999px; border: none;
  font-size: 13px; font-weight: 700; cursor: pointer;
  box-shadow: 0 6px 14px rgba(22,119,255,0.25);
}
.btn-pill.primary { background: linear-gradient(135deg, #1677FF, #4096FF); color: #fff; }
.btn-pill.small { padding: 5px 12px; font-size: 12px; }

/* 弹窗蒙版 + 底部 sheet */
.mask {
  position: fixed; inset: 0; background: rgba(0, 20, 50, 0.45);
  z-index: 200; display: flex; align-items: flex-end; justify-content: center;
}
.mask-soft {
  align-items: center;
  background: rgba(0, 20, 50, 0.22);
  backdrop-filter: blur(2px);
}
.sheet {
  width: 100%;
  max-width: 480px;
  background: #fff;
  border-radius: 22px 22px 0 0;
  padding: 14px 16px;
  max-height: 80vh; overflow-y: auto;
  animation: sheetUp 0.3s ease;
}
@keyframes sheetUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
.sheet-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 4px 4px 12px;
}
.sheet-title { font-size: 16px; font-weight: 800; color: #1D2129; }
.close-btn {
  width: 30px; height: 30px; border-radius: 50%;
  background: #F2F3F5; color: #4E5969;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 22px; line-height: 1; cursor: pointer;
}

/* 券 */
.coupon-list { display: flex; flex-direction: column; gap: 12px; }
.coupon-card {
  display: grid; grid-template-columns: 100px 1fr;
  background: linear-gradient(135deg, #EFF5FF 0%, #F0F7FF 100%);
  border-radius: 14px; overflow: hidden;
  position: relative;
  border: 1px dashed rgba(22,119,255,0.25);
}
.coupon-card.claimed { opacity: 0.55; filter: grayscale(0.3); }
.coupon-left {
  background: linear-gradient(135deg, #1677FF 0%, #4096FF 100%);
  color: #fff; padding: 14px 10px; text-align: center;
  position: relative;
}
.coupon-left::before, .coupon-left::after {
  content: ""; position: absolute; right: -7px; width: 14px; height: 14px;
  background: #fff; border-radius: 50%;
}
.coupon-left::before { top: -7px; }
.coupon-left::after  { bottom: -7px; }
.coupon-amount {
  font-size: 30px; font-weight: 900; line-height: 1; margin-top: 4px;
}
.coupon-amount small { font-size: 14px; font-weight: 600; margin-right: 2px; opacity: 0.9; }
.coupon-cond { font-size: 11px; margin-top: 6px; opacity: 0.9; }
.coupon-right { padding: 12px 14px; display: flex; flex-direction: column; gap: 4px; justify-content: space-between; }
.coupon-name { font-size: 14px; font-weight: 700; color: #1D2129; }
.coupon-exp { font-size: 11px; color: #86909C; }
.claim-btn {
  margin-top: 6px; align-self: flex-start;
  padding: 4px 14px; border-radius: 999px;
  background: linear-gradient(135deg, #1677FF, #4096FF);
  color: #fff; border: none; font-size: 12px; font-weight: 700;
  box-shadow: 0 4px 10px rgba(22,119,255,0.25);
}
.claim-btn:disabled {
  background: #C9CDD4; box-shadow: none; cursor: not-allowed;
}

/* 附近自提点列表 */
.pickup-list { display: flex; flex-direction: column; gap: 10px; }
.pickup-card {
  display: grid; grid-template-columns: 44px 1fr auto;
  gap: 12px; align-items: center;
  padding: 12px; border-radius: 14px;
  background: #F7FAFF; border: 1px solid #E6EEFB;
}
.pickup-icon {
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg, #1677FF, #4096FF);
  color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
}
.pickup-name { font-size: 14px; font-weight: 700; color: #1D2129; }
.pickup-addr { font-size: 12px; color: #4E5969; margin-top: 3px; }
.pickup-contact { font-size: 12px; color: #1677FF; margin-top: 3px; }
.pickup-distance {
  padding: 3px 10px; border-radius: 999px;
  background: #E6EEFB; color: #1677FF;
  font-size: 12px; font-weight: 700;
}

/* 查订单动画引导 */
.guide-card {
  width: 86%;
  max-width: 360px;
  background: #fff;
  border-radius: 22px;
  padding: 22px 22px 20px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(22, 48, 100, 0.28);
  position: relative;
}
.guide-arrow-top {
  position: absolute; top: -26px; left: 32px;
  color: #fff; font-size: 32px;
  animation: bounceDown 1.2s infinite ease;
  text-shadow: 0 4px 12px rgba(22,119,255,0.35);
}
@keyframes bounceDown {
  0%, 100% { transform: translateY(-8px); }
  50% { transform: translateY(4px); }
}
.guide-emoji { font-size: 38px; margin-bottom: 6px; }
.guide-title { font-size: 18px; font-weight: 800; color: #1D2129; }
.guide-steps {
  list-style: none; margin: 14px 0; padding: 0;
  text-align: left; display: flex; flex-direction: column; gap: 8px;
}
.guide-steps li {
  font-size: 13px; color: #4E5969; line-height: 1.5;
  padding: 8px 12px; border-radius: 12px;
  background: #F6F8FB;
}
.guide-steps li b { color: #1677FF; font-weight: 700; margin-right: 2px; }
.g-blue { color: #1677FF; font-weight: 700; }
.guide-hand {
  font-size: 28px;
  animation: handTap 1.2s infinite ease;
  margin: 6px 0 10px;
}
@keyframes handTap {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}

.bounce-in { animation: bounceIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes bounceIn {
  0%   { transform: scale(0.7); opacity: 0; }
  60%  { transform: scale(1.06); opacity: 1; }
  100% { transform: scale(1); }
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 通用 fade-in 入场（在 global.css 也有，这里再加一道防御） */
.fade-in { animation: fadeIn 0.5s ease both; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
</style>
