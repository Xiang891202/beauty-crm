import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 分鐘無操作觸發提示
const LOGOUT_COUNTDOWN = 10; // 倒數 10 秒

export function useIdleTimeout() {
  const router = useRouter();
  let idleTimer: number | null = null;
  let countdownTimer: number | null = null;
  let dialogInstance: any = null;

  const isDialogOpen = ref(false);
  const countdown = ref(LOGOUT_COUNTDOWN);

  // 取得當前使用者角色
  const getUserRole = (): 'admin' | 'customer' | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr);
      return user.role === 'admin' ? 'admin' : 'customer';
    } catch {
      return null;
    }
  };

  // 登出函數
  const logout = () => {
    // 清除所有計時器
    if (idleTimer) clearTimeout(idleTimer);
    if (countdownTimer) clearInterval(countdownTimer);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    const role = getUserRole();
    if (role === 'admin') {
      router.push('/admin/login');
    } else {
      router.push('/customer/login');
    }
  };

  // 重置閒置計時器
  const resetIdleTimer = () => {
    if (idleTimer) clearTimeout(idleTimer);
    // 如果彈窗已開啟，不要重置（避免彈窗期間用戶活動關閉彈窗）
    if (isDialogOpen.value) return;
    idleTimer = setTimeout(showIdleDialog, IDLE_TIMEOUT);
  };

  // 顯示閒置提示彈窗
  const showIdleDialog = () => {
    if (isDialogOpen.value) return;
    isDialogOpen.value = true;
    countdown.value = LOGOUT_COUNTDOWN;

    // 啟動倒數計時器
    countdownTimer = setInterval(() => {
      countdown.value -= 1;
      if (countdown.value <= 0) {
        // 倒數結束，關閉彈窗並登出
        if (dialogInstance) dialogInstance.close();
        logout();
      }
    }, 1000);

    // 使用 Element Plus 的 MessageBox
    dialogInstance = ElMessageBox.confirm(
      `您已閒置超過 ${IDLE_TIMEOUT / 60000} 分鐘，是否繼續使用？`,
      '閒置提示',
      {
        confirmButtonText: '是',
        cancelButtonText: `登出 (${countdown.value})`,
        type: 'warning',
        closeOnClickModal: false,
        closeOnPressEscape: false,
        showClose: false,
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            // 使用者點「是」：重置所有狀態
            if (countdownTimer) clearInterval(countdownTimer);
            isDialogOpen.value = false;
            resetIdleTimer(); // 重新開始計時
            done();
          } else if (action === 'cancel') {
            // 使用者點「登出」
            if (countdownTimer) clearInterval(countdownTimer);
            logout();
            done();
          }
        },
      }
    ).catch(() => {
      // 關閉彈窗（例如按 ESC），視為登出
      if (countdownTimer) clearInterval(countdownTimer);
      logout();
    });

    // 動態更新按鈕上的倒數文字
    const interval = setInterval(() => {
      if (dialogInstance && countdown.value > 0) {
        dialogInstance.setCancelButtonText(`登出 (${countdown.value})`);
      } else {
        clearInterval(interval);
      }
    }, 100);
  };

  // 監聽使用者活動事件
  const onUserActivity = () => {
    resetIdleTimer();
  };

  const startMonitoring = () => {
    resetIdleTimer();
    window.addEventListener('mousemove', onUserActivity);
    window.addEventListener('keydown', onUserActivity);
    window.addEventListener('click', onUserActivity);
    window.addEventListener('scroll', onUserActivity);
  };

  const stopMonitoring = () => {
    if (idleTimer) clearTimeout(idleTimer);
    if (countdownTimer) clearInterval(countdownTimer);
    window.removeEventListener('mousemove', onUserActivity);
    window.removeEventListener('keydown', onUserActivity);
    window.removeEventListener('click', onUserActivity);
    window.removeEventListener('scroll', onUserActivity);
  };

  onMounted(() => {
    // 僅在已登入時啟動監聽
    const token = localStorage.getItem('token');
    if (token) {
      startMonitoring();
    }
  });

  onUnmounted(() => {
    stopMonitoring();
  });

  return { startMonitoring, stopMonitoring };
}