<template>
  <div>
    <h2>會員列表</h2>
    <div>
      <BaseButton @click="createMember">新增會員</BaseButton>
    </div>
    <table class="member-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>姓名</th>
          <th>電話</th>
          <!-- <th>生日</th> -->
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="member in members" :key="member.id">
          <td>{{ member.id }}</td>
          <td>{{ member.name }}</td>
          <td>{{ member.phone }}</td>
          <!-- <td>{{ member.birthday || '-' }}</td> -->
          <td>
            <router-link :to="`/admin/members/${member.id}`">查看詳情</router-link>
          </td>
        </tr>
        <tr v-if="members.length === 0">
          <td colspan="5">暫無會員</td>
        </tr>
      </tbody>
    </table>

    <BaseModal v-model="showCreateModal" title="新增會員">
      <MemberForm 
        @submit="handleCreate"
        @cancel="closeModel"
      />
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMembers, createMember as createMemberApi, type Member } from '@/api/modules/member';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import MemberForm from '@/views/admin/members/MemberForm.vue';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const loading = ref(true);

// 刪除本地 interface Member，使用導入的 Member 類型
const members = ref<Member[]>([]);
const showCreateModal = ref(false);

const createMember = () => {
  showCreateModal.value = true;
};

const closeModel = () => {
  showCreateModal.value = false;
};

const handleCreate = async (formData: any) => {
  try {
    await createMemberApi(formData);
    closeModel();
    await fetchMembers();
  } catch (err) {
    console.error('新增會員失敗', err);
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
.member-table {
  width: 100%;
  border-collapse: collapse;
}
.member-table th, .member-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}
</style>