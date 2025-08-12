<template>
  <div class="picture-upload">
    <a-upload
      list-type="picture-card"
      :custom-request="handleUpload"
      :show-upload-list="false"
      :before-upload="beforeUpload"
    >
      <img v-if="picture?.url" :src="picture?.url" alt="avatar" />
      <div v-else>
        <loading-outlined v-if="loading"></loading-outlined>
        <plus-outlined v-else></plus-outlined>
        <div class="ant-upload-text">点击或拖拽上传图片</div>
      </div>
    </a-upload>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { UploadProps } from 'ant-design-vue'
import { uploadPictureUsingPost } from '@/api/wenjianchuanshu'

interface Props {
  picture?: API.PictureVO
  onChange?: (picture: API.PictureVO) => void
}

const props = defineProps<Props>()

const loading = ref<boolean>(false)
const imageUrl = ref<string>('')

/**
 * 处理文件上传
 * @param options
 */
const handleUpload = async (options: any) => {
  const { file, onSuccess, onError } = options

  loading.value = true

  try {
    // 1. 创建FormData对象
    const formData = new FormData();

    // 3. 添加PictureUploadRequest的业务参数（键名需与后端实体类字段名一致）
    // 假设PictureUploadRequest有name、type、description等字段
    formData.append("id", "图片id");
    formData.append("fileUrl", "图片地址");
    formData.append("picName", "图片名称");
    formData.append("spaceId","空间id")

    // 4. 发送请求（无需手动设置Content-Type，浏览器会自动处理）
    const res = await uploadPictureUsingPost(
      {}, // 路径参数（若有）
      formData, // 请求体：FormData对象
      file,
      {} // 若函数封装要求，可留空
    );

    if (res.data.code === 0 && res.data.data) {
      const uploadedPicture = res.data.data

      // 触发onChange回调
      if (props.onChange) {
        props.onChange(uploadedPicture)
      }

      // 更新本地状态
      imageUrl.value = uploadedPicture.url

      onSuccess(res.data)
      message.success('图片上传成功')
    } else {
      onError(new Error(res.data.message || '上传失败'))
      message.error('上传失败：' + res.data.message)
    }
  } catch (error) {
    console.error('上传图片失败:', error)
    onError(error)
    message.error('上传失败，请重试')
  } finally {
    loading.value = false
  }
}

/**
 * 上传文件之前校验
 * @param file
 */
const beforeUpload = (file: UploadProps['fileList'][number]) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/webp'
  if (!isJpgOrPng) {
    message.error('只支持 JPG、PNG、GIF、WebP 格式的图片!')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    message.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}
</script>
<style scoped>
.picture-upload {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  width: 100%;
}

.picture-upload :deep(.ant-upload) {
  width: 100% !important;
  height: 300px !important;
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.picture-upload :deep(.ant-upload:hover) {
  border-color: #3498db;
  box-shadow: 0 8px 25px rgba(52, 152, 219, 0.15);
  transform: translateY(-2px);
}

.picture-upload :deep(.ant-upload-select-picture-card) {
  width: 100% !important;
  height: 100% !important;
  border: none;
  background: transparent;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* 水印效果 */
.picture-upload :deep(.ant-upload-select-picture-card)::before {
  content: "1856640366775734274";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 20px,
    rgba(0, 0, 0, 0.02) 20px,
    rgba(0, 0, 0, 0.02) 40px
  );
  font-size: 12px;
  color: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
}

.picture-upload :deep(.ant-upload-select-picture-card i) {
  font-size: 48px;
  color: #3498db;
  margin-bottom: 16px;
  z-index: 2;
  position: relative;
  transition: all 0.3s ease;
}

.picture-upload :deep(.ant-upload-select-picture-card:hover i) {
  transform: scale(1.1);
  color: #2980b9;
}

.picture-upload :deep(.ant-upload-select-picture-card .ant-upload-text) {
  margin-top: 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 500;
  z-index: 2;
  position: relative;
  text-align: center;
  line-height: 1.5;
}

/* 水印 */
.picture-upload :deep(.ant-upload-select-picture-card)::after {
  content: "子衿云图库";
  position: absolute;
  bottom: 16px;
  right: 16px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.1);
  z-index: 2;
  font-weight: 400;
}

.picture-upload :deep(.ant-upload-select-picture-card img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
  z-index: 2;
  position: relative;
}

/* 加载状态 */
.picture-upload :deep(.ant-upload-select-picture-card .anticon-loading) {
  font-size: 48px;
  color: #3498db;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .picture-upload {
    min-height: 250px;
  }

  .picture-upload :deep(.ant-upload) {
    height: 250px !important;
  }

  .picture-upload :deep(.ant-upload-select-picture-card i) {
    font-size: 40px;
  }

  .picture-upload :deep(.ant-upload-select-picture-card .ant-upload-text) {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .picture-upload {
    min-height: 200px;
  }

  .picture-upload :deep(.ant-upload) {
    height: 200px !important;
  }

  .picture-upload :deep(.ant-upload-select-picture-card i) {
    font-size: 36px;
  }

  .picture-upload :deep(.ant-upload-select-picture-card .ant-upload-text) {
    font-size: 13px;
  }
}
</style>
