<template>
  <div class="order-detail">
    <van-nav-bar title="订单详情" left-arrow @click-left="onBack" />

    <van-skeleton v-if="loading" title :row="6" style="margin: 12px" />

    <div v-else-if="order.id">
      <div class="status-card">
        <div class="status-main">
          <div class="status-text">{{ statusText(order.status) }}</div>
          <div class="status-sub">{{ statusSubText(order.status) }}</div>
        </div>
        <div class="pickup-code-box" v-if="order.status !== 'closed'">
          <div class="code-label">自提码（凭码提货）</div>
          <div class="code-text">{{ order.pickup_code }}</div>
          <div class="code-tip">HPY + 手机号后4位 · 建议截图保存</div>
          <van-button
            size="small"
            type="primary"
            round
            class="copy-btn"
            @click="onCopy"
            >复制自提码</van-button
          >
        </div>
        <div class="closed-tip" v-else>
          订单已关闭（超时未支付或已取消）
        </div>
      </div>

      <div class="section-header">
        <span class="bar"></span>流转进度
      </div>
      <div class="info-card steps-card">
        <van-steps :active="activeStep" active-color="#1677FF">
          <van-step>仓库备货完成</van-step>
          <van-step>已送达自提点</van-step>
          <van-step>已完成自提</van-step>
        </van-steps>
        <div class="status-note" v-if="order.status === 'pending_pay'">
          ⏰ 订单待支付，超时将自动关闭，请尽快支付
        </div>
        <div class="status-note" v-else-if="order.status === 'closed'">
          订单已关闭
        </div>
      </div>

      <div class="section-header">
        <span class="bar"></span>自提点
      </div>
      <div class="info-card">
        <van-cell title="自提点" :value="order.pickup_point_name || '-'" />
        <van-cell title="地址" :label="order.pickup_point_address || '-'" />
        <van-cell title="收货人" :value="order.receiver_name || '-'" />
        <van-cell title="收货地址" :label="order.receiver_address || '-'" />
      </div>

      <div class="section-header">
        <span class="bar"></span>商品清单
      </div>
      <div class="info-card goods-card">
        <div v-for="(it, i) in order.items" :key="i" class="goods-row">
          <div class="goods-icon">
            <van-icon name="goods" size="20" color="#fff" />
          </div>
          <div class="goods-main">
            <div class="g-name">{{ it.product_name }}</div>
            <div class="g-spec" v-if="it.sku_spec">规格：{{ it.sku_spec }}</div>
          </div>
          <div class="goods-right">
            <div class="price"><span class="symbol">¥</span>{{ formatPrice(it.price) }}</div>
            <div class="g-qty">×{{ it.quantity }}</div>
          </div>
        </div>
      </div>

      <div class="section-header">
        <span class="bar"></span>订单信息
      </div>
      <div class="info-card">
        <van-cell title="订单号" :value="order.order_no" />
        <van-cell title="下单时间" :value="order.created_at || '-'" />
        <van-cell v-if="order.paid_at" title="支付时间" :value="order.paid_at" />
        <van-cell v-if="order.completed_at" title="完成时间" :value="order.completed_at" />
        <van-cell title="商品金额">
          <template #value>
            <span class="price-normal"><span class="symbol">¥</span>{{ formatPrice(order.total_amount) }}</span>
          </template>
        </van-cell>
        <van-cell title="实付金额">
          <template #value>
            <span class="pay-amount"><span class="symbol">¥</span>{{ formatPrice(order.total_amount) }}</span>
          </template>
        </van-cell>
      </div>

      <div style="height: 80px"></div>

      <van-action-bar>
        <van-action-bar-icon icon="wap-home-o" text="首页" @click="goHome" />
        <van-action-bar-icon icon="orders-o" text="查单" @click="goOrders" />
        <van-action-bar-button
          v-if="order.status === 'pending_pay'"
          class="pay-btn"
          text="去支付"
          @click="onPay"
        />
        <van-action-bar-button
          v-else
          class="home-btn"
          text="返回首页"
          @click="goHome"
        />
      </van-action-bar>
    </div>

    <div v-else class="empty-block" style="padding-top: 80px">
      <van-icon name="info-o" size="48" />
      <div style="margin-top: 10px">订单不存在</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showSuccessToast } from 'vant';
import { api } from '@/api';
import { formatPrice, statusText, statusTagType } from '@/utils';

const route = useRoute();
const router = useRouter();

const order = ref({});
const loading = ref(false);

const activeStep = computed(() => {
  switch (order.value.status) {
    case 'pending_pay':
      return 0;
    case 'pending_pickup':
      return 2;
    case 'completed':
      return 3;
    case 'closed':
      return 0;
    default:
      return 0;
  }
});

function statusSubText(status) {
  switch (status) {
    case 'pending_pay':
      return '请尽快完成支付，超时将自动取消';
    case 'pending_pickup':
      return '请凭自提码前往自提点取货';
    case 'completed':
      return '感谢您的惠顾，期待再次光临';
    case 'closed':
      return '订单已关闭';
    default:
      return '';
  }
}

async function loadOrder() {
  const id = route.params.id;
  if (!id) return;
  loading.value = true;
  try {
    const data = await api.getOrder(id);
    order.value = data || {};
  } catch (e) {
    showToast(e.message || '订单加载失败');
  } finally {
    loading.value = false;
  }
}

function onCopy() {
  const code = order.value.pickup_code || '';
  if (!code) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(code)
      .then(() => showSuccessToast('已复制：' + code))
      .catch(() => fallbackCopy(code));
  } else {
    fallbackCopy(code);
  }
}

function fallbackCopy(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showSuccessToast('已复制：' + text);
  } catch (e) {
    showToast('复制失败，请手动长按复制');
  }
}

function onPay() {
  if (!order.value.order_no) return;
  window.location.href = '/api/payment/pay?order_no=' + order.value.order_no;
}
function onBack() {
  router.back();
}
function goHome() {
  router.push('/');
}
function goOrders() {
  router.push('/orders');
}

watch(() => route.params.id, loadOrder, { immediate: true });
</script>

<style scoped>
:root {
  --hpy-shadow-sm: 0 2px 8px rgba(22, 119, 255, 0.06);
}

.order-detail {
  min-height: 100vh;
  background: #F5F7FA;
  padding-bottom: 10px;
}

.status-card {
  background: linear-gradient(180deg, #1677FF 0%, #0E5FD9 100%);
  margin: 0;
  padding: 24px 20px;
  border-radius: 0;
  color: #fff;
}

.status-main {
  margin-bottom: 18px;
}

.status-text {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  line-height: 1.3;
}

.status-sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 6px;
}

.pickup-code-box {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 14px;
  padding: 16px 16px 18px;
}

.code-label {
  font-size: 13px;
  color: #1D2129;
  font-weight: 600;
  margin-bottom: 8px;
}

.code-text {
  font-family: 'Courier New', Courier, monospace;
  font-size: 32px;
  font-weight: 800;
  color: #1677FF;
  letter-spacing: 2px;
  line-height: 1.2;
  margin-bottom: 8px;
}

.code-tip {
  font-size: 12px;
  color: #86909C;
  margin-bottom: 12px;
}

.copy-btn {
  width: 100%;
  height: 36px;
  background: linear-gradient(135deg, #1677FF 0%, #4096FF 100%) !important;
  border-color: transparent !important;
  color: #fff !important;
  font-size: 14px;
  font-weight: 600;
  border-radius: 18px !important;
}

.closed-tip {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 14px 16px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  text-align: center;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 20px 16px 10px;
  font-size: 17px;
  font-weight: 800;
  color: #1D2129;
}

.section-header .bar {
  display: inline-block;
  width: 3px;
  height: 16px;
  background: #1677FF;
  border-radius: 2px;
  margin-right: 8px;
  flex-shrink: 0;
}

.info-card {
  background: #fff;
  border-radius: 12px;
  margin: 0 12px 12px;
  overflow: hidden;
  box-shadow: var(--hpy-shadow-sm);
}

.steps-card {
  padding: 18px 6px 10px;
}

.status-note {
  text-align: center;
  color: #F53F3F;
  font-size: 13px;
  margin-top: 8px;
  padding: 0 10px;
}

:deep(.van-cell) {
  --van-cell-label-color: #86909C;
  --van-cell-value-color: #1D2129;
  --van-cell-label-font-size: 13px;
  --van-cell-title-color: #86909C;
  --van-cell-value-font-weight: 600;
}

:deep(.van-cell__title) {
  color: #86909C;
  font-size: 14px;
}

:deep(.van-cell__value) {
  color: #1D2129;
  font-size: 14px;
  font-weight: 600;
}

:deep(.van-cell__label) {
  margin-top: 3px;
  color: #86909C;
}

.goods-card {
  padding: 4px 0;
}

.goods-row {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid #F2F3F5;
}

.goods-row:last-child {
  border-bottom: none;
}

.goods-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #1677FF 0%, #4096FF 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.goods-main {
  flex: 1;
  min-width: 0;
  margin-left: 10px;
}

.g-name {
  font-size: 14px;
  font-weight: 600;
  color: #1D2129;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.g-spec {
  font-size: 12px;
  color: #86909C;
  margin-top: 3px;
}

.goods-right {
  text-align: right;
  flex-shrink: 0;
  margin-left: 8px;
}

.goods-right .price {
  font-size: 15px;
  font-weight: 700;
  color: #F53F3F;
}

.goods-right .price .symbol {
  font-size: 11px;
}

.g-qty {
  font-size: 12px;
  color: #86909C;
  margin-top: 3px;
}

.price-normal {
  color: #1D2129;
  font-size: 15px;
  font-weight: 600;
}

.price-normal .symbol {
  font-size: 12px;
}

.pay-amount {
  color: #F53F3F;
  font-size: 18px;
  font-weight: 800;
}

.pay-amount .symbol {
  font-size: 12px;
  font-weight: 800;
}

:deep(.van-action-bar) {
  --van-action-bar-background: #fff;
}

:deep(.van-action-bar-icon) {
  color: #4E5969;
  font-size: 11px;
}

:deep(.van-action-bar-icon .van-icon) {
  font-size: 20px;
  color: #4E5969;
}

.pay-btn :deep(.van-button) {
  background: linear-gradient(135deg, #FF7D00 0%, #F53F3F 100%) !important;
  border-color: transparent !important;
  color: #fff !important;
  font-weight: 700;
  font-size: 15px;
  border-radius: 22px;
}

.home-btn :deep(.van-button) {
  background: linear-gradient(135deg, #1677FF 0%, #4096FF 100%) !important;
  border-color: transparent !important;
  color: #fff !important;
  font-weight: 700;
  font-size: 15px;
  border-radius: 22px;
}

.empty-block {
  text-align: center;
  color: #86909C;
}

.empty-block :deep(.van-icon) {
  color: #1677FF;
}
</style>
