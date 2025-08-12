import { createRouter, createWebHistory } from 'vue-router'
import UserLoginPage from '@/pages/user/UserLoginPage.vue'
import UserRegisterPage from '@/pages/user/UserRegisterPage.vue'
import UserManagePage from '@/pages/admin/UserManagePage.vue'
import UserInfoPage from '@/pages/user/UserInfoPage.vue'
import AddPicturePage from '@/pages/AddPicturePage.vue'
import PictureManagePage from '@/pages/admin/PictureManagePage.vue'
import PictureDetailPage from '@/pages/PictureDetailPage.vue'
import HomePage from '@/pages/HomePage.vue'
import BatchAddPicturePage from '@/pages/BatchAddPicturePage.vue'
import FireWelcome from '@/components/FireWelcome.vue'
import MySpacePage from '@/pages/space/MySpacePage.vue'
import SpaceDetailPage from '@/pages/space/SpaceDetailPage.vue'
import AddSpacePage from '@/pages/space/AddSpacePage.vue'
import SpaceManage from '@/pages/space/SpaceManage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/user/login',
      name: '用户登录',
      component: UserLoginPage,
    },
    {
      path: '/user/register',
      name: '用户注册',
      component: UserRegisterPage,
    },
    {
      path: '/user/info',
      name: '个人中心',
      component: UserInfoPage,
    },
    {
      path: '/admin/userManage',
      name: '用户管理',
      component: UserManagePage,
    },
    {
      path: '/add_picture',
      name: '创建图片',
      component: AddPicturePage,
    },
    {
      path: '/admin/pictureManage',
      name: '图片管理',
      component: PictureManagePage,
    },
    {
      path: '/picture/:id',
      name: '图片详情',
      component: PictureDetailPage,
      props: true,
    },
    {
      path: '/batch_add_picture',
      name: '批量上传图片',
      component: BatchAddPicturePage,
      props: true,
    },
    {
      path: '/fire_work',
      name: '烟花欢迎页',
      component: FireWelcome,
      props: true,
    },
    {
      path: '/admin/spaceManage',
      name: '空间管理',
      component: SpaceManage,
    },
    {
      path: '/my_space',
      name: '我的空间',
      component: MySpacePage,
    },
    {
      path: '/space/:id',
      name: '空间详情',
      component: SpaceDetailPage,
      props: true,
    },
    {
      path: '/add_space',
      name: '创建空间',
      component: AddSpacePage,
    },
  ],
})

export default router
