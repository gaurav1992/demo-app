// src/types/vue.d.ts
import { theme } from '@/theme/variables'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $theme: typeof theme
  }
}
