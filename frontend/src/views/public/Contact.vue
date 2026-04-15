<template>
  <div class="contact">
    <h2>聯絡我們</h2>
    <div class="contact-layout">
      <div class="contact-info">
        <p>📞 電話：02-1234-5678</p>
        <p>📍 地址：高雄市鼓山區青海路181號3樓（莊大衛髮型概念沙龍樓上）</p>
        <p>⏰ 營業時間：週一至週六 10:30 - 21:00，週日公休</p>
        <p>💬 Line：@276titgx</p>
        <p>🚆 火車：台鐵美術館站（步行約9分鐘）</p>
        <p>🚈 輕軌：C20台鐵美術館站（步行約9分鐘）或 C21美術館站（步行約10分鐘）</p>
        <p>🅿️ 附近有停車場</p>
      </div>
      <div class="map-container">
        <img src="/images/地圖.jpg" alt="交通路線圖" class="map-image" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.40);
  border-radius: var(--radius);
  backdrop-filter: blur(2px);
}
h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--accent);
}
.contact-layout {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  flex-wrap: wrap;
}
.contact-info {
  flex: 1;
  min-width: 280px;
  text-align: left;
  line-height: 1.8;
}
.map-container {
  flex: 1;
  min-width: 280px;
  display: flex;
  justify-content: center;
}
.map-image {
  max-width: 100%;
  height: auto;
  max-height: 400px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  object-fit: contain;
}
/* 手機版改為上圖下文 */
@media (max-width: 768px) {
  .contact-layout {
    flex-direction: column;
  }
  .contact-info {
    order: 2;
  }
  .map-container {
    order: 1;
    margin-bottom: 1rem;
  }
  .map-image {
    max-height: 300px;
  }
}
</style>