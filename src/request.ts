import { message } from "ant-design-vue";
import axios from "axios";

const DEV_BASE_URL = "http://localhost:8123"; // 开发环境基础地址
// const PROD_BASE_URL = "http://81.69.229.63"; // 生产环境基础地址（已注释）
// 创建 Axios 实例
const myAxios = axios.create({ // 创建 axios 实例
    baseURL: DEV_BASE_URL, // 设置基础地址为开发环境
    timeout: 10000, // 设置超时时间为 10 秒
    withCredentials: true, // 允许携带 cookie
});

// 全局请求拦截器
myAxios.interceptors.request.use( // 添加请求拦截器 
  function (config) { // 请求发送前的处理
    // Do something before request is sent // 发送请求前的操作
    return config // 返回配置
  },
  function (error) { // 请求错误时的处理
    // Do something with request error // 处理请求错误
    return Promise.reject(error) // 返回错误
  },
)

// 全局响应拦截器
myAxios.interceptors.response.use( // 添加响应拦截器
  function (response) { // 响应成功时的处理
    const { data } = response // 解构响应数据
    // 未登录
    if (data.code === 40100) { // 如果未登录
      // 不是获取用户信息的请求，并且用户目前不是已经在用户登录页面，则跳转到登录页面
      if (
        !response.request.responseURL.includes('user/get/login') && // 不是获取用户信息
        !window.location.pathname.includes('/user/login') // 当前页面不是登录页
      ) {
        message.warning('请先登录') // 弹出警告消息
        window.location.href = `/user/login?redirect=${window.location.href}` // 跳转到登录页并带上重定向
      }
    }
    return response // 返回响应
  },
  function (error) { // 响应错误时的处理
    // Any status codes that falls outside the range of 2xx cause this function to trigger // 非 2xx 状态码触发
    // Do something with response error // 处理响应错误
    return Promise.reject(error) // 返回错误
  },
)

export default myAxios; // 导出自定义的 axios 实例
