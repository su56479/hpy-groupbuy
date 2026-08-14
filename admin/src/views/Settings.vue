<template>
  <div class="settings-page">
    <h3 class="page-title">系统设置</h3>

    <!-- 区块一：支付宝收款二维码 -->
    <el-card shadow="never" class="setting-card">
      <template #header>
        <div class="card-header">
          <el-icon><Wallet /></el-icon>
          <span>支付宝收款二维码</span>
        </div>
      </template>
      <p class="card-desc">
        上传支付宝收款二维码图片，用户下单后将在此二维码页面完成扫码支付。建议上传清晰的收款码图片（jpg/png）。
      </p>

      <div v-loading="qrcodeLoading" class="qrcode-area">
        <!-- 当前二维码预览 -->
        <div v-if="qrcodeUrl" class="qrcode-preview">
          <el-image
            :src="qrcodeUrl"
            fit="contain"
            style="width: 200px; height: 200px; border-radius: 8px; border: 1px solid #e4e7ed"
            :preview-src-list="[qrcodeUrl]"
            preview-teleported
          />
        </div>
        <!-- 空状态 -->
        <div v-else class="qrcode-empty">
          <el-icon class="empty-icon"><Picture /></el-icon>
          <span>尚未上传二维码</span>
        </div>

        <!-- 操作区 -->
        <div class="qrcode-actions">
          <el-upload
            :show-file-list="false"
            :before-upload="beforeQrcodeUpload"
            :http-request="onQrcodeUpload"
            accept="image/png,image/jpeg,image/jpg"
          >
            <el-button type="primary" :icon="Upload" :loading="qrcodeUploading">
              {{ qrcodeUrl ? '重新上传' : '上传二维码' }}
            </el-button>
          </el-upload>
          <el-button
            v-if="qrcodeUrl"
            type="danger"
            :icon="Delete"
            :loading="qrcodeDeleting"
            @click="onDeleteQrcode"
          >
            删除
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 区块二：自提码导出模板 -->
    <el-card shadow="never" class="setting-card">
      <template #header>
        <div class="card-header">
          <el-icon><Document /></el-icon>
          <span>自提码导出模板</span>
        </div>
      </template>
      <p class="card-desc">
        上传自提码导出模板（.xlsx），系统会自动识别表头列名。之后导出所有自提码清单时，将完全按此模板的列结构和样式生成。
      </p>

      <!-- 示例说明 -->
      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="example-tip"
        title="下载示例说明"
      >
        <template #default>
          表头第一行需包含如「自提码、手机号、收货人、自提点、商品、金额、状态」等列名即可被识别。
        </template>
      </el-alert>

      <div v-loading="templateLoading" class="template-area">
        <!-- 上传识别结果提示 -->
        <el-alert
          v-if="recognizeMessage"
          type="success"
          :closable="false"
          show-icon
          class="recognize-alert"
          :title="recognizeMessage"
        />

        <!-- 已有模板信息 -->
        <div v-if="templateData && templateData.exists" class="template-info">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="模板文件">
              {{ templateData.filename || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="上传时间">
              {{ templateData.uploaded_at || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="识别列数">
              {{ recognizedRows.length }} 列
            </el-descriptions-item>
            <el-descriptions-item label="操作">
              <el-button
                type="danger"
                size="small"
                :icon="Delete"
                :loading="templateDeleting"
                @click="onDeleteTemplate"
              >
                删除模板
              </el-button>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 识别到的表头列与对应字段 -->
        <div v-if="recognizedRows.length" class="recognized-table">
          <div class="recognized-title">
            <el-icon><CircleCheck /></el-icon>
            <span>已识别的列与对应字段</span>
          </div>
          <el-table :data="recognizedRows" border size="small">
            <el-table-column type="index" label="序号" width="70" align="center" />
            <el-table-column prop="header" label="模板表头列名" min-width="160" />
            <el-table-column label="对应字段" min-width="160">
              <template #default="{ row }">
                <el-tag v-if="row.field" type="success" size="small">{{ row.field }}</el-tag>
                <span v-else class="unrecognized">未识别</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 操作区 -->
        <div class="template-actions">
          <el-upload
            :show-file-list="false"
            :before-upload="beforeTemplateUpload"
            :http-request="onTemplateUpload"
            accept=".xlsx,.xls"
          >
            <el-button type="primary" :icon="Upload" :loading="templateUploading">
              {{ templateData && templateData.exists ? '重新上传' : '上传模板' }}
            </el-button>
          </el-upload>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Upload,
  Delete,
  Wallet,
  Document,
  Picture,
  CircleCheck
} from '@element-plus/icons-vue'
import {
  getAlipayQrcode,
  uploadAlipayQrcode,
  deleteAlipayQrcode,
  getPickupTemplate,
  uploadPickupTemplate,
  deletePickupTemplate
} from '../api'

// ===== 支付宝收款二维码 =====
const qrcodeLoading = ref(false)
const qrcodeUploading = ref(false)
const qrcodeDeleting = ref(false)
const qrcodeUrl = ref('')

async function fetchQrcode() {
  qrcodeLoading.value = true
  try {
    const res = await getAlipayQrcode()
    // data: { url: '/uploads/xxx.jpg' | null }
    qrcodeUrl.value = (res.data && res.data.url) || ''
  } catch (e) {
    // 已提示
  } finally {
    qrcodeLoading.value = false
  }
}

// 上传前校验图片类型
function beforeQrcodeUpload(file) {
  const isImage = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
  if (!isImage) {
    ElMessage.error('仅支持 jpg/png 格式的图片')
    return false
  }
  return true
}

// 自定义上传
async function onQrcodeUpload(option) {
  const { file } = option
  const form = new FormData()
  form.append('file', file)
  qrcodeUploading.value = true
  try {
    const res = await uploadAlipayQrcode(form)
    qrcodeUrl.value = (res.data && res.data.url) || ''
    ElMessage.success('二维码上传成功')
  } catch (e) {
    // 已提示
  } finally {
    qrcodeUploading.value = false
  }
}

function onDeleteQrcode() {
  ElMessageBox.confirm('确定要删除当前支付宝收款二维码吗？', '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  })
    .then(async () => {
      qrcodeDeleting.value = true
      try {
        await deleteAlipayQrcode()
        qrcodeUrl.value = ''
        ElMessage.success('已删除二维码')
      } catch (e) {
        // 已提示
      } finally {
        qrcodeDeleting.value = false
      }
    })
    .catch(() => {})
}

// ===== 自提码导出模板 =====
const templateLoading = ref(false)
const templateUploading = ref(false)
const templateDeleting = ref(false)
// 模板数据：{ exists, filename, headers, mapping, uploaded_at, recognized_fields }
const templateData = ref(null)
// 上传后由后端返回的识别提示信息
const recognizeMessage = ref('')

// 识别到的列与对应字段（用于表格展示）
const recognizedRows = computed(() => {
  const data = templateData.value
  if (!data || !data.exists) return []
  const headers = Array.isArray(data.headers) ? data.headers : []
  const mapping = (data.mapping && typeof data.mapping === 'object') ? data.mapping : {}
  // headers 为表头数组，mapping 为 { 字段名: 列索引(1-based) }
  // 反向构建：列索引 -> 字段名
  const indexToField = {}
  Object.entries(mapping).forEach(([field, idx]) => {
    indexToField[idx] = field
  })
  return headers.map((header, i) => ({
    header: header || `（空列${i + 1}）`,
    field: indexToField[i + 1] || ''
  }))
})

async function fetchTemplate() {
  templateLoading.value = true
  try {
    const res = await getPickupTemplate()
    templateData.value = res.data || null
  } catch (e) {
    // 已提示
  } finally {
    templateLoading.value = false
  }
}

// 上传前校验文件类型
function beforeTemplateUpload(file) {
  const name = (file.name || '').toLowerCase()
  const isExcel = name.endsWith('.xlsx') || name.endsWith('.xls')
  if (!isExcel) {
    ElMessage.error('仅支持 .xlsx 或 .xls 格式的模板文件')
    return false
  }
  return true
}

// 自定义上传
async function onTemplateUpload(option) {
  const { file } = option
  const form = new FormData()
  form.append('file', file)
  templateUploading.value = true
  try {
    const res = await uploadPickupTemplate(form)
    // data: { exists, filename, headers, mapping, recognized_fields, message }
    const data = res.data || {}
    templateData.value = data
    recognizeMessage.value = data.message || '模板上传成功'
    ElMessage.success('模板上传成功')
  } catch (e) {
    // 已提示
  } finally {
    templateUploading.value = false
  }
}

function onDeleteTemplate() {
  ElMessageBox.confirm('确定要删除当前自提码导出模板吗？删除后导出将使用默认格式。', '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  })
    .then(async () => {
      templateDeleting.value = true
      try {
        await deletePickupTemplate()
        templateData.value = null
        recognizeMessage.value = ''
        ElMessage.success('已删除模板')
      } catch (e) {
        // 已提示
      } finally {
        templateDeleting.value = false
      }
    })
    .catch(() => {})
}

// 进入页面加载当前状态
onMounted(() => {
  fetchQrcode()
  fetchTemplate()
})
</script>

<style scoped>
.settings-page {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
}
.page-title {
  margin: 0 0 16px;
  font-size: 16px;
}
.setting-card {
  margin-bottom: 16px;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}
.card-desc {
  margin: 0 0 16px;
  color: #606266;
  font-size: 13px;
  line-height: 1.6;
}

/* 支付宝二维码区块 */
.qrcode-area {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;
}
.qrcode-preview {
  flex: 0 0 auto;
}
.qrcode-empty {
  width: 200px;
  height: 200px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #909399;
  font-size: 13px;
  flex: 0 0 auto;
}
.empty-icon {
  font-size: 40px;
  color: #c0c4cc;
}
.qrcode-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* 模板区块 */
.example-tip {
  margin-bottom: 16px;
}
.recognize-alert {
  margin-bottom: 16px;
}
.template-info {
  margin-bottom: 16px;
}
.recognized-table {
  margin-bottom: 16px;
}
.recognized-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #67c23a;
  font-size: 13px;
}
.unrecognized {
  color: #c0c4cc;
  font-size: 12px;
}
.template-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
</style>
