<template>
  <div id="homePage">
    <!-- 搜索框 -->
    <div class="search-bar">
      <a-input-search
        placeholder="从海量图片中搜索"
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
                :src="picture.url"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { listPictureVoByPageUsingPost, listPictureTagCategoryUsingGet } from '@/api/wenjianchuanshu'

const router = useRouter()

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

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 15,
    total: total.value,
    // 切换页号时，会修改搜索参数并获取数据
    onChange: (page, pageSize) => {
      searchParams.current = page
      searchParams.pageSize = pageSize
      fetchData()
    },
  }
})

const categoryList = ref<string[]>([])
const selectedCategory = ref<string>('all')
const tagList = ref<string[]>([])
const selectedTagList = ref<string[]>([])

// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const params = {
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

  try {
    const res = await listPictureVoByPageUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data.records ?? []
      total.value = res.data.data.total ?? 0
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (error) {
    console.error('获取数据失败:', error)
    message.error('获取数据失败，请重试')
  } finally {
    loading.value = false
  }
}

// 获取标签和分类选项
const getTagCategoryOptions = async () => {
  try {
    const res = await listPictureTagCategoryUsingGet()
    if (res.data.code === 0 && res.data.data) {
      // 转换成下拉选项组件接受的格式
      categoryList.value = res.data.data.categoryList ?? []
      tagList.value = res.data.data.tagList ?? []
      // 初始化选中标签数组
      selectedTagList.value = new Array(tagList.value.length).fill(false)
    } else {
      message.error('加载分类标签失败，' + res.data.message)
    }
  } catch (error) {
    console.error('获取分类标签失败:', error)
    message.error('加载分类标签失败，请重试')
  }
}

const doSearch = () => {
  // 重置搜索条件
  searchParams.current = 1
  fetchData()
}

// 跳转至图片详情
const doClickPicture = (picture: any) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

// 页面加载时请求一次
onMounted(() => {
  getTagCategoryOptions()
  fetchData()
})
</script>

<style scoped>
#homePage {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-bar {
  max-width: 480px;
  margin: 0 auto 16px;
}

.tag-bar {
  margin: 16px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.tag-bar span {
  font-weight: 500;
  color: #495057;
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

/* 响应式设计 */
@media (max-width: 768px) {
  #homePage {
    padding: 16px;
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
  #homePage {
    padding: 12px;
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
