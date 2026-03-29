<template>
  <div>
    <h2>會員列表</h2>
    <table class="member-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>姓名</th>
          <th>電話</th>
          <th>生日</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="member in members" :key="member.id">
          <td>{{ member.id }}</td>
          <td>{{ member.name }}</td>
          <td>{{ member.phone }}</td>
          <td>{{ member.birthday || '-' }}</td>
          <td>
            <router-link :to="`/admin/members/${member.id}`">查看詳情</router-link>
          </td>
        </tr>
        <tr v-if="members.length === 0">
          <td colspan="5">暫無會員</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMembers } from '@/api/modules/member'; // 需要实现此 API

interface Member {
  id: number;
  name: string;
  phone: string | null;
  birthday: string | null;
}

const members = ref<Member[]>([]);

onMounted(async () => {
  try {
    const res = await getMembers();
    members.value = res.data.data; // 根据后端响应结构调整
  } catch (err) {
    console.error('Failed to fetch members', err);
  }
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