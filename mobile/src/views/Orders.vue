<template>
  <div class="orders page-wrap">
    <!-- 顶部：蓝渐变导航 + 动画指引按钮 -->
    <header class="page-topbar">
      <div class="topbar-inner">
        <router-link to="/" class="icon-btn" aria-label="返回">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </router-link>
        <div class="page-title">{{ currentTab === 'pickup' ? '查自提' : '我的订单' }}</div>
        <button class="icon-btn" @click="showGuide = true" aria-label="如何查订单">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </button>
      </div>
    </header>

    <!-- Tab：订单 / 自提码查询 -->
    <div class="tab-switch" role="tablist">
      <button
        role="tab"
        :class="{ active: currentTab === 'orders' }"
        @click="switchTab('orders')"
      >
        📋 我的订单
      </button>
      <button
        role="tab"
        :class="{ active: currentTab === 'pickup' }"
        @click="switchTab('pickup')"
      >
        🏷️ 自提码查询
      </button>
    </div>

    <!-- 搜索卡：支持手机号 / 自提码 / 订单号 -->
    <div class="search-card">
      <div class="search-tip">
        <svg class="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 9V7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7V9M5 9H19C20.1046 9 21 9.89543 21 11V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V11C3 9.89543 3.89543 9 5 9Z"/>
          <circle cx="12" cy="15" r="1.5" fill="currentColor"/>
        </svg>
        <span v-if="currentTab==='orders'">输入下单手机号即可查询，订单仅服务端保存</span>
        <span v-else>输入【自提码】即可查询订单状态（如 HPY1234）</span>
      </div>
      <div class="search-wrap" :class="{ highlight: showSearchGuide }">
        <svg viewBox="0 0 24 24" width="16" height="16" class="search-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7"></circle>
          <path d="M21 21l-4.3-4.3"></path>
        </svg>
        <input
          v-model="keyword"
          :type="currentTab==='orders' ? 'tel' : 'text'"
          :maxlength="currentTab==='orders' ? 11 : 32"
          :placeholder="currentTab==='orders' ? '请输入 11 位下单手机号' : '请输入自提码 / 手机号 / 订单号'"
          class="search-input"
          @keyup.enter="onSearch"
          ref="searchInputRef"
        />
        <button class="search-btn" @click="onSearch">
          <span v-if="!loading">查询</span>
          <span v-else>查询中…</span>
        </button>
      </div>
    </div>

    <!-- 自提 Tab：展示自提码高亮提示查询方式 -->
    <div v-if="currentTab === 'pickup' && !searched" class="pickup-guide-card fade-in">
      <div class="pg-title">🏷️ 自提码查询</div>
      <ul class="pg-list">
        <li>自提码格式：<b class="g-blue">HPY + 手机号后 4 位</b></li>
        <li>例如手机号 138****1234 → 自提码 <b class="g-blue">HPY1234</b></li>
        <li>可直接输入 <b class="g-blue">HPYxxxx</b> / 手机号 / 订单号 任一查询</li>
      </ul>
    </div>

    <!-- 查询结果 -->
    <div v-if="searched">
      <van-skeleton v-if="loading" title :row="3" v-for="n in 2" :key="n" class="skeleton-item" />
      <div v-else-if="orders.length === 0" class="empty-wrap">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="bag-svg">
            <path d="M6 7L7.5 3.5C7.77614 2.89209 8.40415 2.5 9.05278 2.5H14.9472C15.5959 2.5 16.2239 2.89209 16.5 3.5L18 7M5 7H19L20.5 19.5C20.6128 20.3382 19.9344 21 19.0923 21H4.90774C4.06556 21 3.38716 20.3382 3.50002 19.5L5 7Z"/>
            <path d="M9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12"/>
          </svg>
        </div>
        <div class="empty-title">暂无匹配订单</div>
        <div class="empty-sub">请确认手机号 / 自提码是否正确</div>
      </div>

      <transition-group name="list" tag="div">
        <div
          v-for="(o, index) in orders"
          :key="o.id"
          class="order-card fade-in"
          :style="{ animationDelay: (index * 40) + 'ms' }"
          @click="goDetail(o)"
        >
          <div class="order-head">
            <span class="order-no">订单号：{{ o.order_no }}</span>
            <span :class="['status-tag', statusTagClass(o.status)]">{{ statusText(o.status) }}</span>
          </div>

          <div class="order-goods">
            <div
              v-for="(it, idx) in o.items.slice(0, 4)"
              :key="idx"
              class="goods-item"
            >
              <div class="goods-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="goods-svg">
                  <path d="M6 7L7.5 3.5C7.77614 2.89209 8.40415 2.5 9.05278 2.5H14.9472C15.5959 2.5 16.2239 2.89209 16.5 3.5L18 7M5 7H19L20.5 19.5C20.6128 20.3382 19.9344 21 19.0923 21H4.90774C4.06556 21 3.38716 20.3382 3.50002 19.5L5 7Z"/>
                </svg>
              </div>
              <div class="goods-info">
                <div class="g-name">{{ it.product_name }}</div>
                <div class="g-spec" v-if="it.sku_spec">{{ it.sku_spec }}</div>
              </div>
              <div class="goods-price">
                <div class="g-price">¥{{ formatPrice(it.unit_price || it.price || o.total_amount) }}</div>
                <div class="g-qty">×{{ it.quantity }}</div>
              </div>
            </div>
            <div v-if="o.items.length > 4" class="goods-more">共{{ o.items.length }}件商品</div>
          </div>

          <div class="order-foot">
            <div class="foot-left">
              <div class="pickup-code-mini">
                <div class="mini-code">{{ o.pickup_code }}</div>
                <div class="mini-tip">自提码</div>
              </div>
              <div class="foot-point">📍 {{ o.pickup_point_name }}</div>
            </div>
            <div class="foot-right">
              <div class="foot-amount">
                <span class="amt-label">实付</span>
                <span class="price"><span class="symbol">¥</span>{{ formatPrice(o.total_amount) }}</span>
              </div>
              <button
                v-if="o.status === 'pending_pay'"
                class="btn-pill small pay-btn"
                @click.stop="onPay(o)"
              >去支付</button>
              <button
                v-else
                class="btn-pill small outline"
                @click.stop="goDetail(o)"
              >详情</button>
            </div>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- 初始空态：引导动画 -->
    <div v-else class="empty-wrap initial-empty">
      <div class="initial-empty-deco" aria-hidden="true">
        <div class="circle c1"></div>
        <div class="circle c2"></div>
        <div class="big-hand">👇</div>
      </div>
      <div class="empty-title">输入手机号查询您的订单</div>
      <div class="empty-sub">或点击右上角 <b>?</b> 查看「如何查订单」指引</div>
    </div>

    <!-- 如何查订单：动画引导弹窗（步骤动画） -->
    <transition name="fade">
      <div v-if="showGuide" class="guide-mask" @click.self="showGuide = false">
        <div class="guide-card bounce-in">
          <div class="guide-head">
            <div class="guide-emoji">🔎</div>
            <div class="guide-title">如何查订单 / 自提码？</div>
            <span class="close-btn" @click="showGuide = false">×</span>
          </div>

          <!-- 步骤切换：左右箭头 -->
          <div class="steps-wrap">
            <div
              v-for="(s, i) in guideSteps"
              :key="i"
              class="step-slot"
              :class="{ active: guideStep === i, prev: guideStep > i }"
            >
              <div class="step-title">
                <span class="step-index">{{ i + 1 }}</span>
                <span>{{ s.title }}</span>
              </div>
              <div class="step-desc" v-html="s.desc"></div>
              <div class="step-figure">
                <component :is="s.figure" />
              </div>
            </div>
          </div>

          <!-- 指示器 -->
          <div class="dots">
            <span
              v-for="(_, i) in guideSteps"
              :key="i"
              :class="{ active: i === guideStep }"
              @click="guideStep = i"
            ></span>
          </div>

          <div class="guide-footer">
            <button class="btn-pill small outline" @click="prevStep" :disabled="guideStep === 0">上一步</button>
            <button
              v-if="guideStep < guideSteps.length - 1"
              class="btn-pill small primary"
              @click="nextStep"
            >下一步 →</button>
            <button
              v-else
              class="btn-pill small primary"
              @click="showGuide = false; activeInput();"
            >好的，去查询</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 搜索框高亮脉冲（引导时） -->
    <transition name="fade">
      <div v-if="showSearchGuide" class="pulse-guide" @click="showSearchGuide = false">
        <div class="pulse-ring r1"></div>
        <div class="pulse-ring r2"></div>
        <div class="pulse-hint">点这里输入👇</div>
      </div>
    </transition>

    <div style="height: 100px"></div>

    <!-- 底部导航栏（固定，与首页保持一致，可来回切换） -->
    <nav class="tabbar">
      <div
        class="tab-item"
        :class="{ active: activeFooter === 'home' }"
        @click="router.push('/')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z"></path><path d="M9 22V12h6v10"></path></svg>
        <span>首页</span>
      </div>
      <div
        class="tab-item"
        :class="{ active: activeFooter === 'pickup' }"
        @click="switchTab('pickup')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        <span>自提</span>
      </div>
      <div
        class="tab-item"
        :class="{ active: activeFooter === 'orders' }"
        @click="switchTab('orders')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
        <span>订单</span>
      </div>
      <div
        class="tab-item"
        :class="{ active: activeFooter === 'vip' }"
        @click="router.push('/vip')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 3 22 7 12 22 2 7"></polygon><path d="M9 12h6"></path></svg>
        <span>VIP</span>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, h, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { api, http } from '@/api';
import { formatPrice, statusText, statusTagType } from '@/utils';

const router = useRouter();
const route = useRoute();

const currentTab = ref('orders');
const activeFooter = computed(() => currentTab.value);
const keyword = ref('');
const orders = ref([]);
const loading = ref(false);
const searched = ref(false);
const showGuide = ref(false);
const showSearchGuide = ref(false);
const guideStep = ref(0);
const searchInputRef = ref(null);

// ---- 首次进入引导（按 query.guide=1） ----
onMounted(() => {
  if (route.query.tab === 'pickup') currentTab.value = 'pickup';
  if (route.query.guide === '1') {
    setTimeout(() => { showGuide.value = true; }, 300);
  }
});

// ---- 查订单动画引导的步骤 ----
const guideSteps = [
  {
    title: '打开订单 / 自提页面',
    desc: '点击底部「<b class="g-blue">订单</b>」或「<b class="g-blue">自提</b>」Tab 进入查询页',
    figure: () => h('div', { class: 'fig-mobile' }, [
      h('div', { class: 'fig-tabbar' }, [
        h('div', {}, '首页'),
        h('div', { class: 'hi' }, '自提'),
        h('div', { class: 'hi active' }, '订单'),
        h('div', {}, 'VIP'),
      ]),
      h('div', { class: 'fig-arrow' }, '👆')
    ])
  },
  {
    title: '输入下单用的手机号',
    desc: '在上方输入框输入 11 位<b class="g-blue">下单手机号</b>；查自提码可直接输入 <b class="g-blue">HPYxxxx</b> 或 手机号 / 订单号',
    figure: () => h('div', { class: 'fig-search' }, [
      h('div', { class: 'fs-bar' }, [
        h('span', { class: 'ph' }, '请输入 138****1234'),
        h('button', { class: 'sb' }, '查询')
      ]),
      h('div', { class: 'fig-hand' }, '👇 在这里输入')
    ])
  },
  {
    title: '点击查询查看订单',
    desc: '点击查询按钮，订单列表会<b class="g-blue">依次滑动出现</b>。每单都有<b class="g-blue">自提码</b>，自提时出示即可～',
    figure: () => h('div', { class: 'fig-cards' }, [
      h('div', { class: 'fc one' }),
      h('div', { class: 'fc two' }),
      h('div', { class: 'fc three' }),
    ])
  }
];
function nextStep() {
  if (guideStep.value < guideSteps.length - 1) {
    guideStep.value++;
    if (guideStep.value === 1) {
      showSearchGuide.value = true;
      setTimeout(() => showSearchGuide.value = false, 1800);
    }
  }
}
function prevStep() {
  if (guideStep.value > 0) guideStep.value--;
}
function switchTab(t) {
  currentTab.value = t;
  keyword.value = '';
  orders.value = [];
  searched.value = false;
  nextTick(() => activeInput());
}
function activeInput() {
  searchInputRef.value?.focus?.();
}

// ---- 查询：通用支持 手机号 / 自提码 / 订单号 ----
async function onSearch() {
  const kw = keyword.value.trim();
  if (!kw) { showToast('请输入手机号 / 自提码 / 订单号'); return; }

  let list = [];
  loading.value = true;
  searched.value = true;
  try {
    if (currentTab.value === 'pickup') {
      // 查自提码：复用后端搜索接口（by-keyword 等价于 /orders/search）
      // 这里用后端 search 接口（下面实现了 search 路由；否则 fallback 到 by-phone 并前端过滤）
      try {
        const resp = await http.post('/api/orders/search', { keyword: kw });
        list = Array.isArray(resp) ? resp : (resp?.items || []);
      } catch (_) {
        if (/^1\d{10}$/.test(kw)) list = (await api.getOrdersByPhone(kw)) || [];
      }
    } else {
      if (!/^1\d{10}$/.test(kw)) {
        showToast('请输入正确的 11 位手机号');
        searched.value = false;
        loading.value = false;
        return;
      }
      list = (await api.getOrdersByPhone(kw)) || [];
    }
    orders.value = list;
    if (list.length === 0) {
      showToast(currentTab.value === 'orders' ? '没有找到订单，请确认手机号' : '没有匹配的自提码 / 订单');
    }
  } catch (e) {
    showToast(e.message || '查询失败');
    orders.value = [];
  } finally {
    loading.value = false;
  }
}

function goDetail(o) { router.push(`/order/${o.id}`); }
function onPay(o) {
  window.location.href = '/api/payment/pay?order_no=' + o.order_no;
}

function statusTagClass(status) {
  switch (status) {
    case 'pending_pay': return 'orange';
    case 'pending_pickup': return 'blue';
    case 'completed': return 'green';
    case 'closed': return 'gray';
    default: return 'gray';
  }
}
</script>

<style scoped>
.orders {
  min-height: 100vh;
  background: #F6F8FB;
  padding-bottom: 30px;
  position: relative;
}

/* 顶部蓝白渐变导航 */
.page-topbar {
  background: linear-gradient(135deg, #1677FF 0%, #4096FF 100%);
  padding-top: env(safe-area-inset-top);
  color: #fff;
  position: sticky; top: 0; z-index: 60;
}
.topbar-inner {
  height: 58px; padding: 0 10px;
  display: flex; align-items: center; justify-content: space-between;
}
.icon-btn {
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(255,255,255,0.22);
  color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  border: none;
}
.page-title { font-size: 17px; font-weight: 800; letter-spacing: 0.4px; }

/* 订单/自提 Tab */
.tab-switch {
  background: #fff;
  padding: 10px 12px 12px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
  border-bottom: 1px solid #F2F3F5;
}
.tab-switch button {
  border: none; border-radius: 14px;
  height: 40px;
  font-size: 14px; font-weight: 700;
  background: #F2F3F5; color: #4E5969;
}
.tab-switch button.active {
  background: linear-gradient(135deg, #1677FF 0%, #4096FF 100%);
  color: #fff;
  box-shadow: 0 6px 14px rgba(22,119,255,0.22);
}

/* 搜索卡 */
.search-card {
  background: #fff;
  margin: 12px;
  border-radius: 18px;
  padding: 14px 14px 16px;
  box-shadow: 0 8px 22px rgba(15, 67, 148, 0.07);
}
.search-tip {
  display: flex; align-items: center; justify-content: center;
  gap: 6px; color: #1677FF; font-size: 12px; font-weight: 600;
  margin-bottom: 12px;
}
.lock-icon { width: 14px; height: 14px; }
.search-wrap {
  display: flex; align-items: center; gap: 8px;
  background: #F0F7FF;
  border: 1.5px solid #D6E6FB;
  border-radius: 999px;
  padding: 4px 4px 4px 12px;
  height: 44px;
  transition: all 0.2s ease;
  position: relative;
}
.search-wrap.highlight {
  border-color: #1677FF;
  box-shadow: 0 0 0 4px rgba(22,119,255,0.14);
  animation: hiPulse 1.4s ease 2;
}
@keyframes hiPulse {
  0%,100% { box-shadow: 0 0 0 4px rgba(22,119,255,0.14); }
  50%     { box-shadow: 0 0 0 10px rgba(22,119,255,0.06); }
}
.search-svg { color: #86909C; }
.search-input {
  flex: 1; min-width: 0; border: none; outline: none;
  background: transparent; font-size: 14px; color: #1D2129;
  text-align: center; letter-spacing: 1px;
}
.search-input::placeholder { color: #86909C; letter-spacing: 0; }
.search-btn {
  height: 32px; padding: 0 18px;
  border: none; border-radius: 999px;
  background: linear-gradient(135deg, #1677FF, #4096FF);
  color: #fff; font-size: 13px; font-weight: 700; letter-spacing: 0.5px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(22,119,255,0.22);
}
.search-btn:active { transform: scale(0.96); }

/* 自提指引卡 */
.pickup-guide-card {
  margin: 0 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #EFF5FF 0%, #F5F9FF 100%);
  border-radius: 16px;
  border: 1px dashed rgba(22,119,255,0.35);
}
.pg-title { font-size: 15px; font-weight: 800; color: #1D2129; }
.pg-list { list-style: none; padding: 0; margin: 10px 0 0; display: flex; flex-direction: column; gap: 6px; }
.pg-list li { font-size: 13px; color: #4E5969; line-height: 1.6; }
.g-blue { color: #1677FF; font-weight: 700; }

/* 列表 & 空态 */
.skeleton-item { margin: 10px 12px !important; border-radius: 18px !important; overflow: hidden !important; }
.empty-wrap { padding: 80px 20px 40px; text-align: center; }
.empty-wrap.initial-empty {
  padding-top: 60px; position: relative;
}
.initial-empty-deco {
  position: relative; height: 130px; width: 100%; margin: 0 auto 8px;
}
.circle {
  position: absolute; left: 50%; transform: translateX(-50%);
  border-radius: 50%;
}
.circle.c1 {
  top: 14px; width: 110px; height: 110px;
  background: radial-gradient(circle at 50% 50%, rgba(22,119,255,0.12), rgba(22,119,255,0) 70%);
  animation: pulse 2.4s infinite ease;
}
.circle.c2 {
  top: 28px; width: 80px; height: 80px;
  background: radial-gradient(circle at 50% 50%, rgba(22,119,255,0.18), rgba(22,119,255,0) 70%);
  animation: pulse 2.4s infinite ease 0.6s;
}
@keyframes pulse {
  0%, 100% { transform: translateX(-50%) scale(1); opacity: 1; }
  50%      { transform: translateX(-50%) scale(1.1); opacity: 0.6; }
}
.big-hand {
  position: absolute;
  left: 56%; top: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  animation: handTap 1.4s infinite ease;
}
@keyframes handTap {
  0%,100% { transform: translate(-50%, -50%) translateY(0); }
  50%     { transform: translate(-50%, -50%) translateY(8px); }
}
.empty-icon {
  width: 96px; height: 96px; margin: 0 auto 16px; border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, rgba(22,119,255,0.12), rgba(22,119,255,0.02) 70%);
  display: flex; align-items: center; justify-content: center;
  color: #1677FF;
}
.bag-svg { width: 44px; height: 44px; }
.empty-title { font-size: 16px; font-weight: 700; color: #1D2129; margin-bottom: 4px; }
.empty-sub { font-size: 13px; color: #86909C; }

/* 订单卡 */
.order-card {
  background: #fff; margin: 10px 12px; border-radius: 18px;
  padding: 14px 14px 12px;
  box-shadow: 0 8px 22px rgba(15, 67, 148, 0.06);
}
.list-enter-active, .list-leave-active { transition: all 0.3s ease; }
.list-enter-from { opacity: 0; transform: translateY(20px); }
.list-leave-to   { opacity: 0; transform: translateX(-20px); }

.order-head {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 12px; border-bottom: 1px solid #F2F3F5;
}
.order-no { font-size: 12px; color: #86909C; word-break: break-all; flex: 1; min-width: 0; margin-right: 8px; font-weight: 500; }
.status-tag {
  display: inline-flex; align-items: center; justify-content: center;
  height: 22px; padding: 0 12px; border-radius: 999px;
  font-size: 11px; font-weight: 700; line-height: 22px;
}
.status-tag.orange { background: linear-gradient(135deg, #FF9A2E, #FF7D00); color: #fff; }
.status-tag.blue   { background: linear-gradient(135deg, #1677FF, #4096FF); color: #fff; }
.status-tag.green  { background: linear-gradient(135deg, #00B42A, #009F5A); color: #fff; }
.status-tag.gray   { background: #F2F3F5; color: #4E5969; }

.order-goods { padding: 12px 0 6px; display: flex; flex-direction: column; gap: 10px; }
.goods-item { display: flex; align-items: center; gap: 10px; }
.goods-icon {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, rgba(22,119,255,0.10), rgba(22,119,255,0.02));
  display: flex; align-items: center; justify-content: center;
  color: #1677FF; flex-shrink: 0;
}
.goods-svg { width: 22px; height: 22px; }
.goods-info { flex: 1; min-width: 0; }
.g-name { font-size: 13px; font-weight: 600; color: #1D2129; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.g-spec { font-size: 11px; color: #86909C; margin-top: 2px; line-height: 1.3; }
.goods-price { text-align: right; flex-shrink: 0; }
.g-price { font-size: 13px; color: #F53F3F; font-weight: 700; }
.g-qty { font-size: 11px; color: #86909C; margin-top: 2px; }
.goods-more { font-size: 12px; color: #86909C; text-align: center; padding: 4px 0; }

.order-foot {
  display: flex; justify-content: space-between; align-items: flex-end;
  padding-top: 12px; margin-top: 6px; border-top: 1px solid #F2F3F5; gap: 10px;
}
.foot-left { flex: 1; min-width: 0; }
.pickup-code-mini {
  background: linear-gradient(180deg, #EFF5FF 0%, #F0F7FF 100%);
  border: 1.5px solid #1677FF;
  border-radius: 12px;
  padding: 6px 10px;
  display: inline-block;
}
.mini-code {
  font-family: "SF Mono", Menlo, Consolas, monospace;
  font-size: 18px; font-weight: 800; letter-spacing: 2px;
  color: #1677FF; line-height: 1.1;
}
.mini-tip { font-size: 10px; color: #86909C; letter-spacing: 0.3px; margin-top: 2px; text-align: center; }
.foot-point { font-size: 12px; color: #86909C; margin-top: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.foot-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
.foot-amount { display: flex; align-items: baseline; gap: 3px; }
.amt-label { font-size: 12px; color: #86909C; }
.foot-amount .price { font-size: 16px; color: #F53F3F; font-weight: 800; letter-spacing: 0.2px; }
.foot-amount .symbol { font-size: 13px; font-weight: 800; }

/* 按钮通用 */
.btn-pill {
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 999px;
  font-size: 12px; font-weight: 700;
  border: none; cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  user-select: none; letter-spacing: 0.2px;
}
.btn-pill:active { transform: scale(0.96); }
.btn-pill.small { height: 28px; padding: 0 14px; }
.btn-pill.outline {
  background: #fff; color: #1677FF;
  border: 1.5px solid #1677FF;
  box-shadow: none;
}
.btn-pill.primary {
  background: linear-gradient(135deg, #1677FF, #4096FF);
  color: #fff;
  box-shadow: 0 4px 12px rgba(22,119,255,0.22);
}
.btn-pill.pay-btn {
  background: linear-gradient(135deg, #FF9A2E 0%, #FF7D00 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 125, 0, 0.24);
}

/* ---------- 引导弹窗 ---------- */
.guide-mask {
  position: fixed; inset: 0; z-index: 900;
  background: rgba(0, 20, 50, 0.45);
  backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.guide-card {
  width: 100%; max-width: 380px;
  background: #fff; border-radius: 24px;
  padding: 18px 18px 16px;
  box-shadow: 0 20px 60px rgba(22, 48, 100, 0.30);
  position: relative;
  overflow: hidden;
}
.guide-head {
  display: grid;
  grid-template-columns: 48px 1fr 36px;
  gap: 10px; align-items: center;
}
.guide-emoji {
  width: 48px; height: 48px; border-radius: 50%;
  background: linear-gradient(135deg, #EFF5FF, #F0F7FF);
  font-size: 28px;
  display: inline-flex; align-items: center; justify-content: center;
}
.guide-title { font-size: 17px; font-weight: 800; color: #1D2129; }
.close-btn {
  width: 30px; height: 30px; border-radius: 50%;
  background: #F2F3F5; color: #4E5969;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 22px; line-height: 1; cursor: pointer; border: none;
}

.steps-wrap {
  position: relative;
  height: 300px;
  margin-top: 14px;
  overflow: hidden;
}
.step-slot {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  transition: all 0.4s cubic-bezier(0.22, 0.9, 0.3, 1.2);
  transform: translateX(120%); opacity: 0;
}
.step-slot.active {
  transform: translateX(0); opacity: 1;
}
.step-slot.prev {
  transform: translateX(-120%); opacity: 0;
}
.step-title {
  display: flex; align-items: center; gap: 10px;
  font-size: 15px; font-weight: 700; color: #1D2129;
}
.step-index {
  width: 26px; height: 26px; border-radius: 50%;
  background: linear-gradient(135deg, #1677FF, #4096FF);
  color: #fff; font-weight: 800; font-size: 13px;
  display: inline-flex; align-items: center; justify-content: center;
}
.step-desc {
  margin-top: 10px;
  font-size: 13px; color: #4E5969; line-height: 1.6;
  background: #F6F8FB;
  border-radius: 12px;
  padding: 10px 12px;
}
.step-figure {
  flex: 1;
  margin-top: 14px;
  border-radius: 14px;
  background: linear-gradient(135deg, #F5F9FF 0%, #EDF3FF 100%);
  border: 1px dashed rgba(22,119,255,0.25);
  display: flex; align-items: center; justify-content: center;
  padding: 12px;
  position: relative;
  overflow: hidden;
}

/* step1 图：底部 Tab */
.fig-mobile {
  width: 260px; height: 64px;
  background: #fff; border-radius: 14px;
  box-shadow: 0 10px 22px rgba(22, 119, 255, 0.12);
  display: grid; grid-template-columns: repeat(4,1fr);
  position: relative;
}
.fig-tabbar > div {
  display: inline-flex; flex-direction: column; align-items: center; justify-content: center;
  font-size: 11px; color: #86909C; padding: 6px 0;
  font-weight: 600;
}
.fig-tabbar .hi.active {
  color: #1677FF;
  position: relative;
}
.fig-tabbar .hi.active::after {
  content: ""; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 22px; height: 3px; border-radius: 0 0 3px 3px;
  background: linear-gradient(135deg, #1677FF, #4096FF);
}
.fig-arrow {
  position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%);
  font-size: 22px;
  animation: bounceDown 1.2s infinite ease;
}
@keyframes bounceDown {
  0%,100% { transform: translate(-50%, -6px); }
  50%     { transform: translate(-50%, 4px); }
}

/* step2 图：搜索框 */
.fig-search { width: 280px; position: relative; }
.fs-bar {
  height: 44px;
  display: flex; align-items: center; justify-content: space-between;
  background: #F0F7FF;
  border: 1.5px solid #D6E6FB;
  border-radius: 999px;
  padding: 0 4px 0 16px;
}
.fs-bar .ph { font-size: 13px; color: #86909C; letter-spacing: 0; }
.fs-bar .sb {
  height: 32px; padding: 0 16px;
  border: none; border-radius: 999px;
  background: linear-gradient(135deg, #1677FF, #4096FF);
  color: #fff; font-size: 13px; font-weight: 700;
}
.fig-hand {
  text-align: center; margin-top: 8px;
  animation: handTap 1.2s infinite ease;
  font-size: 24px;
}

/* step3 图：依次出现订单卡 */
.fig-cards {
  width: 260px;
  display: flex; flex-direction: column; gap: 8px;
}
.fc {
  height: 60px;
  background: #fff; border-radius: 12px;
  box-shadow: 0 6px 14px rgba(22, 119, 255, 0.10);
  animation: slideIn 0.6s ease both;
}
.fc.one   { background: linear-gradient(90deg, #E6EEFB 0%, #F5F9FF 100%); animation-delay: 0s; }
.fc.two   { background: linear-gradient(90deg, #FFF1E8 0%, #FFFBF5 100%); animation-delay: 0.2s; }
.fc.three { background: linear-gradient(90deg, #E7F7EE 0%, #F3FBF6 100%); animation-delay: 0.4s; }
@keyframes slideIn {
  0%   { opacity: 0; transform: translateY(14px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* 步骤指示点 */
.dots { display: flex; justify-content: center; gap: 6px; margin: 8px 0 12px; }
.dots > span {
  width: 7px; height: 7px; border-radius: 50%;
  background: #D6E6FB;
  transition: all 0.2s ease;
  cursor: pointer;
}
.dots > span.active {
  width: 20px; border-radius: 999px;
  background: linear-gradient(135deg, #1677FF, #4096FF);
}

.guide-footer {
  display: flex; justify-content: space-between; gap: 10px;
  margin-top: 4px;
}
.guide-footer .btn-pill.small { height: 34px; padding: 0 18px; font-size: 13px; }
.guide-footer .btn-pill[disabled] { opacity: 0.4; cursor: not-allowed; box-shadow: none; }

/* 搜索框脉冲指引 */
.pulse-guide {
  position: fixed; left: 0; right: 0;
  top: 0;
  z-index: 800;
  pointer-events: auto;
  display: flex; align-items: center; justify-content: center;
  height: 190px;
}
.pulse-ring {
  position: absolute;
  top: 148px;
  left: 50%;
  width: 70vw; max-width: 360px; height: 48px;
  border: 2.5px solid #1677FF;
  border-radius: 999px;
  transform: translateX(-50%);
  animation: pRing 1.4s ease infinite;
}
.pulse-ring.r2 { animation-delay: 0.7s; }
@keyframes pRing {
  0%   { opacity: 0.9; transform: translateX(-50%) scale(1); }
  100% { opacity: 0;   transform: translateX(-50%) scale(1.12); }
}
.pulse-hint {
  margin-top: 200px;
  padding: 6px 14px;
  background: #1677FF; color: #fff;
  border-radius: 999px; font-size: 12px; font-weight: 700;
  box-shadow: 0 6px 14px rgba(22,119,255,0.25);
  animation: bounceDown 1.0s infinite ease;
}

/* 通用入场动画 */
.fade-in { animation: fadeIn 0.5s ease both; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

.bounce-in { animation: bounceIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes bounceIn {
  0%   { transform: scale(0.7); opacity: 0; }
  60%  { transform: scale(1.06); opacity: 1; }
  100% { transform: scale(1); }
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 底部导航栏 */
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
</style>
