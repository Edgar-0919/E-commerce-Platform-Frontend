<template>
  <div class="product-form-page">
    <el-card shadow="never">
      <template #header>
        <span>{{ isEdit ? '编辑商品' : '新增商品' }}</span>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width: 800px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入商品描述" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%" @change="handleCategoryChange">
            <el-option v-for="c in flatCategories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品图片" prop="mainImage">
          <el-input v-model="form.mainImage" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">上架</el-radio>
            <el-radio :value="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-divider content-position="left">规格参数</el-divider>
        <div v-if="specGroups.length > 0" class="spec-section">
          <div v-for="group in specGroups" :key="group.id" class="spec-group">
            <span class="spec-group-label">{{ group.name }}：</span>
            <div class="spec-options">
              <el-checkbox-group v-model="selectedSpecs[group.id]" @change="handleSpecChange">
                <el-checkbox v-for="(value, idx) in getSpecOptions(group)" :key="idx" :label="value">
                  {{ value }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
        </div>
        <div v-else class="empty-hint">
          <el-empty description="该分类暂无规格参数，商品将使用默认规格" />
        </div>

        <el-divider content-position="left">SKU列表</el-divider>
        <div v-if="skuList.length > 0" class="sku-section">
          <el-table :data="skuList" border style="width: 100%">
            <el-table-column prop="skuCode" label="SKU编码" width="180" />
            <el-table-column label="规格" min-width="200">
              <template #default="scope">
                <span v-for="(value, key) in scope.row.specValues" :key="key" class="spec-tag">
                  {{ key }}: {{ value }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="价格" width="120">
              <template #default="scope">
                <el-input-number v-model="scope.row.price" :min="0" :precision="2" class="price-input" />
              </template>
            </el-table-column>
            <el-table-column prop="stock" label="库存" width="120">
              <template #default="scope">
                <el-input-number v-model="scope.row.stock" :min="0" class="stock-input" />
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-else class="empty-hint">
          <el-empty description="请选择规格参数以生成SKU" />
        </div>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
          <el-button @click="$router.push('/admin/products')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createProduct, updateProduct, getProductDetail, getCategories, getSpecGroups } from '@/api/admin'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const formRef = ref(null)
const submitting = ref(false)
const categories = ref([])
const specGroups = ref([])
const selectedSpecs = reactive({})
const skuList = ref([])

const flatCategories = computed(() => {
  const flatten = (list, prefix = '') => {
    return list.reduce((acc, item) => {
      const label = prefix ? `${prefix} / ${item.name}` : item.name
      acc.push({ ...item, name: label })
      if (item.children && item.children.length > 0) {
        acc.push(...flatten(item.children, label))
      }
      return acc
    }, [])
  }
  return flatten(categories.value)
})

const form = reactive({
  name: '',
  description: '',
  categoryId: null,
  mainImage: '',
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

function getSpecOptions(group) {
  const options = []
  if (group.params) {
    for (const param of group.params) {
      if (param.parsedValues && param.parsedValues.length > 0) {
        options.push(...param.parsedValues)
      }
    }
  }
  return options
}

function cartesianProduct(arrays) {
  return arrays.reduce((a, b) => a.flatMap(x => b.map(y => [...x, y])), [[]])
}

function generateSkuList() {
  const selectedParams = []
  for (const group of specGroups.value) {
    const selected = selectedSpecs[group.id] || []
    if (selected.length > 0) {
      selectedParams.push(selected.map(name => ({ groupName: group.name, value: name })))
    }
  }

  if (selectedParams.length === 0) {
    skuList.value = [{
      skuCode: 'DEFAULT-' + Date.now(),
      specValues: { '默认规格': '默认' },
      price: null,
      stock: null
    }]
    return
  }

  const combinations = cartesianProduct(selectedParams)
  skuList.value = combinations.map((combo, index) => {
    const specValues = {}
    for (const item of combo) {
      specValues[item.groupName] = item.value
    }
    return {
      skuCode: 'SKU-' + Date.now() + '-' + (index + 1),
      specValues,
      price: null,
      stock: null
    }
  })
}

async function handleCategoryChange() {
  specGroups.value = []
  for (const key in selectedSpecs) {
    delete selectedSpecs[key]
  }
  skuList.value = []

  if (!form.categoryId) return

  try {
    const data = await getSpecGroups(form.categoryId)
    specGroups.value = data || []
    generateSkuList()
  } catch {
    specGroups.value = []
    generateSkuList()
  }
}

function handleSpecChange() {
  generateSkuList()
}

function buildPayload() {
  const validSkus = skuList.value.filter(sku => sku.price !== null && sku.stock !== null)
  if (validSkus.length === 0) {
    ElMessage.error('请至少填写一个SKU的价格和库存')
    return null
  }

  return {
    name: form.name,
    description: form.description,
    categoryId: form.categoryId,
    mainImage: form.mainImage || null,
    status: form.status,
    skus: validSkus.map(sku => ({
      skuCode: sku.skuCode,
      specValues: sku.specValues,
      price: sku.price,
      stock: sku.stock
    }))
  }
}

async function loadOptions() {
  try {
    const catRes = await getCategories()
    categories.value = catRes || []
  } catch {
    // ignore
  }
}

async function loadProduct() {
  if (!isEdit.value) return
  try {
    const data = await getProductDetail(route.params.id)
    form.name = data.name || ''
    form.description = data.description || ''
    form.categoryId = data.categoryId || null
    form.mainImage = data.mainImage || ''
    form.status = data.status ?? 1

    if (data.skus && data.skus.length > 0) {
      skuList.value = data.skus.map(sku => ({
        skuCode: sku.skuCode,
        specValues: sku.specValues || { '默认规格': '默认' },
        price: sku.price,
        stock: sku.stock
      }))
    } else {
      skuList.value = [{
        skuCode: 'DEFAULT-' + Date.now(),
        specValues: { '默认规格': '默认' },
        price: data.price,
        stock: data.stock
      }]
    }

    await handleCategoryChange()
  } catch {
    ElMessage.error('加载商品信息失败')
    router.push('/admin/products')
  }
}

async function handleSubmit() {
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  const payload = buildPayload()
  if (!payload) return

  submitting.value = true
  try {
    if (isEdit.value) {
      await updateProduct(route.params.id, payload)
      ElMessage.success('更新成功')
    } else {
      await createProduct(payload)
      ElMessage.success('创建成功')
    }
    router.push('/admin/products')
  } catch {
    // error handled by interceptor
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadOptions()
  loadProduct()
})
</script>

<style scoped>
.product-form-page { padding: 0; }
.spec-section { margin-bottom: 16px; }
.spec-group { display: flex; align-items: flex-start; margin-bottom: 12px; }
.spec-group-label { font-weight: 500; color: var(--text-primary); width: 80px; flex-shrink: 0; padding-top: 4px; }
.spec-options { flex: 1; display: flex; flex-wrap: wrap; gap: 8px; }
.spec-tag {
  display: inline-block;
  background: var(--primary-color);
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 4px;
  margin-bottom: 4px;
}
.empty-hint { padding: 20px 0; }
.price-input, .stock-input { width: 100%; }
</style>