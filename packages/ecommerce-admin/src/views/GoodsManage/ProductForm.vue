<template>
  <div class="product-form-page">
    <el-card shadow="never">
      <template #header>
        <span>{{ isEdit ? '编辑商品' : '新增商品' }}</span>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width: 640px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入商品描述" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input v-model.number="form.price" placeholder="请输入价格" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input v-model.number="form.stock" placeholder="请输入库存" />
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
import { createProduct, updateProduct, getProductDetail, getCategories } from '@/api/admin'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const formRef = ref(null)
const submitting = ref(false)
const categories = ref([])

// 前端扁平结构，提交时会转换成后端需要的嵌套 skus 结构
const form = reactive({
  name: '',
  description: '',
  categoryId: null,
  price: null,
  stock: null,
  mainImage: '',
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
}

/**
 * 把前端扁平表单转换成后端 ProductSaveDTO 结构。
 * 关键点：后端期望 SKU 数据放在 skus[] 数组中（每条包含 skuCode/specValues/price/stock），
 * 前端的 price/stock 会被包装成一个默认 SKU 提交。
 */
function buildPayload() {
  return {
    name: form.name,
    description: form.description,
    categoryId: form.categoryId,
    mainImage: form.mainImage || null,
    status: form.status,
    // 关键：前端填的 price / stock 包装成一个默认 SKU 才能写入 t_sku 表
    skus: [{
      skuCode: 'DEFAULT-' + Date.now(),
      specValues: { '默认规格': '默认' },
      price: form.price,
      stock: form.stock
    }]
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
    // 基础字段
    form.name = data.name || ''
    form.description = data.description || ''
    form.categoryId = data.categoryId || null
    form.mainImage = data.mainImage || ''
    form.status = data.status ?? 1
    // 从第一个 SKU 回填 price/stock（编辑时展示给用户）
    if (data.skus && data.skus.length > 0) {
      form.price = data.skus[0].price
      form.stock = data.skus[0].stock
    } else {
      form.price = data.price
      form.stock = data.stock
    }
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
  submitting.value = true
  try {
    if (isEdit.value) {
      await updateProduct(route.params.id, buildPayload())
      ElMessage.success('更新成功')
    } else {
      await createProduct(buildPayload())
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
</style>