<template>
  <a-modal
    class="image-out-painting"
    v-model:open="visible"
    title="AI 扩图"
    :footer="false"
    @cancel="closeModal"
  >

    <a-row gutter="16">
      <a-col span="12">
        <h4>原始图片</h4>
        <img :src="picture?.url" :alt="picture?.name" style="max-width: 100%" />
      </a-col>
      <a-col span="12">
        <h4>扩图结果</h4>
        <img
          v-if="resultImageUrl"
          :src="resultImageUrl"
          :alt="picture?.name"
          style="max-width: 100%"
        />
      </a-col>
    </a-row>
    <div style="margin-bottom: 16px" />
    <a-flex gap="16" justify="center">
      <a-button type="primary" :loading="!!taskId" ghost
                @click="createTask">
        生成图片
      </a-button>

      <a-button type="primary" v-if="resultImageUrl"
                :loading="uploadLoading"
                @click="handleUpload">
        应用结果
      </a-button>

    </a-flex>


  </a-modal>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { createPictureOutPaintingTaskUsingPost, getPictureOutPaintingTaskUsingGet, uploadPictureByUrlUsingPost } from '@/api/wenjianchuanshu'

interface Props {
  picture?: API.PictureVO
  spaceId?: number
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()
const resultImageUrl = ref<string>()
const taskId = ref<string>()
let pollingTimer: number | null = null


/**
 * 创建任务
 */
const createTask = async () => {
  if (!props.picture?.id) {
    return
  }
  const res = await createPictureOutPaintingTaskUsingPost({
    pictureId: props.picture.id,
    // 可以根据需要设置扩图参数
    parameters: {
      xScale: 2,
      yScale: 2,
    },
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('创建任务成功，请耐心等待，不要退出界面')
    console.log(res.data.data.output.taskId)
    taskId.value = res.data.data.output.taskId
    // 开启轮询
    startPolling()
  } else {
    message.error('创建任务失败，' + res.data.message)
  }
}

/**
 * 开始轮询任务状态
 */
const startPolling = () => {
  // 如果已有轮询在进行，则先清除
  if (pollingTimer) {
    clearInterval(pollingTimer)
  }
  
  // 设置新的轮询
  pollingTimer = window.setInterval(async () => {
    if (!taskId.value) return
    
    try {
      const res = await getPictureOutPaintingTaskUsingGet({
        taskId: taskId.value
      })
      
      if (res.data.code === 0 && res.data.data) {
        const taskData = res.data.data
        // 检查任务状态
        if (taskData.output && taskData.output.taskStatus === 'SUCCEEDED') {
          // 任务完成，获取结果URL
          if (taskData.output.outputImageUrl) {
            resultImageUrl.value = taskData.output.outputImageUrl
            // 停止轮询
            if (pollingTimer) {
              clearInterval(pollingTimer)
              pollingTimer = null
            }
            message.success('图片扩图完成')
          }
        } else if (taskData.output && taskData.output.taskStatus === 'FAILED') {
          // 任务失败
          if (pollingTimer) {
            clearInterval(pollingTimer)
            pollingTimer = null
          }
          message.error('图片扩图失败: ' + (taskData.output.message || '未知错误'))
        }
        // 如果状态为RUNNING（进行中），则继续轮询
      }
    } catch (error) {
      console.error('轮询任务状态失败:', error)
      message.error('查询任务状态失败')
    }
  }, 3000) // 每3秒查询一次
}

const uploadLoading = ref<boolean>(false)

const handleUpload = async () => {
  uploadLoading.value = true
  try {
    const params: API.PictureUploadRequest = {
      fileUrl: resultImageUrl.value,
      spaceId: props.spaceId,
    }
    if (props.picture) {
      params.id = props.picture.id
    }
    const res = await uploadPictureByUrlUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
      // 关闭弹窗
      closeModal()
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    message.error('图片上传失败')
  } finally {
    uploadLoading.value = false
  }
}


// 是否可见
const visible = ref(false)

// 打开弹窗
const openModal = () => {
  visible.value = true
}

// 关闭弹窗
const closeModal = () => {
  visible.value = false
  // 清理轮询定时器
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
  // 清理结果图片URL和任务ID
  resultImageUrl.value = undefined
  taskId.value = undefined
}

// 组件卸载时清理轮询定时器
onUnmounted(() => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
})

// 暴露函数给父组件
defineExpose({
  openModal,
})
</script>

<style scoped>
.image-out-painting {
  text-align: center;
}
</style>
