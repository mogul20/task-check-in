<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
    <div class="pt-16 px-6">
      <div 
        class="w-28 h-28 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-3xl border-4 border-white"
        @click="handleAvatarClick"
      >
        <img 
          v-if="user.isLoggedIn && user.avatar" 
          :src="user.avatar" 
          :alt="user.userName"
          class="w-full h-full rounded-full object-cover"
        />
        <User v-else class="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent" />
      </div>
      <p 
        v-if="user.isLoggedIn"
        class="text-center text-gray-700 mt-6 text-xl font-bold"
      >
        <span class="cursor-pointer hover:text-blue-600 transition-colors" @click.stop="handleNicknameClick">{{ user.userName }}</span>
      </p>
      <p v-else class="text-center text-gray-500 mt-6 text-lg font-medium">
        点击头像登录
      </p>
    </div>
    
    <div class="bg-white/90 backdrop-blur-sm mx-5 mt-8 rounded-3xl shadow-xl border border-white/50 overflow-hidden">
      <div class="p-5 cursor-pointer" @click="handleReminderHeaderClick">
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <h3 class="font-bold text-gray-800 text-base">打卡提醒</h3>
            <p class="text-xs text-gray-500 mt-1">
              {{ reminderForm.enabled ? '每日 ' + String(reminderForm.hour).padStart(2, '0') + '：' + String(reminderForm.minute).padStart(2, '0') + ' 提醒' : '任务未完成时自动提醒' }}
            </p>
          </div>
          <button
            type="button"
            @click.stop="toggleReminder"
            class="relative flex-shrink-0"
          >
            <div class="w-14 h-7 rounded-full transition-all duration-300" :class="reminderForm.enabled ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-300'">
              <div class="w-6 h-6 bg-white rounded-full shadow-md transform transition-all duration-300 absolute top-0.5" :class="reminderForm.enabled ? 'translate-x-7' : 'translate-x-0.5'"></div>
            </div>
          </button>
        </div>
      </div>
      
      <div
        class="overflow-hidden transition-all duration-400 ease-out"
        :style="{ maxHeight: showPanel ? '320px' : '0' }"
      >
        <div class="px-5 pb-5">
          <div class="flex items-center justify-center gap-3 mb-4">
            <div class="text-center flex-1">
              <div class="text-sm text-gray-600 font-semibold mb-2">时</div>
              <div ref="hourListRef" class="h-32 overflow-y-auto rounded-xl bg-gray-50 scrollbar-hide">
                <div
                  v-for="h in 24"
                  :key="h"
                  @click="reminderForm.hour = h - 1"
                  class="h-11 flex items-center justify-center text-lg cursor-pointer transition-all duration-200"
                  :class="reminderForm.hour === h - 1 ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold' : 'hover:bg-gray-100 text-gray-700'"
                >
                  {{ String(h - 1).padStart(2, '0') }}
                </div>
              </div>
            </div>
            <span class="text-2xl font-bold text-gray-400 mt-6">:</span>
            <div class="text-center flex-1">
              <div class="text-sm text-gray-600 font-semibold mb-2">分</div>
              <div ref="minuteListRef" class="h-32 overflow-y-auto rounded-xl bg-gray-50 scrollbar-hide">
                <div
                  v-for="m in 12"
                  :key="m"
                  @click="reminderForm.minute = (m - 1) * 5"
                  class="h-11 flex items-center justify-center text-lg cursor-pointer transition-all duration-200"
                  :class="reminderForm.minute === (m - 1) * 5 ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold' : 'hover:bg-gray-100 text-gray-700'"
                >
                  {{ String((m - 1) * 5).padStart(2, '0') }}
                </div>
              </div>
            </div>
          </div>

          <button
            @click="saveReminderSettings"
            class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-bold text-base shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-300"
          >
            <span v-if="!showSaveSuccess">保存设置</span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
              </svg>
              保存成功！
            </span>
          </button>
        </div>
      </div>
    </div>
    
    <div class="bg-white/90 backdrop-blur-sm mx-5 mt-4 rounded-3xl shadow-xl p-5 border border-white/50">
      <div class="flex items-center gap-4 py-1 cursor-pointer transition-all duration-200 hover:opacity-80" @click="showFeedbackModal = true">
        <HelpCircle class="w-5 h-5 text-gray-500" />
        <span class="text-gray-700 font-medium">帮助与反馈</span>
        <ChevronRight class="w-5 h-5 text-gray-300 ml-auto" />
      </div>
    </div>
    
    <div v-if="user.isLoggedIn" class="mx-5 mt-4">
      <button 
        @click="handleLogout"
        class="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-4 rounded-2xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-md hover:shadow-lg"
      >
        退出登录
      </button>
    </div>
    
    <div v-if="showAvatarModal" class="modal-overlay" @click.self="showAvatarModal = false">
      <div class="modal-content">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-800">更换头像</h3>
          <button @click="showAvatarModal = false" class="text-gray-400 hover:text-gray-600">
            <X class="w-6 h-6" />
          </button>
        </div>
        
        <div class="flex justify-center mb-6">
          <div 
            class="w-32 h-32 rounded-full overflow-hidden bg-gray-100 relative cursor-move"
            @mousedown="startDrag"
            @touchstart="startDrag"
            @wheel="handleWheel"
          >
            <img 
              v-if="tempAvatar" 
              :src="tempAvatar" 
              class="absolute w-full h-full object-cover"
              :style="{
                transform: `translate(${avatarPosition.x}px, ${avatarPosition.y}px) scale(${avatarScale})`,
                transformOrigin: 'center center'
              }"
              draggable="false"
            />
            <User v-else class="w-full h-full text-gray-300" />
          </div>
        </div>
        
        <div class="space-y-3">
          <input 
            type="file" 
            accept="image/*"
            @change="handleFileSelect"
            ref="fileInput"
            class="hidden"
          />
          <button 
            @click="triggerFileInput"
            class="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-all duration-200"
          >
            选择图片
          </button>
          <button 
            @click="saveAvatar"
            :disabled="!tempAvatar"
            class="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            保存
          </button>
          <button 
            @click="showAvatarModal = false"
            class="w-full bg-gray-100 text-gray-600 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"
          >
            取消
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="showFeedbackModal" class="modal-overlay" @click.self="showFeedbackModal = false">
      <div class="modal-content">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-800">帮助与反馈</h3>
          <button @click="showFeedbackModal = false" class="text-gray-400 hover:text-gray-600">
            <X class="w-6 h-6" />
          </button>
        </div>
        
        <div class="text-center text-gray-600 py-4">
          <p>请联系：huyaxin945@163.com</p>
        </div>
        
        <button 
          @click="showFeedbackModal = false"
          class="w-full bg-gray-100 text-gray-600 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 mt-4"
        >
          关闭
        </button>
      </div>
    </div>
    
    <div v-if="showNicknameModal" class="modal-overlay" @click.self="showNicknameModal = false">
      <div class="modal-content">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-800">修改昵称</h3>
          <button @click="showNicknameModal = false" class="text-gray-400 hover:text-gray-600">
            <X class="w-6 h-6" />
          </button>
        </div>
        
        <div class="space-y-3">
          <input 
            v-model="nicknameInput"
            type="text"
            placeholder="请输入昵称"
            maxlength="20"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button 
            @click="saveNickname"
            :disabled="!nicknameInput.trim()"
            class="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            保存
          </button>
          <button 
            @click="showNicknameModal = false"
            class="w-full bg-gray-100 text-gray-600 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"
          >
            取消
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="showLoginModal" class="modal-overlay" @click.self="showLoginModal = false">
      <div class="modal-content">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-800">账号密码登录</h3>
          <button @click="showLoginModal = false" class="text-gray-400 hover:text-gray-600">
            <X class="w-6 h-6" />
          </button>
        </div>
        
        <div class="space-y-3">
          <div class="relative">
            <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              v-model="phone"
              type="tel"
              placeholder="请输入手机号"
              maxlength="11"
              class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              v-model="code"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              class="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              type="button"
            >
              <Eye v-if="!showPassword" class="w-5 h-5" />
              <EyeOff v-else class="w-5 h-5" />
            </button>
          </div>
          
          <button 
            @click="handlePhoneLogin"
            :disabled="isLoading"
            class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <span v-if="loadingType !== 'phone'">登录</span>
            <span v-else class="flex items-center justify-center gap-2">
              <Loader2 class="w-5 h-5 animate-spin" />
              登录中...
            </span>
          </button>
        </div>
        
        <p class="text-center text-gray-500 text-sm mt-4">
          未注册账号将自动创建
        </p>
        
        <div class="flex justify-between mt-3">
          <button 
            @click="showResetPasswordModal = true"
            class="text-blue-500 text-sm hover:underline"
            type="button"
          >
            忘记密码？
          </button>
        </div>
        
        <p class="text-center text-gray-400 text-xs mt-3">
          登录即表示同意《用户协议》和《隐私政策》
        </p>
      </div>
    </div>
    
    <div v-if="showResetPasswordModal" class="modal-overlay" @click.self="showResetPasswordModal = false">
      <div class="modal-content">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-800">重置密码</h3>
          <button @click="showResetPasswordModal = false" class="text-gray-400 hover:text-gray-600">
            <X class="w-6 h-6" />
          </button>
        </div>
        
        <div class="space-y-3">
          <div class="relative">
            <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              v-model="resetUsername"
              type="tel"
              placeholder="请输入手机号"
              maxlength="11"
              class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              v-model="resetNewPassword"
              :type="showResetPassword ? 'text' : 'password'"
              placeholder="请输入新密码"
              class="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              @click="showResetPassword = !showResetPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              type="button"
            >
              <Eye v-if="!showResetPassword" class="w-5 h-5" />
              <EyeOff v-else class="w-5 h-5" />
            </button>
          </div>
          
          <button 
            @click="handleResetPassword"
            :disabled="isLoading"
            class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <span v-if="loadingType !== 'reset'">重置密码</span>
            <span v-else class="flex items-center justify-center gap-2">
              <Loader2 class="w-5 h-5 animate-spin" />
              处理中...
            </span>
          </button>
        </div>
        
        <p class="text-center text-gray-400 text-xs mt-4">
          重置密码后需要重新登录
        </p>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { User, MessageCircle, Star, Lock, Loader2, Settings, HelpCircle, Info, ChevronRight, X, Bell, Eye, EyeOff } from 'lucide-vue-next'
import { user, loginWithPhone, logout, getVerificationCode, updateAvatar, updateUsername } from '../stores/userStore'
import { reminderSettings, setReminderSettings } from '../stores/taskStore'

const phone = ref('')
const code = ref('')
const isLoading = ref(false)
const loadingType = ref('')
const showPassword = ref(false)
const showLoginModal = ref(false)
const showResetPasswordModal = ref(false)
const showFeedbackModal = ref(false)
const showAvatarModal = ref(false)
const tempAvatar = ref('')
const fileInput = ref(null)
const showNicknameModal = ref(false)
const nicknameInput = ref('')
const resetUsername = ref('')
const resetNewPassword = ref('')
const showResetPassword = ref(false)
const showSaveSuccess = ref(false)
const hourListRef = ref(null)
const minuteListRef = ref(null)
const showPanel = ref(false)
const avatarPosition = ref({ x: 0, y: 0 })
const avatarScale = ref(1)
const isDragging = ref(false)
const startPos = ref({ x: 0, y: 0 })
const initialPos = ref({ x: 0, y: 0 })
const initialDistance = ref(0)
const initialScale = ref(1)

const reminderForm = ref({
  enabled: false,
  hour: 12,
  minute: 30
})

const codeBtnDisabled = computed(() => {
  return phone.value.length === 0
})

const codeBtnText = computed(() => {
  return '获取验证码'
})

async function handleGetCode() {
  return
}

async function handlePhoneLogin() {
  isLoading.value = true
  loadingType.value = 'phone'
  try {
    await loginWithPhone(phone.value, code.value)
    phone.value = ''
    code.value = ''
    showLoginModal.value = false
  } catch (error) {
    alert(error.message)
  } finally {
    isLoading.value = false
    loadingType.value = ''
  }
}

async function handleResetPassword() {
  if (!resetUsername.value || resetUsername.value.trim().length === 0) {
    alert('请输入账号')
    return
  }
  if (!resetNewPassword.value || resetNewPassword.value.length === 0) {
    alert('请输入新密码')
    return
  }
  
  isLoading.value = true
  loadingType.value = 'reset'
  try {
    const { resetPassword } = await import('../stores/userStore')
    await resetPassword(resetUsername.value, resetNewPassword.value)
    alert('密码重置成功，请重新登录')
    resetUsername.value = ''
    resetNewPassword.value = ''
    showResetPasswordModal.value = false
    showLoginModal.value = true
  } catch (error) {
    alert(error.message)
  } finally {
    isLoading.value = false
    loadingType.value = ''
  }
}

function handleLogout() {
  if (confirm('确定要退出登录吗？')) {
    logout()
  }
}

onMounted(() => {
  if (reminderSettings.hour !== undefined) {
    reminderForm.value.enabled = reminderSettings.enabled
    reminderForm.value.hour = reminderSettings.hour
    reminderForm.value.minute = reminderSettings.minute
  }
})

function scrollToCurrentTime() {
  nextTick(() => {
    const itemHeight = 44
    const containerHeight = 128
    const offset = (containerHeight - itemHeight) / 2
    
    if (hourListRef.value) {
      hourListRef.value.scrollTop = reminderForm.value.hour * itemHeight - offset
    }
    if (minuteListRef.value) {
      const minuteIndex = Math.floor(reminderForm.value.minute / 5)
      minuteListRef.value.scrollTop = minuteIndex * itemHeight - offset
    }
  })
}

function handleReminderHeaderClick() {
  if (!reminderForm.value.enabled) {
    toggleReminder()
  } else {
    showPanel.value = !showPanel.value
    if (showPanel.value) {
      scrollToCurrentTime()
    }
  }
}

function toggleReminder() {
  reminderForm.value.enabled = !reminderForm.value.enabled
  if (reminderForm.value.enabled) {
    showPanel.value = true
    scrollToCurrentTime()
  } else {
    showPanel.value = false
    reminderForm.value.hour = 12
    reminderForm.value.minute = 30
    setReminderSettings({
      enabled: false,
      hour: 12,
      minute: 30
    })
  }
}

function saveReminderSettings() {
  setReminderSettings({
    enabled: reminderForm.value.enabled,
    hour: reminderForm.value.hour,
    minute: reminderForm.value.minute
  })
  showSaveSuccess.value = true
  setTimeout(() => {
    showSaveSuccess.value = false
    showPanel.value = false
  }, 800)
}

function handleAvatarClick() {
  if (user.isLoggedIn) {
    tempAvatar.value = user.avatar
    showAvatarModal.value = true
  } else {
    showLoginModal.value = true
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event) {
  const file = event.target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      tempAvatar.value = e.target?.result || ''
    }
    reader.readAsDataURL(file)
  }
}

function saveAvatar() {
  if (tempAvatar.value) {
    updateAvatar(tempAvatar.value)
    avatarPosition.value = { x: 0, y: 0 }
    avatarScale.value = 1
    showAvatarModal.value = false
  }
}

function startDrag(e) {
  if (!tempAvatar.value) return
  
  if (e.touches && e.touches.length === 2) {
    const touch1 = e.touches[0]
    const touch2 = e.touches[1]
    initialDistance.value = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)
    initialScale.value = avatarScale.value
    return
  }
  
  isDragging.value = true
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  startPos.value = { x: clientX, y: clientY }
  initialPos.value = { ...avatarPosition.value }
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('touchend', stopDrag)
}

function onDrag(e) {
  if (e.touches && e.touches.length === 2) {
    const touch1 = e.touches[0]
    const touch2 = e.touches[1]
    const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)
    avatarScale.value = Math.min(Math.max(0.5, initialScale.value * (distance / initialDistance.value)), 3)
    return
  }
  
  if (!isDragging.value) return
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  avatarPosition.value = {
    x: initialPos.value.x + (clientX - startPos.value.x),
    y: initialPos.value.y + (clientY - startPos.value.y)
  }
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
}

function handleWheel(e) {
  if (!tempAvatar.value) return
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  avatarScale.value = Math.min(Math.max(0.5, avatarScale.value + delta), 3)
}

function handleNicknameClick() {
  if (user.isLoggedIn) {
    nicknameInput.value = user.userName
    showNicknameModal.value = true
  }
}

function saveNickname() {
  if (nicknameInput.value.trim()) {
    updateUsername(nicknameInput.value.trim())
    showNicknameModal.value = false
  }
}
</script>