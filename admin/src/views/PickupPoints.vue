<template>
  <div class="page-card">
    <div class="page-toolbar">
      <h3 class="page-title">自提点管理</h3>
      <el-button type="primary" :icon="Plus" @click="openCreate">新增自提点</el-button>
    </div>

    <el-table v-loading="loading" :data="list" border stripe style="width: 100%">
      <el-table-column prop="name" label="名称" min-width="160" show-overflow-tooltip />
      <el-table-column prop="address" label="地址" min-width="260" show-overflow-tooltip />
      <el-table-column prop="contact_phone" label="联系电话" width="150">
        <template #default="{ row }">{{ row.contact_phone || '-' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center">
        <template #default="{ row }">
          <el-button size="small" :icon="Edit" @click="openEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑 对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑自提点' : '新增自提点'"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入自提点名称" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" type="textarea" :rows="2" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contact_phone">
          <el-input v-model="form.contact_phone" placeholder="联系电话（选填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="onSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { getPickupPoints, createPickupPoint, updatePickupPoint, deletePickupPoint } from '../api'

const loading = ref(false)
const saving = ref(false)
const list = ref([])
const dialogVisible = ref(false)
const editingId = ref(null)
const formRef = ref()

const defaultForm = () => ({ name: '', address: '', contact_phone: '' })
const form = reactive(defaultForm())

const rules = {
  name: [{ required: true, message: '请输入自提点名称', trigger: 'blur' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }]
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getPickupPoints()
    list.value = res.data || []
  } finally {
    loading.value = false
  }
}

onMounted(fetchList)

function openCreate() {
  editingId.value = null
  Object.assign(form, defaultForm())
  dialogVisible.value = true
}

function openEdit(row) {
  editingId.value = row.id
  Object.assign(form, {
    name: row.name,
    address: row.address,
    contact_phone: row.contact_phone || ''
  })
  dialogVisible.value = true
}

function onDelete(row) {
  ElMessageBox.confirm(`确定删除自提点「${row.name}」吗？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  })
    .then(async () => {
      try {
        await deletePickupPoint(row.id)
        ElMessage.success('已删除')
        fetchList()
      } catch (e) {
        // 已提示
      }
    })
    .catch(() => {})
}

async function onSubmit() {
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    const payload = {
      name: form.name,
      address: form.address,
      contact_phone: form.contact_phone
    }
    try {
      if (editingId.value) {
        await updatePickupPoint(editingId.value, payload)
        ElMessage.success('保存成功')
      } else {
        await createPickupPoint(payload)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      fetchList()
    } catch (e) {
      // 已提示
    } finally {
      saving.value = false
    }
  })
}
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
}
.page-title {
  margin: 0;
  font-size: 16px;
}
</style>
