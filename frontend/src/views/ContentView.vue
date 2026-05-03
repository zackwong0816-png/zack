<template>
  <div class="content-page">
    <header class="topnav">
      <div class="container topnav-inner">
        <a href="/" class="logo">NOVA</a>
      </div>
    </header>
    <div class="container" style="padding:60px 24px;">
      <h1 style="font-family:var(--font-display);font-size:36px;margin-bottom:32px;text-align:center;">内容中心</h1>
      <div class="article-list">
        <div v-for="a in articles" :key="a.id" class="article-item card">
          <h3>{{ a.title }}</h3>
          <p class="text-muted">{{ a.summary || (a.content && a.content.slice(0,60)) }}</p>
          <span class="text-muted" style="font-size:12px;">{{ a.createdAt && a.createdAt.slice(0,10) }}</span>
        </div>
        <div v-if="!articles.length" class="text-center text-muted" style="padding:40px;">暂无内容</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
const articles = ref<any[]>([])
onMounted(async () => { articles.value = await api.get('/articles') })
</script>

<style scoped>
.article-list { max-width: 700px; margin: 0 auto; }
.article-item { margin-bottom: 16px; cursor: pointer; }
.article-item h3 { font-size: 16px; margin-bottom: 8px; }
.article-item p { font-size: 14px; margin-bottom: 8px; }
</style>
