<template>
  <div class="home">
    <section class="hero">
      <h1>綻放你的自信之美</h1>
      <p>專業美容服務，為您量身打造</p>
      <!-- <BaseButton @click="router.push('/services')">探索服務</BaseButton> -->
    </section>

    <!-- <section id="services" class="section-block">
      <Services />
    </section> -->

    <!-- <section id="products" class="section-block">
      <Products />
    </section> -->

    <section id="contact" class="section-block">
      <Contact />
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import BaseButton from '@/components/common/BaseButton.vue';
import Services from '@/views/public/Services.vue';
import Products from '@/views/public/Products.vue';
import Contact from '@/views/public/Contact.vue';
const router = useRouter();
</script>

<style scoped>

.hero {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.40); /* 半透明背景，露出底層 Logo */
  border-radius: var(--radius);
  margin-bottom: 2rem;
  backdrop-filter: blur(2px);
}
.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #4a3b2f;
}
.hero p {
  font-size: 1.2rem;
  color: #6b5a4a;
}
@media (max-width: 768px) {
  .hero { padding: 3rem 1.5rem; }
  .hero h1 { font-size: 2rem; }
}
@media (max-width: 576px) {
  .hero { padding: 2rem 1rem; }
  .hero h1 { font-size: 1.6rem; }
}

</style>