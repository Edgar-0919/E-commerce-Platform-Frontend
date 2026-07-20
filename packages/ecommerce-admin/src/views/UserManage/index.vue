<template>
  <div class="users-page">
    <el-card shadow="never">
      <div class="filter-bar">
        <el-input v-model="searchKeyword" placeholder="搜索用户名/手机号" style="width: 240px" clearable @clear="handleSearch" @keyup.enter="handleSearch" />
        <el-select v-model="searchStatus" placeholder="用户状态" style="width: 140px" clearable @change="handleSearch">
          <el-option label="正常" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
    </el-card>

    <el-card shadow="never" style="margin-top: 16px">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="100" />
        <el-table-column prop="username" label="用户名" min-width="140" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="roles" label="角色" width="120">
          <template #default="{ row }">
            <el-tag v-for="role in row.roles" :key="role" size="small" style="margin: 2px;">{{ roleText(role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '正常' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="warning" link @click="handleAssignRoles(row)">分配角色</el-button>
            <el-button size="small" :type="row.status === 1 ? 'danger' : 'success'" link @click="handleStatusChange(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchUsers"
          @current-change="fetchUsers"
        />
      </div>
    </el-card>

    <el-dialog v-model="roleDialogVisible" title="分配角色" width="440px" destroy-on-close>
      <el-checkbox-group v-model="selectedRoles">
        <el-checkbox label="ROLE_USER" />
        <el-checkbox label="ROLE_MERCHANT" />
        <el-checkbox label="ROLE_ADMIN" />
      </el-checkbox-group>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitRoles" :loading="roleSubmitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUsers, updateUserStatus, assignUserRoles } from '@/api/admin'

const tableData = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const searchStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const roleDialogVisible = ref(false)
const roleSubmitting = ref(false)
const selectedRoles = ref([])
const currentUserId = ref(null)

const roleTextMap = {
  ROLE_USER: '顾客',
  ROLE_MERCHANT: '商家',
  ROLE_ADMIN: '管理员'
}

function roleText(role) {
  return roleTextMap[role] || role
}

async function fetchUsers() {
  loading.value = true
  try {
    const res = await getUsers({
      keyword: searchKeyword.value,
      status: searchStatus.value,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    tableData.value = res.items || res.records || []
    total.value = parseInt(res.total || 0, 10)
  } catch {
    tableData.value = []
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchUsers()
}

async function handleStatusChange(row) {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定要${action}该用户吗？`, '提示', { type: 'warning' })
    await updateUserStatus(row.id, newStatus)
    ElMessage.success(`${action}成功`)
    fetchUsers()
  } catch {
    // cancelled
  }
}

function handleAssignRoles(row) {
  currentUserId.value = row.id
  selectedRoles.value = row.roles ? [...row.roles] : []
  roleDialogVisible.value = true
}

async function handleSubmitRoles() {
  roleSubmitting.value = true
  try {
    await assignUserRoles(currentUserId.value, selectedRoles.value)
    ElMessage.success('角色分配成功')
    roleDialogVisible.value = false
    fetchUsers()
  } catch {
    // handled
  } finally {
    roleSubmitting.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users-page { padding: 0; }
.filter-bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>