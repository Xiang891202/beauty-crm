<template>
  <div>
    <h2>會員列表</h2>
    <div class="fiex-end">
      <BaseButton @click="createMember">新增會員</BaseButton>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <!-- 移除 ID 欄位 -->
          <th>姓名</th>
          <th>電話</th>
          <th>生日</th>
          <!-- <th>Email</th> -->
          <!-- <th>操作</th> -->
        </tr>
      </thead>
      <tbody>
        <tr v-for="member in members" :key="member.id">
          <td>{{ member.name }}</td>
          <td>{{ member.phone }}</td>
          <td>{{ member.birthday ? formatDate(member.birthday) : '-' }}</td>
          <td>{{ member.email || '-' }}</td>
          <td>
            <router-link :to="`/admin/members/${member.id}`" class="btn btn-sm">查看詳情</router-link>
            <BaseButton class="btn btn-sm" @click="openEditDialog(member)">編輯</BaseButton>
          </td>
        </tr>
        <tr v-if="members.length === 0">
          <td colspan="5">暫無會員</td>
        </tr>
      </tbody>
    </table>

    <!-- 新增會員 Modal -->
    <BaseModal v-model="showCreateModal" title="新增會員">
      <MemberForm 
        @submit="handleCreate"
        @cancel="closeCreateModal"
      />
    </BaseModal>

    <!-- 編輯會員 Modal -->
    <BaseModal v-model="showEditModal" title="編輯會員">
      <MemberForm 
        :initial-data="editFormData"
        :is-edit="true"
        @submit="handleUpdate"
        @cancel="closeEditModal"
      />
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMembers, createMember as createMemberApi, updateMember as updateMemberApi, type Member } from '@/api/modules/member';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import MemberForm from '@/views/admin/members/MemberForm.vue';
import { useAuthStore } from '@/stores/auth.store';
import dayjs from 'dayjs';

const authStore = useAuthStore();
const loading = ref(true);
const members = ref<Member[]>([]);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const editFormData = ref<Partial<Member>>({});
const currentEditId = ref<number | null>(null);

// 修正 formatDate 可接受 null
const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-';
  return dayjs(dateStr).format('YYYY-MM-DD');
};

const createMember = () => {
  showCreateModal.value = true;
};

const closeCreateModal = () => {
  showCreateModal.value = false;
};

// 修正 openEditDialog，將 null 轉為 undefined
const openEditDialog = (member: Member) => {
  currentEditId.value = member.id;
  editFormData.value = {
    name: member.name,
    phone: member.phone ?? undefined,
    birthday: member.birthday ? dayjs(member.birthday).format('YYYY-MM-DD') : undefined,
    email: member.email ?? undefined,
    address: member.address ?? undefined,
  };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  currentEditId.value = null;
  editFormData.value = {};
};

const handleCreate = async (formData: any) => {
  try {
    await createMemberApi(formData);
    closeCreateModal();
    await fetchMembers();
    alert('新增成功');
  } catch (err: any) {
    let errorMsg = err.error || err.message || '新增失敗';
    if (errorMsg.includes('phone') || errorMsg.includes('唯一') || errorMsg.includes('duplicate')) {
      errorMsg = '手機號碼已存在，請使用其他號碼';
    }
    alert(`新增失敗：${errorMsg}`);
  }
};

const handleUpdate = async (formData: any) => {
  if (!currentEditId.value) return;
  try {
    await updateMemberApi(currentEditId.value, formData);
    closeEditModal();
    await fetchMembers();
    alert('更新成功');
  } catch (err: any) {
    let errorMsg = err.error || err.message || '更新失敗';
    if (errorMsg.includes('電話號碼已被其他會員使用')) {
      errorMsg = '此電話號碼已被其他會員使用';
    }
    alert(`更新失敗：${errorMsg}`);
  }
};

const fetchMembers = async () => {
  loading.value = true;
  try {
    const res = await getMembers();
    if (res.success && Array.isArray(res.data)) {
      members.value = res.data;
    } else {
      members.value = [];
    }
  } catch (err) {
    console.error('取得會員列表失敗', err);
    members.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await authStore.restoreSession();
  await fetchMembers();
});
</script>

<style scoped>
.fiex-end {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}
</style>

<!-- <style scoped>
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.data-table th, .data-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.btn-sm {
  margin-right: 8px;
}
</style> -->