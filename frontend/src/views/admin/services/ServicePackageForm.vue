<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">{{ isEdit ? '編輯組合包' : '新增組合包' }}</h1>
    <form @submit.prevent="submit">
      <div class="bg-white rounded-lg shadow p-6 space-y-4">
        <BaseInput v-model="form.name" label="組合包名稱" required />
        <BaseTextarea v-model="form.description" label="描述" :rows="3" />
        <!-- <BaseInput v-model.number="form.price" label="售價" type="number" step="0.01" required /> -->
        <!-- <BaseInput 
          :model-value="form.durationDaysDisplay === null ? '' : form.durationDaysDisplay"
          @update:model-value="handleDurationChange"
          label="有效天數（留空表示無限期）" 
          type="number" 
        /> -->

        <div class="border-t pt-4">
          <label class="block text-sm font-medium mb-2">服務項目與次數</label>
          <div v-for="(item, idx) in form.items" :key="idx" class="flex gap-4 mb-2 items-end">
            <select v-model.number="item.service_id" class="border rounded p-2 flex-1">
              <option :value="null" disabled>請選擇服務</option>
              <option v-for="svc in services" :value="svc.id">{{ svc.name }}</option>
            </select>
            <!-- <BaseInput v-model.number="item.quantity" type="number" min="1" placeholder="次數" class="w-24" /> -->
            <BaseButton type="button" variant="danger" @click="removeItem(idx)">移除</BaseButton>
          </div>
          <BaseButton type="button" variant="outline" @click="addItem">+ 新增服務項目</BaseButton>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <BaseButton variant="outline" @click="$router.back()">取消</BaseButton>
          <BaseButton type="submit">儲存</BaseButton>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPackage, createPackage, updatePackage } from '@/api/modules/servicePackage';
import { getServices, type Service } from '@/api/modules/service';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseTextarea from '@/components/common/BaseTextarea.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import axios, { AxiosError } from 'axios';

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;
const isEdit = id !== 'new';
const services = ref<Service[]>([]);

const form = reactive({
  name: '',
  description: '',
  price: 0,
  durationDaysDisplay: null as number | null,
  items: [] as { service_id: number | null; quantity: number }[],
});

const handleDurationChange = (val: string | number) => {
  form.durationDaysDisplay = val === '' ? null : Number(val);
};

const getDurationDays = (): number | null => {
  if (form.durationDaysDisplay === null || form.durationDaysDisplay === undefined) return null;
  const num = Number(form.durationDaysDisplay);
  return isNaN(num) ? null : num;
};

const addItem = () => {
  form.items.push({ service_id: null, quantity: 1 });
};
const removeItem = (idx: number) => {
  form.items.splice(idx, 1);
};

const loadPackage = async () => {
  try {
    const res = await getPackage(id);
    const data = res.data; // 因為 http 攔截器已解包，res 即為 { success, data }
    form.name = data.name || '';
    form.description = data.description || '';
    form.price = data.price || 0;
    form.durationDaysDisplay = data.duration_days ?? null;
    if (data.items && Array.isArray(data.items)) {
      form.items = data.items.map((item: any) => ({
        service_id: item.service?.id ?? null,
        quantity: item.quantity,
      }));
    } else {
      form.items = [];
    }
    // 如果沒有品項，預設一個空白項目
    if (form.items.length === 0) {
      addItem();
    }
  } catch (err) {
    console.error('載入組合包失敗', err);
  }
};

const loadServices = async () => {
  try {
    const res = await getServices();
    services.value = res.data;
  } catch (err) {
    console.error('載入服務項目失敗:', err);
  }
};

const submit = async () => {
  // 1. 过滤掉未选择服务或数量为0的项目
  const validItems = form.items.filter(item => item.service_id !== null && item.quantity > 0);
  
  // 2. 检查是否有重复的服务ID
  const serviceIds = validItems.map(item => item.service_id);
  const hasDuplicate = serviceIds.some((id, index) => serviceIds.indexOf(id) !== index);
  
  if (hasDuplicate) {
    alert('組合包中不允許包含重複的服務項目，請檢查並刪除重複項。');
    return; // 阻止提交
  }
  
  // 3. 构建提交数据
  const payload = {
    name: form.name,
    description: form.description,
    price: form.price,
    duration_days: getDurationDays(),
    is_active: true,
    items: validItems.map(item => ({
      service_id: item.service_id!,
      quantity: item.quantity,
    })),
  };
  
  try {
    if (isEdit) {
      await updatePackage(id, payload);
    } else {
      await createPackage(payload);
    }
    router.push('/admin/service-packages');
  } catch (err) {
    console.error('儲存失敗:', err);
    if (err instanceof AxiosError && err.response?.data?.error?.includes('duplicate key')) {
      alert('服務項目重複，請移除重複項後再試。');
    } else {
      alert('儲存失敗，請稍後再試。');
    }
  }
};

onMounted(async () => {
  await loadServices();
  if (isEdit) {
    await loadPackage();
  } else if (form.items.length === 0) {
    addItem();
  }
});
</script>