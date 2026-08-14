<template>
  <div class="product-detail page-wrap">
    <!-- 顶部渐变蓝 Nav -->
    <header class="detail-topbar">
      <div class="detail-topbar-inner">
        <button class="icon-btn" @click="onBack" aria-label="返回">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div class="detail-title">商品详情</div>
        <router-link to="/orders" class="icon-btn" aria-label="查订单">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
        </router-link>
      </div>
    </header>

    <div v-if="product">
      <!-- 图集轮播：白渐变 + 柔光阴影 -->
      <div class="hero-swipe">
        <van-swipe
          :autoplay="images.length > 1 ? 4500 : 0"
          indicator-color="#1677FF"
          :lazy-render="true"
        >
          <van-swipe-item v-for="(img, i) in images" :key="i">
            <div class="image-wrap">
              <img
                v-if="img"
                :src="img"
                :alt="product.name"
                loading="lazy"
              />
              <div v-else class="image-placeholder">
                <span>{{ firstChar(product.name) }}</span>
              </div>
            </div>
          </van-swipe-item>
        </van-swipe>
      </div>

      <!-- 价格 + 名称 卡 -->
      <div class="info-card price-card">
        <div style="display:flex; align-items:baseline; justify-content:space-between; flex-wrap:wrap; gap:8px;">
          <div class="big-price"><small>¥</small>{{ formatPrice(currentPrice) }}</div>
          <span class="tag-capsule soft-blue">库存 {{ currentStock }} 件</span>
        </div>
        <div class="name" style="margin-top: 12px;">{{ product.name }}</div>
        <div class="sku-code">商品编码：{{ product.sku_code }}</div>
      </div>

      <!-- SKU 规格 -->
      <div class="info-card" v-if="skus.length">
        <div class="card-title">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
          选择规格
        </div>
        <div style="margin-top: 6px;">
          <span
            v-for="s in skus"
            :key="s.id"
            class="sku-chip"
            :class="{ active: s.id === selectedSkuId, disabled: s.stock <= 0 }"
            @click="selectSku(s)"
          >
            <span style="display:block; margin-bottom: 2px;">{{ s.spec }}</span>
            <span style="font-size:12px;color:#F53F3F;font-weight:700;">¥{{ formatPrice(s.price) }}</span>
            <span v-if="s.stock <= 0" style="color:#bbb; margin-left:4px;">已售罄</span>
            <span v-else style="color:#86909C; font-size:12px; margin-left:4px;">· 余{{ s.stock }}</span>
          </span>
        </div>
      </div>

      <!-- 数量 -->
      <div class="info-card stepper-wrap">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <div class="card-title" style="margin:0;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            购买数量
          </div>
          <van-stepper v-model="quantity" :min="1" :max="maxQty" integer theme="round" />
        </div>
      </div>

      <!-- 商品说明 -->
      <div class="info-card">
        <div class="card-title">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          商品说明
        </div>
        <div style="color:#4E5969; font-size:14px; line-height:1.8; margin-top: 2px;">
          {{ product.name }} · 好朋友集市精选好物，下单后请前往所选自提点提货。
          如对规格有疑问，请联系自提点工作人员。
        </div>
      </div>

      <div style="height: 92px"></div>

      <!-- 底部悬浮操作栏 -->
      <van-action-bar safe-area-inset-bottom>
        <van-action-bar-icon icon="wap-home-o" text="首页" @click="goHome" />
        <van-action-bar-icon icon="orders-o" text="查单" @click="goOrders" />
        <van-action-bar-button
          type="primary"
          :text="canOrder ? '立即下单' : ( skus.length && !selectedSku ? '请选择规格' : '库存不足' )"
          :disabled="!canOrder"
          color="linear-gradient(135deg, #1677FF 0%, #4096FF 100%)"
          @click="onOrder"
        />
      </van-action-bar>
    </div>

    <div v-else class="empty-block" style="padding-top: 80px; text-align:center;">
      <van-loading v-if="loading" type="spinner" color="#1677FF">加载中...</van-loading>
    </div>

    <GuidePopup
      v-model:show="guideShow"
      title="首次下单指引"
      :steps="guideSteps"
      @finish="onGuideFinish"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { api } from '@/api';
import {
  resolveImg,
  firstChar,
  formatPrice,
  isGuided,
  markGuided
} from '@/utils';
import GuidePopup from '@/components/GuidePopup.vue';

const route = useRoute();
const router = useRouter();

const product = ref(null);
const skus = ref([]);
const selectedSkuId = ref(null);
const quantity = ref(1);
const loading = ref(false);

const guideShow = ref(false);
const guideSteps = [
  {
    icon: 'location',
    title: '选择自提点',
    desc: '下单时请在确认订单页选择离您最近的自提点，方便提货。'
  },
  {
    icon: 'edit',
    title: '填写收货信息',
    desc: '请填写收货人姓名、手机号与收货地址，方便联系您。'
  }
];

const images = computed(() => {
  if (!product.value) return [];
  const arr = [];
  const main = resolveImg(product.value.main_image);
  if (main) arr.push(main);
  const details = product.value.detail_images || [];
  for (const d of details) {
    const u = resolveImg(d);
    if (u) arr.push(u);
  }
  if (arr.length === 0) arr.push('');
  return arr;
});

const selectedSku = computed(() => skus.value.find((s) => s.id === selectedSkuId.value) || null);
const currentPrice = computed(() => selectedSku.value ? selectedSku.value.price : (product.value?.price ?? 0));
const currentStock = computed(() => selectedSku.value ? selectedSku.value.stock : (product.value?.stock ?? 0));
const maxQty = computed(() => Math.max(1, currentStock.value || 1));
const canOrder = computed(() => {
  if (skus.value.length && !selectedSku.value) return false;
  return currentStock.value > 0;
});

async function loadProduct() {
  const id = route.params.id;
  if (!id) return;
  loading.value = true;
  try {
    const data = await api.getProduct(id);
    product.value = data;
    skus.value = data.skus || [];
    if (skus.value.length) {
      const first = skus.value.find((s) => s.stock > 0) || skus.value[0];
      selectedSkuId.value = first.id;
    }
    quantity.value = 1;
  } catch (e) {
    showToast(e.message || '商品加载失败');
  } finally {
    loading.value = false;
  }
}

function selectSku(s) {
  if (s.stock <= 0) { showToast('该规格已售罄'); return; }
  selectedSkuId.value = s.id;
  if (quantity.value > s.stock) quantity.value = s.stock;
}

function onOrder() {
  if (skus.value.length && !selectedSku.value) { showToast('请选择规格'); return; }
  if (currentStock.value <= 0) { showToast('库存不足'); return; }
  if (quantity.value > currentStock.value) { showToast('购买数量超出库存'); return; }
  if (!isGuided()) { guideShow.value = true; return; }
  goCheckout();
}

function onGuideFinish() { markGuided(); goCheckout(); }

function goCheckout() {
  const skuId = selectedSku.value ? selectedSku.value.id : '';
  router.push({
    path: '/checkout',
    query: { product_id: product.value.id, sku_id: skuId, quantity: quantity.value }
  });
}
function onBack() { router.back(); }
function goHome() { router.push('/'); }
function goOrders() { router.push('/orders'); }

watch(() => route.params.id, loadProduct, { immediate: true });
</script>

<style scoped>
.detail-topbar {
  position: sticky;
  top: 0;
  z-index: 60;
  background: linear-gradient(135deg, #1677FF 0%, #4096FF 100%);
  padding-top: env(safe-area-inset-top);
}
.detail-topbar-inner {
  height: 52px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.22);
  color: #fff;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}
.detail-title {
  flex: 1;
  text-align: center;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.3px;
  margin: 0 8px;
}
.hero-swipe {
  position: relative;
  background: linear-gradient(180deg, #E8F3FF 0%, #FFFFFF 100%);
}
.image-wrap {
  width: 100%;
  height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.image-wrap img {
  width: 100%;
  height: 100%;
  max-width: 380px;
  max-height: 340px;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 8px 22px rgba(22, 119, 255, 0.12));
  border-radius: 16px;
}
.image-placeholder {
  width: 260px;
  height: 260px;
  background: linear-gradient(135deg, #1677FF 0%, #4096FF 100%);
  border-radius: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 96px;
  font-weight: 800;
  letter-spacing: 2px;
  box-shadow: 0 10px 30px rgba(22, 119, 255, 0.24);
}
.price-card {
  margin-top: -24px;
  position: relative;
  z-index: 3;
}
.card-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  color: #1D2129;
  font-size: 15px;
  margin-bottom: 8px;
}
.card-title svg { color: #1677FF; flex-shrink: 0; }

.sku-chip.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  text-decoration: line-through;
}
.empty-block { color:#86909C; }
</style>
