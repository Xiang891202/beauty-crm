<template>
    <div class="p-6 max-w-2xl mx-auto">
        <!-- 測試標記
        <div class="bg-red-500 text-white p-2 mb-4 font-bold">
          🔥 這是購買組合包頁面（測試標記）🔥
        </div> -->
        <h1 class="text-2xl font-bold mb-6">購買組合包</h1>
    <form @submit.prevent="submit">
      <div class="bg-white rounded-lg shadow p-6 space-y-4">
        <!-- 客戶選擇 -->
        <div>
          <label class="block text-sm font-medium mb-1">客戶</label>
          <select v-model="form.customer_id" class="w-full border rounded p-2" required>
            <option :value="null" disabled>請選擇客戶</option>
            <option v-for="c in customers" :key="c.id" :value="c.id">{{ c.name }} ({{ c.phone || c.email }})</option>
          </select>
        </div>

        <!-- 組合包選擇 -->
        <div>
          <label class="block text-sm font-medium mb-1">組合包</label>
          <select v-model="form.package_id" class="w-full border rounded p-2" required @change="onPackageChange">
            <option :value="null" disabled>請選擇組合包</option>
            <option v-for="pkg in packages" :key="pkg.id" :value="pkg.id">{{ pkg.name }} - NT$ {{ pkg.price }}</option>
          </select>
        </div>

        <!-- 組合包內容預覽（僅展示） -->
        <div v-if="selectedPackage" class="bg-gray-50 p-3 rounded">
          <p class="font-medium">組合包內容：</p>
          <ul class="list-disc list-inside text-sm">
            <li v-for="item in selectedPackage.items" :key="item.service!.id">
              {{ item.service!.name }} 
              <!-- x {{ item.quantity }} 次 -->
            </li>
          </ul>
          <!-- <p class="text-sm mt-2">有效天數：{{ selectedPackage.duration_days ? selectedPackage.duration_days + ' 天' : '無限期' }}</p> -->
        </div>

        <!-- 購買總次數（手動輸入） -->
        <BaseInput
          v-model.number="form.total_uses"
          label="購買總次數"
          type="number"
          min="1"
          required
        />

        <BaseInput v-model="form.purchase_date" label="購買日期" type="date" required />
        <!-- <BaseInput v-model="form.expiry_date" label="到期日（留空則使用組合包預設天數）" type="date" /> -->

        <div class="flex justify-end gap-3 pt-4">
          <BaseButton variant="outline" type="button" @click="$router.back()">取消</BaseButton>
          <BaseButton type="submit" :loading="loading">確認購買</BaseButton>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getMembers, type Member } from '@/api/modules/member';
import { getPackages, type ServicePackage } from '@/api/modules/servicePackage';
import { purchasePackage } from '@/api/modules/memberPackage';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const customers = ref<Member[]>([]);
const packages = ref<ServicePackage[]>([]);
const selectedPackage = ref<ServicePackage | null>(null);

const form = reactive({
  customer_id: null as number | null,
  package_id: null as string | null,
  purchase_date: new Date().toISOString().slice(0, 10),
  expiry_date: '',
  total_uses: 1,
});

const onPackageChange = () => {
  const pkg = packages.value.find(p => p.id === form.package_id);
  selectedPackage.value = pkg || null;
  if (pkg?.duration_days && !form.expiry_date) {
    const purchaseDate = new Date(form.purchase_date);
    purchaseDate.setDate(purchaseDate.getDate() + pkg.duration_days);
    form.expiry_date = purchaseDate.toISOString().slice(0, 10);
  }
};

const loadCustomers = async () => {
  const res = await getMembers();
  customers.value = res.data;
};

const loadPackages = async () => {
  const res = await getPackages({ is_active: true });
  packages.value = res.data;
};

const submit = async () => {
  if (!form.customer_id || !form.package_id || !form.total_uses) return;
  loading.value = true;
  try {
    await purchasePackage({
      customer_id: form.customer_id,
      package_id: form.package_id,
      purchase_date: form.purchase_date,
      expiry_date: form.expiry_date || null,
      total_uses: form.total_uses,
    });
    alert('購買成功');
    router.push(`/admin/members/${form.customer_id}`);
  } catch (err: any) {
    alert(err.response?.data?.error || '購買失敗');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadCustomers();
  loadPackages();
  if (route.query.customer_id) {
    form.customer_id = Number(route.query.customer_id);
  }
});
</script>