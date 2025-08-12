<template>
  <div id="mySpacePage">
    <!-- 空间信息小卡片 - 右上角 -->
    <div v-if="space.id" class="space-info-corner">
      <a-card size="small" class="space-mini-card">
        <div class="space-mini-content">
          <div class="space-mini-header">
            <h3>{{ space.spaceName }}</h3>
            <a-button type="primary" size="small" @click="goToCreatePicture">
              <PlusOutlined />
              创建图片
            </a-button>
          </div>
          <div class="space-mini-stats">
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
        </div>
      </a-card>
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
import { PlusOutlined } from '@ant-design/icons-vue'
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
  position: relative; /* 为绝对定位的子元素提供参考 */
}

/* 右上角空间信息卡片样式 */
.space-info-corner {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 10;
  width: 280px;
}

.space-mini-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.space-mini-content {
  padding: 16px;
}

.space-mini-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.space-mini-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.space-mini-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.stat-value {
  color: white;
  font-weight: 600;
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

  .space-info-corner {
    position: relative;
    top: auto;
    right: auto;
    width: 100%;
    margin-bottom: 20px;
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

  .space-info-corner {
    margin-bottom: 16px;
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
