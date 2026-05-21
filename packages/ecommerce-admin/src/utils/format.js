/**
 * 金额格式化
 * @param {number} value - 金额（分）
 * @returns {string} 格式化后的金额字符串，如 "¥12.99"
 */
export function formatPrice(value) {
  if (value == null || isNaN(value)) return '¥0.00'
  return `¥${(value / 100).toFixed(2)}`
}

/**
 * 日期格式化
 * @param {string|Date} date - 日期
 * @param {string} [fmt='yyyy-MM-dd HH:mm'] - 格式
 * @returns {string}
 */
export function formatDate(date, fmt = 'yyyy-MM-dd HH:mm') {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const o = {
    'M+': d.getMonth() + 1,
    'd+': d.getDate(),
    'H+': d.getHours(),
    'm+': d.getMinutes(),
    's+': d.getSeconds()
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (d.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      fmt = fmt.replace(RegExp.$1, o[k].toString().padStart(2, '0'))
    }
  }
  return fmt
}

/**
 * 数字缩写（用于销量等大数字展示）
 * @param {number} num
 * @returns {string} 如 "1.2万"
 */
export function formatNumber(num) {
  if (num == null || isNaN(num)) return '0'
  if (num >= 10000) return `${(num / 10000).toFixed(1)}万`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return String(num)
}