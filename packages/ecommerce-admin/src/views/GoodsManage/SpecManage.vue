<template>
  <div class="spec-manage-page">
    <el-card shadow="never">
      <div class="header-bar">
        <el-button type="primary" @click="handleAddGroup">新增规格组</el-button>
      </div>

      <el-table :data="groupList" v-loading="loading" stripe>
        <el-table-column prop="name" label="规格组名称" min-width="150" />
        <el-table-column prop="categoryName" label="关联分类" min-width="150" />
        <el-table-column label="规格参数" min-width="200">
          <template #default="{ row }">
            <el-tag v-for="param in getParamsByGroup(row.id)" :key="param.id" size="small" class="param-tag">
              {{ param.name }}
            </el-tag>
            <span v-if="getParamsByGroup(row.id).length === 0" class="empty-text">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleAddParam(row)">添加参数</el-button>
            <el-button size="small" type="warning" link @click="handleEditGroup(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDeleteGroup(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="groupDialogVisible" :title="groupDialogTitle" width="480px" destroy-on-close>
      <el-form ref="groupFormRef" :model="groupForm" :rules="groupRules" label-width="80px">
        <el-form-item label="规格组名称" prop="name">
          <el-input v-model="groupForm.name" placeholder="请输入规格组名称" />
        </el-form-item>
        <el-form-item label="关联分类" prop="categoryId">
          <el-select v-model="groupForm.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="c in flatCategories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model.number="groupForm.sort" placeholder="请输入排序值" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="groupDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitGroup" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="paramDialogVisible" :title="paramDialogTitle" width="480px" destroy-on-close>
      <el-form ref="paramFormRef" :model="paramForm" :rules="paramRules" label-width="80px">
        <el-form-item label="参数名称" prop="name">
          <el-input v-model="paramForm.name" placeholder="请输入参数名称" />
        </el-form-item>
        <el-form-item label="可选值" prop="values">
          <el-input v-model="paramForm.valuesText" placeholder="多个值用逗号分隔，如：红色,蓝色,绿色" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model.number="paramForm.sort" placeholder="请输入排序值" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="paramDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitParam" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategories } from '@/api/admin'
import { listSpecGroups, saveSpecGroup, updateSpecGroup, deleteSpecGroup, listSpecParams, saveSpecParam, updateSpecParam, deleteSpecParam } from '@/api/spec'

const loading = ref(false)
const submitting = ref(false)
const groupList = ref([])
const paramList = ref([])
const categories = ref([])

const groupDialogVisible = ref(false)
const groupDialogTitle = ref('')
const groupFormRef = ref(null)
const editingGroupId = ref(null)
const currentGroupId = ref(null)

const paramDialogVisible = ref(false)
const paramDialogTitle = ref('')
const paramFormRef = ref(null)
const editingParamId = ref(null)

const flatCategories = computed(() => {
  const result = []
  function walk(nodes, prefix = '') {
    nodes.forEach((node) => {
      const label = prefix ? `${prefix} / ${node.name}` : node.name
      result.push({ id: String(node.id), name: label })
      if (node.children && node.children.length) {
        walk(node.children, label)
      }
    })
  }
  walk(categories.value)
  return result
})

const groupForm = reactive({
  name: '',
  categoryId: null,
  sort: 0
})

const groupRules = {
  name: [{ required: true, message: '请输入规格组名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择关联分类', trigger: 'change' }]
}

const paramForm = reactive({
  name: '',
  valuesText: '',
  sort: 0
})

const paramRules = {
  name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }],
  values: [{ required: true, message: '请输入可选值', trigger: 'blur' }]
}

function getParamsByGroup(groupId) {
  return paramList.value.filter(p => p.groupId === groupId)
}

function getCategoryName(categoryId) {
  const findName = (nodes) => {
    for (const node of nodes) {
      if (String(node.id) === String(categoryId)) return node.name
      if (node.children && node.children.length) {
        const found = findName(node.children)
        if (found) return found
      }
    }
    return '-'
  }
  return findName(categories.value)
}

async function fetchData() {
  loading.value = true
  try {
    const [groups, params, cats] = await Promise.all([
      listSpecGroups(),
      listSpecParams(),
      getCategories()
    ])
    groupList.value = groups || []
    paramList.value = params || []
    categories.value = cats || []
  } catch {
    groupList.value = []
    paramList.value = []
  } finally {
    loading.value = false
  }
}

function handleAddGroup() {
  editingGroupId.value = null
  groupDialogTitle.value = '新增规格组'
  groupForm.name = ''
  groupForm.categoryId = null
  groupForm.sort = 0
  groupDialogVisible.value = true
}

function handleEditGroup(row) {
  editingGroupId.value = row.id
  groupDialogTitle.value = '编辑规格组'
  groupForm.name = row.name
  groupForm.categoryId = row.categoryId
  groupForm.sort = row.sort || 0
  groupDialogVisible.value = true
}

async function handleSubmitGroup() {
  try {
    await groupFormRef.value.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    if (editingGroupId.value) {
      await updateSpecGroup(editingGroupId.value, { ...groupForm })
      ElMessage.success('更新成功')
    } else {
      await saveSpecGroup({ ...groupForm })
      ElMessage.success('创建成功')
    }
    groupDialogVisible.value = false
    fetchData()
  } catch {
    // handled
  } finally {
    submitting.value = false
  }
}

async function handleDeleteGroup(row) {
  try {
    await ElMessageBox.confirm('确定要删除该规格组吗？关联的规格参数也将一并删除', '警告', { type: 'warning' })
    await deleteSpecGroup(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    // cancelled
  }
}

function handleAddParam(group) {
  editingParamId.value = null
  currentGroupId.value = group.id
  paramDialogTitle.value = `为「${group.name}」添加参数`
  paramForm.name = ''
  paramForm.valuesText = ''
  paramForm.sort = 0
  paramDialogVisible.value = true
}

function handleEditParam(row) {
  editingParamId.value = row.id
  currentGroupId.value = row.groupId
  const group = groupList.value.find(g => g.id === row.groupId)
  paramDialogTitle.value = `编辑参数「${row.name}」`
  paramForm.name = row.name
  paramForm.valuesText = row.values ? row.values.replace(/[\[\]"\\]/g, '') : ''
  paramForm.sort = row.sort || 0
  paramDialogVisible.value = true
}

async function handleSubmitParam() {
  if (!paramForm.name) {
    ElMessage.error('请输入参数名称')
    return
  }
  if (!paramForm.valuesText) {
    ElMessage.error('请输入可选值')
    return
  }
  
  const valuesArray = paramForm.valuesText.split(/[,，]/).map(v => v.trim()).filter(v => v)
  
  submitting.value = true
  try {
    const data = {
      groupId: currentGroupId.value,
      name: paramForm.name,
      values: JSON.stringify(valuesArray),
      sort: paramForm.sort || 0
    }
    if (editingParamId.value) {
      await updateSpecParam(editingParamId.value, data)
      ElMessage.success('更新成功')
    } else {
      await saveSpecParam(data)
      ElMessage.success('创建成功')
    }
    paramDialogVisible.value = false
    fetchData()
  } catch {
    // handled
  } finally {
    submitting.value = false
  }
}

async function handleDeleteParam(row) {
  try {
    await ElMessageBox.confirm('确定要删除该规格参数吗？', '警告', { type: 'warning' })
    await deleteSpecParam(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    // cancelled
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.spec-manage-page { padding: 0; }
.header-bar { margin-bottom: 16px; }
.param-tag { margin-right: 4px; margin-bottom: 4px; }
.empty-text { color: #909399; }
</style>