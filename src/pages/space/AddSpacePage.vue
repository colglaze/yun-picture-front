<script setup lang="ts">

import { SPACE_LEVEL_ENUM, SPACE_LEVEL_OPTIONS } from '@/constants/space'
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import router from '@/router'
import {
  createSpaceUsingPost,
  getSpaceVoByIdUsingGet,
  listSpaceLevelUsingGet,
  updateSpaceUsingDelete
} from '@/api/kongjianguanli'
import { useRoute } from 'vue-router'

const formData = reactive<API.SpaceAddRequest | API.SpaceUpdateRequest>({
  spaceName: '',
  spaceLevel: SPACE_LEVEL_ENUM.COMMON,
})
const loading = ref(false)

const handleSubmit = async (values: any) => {
  const spaceId = oldSpace.value?.id
  loading.value = true
  let res
  // 更新
  if (spaceId) {
    res = await updateSpaceUsingDelete({
      id: spaceId,
      ...formData,
    })
  } else {
    // 创建
    res = await createSpaceUsingPost({
      ...formData,
    })
  }
  if (res.data.code === 0 && res.data.data) {
    message.success('操作成功')
    let path = `/space/${spaceId ?? res.data.data}`
    router.push({
      path,
    })
  } else {
    message.error('操作失败，' + res.data.message)
  }
  loading.value = false
}

const spaceLevelList = ref<API.SpaceLevel[]>([])

// 获取空间级别
const fetchSpaceLevelList = async () => {
  const res = await listSpaceLevelUsingGet()
  if (res.data.code === 0 && res.data.data) {
    spaceLevelList.value = res.data.data
  } else {
    message.error('加载空间级别失败，' + res.data.message)
  }
}

const route = useRoute()
const oldSpace = ref<API.SpaceVO>()

// 获取老数据
const getOldSpace = async () => {
  // 获取数据
  const id = route.query?.id
  if (id) {
    const res = await getSpaceVoByIdUsingGet({
      id: id,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      oldSpace.value = data
      formData.spaceName = data.spaceName
      formData.spaceLevel = data.spaceLevel
    }
  }
}

function formatSize(size: number) {
  if (!size) return '0B'
  if (size < 1024) return size + 'B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + 'KB'
  if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(2) + 'MB'
  return (size / 1024 / 1024 / 1024).toFixed(2) + 'GB'
}

// 页面加载时，请求老数据和空间级别
onMounted(async () => {
  await Promise.all([
    fetchSpaceLevelList(),
    getOldSpace()
  ])
})

const showWeixin = ref(false)

</script>

<template>
  <div class="add-space-page-wrapper" >
    <a-form layout="vertical" :model="formData" @finish="handleSubmit">
      <a-form-item label="空间名称" name="spaceName">
        <a-input v-model:value="formData.spaceName" placeholder="请输入空间名称" allow-clear />
      </a-form-item>
      <a-form-item label="空间级别" name="spaceLevel">
        <a-select
          v-model:value="formData.spaceLevel"
          :options="SPACE_LEVEL_OPTIONS"
          placeholder="请输入空间级别"
          style="min-width: 180px"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading">
          提交
        </a-button>
      </a-form-item>
    </a-form>

    <a-card title="空间级别介绍">
      <a-typography-paragraph>
        * 目前仅支持开通普通版，如需升级空间，请联系
        <a @click="showWeixin = true" style="cursor:pointer;color:#1677ff;">风间琉璃</a>。
      </a-typography-paragraph>
      <a-typography-paragraph v-for="spaceLevel in spaceLevelList">
        {{ spaceLevel.text }}： 大小 {{ formatSize(spaceLevel.maxSize) }}， 数量
        {{ spaceLevel.maxCount }}
      </a-typography-paragraph>
    </a-card>
    <a-modal v-model:visible="showWeixin" title="微信二维码" footer="子衿云图库">
      <img src="/src/assets/weixin.jpg" alt="微信二维码" style="width:100%;max-width:320px;display:block;margin:0 auto;" />
    </a-modal>
  </div>


</template>

<style scoped>
.add-space-page-wrapper {
  width: 600px;
  margin: 0 auto;
}
</style>
