<template>
  <div>
    <div v-if="stats">
      <div class="stats-cards">
        <div>總會員數：{{ stats!.totalMembers }}</div>
        <div>總使用次數：{{ stats!.totalUsage }}</div>
      </div>
      <div ref="chartRef" style="height: 400px"></div>
      <h3>近期使用記錄</h3>
       <table class="stats-table">
        <thead>
           <tr>
            <th>會員姓名</th>
            <th>服務名稱</th>
            <th>使用時間</th>
            <th>備註</th>
            <th>簽名</th>
           </tr>
        </thead>
        <tbody>
          <tr v-for="log in stats!.recentLogs" :key="log.id">
             <td>{{ log.memberName }}</td>
             <td>{{ log.serviceName }}</td>
             <td>{{ formatDate(log.usedAt) }}</td>
             <td>{{ log.note }}</td>
             <td><img v-if="log.signatureImage" :src="log.signatureImage" width="50" /></td>
           </tr>
        </tbody>
      </table>
    </div>
    <div v-else>載入中...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import { getDashboardStats, type DashboardStats } from '@/api/modules/stats';

const stats = ref<DashboardStats | null>(null);
const chartRef = ref<HTMLElement | null>(null);

const initChart = () => {
  if (chartRef.value && stats.value?.dailyUsage?.length) {
    const chart = echarts.init(chartRef.value);
    chart.setOption({
      xAxis: { type: 'category', data: stats.value.dailyUsage.map(d => d.date) },
      yAxis: { type: 'value' },
      series: [{ type: 'line', data: stats.value.dailyUsage.map(d => d.count) }]
    });
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString();
};

onMounted(async () => {
  try {
    const res = await getDashboardStats();
    if (res.success && res.data) {
      stats.value = res.data;
      await nextTick();
      initChart();
    }
  } catch (err) {
    console.error('獲取儀表板數據失敗', err);
  }
});

watch(() => stats.value, () => {
  if (stats.value) {
    initChart();
  }
});
</script>

<style scoped>
.stats-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.stats-table {
  width: 100%;
  border-collapse: collapse;
}
.stats-table th,
.stats-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.stats-table th {
  background-color: #f2f2f2;
}
</style>