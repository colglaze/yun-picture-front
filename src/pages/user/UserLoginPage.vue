<template>
    <div id="userLoginPage">
        <h2 class="title">子衿云图库 - 用户登录</h2>
        <div class="desc">企业级智能协同云图库</div>
        <a-form
    :model="formState"
    name="basic"
    autocomplete="off"
    @finish="handleSubmit"
  >
    <a-form-item
      label=""
      name="userAccount"
      :rules="[{ required: true, message: '请输入你的账号!' }]"
    >
      <a-input v-model:value="formState.userAccount" placeholder="请输入账号" />
    </a-form-item>

    <a-form-item
      label=""
      name="userPassword"
      :rules="[
        { required: true, message: '请输入你的密码!' },
        { min: 8, message: '密码不能少于8位' },
        ]"
    >
      <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" />
    </a-form-item>

    <div class="tips">
        没有账号？
        <router-link to="/user/register">去注册</router-link>
    </div>
    <a-form-item >
      <a-button type="primary" html-type="submit" style="width: 100%;" >登录</a-button>
    </a-form-item>
  </a-form>
    </div>
  
</template>


<script lang="ts" setup>
import { userLoginUsingPost } from '@/api/yonghuxiangguanjiekou';
import { useLoginUserStore } from '@/stores/useLoginUserStore';
import { message } from 'ant-design-vue';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

interface FormState {
  userAccount: string;
  userPassword: string;
  remember: boolean;
}

const formState = reactive<FormState>({
  userAccount: '',
  userPassword: '',
  remember: true,
});

const router = useRouter()
const loginUserStore = useLoginUserStore()

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  const res = await userLoginUsingPost(values)
  // 登录成功，把登录态保存到全局状态中
  if (res.data.code === 0 && res.data.data) {
    await loginUserStore.fetchLoginUser()
    message.success('登录成功')
    router.push({
      path: '/',
      replace: true,
    })
  } else {
    message.error('登录失败，' + res.data.message)
  }
}

</script>

<style scoped>
#userLoginPage {
    width: 360px;
    margin: 0 auto;
}
.title {
    text-align: center;
    margin-bottom: 16px;
}
.desc {
    text-align: center;
    margin-bottom: 16px;
    color: #bbb;
}
.tips {
    margin-bottom: 16px;
    color: #bbb;
    font-size: 13px;
    text-align: right;
}
</style>

