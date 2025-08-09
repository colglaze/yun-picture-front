// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 管理员添加用户 POST /api/user/add */
export async function addUserUsingPost(body: API.UserAddRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseLong_>('/api/user/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 根据id删除用户，限管理员 DELETE /api/user/delete */
export async function deleteUserUsingDelete(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/user/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 根据id获取用户信息 POST /api/user/get */
export async function getByIdUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getByIdUsingPOSTParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseUser_>('/api/user/get', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 获取当前登录用户信息 GET /api/user/get/login */
export async function getLoginUserUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseLoginUserVO_>('/api/user/get/login', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 用户根据id获取用户vo POST /api/user/get/vo */
export async function getVoByIdUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getVoByIdUsingPOSTParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseUserVO_>('/api/user/get/vo', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 修改用户密码 POST /api/user/get/vo/password */
export async function updatePasswordUsingPost(
  body: API.PasswordRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/user/get/vo/password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 分页查询用户信息 POST /api/user/list/page/vo */
export async function listUserVoByPageUsingPost(
  body: API.UserQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageUserVO_>('/api/user/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 用户登录 POST /api/user/login */
export async function userLoginUsingPost(
  body: API.UserLoginRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLoginUserVO_>('/api/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 用户注销 POST /api/user/logout */
export async function userLogoutUsingPost(options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean_>('/api/user/logout', {
    method: 'POST',
    ...(options || {}),
  })
}

/** 用户注册 POST /api/user/register */
export async function userRegisterUsingPost(
  body: API.UserRegisterRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong_>('/api/user/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 更新用户信息 POST /api/user/update */
export async function updateUserUsingPost(
  body: API.UserUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/user/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
