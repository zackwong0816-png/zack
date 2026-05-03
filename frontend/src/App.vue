<template>
  <RouterView />
  <Toast ref="toastRef" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import Toast from '@/components/Toast.vue'

const toastRef = ref<InstanceType<typeof Toast>>()

function showToast(msg: string) {
  toastRef.value?.show(msg)
}

import { provide } from 'vue'
provide('toast', showToast)
</script>
