import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getLoginUserUsingGet } from '@/api/yonghuxiangguanjiekou';

export const useLoginUserStore = defineStore('loginUser', () => {
  const loginUser = ref<API.LoginUserVO>({
    userName:"未登录",
  });

  async function fetchLoginUser() {
    const res = await getLoginUserUsingGet()
    if(res.data.code === 0 && res.data.data){
      loginUser.value = res.data.data;
    }
  }
  
  function setLoginUser(newLoginUser: any) {
    loginUser.value = newLoginUser;
  }

  return { loginUser, fetchLoginUser, setLoginUser};
})
