<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>

      <a-layout>
        <GlobalSider class="sider" />
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>
      </a-layout>

      <a-layout-footer class="footer">
        <a href="/fire_work">welcom to 子衿云图库</a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue';
import GlobalSider from '@/components/GlobalSider.vue'
</script>

<style>
#basicLayout .footer {
    background: #efefef;
    padding: 16px;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 1000;
}
#basicLayout .content {
    background: linear-gradient(to right,#fefefe,#fff);
    margin-bottom: 28px;
    padding: 20px;
}
#basicLayout .header {
    padding-inline: 20px;
    margin-bottom: 16px;
    color: unset;
    background: white;
}
</style>
