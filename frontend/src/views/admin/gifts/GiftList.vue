<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">贈品管理</h1>
      <BaseButton @click="openCreateModal">新增贈品</BaseButton>
    </div>

    <!-- 篩選列 -->
    <div class="bg-white p-4 rounded shadow mb-4 flex gap-4 items-end">
      <div class="flex-1">
        <label class="block text-sm font-medium mb-1">組合包 ID（可選）</label>
        <input v-model="filters.member_package_id" class="w-full border rounded p-2" placeholder="輸入組合包 ID" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">兌換狀態</label>
        <select v-model="filters.is_redeemed" class="border rounded p-2">
          <option :value="undefined">全部</option>
          <option :value="false">未兌換</option>
          <option :value="true">已兌換</option>
        </select>
      </div>
      <BaseButton @click="fetchGifts">搜尋</BaseButton>
      <BaseButton variant="outline" @click="resetFilters">重置</BaseButton>
    </div>

    <!-- 表格 -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">贈品名稱</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">所屬組合包</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">客戶 ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">狀態</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">備註</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="gift in gifts" :key="gift.id">
            <td class="px-6 py-4">{{ gift.gift_description }}</td>
            <td class="px-6 py-4">{{ gift.member_service_packages?.snapshot_name || '-' }}</td>
            <td class="px-6 py-4">{{ gift.member_service_packages?.customer_id || '-' }}</td>
            <td class="px-6 py-4">
              <span :class="gift.is_redeemed ? 'text-green-600' : 'text-yellow-600'">
                {{ gift.is_redeemed ? '已兌換' : '未兌換' }}
              </span>
            </td>
            <td class="px-6 py-4">{{ gift.notes || '-' }}</td>
            <td class="px-6 py-4 text-right space-x-2">
              <BaseButton size="sm" variant="outline" @click="openEditModal(gift)">編輯</BaseButton>
              <BaseButton size="sm" variant="danger" @click="confirmDelete(gift)">刪除</BaseButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 新增/編輯彈窗 -->
    <BaseModal v-model="showModal" :title="modalTitle">
      <form @submit.prevent="submit">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">組合包</label>
            <select v-model="form.member_package_id" class="w-full border rounded p-2" required>
              <option :value="null" disabled>請選擇組合包</option>
              <option v-for="pkg in memberPackages" :key="pkg.id" :value="pkg.id">
                {{ pkg.snapshot_name }} (客戶 {{ pkg.customer_id }})
              </option>
            </select>
            <p v-if="!memberPackages.length" class="text-xs text-gray-500 mt-1">
              暫無組合包資料，請先購買組合包。
            </p>
          </div>
          <BaseInput v-model="form.gift_description" label="贈品名稱" required />
          <BaseTextarea v-model="form.notes" label="備註" :rows="2" />
          <div v-if="isEdit">
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="form.is_redeemed" />
              <span>已兌換</span>
            </label>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <BaseButton variant="outline" @click="showModal = false">取消</BaseButton>
            <BaseButton type="submit" :loading="loading">儲存</BaseButton>
          </div>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { getGifts, createGift, updateGift, deleteGift, type Gift } from '@/api/modules/gift';
import { getCustomerPackages, type MemberPackage } from '@/api/modules/memberPackage';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseTextarea from '@/components/common/BaseTextarea.vue';
import BaseModal from '@/components/common/BaseModal.vue';

const gifts = ref<Gift[]>([]);
const memberPackages = ref<MemberPackage[]>([]);
const loading = ref(false);
const showModal = ref(false);
const isEdit = ref(false);
const currentId = ref('');

const filters = reactive({
  member_package_id: '',
  is_redeemed: undefined as boolean | undefined,
});

const form = reactive({
  member_package_id: null as string | null,
  gift_description: '',
  notes: '',
  is_redeemed: false,
});

const modalTitle = computed(() => isEdit.value ? '編輯贈品' : '新增贈品');

const fetchGifts = async () => {
  try {
    const res = await getGifts({
      member_package_id: filters.member_package_id || undefined,
      is_redeemed: filters.is_redeemed,
    });
    gifts.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

const fetchMemberPackages = async () => {
  // 這裡簡單加載所有組合包（可能需要分頁），可依實際情況調整
  // 建議改為讓管理員先選擇客戶，再載入該客戶的組合包
  // 此處為了演示，先加載前50筆（需後端支援 limit）
  try {
    // 注意：getCustomerPackages 需要 customer_id，我們無法一次獲取所有組合包
    // 解決方法：新增一個後端 API 來獲取所有組合包（不限客戶）或讓管理員先選擇客戶
    // 簡化：暫時留空，讓管理員手動輸入 member_package_id
    // 或使用另一個 API：假設後端有 /admin/member-packages/all
    // 這裡先不做複雜處理，提示管理員手動輸入 member_package_id
    memberPackages.value = [];
  } catch (err) {
    console.error(err);
  }
};

const resetFilters = () => {
  filters.member_package_id = '';
  filters.is_redeemed = undefined;
  fetchGifts();
};

const openCreateModal = () => {
  isEdit.value = false;
  currentId.value = '';
  form.member_package_id = null;
  form.gift_description = '';
  form.notes = '';
  form.is_redeemed = false;
  showModal.value = true;
};

const openEditModal = (gift: Gift) => {
  isEdit.value = true;
  currentId.value = gift.id;
  form.member_package_id = gift.member_package_id;
  form.gift_description = gift.gift_description;
  form.notes = gift.notes || '';
  form.is_redeemed = gift.is_redeemed;
  showModal.value = true;
};

const submit = async () => {
  if (!form.member_package_id || !form.gift_description) return;
  loading.value = true;
  try {
    if (isEdit.value) {
      await updateGift(currentId.value, {
        gift_description: form.gift_description,
        is_redeemed: form.is_redeemed,
        notes: form.notes,
      });
    } else {
      await createGift({
        member_package_id: form.member_package_id,
        gift_description: form.gift_description,
        notes: form.notes,
      });
    }
    showModal.value = false;
    await fetchGifts();
  } catch (err: any) {
    alert(err.response?.data?.error || '操作失敗');
  } finally {
    loading.value = false;
  }
};

const confirmDelete = async (gift: Gift) => {
  if (confirm(`確定刪除贈品「${gift.gift_description}」嗎？`)) {
    await deleteGift(gift.id);
    await fetchGifts();
  }
};

onMounted(() => {
  fetchGifts();
  fetchMemberPackages();
});
</script>