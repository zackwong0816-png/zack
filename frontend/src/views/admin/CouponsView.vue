<template>
  <div>
    <h3 style="margin-bottom:20px;">优惠券管理</h3>
    <button class="btn btn-primary" style="margin-bottom:20px;" @click="showForm=true">创建优惠券</button>
    <div class="card">
      <table class="data-table">
        <thead><tr><th>名称</th><th>类型</th><th>面值</th><th>领取数</th><th>使用数</th><th>状态</th></tr></thead>
        <tbody>
          <tr v-for="c in coupons" :key="c.id">
            <td>{{ c.name }}</td>
            <td>{{ c.type==='discount'?'折扣':'满减' }}</td>
            <td>{{ c.type==='discount' ? c.discount+'折' : '¥'+c.value }}</td>
            <td>{{ c.claimedCount }}</td>
            <td>{{ c.usedCount }}</td>
            <td><span :class="c.status==='active'?'badge':'badge muted'">{{ c.status==='active'?'生效':'失效' }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { couponApi } from '@/api'
const coupons = ref<any[]>([])
const showForm = ref(false)
onMounted(() => load())
async function load() { coupons.value = await couponApi.list() as any[] }
</script>
<style scoped>.badge.muted { background: var(--surface-2); color: var(--muted); }</style>