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
              <a-dropdown>
                <ASpace>
                  <a-avatar
                    :src="loginUserStore.loginUser.userAvatar"
                    :size="40"
                    :alt="loginUserStore.loginUser.userName || '用户头像'"
                  >
                    {{ (loginUserStore.loginUser.userName || '用户').charAt(0) }}
                  </a-avatar>
                  {{ loginUserStore.loginUser.userName ?? '无名' }}
                </ASpace>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="router.push('/user/info')">
                      <UserOutlined />
                      个人中心
                    </a-menu-item>
                    <a-menu-item @click="doLogout">
                      <LogoutOutlined />
                      退出登录
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
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
import { HomeOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons-vue'
import { computed, h, ref } from 'vue'
import { message, type MenuProps } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { userLogoutUsingPost } from '@/api/yonghuxiangguanjiekou'
const loginUserStore = useLoginUserStore()
const current = ref<string[]>([])
// 菜单列表
const originItems = [
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: '/admin/userManage',
    label: '用户管理',
    title: '用户管理',
  },
  {
    key: '/add_picture',
    label: '创建图片',
    title: '创建图片',
  },
  {
    key: '/admin/pictureManage',
    label: '图片管理',
    title: '图片管理',
  }



]

// 过滤菜单项
const filterMenus = (menus = [] as MenuProps['items']) => {
  return menus?.filter((menu) => {
    if (menu.key.startsWith('/admin')) {
      const loginUser = loginUserStore.loginUser
      if (!loginUser || loginUser.userRole !== "admin") {
        return false
      }
    }
    return true
  })
}

// 展示在菜单的路由数组
const items = computed<MenuProps['items']>(() => filterMenus(originItems))


const router = useRouter()
const doMenuClick = ({ key }) => {
  router.push({
    path: key,
  })
}

router.afterEach((to, from, next) => {
  current.value = [to.path]
})

//用户注销
const doLogout = async () => {
  const res = await userLogoutUsingPost()
  if(res.data.code === 0){
    loginUserStore.setLoginUser({
      userName: '未登录',
    })
    message.success('退出登录成功')
    await router.push('/user/login')
  } else{
    message.error('退出登录失败' + res.data.message)
  }
}

//个人信息修改
const userModify = async () => {

}

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
