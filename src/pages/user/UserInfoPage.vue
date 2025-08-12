<!-- eslint-disable vue/valid-v-else -->
<template>
  <div id="userInfoPage">
    <!-- 个人信息概览 -->
    <div class="profile-summary">
      <div class="profile-left">
        <div class="avatar-section">
          <div class="avatar-wrapper" @click="showAvatarUpload = true">
            <a-avatar
              :src="userInfo.userAvatar"
              :size="120"
              :alt="userInfo.userName || '用户头像'"
            >
              {{ (userInfo.userName || '用户').charAt(0) }}
            </a-avatar>
            <div class="avatar-overlay">
              <CameraOutlined />
              <span>更换头像</span>
            </div>
          </div>
          <div class="vip-badge" v-if="userInfo.vipNumber !== null">
            <a-tag color="gold">VIP</a-tag>
          </div>
        </div>
        <div class="user-info">
          <div class="username">
            {{ userInfo.userName || '未设置用户名' }}
            <div v-if="userInfo.vipNumber !== null">
              <span class="user-level">至尊会员</span>
            </div>

          </div>
          <div class="user-desc">
            {{ userInfo.userProfile || '暂无个人简介' }}
          </div>
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-label">照片数量</span>
              <span class="stat-value">{{ userStats.photoNum || '--' }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">积分</span>
              <span class="stat-value">{{ userStats.points || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">获赞</span>
              <span class="stat-value">{{ userStats.likes || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">浏览</span>
              <span class="stat-value">{{ userStats.views || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">关注</span>
              <span class="stat-value">{{ userStats.following || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">粉丝</span>
              <span class="stat-value">{{ userStats.fans || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="profile-right">
        <a-button type="primary" @click="showEditModal = true">
          <EditOutlined />
          修改资料
        </a-button>
        <a-button  @click="updatePIN = true">
          <SettingTwoTone />
           修改密码
        </a-button>
        <a-button @click="handleShare">
          <ShareAltOutlined />
          分享
        </a-button>

      </div>
    </div>

    <!-- 标签页内容 -->
    <div class="content-tabs">
      <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
        <a-tab-pane key="basic" tab="基本信息">
          <div class="info-section">
            <div class="section-header">
              <h3>基本信息</h3>
              <a @click="showEditModal = true">编辑</a>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">账号：</span>
                <span class="info-value">{{ userInfo.userAccount || '暂无' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">用户名：</span>
                <span class="info-value">{{ userInfo.userName || '暂无' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">简介：</span>
                <span class="info-value">{{ userInfo.userProfile || '暂无' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">用户角色：</span>
                <span class="info-value">
                  <a-tag :color="userInfo.userRole === 'admin' ? 'green' : 'blue'">
                    {{ userInfo.userRole === 'admin' ? '管理员' : '普通用户' }}
                  </a-tag>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">创建时间：</span>
                <span class="info-value">{{ formatTime(userInfo.createTime) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">更新时间：</span>
                <span class="info-value">{{ formatTime(userInfo.updateTime) }}</span>
              </div>
            </div>
          </div>
        </a-tab-pane>

        <!-- <a-tab-pane key="learning" tab="学习信息">
          <div class="info-section">
            <div class="section-header">
              <h3>学习信息</h3>
              <a @click="showEditModal = true">编辑</a>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">学习方向：</span>
                <span class="info-value">{{ learningInfo.direction || '暂无' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">技术栈：</span>
                <span class="info-value">{{ learningInfo.techStack || '暂无' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">学习目标：</span>
                <span class="info-value">{{ learningInfo.goal || '暂无' }}</span>
              </div>
            </div>
          </div>
        </a-tab-pane> -->

        <a-tab-pane key="vip" tab="会员信息" >
          <div class="info-section" v-if="userInfo.vipNumber !== null">
            <div class="section-header">
              <h3>会员信息</h3>
            </div>
            <div class="vip-info">
              <div class="vip-card">
                <div class="vip-header">
                  <CrownOutlined class="vip-icon" />
                  <span>尊享会员</span>
                </div>
                <div class="vip-content">
                  <p>会员编号：{{ userInfo.vipNumber }}</p>
                  <p>会员等级：VIP</p>
                  <p>到期时间：{{ dayjs(userInfo.vipExpireTime).format('YYYY-MM-DD') }}</p>
                </div>
                <a-button type="primary" class="renew-btn">立即续费</a-button>
              </div>
            </div>
          </div>
          <div v-else>
            <div class="section-header">
              <h3>会员信息</h3>
            </div>
            <div class="vip-info">
              <div class="vip-card">
                <div class="vip-header">
                  <UserOutlined />
                  <span>普通用户</span>
                </div>
                <div class="vip-content">
                  <p>用户编号：{{ userInfo.id }}</p>
                  <p>会员等级：非会员</p>
                  <p>到期时间：需要氪金</p>
                </div>
                <a-button type="primary" class="renew-btn">立即开通</a-button>
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 编辑信息弹窗 -->
    <a-modal
      v-model:open="showEditModal"
      title="编辑个人信息"
      @ok="handleEditSubmit"
      @cancel="showEditModal = false"
      width="600px"
    >
      <a-form :model="editForm" layout="vertical">
        <a-form-item label="用户名">
          <a-input v-model:value="editForm.userName" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item label="个人简介">
          <a-textarea
            v-model:value="editForm.userProfile"
            placeholder="请输入个人简介"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 修改密码弹窗 -->
    <a-modal
      v-model:open="updatePIN"
      title="修改密码"
      @ok="handleEditPassword"
      @cancel="updatePIN = false"
      width="600px"
    >
      <a-form :model="passwordForm" layout="vertical">
        <a-form-item label="原密码">
          <a-input-password v-model:value="passwordForm.userPassword" placeholder="请输入原密码" />
        </a-form-item>
        <a-form-item label="新密码">
          <a-input-password v-model:value="passwordForm.newPassword" placeholder="请输入新密码" />
        </a-form-item>
        <a-form-item label="确认密码">
          <a-input-password v-model:value="passwordForm.checkPassword" placeholder="请确认密码" />
        </a-form-item>
      </a-form>
    </a-modal>


    <!-- 头像上传弹窗 -->
    <a-modal
      v-model:open="showAvatarUpload"
      title="更换头像"
      @ok="handleAvatarUpload"
      @cancel="handleAvatarCancel"
      width="600px"
      :confirm-loading="avatarUploading"
    >
      <div class="avatar-upload-content">
        <div class="current-avatar">
          <h4>当前头像</h4>
          <a-avatar
            :src="userInfo.userAvatar"
            :size="80"
            :alt="userInfo.userName || '用户头像'"
          >
            {{ (userInfo.userName || '用户').charAt(0) }}
          </a-avatar>
        </div>

        <div class="upload-section">
          <h4>选择新头像</h4>
          <a-upload
            v-model:file-list="avatarFileList"
            name="avatar"
            list-type="picture-card"
            class="avatar-uploader"
            :show-upload-list="false"
            :before-upload="beforeAvatarUpload"
            @change="handleAvatarChange"
            accept="image/*"
            :custom-request="() => {}"
          >
            <img v-if="avatarImageUrl && selectedFile" :src="avatarImageUrl" alt="avatar" />
            <div v-else>
              <loading-outlined v-if="avatarUploading"></loading-outlined>
              <plus-outlined v-else></plus-outlined>
              <div class="ant-upload-text">点击上传</div>
            </div>
          </a-upload>
          <div class="upload-tips">
            <p>支持 JPG、PNG、GIF 格式，文件大小不超过 2MB</p>
            <p v-if="selectedFile" style="color: #52c41a; margin-top: 8px;">
              已选择文件：{{ selectedFile.name }}
            </p>
          </div>
        </div>

        <!-- 头像裁剪区域 -->
        <div v-if="selectedFile && avatarImageUrl" class="crop-section">
          <h4>调整头像显示区域</h4>
          <div class="crop-container">
            <div class="crop-area">
              <img
                :src="avatarImageUrl"
                ref="cropImage"
                @load="initCrop"
                style="max-width: 100%; max-height: 300px;"
              />
            </div>
            <div class="crop-controls">
              <div class="control-item">
                <label>缩放：</label>
                <a-slider
                  v-model:value="cropScale"
                  :min="0.5"
                  :max="3"
                  :step="0.1"
                  @change="updateCrop"
                  style="width: 150px;"
                />
                <span>{{ cropScale.toFixed(1) }}x</span>
              </div>
              <div class="control-item">
                <label>旋转：</label>
                <a-slider
                  v-model:value="cropRotation"
                  :min="-180"
                  :max="180"
                  :step="15"
                  @change="updateCrop"
                  style="width: 150px;"
                />
                <span>{{ cropRotation }}°</span>
              </div>
              <div class="control-buttons">
                <a-button @click="resetCrop" size="small">重置</a-button>
                <a-button @click="previewCrop" type="primary" size="small">预览</a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 预览区域 -->
        <div v-if="showPreview" class="preview-section">
          <h4>预览效果</h4>
          <div class="preview-avatars">
            <div class="preview-item">
              <span>大尺寸 (120px)</span>
              <a-avatar :src="croppedImageUrl" :size="120" />
            </div>
            <div class="preview-item">
              <span>中尺寸 (80px)</span>
              <a-avatar :src="croppedImageUrl" :size="80" />
            </div>
            <div class="preview-item">
              <span>小尺寸 (40px)</span>
              <a-avatar :src="croppedImageUrl" :size="40" />
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import {
  EditOutlined,
  ShareAltOutlined,
  CrownOutlined,
  SettingTwoTone,
  UserOutlined,
  CameraOutlined,
  PlusOutlined,
  LoadingOutlined,
} from '@ant-design/icons-vue'
import {
  getLoginUserUsingGet,
  updatePasswordUsingPost,
  updateUserUsingPost,
  userLogoutUsingPost
} from '@/api/yonghuxiangguanjiekou'
import { uploadPictureUsingPost } from '@/api/wenjianchuanshu'
import dayjs from 'dayjs'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import router from '@/router'

// 用户信息
const userInfo = ref({
  id: '',
  userAccount: '',
  userName: '',
  userProfile: '',
  userAvatar: '',
  userRole: '',
  createTime: '',
  updateTime: '',
  vipCode: '',
  vipExpireTime: '',
  vipNumber: '',
})

// 用户统计数据
const userStats = ref({
  photoNum: 0,
  points: 0,
  likes: 0,
  views: 0,
  following: 0,
  fans: 0
})


// 编辑表单
const editForm = reactive({
  userName: '',
  userProfile: '',
  direction: '',
  techStack: '',
  goal: ''
})

//密码修改
const handleEditPassword = async () => {
  if (passwordForm.newPassword !== passwordForm.checkPassword) {
    message.error('新密码和确认密码不一致')
    return
  }
  try {
    const res = await updatePasswordUsingPost({
      userPassword: passwordForm.userPassword,
      newPassword: passwordForm.newPassword,
      checkPassword: passwordForm.checkPassword
    })
    if (res.data.code === 0) {
      message.success('密码更新成功，请重新登录')
      updatePIN.value = false
      //刷新页面
      await userLogoutUsingPost()
      // 清除用户信息，跳转到登录页
      await router.push('/user/login')
      window.location.reload()
    } else {
      message.error('密码更新失败：' + res.data.message)
    }
  } catch (error) {
    message.error('密码更新失败')
  }
}
const passwordForm = reactive({
  userPassword: '',
  newPassword: '',
  checkPassword: ''
})

// 状态
const activeTab = ref('basic')
const showEditModal = ref(false)
const updatePIN = ref(false)
const showAvatarUpload = ref(false)

// 头像上传相关
const avatarFileList = ref([])
const avatarImageUrl = ref('')
const avatarUploading = ref(false)
const selectedFile = ref(null)

// 裁剪相关
const cropImage = ref(null)
const cropScale = ref(1)
const cropRotation = ref(0)
const showPreview = ref(false)
const croppedImageUrl = ref('')
const cropperInstance = ref(null)

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const res = await getLoginUserUsingGet()
    if (res.data.code === 0 && res.data.data) {
      userInfo.value = res.data.data
      // 初始化编辑表单
      editForm.userName = userInfo.value.userName || ''
      editForm.userProfile = userInfo.value.userProfile || ''
      // 初始化头像预览
      avatarImageUrl.value = userInfo.value.userAvatar
    }
  } catch (error) {
    message.error('获取用户信息失败')
  }
}

// 提交编辑
const handleEditSubmit = async () => {
  try {
    const res = await updateUserUsingPost({
      id: userInfo.value.id,
      userName: editForm.userName,
      userProfile: editForm.userProfile
    })
    if (res.data.code === 0) {
      message.success('更新成功')
      showEditModal.value = false
      await fetchUserInfo()
    } else {
      message.error('更新失败：' + res.data.message)
    }
  } catch (error) {
    message.error('更新失败')
  }
}

// 标签页切换
const handleTabChange = (key: string) => {
  activeTab.value = key
}

// 分享功能
const handleShare = () => {
  // 复制链接到剪贴板
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    message.success('链接已复制到剪贴板')
  })
}

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return '暂无'
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 头像上传前检查
const beforeAvatarUpload = (file: any) => {
  const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPGOrPNG) {
    message.error('头像只能是 JPG、PNG 或 GIF 格式!')
    return false
  }
  if (!isLt2M) {
    message.error('头像大小不能超过 2MB!')
    return false
  }

  // 保存选中的文件
  selectedFile.value = file
  return false // 阻止自动上传
}

// 处理头像选择
const handleAvatarChange = (info: any) => {
  if (info.file && selectedFile.value) {
    // 创建预览URL
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarImageUrl.value = e.target.result as string
      // 初始化裁剪器
      nextTick(() => {
        initCrop()
      })
    }
    reader.readAsDataURL(selectedFile.value)
  }
}

// 初始化裁剪器
const initCrop = () => {
  if (cropImage.value && avatarImageUrl.value) {
    // 销毁之前的裁剪器实例
    if (cropperInstance.value) {
      cropperInstance.value.destroy()
    }

    // 创建新的裁剪器实例
    cropperInstance.value = new Cropper(cropImage.value, {
      aspectRatio: 1, // 保持正方形
      viewMode: 1,
      background: false,
      autoCropArea: 0.8,
      movable: true,
      zoomable: true,
      rotatable: true,
      scalable: true,
      minContainerWidth: 200,
      minContainerHeight: 200,
      minCanvasWidth: 100,
      minCanvasHeight: 100,
      ready: () => {
        // 初始化缩放和旋转
        const imageData = cropperInstance.value.getImageData()
        cropScale.value = imageData.scaleX || 1
        cropRotation.value = imageData.rotate || 0
      }
    })
  }
}

// 更新裁剪器
const updateCrop = () => {
  if (cropperInstance.value) {
    cropperInstance.value.zoomTo(cropScale.value)
    cropperInstance.value.rotateTo(cropRotation.value)
  }
}

// 重置裁剪器
const resetCrop = () => {
  cropScale.value = 1
  cropRotation.value = 0
  if (cropperInstance.value) {
    cropperInstance.value.reset()
  }
}

// 预览裁剪结果
const previewCrop = () => {
  if (cropperInstance.value) {
    try {
      // 获取裁剪后的图片数据
      const canvas = cropperInstance.value.getCroppedCanvas({
        width: 200,
        height: 200,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      })

      croppedImageUrl.value = canvas.toDataURL('image/jpeg', 0.9)
      showPreview.value = true
      message.success('预览生成成功')
    } catch (error) {
      console.error('生成预览失败:', error)
      message.error('生成预览失败，请重试')
    }
  }
}

// 处理头像上传
const handleAvatarUpload = async () => {
  if (!selectedFile.value) {
    message.error('请先选择要上传的头像')
    return
  }

  avatarUploading.value = true
  try {
    let fileToUpload = selectedFile.value

    // 如果用户进行了裁剪，使用裁剪后的图片
    if (croppedImageUrl.value && showPreview.value) {
      // 将base64转换为文件
      const response = await fetch(croppedImageUrl.value)
      const blob = await response.blob()
      fileToUpload = new File([blob], selectedFile.value.name, {
        type: 'image/jpeg'
      })
    }

    // 1. 创建FormData对象
    const formData = new FormData();

    // 2. 添加文件（键名"file"需与后端@RequestPart("file")一致）
    formData.append("file", fileToUpload);

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
      {} // 若函数封装要求，可留空
    );

    if (res.data.code === 0 && res.data.data) {
      // 更新用户头像
      const updateRes = await updateUserUsingPost({
        id: userInfo.value.id,
        userAvatar: res.data.data.url
      })

      if (updateRes.data.code === 0) {
        message.success('头像更新成功')
        await fetchUserInfo() // 刷新用户信息
        showAvatarUpload.value = false
        selectedFile.value = null
        avatarImageUrl.value = userInfo.value.userAvatar
        showPreview.value = false
        croppedImageUrl.value = ''

        // 销毁裁剪器实例
        if (cropperInstance.value) {
          cropperInstance.value.destroy()
          cropperInstance.value = null
        }
      } else {
        message.error('头像更新失败：' + updateRes.data.message)
      }
    } else {
      message.error('头像上传失败：' + res.data.message)
    }
  } catch (error) {
    console.error('头像上传失败:', error)
    message.error('头像上传失败，请重试')
  } finally {
    avatarUploading.value = false
  }
}

// 处理头像取消
const handleAvatarCancel = () => {
  selectedFile.value = null
  avatarImageUrl.value = userInfo.value.userAvatar
  showPreview.value = false
  croppedImageUrl.value = ''
  showAvatarUpload.value = false

  // 销毁裁剪器实例
  if (cropperInstance.value) {
    cropperInstance.value.destroy()
    cropperInstance.value = null
  }
}

// 页面加载
onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
#userInfoPage {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.profile-summary {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
}

.profile-left {
  display: flex;
  align-items: flex-start;
  gap: 32px;
}

.avatar-section {
  position: relative;
}

.avatar-wrapper {
  cursor: pointer;
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e0e0e0;
}

.avatar-wrapper:hover {
  border-color: #1890ff;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  font-size: 14px;
  gap: 8px;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay i {
  font-size: 24px;
}

/* 头像上传样式 */
.avatar-upload-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.current-avatar {
  text-align: center;
}

.current-avatar h4 {
  margin-bottom: 12px;
  color: #333;
}

.upload-section h4 {
  margin-bottom: 12px;
  color: #333;
}

.avatar-uploader {
  text-align: center;
}

.avatar-uploader :deep(.ant-upload) {
  width: 100px !important;
  height: 100px !important;
  border-radius: 50% !important;
}

.avatar-uploader :deep(.ant-upload-select-picture-card) {
  width: 100px !important;
  height: 100px !important;
  border-radius: 50% !important;
}

.upload-tips {
  margin-top: 12px;
  text-align: center;
}

.upload-tips p {
  color: #666;
  font-size: 12px;
  margin: 0;
}

.vip-badge {
  position: absolute;
  top: -8px;
  right: -8px;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-level {
  background: #1890ff;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.user-desc {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.user-stats {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  color: #1890ff;
}

.profile-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content-tabs {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-section {
  padding: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  margin-left: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.section-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.section-header a {
  color: #1890ff;
  cursor: pointer;
  font-size: 14px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.info-label {
  font-weight: bold;
  color: #333;
  min-width: 90px;
  font-size: 14px;
}

.info-value {
  color: #666;
  flex: 1;
  font-size: 14px;
}

.vip-info {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.vip-card {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  padding: 32px;
  border-radius: 16px;
  text-align: center;
  min-width: 320px;
  box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);
}

.vip-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.vip-icon {
  font-size: 28px;
  color: #ff6b35;
}

.vip-content {
  margin-bottom: 20px;
}

.vip-content p {
  margin: 12px 0;
  color: #333;
  font-size: 14px;
}

.renew-btn {
  background: #ff6b35;
  border-color: #ff6b35;
  height: 40px;
  font-size: 14px;
}

.renew-btn:hover {
  background: #ff5722;
  border-color: #ff5722;
}

/* 裁剪区域样式 */
.crop-section {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.crop-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.crop-area {
  width: 100%;
  max-width: 400px;
  height: 300px;
  overflow: hidden;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.crop-area img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.crop-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 400px;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.control-item label {
  font-size: 14px;
  color: #495057;
  font-weight: 500;
  min-width: 60px;
}

.control-item span {
  font-size: 12px;
  color: #6c757d;
  min-width: 40px;
  text-align: right;
}

.control-buttons {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.control-buttons .ant-btn {
  border-radius: 6px;
  font-size: 13px;
  height: 32px;
  padding: 0 16px;
}

/* 预览区域样式 */
.preview-section {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.preview-section h4 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #495057;
  font-size: 16px;
  font-weight: 600;
}

.preview-avatars {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.preview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  min-width: 100px;
}

.preview-item span {
  font-size: 12px;
  color: #6c757d;
  text-align: center;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .crop-area {
    height: 250px;
  }

  .control-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .control-item label {
    min-width: auto;
  }

  .preview-avatars {
    gap: 16px;
  }

  .preview-item {
    min-width: 80px;
  }
}
</style>
