import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './router';
import { useAuthStore } from './stores/auth.store';
import './styles/main.scss';

const app = createApp(App);
app.use(createPinia());
app.use(router);

const authStore = useAuthStore();
authStore.restoreSession(); // 恢復登入狀態

app.mount('#app');