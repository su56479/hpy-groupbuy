<template>
  <div class="checkout">
    <van-nav-bar title="确认订单" left-arrow @click-left="onBack" />

    <!-- 自提点 -->
    <div class="section-header"><span class="bar"></span>自提点</div>
    <div class="info-card">
      <van-cell
        title="自提点"
        is-link
        :value="selectedPoint ? selectedPoint.name : '请选择自提点'"
        @click="showPicker = true"
        class="pickup-cell"
      />
      <van-cell
        v-if="selectedPoint"
        title="自提地址"
        :label="selectedPoint.address + (selectedPoint.contact_phone ? ' · ' + selectedPoint.contact_phone : '')"
      />
    </div>

    <!-- 收货信息 -->
    <div class="section-header"><span class="bar"></span>收货信息</div>
    <div class="info-card">
      <van-field v-model="form.receiver_name" label="收货人" placeholder="请输入收货人姓名" />
      <van-field
        v-model="form.phone"
        label="手机号"
        type="tel"
        maxlength="11"
        placeholder="请输入11位手机号"
      />
      <van-field
        v-model="form.receiver_address"
        label="收货地址"
        type="textarea"
        rows="2"
        autosize
        placeholder="请输入详细收货地址"
      />
    </div>

    <!-- 商品明细 -->
    <div class="section-header"><span class="bar"></span>商品明细</div>
    <div class="info-card">
      <div v-if="product" class="goods-item">
        <div class="goods-img">
          <van-image
            v-if="resolveImg(product.main_image)"
            :src="resolveImg(product.main_image)"
            fit="cover"
            width="80"
            height="80"
            radius="12"
          />
          <div v-else class="img-placeholder"><span>{{ firstChar(product.name) }}</span></div>
        </div>
        <div class="goods-info">
          <div class="goods-name van-multi-ellipsis--l2">{{ product.name }}</div>
          <div class="goods-spec" v-if="selectedSku">{{ selectedSku.spec }}</div>
          <div class="goods-bottom">
            <span class="price">
              <span class="symbol">¥</span>{{ formatPrice(unitPrice) }}
            </span>
            <span class="qty">×{{ quantity }}</span>
          </div>
        </div>
      </div>
      <van-skeleton v-else title :row="2" />
    </div>

    <!-- 金额 -->
    <div class="section-header"><span class="bar"></span>金额</div>
    <div class="info-card amount-card">
      <van-cell title="商品金额">
        <template #value>
          <span class="price-normal"><span class="symbol">¥</span>{{ formatPrice(totalAmount) }}</span>
        </template>
      </van-cell>
      <van-cell title="实付款">
        <template #value>
          <span class="pay-amount">
            <span class="symbol">¥</span>{{ formatPrice(totalAmount) }}
          </span>
        </template>
      </van-cell>
    </div>

    <!-- VIP 提示 -->
    <div v-if="vipChecked" class="vip-tip">
      <van-icon name="gem-o" />
      <span>{{ vipInfo.is_vip ? '您是好朋友VIP会员' : '暂非VIP会员，可联系团长开通' }}</span>
    </div>

    <div style="height: 70px"></div>

    <!-- 底部提交栏 -->
    <van-submit-bar
      :price="totalAmount * 100"
      button-text="提交订单并支付"
      @submit="onSubmit"
      class="submit-bar"
    >
      <template #price>
        <span class="submit-price">
          <span class="symbol">¥</span>{{ formatPrice(totalAmount) }}
        </span>
      </template>
      <template #button>
        <van-button
          type="primary"
          block
          round
          class="submit-btn"
          :loading="submitting"
          loading-text="提交中..."
          @click="onSubmit"
          >提交订单并支付</van-button
        >
      </template>
    </van-submit-bar>

    <!-- 自提点选择 Picker -->
    <van-popup v-model:show="showPicker" position="bottom" round>
      <van-picker
        :columns="pickerColumns"
        title="选择自提点"
        :loading="pickerLoading"
        confirm-button-text="确认"
        cancel-button-text="取消"
        @confirm="onPickConfirm"
        @cancel="showPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { api } from '@/api';
import { resolveImg, firstChar, formatPrice } from '@/utils';

const route = useRoute();
const router = useRouter();

const product = ref(null);
const skus = ref([]);
const quantity = ref(1);
const productId = ref(null);
const skuId = ref(null);

const points = ref([]);
const selectedPoint = ref(null);
const showPicker = ref(false);
const pickerLoading = ref(false);

const submitting = ref(false);

const form = ref({
  receiver_name: '',
  phone: '',
  receiver_address: ''
});

const vipChecked = ref(false);
const vipInfo = ref({ is_vip: false });

const selectedSku = computed(() => skus.value.find((s) => s.id === skuId.value) || null);

const unitPrice = computed(() => {
  if (selectedSku.value) return selectedSku.value.price;
  return product.value?.price ?? 0;
});

const totalAmount = computed(() => Number(unitPrice.value) * Number(quantity.value || 0));

const pickerColumns = computed(() =>
  points.value.map((p) => ({
    text: p.name + (p.address ? ' · ' + p.address : ''),
    value: p.id,
    raw: p
  }))
);

async function loadProduct() {
  if (!productId.value) {
    showToast('缺少商品参数');
    return;
  }
  try {
    const data = await api.getProduct(productId.value);
    product.value = data;
    skus.value = data.skus || [];
    if (skuId.value) {
      const s = skus.value.find((x) => x.id === Number(skuId.value));
      if (s && s.stock <= 0) {
        showToast('该规格已售罄');
      }
    }
  } catch (e) {
    showToast(e.message || '商品加载失败');
  }
}

async function loadPoints() {
  pickerLoading.value = true;
  try {
    const list = await api.getPickupPoints();
    points.value = Array.isArray(list) ? list : [];
    if (points.value.length === 0) {
      showToast('暂无自提点，请联系团长');
    }
  } catch (e) {
    showToast(e.message || '自提点加载失败');
  } finally {
    pickerLoading.value = false;
  }
}

function onPickConfirm({ selectedOptions }) {
  const opt = selectedOptions[0];
  if (opt && opt.raw) {
    selectedPoint.value = opt.raw;
  }
  showPicker.value = false;
}

async function checkVip() {
  if (!/^1\d{10}$/.test(form.value.phone)) {
    vipChecked.value = false;
    return;
  }
  try {
    const data = await api.checkVip(form.value.phone);
    vipInfo.value = data || { is_vip: false };
    vipChecked.value = true;
  } catch (e) {
    vipChecked.value = false;
  }
}

let vipTimer = null;
watch(
  () => form.value.phone,
  (val) => {
    if (vipTimer) clearTimeout(vipTimer);
    if (/^1\d{10}$/.test(val)) {
      vipTimer = setTimeout(checkVip, 500);
    } else {
      vipChecked.value = false;
    }
  }
);

function validate() {
  if (!selectedPoint.value) {
    showToast('请选择自提点');
    return false;
  }
  if (!form.value.receiver_name.trim()) {
    showToast('请填写收货人姓名');
    return false;
  }
  if (!/^1\d{10}$/.test(form.value.phone)) {
    showToast('请输入正确的11位手机号');
    return false;
  }
  if (!form.value.receiver_address.trim()) {
    showToast('请填写收货地址');
    return false;
  }
  if (!product.value) {
    showToast('商品信息缺失');
    return false;
  }
  return true;
}

async function onSubmit() {
  if (!validate()) return;
  if (submitting.value) return;
  submitting.value = true;
  try {
    const payload = {
      phone: form.value.phone,
      receiver_name: form.value.receiver_name.trim(),
      receiver_address: form.value.receiver_address.trim(),
      pickup_point_id: selectedPoint.value.id,
      items: [
        {
          product_id: product.value.id,
          sku_id: selectedSku.value ? selectedSku.value.id : null,
          quantity: Number(quantity.value) || 1
        }
      ]
    };
    const data = await api.createOrder(payload);
    const orderNo = data.order_no;
    if (!orderNo) {
      showToast('下单异常，未返回订单号');
      submitting.value = false;
      return;
    }
    window.location.href = '/api/payment/pay?order_no=' + orderNo;
  } catch (e) {
    showToast(e.message || '下单失败');
    submitting.value = false;
  }
}

function onBack() {
  router.back();
}

onMounted(() => {
  productId.value = route.query.product_id;
  skuId.value = route.query.sku_id ? Number(route.query.sku_id) : null;
  quantity.value = Number(route.query.quantity) || 1;
  loadProduct();
  loadPoints();
});
</script>

<style scoped>
:root {
  --hpy-shadow-sm: 0 2px 8px rgba(22, 119, 255, 0.06);
  --hpy-primary-soft: #E6F0FF;
}

.checkout {
  background: #F5F7FA;
  min-height: 100vh;
  padding-bottom: 10px;
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
  margin: 0 12px 12px;
  padding: 0;
  border-radius: 16px;
  background: #fff;
  overflow: hidden;
  box-shadow: var(--hpy-shadow-sm);
}

.info-card :deep(.van-cell) {
  border-bottom: 1px solid #F2F3F5;
}

.info-card :deep(.van-cell:last-child) {
  border-bottom: none;
}

.pickup-cell :deep(.van-cell__right-icon) {
  color: #1677FF;
}

.pickup-cell :deep(.van-cell__title) {
  color: #1677FF;
  font-weight: 600;
  font-size: 15px;
}

.pickup-cell :deep(.van-cell__value) {
  color: #1D2129;
  font-weight: 600;
  text-align: right;
  font-size: 14px;
}

.info-card :deep(.van-field__label) {
  color: #1D2129;
  font-weight: 700;
  font-size: 15px;
}

.info-card :deep(.van-field__control) {
  color: #1D2129;
  font-size: 14px;
}

.info-card :deep(.van-field__control::placeholder) {
  color: #C9CDD4;
}

.info-card :deep(.van-cell__label) {
  color: #86909C;
  font-size: 13px;
}

.goods-item {
  display: flex;
  padding: 14px 16px;
  gap: 12px;
}

.goods-img {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  background: #F2F3F5;
  flex-shrink: 0;
}

.goods-img .img-placeholder {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F2F3F5;
  border-radius: 12px;
}

.goods-img .img-placeholder span {
  font-size: 30px;
  color: #C9CDD4;
}

.goods-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.goods-name {
  font-size: 14px;
  font-weight: 600;
  color: #1D2129;
  line-height: 1.5;
}

.goods-spec {
  font-size: 12px;
  color: #86909C;
  margin-top: 4px;
}

.goods-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.goods-bottom .price {
  color: #F53F3F;
  font-size: 16px;
  font-weight: 700;
}

.goods-bottom .price .symbol {
  font-size: 12px;
  font-weight: 700;
}

.qty {
  font-size: 13px;
  color: #86909C;
}

.amount-card {
  overflow: hidden;
}

.amount-card :deep(.van-cell__title) {
  color: #4E5969;
  font-size: 14px;
}

.amount-card .price-normal {
  color: #1D2129;
  font-size: 15px;
  font-weight: 600;
}

.amount-card .price-normal .symbol {
  font-size: 12px;
}

.pay-amount {
  color: #F53F3F;
  font-size: 18px;
  font-weight: 800;
}

.pay-amount .symbol {
  font-size: 13px;
  font-weight: 800;
}

.vip-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 12px 16px;
  padding: 12px 16px;
  background: var(--hpy-primary-soft);
  color: #1677FF;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
}

.vip-tip .van-icon {
  color: #1677FF;
}

:deep(.van-submit-bar) {
  background: #fff;
  border-top: 1px solid #F2F3F5;
  padding: 8px 12px;
}

.submit-bar :deep(.van-submit-bar__price) {
  color: #1D2129;
  font-weight: 600;
}

.submit-price {
  color: #F53F3F;
  font-size: 20px;
  font-weight: 800;
}

.submit-price .symbol {
  font-size: 14px;
  font-weight: 800;
}

.submit-btn {
  background: linear-gradient(135deg, #1677FF 0%, #4096FF 100%) !important;
  border-color: transparent !important;
  color: #fff !important;
  font-size: 16px;
  font-weight: 700;
  height: 44px;
}

.submit-btn:deep(.van-button--active) {
  opacity: 0.9;
}
</style>
