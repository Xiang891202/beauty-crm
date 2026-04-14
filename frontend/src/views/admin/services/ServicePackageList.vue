<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">組合包管理</h1>
      <div class="flex gap-4 items-center">
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="showDeleted" @change="fetchPackages" />
          <span>顯示已下架</span>
        </label>
        <BaseButton @click="goToCreate">新增組合包</BaseButton>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">名稱</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">售價</th>
            <!-- <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">有效天數</th> -->
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">狀態</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="pkg in packages" :key="pkg.id">
            <td class="px-6 py-4">{{ pkg.name }}</td>
            <td class="px-6 py-4">NT$ {{ pkg.price }}</td>
            <!-- <td class="px-6 py-4">{{ pkg.duration_days ? pkg.duration_days + ' 天' : '無限期' }}</td> -->
            <td class="px-6 py-4">
              <span v-if="pkg.deleted_at" class="text-red-600">已下架</span>
              <span v-else :class="pkg.is_active ? 'text-green-600' : 'text-red-600'">
                {{ pkg.is_active ? '啟用' : '停用' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right space-x-2">
              <BaseButton size="sm" variant="outline" @click="goToEdit(pkg.id)">編輯</BaseButton>
              <BaseButton v-if="!pkg.deleted_at" size="sm" variant="danger" @click="confirmDelete(pkg)">下架</BaseButton>
              <BaseButton v-else size="sm" variant="success" @click="confirmRestore(pkg)">恢復</BaseButton>
            </td>
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
import BaseButton from '@/components/common/BaseButton.vue';

const router = useRouter();
const packages = ref<ServicePackage[]>([]);
const showDeleted = ref(false);

const fetchPackages = async () => {
  try {
    const res = await getPackages({ include_deleted: showDeleted.value });
    // 由於 http 攔截器已解包，res 即為 { success, data }
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
  if (confirm(`確定將組合包「${pkg.name}」標記為下架嗎？`)) {
    await deletePackage(pkg.id);
    await fetchPackages();
  }
};

const confirmRestore = async (pkg: ServicePackage) => {
  if (confirm(`確定恢復組合包「${pkg.name}」嗎？`)) {
    // 若後端已實作 restorePackage，請取消註解
    await restorePackage(pkg.id);
    // alert('恢復功能開發中，請稍後');
    await fetchPackages();
  }
};

onMounted(() => {
  fetchPackages();
});
</script>