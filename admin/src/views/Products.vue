<template>
  <div class="page-card">
    <div class="page-toolbar">
      <h3 class="page-title">商品管理</h3>
      <el-button type="primary" :icon="Plus" @click="openCreate">新建商品</el-button>
    </div>

    <el-table v-loading="loading" :data="list" border stripe style="width: 100%">
      <el-table-column label="主图" width="80" align="center">
        <template #default="{ row }">
          <el-image
            v-if="row.main_image"
            :src="row.main_image"
            fit="cover"
            style="width: 50px; height: 50px; border-radius: 4px"
            :preview-src-list="[row.main_image]"
            preview-teleported
          />
          <span v-else class="empty-img">无</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" min-width="160" show-overflow-tooltip />
      <el-table-column label="售价" width="100" align="right">
        <template #default="{ row }">￥{{ formatPrice(row.price) }}</template>
      </el-table-column>
      <el-table-column prop="sku_code" label="SKU编号" width="140" show-overflow-tooltip />
      <el-table-column prop="stock" label="库存" width="90" align="right" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'on_shelf' ? 'success' : 'info'">
            {{ row.status === 'on_shelf' ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" align="center" fixed="right">
        <template #default="{ row }">
          <el-button
            size="small"
            :type="row.status === 'on_shelf' ? 'warning' : 'success'"
            @click="toggleStatus(row)"
          >
            {{ row.status === 'on_shelf' ? '下架' : '上架' }}
          </el-button>
          <el-button size="small" :icon="Edit" @click="openEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="onDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新建/编辑 抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="editingId ? '编辑商品' : '新建商品'"
      size="560px"
      direction="rtl"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" maxlength="100" />
        </el-form-item>
        <el-form-item label="售价" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" :step="0.5" controls-position="right" />
        </el-form-item>
        <el-form-item label="SKU编号" prop="sku_code">
          <el-input v-model="form.sku_code" placeholder="商品唯一SKU编号" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" :step="1" controls-position="right" />
        </el-form-item>

        <el-form-item label="主图" prop="main_image">
          <el-upload
            class="main-uploader"
            :show-file-list="false"
            :http-request="uploadMain"
            accept="image/*"
          >
            <img v-if="form.main_image" :src="form.main_image" class="main-preview" />
            <div v-else class="uploader-placeholder">
              <el-icon><Plus /></el-icon>
              <span>上传主图</span>
            </div>
          </el-upload>
          <el-button v-if="form.main_image" link type="danger" @click="form.main_image = ''">移除</el-button>
        </el-form-item>

        <el-form-item label="详情图集">
          <el-upload
            :file-list="detailFileList"
            list-type="picture-card"
            :http-request="uploadDetail"
            accept="image/*"
            :on-remove="removeDetail"
          >
            <div class="uploader-placeholder small">
              <el-icon><Plus /></el-icon>
            </div>
          </el-upload>
        </el-form-item>

        <el-form-item label="多SKU规格">
          <el-table :data="form.skus" border size="small" class="sku-table">
            <el-table-column label="规格" min-width="120">
              <template #default="{ row }">
                <el-input v-model="row.spec" placeholder="如 1斤/500g" />
              </template>
            </el-table-column>
            <el-table-column label="价格" width="110">
              <template #default="{ row }">
                <el-input-number v-model="row.price" :min="0" :precision="2" :controls="false" style="width: 90px" />
              </template>
            </el-table-column>
            <el-table-column label="库存" width="100">
              <template #default="{ row }">
                <el-input-number v-model="row.stock" :min="0" :controls="false" style="width: 80px" />
              </template>
            </el-table-column>
            <el-table-column label="SKU编号" min-width="120">
              <template #default="{ row }">
                <el-input v-model="row.sku_code" placeholder="留空自动生成" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="70" align="center">
              <template #default="{ $index }">
                <el-button link type="danger" :icon="Delete" @click="removeSku($index)" />
              </template>
            </el-table-column>
          </el-table>
          <el-button class="add-sku-btn" :icon="Plus" plain size="small" @click="addSku">
            添加规格
          </el-button>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="onSubmit">保存</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  patchProductStatus,
  deleteProduct,
  uploadImage
} from '../api'

const loading = ref(false)
const saving = ref(false)
const list = ref([])
const drawerVisible = ref(false)
const editingId = ref(null)
const formRef = ref()
const detailFileList = ref([])

const defaultForm = () => ({
  name: '',
  price: 0,
  sku_code: '',
  stock: 0,
  main_image: '',
  detail_images: [],
  skus: []
})

const form = reactive(defaultForm())

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  sku_code: [{ required: true, message: '请输入SKU编号', trigger: 'blur' }],
  price: [{ required: true, message: '请输入售价', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
}

function formatPrice(p) {
  return Number(p || 0).toFixed(2)
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getProducts()
    list.value = res.data || []
  } finally {
    loading.value = false
  }
}

onMounted(fetchList)

function openCreate() {
  editingId.value = null
  Object.assign(form, defaultForm())
  detailFileList.value = []
  drawerVisible.value = true
}

async function openEdit(row) {
  editingId.value = row.id
  Object.assign(form, defaultForm())
  try {
    const res = await getProduct(row.id)
    const p = res.data
    form.name = p.name
    form.price = p.price
    form.sku_code = p.sku_code
    form.stock = p.stock
    form.main_image = p.main_image || ''
    form.detail_images = Array.isArray(p.detail_images) ? [...p.detail_images] : []
    form.skus = (p.skus || []).map((s) => ({
      id: s.id,
      spec: s.spec || '',
      price: s.price,
      stock: s.stock,
      sku_code: s.sku_code || ''
    }))
    detailFileList.value = form.detail_images.map((url, i) => ({
      name: `detail_${i}`,
      url
    }))
    drawerVisible.value = true
  } catch (e) {
    // 已提示
  }
}

async function toggleStatus(row) {
  const next = row.status === 'on_shelf' ? 'off_shelf' : 'on_shelf'
  try {
    await patchProductStatus(row.id, next)
    ElMessage.success(next === 'on_shelf' ? '已上架' : '已下架')
    row.status = next
  } catch (e) {
    // 已提示
  }
}

function onDelete(row) {
  ElMessageBox.confirm(
    '将彻底删除商品数据和所有图片，不可恢复',
    '删除确认',
    {
      type: 'error',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      confirmButtonClass: 'el-button--danger'
    }
  )
    .then(async () => {
      try {
        await deleteProduct(row.id)
        ElMessage.success('已删除')
        fetchList()
      } catch (e) {
        // 已提示
      }
    })
    .catch(() => {})
}

// 自定义上传：主图（单图）
async function uploadMain(option) {
  const { file } = option
  try {
    const res = await uploadImage(file)
    form.main_image = res.data.url
    ElMessage.success('主图上传成功')
  } catch (e) {
    // 已提示
  }
}

// 自定义上传：详情图（多图）
async function uploadDetail(option) {
  const { file } = option
  try {
    const res = await uploadImage(file)
    const url = res.data.url
    form.detail_images.push(url)
    detailFileList.value.push({ name: file.name, url })
  } catch (e) {
    // 已提示
  }
}

function removeDetail(file) {
  const url = file.url
  form.detail_images = form.detail_images.filter((u) => u !== url)
  detailFileList.value = detailFileList.value.filter((f) => f.url !== url)
}

function addSku() {
  form.skus.push({ spec: '', price: 0, stock: 0, sku_code: '' })
}

function removeSku(index) {
  form.skus.splice(index, 1)
}

async function onSubmit() {
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    const payload = {
      name: form.name,
      price: form.price,
      sku_code: form.sku_code,
      stock: form.stock,
      main_image: form.main_image,
      detail_images: form.detail_images,
      skus: form.skus.map((s) => ({
        spec: s.spec,
        price: s.price,
        stock: s.stock,
        sku_code: s.sku_code
      }))
    }
    try {
      if (editingId.value) {
        await updateProduct(editingId.value, payload)
        ElMessage.success('保存成功')
      } else {
        await createProduct(payload)
        ElMessage.success('创建成功')
      }
      drawerVisible.value = false
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
.empty-img {
  color: #c0c4cc;
  font-size: 12px;
}
.main-uploader {
  display: inline-block;
}
.main-preview {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #dcdfe6;
}
.uploader-placeholder {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  gap: 4px;
  font-size: 12px;
  cursor: pointer;
}
.uploader-placeholder:hover {
  border-color: #409eff;
  color: #409eff;
}
.uploader-placeholder.small {
  width: auto;
  height: auto;
  padding: 24px;
}
.sku-table {
  width: 100%;
}
.add-sku-btn {
  margin-top: 8px;
  width: 100%;
}
</style>
