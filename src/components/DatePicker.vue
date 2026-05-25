<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <div class="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
      <button 
        @click="prevMonth"
        class="p-2 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <ChevronLeft class="w-5 h-5 text-gray-600" />
      </button>
      <div class="text-center">
        <div class="font-semibold text-gray-800">{{ currentYear }}年{{ currentMonth }}月</div>
      </div>
      <button 
        @click="nextMonth"
        class="p-2 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <ChevronRight class="w-5 h-5 text-gray-600" />
      </button>
    </div>
    
    <div class="grid grid-cols-7 px-2 py-2">
      <div 
        v-for="day in weekDays" 
        :key="day"
        class="text-center text-xs font-medium text-gray-500 py-2"
      >
        {{ day }}
      </div>
    </div>
    
    <div class="grid grid-cols-7 px-2 pb-3">
      <div 
        v-for="(day, index) in monthDays" 
        :key="index"
        class="aspect-square flex flex-col items-center justify-center relative"
      >
        <button
          v-if="day"
          @click="selectDate(day)"
          class="w-10 h-10 rounded-full flex flex-col items-center justify-center transition-all duration-200 text-sm"
          :class="getDayClass(day)"
        >
          <span>{{ day }}</span>
          <span v-if="getDayStatus(day)" class="absolute bottom-1 w-1.5 h-1.5 rounded-full" :class="getDayStatusClass(day)"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { records, tasks } from '../stores/taskStore'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'close', 'today'])

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const currentDate = ref(new Date(props.modelValue))

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth() + 1)

const monthDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value, 0)
  const daysInMonth = lastDay.getDate()
  const startPadding = firstDay.getDay()
  
  const days = []
  for (let i = 0; i < startPadding; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }
  
  return days
})

function prevMonth() {
  const newDate = new Date(currentYear.value, currentMonth.value - 2, 1)
  currentDate.value = newDate
}

function nextMonth() {
  const newDate = new Date(currentYear.value, currentMonth.value, 1)
  currentDate.value = newDate
}

function selectDate(day) {
  const selected = new Date(currentYear.value, currentMonth.value - 1, day, 12, 0, 0, 0)
  const dateStr = selected.toISOString().split('T')[0]
  emit('update:modelValue', dateStr)
  emit('select', dateStr)
}

function getDayClass(day) {
  const dateStr = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const today = new Date().toISOString().split('T')[0]
  const isToday = dateStr === today
  const isSelected = dateStr === props.modelValue
  const isFuture = dateStr > today
  const isPerfect = getDayStatus(day)
  
  if (isSelected) {
    return isPerfect ? 'bg-lime-500 text-white font-medium ring-2 ring-purple-500' : 'bg-primary-500 text-white font-medium'
  }
  if (isToday) {
    return isPerfect ? 'bg-gray-100 text-gray-800 font-medium ring-2 ring-purple-500' : 'bg-primary-50 text-primary-600 font-medium'
  }
  if (isFuture) {
    return isPerfect ? 'bg-purple-50 text-purple-400' : 'text-gray-300 cursor-not-allowed'
  }
  return isPerfect ? 'bg-purple-50 text-purple-600' : 'text-gray-700 hover:bg-gray-100'
}

function getDayStatus(day) {
  const dateStr = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const dayRecords = records[dateStr] || {}
  const dayTasks = tasks.filter(t => t.startDate <= dateStr && (!t.endDate || t.endDate >= dateStr))
  
  if (dayTasks.length === 0) return false
  
  const completedCount = Object.values(dayRecords).filter(r => r.completed).length
  return completedCount === dayTasks.length
}

function getDayStatusClass(day) {
  return 'bg-purple-500'
}
</script>
