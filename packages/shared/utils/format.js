/**
 * 通用格式化工具
 */

/** 金额格式化：保留两位小数，千分位逗号 */
export function formatPrice(price) {
  if (price == null || isNaN(price)) return '0.00'
  return Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/** 日期格式化：yyyy-MM-dd HH:mm:ss */
export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** 数字缩写：1000 → 1k，10000 → 1w */
export function formatNumber(num) {
  if (num == null || isNaN(num)) return '0'
  if (num >= 10000) return (num / 10000).toFixed(1).replace(/\.0$/, '') + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(num)
}