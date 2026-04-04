<template>
  <div class="adjustment-list">
    <div class="header">
      <h2>人工補償記錄</h2>
      <button class="btn" @click="showForm = true">新增補償</button>
    </div>

    <div class="filters">
      <input v-model="filters.member_service_id" type="number" class="input" placeholder="服務授權 ID" />
      <select v-model="filters.adjustment_type" class="input">
        <option value="">所有類型</option>
        <option value="INCREASE">增加</option>
        <option value="DECREASE">減少</option>
      </select>
      <!-- <input v-model="filters.startDate" type="date" class="input" placeholder="開始日期" /> -->
      <input v-model="filters.endDate" type="date" class="input" placeholder="結束日期" />
      <button class="btn" @click="loadAdjustments">查詢</button>
      <button class="btn btn-outline" @click="resetFilters">重置</button>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>服務授權 ID</th>
            <th>類型</th>
            <th>數量</th>
            <th>原因</th>
            <th>建立者</th>
            <th>建立時間</th>
          </tr>
        </thead>
        <tbody>
          <!-- 使用 adjustments.items 遍歷 -->
          <tr v-for="adj in adjustments.items" :key="adj.id">
            <td>{{ adj.id }}</td>
            <td>{{ adj.member_service_id }}</td>
            <td>{{ adj.adjustment_type === 'INCREASE' ? '增加' : '減少' }}</td>
            <td>{{ adj.amount }}</td>
            <td>{{ adj.reason || '-' }}</td>
            <td>{{ adj.created_by }}</td>
            <td>{{ formatDate(adj.created_at) }}</td>
          </tr>
          <tr v-if="adjustments.items.length === 0">
            <td colspan="7">暫無調整記錄</td>
          </tr>
        </tbody>
      </table>
    </div>


    <div class="pagination" v-if="totalPages > 1">
      <button class="btn btn-sm" :disabled="page === 1" @click="page--">上一頁</button>
      <span>第 {{ page }} 頁 / 共 {{ totalPages }} 頁</span>
      <button class="btn btn-sm" :disabled="page === totalPages" @click="page++">下一頁</button>
    </div>

    <!-- 新增表單模態框 -->
    <div v-if="showForm" class="modal-overlay">
      <div class="modal-content">
        <div class="model-header">
          <h3>新增人工補償</h3>
          <form @submit.prevent="submitAdjustment">
            <div>
              <label>服務授權 ID</label>
              <input v-model.number="adjustForm.member_service_id" type="number" required />
              <small>請輸入會員服務的 ID（可從會員詳情頁查看）</small>
            </div>
            <div class="form-group">
              <label>調整類型</label>
              <select v-model="adjustForm.adjustment_type" class="input" required>
                <option value="INCREASE">增加次數</option>
                <option value="DECREASE">減少次數</option>
              </select>
            </div>
            <div class="form-group">
              <label>數量</label>
              <input v-model.number="adjustForm.amount" type="number" class="input" required min="1" />
            </div>
            <div class="form-group">
              <label>原因</label>
              <textarea v-model="adjustForm.reason" class="input" required min="1"></textarea>
            </div>
            <div class="form-actions">
              <button class="btn" type="submit">送出</button>
              <button class="btn btn-outline" type="button" @click="closeForm">取消</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { getAdjustments, createAdjustment, type Adjustment } from '@/api/modules/adjustment';

// 數據結構修正：使用包含 items 和 total 的對象
const adjustments = ref<{ items: Adjustment[]; total: number }>({
  items: [],
  total: 0
});

const page = ref(1);
const limit = 20;
const totalPages = ref(1);

const filters = ref({
  member_service_id: '',
  adjustment_type: '',
  startDate: '',
  endDate: '',
});

const showForm = ref(false);
const adjustForm = ref({
  member_service_id: null as number | null,
  adjustment_type: 'INCREASE' as 'INCREASE' | 'DECREASE',
  amount: 1,
  reason: '',
});

const loadAdjustments = async () => {
  try {
    const params: any = { page: page.value, limit };
    if (filters.value.member_service_id) params.member_service_id = filters.value.member_service_id;
    if (filters.value.adjustment_type) params.adjustment_type = filters.value.adjustment_type;
    if (filters.value.startDate) params.startDate = filters.value.startDate;
    if (filters.value.endDate) params.endDate = filters.value.endDate;

    const res = await getAdjustments(params);
    if (res.success && res.data) {
      // ✅ 正確賦值對象
      adjustments.value = {
        items: res.data.items || [],
        total: res.data.total || 0
      };
      totalPages.value = Math.ceil(adjustments.value.total / limit);
    } else {
      adjustments.value = { items: [], total: 0 };
    }
  } catch (err) {
    console.error('加載調整記錄失敗', err);
    adjustments.value = { items: [], total: 0 };
  }
};

const submitAdjustment = async () => {
  if (!adjustForm.value.member_service_id) {
    alert('請填寫服務授權 ID');
    return;
  }
  try {
    await createAdjustment({
      member_service_id: adjustForm.value.member_service_id,
      adjustment_type: adjustForm.value.adjustment_type,
      amount: adjustForm.value.amount,
      reason: adjustForm.value.reason || undefined,
    });
    closeForm();
    loadAdjustments();
  } catch (err: any) {
    console.error('新增調整失敗', err);
    alert(err.response?.data?.error || '操作失敗');
  }
};

const resetFilters = () => {
  filters.value = { member_service_id: '', adjustment_type: '', startDate: '', endDate: '' };
  page.value = 1;
  loadAdjustments();
};

const closeForm = () => {
  showForm.value = false;
  adjustForm.value = { member_service_id: null, adjustment_type: 'INCREASE', amount: 1, reason: '' };
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString();
};

watch(page, loadAdjustments);
onMounted(loadAdjustments);
</script>

<!-- <style scoped>
/* 复用商品管理的样式，可微调 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.filters {
  margin-bottom: 20px;
}
.filters input, .filters select {
  margin-right: 10px;
  padding: 6px;
}
.adjustment-table {
  width: 100%;
  border-collapse: collapse;
}
.adjustment-table th, .adjustment-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.adjustment-table th {
  background-color: #f2f2f2;
}
button {
  margin-right: 8px;
  padding: 4px 8px;
  cursor: pointer;
}
.pagination {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
}
.modal-content input, .modal-content select, .modal-content textarea {
  width: 100%;
  margin-bottom: 12px;
  padding: 6px;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style> -->