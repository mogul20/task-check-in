<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
    <div v-if="currentPage === 'detail'" class="max-w-lg mx-auto">
      <TaskDetail 
        :task-id="selectedTaskId" 
        @back="goBack" 
        @updated="onTaskUpdated"
      />
    </div>
    
    <div v-else-if="currentPage === 'profile-edit'" class="max-w-lg mx-auto">
      <ProfileEdit @back="goBack" />
    </div>
    
    <template v-else>
      <nav class="bg-white/85 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-gray-100">
        <div class="max-w-lg mx-auto px-4 py-4">
          <h1 class="text-xl font-bold text-gray-800 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">打卡菇</h1>
        </div>
      </nav>
      
      <div class="max-w-lg mx-auto px-4 py-4 pb-20 relative">
        <component :is="currentComponent" @open-detail="openTaskDetail" @open-profile-edit="openProfileEdit" />
        
        <button 
          v-if="currentTab === 'home' && user.isLoggedIn"
          @click="showAddTaskModal = true"
          class="fixed bottom-24 right-[calc(50%-230px)] w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-200 z-40"
        >
          <Plus class="w-7 h-7" />
        </button>
      </div>
      
      <nav class="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl shadow-2xl border-t border-gray-100">
        <div class="max-w-lg mx-auto flex justify-around py-2">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="currentTab = tab.id"
            class="flex flex-col items-center py-3 px-4 flex-1 transition-all duration-300 rounded-xl relative"
            :class="currentTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'"
          >
            <component :is="tab.icon" class="w-6 h-6 mb-1.5 transition-transform duration-300" :class="currentTab === tab.id ? 'scale-110' : ''" />
            <span class="text-xs font-medium">{{ tab.name }}</span>
            <div v-if="currentTab === tab.id" class="absolute bottom-1 w-1 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
          </button>
        </div>
        

      </nav>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Home, BarChart2, User, Plus } from 'lucide-vue-next'
import TaskList from './components/TaskList.vue'
import Statistics from './components/Statistics.vue'
import LoginPage from './components/LoginPage.vue'
import TaskDetail from './components/TaskDetail.vue'
import ProfileEdit from './components/ProfileEdit.vue'
import { user, checkAndRefreshSession } from './stores/userStore'

const currentTab = ref('home')
const currentPage = ref('main')
const selectedTaskId = ref('')
const showAddTaskModal = ref(false)

const tabs = [
  { id: 'home', name: '今日打卡', icon: Home },
  { id: 'stats', name: '统计分析', icon: BarChart2 },
  { id: 'profile', name: '我的', icon: User }
]

const currentComponent = computed(() => {
  switch (currentTab.value) {
    case 'home':
      return TaskList
    case 'stats':
      return Statistics
    case 'profile':
      return LoginPage
    default:
      return TaskList
  }
})

function openTaskDetail(taskId) {
  selectedTaskId.value = taskId
  currentPage.value = 'detail'
}

function openProfileEdit() {
  currentPage.value = 'profile-edit'
}

function goBack() {
  currentPage.value = 'main'
  selectedTaskId.value = ''
}

function onTaskUpdated() {
}

onMounted(() => {
  checkAndRefreshSession()
})
</script>
