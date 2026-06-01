<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">今日订单</p>
              <p class="stat-value">{{ stats.todayOrders }}</p>
            </div>
            <el-icon class="stat-icon" color="#409eff"><Document /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">今日营收</p>
              <p class="stat-value">¥{{ formatMoney(stats.todayRevenue) }}</p>
            </div>
            <el-icon class="stat-icon" color="#67c23a"><Money /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">待处理订单</p>
              <p class="stat-value">{{ stats.pendingOrders }}</p>
            </div>
            <el-icon class="stat-icon" color="#e6a23c"><Clock /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">订单总数</p>
              <p class="stat-value">{{ stats.totalOrders }}</p>
            </div>
            <el-icon class="stat-icon" color="#f56c6c"><Van /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>近30天销售趋势</span>
              <el-radio-group v-model="trendType" size="small" @change="renderTrendChart">
                <el-radio-button label="orderCount">订单量</el-radio-button>
                <el-radio-button label="revenue">销售额</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <template #header><span>商品销量 Top10</span></template>
          <div ref="rankChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Document, Money, Clock, Van } from '@element-plus/icons-vue'
import { getDashboardStats, getDashboardTrend } from '@/api/admin'
import * as echarts from 'echarts'

const stats = ref({
  todayOrders: 0,
  todayRevenue: 0,
  pendingOrders: 0,
  totalOrders: 0
})

const trendType = ref('orderCount')
const trendChartRef = ref(null)
const rankChartRef = ref(null)
let trendChart = null
let rankChart = null

function formatMoney(val) {
  if (val == null) return '0.00'
  return Number(val).toFixed(2)
}

async function fetchStats() {
  try {
    const data = await getDashboardStats()
    if (data) {
      stats.value = data
    }
  } catch {
    stats.value = { todayOrders: 0, todayRevenue: 0, pendingOrders: 0, totalOrders: 0 }
  }
}

async function fetchTrend() {
  try {
    const trendData = await getDashboardTrend()
    if (trendData && trendData.length > 0) {
      renderTrendChart(trendData)
    }
  } catch {
    // fallback
  }
}

function renderTrendChart(data) {
  if (!trendChartRef.value) return
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }
  const isRevenue = trendType.value === 'revenue'
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: data ? data.map(d => d.date.slice(5)) : [],
      axisLabel: { rotate: 45, fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      name: isRevenue ? '元' : '单',
      axisLabel: { fontSize: 11 }
    },
    series: [{
      data: data ? data.map(d => isRevenue ? Number(d.revenue) : d.orderCount) : [],
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64,158,255,0.3)' },
          { offset: 1, color: 'rgba(64,158,255,0.05)' }
        ])
      },
      lineStyle: { color: '#409eff', width: 2 },
      itemStyle: { color: '#409eff' }
    }]
  })
}

function renderRankChart() {
  if (!rankChartRef.value) return
  rankChart = echarts.init(rankChartRef.value)
  rankChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 80, right: 20, top: 10, bottom: 20 },
    xAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    yAxis: {
      type: 'category',
      inverse: true,
      data: ['示例商品A', '示例商品B', '示例商品C', '示例商品D', '示例商品E',
             '示例商品F', '示例商品G', '示例商品H', '示例商品I', '示例商品J'],
      axisLabel: { fontSize: 10, width: 60, overflow: 'truncate' }
    },
    series: [{
      data: [850, 740, 680, 590, 520, 460, 410, 350, 280, 210],
      type: 'bar',
      barWidth: 16,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#409eff' },
          { offset: 1, color: '#79bbff' }
        ]),
        borderRadius: [0, 4, 4, 0]
      }
    }]
  })
}

function handleResize() {
  trendChart?.resize()
  rankChart?.resize()
}

onMounted(async () => {
  await fetchStats()
  await nextTick()
  fetchTrend()
  renderRankChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  trendChart?.dispose()
  rankChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.dashboard { padding: 0; }
.stat-card { margin-bottom: 20px; }
.stat-content { display: flex; align-items: center; justify-content: space-between; }
.stat-label { font-size: 14px; color: #999; margin: 0 0 8px 0; }
.stat-value { font-size: 28px; font-weight: bold; color: #333; margin: 0; }
.stat-icon { font-size: 48px; }
.card-header { display: flex; align-items: center; justify-content: space-between; }
</style>