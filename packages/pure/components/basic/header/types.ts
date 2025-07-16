import { Icons } from '../../../libs/icons'

export interface MenuItem {
  title: string
  link: string
}

export interface HeaderConfig {
  title: string
  header: {
    menu: MenuItem[]
  }
}


export interface ThemeOption {
  value: 'light' | 'dark' | 'system'
  label: string
  icon: keyof typeof Icons
}

export interface FontSizeOption {
  value: 'sm' | 'base' | 'lg'
  label: string
}

export interface FontFamilyOption {
  value: string
  label: string
}

export interface HeaderState {
  isExpanded: boolean
  isSettingsPanelExpanded: boolean
  isScrolled: boolean
}