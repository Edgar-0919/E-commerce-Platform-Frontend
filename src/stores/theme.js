import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref('light')

  function initTheme() {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark' || stored === 'light') {
      currentTheme.value = stored
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      currentTheme.value = 'dark'
    }
    applyTheme(currentTheme.value)
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
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
