<template>
  <div id="userInfoPage">
    <!-- 个人信息概览 -->
    <div class="profile-summary">
      <div class="profile-left">
        <div class="avatar-section">
          <a-avatar 
            :src="userInfo.userAvatar" 
            :size="120" 
            :alt="userInfo.userName || '用户头像'"
          >
            {{ (userInfo.userName || '用户').charAt(0) }}
          </a-avatar>
          <div class="vip-badge" v-if="userInfo.userRole === 'admin'">
          
            <a-tag color="gold">VIP</a-tag>
          </div>
        </div>
        <div class="user-info">
          <div class="username">
            {{ userInfo.userName || '未设置用户名' }}
            <span class="user-level">V1</span>
          </div>
          <div class="user-desc">
            {{ userInfo.userProfile || '暂无个人简介' }}
          </div>
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-label">排名</span>
              <span class="stat-value">{{ userStats.rank || '--' }}</span>
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
        
        <a-tab-pane key="learning" tab="学习信息">
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
        </a-tab-pane>

        <a-tab-pane key="vip" tab="会员信息" v-if="userInfo.userRole === 'admin'">
          <div class="info-section">
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
                  <p>会员编号：{{ userInfo.id }}</p>
                  <p>会员等级：VIP</p>
                  <p>到期时间：2025-12-05</p>
                </div>
                <a-button type="primary" class="renew-btn">立即续费</a-button>
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
        <a-form-item label="学习方向">
          <a-input v-model:value="editForm.direction" placeholder="请输入学习方向" />
        </a-form-item>
        <a-form-item label="技术栈">
          <a-input v-model:value="editForm.techStack" placeholder="请输入技术栈" />
        </a-form-item>
        <a-form-item label="学习目标">
          <a-textarea 
            v-model:value="editForm.goal" 
            placeholder="请输入学习目标"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { 
  EditOutlined, 
  ShareAltOutlined, 
  CrownOutlined 
} from '@ant-design/icons-vue'
import { getLoginUserUsingGet, updateUserUsingPost } from '@/api/userController'
import dayjs from 'dayjs'

// 用户信息
const userInfo = ref({
  id: '',
  userAccount: '',
  userName: '',
  userProfile: '',
  userAvatar: '',
  userRole: '',
  createTime: '',
  updateTime: ''
})

// 用户统计数据
const userStats = ref({
  rank: 6128,
  points: 16,
  likes: 0,
  views: 0,
  following: 0,
  fans: 0
})

// 学习信息
const learningInfo = ref({
  direction: '',
  techStack: '',
  goal: ''
})

// 编辑表单
const editForm = reactive({
  userName: '',
  userProfile: '',
  direction: '',
  techStack: '',
  goal: ''
})

// 状态
const activeTab = ref('basic')
const showEditModal = ref(false)

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const res = await getLoginUserUsingGet()
    if (res.data.code === 0 && res.data.data) {
      userInfo.value = res.data.data
      // 初始化编辑表单
      editForm.userName = userInfo.value.userName || ''
      editForm.userProfile = userInfo.value.userProfile || ''
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

// 页面加载
onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
#userInfoPage {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.profile-summary {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.profile-left {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.avatar-section {
  position: relative;
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
  margin-bottom: 8px;
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
  margin-bottom: 16px;
}

.user-stats {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
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
  gap: 12px;
}

.content-tabs {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-section {
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.section-header h3 {
  margin: 0;
  color: #333;
}

.section-header a {
  color: #1890ff;
  cursor: pointer;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
}

.info-label {
  font-weight: bold;
  color: #333;
  min-width: 80px;
}

.info-value {
  color: #666;
  flex: 1;
}

.vip-info {
  display: flex;
  justify-content: center;
}

.vip-card {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  min-width: 300px;
}

.vip-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.vip-icon {
  font-size: 24px;
  color: #ff6b35;
}

.vip-content {
  margin-bottom: 16px;
}

.vip-content p {
  margin: 8px 0;
  color: #333;
}

.renew-btn {
  background: #ff6b35;
  border-color: #ff6b35;
}

.renew-btn:hover {
  background: #ff5722;
  border-color: #ff5722;
}
</style>