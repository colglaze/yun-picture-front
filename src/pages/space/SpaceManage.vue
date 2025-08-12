<template>
  <a-flex justify="space-between">
    <h2>空间管理</h2>
    <a-space>
      <a-button type="primary" @click="goToAddSpace">+ 创建空间</a-button>
    </a-space>
  </a-flex>
  <br />
  <a-form layout="inline" :model="searchParams" @finish="doSearch">
    <a-form-item label="空间名称">
      <a-input v-model:value="searchParams.spaceName" placeholder="请输入空间名称" allow-clear />
    </a-form-item>
    <a-form-item label="空间级别">
      <a-select
        v-model:value="searchParams.spaceLevel"
        :options="SPACE_LEVEL_OPTIONS"
        placeholder="请选择空间级别"
        style="min-width: 180px"
        allow-clear
      />
    </a-form-item>
    <a-form-item label="用户id">
      <a-input v-model:value="searchParams.userId" placeholder="请输入用户id" allow-clear />
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
    @change="handleTableChange"
    row-key="id"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'spaceLevel'">
        <a-tag>{{ SPACE_LEVEL_MAP[record.spaceLevel] }}</a-tag>
      </template>
      <template v-else-if="column.dataIndex === 'spaceUseInfo'">
        <div>大小：{{ formatSize(record.totalSize) }} / {{ formatSize(record.maxSize) }}</div>
        <div>数量：{{ record.totalCount }} / {{ record.maxCount }}</div>
      </template>
      <template v-else-if="column.dataIndex === 'createTime'">
        {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
      </template>
      <template v-else-if="column.dataIndex === 'editTime'">
        {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
      </template>
      <template v-else-if="column.key === 'action'">
        <a-space wrap>
          <a-button type="link" @click="goToUpdateSpace(record.id)">更新</a-button>
          <a-button type="link" danger @click="doDelete(record.id)">删除</a-button>
        </a-space>

      </template>
    </template>
  </a-table>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { listSpaceByPageUsingPost, deleteSpaceUsingDelete } from '@/api/kongjianguanli'
import { SPACE_LEVEL_MAP, SPACE_LEVEL_OPTIONS } from '../../constants/space'
import { useRouter } from 'vue-router'

const router = useRouter()

const dataList = ref([])
const total = ref(0)

const searchParams = reactive<API.SpaceQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

const pagination = computed(() => ({
  current: searchParams.current ?? 1,
  pageSize: searchParams.pageSize ?? 10,
  total: total.value,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`,
}))

const columns = [
  { title: 'id', dataIndex: 'id', width: 80 },
  { title: '空间名称', dataIndex: 'spaceName' },
  { title: '空间级别', dataIndex: 'spaceLevel' },
  { title: '使用情况', dataIndex: 'spaceUseInfo' },
  { title: '用户id', dataIndex: 'userId', width: 80 },
  { title: '创建时间', dataIndex: 'createTime' },
  { title: '编辑时间', dataIndex: 'editTime' },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
  },
]

const fetchData = async () => {
  const res = await listSpaceByPageUsingPost({ ...searchParams })
  if (res.data && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + (res.data?.message || ''))
  }
}

const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

const handleTableChange = (pagination: any) => {
  searchParams.current = pagination.current
  searchParams.pageSize = pagination.pageSize
  fetchData()
}

const doDelete = (id: number) => {
  Modal.confirm({
    title: '确认删除该空间？',
    onOk: async () => {
      const res = await deleteSpaceUsingDelete({ id })
      if (res.data && res.data.data) {
        message.success('删除成功')
        fetchData()
      } else {
        message.error('删除失败,' + (res.data?.message || ''))
      }
    },
  })
}

const goToAddSpace = () => {
  router.push('/add_space')
}

const goToUpdateSpace = (id: number) => {
  router.push({
    path: '/add_space',
    query: { id: String(id) }
  })
}

onMounted(() => {
  fetchData()
})

function formatSize(size: number) {
  if (!size) return '0B'
  if (size < 1024) return size + 'B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + 'KB'
  if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(2) + 'MB'
  return (size / 1024 / 1024 / 1024).toFixed(2) + 'GB'
}
</script>

<style scoped></style>
