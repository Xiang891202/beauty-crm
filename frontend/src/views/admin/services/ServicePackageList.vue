<template>
  <div>
    <div class="header">
      <h2>組合包管理</h2>
      <label class="checkbox-label">
        <input type="checkbox" v-model="showDeleted" @change="fetchPackages" />
        顯示已下架
      </label>
      <button class="btn" @click="goToCreate">新增組合包</button>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>名稱</th>
            <!-- <th>售價</th> -->
            <th>狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pkg in packages" :key="pkg.id">
            <td>{{ pkg.name }}</td>
            <!-- <td>NT$ {{ pkg.price }}</td> -->
            <td>
              <span v-if="pkg.deleted_at" class="deleted-badge">已下架</span>
              <span v-else :class="pkg.is_active ? 'active-badge' : 'inactive-badge'">
                {{ pkg.is_active ? '啟用' : '停用' }}
              </span>
            </td>
            <td>
              <template v-if="!pkg.deleted_at">
                <button class="btn btn-sm" @click="goToEdit(pkg.id)">編輯</button>
                <button class="btn btn-sm btn-outline" @click="confirmDelete(pkg)">下架</button>
              </template>
              <template v-else>
                <button class="btn btn-sm" @click="confirmRestore(pkg)">恢復</button>
                <!-- 可選擇加入永久刪除按鈕，但組合包通常保留軟刪除即可 -->
              </template>
            </td>
          </tr>
          <tr v-if="packages.length === 0">
            <td colspan="4">暫無組合包資料</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getPackages, deletePackage, restorePackage, type ServicePackage } from '@/api/modules/servicePackage';

const router = useRouter();
const packages = ref<ServicePackage[]>([]);
const showDeleted = ref(false);

const fetchPackages = async () => {
  try {
    const res = await getPackages({ include_deleted: showDeleted.value });
    packages.value = res.data || [];
  } catch (err) {
    console.error('載入組合包失敗', err);
  }
};

const goToCreate = () => {
  router.push('/admin/service-packages/form/new');
};

const goToEdit = (id: string) => {
  router.push(`/admin/service-packages/form/${id}`);
};

const confirmDelete = async (pkg: ServicePackage) => {
  if (confirm(`確定將組合包「${pkg.name}」下架嗎？`)) {
    await deletePackage(pkg.id);
    await fetchPackages();
  }
};

const confirmRestore = async (pkg: ServicePackage) => {
  if (confirm(`確定恢復組合包「${pkg.name}」嗎？`)) {
    await restorePackage(pkg.id);
    await fetchPackages();
  }
};

onMounted(() => {
  fetchPackages();
});
</script>

<style scoped>
/* 複用服務管理頁面的樣式（若全域已有則可省略 scoped） */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}
.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal;
  cursor: pointer;
}
.table-wrapper {
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--surface);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.data-table th,
.data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
  text-align: left;
}
.data-table th {
  background: var(--bg);
  font-weight: 600;
  color: var(--text);
}
.data-table tr:hover td {
  background: rgba(var(--primary-rgb), 0.05);
}
.deleted-badge {
  color: #999;
  font-style: italic;
}
.active-badge {
  color: #4caf50;
  font-weight: bold;
}
.inactive-badge {
  color: #f44336;
  font-weight: bold;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  background: var(--primary);
  color: white;
}
.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}
.btn-outline {
  background: transparent;
  border: 1px solid var(--primary);
  color: var(--primary);
}
.btn-outline:hover {
  background: rgba(var(--primary-rgb), 0.1);
}
.btn-danger {
  background: #e76f51;
}
.btn-danger:hover {
  background: #d45c3c;
}
</style>