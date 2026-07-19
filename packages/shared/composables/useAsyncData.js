import { ref } from 'vue'

/**
 * 统一异步数据加载状态管理
 * 封装 loading / error / data 三态，避免每个页面重复写样板代码
 *
 * @param {Function} fetchFn - 异步数据获取函数，返回 Promise
 * @returns {{ data, loading, error, execute }}
 *
 * @example
 * const { data, loading, error, execute } = useAsyncData(() => getProductList(params))
 * onMounted(() => execute())
 */
export function useAsyncData(fetchFn) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function execute() {
    loading.value = true
    error.value = null
    try {
      const result = await fetchFn()
      data.value = result
    } catch (e) {
      error.value = e.message || '加载失败'
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, execute }
}