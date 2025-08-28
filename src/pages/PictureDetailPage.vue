<template>
  <div id="pictureDetailPage">
    <div class="page-header">
      <h1>图片详情</h1>
      <p>查看图片的详细信息</p>
    </div>

    <div class="content-layout">
      <!-- 图片展示区 -->
      <div class="image-section">
        <a-card title="图片预览" class="preview-card">
          <div class="image-container">
            <a-image
              :src="picture.url"
              :alt="picture.name || '图片预览'"
              class="detail-image"
            />
          </div>
        </a-card>
      </div>

      <!-- 图片信息区 -->
      <div class="info-section">
        <a-card title="图片信息" class="info-card">
          <a-descriptions :column="1" bordered>
            <a-descriptions-item label="作者">
              <a-space>
                <a-avatar :size="32" :src="picture.user?.userAvatar">
                  <template #icon><UserOutlined /></template>
                </a-avatar>
                <span>{{ picture.user?.userName || '未知用户' }}</span>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="名称">
              {{ picture.name || '未命名' }}
            </a-descriptions-item>
            <a-descriptions-item label="简介">
              {{ picture.introduction || picture.description || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="分类">
              <a-tag color="green">{{ picture.category || '默认' }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="标签">
              <a-space wrap>
                <a-tag v-for="tag in picture.tags" :key="tag" color="blue">
                  {{ tag }}
                </a-tag>
                <span v-if="!picture.tags || picture.tags.length === 0">无标签</span>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="格式">
              {{ picture.picFormat || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="尺寸">
              {{ picture.picWidth || '-' }} × {{ picture.picHeight || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="大小">
              {{ formatSize(picture.picSize) }}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <a-space wrap>
            <a-button type="primary" @click="doDownload" :loading="downloading">
              <template #icon><DownloadOutlined /></template>
              免费下载
            </a-button>
            <a-button v-if="canEdit" type="default" @click="doEdit">
              <template #icon><EditOutlined /></template>
              编辑
            </a-button>
            <a-button v-if="canDelete" danger @click="doDelete">
              <template #icon><DeleteOutlined /></template>
              删除
            </a-button>
          </a-space>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
import { getPictureVoByIdUsingGet, deletePictureUsingPost } from '@/api/wenjianchuanshu'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { getVoByIdUsingPost } from '@/api/yonghuxiangguanjiekou'
import { SPACE_PERMISSION_ENUM } from '@/constants/space'

const route = useRoute()
const router = useRouter()
const loginUserStore = useLoginUserStore()

// 数据
const picture = ref<API.PictureVO>({})
const downloading = ref(false)

// 获取图片详情
const fetchPictureDetail = async () => {
  try {
    const res = await getPictureVoByIdUsingGet({
      id: route.params.id as string,
    })
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
      // 如果 picture.value.userId 存在，则补充作者信息
      if (picture.value.userId) {
        const userRes = await getVoByIdUsingPost({ id: picture.value.userId })
        if (userRes.data.code === 0 && userRes.data.data) {
          picture.value.user = userRes.data.data
        }
      }
    } else {
      message.error('获取图片详情失败，' + res.data.message)
    }
  } catch (error) {
    console.error('获取图片详情失败:', error)
    message.error('获取图片详情失败，请重试')
  }
}

// 通用权限检查函数
function createPermissionChecker(permission: string) {
  return computed(() => {
    return (picture.value.permissionList ?? []).includes(permission)
  })
}

// 定义权限检查
const canEdit = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDelete = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)

// // 是否具有编辑权限
// const canEdit = computed(() => {
//   const loginUser = loginUserStore.loginUser
//   // 未登录不可编辑
//   if (!loginUser.id) {
//     return false
//   }
//   // 仅本人或管理员可编辑
//   const user = picture.value.user || {}
//   return loginUser.id === user.id || loginUser.userRole === 'admin'
// })

// 编辑
// 编辑
const doEdit = () => {
  router.push({
    path: '/add_picture',
    query: {
      id: picture.value.id,
      spaceId: picture.value.spaceId
    }
  })
}


// 删除
const doDelete = async () => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这张图片吗？删除后无法恢复。',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      const id = picture.value.id
      if (!id) {
        return
      }

      try {
        const res = await deletePictureUsingPost({ id })
        if (res.data.code === 0) {
          message.success('删除成功')
          router.push('/')
        } else {
          message.error('删除失败：' + res.data.message)
        }
      } catch (error) {
        console.error('删除失败:', error)
        message.error('删除失败，请重试')
      }
    }
  })

}

// 处理下载
const doDownload = async () => {
  if (!picture.value.url) {
    message.error('图片地址无效')
    return
  }

  downloading.value = true
  try {
    // 创建下载链接
    const link = document.createElement('a')
    link.href = picture.value.url
    link.download = picture.value.name || `image_${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    message.success('下载成功')
  } catch (error) {
    console.error('下载失败:', error)
    message.error('下载失败，请重试')
  } finally {
    downloading.value = false
  }
}

/**
 * 格式化文件大小
 * @param size
 */
const formatSize = (size?: number) => {
  if (!size) return '未知'
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / (1024 * 1024)).toFixed(2) + ' MB'
}

onMounted(() => {
  fetchPictureDetail()
})
</script>

<style scoped>
#pictureDetailPage {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 32px 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.page-header h1 {
  margin-bottom: 12px;
  color: #2c3e50;
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-header p {
  color: #7f8c8d;
  font-size: 16px;
  margin-bottom: 0;
  font-weight: 400;
}

.content-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.image-section {
  flex: 2;
}

.info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-card, .info-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.preview-card :deep(.ant-card-head) {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.preview-card :deep(.ant-card-head-title) {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 20px;
}

.detail-image {
  max-width: 100%;
  max-height: 600px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.info-card :deep(.ant-card-head) {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.info-card :deep(.ant-card-head-title) {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.info-card :deep(.ant-descriptions-item-label) {
  font-weight: 600;
  color: #495057;
  background: #f8f9fa;
}

.info-card :deep(.ant-descriptions-item-content) {
  color: #2c3e50;
}

.action-buttons {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 20px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-layout {
    flex-direction: column;
    gap: 20px;
  }

  .image-section, .info-section {
    width: 100%;
  }
}

@media (max-width: 768px) {
  #pictureDetailPage {
    padding: 16px;
  }

  .page-header {
    padding: 24px 16px;
    margin-bottom: 20px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .page-header p {
    font-size: 14px;
  }

  .image-container {
    min-height: 300px;
    padding: 16px;
  }

  .detail-image {
    max-height: 400px;
  }
}

@media (max-width: 480px) {
  .content-layout {
    gap: 16px;
  }

  .image-container {
    min-height: 250px;
    padding: 12px;
  }

  .detail-image {
    max-height: 300px;
  }

  .page-header h1 {
    font-size: 20px;
  }
}
</style>
