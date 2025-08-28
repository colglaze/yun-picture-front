<script setup lang="ts">
import { ref, reactive, onMounted, computed, h, watch } from 'vue'
import { Empty, message } from 'ant-design-vue'
import { getSpaceVoByIdUsingPost } from '@/api/kongjianguanli'
import { listPictureTagCategoryUsingGet, listPictureVoByPageUsingPost } from '@/api/wenjianchuanshu'
import { PlusOutlined, TeamOutlined } from '@ant-design/icons-vue'
import router from '@/router'
import { SPACE_PERMISSION_ENUM } from '@/constants/space'

const props = defineProps<{
  id: string | number
}>()

const space = ref<API.SpaceVO>({})

// 获取空间详情
const fetchSpaceDetail = async () => {
  try {
    const res = await getSpaceVoByIdUsingPost({
      id: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    } else {
      message.error('获取空间详情失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取空间详情失败：' + e.message)
  }
}

// 数据
const dataList = ref([])
const total = ref(0)
const loading = ref(true)

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 15,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 点击图片
const doClickPicture = (picture: API.PictureVO) => {
  router.push(`/picture/${picture.id}`)
}

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

// 工具函数
const formatSize = (bytes: number): string => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 分类和标签数据
const categoryList = ref<string[]>([])
const tagList = ref<string[]>([])
const selectedCategory = ref<string>('all')
const selectedTagList = ref<boolean[]>([])
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

// 搜索
const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

// 跳转到创建图片页面
const goToCreatePicture = () => {
  if (space.value.id) {
    router.push(`/add_picture?spaceId=${space.value.id}`)
  } else {
    router.push('/add_picture')
  }
}

// 跳转到空间成员管理页面
const goToSpaceUserManage = () => {
  if (space.value.id) {
    router.push(`/spaceUserManage/${space.value.id}`)
  } else {
    message.error('空间ID不存在，无法跳转')
  }
}

// 通用权限检查函数
function createPermissionChecker(permission: string) {
  return computed(() => {
    return (space.value.permissionList ?? []).includes(permission)
  })
}

// 定义权限检查
const canManageSpaceUser = createPermissionChecker(SPACE_PERMISSION_ENUM.SPACE_USER_MANAGE)
const canUploadPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_UPLOAD)
const canEditPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDeletePicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)


watch(
  () => props.id,
  async (newSpaceId) => {
    await fetchSpaceDetail()
    await fetchData()
  },

)

// 页面加载时请求一次
onMounted(async () => {
  await fetchSpaceDetail()
  await fetchData()
  // 最后获取分类和标签数据
  await fetchCategoryAndTags()
})
</script>

<template>
  <div id="mySpacePage">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="space-name-section">
        <h2 class="space-name">{{ space.spaceName }}</h2>
      </div>
      <div style="display: flex; align-items: center; gap: 16px;">

        <a-button
          v-if="canManageSpaceUser"
          type="primary"
          ghost
          :icon="h(TeamOutlined)"
          @click="goToSpaceUserManage"
          target="_blank"
          style="height: 36px;font-weight: 600"
        >
          成员管理
        </a-button>
        <a-button v-if="canUploadPicture" type="primary" size="small" @click="goToCreatePicture" class="create-btn">
          <PlusOutlined />
          创建图片
        </a-button>

        <a-tooltip
          :title="`占用空间 ${formatSize(space.totalSize)} / ${formatSize(space.maxSize)}`"
        >
          <a-progress
            type="circle"
            :percent="((space.totalSize * 100) / space.maxSize).toFixed(1)"
            :size="42"
          />
        </a-tooltip>
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

<style scoped>
#mySpacePage {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
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
