<template>
  <div id="addPicturePage">
    <div class="page-header">
      <h1>{{ route.query?.id ? '编辑图片' : '创建图片' }}</h1>
      <p>{{ route.query?.id ? '修改图片信息和标签' : '上传新图片并添加信息' }}</p>
    </div>

    <div class="content-layout">
      <!-- 上传方式切换 -->
      <div style="margin-bottom: 16px;">
        <a-radio-group v-model:value="uploadType">
          <a-radio value="local">本地上传</a-radio>
          <a-radio value="url">URL上传</a-radio>
        </a-radio-group>
      </div>
      <!-- 图片上传区域 - 占满宽度 -->
      <div class="upload-section">
        <h3>图片上传</h3>
        <template v-if="uploadType === 'local'">
          <UploadPicture
            :onChange="onPictureChange"
            :picture="picture"
          />
        </template>
        <template v-else>
          <!-- 这里后续替换为你的URL上传组件 -->
            <UrlPictureUpload
              :onChange="onPictureChange"
              :picture="picture"
            />
        </template>
      </div>

      <!-- 图片预览区域 - 只在有图片时显示 -->
      <div v-if="picture?.url" class="preview-section">
        <h3>图片预览</h3>
        <div class="image-preview-container">
          <img
            :src="picture.url"
            :alt="picture.name || '图片预览'"
            class="preview-image"
          />
          <div class="image-info">
            <p><strong>图片名称：</strong>{{ picture.name || '未设置' }}</p>
            <p><strong>图片格式：</strong>{{ picture.picFormat || '未知' }}</p>
            <p><strong>图片尺寸：</strong>{{ picture.picWidth || '未知' }} × {{ picture.picHeight || '未知' }}</p>
            <p><strong>文件大小：</strong>{{ formatFileSize(picture.picSize) }}</p>
          </div>
        </div>
      </div>

      <!-- 图片信息表单 - 只在有图片时显示 -->
      <div v-if="picture?.url" class="form-section">
        <h3>图片信息</h3>
        <a-form
          :model="pictureForm"
          @finish="handleSubmit"
          layout="vertical"
        >
          <a-form-item label="图片名称" name="name">
            <a-input
              v-model:value="pictureForm.name"
              placeholder="请输入图片名称"
              :maxlength="50"
              show-count
            />
          </a-form-item>

          <a-form-item label="图片描述" name="introduction">
            <a-textarea
              v-model:value="pictureForm.introduction"
              placeholder="请输入图片描述"
              :rows="4"
              :maxlength="500"
              show-count
            />
          </a-form-item>

          <a-form-item label="图片分类" name="category">
            <a-select
              v-model:value="pictureForm.category"
              placeholder="请选择图片分类"
              :options="categoryOptions"
              allow-clear
            />
          </a-form-item>

          <a-form-item label="图片标签" name="tags">
            <a-select
              v-model:value="pictureForm.tags"
              placeholder="请选择或输入标签"
              :options="tagOptions"
              mode="tags"
              allow-clear
            />
          </a-form-item>

          <a-form-item>
            <a-button type="primary" html-type="submit" :loading="submitting">
              {{ route.query?.id ? '更新图片' : '创建图片' }}
            </a-button>
            <a-button @click="router.back()" style="margin-left: 8px;">
              取消
            </a-button>
          </a-form-item>
        </a-form>
      </div>

      <!-- 未上传图片时的提示 -->
      <div v-else class="upload-tip">
        <div class="tip-content">
          <PlusOutlined class="tip-icon" />
          <p>请先上传图片，然后填写相关信息</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import UploadPicture from '@/components/UploadPicture.vue'
import {
  editPictureUsingPost,
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet
} from '@/api/wenjianchuanshu'
import UrlPictureUpload from '@/components/UrlPictureUpload.vue'

const router = useRouter()
const route = useRoute()

// 定义响应式数据
const picture = ref<API.PictureVO | undefined>(undefined)
const pictureForm = reactive<API.PictureEditRequest>({})
const submitting = ref(false)
const uploadType = ref<'local' | 'url'>('local')

// 图片变化回调
const onPictureChange = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  pictureForm.name = newPicture.name
  pictureForm.introduction = newPicture.introduction
  pictureForm.category = newPicture.category
  pictureForm.tags = newPicture.tags
  // message.success('图片上传成功')
}

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: API.PictureVO) => {
  // 检查是否已上传图片
  if (!picture.value?.id) {
    message.error('请先上传图片')
    return
  }

  const isEdit = route.query?.id // 判断是否为编辑模式
  submitting.value = true

  try {
    let res
    // 显式携带 userId 字段
    res = await editPictureUsingPost({
      id: picture.value.id,
      userId: picture.value.userId, // 新增此行
      ...values,
    })

    if (res.data.code === 0 && res.data.data) {
      message.success(isEdit ? '更新成功' : '创建成功')
      // 跳转到图片管理页面
      router.push('/')
    } else {
      message.error((isEdit ? '更新' : '创建') + '失败，' + res.data.message)
    }
  } catch (error) {
    console.error('提交失败:', error)
    message.error((isEdit ? '更新' : '创建') + '失败，请重试')
  } finally {
    submitting.value = false
  }
}

const categoryOptions = ref<any[]>([])
const tagOptions = ref<any[]>([])

// 获取标签和分类选项
const getTagCategoryOptions = async () => {
  try {
    const res = await listPictureTagCategoryUsingGet()
    if (res.data.code === 0 && res.data.data) {
      tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => ({
        value: data,
        label: data,
      }))
      categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => ({
        value: data,
        label: data,
      }))
    } else {
      message.error('加载选项失败，' + res.data.message)
    }
  } catch (error) {
    message.error('加载选项失败')
    console.error('获取标签和分类失败:', error)
  }
}

// 获取老数据
const getOldPicture = async () => {
  const id = route.query?.id
  if (id) {
    try {
      const res = await getPictureVoByIdUsingGet({
        id: id as string,
      })
      if (res.data.code === 0 && res.data.data) {
        const data = res.data.data
        picture.value = data
        pictureForm.name = data.name
        pictureForm.introduction = data.introduction
        pictureForm.category = data.category
        pictureForm.tags = data.tags
      }
    } catch (error) {
      message.error('获取图片信息失败')
    }
  }
}

// 格式化文件大小
const formatFileSize = (size: number) => {
  if (!size) return '未知'
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  }
}

onMounted(() => {
  getTagCategoryOptions()
  getOldPicture()
})
</script>

<style scoped>
#addPicturePage {
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
  flex-direction: column;
  gap: 24px;
  align-items: stretch;
}

.upload-section, .preview-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  padding: 24px;
  width: 100%;
}

.form-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  padding: 24px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.upload-section h3, .form-section h3, .preview-section h3 {
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 12px;
}

.image-preview-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  object-fit: contain;
  border: 1px solid #ecf0f1;
}

.image-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #3498db;
  width: 100%;
  max-width: 600px;
}

.image-info p {
  margin: 8px 0;
  color: #2c3e50;
  font-size: 14px;
  line-height: 1.6;
}

.image-info p:first-child {
  margin-top: 0;
}

.image-info p:last-child {
  margin-bottom: 0;
}

.image-info strong {
  color: #34495e;
  font-weight: 600;
}

.upload-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px dashed #dee2e6;
  border-radius: 12px;
  text-align: center;
  min-height: 200px;
}

.tip-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.tip-icon {
  font-size: 64px;
  opacity: 0.5;
  color: #3498db;
}

.tip-content p {
  color: #6c757d;
  font-size: 16px;
  margin: 0;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  #addPicturePage {
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

  .upload-section, .form-section, .preview-section {

    padding: 16px;
  }

  .preview-image {
    max-height: 200px;
  }

  .image-info {
    padding: 12px;
  }

  .upload-tip {
    padding: 40px 16px;
    min-height: 150px;
  }

  .tip-icon {
    font-size: 48px;
  }
}

@media (max-width: 480px) {
  .content-layout {
    gap: 16px;
  }

  .upload-section, .form-section, .preview-section {
    padding: 12px;
  }

  .preview-image {
    max-height: 150px;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .upload-section h3, .form-section h3, .preview-section h3 {
    font-size: 18px;
  }
}
</style>
