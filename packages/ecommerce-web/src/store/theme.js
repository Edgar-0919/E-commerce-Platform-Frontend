import { defineStore } from 'pinia'
import { useStorage, usePreferredDark } from '@vueuse/core'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = useStorage('theme', 'light')

  function initTheme() {
    if (!['light', 'dark'].includes(currentTheme.value)) {
      currentTheme.value = usePreferredDark().value ? 'dark' : 'light'
    }
    applyTheme(currentTheme.value)
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme
  }

  function toggleTheme() {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
    applyTheme(currentTheme.value)
  }

  function setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') return
    currentTheme.value = theme
    applyTheme(theme)
  }

  return { currentTheme, initTheme, toggleTheme, setTheme }
})
