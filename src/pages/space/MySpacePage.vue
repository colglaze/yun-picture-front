<template>
  <div id="mySpacePage">
    <!-- 空间信息布局 - 分散式设计 -->
    <div v-if="space.id" class="space-info-layout">
      <!-- 左上角：空间名称和创建按钮 -->
      <div class="space-info-left">
        <div class="space-name-section">
          <h2 class="space-name">{{ space.spaceName }}</h2>
          <a-button type="primary" size="small" @click="goToCreatePicture" class="create-btn">
            <PlusOutlined />
            创建图片
          </a-button>
        </div>
      </div>

      <!-- 右上角：空间统计信息 -->
      <div class="space-info-right">
        <div class="space-stats">
          <div class="stat-item">
            <span class="stat-label">图片:</span>
            <span class="stat-value">{{ total }}/{{ space.maxCount || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">空间:</span>
            <span class="stat-value">{{ formatSize(space.totalSize || 0) }}/{{ formatSize(space.maxSize || 0) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">使用率:</span>
            <span class="stat-value" :style="{ color: spaceUsageColor }">{{ spaceUsagePercent }}%</span>
          </div>
        </div>

        <!-- 隐藏式详细信息按钮 -->
        <a-button
          type="text"
          size="small"
          @click="showSpaceDetail = !showSpaceDetail"
          class="detail-toggle-btn"
        >
          <template #icon>
            <component :is="showSpaceDetail ? 'UpOutlined' : 'DownOutlined'" />
          </template>
          {{ showSpaceDetail ? '收起' : '详情' }}
        </a-button>
      </div>

      <!-- 隐藏式详细信息面板 -->
      <div v-if="showSpaceDetail" class="space-detail-panel">
        <div class="detail-content">
          <div class="detail-section">
            <h4>空间详情</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">空间ID:</span>
                <span class="detail-value">{{ space.id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">创建时间:</span>
                <span class="detail-value">{{ formatTime(space.createTime) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">更新时间:</span>
                <span class="detail-value">{{ formatTime(space.updateTime) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">空间描述:</span>
                <span class="detail-value">{{ space.spaceDescription || '暂无描述' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>使用统计</h4>
            <div class="usage-progress">
              <div class="progress-info">
                <span>空间使用进度</span>
                <span>{{ spaceUsagePercent.toFixed(1) }}%</span>
              </div>
              <a-progress
                :percent="spaceUsagePercent"
                :stroke-color="spaceUsageColor"
                :show-info="false"
                size="small"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-bar">
      <a-input-search
        placeholder="在您的空间中搜索图片"
        v-model:value="searchParams.searchText"
        enter-button="搜索"
        size="large"
        @search="doSearch"
      />
    </div>

    <!-- 分类 + 标签 -->
    <a-tabs v-model:activeKey="selectedCategory" @change="doSearch">
      <a-tab-pane key="all" tab="全部" />
      <a-tab-pane v-for="category in categoryList" :key="category" :tab="category" />
    </a-tabs>
    <div class="tag-bar">
      <span style="margin-right: 8px">标签：</span>
      <a-space :size="[0, 8]" wrap>
        <a-checkable-tag
          v-for="(tag, index) in tagList"
          :key="tag"
          v-model:checked="selectedTagList[index]"
          @change="doSearch"
        >
          {{ tag }}
        </a-checkable-tag>
      </a-space>
    </div>

    <!-- 图片列表 -->
    <a-list
      :grid="{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 5 }"
      :data-source="dataList"
      :pagination="pagination"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0">
          <!-- 单张图片 -->
          <a-card hoverable @click="doClickPicture(picture)" class="picture-card">
            <template #cover>
              <img
                class="picture-image"
                :alt="picture.name"
                :src="picture.thumbnailUrl ?? picture.url"
                loading="lazy"
              />
            </template>
            <a-card-meta :title="picture.name">
              <template #description>
                <a-flex>
                  <a-tag color="green">
                    {{ picture.category ?? '默认' }}
                  </a-tag>
                  <a-tag v-for="tag in picture.tags" :key="tag">
                    {{ tag }}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta>
          </a-card>
        </a-list-item>
      </template>
    </a-list>

    <!-- 空状态 -->
    <div v-if="!loading && dataList.length === 0" class="empty-state">
      <a-empty
        description="暂无图片"
        :image="Empty.PRESENTED_IMAGE_SIMPLE"
      >
        <a-button type="primary" @click="goToCreatePicture">
          上传第一张图片
        </a-button>
      </a-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined, UpOutlined, DownOutlined } from '@ant-design/icons-vue'
import { Empty } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import {
  listSpaceByPageUsingPost
} from '@/api/kongjianguanli'
import {
  listPictureVoByPageUsingPost,
  listPictureTagCategoryUsingGet
} from '@/api/wenjianchuanshu'

const router = useRouter()
const loginUserStore = useLoginUserStore()

// 空间信息
const space = ref<API.SpaceVO>({})
const spaceLoading = ref(true)
const showSpaceDetail = ref(false)

// 图片数据
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const loading = ref(true)

// 分类和标签数据
const categoryList = ref<string[]>([])
const tagList = ref<string[]>([])
const selectedCategory = ref<string>('all')
const selectedTagList = ref<boolean[]>([])

// 搜索参数
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 15,
  sortField: 'createTime',
  sortOrder: 'descend',
  searchText: '',
})

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 15,
    total: total.value,
    showSizeChanger: true,
    onChange: (page: number, pageSize: number) => {
      searchParams.current = page
      searchParams.pageSize = pageSize
      fetchData()
    },
  }
})

// 获取用户空间信息
const fetchUserSpace = async () => {
  try {
    spaceLoading.value = true
    const loginUser = loginUserStore.loginUser
    console.log('当前登录用户:', loginUser)

    if (!loginUser?.id) {
      console.log('用户未登录，跳转到登录页面')
      router.replace('/user/login')
      return
    }

    console.log('开始获取用户空间信息，用户ID:', loginUser.id)
    const res = await listSpaceByPageUsingPost({
      userId: loginUser.id,
      current: 1,
      pageSize: 1,
    })

    console.log('空间信息API响应:', res)

    if (res.data.code === 0 && res.data.data?.records?.length > 0) {
      space.value = res.data.data.records[0]
      console.log('获取到空间信息:', space.value)
      // 设置空间ID到搜索参数
      searchParams.spaceId = space.value.id
      console.log('设置空间ID到搜索参数:', searchParams.spaceId)
      // 获取图片数据
      await fetchData()
    } else {
      console.log('用户没有空间，跳转到创建空间页面')
      message.warn('您还没有创建空间，请先创建空间')
      router.replace('/add_space')
    }
  } catch (e: any) {
    console.error('获取空间信息异常:', e)
    message.error('获取空间信息失败：' + e.message)
  } finally {
    spaceLoading.value = false
  }
}

// 获取分类和标签数据
const fetchCategoryAndTags = async () => {
  try {
    console.log('开始获取分类和标签数据')
    const res = await listPictureTagCategoryUsingGet()
    console.log('分类标签API响应:', res)

    if (res.data.code === 0 && res.data.data) {
      categoryList.value = res.data.data.categoryList || []
      tagList.value = res.data.data.tagList || []

      console.log('获取到分类:', categoryList.value)
      console.log('获取到标签:', tagList.value)

      // 初始化选中标签数组
      selectedTagList.value = new Array(tagList.value.length).fill(false)
    } else {
      console.error('获取分类标签失败:', res.data)
    }
  } catch (e: any) {
    console.error('获取分类标签异常:', e)
  }
}

// 获取图片数据
const fetchData = async () => {
  if (!space.value.id) {
    console.log('空间ID不存在，无法获取图片数据')
    return
  }

  try {
    loading.value = true
    console.log('开始获取图片数据，空间ID:', space.value.id)

    // 构建搜索参数，与主页保持一致
    const params = {
      spaceId: space.value.id,
      ...searchParams,
      tags: [],
    }

    if (selectedCategory.value !== 'all') {
      params.category = selectedCategory.value
    }

    selectedTagList.value.forEach((useTag, index) => {
      if (useTag) {
        params.tags.push(tagList.value[index])
      }
    })

    console.log('发送请求参数:', params)

    const res = await listPictureVoByPageUsingPost(params)
    console.log('API响应:', res)

    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data.records || []
      total.value = res.data.data.total || 0
      console.log('图片数据获取成功:', dataList.value)
      console.log('总数:', total.value)
    } else {
      console.error('API返回错误:', res.data)
      message.error('获取图片数据失败：' + res.data.message)
    }
  } catch (e: any) {
    console.error('获取图片数据异常:', e)
    message.error('获取图片数据失败：' + e.message)
  } finally {
    loading.value = false
  }
}

// 搜索
const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

// 点击图片
const doClickPicture = (picture: API.PictureVO) => {
  router.push(`/picture/${picture.id}`)
}

// 跳转到创建图片页面
const goToCreatePicture = () => {
  if (space.value.id) {
    router.push(`/add_picture?spaceId=${space.value.id}`)
  } else {
    router.push('/add_picture')
  }
}

// 格式化文件大小
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化时间
const formatTime = (time: string | number | undefined) => {
  if (!time) return '未知'
  if (typeof time === 'string') {
    return new Date(time).toLocaleString('zh-CN')
  }
  if (typeof time === 'number') {
    return new Date(time).toLocaleString('zh-CN')
  }
  return '未知'
}

// 计算空间使用率百分比
const spaceUsagePercent = computed(() => {
  if (space.value.maxSize === 0) return 0
  return ((space.value.totalSize || 0) / (space.value.maxSize || 0)) * 100
})

// 空间使用率颜色
const spaceUsageColor = computed(() => {
  if (spaceUsagePercent.value >= 80) return '#ff4d4f' // 红色
  if (spaceUsagePercent.value >= 50) return '#faad14' // 橙色
  return '#52c41a' // 绿色
})

// 页面加载
onMounted(async () => {
  console.log('页面开始加载')
  try {
    // 先获取登录用户信息
    await loginUserStore.fetchLoginUser()
    console.log('登录用户信息:', loginUserStore.loginUser)

    // 再获取用户空间信息
    await fetchUserSpace()
    // 最后获取分类和标签数据
    await fetchCategoryAndTags()
  } catch (error) {
    console.error('页面加载失败:', error)
  }
})
</script>

<style scoped>
#mySpacePage {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 空间信息布局样式 */
.space-info-layout {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  border: 1px solid #dee2e6;
}

/* 左侧：空间名称和创建按钮 */
.space-info-left {
  flex: 1;
}

.space-name-section {
  display: flex;
  align-items: center;
  gap: 16px;
}
.space-name {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.create-btn {
  height: 36px;
  border-radius: 8px;
  font-weight: 600;
}

/* 右侧：统计信息和详情按钮 */
.space-info-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.space-stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: white;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 200px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.stat-label {
  color: #6c757d;
  font-weight: 500;
}

.stat-value {
  color: #2c3e50;
  font-weight: 600;
}

.detail-toggle-btn {
  color: #667eea;
  font-size: 12px;
  height: 28px;
  padding: 0 12px;
}

/* 隐藏式详细信息面板 */
.space-detail-panel {
  width: 100%;
  margin-top: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-content {
  padding: 20px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 8px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.detail-label {
  color: #6c757d;
  font-weight: 500;
  font-size: 13px;
}

.detail-value {
  color: #2c3e50;
  font-weight: 600;
  font-size: 13px;
}

.usage-progress {
  margin-top: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: #6c757d;
}

.search-bar {
  max-width: 480px;
  margin: 0 auto 16px;
}

.tag-bar {
  margin: 16px 0;
  padding: 16px;
}

.picture-card {
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.picture-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.picture-card :deep(.ant-card-cover) {
  height: 160px;
  overflow: hidden;
}

.picture-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.picture-card:hover .picture-image {
  transform: scale(1.05);
}

.picture-card :deep(.ant-card-body) {
  padding: 16px;
}

.picture-card :deep(.ant-card-meta-title) {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
  line-height: 1.4;
}

.picture-card :deep(.ant-card-meta-description) {
  margin-top: 8px;
}

.picture-card :deep(.ant-tag) {
  margin: 2px 4px 2px 0;
  font-size: 12px;
  border-radius: 4px;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  #mySpacePage {
    padding: 16px;
  }

  .space-info-layout {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .space-info-left {
    width: 100%;
  }

  .space-info-right {
    align-items: flex-start;
    width: 100%;
  }

  .space-stats {
    min-width: auto;
    width: 100%;
  }

  .search-bar {
    margin-bottom: 12px;
  }

  .tag-bar {
    margin: 12px 0;
    padding: 12px;
  }

  .picture-card :deep(.ant-card-cover) {
    height: 140px;
  }

  .picture-image {
    height: 140px;
  }

  .picture-card :deep(.ant-card-body) {
    padding: 12px;
  }

  .picture-card :deep(.ant-card-meta-title) {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  #mySpacePage {
    padding: 12px;
  }

  .space-info-layout {
    padding: 12px;
  }

  .space-name {
    font-size: 20px;
  }

  .search-bar {
    margin-bottom: 10px;
  }

  .tag-bar {
    margin: 10px 0;
    padding: 10px;
  }

  .picture-card :deep(.ant-card-cover) {
    height: 120px;
  }

  .picture-image {
    height: 120px;
  }

  .picture-card :deep(.ant-card-body) {
    padding: 10px;
  }

  .picture-card :deep(.ant-card-meta-title) {
    font-size: 13px;
  }
}
</style>
