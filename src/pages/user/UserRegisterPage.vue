<template>
    <div id="userRegiesterPage">
        <h2 class="title">子衿云图库 - 用户注册</h2>
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

    <a-form-item
      label=""
      name="checkPassword"
      :rules="[
        { required: true, message: '请输入你的密码!' },
        { min: 8, message: '密码不能少于8位' },
        ]"
    >
      <a-input-password v-model:value="formState.checkPassword" placeholder="请输入确认密码" />
    </a-form-item>

    <div class="tips">
        已有账号？
        <router-link to="/user/login">去登录</router-link>
    </div>
    <a-form-item >
      <a-button type="primary" html-type="submit" style="width: 100%;" >注册</a-button>
    </a-form-item>
  </a-form>
    </div>
  
</template>


<script lang="ts" setup>

import { userRegisterUsingPost } from '@/api/yonghuxiangguanjiekou';
import { message } from 'ant-design-vue';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

interface FormState {
  userAccount: string;
  userPassword: string;
  remember: boolean;
}

const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
});

const router = useRouter()

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  if(formState.userPassword !== formState.checkPassword){
    message.error('两次输入密码不一致')
    return;
  }
  const res = await userRegisterUsingPost(values)
  if(res.data.code === 0 && res.data.data){
    router.push({
        path: '/user/login',
        replace: true,
    })
  } else {
    message.error('注册失败' + res.data.message);
  }
}

</script>

<style scoped>
#userRegiesterPage {
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

