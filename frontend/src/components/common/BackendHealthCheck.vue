<!-- frontend/src/components/common/BackendHealthCheck.vue -->
<template>
  <div v-if="!isReady" class="waiting-container">
    <div class="waiting-card">
      <!-- 動態標題：正常時顯示「後端啟動中...」，失敗達上限時顯示錯誤訊息 -->
      <h2>{{ mainTitle }}</h2>

      <!-- 倒數計時：僅在未達上限且未成功時顯示 -->
      <p v-if="shouldShowCountdown" class="countdown">
        {{ countdown }} 秒後自動重新載入
      </p>

      <p class="attempt">
        執行次數 {{ attemptCount }}/{{ maxAttempts }}
      </p>

      <button class="refresh-btn" @click="manualRefresh">立即刷新</button>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios';

// 可調整的設定
const HEALTH_CHECK_URL = '/api/health';
const CHECK_INTERVAL_SECONDS = 10;
const maxAttempts = 3;

// 狀態
const isReady = ref(false);
const attemptCount = ref(0);
const countdown = ref(CHECK_INTERVAL_SECONDS);
const errorType = ref<'notStarted' | 'connectionAbnormal' | null>(null);
let timer: ReturnType<typeof setInterval> | null = null;

// 計算屬性：是否顯示倒數（未達上限且未成功）
const shouldShowCountdown = computed(() => {
  return !isReady.value && attemptCount.value < maxAttempts;
});

// 計算屬性：主要標題
const mainTitle = computed(() => {
  if (attemptCount.value >= maxAttempts) {
    // 已達上限，顯示對應錯誤訊息
    if (errorType.value === 'notStarted') {
      return '❌ 後端啟動失敗，請稍後重新嘗試';
    } else if (errorType.value === 'connectionAbnormal') {
      return '⚠️ 前端與後端接口異常，請稍後重新嘗試';
    } else {
      return '連線失敗，請稍後重新嘗試';
    }
  }
  // 正常等待中
  return '⏳ 後端啟動中...';
});

// 執行健康檢查
// 執行健康檢查，回傳物件 { success, errorType }
async function checkHealth(): Promise<{ success: boolean; errorType?: 'notStarted' | 'connectionAbnormal' }> {
  try {
    const response = await axios.get(HEALTH_CHECK_URL, { timeout: 5000 });
    if (response.status >= 200 && response.status < 300) {
      return { success: true };
    } else {
      // 狀態碼異常（例如 500、503）
      return { success: false, errorType: 'connectionAbnormal' };
    }
  } catch (err: any) {
    // 如果有 response 屬性，表示請求已送達但狀態碼非 2xx（axios 拋出錯誤）
    if (err.response) {
      return { success: false, errorType: 'connectionAbnormal' };
    }
    // 網路錯誤、連線拒絕、逾時 → 後端未啟動
    return { success: false, errorType: 'notStarted' };
  }
}

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function manualRefresh() {
  stopTimer();
  attemptCount.value = 0;
  countdown.value = CHECK_INTERVAL_SECONDS;
  errorType.value = null;
  startWaiting();
}

async function performCheck() {
  const { success, errorType: errType } = await checkHealth();

  if (success) {
    stopTimer();
    isReady.value = true;
    return;
  }

  // 記錄錯誤類型（用於達上限時顯示）
  if (errType) {
    errorType.value = errType;
  }

  attemptCount.value++;

  if (attemptCount.value >= maxAttempts) {
    stopTimer(); // 達上限，停止自動重試
    return;
  }

  // 未達上限，重置倒數
  countdown.value = CHECK_INTERVAL_SECONDS;
}

function startWaiting() {
  if (timer) stopTimer();
  performCheck().then(() => {
    if (isReady.value) return;
    timer = setInterval(() => {
      if (isReady.value || attemptCount.value >= maxAttempts) {
        return;
      }
      if (countdown.value <= 1) {
        performCheck();
      } else {
        countdown.value--;
      }
    }, 1000);
  });
}

onMounted(() => {
  startWaiting();
});

onUnmounted(() => {
  stopTimer();
});
</script>

<style scoped>
/* 樣式保持不變 */
.waiting-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f7fa;
}
.waiting-card {
  background: white;
  padding: 2rem 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  text-align: center;
  max-width: 400px;
  width: 90%;
}
h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}
.countdown {
  font-size: 1.2rem;
  margin: 0.5rem 0;
  color: #3498db;
}
.attempt {
  font-size: 1rem;
  color: #7f8c8d;
}
.refresh-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  transition: background 0.2s;
}
.refresh-btn:hover {
  background: #2980b9;
}
</style>