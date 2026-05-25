<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-800">任务管理</h2>
      <button @click="openAddModal" class="btn-primary text-sm flex items-center">
        <Plus class="w-4 h-4 mr-1" />
        添加任务
      </button>
    </div>
    
    <div class="mb-4 flex gap-2">
      <button 
        v-for="filter in filters" 
        :key="filter.id"
        @click="currentFilter = filter.id"
        class="px-3 py-1 rounded-full text-sm transition-colors"
        :class="currentFilter === filter.id ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'"
      >
        {{ filter.name }}
      </button>
    </div>
    
    <div v-if="filteredTasks.length === 0" class="text-center py-12">
      <div class="text-gray-400 text-lg mb-2">暂无任务</div>
      <div class="text-gray-400 text-sm">点击右上角添加新任务</div>
    </div>
    
    <div v-else>
      <div 
        v-for="task in filteredTasks" 
        :key="task.id"
        class="task-card"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-start flex-1">
            <div 
              class="w-4 h-4 rounded-full mr-3 mt-1 flex-shrink-0"
              :style="{ backgroundColor: task.color }"
            ></div>
            <div class="flex-1">
              <h3 class="font-medium text-gray-800">{{ task.name }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ task.description }}</p>
              <div class="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span class="flex items-center">
                  <Calendar class="w-3 h-3 mr-1" />
                  {{ formatDate(task.startDate) }} - {{ task.endDate ? formatDate(task.endDate) : '长期' }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button @click="openEditModal(task)" class="p-2 text-gray-400 hover:text-primary-500 transition-colors">
              <Edit3 class="w-5 h-5" />
            </button>
            <button @click="confirmDelete(task)" class="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ isEditing ? '编辑任务' : '添加任务' }}</h3>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">任务名称</label>
          <input 
            v-model="form.name"
            class="input-field"
            placeholder="请输入任务名称"
          />
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">任务描述</label>
          <textarea 
            v-model="form.description"
            class="input-field"
            rows="2"
            placeholder="请输入任务描述"
          ></textarea>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
            <input 
              v-model="form.startDate"
              type="date"
              class="input-field"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">结束日期 (可选)</label>
            <input 
              v-model="form.endDate"
              type="date"
              class="input-field"
            />
          </div>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">任务颜色</label>
          <div class="flex gap-2">
            <button 
              v-for="color in colors" 
              :key="color"
              @click="form.color = color"
              class="w-8 h-8 rounded-full transition-transform"
              :class="form.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''"
              :style="{ backgroundColor: color }"
            ></button>
          </div>
        </div>
        
        <div class="flex justify-end gap-2">
          <button @click="closeModal" class="btn-secondary">取消</button>
          <button @click="saveTask" class="btn-primary">保存</button>
        </div>
      </div>
    </div>
    
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="modal-content">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">确认删除</h3>
        <p class="text-gray-600 mb-4">确定要删除这个任务吗？所有相关的打卡记录也将被删除。</p>
        <div class="flex justify-end gap-2">
          <button @click="showDeleteConfirm = false" class="btn-secondary">取消</button>
          <button @click="doDelete" class="btn-danger">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, Edit3, Trash2, Calendar } from 'lucide-vue-next'
import { tasks, addTask, updateTask, deleteTask } from '../stores/taskStore'

const showModal = ref(false)
const isEditing = ref(false)
const showDeleteConfirm = ref(false)
const currentFilter = ref('all')
const taskToDelete = ref(null)

const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

const form = ref({
  name: '',
  description: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  color: '#3b82f6'
})

const filters = [
  { id: 'all', name: '全部' },
  { id: 'active', name: '进行中' },
  { id: 'expired', name: '已过期' }
]

const filteredTasks = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return tasks.filter(task => {
    switch (currentFilter.value) {
      case 'active':
        return task.startDate <= today && (!task.endDate || task.endDate >= today)
      case 'expired':
        return task.endDate && task.endDate < today
      default:
        return true
    }
  })
})

function openAddModal() {
  isEditing.value = false
  form.value = {
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    color: '#3b82f6'
  }
  showModal.value = true
}

function openEditModal(task) {
  isEditing.value = true
  form.value = {
    id: task.id,
    name: task.name,
    description: task.description,
    startDate: task.startDate,
    endDate: task.endDate || '',
    color: task.color
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function saveTask() {
  if (!form.value.name.trim()) {
    return
  }
  
  if (isEditing.value) {
    updateTask(form.value.id, {
      name: form.value.name,
      description: form.value.description,
      startDate: form.value.startDate,
      endDate: form.value.endDate || null,
      color: form.value.color
    })
  } else {
    addTask({
      name: form.value.name,
      description: form.value.description,
      startDate: form.value.startDate,
      endDate: form.value.endDate || null,
      color: form.value.color
    })
  }
  
  closeModal()
}

function confirmDelete(task) {
  taskToDelete.value = task
  showDeleteConfirm.value = true
}

function doDelete() {
  if (taskToDelete.value) {
    deleteTask(taskToDelete.value.id)
  }
  showDeleteConfirm.value = false
  taskToDelete.value = null
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}
</script>
