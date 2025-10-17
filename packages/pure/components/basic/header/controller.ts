import { setTheme as applyThemeUtil, showToast } from '../../../utils'
import { SCROLL_THRESHOLD, FONT_SIZE_OPTIONS } from './utils'
import type { HeaderState } from './types'

export class HeaderController {
  private element: HTMLElement
  private state: HeaderState
  private isRoot: boolean

  constructor(element: HTMLElement, isRoot: boolean) {
    this.element = element
    this.isRoot = isRoot
    this.state = {
      isExpanded: false,
      isSettingsPanelExpanded: false,
      isScrolled: false
    }
    this.init()
  }

  private init() {
    this.setupScrollHandler()
    this.setupMobileMenu()
    this.setupSettingsPanel()
    this.setupThemeButtons()
    this.setupFontSizeButtons()
    this.setupFontFamilySelector()
  }

  private setupScrollHandler() {
    if (!this.isRoot) return

    let preScrollY = window.scrollY
    this.state.isScrolled = preScrollY > SCROLL_THRESHOLD
    this.updateNotTopClass()

    window.addEventListener('scroll', () => {
      this.state.isScrolled = window.scrollY > SCROLL_THRESHOLD
      this.updateNotTopClass()
      this.element.dataset.show = 'true'
      preScrollY = window.scrollY
    })
  }

  private setupMobileMenu() {
    const toggleMenuBtn = this.element.querySelector('#toggleMenu')
    if (!toggleMenuBtn) return

    toggleMenuBtn.addEventListener('click', () => {
      this.state.isExpanded = this.element.classList.toggle('expanded')
      toggleMenuBtn.setAttribute('aria-expanded', this.state.isExpanded.toString())
      
      // Update not-top class when menu state changes
      this.updateNotTopClass()
      
     
    })
  }

  private setupSettingsPanel() {
    const toggleBtn = this.element.querySelector('#toggleSettingsPanel')
    const panel = this.element.querySelector('#settingsPanel')
    
    if (!toggleBtn || !panel) return

    toggleBtn.addEventListener('click', (event) => {
      event.stopPropagation()
      this.state.isSettingsPanelExpanded = this.element.classList.toggle('settings-panel-expanded')
      toggleBtn.setAttribute('aria-expanded', this.state.isSettingsPanelExpanded.toString())
      
      if (this.state.isSettingsPanelExpanded && this.state.isExpanded) {
        this.closeMobileMenu()
      }
    })

    document.addEventListener('click', () => {
      this.closeSettingsPanel()
    })

    panel.addEventListener('click', (event) => {
      event.stopPropagation()
    })
  }

  private setupThemeButtons() {
    this.element.querySelectorAll('.theme-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const themeToSet = (btn as HTMLElement).dataset.setTheme
        if (themeToSet && applyThemeUtil) {
          const returnedTheme = applyThemeUtil(themeToSet, true)
          document.documentElement.dataset.theme = returnedTheme
          showToast({ message: `Tema cambiado a ${returnedTheme}` })
        }
      })
    })
  }

  private setupFontSizeButtons() {
    this.element.querySelectorAll('.fontsize-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const newSize = (btn as HTMLElement).dataset.setFontsize as 'sm' | 'base' | 'lg'
        if (newSize) {
          document.documentElement.dataset.fontSize = newSize
          localStorage.setItem('fontSize', newSize)
          
          const sizeLabel = FONT_SIZE_OPTIONS.find(option => option.value === newSize)?.label || newSize
          showToast({ message: `Tamaño de fuente: ${sizeLabel}` })
        }
      })
    })

    const currentFontSize = localStorage.getItem('fontSize')
    if (currentFontSize) {
      document.documentElement.dataset.fontSize = currentFontSize
    }
  }

  private setupFontFamilySelector() {
    const selector = this.element.querySelector('#fontFamilySelector') as HTMLSelectElement
    if (!selector) return

    const currentFontFamily = localStorage.getItem('fontFamily') ||
      getComputedStyle(document.documentElement).getPropertyValue('font-family').trim() ||
      'system-ui, sans-serif'

    selector.value = currentFontFamily

    selector.addEventListener('change', (event) => {
      const newFontFamily = (event.target as HTMLSelectElement).value
      document.documentElement.style.setProperty('font-family', newFontFamily)
      localStorage.setItem('fontFamily', newFontFamily)
      showToast({ message: 'Fuente cambiada' })
    })

    document.documentElement.style.setProperty('font-family', selector.value)
  }

  private closeMobileMenu() {
    this.state.isExpanded = false
    this.element.classList.remove('expanded')
    const toggleBtn = this.element.querySelector('#toggleMenu')
    toggleBtn?.setAttribute('aria-expanded', 'false')
    
    // Update not-top class when menu closes
    this.updateNotTopClass()
  }

  private updateNotTopClass() {
    // Apply not-top class if scrolled OR if menu is expanded (only on root page)
    const shouldApplyNotTop = (this.isRoot && this.state.isScrolled) || this.state.isScrolled || this.state.isExpanded
    console.log(shouldApplyNotTop, this.state.isExpanded)
    this.element.classList.toggle('not-top', shouldApplyNotTop)
  }

  private closeSettingsPanel() {
    this.state.isSettingsPanelExpanded = false
    this.element.classList.remove('settings-panel-expanded')
    const toggleBtn = this.element.querySelector('#toggleSettingsPanel')
    toggleBtn?.setAttribute('aria-expanded', 'false')
  }
}