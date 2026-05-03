<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="visible" class="toast">{{ message }}</div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
const message = ref('')
let timer: ReturnType<typeof setTimeout>

function show(msg: string, duration = 3000) {
  clearTimeout(timer)
  message.value = msg
  visible.value = true
  timer = setTimeout(() => { visible.value = false }, duration)
}

defineExpose({ show })
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--surface-2);
  color: var(--text);
  padding: 12px 24px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  font-size: 14px;
  z-index: 9999;
}
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }
</style>
