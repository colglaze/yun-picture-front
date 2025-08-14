<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { uploadPictureByUrlUsingPost } from '@/api/wenjianchuanshu'

const props = defineProps<{
  picture?: API.PictureVO
  onChange?: (picture: API.PictureVO) => void
}>()

const loading = ref<boolean>(false)
const fileUrl = ref<string>()
const picName = ref<string>() // 新增图片名称
const spaceId = ref<number>() // 新增空间ID

/**
 * 上传
 */
const handleUpload = async () => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = {
      fileUrl: fileUrl.value,
      picName: picName.value, // 新增
      spaceId: spaceId.value, // 新增
    }

    if (props.picture) {
      params.id = props.picture.id
    }
    const res = await uploadPictureByUrlUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      // 将上传成功的图片信息传递给父组件
      props.onChange?.(res.data.data)
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    message.error('图片上传失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="url-picture-upload">
    <a-input-group compact style="margin-bottom: 16px">
      <a-input
        v-model:value="fileUrl"
        style="width: calc(100% - 120px)"
        placeholder="请输入图片 URL"
      />
      <a-button type="primary" :loading="loading" @click="handleUpload" style="width: 120px"
        >提交</a-button
      >
    </a-input-group>
    <img v-if="picture?.url" :src="picture?.url" alt="avatar" />
  </div>
</template>

<style scoped></style>
