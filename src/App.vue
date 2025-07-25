<template>
  <div id="app">
    <BasicLayout />
  </div>
</template>

<script setup lang="ts">
import BasicLayout from "@/layouts/BasicLayout.vue";
import { useLoginUserStore } from "./stores/useLoginUserStore";

import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');
const loginUserStore = useLoginUserStore()
loginUserStore.fetchLoginUser()
{{ JSON.stringify(loginUserStore.loginUser) }}

</script>

<style>
#app {
}
</style>
