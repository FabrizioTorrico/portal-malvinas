import type { ThemeOption, FontSizeOption, FontFamilyOption } from './types'

export const SCROLL_THRESHOLD = 20

export const THEME_OPTIONS: ThemeOption[] = [
  { value: 'light', label: 'Claro', icon: 'sun' },
  { value: 'dark', label: 'Oscuro', icon: 'moon' },
  { value: 'system', label: 'Sistema', icon: 'computer' }
]

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { value: 'sm', label: 'Pequeño' },
  { value: 'base', label: 'Normal' },
  { value: 'lg', label: 'Grande' }
]

export const FONT_FAMILY_OPTIONS: FontFamilyOption[] = [
  { value: 'Montserrat', label: 'Original' },
  { value: 'system-ui, sans-serif', label: 'Facil lectura' },
  { value: "'Courier New', monospace", label: 'Courier New (Monospace)' }
]

export function applyInitialSettings() {
  const storedTheme = localStorage.getItem('theme') || 'system'
  document.documentElement.dataset.theme = storedTheme

  let effectiveTheme = storedTheme
  if (storedTheme === 'system') {
    effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  
  if (effectiveTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', effectiveTheme === 'dark' ? '#0B0B10' : '#FCFCFD')
  }

  const storedFontSize = localStorage.getItem('fontSize')
  if (storedFontSize) {
    document.documentElement.dataset.fontSize = storedFontSize
  }

  const storedFontFamily = localStorage.getItem('fontFamily')
  const defaultFontFamily = 'system-ui, sans-serif'
  document.documentElement.style.setProperty(
    '--font-family-main',
    storedFontFamily || defaultFontFamily
  )
}