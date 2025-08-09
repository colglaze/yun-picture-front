<template>
  <a-form layout="inline" :model="searchParams" @finish="doSearch">
    <a-form-item label="账号">
      <a-input v-model:value="searchParams.userAccount" placeholder="输入账号" />
    </a-form-item>
    <a-form-item label="用户名">
      <a-input v-model:value="searchParams.userName" placeholder="输入用户名" />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit">搜索</a-button>
    </a-form-item>
  </a-form>
  <br />
  <a-table
    :columns="columns"
    :data-source="dataList"
    :pagination="pagination"
    @change="doTableChange"
  >
    <template #headerCell="{ column }">
      <template v-if="column.key === 'name'">
        <span>
          <smile-outlined />
          Name
        </span>
      </template>
    </template>

    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'userAvatar'">
        <a-avatar :src="record.userAvatar" :size="64" :alt="record.userName || '用户头像'">
          {{ (record.userName || '用户').charAt(0) }}
        </a-avatar>
      </template>
      <template v-else-if="column.dataIndex === 'userRole'">
        <div v-if="record.userRole === 'admin'">
          <a-tag color="green">管理员</a-tag>
        </div>
        <div v-else>
          <a-tag color="blue">普通用户</a-tag>
        </div>
      </template>
      <template v-else-if="column.dataIndex === 'createTime'">
        {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
      </template>
      <template v-else-if="column.key === 'action'">
        <a-button danger @click="doDelete(record.id)">删除</a-button>
      </template>
    </template>
  </a-table>
</template>

<script lang="ts" setup>
import { deleteUserUsingDelete, listUserVoByPageUsingPost } from '@/api/yonghuxiangguanjiekou'
import { message, Modal } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { features } from 'process'
import { deletePictureUsingPost } from '@/api/wenjianchuanshu'

//数据
const dataList = ref([])
const total = ref(0)

//搜索条件
const searchParams = reactive<API.UserQueryRequest>({
  current: 1,
  pageSize: 10,
})

//获取数据
const fetchData = async () => {
  const res = await listUserVoByPageUsingPost({
    ...searchParams,
  })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
    // 调试：查看头像数据
    console.log('用户数据:', dataList.value)
    dataList.value.forEach((user: any) => {
      console.log(`用户 ${user.userName} 的头像:`, user.userAvatar)
    })
  } else {
    message.error('获取数据失败,' + res.data.message)
  }
}

//分页变化处理
const handleTableChange = (page: number, pageSize: number) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}

//页面加载时要再刷新一次
onMounted(() => {
  fetchData()
})

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
  },
  {
    title: '用户名',
    dataIndex: 'userName',
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
  },
  {
    title: '简介',
    dataIndex: 'userProfile',
  },
  {
    title: '用户角色',
    dataIndex: 'userRole',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total: unknown) => `共 ${total} 条`,
  }
})

// 表格变化处理
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

// 图片加载错误处理
const handleImageError = (e: Event) => {
  console.log('图片加载失败:', e)
  // 可以在这里设置默认头像
  const target = e.target as HTMLImageElement
  if (target) {
    target.src = '/default-avatar.png'
  }
}

const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

//删除按钮
const doDelete = async (id:string) => {

  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这个用户吗？删除后无法恢复。',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        if(!id){
            return
        }
        const res = await deleteUserUsingDelete({ id })
        if(res.data.code ===0){
            message.success('删除成功')
            fetchData()
        }else{
            message.error('删除失败')
        }
      } catch (error) {
        message.error('删除失败')
        console.error('删除图片失败:', error)
      }
    }
  })
}
</script>

<style scoped></style>
