<template>
  <div class="page-card">
    <div class="page-toolbar">
      <h3 class="page-title">订单管理</h3>
      <div class="export-group" v-if="state.role === 'admin'">
        <el-button type="warning" :icon="ShoppingCart" :loading="exportingPurchase" @click="onExportPurchase">
          导出采购单（按商品汇总）
        </el-button>
        <el-button :icon="Download" :loading="exportingOrders" @click="onExportOrders">
          导出订单Excel
        </el-button>
        <el-button :icon="Download" :loading="exportingCodes" @click="onExportPickupCodes">
          导出自提码清单
        </el-button>
      </div>
    </div>

    <!-- 核销区 -->
    <el-card shadow="never" class="verify-card">
      <div class="verify-row">
        <el-icon class="verify-icon"><CircleCheck /></el-icon>
        <span class="verify-label">订单核销</span>
        <el-input
          v-model="verifyKeyword"
          placeholder="输入自提码 / 手机号 / 订单号"
          class="verify-input"
          clearable
          @keyup.enter="onVerify"
        />
        <el-button type="primary" :icon="Check" :loading="verifying" @click="onVerify">
          核销
        </el-button>
      </div>
      <div v-if="verifyResult" class="verify-result">
        <el-alert
          :type="verifyResult.verified > 0 ? 'success' : 'warning'"
          :closable="false"
          :title="`成功核销 ${verifyResult.verified} 笔订单`"
          show-icon
        />
        <el-table :data="verifyResult.orders" border size="small" class="verify-table">
          <el-table-column prop="order_no" label="订单号" min-width="200" />
          <el-table-column prop="phone" label="手机号" width="130" />
          <el-table-column prop="pickup_code" label="自提码" width="120" />
          <el-table-column label="金额" width="100" align="right">
            <template #default="{ row }">￥{{ formatPrice(row.total_amount) }}</template>
          </el-table-column>
          <el-table-column prop="completed_at" label="核销时间" width="170" />
        </el-table>
      </div>
    </el-card>

    <!-- 筛选 -->
    <el-form :inline="true" class="filter-form">
      <el-form-item label="状态">
        <el-select v-model="filter.status" placeholder="全部" clearable style="width: 130px">
          <el-option label="待支付" value="pending_pay" />
          <el-option label="待自提" value="pending_pickup" />
          <el-option label="已核销" value="completed" />
          <el-option label="已关闭" value="closed" />
        </el-select>
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="filter.phone" placeholder="手机号" clearable style="width: 150px" />
      </el-form-item>
      <el-form-item label="自提点">
        <el-select
          v-model="filter.pickup_point_id"
          placeholder="全部"
          clearable
          filterable
          style="width: 180px"
        >
          <el-option
            v-for="p in pickupPoints"
            :key="p.id"
            :label="p.name"
            :value="p.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="日期">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 260px"
        />
      </el-form-item>
      <el-form-item label="关键词">
        <el-input v-model="filter.keyword" placeholder="订单号/自提码/手机号" clearable style="width: 200px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="onQuery">查询</el-button>
        <el-button :icon="RefreshLeft" @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border stripe style="width: 100%">
      <el-table-column prop="order_no" label="订单号" min-width="200" show-overflow-tooltip />
      <el-table-column prop="created_at" label="下单时间" width="170" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="receiver_name" label="收货人" width="100" show-overflow-tooltip />
      <el-table-column prop="pickup_point_name" label="自提点" min-width="140" show-overflow-tooltip />
      <el-table-column label="商品明细" min-width="220" show-overflow-tooltip>
        <template #default="{ row }">
          <span v-if="row.items && row.items.length">
            {{ row.items.map((it) => `${it.product_name}${it.sku_spec ? '(' + it.sku_spec + ')' : ''} x${it.quantity}`).join('；') }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="金额" width="100" align="right">
        <template #default="{ row }">￥{{ formatPrice(row.total_amount) }}</template>
      </el-table-column>
      <el-table-column prop="pickup_code" label="自提码" width="110" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="completed_at" label="核销时间" width="170" />
      <el-table-column label="操作" width="110" align="center" fixed="right" v-if="state.role === 'admin'">
        <template #default="{ row }">
          <el-popconfirm
            title="确定删除该订单？删除后将无法恢复（未核销订单会自动回库）"
            confirm-button-text="删除"
            cancel-button-text="取消"
            confirm-button-type="danger"
            @confirm="onDelete(row)"
          >
            <template #reference>
              <el-button type="danger" link size="small" :icon="Delete">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Check, Search, RefreshLeft, CircleCheck, ShoppingCart, Delete } from '@element-plus/icons-vue'
import { getOrders, verifyOrder, getPickupPoints, exportOrders, exportPickupCodes, exportPurchase, deleteOrder } from '../api'
import { state } from '../stores/auth'

const loading = ref(false)
const deleting = ref(false)
const list = ref([])
const pickupPoints = ref([])

const filter = reactive({
  status: '',
  phone: '',
  pickup_point_id: '',
  keyword: ''
})
const dateRange = ref([])

const verifyKeyword = ref('')
const verifying = ref(false)
const verifyResult = ref(null)

const exportingOrders = ref(false)
const exportingCodes = ref(false)
const exportingPurchase = ref(false)

function formatPrice(p) {
  return Number(p || 0).toFixed(2)
}

const STATUS_MAP = {
  pending_pay: { text: '待支付', type: 'info' },
  pending_pickup: { text: '待自提', type: 'warning' },
  completed: { text: '已核销', type: 'success' },
  closed: { text: '已关闭', type: 'danger' }
}
function statusText(s) {
  return STATUS_MAP[s] ? STATUS_MAP[s].text : s
}
function statusType(s) {
  return STATUS_MAP[s] ? STATUS_MAP[s].type : 'info'
}

async function fetchList() {
  loading.value = true
  try {
    const params = { ...filter }
    if (dateRange.value && dateRange.value.length === 2) {
      params.start = `${dateRange.value[0]} 00:00:00`
      params.end = `${dateRange.value[1]} 23:59:59`
    }
    // 清理空值
    Object.keys(params).forEach((k) => {
      if (params[k] === '' || params[k] === null) delete params[k]
    })
    const res = await getOrders(params)
    list.value = res.data || []
  } finally {
    loading.value = false
  }
}

async function fetchPickupPoints() {
  try {
    const res = await getPickupPoints()
    pickupPoints.value = res.data || []
  } catch (e) {
    // 忽略
  }
}

function onQuery() {
  fetchList()
}

function onReset() {
  filter.status = ''
  filter.phone = ''
  filter.pickup_point_id = ''
  filter.keyword = ''
  dateRange.value = []
  fetchList()
}

async function onVerify() {
  if (!verifyKeyword.value.trim()) {
    ElMessage.warning('请输入自提码/手机号/订单号')
    return
  }
  verifying.value = true
  try {
    const res = await verifyOrder(verifyKeyword.value.trim())
    verifyResult.value = res.data
    ElMessage.success(`成功核销 ${res.data.verified} 笔订单`)
    fetchList()
  } catch (e) {
    verifyResult.value = null
  } finally {
    verifying.value = false
  }
}

// blob 下载通用处理
async function downloadBlob(reqFn, filename) {
  try {
    const response = await reqFn()
    // 错误响应可能是 JSON（401/403），需甄别
    const blob = response.data
    if (blob instanceof Blob && blob.type.includes('application/json')) {
      const text = await blob.text()
      const j = JSON.parse(text)
      ElMessage.error(j.message || '导出失败')
      return
    }
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (e) {
    // 已提示
  }
}

async function onExportOrders() {
  exportingOrders.value = true
  const params = { ...filter }
  if (dateRange.value && dateRange.value.length === 2) {
    params.start = `${dateRange.value[0]} 00:00:00`
    params.end = `${dateRange.value[1]} 23:59:59`
  }
  Object.keys(params).forEach((k) => {
    if (params[k] === '' || params[k] === null) delete params[k]
  })
  await downloadBlob(() => exportOrders(params), `订单清单_${Date.now()}.xlsx`)
  exportingOrders.value = false
}

async function onExportPickupCodes() {
  exportingCodes.value = true
  await downloadBlob(() => exportPickupCodes({ status: 'pending_pickup' }), `自提码清单_${Date.now()}.xlsx`)
  exportingCodes.value = false
}

async function onExportPurchase() {
  exportingPurchase.value = true
  const params = {}
  if (dateRange.value && dateRange.value.length === 2) {
    params.start = `${dateRange.value[0]} 00:00:00`
    params.end = `${dateRange.value[1]} 23:59:59`
  }
  if (filter.status) params.status = filter.status
  await downloadBlob(() => exportPurchase(params), `采购单汇总_${Date.now()}.xlsx`)
  exportingPurchase.value = false
}

async function onDelete(row) {
  if (deleting.value) return
  deleting.value = true
  try {
    await deleteOrder(row.id)
    ElMessage.success('订单已删除')
    list.value = list.value.filter((x) => x.id !== row.id)
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchPickupPoints()
  fetchList()
})
</script>

<style scoped>
.page-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
}
.page-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}
.page-title {
  margin: 0;
  font-size: 16px;
}
.export-group {
  display: flex;
  gap: 8px;
}
.verify-card {
  margin-bottom: 16px;
  background: #f0f9ff;
  border: 1px solid #d4e8fc;
}
.verify-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.verify-icon {
  font-size: 20px;
  color: #409eff;
}
.verify-label {
  font-weight: 600;
  white-space: nowrap;
}
.verify-input {
  max-width: 360px;
}
.verify-result {
  margin-top: 12px;
}
.verify-table {
  margin-top: 8px;
}
.filter-form {
  margin-bottom: 8px;
}
</style>
