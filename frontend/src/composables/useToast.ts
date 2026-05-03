import { inject } from 'vue'

export function useToast() {
  const toast = inject<(msg: string) => void>('toast')
  return {
    success: (msg: string) => toast?.(msg),
    error: (msg: string) => toast?.(`❌ ${msg}`),
  }
}
