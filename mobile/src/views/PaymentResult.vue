<template>
  <div class="payment-result">
    <div class="success-hero">
      <div class="success-circle pop">
        <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 25L21 32L35 18" stroke="white" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      </div>
      <div class="success-title">支付成功</div>
      <div class="success-sub">订单已支付，请凭自提码提货</div>
    </div>

    <div class="pickup-code-card fade-in" style="margin: 0 12px 14px;">
      <div class="label">您的自提码（凭码提货）</div>
      <div class="code">{{ order.pickup_code || '——' }}</div>
      <div class="tip">「HPY + 手机号后4位 · 建议截图保存」</div>
      <button
        class="copy-btn"
        @click="async () => { try { await navigator.clipboard.writeText(order.pickup_code || ''); showToast('复制成功'); } catch { showToast('复制失败'); } }"
      >
        复制自提码
      </button>
    </div>

    <div class="order-card fade-in">
      <div class="info-row">
        <span class="label">订单号</span>
        <span class="value">{{ order.order_no }}</span>
      </div>
      <div class="info-divider"></div>
      <div class="info-row">
        <span class="label">实付金额</span>
        <span class="value price">
          <span class="symbol">¥</span>{{ formatPrice(order.total_amount) }}
        </span>
      </div>
      <template v-if="order.pickup_point_name">
        <div class="info-divider"></div>
        <div class="info-row">
          <span class="label">自提点</span>
          <span class="value">{{ order.pickup_point_name }}</span>
        </div>
      </template>
      <template v-if="order.pickup_point_address">
        <div class="info-divider"></div>
        <div class="info-row">
          <span class="label">自提地址</span>
          <span class="value addr">{{ order.pickup_point_address }}</span>
        </div>
      </template>
    </div>

    <div class="action-wrap fade-in">
      <button class="btn btn-outline" @click="goHome">返回首页</button>
      <button class="btn btn-primary" @click="goOrders">去查订单</button>
    </div>

    <div class="slogan">好朋友集市 · 让新鲜更近一点</div>

    <GuidePopup
      v-model:show="guideShow"
      title="提货小贴士"
      subtitle="完成这几步，提货更顺畅"
      :steps="guideSteps"
      @finish="onGuideFinish"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { api } from '@/api';
import { formatPrice, isGuided, markGuided } from '@/utils';
import GuidePopup from '@/components/GuidePopup.vue';

const route = useRoute();
const router = useRouter();

const order = ref({});
const guideShow = ref(false);
const guideSteps = [
  {
    emoji: '🔍',
    title: '查订单',
    desc: '在「查订单」页输入下单手机号，随时查看你的订单与状态。'
  },
  {
    emoji: '🔑',
    title: '找自提码',
    desc: '订单详情中可查看专属自提码（HPY+手机号后4位），凭码提货。'
  },
  {
    emoji: '📸',
    title: '截图保存',
    desc: '建议把自提码页面截图保存，到店出示给核销员即可完成提货。'
  }
];

async function loadOrder() {
  const orderNo = route.query.order_no;
  if (!orderNo) return;
  try {
    const data = await api.getOrder(orderNo);
    order.value = data || {};
  } catch (e) {
    showToast(e.message || '订单加载失败');
  }
}

function onGuideFinish() {
  markGuided();
}

function goHome() {
  router.push('/');
}
function goOrders() {
  router.push('/orders');
}

onMounted(() => {
  loadOrder();
  if (!isGuided()) {
    guideShow.value = true;
  }
});
</script>

<style scoped>
.payment-result {
  min-height: 100vh;
  background: var(--hpy-bg);
  padding: 28px 0 24px;
  box-sizing: border-box;
}

.success-hero {
  text-align: center;
  padding: 12px 20px 22px;
}

.success-circle {
  width: 80px;
  height: 80px;
  margin: 0 auto 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1677FF 0%, #4096FF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(22, 119, 255, 0.28);
}

.success-title {
  font-size: 22px;
  font-weight: 800;
  color: #1D2129;
  letter-spacing: 0.5px;
}

.success-sub {
  font-size: 13px;
  color: var(--hpy-text-3);
  margin-top: 6px;
  letter-spacing: 0.2px;
}

.copy-btn {
  margin-top: 16px;
  height: 36px;
  padding: 0 26px;
  border-radius: 999px;
  border: none;
  background: var(--hpy-grad-btn);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.22);
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}

.copy-btn:active {
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.18);
}

.order-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(22, 119, 255, 0.08);
  margin: 12px;
  padding: 4px 18px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 14px 0;
}

.info-divider {
  height: 1px;
  background: var(--hpy-line);
  margin: 0;
}

.info-row .label {
  color: #86909C;
  font-size: 14px;
  flex-shrink: 0;
}

.info-row .value {
  color: #1D2129;
  font-size: 14px;
  font-weight: 500;
  text-align: right;
  word-break: break-all;
  max-width: 65%;
}

.info-row .value.price {
  font-size: 18px;
  font-weight: 800;
  color: #F53F3F;
}

.info-row .value.price .symbol {
  font-size: 14px;
  margin-right: 2px;
}

.info-row .value.addr {
  max-width: 60%;
  line-height: 1.55;
}

.action-wrap {
  display: flex;
  gap: 12px;
  margin: 22px 12px 18px;
}

.btn {
  flex: 1;
  height: 44px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.18s ease;
  letter-spacing: 0.3px;
}

.btn-outline {
  background: #fff;
  color: var(--hpy-primary);
  border: 1.5px solid var(--hpy-primary);
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.06);
}

.btn-outline:active {
  background: var(--hpy-primary-soft);
  transform: scale(0.98);
}

.btn-primary {
  background: var(--hpy-grad-btn);
  color: #fff;
  box-shadow: 0 6px 18px rgba(22, 119, 255, 0.26);
}

.btn-primary:active {
  transform: scale(0.98);
  box-shadow: 0 3px 12px rgba(22, 119, 255, 0.20);
}

.slogan {
  font-size: 12px;
  color: var(--hpy-text-3);
  text-align: center;
  margin-top: 16px;
  letter-spacing: 0.5px;
}
</style>
