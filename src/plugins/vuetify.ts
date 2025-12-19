import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { zhHans } from 'vuetify/locale'

// 自定义主题 - Lumis 阳光金黄色
const customTheme = {
  dark: false,
  colors: {
    primary: '#F5A623', // 金黄色阳光
    secondary: '#FFD54F', // 浅金色
    accent: '#FFCA28', // 明亮金色
    error: '#E53935',
    info: '#FFA726', // 橙金色
    success: '#66BB6A',
    warning: '#FF8F00', // 深金橙
    background: '#FFFDF7', // 暖白色背景
    surface: '#FFFFFF'
  }
}

const vuetify = createVuetify({
  components,
  directives,
  locale: {
    locale: 'zhHans',
    fallback: 'zhHans',
    messages: { zhHans }
  },
  theme: {
    defaultTheme: 'customTheme',
    themes: {
      customTheme
    }
  },
  defaults: {
    VBtn: {
      variant: 'flat',
      rounded: 'lg'
    },
    VCard: {
      rounded: 'lg',
      elevation: 2
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable'
    }
  }
})

export default vuetify
