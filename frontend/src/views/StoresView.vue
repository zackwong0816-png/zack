<template>
  <div class="stores-page">
    <header class="topnav">
      <div class="container topnav-inner">
        <a href="/" class="logo">NOVA</a>
      </div>
    </header>
    <div class="container" style="padding:60px 24px;">
      <h1 style="font-family:var(--font-display);font-size:36px;margin-bottom:32px;text-align:center;">门店查询</h1>
      <div class="store-list">
        <div v-for="s in stores" :key="s.id" class="store-item card">
          <h3>{{ s.name }}</h3>
          <p class="text-muted">{{ s.address }}</p>
          <p>营业时间：{{ s.hours }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
const stores = ref<any[]>([])
onMounted(async () => { stores.value = await api.get('/stores') })
</script>

<style scoped>
.store-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.store-item h3 { margin-bottom: 8px; font-size: 16px; }
.store-item p { font-size: 14px; color: var(--muted); margin-bottom: 4px; }
</style>
