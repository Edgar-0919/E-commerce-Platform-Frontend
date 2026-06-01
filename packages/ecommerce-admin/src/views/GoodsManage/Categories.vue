<template>
  <div class="categories-page">
    <el-card shadow="never">
      <div class="header-bar">
        <el-button type="primary" @click="handleAdd(null)">新增分类</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe row-key="id" default-expand-all>
        <el-table-column prop="name" label="分类名称" min-width="200" />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column prop="icon" label="图标" width="100">
          <template #default="{ row }">
            <span v-if="row.icon">{{ row.icon }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="productCount" label="商品数" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleAdd(row)">添加子分类</el-button>
            <el-button size="small" type="warning" link @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="480px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父分类" prop="parentId">
          <el-select v-model="form.parentId" placeholder="无（顶级分类）" style="width: 100%" clearable :disabled="!!editingId">
            <el-option v-for="c in flatCategories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input v-model.number="form.sortOrder" placeholder="请输入排序值" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="form.icon" placeholder="请输入图标名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api/admin'

const tableData = ref([])
const flatCategories = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitting = ref(false)
const editingId = ref(null)
const formRef = ref(null)

const form = reactive({
  name: '',
  parentId: null,
  sortOrder: 0,
  icon: ''
})

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

function flattenCategories(list) {
  const result = []
  function walk(nodes) {
    nodes.forEach((node) => {
      result.push({ id: node.id, name: node.name })
      if (node.children && node.children.length) {
        walk(node.children)
      }
    })
  }
  walk(list)
  return result
}

async function fetchCategories() {
  loading.value = true
  try {
    const res = await getCategories()
    tableData.value = res || []
    flatCategories.value = flattenCategories(res || [])
  } catch {
    tableData.value = []
  } finally {
    loading.value = false
  }
}

function handleAdd(parent) {
  editingId.value = null
  dialogTitle.value = parent ? `添加「${parent.name}」的子分类` : '新增分类'
  form.name = ''
  form.parentId = parent ? parent.id : null
  form.sortOrder = 0
  form.icon = ''
  dialogVisible.value = true
}

function handleEdit(row) {
  editingId.value = row.id
  dialogTitle.value = '编辑分类'
  form.name = row.name
  form.parentId = row.parentId
  form.sortOrder = row.sortOrder
  form.icon = row.icon
  dialogVisible.value = true
}

async function handleSubmit() {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    if (editingId.value) {
      await updateCategory(editingId.value, { ...form, id: editingId.value })
      ElMessage.success('更新成功')
    } else {
      await createCategory({ ...form })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchCategories()
  } catch {
    // handled
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm('确定要删除该分类吗？删除后子分类也将一并删除', '警告', { type: 'warning' })
    await deleteCategory(row.id)
    ElMessage.success('删除成功')
    fetchCategories()
  } catch {
    // cancelled
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.categories-page { padding: 0; }
.header-bar { margin-bottom: 16px; }
</style>