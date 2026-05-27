<template>
  <div 
    class="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 transition-transform duration-300"
    :style="{ transform: `translateX(${swipeDistance}px)` }"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <nav class="bg-white/85 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-gray-100">
      <div class="max-w-lg mx-auto px-4 py-3 flex items-center">
        <button 
          @click="handleBack"
          class="p-3 -ml-3 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 touch-manipulation"
        >
          <ChevronLeft class="w-6 h-6 text-gray-600" />
        </button>
        <h1 class="text-lg font-bold text-gray-800 flex-1 text-center -ml-3">编辑资料</h1>
      </div>
    </nav>
    
    <div class="max-w-lg mx-auto px-4 py-6">
      <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50">
        <div class="mb-8">
          <p class="text-sm text-gray-500 mb-4">头像</p>
          <div class="flex items-center gap-6">
            <div 
              class="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg overflow-hidden relative cursor-pointer hover:scale-105 transition-transform duration-200"
              @click="handleAvatarClick"
            >
              <img 
                v-if="user.avatar" 
                :src="user.avatar" 
                :alt="user.userName"
                class="w-full h-full object-cover"
              />
              <User v-else class="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
        
        <div class="mb-8">
          <p class="text-sm text-gray-500 mb-4">昵称</p>
          <div 
            class="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl cursor-pointer hover:bg-gray-100/50 transition-colors duration-200"
            @click="showNicknameModal = true"
          >
            <span class="text-gray-800 font-medium">{{ user.userName || '未设置' }}</span>
            <ChevronRight class="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div class="mb-4">
          <p class="text-sm text-gray-500 mb-4">注册日期</p>
          <div class="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
            <span class="text-gray-800 font-medium">{{ formatDate(user.createdAt) || '未知' }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showNicknameModal" class="modal-overlay" @click.self="handleNicknameModalClose">
      <div class="modal-content">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-800">修改昵称</h3>
          <button @click="handleNicknameModalClose" class="text-gray-400 hover:text-gray-600">
            <X class="w-6 h-6" />
          </button>
        </div>
        
        <div class="space-y-3">
          <input 
            v-model="nicknameInput"
            type="text"
            placeholder="请输入昵称"
            maxlength="20"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button 
            @click="saveNickname"
            :disabled="!nicknameInput.trim() || nicknameInput.trim() === originalNickname"
            class="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-500 disabled:hover:to-purple-500"
          >
            保存
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="showAvatarModal" class="modal-overlay" @click.self="handleAvatarModalClose">
      <div class="modal-content">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-800">更换头像</h3>
          <button @click="handleAvatarModalClose" class="text-gray-400 hover:text-gray-600">
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
            class="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
          >
            选择图片
          </button>
          <button 
            @click="saveAvatar"
            :disabled="!tempAvatar"
            class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { ChevronLeft, User, X, ChevronRight } from 'lucide-vue-next'
import { user, updateAvatar, updateUsername } from '../stores/userStore'
import { getUserById } from '../supabase/userService'

const emit = defineEmits(['back'])

const nicknameInput = ref('')
const originalNickname = ref('')
const showNicknameModal = ref(false)
const showAvatarModal = ref(false)
const tempAvatar = ref('')
const fileInput = ref(null)
const avatarPosition = ref({ x: 0, y: 0 })
const avatarScale = ref(1)
const isDragging = ref(false)
const startPos = ref({ x: 0, y: 0 })
const initialPos = ref({ x: 0, y: 0 })
const initialDistance = ref(0)
const initialScale = ref(1)
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchCurrentX = ref(0)
const isSwiping = ref(false)
const swipeDistance = ref(0)

watch(() => user.userName, (newVal) => {
  nicknameInput.value = newVal || ''
  originalNickname.value = newVal || ''
}, { immediate: true })

onMounted(async () => {
  if (user.isLoggedIn && user.userId && !user.createdAt) {
    try {
      const userProfile = await getUserById(user.userId)
      if (userProfile && userProfile.created_at) {
        user.createdAt = userProfile.created_at
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
  }
})

function handleBack() {
  emit('back')
}

function handleTouchStart(e) {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  touchCurrentX.value = touchStartX.value
  isSwiping.value = false
  swipeDistance.value = 0
}

function handleTouchMove(e) {
  touchCurrentX.value = e.touches[0].clientX
  const deltaX = touchCurrentX.value - touchStartX.value
  const deltaY = e.touches[0].clientY - touchStartY.value
  
  if (!isSwiping.value && Math.abs(deltaX) > 10) {
    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0) {
      isSwiping.value = true
    }
  }
  
  if (isSwiping.value) {
    swipeDistance.value = Math.max(0, deltaX)
    e.preventDefault()
  }
}

function handleTouchEnd() {
  if (isSwiping.value && swipeDistance.value > 100) {
    handleBack()
  }
  isSwiping.value = false
  swipeDistance.value = 0
}

function handleNicknameModalClose() {
  nicknameInput.value = originalNickname.value
  showNicknameModal.value = false
}

function handleAvatarModalClose() {
  tempAvatar.value = user.avatar
  avatarPosition.value = { x: 0, y: 0 }
  avatarScale.value = 1
  showAvatarModal.value = false
}

function handleAvatarClick() {
  tempAvatar.value = user.avatar
  showAvatarModal.value = true
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

function saveNickname() {
  if (nicknameInput.value.trim() && nicknameInput.value.trim() !== originalNickname.value) {
    updateUsername(nicknameInput.value.trim())
    originalNickname.value = nicknameInput.value.trim()
    showNicknameModal.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}年${month}月${day}日`
}
</script>
