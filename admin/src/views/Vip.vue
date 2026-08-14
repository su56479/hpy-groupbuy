<template>
  <div class="page-card">
    <div class="page-toolbar">
      <h3 class="page-title">VIP管理</h3>
    </div>

    <!-- 发放区 -->
    <el-card shadow="never" class="grant-card">
      <div class="grant-title">
        <el-icon><Medal /></el-icon>
        <span>发放VIP</span>
      </div>
      <el-form label-width="90px" label-position="right">
        <el-form-item label="手机号">
          <el-input
            v-model="phones"
            type="textarea"
            :rows="4"
            placeholder="多个手机号用逗号或换行分隔，例如：&#10;13800000001,13800000002&#10;13900000003"
          />
        </el-form-item>
        <el-form-item label="有效天数">
          <el-input-number v-model="validDays" :min="1" :max="3650" controls-position="right" />
          <span class="tip">天（默认365）</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Plus" :loading="granting" @click="onGrant">
            发放VIP
          </el-button>
        </el-form-item>
      </el-form>
      <div v-if="grantResult" class="grant-result">
        <el-alert
          type="success"
          :closable="false"
          :title="`成功发放 ${grantResult.count} 个VIP`"
          show-icon
        />
        <el-table :data="grantResult.list" border size="small" class="grant-table">
          <el-table-column prop="phone" label="手机号" width="150" />
          <el-table-column prop="valid_until" label="有效期至" width="180" />
        </el-table>
      </div>
    </el-card>

    <!-- 搜索 + 列表 -->
    <div class="filter-row">
      <el-input
        v-model="searchPhone"
        placeholder="按手机号搜索"
        clearable
        style="width: 220px"
        @keyup.enter="fetchList"
      />
      <el-button type="primary" :icon="Search" @click="fetchList">查询</el-button>
      <el-button :icon="RefreshLeft" @click="onReset">重置</el-button>
    </div>

    <el-table v-loading="loading" :data="list" border stripe style="width: 100%">
      <el-table-column prop="created_at" label="发放时间" width="170" />
      <el-table-column prop="phone" label="手机号" width="150" />
      <el-table-column prop="valid_until" label="有效期" width="180" />
      <el-table-column prop="granted_by" label="操作人" width="120" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.revoked ? 'info' : isExpired(row) ? 'warning' : 'success'">
            {{ row.revoked ? '已撤销' : isExpired(row) ? '已过期' : '有效' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template #default="{ row }">
          <el-button
            size="small"
            type="danger"
            :icon="Delete"
            :disabled="row.revoked === 1"
            @click="onRevoke(row)"
          >
            撤销
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, RefreshLeft, Delete, Medal } from '@element-plus/icons-vue'
import { getVipList, grantVip, revokeVip } from '../api'

const loading = ref(false)
const granting = ref(false)
const list = ref([])

const phones = ref('')
const validDays = ref(365)
const searchPhone = ref('')
const grantResult = ref(null)

function isExpired(row) {
  if (!row.valid_until) return false
  return new Date(row.valid_until.replace(' ', 'T')) < new Date()
}

async function fetchList() {
  loading.value = true
  try {
    const params = {}
    if (searchPhone.value.trim()) params.phone = searchPhone.value.trim()
    const res = await getVipList(params)
    list.value = res.data || []
  } finally {
    loading.value = false
  }
}

function onReset() {
  searchPhone.value = ''
  fetchList()
}

async function onGrant() {
  if (!phones.value.trim()) {
    ElMessage.warning('请输入手机号')
    return
  }
  granting.value = true
  try {
    const res = await grantVip({ phones: phones.value, valid_days: validDays.value })
    grantResult.value = res.data
    ElMessage.success(`成功发放 ${res.data.count} 个VIP`)
    phones.value = ''
    fetchList()
  } catch (e) {
    // 已提示
  } finally {
    granting.value = false
  }
}

function onRevoke(row) {
  ElMessageBox.confirm(`确定撤销 ${row.phone} 的VIP吗？`, '撤销确认', {
    type: 'warning',
    confirmButtonText: '撤销',
    cancelButtonText: '取消'
  })
    .then(async () => {
      try {
        await revokeVip(row.id)
        ElMessage.success('已撤销')
        fetchList()
      } catch (e) {
        // 已提示
      }
    })
    .catch(() => {})
}

onMounted(fetchList)
</script>

<style scoped>
.page-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
}
.page-toolbar {
  margin-bottom: 16px;
}
.page-title {
  margin: 0;
  font-size: 16px;
}
.grant-card {
  margin-bottom: 16px;
  background: #fffbe6;
  border: 1px solid #faecd8;
}
.grant-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #e6a23c;
}
.tip {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}
.grant-result {
  margin-top: 12px;
}
.grant-table {
  margin-top: 8px;
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
</style>
