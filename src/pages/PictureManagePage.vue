<template>
  <div id="pictureManagePage">
    <!-- 标题和创建按钮 -->
    <a-flex justify="space-between" align="center" style="margin-bottom: 16px">
      <h2>图片管理</h2>
      <a-space>
        <a-button type="primary" @click="goToCreate">+ 创建图片</a-button>
        <a-button type="primary" @click="goToBatchCreate" ghost>+ 批量创建图片</a-button>
      </a-space>

    </a-flex>

    <!-- 搜索表单 -->
    <a-form layout="inline" :model="searchParams" @finish="doSearch" style="margin-bottom: 16px">
      <a-form-item label="关键词" name="searchText">
        <a-input
          v-model:value="searchParams.searchText"
          placeholder="从名称和简介搜索"
          allow-clear
          style="width: 200px"
        />
      </a-form-item>
      <a-form-item label="类型" name="category">
        <a-input
          v-model:value="searchParams.category"
          placeholder="请输入类型"
          allow-clear
          style="width: 150px"
        />
      </a-form-item>
      <a-form-item label="标签" name="tags">
        <a-select
          v-model:value="searchParams.tags"
          mode="tags"
          placeholder="请输入标签"
          style="min-width: 180px"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="审核状态" name="reviewStatus">
        <a-select
          v-model:value="searchParams.reviewStatus"
          :options="PIC_REVIEW_STATUS_OPTIONS"
          placeholder="请输入审核状态"
          style="min-width: 180px"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>

    <!-- 数据表格 -->
    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      :loading="loading"
      @change="doTableChange"
      row-key="id"
    >
      <!-- 图片列 -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'url'">
          <a-image
            :src="record.url"
            :width="80"
            :height="60"
            style="object-fit: cover; border-radius: 4px;"
          />
        </template>

        <!-- 标签列 -->
        <template v-else-if="column.dataIndex === 'tags'">
          <a-space wrap>
            <a-tag
              v-for="tag in parseTags(record.tags)"
              :key="tag"
              color="blue"
            >
              {{ tag }}
            </a-tag>
          </a-space>
        </template>

        <!-- 图片信息列 -->
        <template v-else-if="column.dataIndex === 'picInfo'">
          <div style="font-size: 12px; line-height: 1.4;">
            <div>格式：{{ record.picFormat || '未知' }}</div>
            <div>宽度：{{ record.picWidth || '未知' }}</div>
            <div>高度：{{ record.picHeight || '未知' }}</div>
            <div>宽高比：{{ record.picScale || '未知' }}</div>
            <div>大小：{{ formatFileSize(record.picSize) }}</div>
          </div>
        </template>

        <!--审核信息列-->
        <template v-else-if="column.dataIndex === 'reviewMessage'">
          <div style="font-size: 12px; line-height: 1.4;">
            <div>审核状态：{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}</div>
            <div>审核人：{{ record.reviewerId|| '未知' }}</div>
            <div>审核信息：{{ record.reviewMessage || '未知' }}</div>
          </div>
        </template>
        <!-- 创建时间列 -->
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ formatTime(record.createTime) || formatTime(record.user?.createTime) || '未知' }}
        </template>

        <!-- 编辑时间列 -->
        <template v-else-if="column.dataIndex === 'editTime'">
          {{ formatTime(record.editTime) || formatTime(record.updateTime) || '未知' }}
        </template>

        <!-- 操作列 -->
        <template v-else-if="column.key === 'action'">
          <a-space wrap>
            <a-button
              v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS"
              type="link" @click="doReview(record, PIC_REVIEW_STATUS_ENUM.PASS)">通过</a-button>

            <a-button
              v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT"
              type="link" @click="doReview(record, PIC_REVIEW_STATUS_ENUM.REJECT)">拒绝</a-button>

            <a-button type="link" @click="doEdit(record)">编辑</a-button>
            <a-button type="link" danger @click="doDelete(record.id)">删除</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import {PIC_REVIEW_STATUS_MAP, PIC_REVIEW_STATUS_ENUM, PIC_REVIEW_STATUS_OPTIONS} from '@/constants/picture'
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  deletePictureUsingPost, doPictureReviewUsingPost, listPictureByPageUsingPost
} from '@/api/wenjianchuanshu'

const router = useRouter()

// 数据
const dataList = ref([])
const total = ref(0)
const loading = ref(false)

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `共 ${total} 条`,
    pageSizeOptions: ['10', '20', '50', '100'],
  }
})

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    // width: 80,
    key: 'id',
  },
  {
    title: '图片',
    dataIndex: 'url',
    width: 100,
    key: 'url',
  },
  {
    title: '名称',
    dataIndex: 'name',
    // width: 150,
    key: 'name',
    ellipsis: true,
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    // width: 200,
    key: 'introduction',
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'category',
    // width: 100,
    key: 'category',
  },
  {
    title: '标签',
    dataIndex: 'tags',
    // width: 150,
    key: 'tags',
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
    // width: 120,
    key: 'picInfo',
  },
  {
    title: '用户ID',
    dataIndex: 'userId',
    // width: 80,
    key: 'userId',
  },
  {
    title: '审核信息',
    dataIndex: 'reviewMessage',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    // width: 150,
    key: 'createTime',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
    // width: 150,
    key: 'editTime',
  },
  {
    title: '操作',
    key: 'action',
    // width: 120,
    fixed: 'right',
  },
]

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await listPictureByPageUsingPost({
      ...searchParams,
    })
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data.records ?? []
      total.value = res.data.data.total ?? 0

      // 调试：查看第一条数据的时间字段
      if (dataList.value.length > 0) {
        console.log('第一条数据:', dataList.value[0])
        console.log('创建时间字段:', dataList.value[0].createTime)
        console.log('编辑时间字段:', dataList.value[0].editTime)
        console.log('所有字段:', Object.keys(dataList.value[0]))
      }
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (error) {
    message.error('获取数据失败')
    console.error('获取图片列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

// 表格变化处理
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

// 跳转到创建页面
const goToCreate = () => {
  router.push('/add_picture')
}

// 跳转到批量创建页面
const goToBatchCreate = () => {
  router.push('/batch_add_picture')
}

// 编辑图片
const doEdit = (record: any) => {
  router.push({
    path: '/add_picture',
    query: { id: record.id }
  })
}

// 删除图片
const doDelete = (id: number) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这张图片吗？删除后无法恢复。',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        const res = await deletePictureUsingPost({ id })
        if (res.data.code === 0) {
          message.success('删除成功')
          fetchData()
        } else {
          message.error('删除失败，' + res.data.message)
        }
      } catch (error) {
        message.error('删除失败')
        console.error('删除图片失败:', error)
      }
    }
  })
}

// 审核图片
const doReview = async (record: API.Picture, reviewStatus: number) => {
  const reviewMessage = reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS ? '管理员操作通过' : '管理员操作拒绝'
  const res = await doPictureReviewUsingPost({
    id: record.id,
    reviewStatus,
    reviewMessage,
  })
  if (res.data.code === 0) {
    message.success('审核成功')
    fetchData()
  } else {
    message.error('审核失败，' + res.data.message)
  }
}


// 解析标签
const parseTags = (tags: string) => {
  try {
    return JSON.parse(tags || '[]')
  } catch {
    return []
  }
}

// 格式化文件大小
const formatFileSize = (size: number) => {
  if (!size) return '未知'
  return (size / 1024).toFixed(2) + 'KB'
}

// 格式化时间
const formatTime = (timestamp: string | number | null | undefined) => {
  if (!timestamp) return null

  try {
    // 如果是数字，可能是时间戳
    if (typeof timestamp === 'number') {
      return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
    }

    // 如果是字符串，尝试解析
    if (typeof timestamp === 'string') {
      // 如果是时间戳字符串
      if (/^\d+$/.test(timestamp)) {
        return dayjs(parseInt(timestamp)).format('YYYY-MM-DD HH:mm:ss')
      }
      // 如果是ISO格式的日期字符串（如：2025-07-25T01:13:08.000+00:00）
      if (timestamp.includes('T')) {
        return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
      }
      // 如果是普通日期字符串
      return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
    }

    return null
  } catch (e) {
    console.error('格式化时间失败:', e, '原始值:', timestamp)
    return null
  }
}

// 页面加载时请求数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
#pictureManagePage {
  padding: 24px;
}

#pictureManagePage h2 {
  margin: 0;
  color: #1890ff;
  font-weight: 600;
}

.ant-form-inline .ant-form-item {
  margin-bottom: 16px;
}

.ant-table-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
