import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 分鐘（正式環境）
const LOGOUT_COUNTDOWN = 10;

export function useIdleTimeout() {
  const router = useRouter();
  let idleTimer: number | null = null;
  let countdownTimer: number | null = null;
  let overlayDiv: HTMLDivElement | null = null;
  let isMonitoring = false; // 避免重复添加事件

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

  const logout = () => {
    const role = getUserRole();
    const authStore = useAuthStore();
    authStore.logout(); // 确保调用登出方法，触发相关事件
    if (idleTimer) clearTimeout(idleTimer);
    if (countdownTimer) clearInterval(countdownTimer);
    removeOverlay();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (role === 'admin') {
      router.push('/admin/login');
    } else {
      router.push('/customer/login');
    }
  };

  const removeOverlay = () => {
    if (overlayDiv && overlayDiv.parentNode) {
      overlayDiv.parentNode.removeChild(overlayDiv);
      overlayDiv = null;
    }
    if (countdownTimer) clearInterval(countdownTimer);
  };

  const resetIdleTimer = () => {
    if (idleTimer) clearTimeout(idleTimer);
    if (overlayDiv) {
      removeOverlay();
    }
    idleTimer = setTimeout(() => {
      showIdleDialog();
    }, IDLE_TIMEOUT);
  };

  const showIdleDialog = () => {
    if (overlayDiv) return;
    let secondsLeft = LOGOUT_COUNTDOWN;

    overlayDiv = document.createElement('div');
    overlayDiv.style.position = 'fixed';
    overlayDiv.style.top = '0';
    overlayDiv.style.left = '0';
    overlayDiv.style.width = '100%';
    overlayDiv.style.height = '100%';
    overlayDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    overlayDiv.style.zIndex = '9999';
    overlayDiv.style.display = 'flex';
    overlayDiv.style.alignItems = 'center';
    overlayDiv.style.justifyContent = 'center';

    const contentDiv = document.createElement('div');
    contentDiv.style.backgroundColor = '#2c2c2c';
    contentDiv.style.padding = '2rem';
    contentDiv.style.borderRadius = '12px';
    contentDiv.style.maxWidth = '400px';
    contentDiv.style.textAlign = 'center';
    contentDiv.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';

    const message = document.createElement('p');
    message.textContent = `您已閒置超過 ${IDLE_TIMEOUT / 60000} 分鐘，是否繼續使用？`;
    message.style.marginBottom = '1rem';
    message.style.fontSize = '1.2rem';
    message.style.color = '#fff';
    contentDiv.appendChild(message);

    const countdownSpan = document.createElement('span');
    countdownSpan.textContent = `${secondsLeft} 秒後將自動登出`;
    countdownSpan.style.display = 'block';
    countdownSpan.style.marginBottom = '1.5rem';
    countdownSpan.style.fontSize = '0.9rem';
    countdownSpan.style.color = '#ffaa66';
    contentDiv.appendChild(countdownSpan);

    const buttonDiv = document.createElement('div');
    buttonDiv.style.display = 'flex';
    buttonDiv.style.gap = '1rem';
    buttonDiv.style.justifyContent = 'center';

    const continueBtn = document.createElement('button');
    continueBtn.textContent = '繼續使用';
    continueBtn.style.padding = '0.5rem 1.2rem';
    continueBtn.style.backgroundColor = '#4caf50';
    continueBtn.style.color = '#fff';
    continueBtn.style.border = 'none';
    continueBtn.style.borderRadius = '6px';
    continueBtn.style.cursor = 'pointer';
    continueBtn.onclick = () => {
      removeOverlay();
      resetIdleTimer();
    };

    // const logoutBtn = document.createElement('button');
    // logoutBtn.textContent = `登出 (${secondsLeft})`;
    // logoutBtn.style.padding = '0.5rem 1.2rem';
    // logoutBtn.style.backgroundColor = '#d9534f';
    // logoutBtn.style.color = '#fff';
    // logoutBtn.style.border = 'none';
    // logoutBtn.style.borderRadius = '6px';
    // logoutBtn.style.cursor = 'pointer';
    // logoutBtn.onclick = () => {
    //   removeOverlay();
    //   logout();
    // };

    buttonDiv.appendChild(continueBtn);
    // buttonDiv.appendChild(logoutBtn);
    contentDiv.appendChild(buttonDiv);
    overlayDiv.appendChild(contentDiv);
    document.body.appendChild(overlayDiv);

    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        if (countdownTimer) clearInterval(countdownTimer);
        removeOverlay();
        logout();
      } else {
        countdownSpan.textContent = `${secondsLeft} 秒後將自動登出`;
        // logoutBtn.textContent = `登出 (${secondsLeft})`;
      }
    }, 1000);
  };

  const onUserActivity = () => {
    resetIdleTimer();
  };

  const startMonitoring = () => {
    if (isMonitoring) return;
    isMonitoring = true;
    resetIdleTimer();
    window.addEventListener('click', onUserActivity);
    window.addEventListener('keydown', onUserActivity);
    // 移动端支持
    window.addEventListener('touchstart', onUserActivity);
  };

  const stopMonitoring = () => {
    if (idleTimer) clearTimeout(idleTimer);
    if (countdownTimer) clearInterval(countdownTimer);
    removeOverlay();
    window.removeEventListener('click', onUserActivity);
    window.removeEventListener('keydown', onUserActivity);
    window.removeEventListener('touchstart', onUserActivity);
    isMonitoring = false;
  };

  // 监控 localStorage 变化（当 token 被设置时启动）
  const startMonitoringIfNeeded = () => {
    const token = localStorage.getItem('token');
    if (token && !isMonitoring) {
      startMonitoring();
    } else if (!token && isMonitoring) {
      stopMonitoring();
    }
  };

  // 监听 storage 事件（跨标签页，以及同一页面内 localStorage 变化）
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'token') {
      startMonitoringIfNeeded();
    }
  };

  onMounted(() => {
    // 初始检查
    startMonitoringIfNeeded();
    window.addEventListener('storage', handleStorageChange);
    // 额外监听自定义事件（用于同一页面内登录，因为 storage 事件不触发）
    window.addEventListener('auth-login', startMonitoringIfNeeded);
    window.addEventListener('auth-logout', startMonitoringIfNeeded);
  });

  onUnmounted(() => {
    stopMonitoring();
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('auth-login', startMonitoringIfNeeded);
    window.removeEventListener('auth-logout', startMonitoringIfNeeded);
  });

  // 暴露方法供外部手动调用（如登录后）
  return { startMonitoringIfNeeded };
}