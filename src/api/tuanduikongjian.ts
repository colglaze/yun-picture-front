// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 添加成员到空间 POST /api/spaceUser/add */
export async function addSpaceUserUsingPost(
  body: API.SpaceUserAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong_>('/api/spaceUser/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 从空间移除成员 POST /api/spaceUser/delete */
export async function deleteSpaceUserUsingPost(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/spaceUser/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 编辑成员信息 POST /api/spaceUser/edit */
export async function editSpaceUserUsingPost(
  body: API.SpaceUserEditRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/spaceUser/edit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 获取单个空间成员的信息 POST /api/spaceUser/get */
export async function getSpaceUserUsingPost(
  body: API.SpaceUserQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseSpaceUser_>('/api/spaceUser/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 获取空间成员信息列表 POST /api/spaceUser/get/list */
export async function listSpaceUserUsingPost(
  body: API.SpaceUserQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListSpaceUserVO_>('/api/spaceUser/get/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 查询我加入的团队空间列表 POST /api/spaceUser/list/my */
export async function listMyJoinSpaceUsingPost(options?: { [key: string]: any }) {
  return request<API.BaseResponseListSpaceUserVO_>('/api/spaceUser/list/my', {
    method: 'POST',
    ...(options || {}),
  })
}
