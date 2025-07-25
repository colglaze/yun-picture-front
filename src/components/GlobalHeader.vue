<template>
    <a-config-provider :locale="zhCN">
    <div id="globalHeader">
        <a-row :wrap="false">
          <a-col flex="200px">
            <RouterLink to="/">
              <div class="title-bar">
                <img class="logo" src="../assets/logo.png" alt="logo" />
                <div class="title">子衿云图库</div>
              </div>
            </RouterLink>
          </a-col>
          <a-col flex="auto">
            <a-menu
              v-model:selectedKeys="current"
              mode="horizontal"
              :items="items"
              @click="doMenuClick"
            />
          </a-col>
          <a-col flex="120px">
            <div class="user-login-status">
                <div v-if="loginUserStore.loginUser.id">
                  {{ loginUserStore.loginUser.userName ?? '无名' }}
                </div>
                <div v-else>
                  <RouterLink to="/user/login">
                    <a-button type="primary">登录</a-button>
                  </RouterLink>
                </div>
            </div>

          </a-col>
        </a-row>

    </div>

    </a-config-provider>
</template>


<script lang="ts" setup>
import { h, ref } from 'vue';
import { HomeOutlined } from '@ant-design/icons-vue';
import type { MenuProps } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { useLoginUserStore } from '@/stores/useLoginUserStore';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
const loginUserStore = useLoginUserStore()
const current = ref<string[]>([]);
const items = ref<MenuProps['items']>([
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: '/about',
    label: '关于',
    title: '关于',
  },
  {
    key: 'others',
    label: h('a', { href: 'https://www.codefather.cn', target: '_blank' }, '编程导航'),
    title: '编程导航',
  },
])

const router = useRouter();
const doMenuClick = ({ key }) => {
    router.push({
        path:key
    })
}

router.afterEach((to,from,next) => {
    current.value = [to.path]
})


</script>

<style scoped>
#globalHeader .title-bar {
    display: flex;
    align-items: center;

}

#globalHeader .title {
    color: black;
    font-size: 18px;
    margin-left: 16px;
}

#globalHeader .logo {
    height: 48px;
}


</style>
