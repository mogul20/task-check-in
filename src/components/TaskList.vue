<template>
  <div class="relative">
    <div v-if="appState.isLoading" class="flex items-center justify-center py-16">
      <div class="flex flex-col items-center">
        <Loader2 class="w-8 h-8 text-blue-500 animate-spin" />
        <p class="text-gray-500 mt-3">加载中...</p>
      </div>
    </div>
    
    <div v-else>
    <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 mb-5 border border-white/50">
      
      <template v-if="!showCalendar">
        <div @click.self="showYearMonthPicker = false" class="relative">
          <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-3">
              <button 
                @click="prevWeek"
                class="p-2.5 rounded-xl transition-all duration-200 text-gray-600 hover:bg-gradient-to-r from-blue-50 to-purple-50 hover:text-blue-600 active:scale-95"
              >
                <ChevronLeft class="w-5 h-5" />
              </button>
              <button 
                @click="showYearMonthPicker = !showYearMonthPicker"
                class="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span class="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{{ monthStr }}</span>
              </button>
              <button 
                @click="nextWeek"
                class="p-2.5 rounded-xl transition-all duration-200 text-gray-600 hover:bg-gradient-to-r from-blue-50 to-purple-50 hover:text-blue-600 active:scale-95"
              >
                <ChevronRight class="w-5 h-5" />
              </button>
            </div>
            <button 
              v-if="selectedDate !== todayStr"
              @click="goToToday"
              class="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
            >
                回到今天
              </button>
          </div>
          
          <div v-show="showYearMonthPicker" class="absolute z-50 left-4 right-4 mt-2 p-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 year-month-picker">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-500 mb-1.5 text-center">年份</label>
                <div ref="yearListRef" class="h-28 overflow-y-auto scrollbar-hide rounded-xl bg-gray-50">
                  <div 
                    v-for="year in availableYears"
                    :key="year"
                    @click="selectYear(year)"
                    class="py-2.5 text-center cursor-pointer transition-all duration-200 rounded-lg"
                    :class="currentYear === year ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold' : 'hover:bg-gray-100 text-gray-700'"
                  >
                    {{ year }}年
                  </div>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1.5 text-center">月份</label>
                <div ref="monthListRef" class="h-28 overflow-y-auto scrollbar-hide rounded-xl bg-gray-50">
                  <div 
                    v-for="month in 12"
                    :key="month"
                    @click="selectMonth(month)"
                    class="py-2.5 text-center cursor-pointer transition-all duration-200 rounded-lg"
                    :class="currentMonth === month ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold' : 'hover:bg-gray-100 text-gray-700'"
                  >
                    {{ month }}月
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex items-center justify-between mb-2">
            <div class="flex-1 flex items-center gap-0.5 sm:gap-1">
              <button 
                v-for="day in weekDays"
                :key="day.date"
                @click="selectDate(day.date)"
                class="flex-1 flex flex-col items-center py-2 sm:py-3 px-1 sm:px-0 rounded-xl transition-all duration-300 min-w-[40px]"
                :class="getDayButtonClass(day)"
              >
                <span class="text-[10px] sm:text-xs font-medium" :class="day.isToday ? 'text-blue-600' : 'text-gray-500'">{{ day.weekDay }}</span>
                <span class="text-base sm:text-lg font-bold" :class="day.isToday ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' : ''">{{ day.day }}</span>
                <div 
                  v-if="day.isPerfect" 
                  class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-1 sm:mt-1.5 bg-gradient-to-r from-purple-500 to-pink-500"
                ></div>
              </button>
            </div>
          </div>
          
          <div class="flex justify-center mt-3">
            <button 
              @click="showCalendar = true; showYearMonthPicker = false"
              class="p-2 rounded-full hover:bg-gray-100 transition-all duration-300"
            >
              <ChevronDown class="w-5 h-5 text-gray-500 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </template>
      
      <template v-else>
        <div @click.self="showYearMonthPicker = false" class="relative">
          <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-3">
              <button 
                @click="prevMonth"
                class="p-2.5 rounded-xl transition-all duration-200 text-gray-600 hover:bg-gradient-to-r from-blue-50 to-purple-50 hover:text-blue-600 active:scale-95"
              >
                <ChevronLeft class="w-5 h-5" />
              </button>
              <button 
                @click="showYearMonthPicker = !showYearMonthPicker"
                class="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span class="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{{ monthStr }}</span>
              </button>
              <button 
                @click="nextMonth"
                class="p-2.5 rounded-xl transition-all duration-200 text-gray-600 hover:bg-gradient-to-r from-blue-50 to-purple-50 hover:text-blue-600 active:scale-95"
              >
                <ChevronRight class="w-5 h-5" />
              </button>
            </div>
            <button 
              v-if="selectedDate !== todayStr"
              @click="goToToday"
              class="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
            >
              回到今天
            </button>
          </div>
          
          <div v-show="showYearMonthPicker" class="absolute z-50 left-4 right-4 mt-2 p-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 year-month-picker">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-500 mb-1.5 text-center">年份</label>
                <div ref="yearListRef" class="h-28 overflow-y-auto scrollbar-hide rounded-xl bg-gray-50">
                  <div 
                    v-for="year in availableYears"
                    :key="year"
                    @click="selectYear(year)"
                    class="py-2.5 text-center cursor-pointer transition-all duration-200 rounded-lg"
                    :class="currentYear === year ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold' : 'hover:bg-gray-100 text-gray-700'"
                  >
                    {{ year }}年
                  </div>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1.5 text-center">月份</label>
                <div ref="monthListRef" class="h-28 overflow-y-auto scrollbar-hide rounded-xl bg-gray-50">
                  <div 
                    v-for="month in 12"
                    :key="month"
                    @click="selectMonth(month)"
                    class="py-2.5 text-center cursor-pointer transition-all duration-200 rounded-lg"
                    :class="currentMonth === month ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold' : 'hover:bg-gray-100 text-gray-700'"
                  >
                    {{ month }}月
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-7 gap-2 text-center mb-4">
            <div 
              v-for="day in calendarDays"
              :key="day.date || day.day"
              class="aspect-square flex flex-col items-center justify-center rounded-xl transition-all duration-300 py-1"
              :class="getCalendarDayClass(day)"
              @click="day.date && selectDate(day.date)"
            >
              <span class="text-sm font-medium" :class="day.isToday ? 'text-blue-600' : 'text-gray-500'">{{ day.weekDay }}</span>
              <span class="text-xl font-bold mt-0.5">{{ day.day }}</span>
              <div 
                v-if="day.isPerfect" 
                class="w-2 h-2 rounded-full mt-1 bg-gradient-to-r from-purple-500 to-pink-500"
              ></div>
            </div>
          </div>
          
          <div class="flex justify-center">
            <button 
              @click="showCalendar = false; showYearMonthPicker = false"
              class="p-2 rounded-full hover:bg-gray-100 transition-all duration-300 rotate-180"
            >
              <ChevronDown class="w-5 h-5 text-gray-500 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </template>
      
      </div>
    
    <div class="flex items-center gap-2.5 mb-5 overflow-x-auto pb-2">
      <button 
        v-for="filter in filters"
        :key="filter.value"
        @click="currentFilter = filter.value"
        class="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 whitespace-nowrap shadow-sm"
        :class="currentFilter === filter.value ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' : 'bg-white/80 text-gray-600 hover:bg-white shadow-md'"
      >
        {{ filter.label }} ({{ getFilterCount(filter.value) }})
      </button>
    </div>
    
    <div v-if="currentFilteredTasks.length === 0" class="text-center py-16 bg-white/50 rounded-3xl">
      <div class="text-gray-400 text-xl mb-3 font-medium">暂无任务</div>
      <div class="text-gray-400 text-sm" v-if="user.isLoggedIn">点击右下角加号添加新任务</div>
      <div class="text-gray-400 text-sm" v-else>登录后添加任务</div>
    </div>
    
    <div v-else class="space-y-4">
      <div 
        v-for="task in currentFilteredTasks" 
        :key="task.id"
        class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:-translate-y-1 border border-white/50"
        @click="openTaskDetail(task)"
      >
        <div class="flex items-center gap-4">
          <button 
            @click.stop="toggleComplete(task)"
            :disabled="isFutureDate"
            class="w-12 h-12 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300"
            :class="isCompleted(task.id, selectedDate) ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-400 shadow-lg' : 'border-gray-200 hover:border-blue-300'"
          >
            <Check v-if="isCompleted(task.id, selectedDate)" class="w-7 h-7 text-white" />
          </button>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3">
              <div 
                class="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                :style="{ backgroundColor: task.color }"
              ></div>
              <h3 
                class="text-lg font-bold truncate"
                :class="isCompleted(task.id, selectedDate) ? 'line-through text-gray-400' : 'text-gray-800'"
              >
                {{ task.name }}
              </h3>
            </div>
            <p class="text-sm text-gray-500 mt-2 leading-relaxed">{{ task.description }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showDatePicker" class="modal-overlay" @click.self="showDatePicker = false">
      <div class="w-full max-w-md mx-4 mt-20">
        <DatePicker 
          v-model="selectedDate"
          @close="showDatePicker = false"
          @select="showDatePicker = false"
        />
      </div>
    </div>
    

    </div>
    

    
    <div v-if="showAddTaskModal" class="modal-overlay" @click.self="showAddTaskModal = false">
      <div class="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 w-full max-w-md mx-4 border border-white/50">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">添加新任务</h3>
          <button @click="showAddTaskModal = false; resetNewTask()" class="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X class="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">任务名称</label>
            <input 
              v-model="newTask.name"
              class="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="请输入任务名称"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">任务描述</label>
            <textarea 
              v-model="newTask.description"
              class="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              rows="3"
              placeholder="请输入任务描述（选填）"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">开始日期</label>
              <div class="relative">
                <div 
                  @click="toggleAddTaskStartDate"
                  class="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 transition-all duration-200 flex items-center justify-between"
                >
                  <span class="text-gray-800">{{ newTask.startDate || '请选择' }}</span>
                  <ChevronDown class="w-4 h-4 text-gray-400" />
                </div>
                <div v-if="showAddTaskStartDate" class="absolute z-50 left-0 right-0 mt-2 p-4 bg-white rounded-xl shadow-2xl border border-gray-100">
                  <div class="grid grid-cols-3 gap-2 mb-3">
                    <div class="text-center">
                      <div class="text-xs text-gray-500 mb-1">年</div>
                      <div ref="addTaskStartYearList" class="h-32 overflow-y-auto scrollbar-hide rounded-lg bg-gray-50">
                        <div
                          v-for="year in availableYears"
                          :key="year"
                          @click="selectAddTaskStartYear(year)"
                          class="h-9 flex items-center justify-center text-sm cursor-pointer transition-all duration-200 rounded-lg"
                          :class="addTaskStartYear === year ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold' : 'hover:bg-gray-100 text-gray-700'"
                        >
                          {{ year }}
                        </div>
                      </div>
                    </div>
                    <div class="text-center">
                      <div class="text-xs text-gray-500 mb-1">月</div>
                      <div ref="addTaskStartMonthList" class="h-32 overflow-y-auto scrollbar-hide rounded-lg bg-gray-50">
                        <div
                          v-for="month in 12"
                          :key="month"
                          @click="selectAddTaskStartMonth(month)"
                          class="h-9 flex items-center justify-center text-sm cursor-pointer transition-all duration-200 rounded-lg"
                          :class="addTaskStartMonth === month ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold' : 'hover:bg-gray-100 text-gray-700'"
                        >
                          {{ month }}
                        </div>
                      </div>
                    </div>
                    <div class="text-center">
                      <div class="text-xs text-gray-500 mb-1">日</div>
                      <div ref="addTaskStartDayList" class="h-32 overflow-y-auto scrollbar-hide rounded-lg bg-gray-50">
                        <div
                          v-for="day in getAddTaskDaysInMonth(addTaskStartYear, addTaskStartMonth)"
                          :key="day"
                          @click="selectAddTaskStartDay(day)"
                          class="h-9 flex items-center justify-center text-sm cursor-pointer transition-all duration-200 rounded-lg"
                          :class="addTaskStartDay === day ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold' : 'hover:bg-gray-100 text-gray-700'"
                        >
                          {{ day }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button @click="saveAddTaskStartDate" class="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:opacity-90 transition-all duration-200">保存</button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">结束日期</label>
              <div class="relative">
                <div 
                  @click="toggleAddTaskEndDate"
                  class="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 transition-all duration-200 flex items-center justify-between"
                >
                  <span class="text-gray-800">{{ newTask.endDate || (addTaskEndIsLongTerm ? '长期' : '请选择') }}</span>
                  <ChevronDown class="w-4 h-4 text-gray-400" />
                </div>
                <div v-if="showAddTaskEndDate" class="absolute z-50 left-0 right-0 mt-2 p-4 bg-white rounded-xl shadow-2xl border border-gray-100">
                  <button
                    @click="setAddTaskEndLongTerm"
                    class="w-full px-4 py-2 rounded-xl font-medium transition-all duration-200 mb-3"
                    :class="addTaskEndIsLongTerm 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  >
                    设为长期
                  </button>
                  <div class="bg-white rounded-xl p-3" :class="{ 'opacity-50': addTaskEndIsLongTerm }">
                    <div class="grid grid-cols-3 gap-2">
                      <div class="text-center">
                        <div class="text-xs text-gray-500 mb-1">年</div>
                        <div ref="addTaskEndYearList" class="h-32 overflow-y-auto scrollbar-hide rounded-lg bg-gray-50">
                          <div
                            v-for="year in availableYears"
                            :key="year"
                            @click="selectAddTaskEndYear(year)"
                            class="h-9 flex items-center justify-center text-sm cursor-pointer transition-all duration-200 rounded-lg"
                            :class="addTaskEndYear === year ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold' : 'hover:bg-gray-100 text-gray-700'"
                          >
                            {{ year }}
                          </div>
                        </div>
                      </div>
                      <div class="text-center">
                        <div class="text-xs text-gray-500 mb-1">月</div>
                        <div ref="addTaskEndMonthList" class="h-32 overflow-y-auto scrollbar-hide rounded-lg bg-gray-50">
                          <div
                            v-for="month in 12"
                            :key="month"
                            @click="selectAddTaskEndMonth(month)"
                            class="h-9 flex items-center justify-center text-sm cursor-pointer transition-all duration-200 rounded-lg"
                            :class="addTaskEndMonth === month ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold' : 'hover:bg-gray-100 text-gray-700'"
                          >
                            {{ month }}
                          </div>
                        </div>
                      </div>
                      <div class="text-center">
                        <div class="text-xs text-gray-500 mb-1">日</div>
                        <div ref="addTaskEndDayList" class="h-32 overflow-y-auto scrollbar-hide rounded-lg bg-gray-50">
                          <div
                            v-for="day in getAddTaskDaysInMonth(addTaskEndYear, addTaskEndMonth)"
                            :key="day"
                            @click="selectAddTaskEndDay(day)"
                            class="h-9 flex items-center justify-center text-sm cursor-pointer transition-all duration-200 rounded-lg"
                            :class="addTaskEndDay === day ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold' : 'hover:bg-gray-100 text-gray-700'"
                          >
                            {{ day }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="flex gap-2 mt-3">
                    <button @click="saveAddTaskEndDate" class="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:opacity-90 transition-all duration-200">保存</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3">任务颜色</label>
            <div class="flex gap-3 flex-wrap">
              <button 
                v-for="color in taskColors" 
                :key="color"
                @click="newTask.color = color"
                class="w-10 h-10 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
                :class="newTask.color === color ? 'ring-4 ring-offset-2 ring-gray-300 scale-110 shadow-lg' : ''"
                :style="{ backgroundColor: color }"
              ></button>
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-8">
          <button 
            @click="addNewTask" 
            class="flex-1 px-4 py-3.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            添加任务
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { ChevronLeft, ChevronRight, Check, Plus, Loader2, X, ChevronDown } from 'lucide-vue-next'
import DatePicker from './DatePicker.vue'
import { getTasksForDate, isCompleted, checkIn, uncheckIn, addTask, appState } from '../stores/taskStore'
import { user } from '../stores/userStore'

const emit = defineEmits(['openDetail', 'open-add-task'])

function openAddTaskModal() {
  showAddTaskModal.value = true
}

defineExpose({
  openAddTaskModal
})

function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const today = new Date()
const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate())
const selectedDate = ref(todayStr)
const showDatePicker = ref(false)
const showCalendar = ref(false)
const showYearMonthPicker = ref(false)
const currentFilter = ref('all')
const showAddTaskModal = ref(false)
const yearListRef = ref(null)
const monthListRef = ref(null)

const taskColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '##d7f0ef', '#84cc16']

const newTask = ref({
  name: '',
  description: '',
  startDate: todayStr,
  endDate: '',
  color: '#3b82f6'
})

const addTaskStartYear = ref(today.getFullYear())
const addTaskStartMonth = ref(today.getMonth() + 1)
const addTaskStartDay = ref(today.getDate())
const addTaskEndYear = ref(today.getFullYear())
const addTaskEndMonth = ref(today.getMonth() + 1)
const addTaskEndDay = ref(today.getDate())
const addTaskEndIsLongTerm = ref(true)
const showAddTaskStartDate = ref(false)
const showAddTaskEndDate = ref(false)
const addTaskStartYearList = ref(null)
const addTaskStartMonthList = ref(null)
const addTaskStartDayList = ref(null)
const addTaskEndYearList = ref(null)
const addTaskEndMonthList = ref(null)
const addTaskEndDayList = ref(null)

function getAddTaskDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

function scrollAddTaskDateToCenter(element, value, options) {
  if (!element) return
  const index = options.indexOf(value)
  if (index !== -1) {
    const itemHeight = 36
    const containerHeight = element.clientHeight
    const scrollTop = index * itemHeight - (containerHeight / 2) + (itemHeight / 2)
    element.scrollTop = Math.max(0, scrollTop)
  }
}

function selectAddTaskStartYear(year) {
  addTaskStartYear.value = year
  const maxDay = getAddTaskDaysInMonth(addTaskStartYear.value, addTaskStartMonth.value)
  if (addTaskStartDay.value > maxDay) {
    addTaskStartDay.value = maxDay
  }
}

function selectAddTaskStartMonth(month) {
  addTaskStartMonth.value = month
  const maxDay = getAddTaskDaysInMonth(addTaskStartYear.value, addTaskStartMonth.value)
  if (addTaskStartDay.value > maxDay) {
    addTaskStartDay.value = maxDay
  }
}

function selectAddTaskStartDay(day) {
  addTaskStartDay.value = day
}

function selectAddTaskEndYear(year) {
  addTaskEndIsLongTerm.value = false
  addTaskEndYear.value = year
  const maxDay = getAddTaskDaysInMonth(addTaskEndYear.value, addTaskEndMonth.value)
  if (addTaskEndDay.value > maxDay) {
    addTaskEndDay.value = maxDay
  }
}

function selectAddTaskEndMonth(month) {
  addTaskEndIsLongTerm.value = false
  addTaskEndMonth.value = month
  const maxDay = getAddTaskDaysInMonth(addTaskEndYear.value, addTaskEndMonth.value)
  if (addTaskEndDay.value > maxDay) {
    addTaskEndDay.value = maxDay
  }
}

function selectAddTaskEndDay(day) {
  addTaskEndIsLongTerm.value = false
  addTaskEndDay.value = day
}

function toggleAddTaskStartDate() {
  showAddTaskStartDate.value = !showAddTaskStartDate.value
  if (showAddTaskStartDate.value) {
    showAddTaskEndDate.value = false
    
    let date
    if (newTask.value.startDate && newTask.value.startDate !== '') {
      date = new Date(newTask.value.startDate)
      if (isNaN(date.getTime())) {
        date = today
      }
    } else {
      date = today
    }
    
    addTaskStartYear.value = date.getFullYear()
    addTaskStartMonth.value = date.getMonth() + 1
    addTaskStartDay.value = date.getDate()
    
    setTimeout(() => {
      scrollAddTaskDateToCenter(addTaskStartYearList.value, addTaskStartYear.value, availableYears.value)
      scrollAddTaskDateToCenter(addTaskStartMonthList.value, addTaskStartMonth.value, Array.from({length: 12}, (_, i) => i + 1))
      scrollAddTaskDateToCenter(addTaskStartDayList.value, addTaskStartDay.value, Array.from({length: getAddTaskDaysInMonth(addTaskStartYear.value, addTaskStartMonth.value)}, (_, i) => i + 1))
    }, 100)
  }
}

function toggleAddTaskEndDate() {
  showAddTaskEndDate.value = !showAddTaskEndDate.value
  if (showAddTaskEndDate.value) {
    showAddTaskStartDate.value = false
    
    let date = today
    if (!addTaskEndIsLongTerm.value && newTask.value.endDate && newTask.value.endDate !== '') {
      const parsedDate = new Date(newTask.value.endDate)
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate
      }
    }
    
    addTaskEndYear.value = date.getFullYear()
    addTaskEndMonth.value = date.getMonth() + 1
    addTaskEndDay.value = date.getDate()
    
    setTimeout(() => {
      scrollAddTaskDateToCenter(addTaskEndYearList.value, addTaskEndYear.value, availableYears.value)
      scrollAddTaskDateToCenter(addTaskEndMonthList.value, addTaskEndMonth.value, Array.from({length: 12}, (_, i) => i + 1))
      scrollAddTaskDateToCenter(addTaskEndDayList.value, addTaskEndDay.value, Array.from({length: getAddTaskDaysInMonth(addTaskEndYear.value, addTaskEndMonth.value)}, (_, i) => i + 1))
    }, 100)
  }
}

function setAddTaskEndLongTerm() {
  addTaskEndIsLongTerm.value = true
}

function saveAddTaskStartDate() {
  const year = addTaskStartYear.value
  const month = String(addTaskStartMonth.value).padStart(2, '0')
  const day = String(addTaskStartDay.value).padStart(2, '0')
  newTask.value.startDate = `${year}-${month}-${day}`
  showAddTaskStartDate.value = false
}

function saveAddTaskEndDate() {
  if (addTaskEndIsLongTerm.value) {
    newTask.value.endDate = ''
  } else {
    const year = addTaskEndYear.value
    const month = String(addTaskEndMonth.value).padStart(2, '0')
    const day = String(addTaskEndDay.value).padStart(2, '0')
    newTask.value.endDate = `${year}-${month}-${day}`
  }
  showAddTaskEndDate.value = false
}

function resetNewTask() {
  newTask.value = {
    name: '',
    description: '',
    startDate: todayStr,
    endDate: '',
    color: '#3b82f6'
  }
  addTaskEndIsLongTerm.value = true
}

function addNewTask() {
  if (!newTask.value.name.trim()) return
  
  addTask({
    name: newTask.value.name,
    description: newTask.value.description,
    startDate: newTask.value.startDate,
    endDate: addTaskEndIsLongTerm.value ? null : (newTask.value.endDate || null),
    color: newTask.value.color
  })
  
  showAddTaskModal.value = false
  resetNewTask()
}

const filters = [
  { label: '全部', value: 'all' },
  { label: '已完成', value: 'completed' },
  { label: '待办', value: 'todo' }
]

const weekDays = computed(() => {
  const result = []
  const date = new Date(selectedDate.value)
  const dayOfWeek = date.getDay()
  const monday = new Date(date)
  monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  
  const weekDayNames = ['一', '二', '三', '四', '五', '六', '日']
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = formatDate(d.getFullYear(), d.getMonth(), d.getDate())
    const tasks = getTasksForDate(dateStr)
    const completedCount = tasks.filter(t => isCompleted(t.id, dateStr)).length
    const isPerfect = tasks.length > 0 && completedCount === tasks.length
    
    result.push({
      date: dateStr,
      day: d.getDate(),
      weekDay: weekDayNames[i],
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDate.value,
      isPerfect: isPerfect,
      isFuture: dateStr > todayStr,
      hasTasks: tasks.length > 0
    })
  }
  return result
})

const currentYear = computed(() => {
  return new Date(selectedDate.value).getFullYear()
})

const currentMonth = computed(() => {
  return new Date(selectedDate.value).getMonth() + 1
})

const availableYears = computed(() => {
  const years = []
  const currentYearNum = new Date().getFullYear()
  for (let y = currentYearNum - 10; y <= currentYearNum + 5; y++) {
    years.push(y)
  }
  return years
})



const calendarDays = computed(() => {
  const date = new Date(selectedDate.value)
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = firstDay.getDay()
  
  const result = []
  const weekDayNames = ['日', '一', '二', '三', '四', '五', '六']
  
  for (let i = 0; i < startDayOfWeek; i++) {
    result.push({
      day: '',
      weekDay: '',
      date: null
    })
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day)
    const dateStr = formatDate(year, month, day)
    const tasks = getTasksForDate(dateStr)
    const completedCount = tasks.filter(t => isCompleted(t.id, dateStr)).length
    const isPerfect = tasks.length > 0 && completedCount === tasks.length
    
    result.push({
      day: day,
      weekDay: weekDayNames[d.getDay()],
      date: dateStr,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDate.value,
      isPerfect: isPerfect,
      isFuture: dateStr > todayStr,
      hasTasks: tasks.length > 0
    })
  }
  
  return result
})

const filteredTasks = computed(() => getTasksForDate(selectedDate.value))

const currentFilteredTasks = computed(() => {
  switch (currentFilter.value) {
    case 'completed':
      return filteredTasks.value.filter(t => isCompleted(t.id, selectedDate.value))
    case 'todo':
      return filteredTasks.value.filter(t => !isCompleted(t.id, selectedDate.value))
    default:
      return filteredTasks.value
  }
})

const completedCount = computed(() => filteredTasks.value.filter(t => isCompleted(t.id, selectedDate.value)).length)
const totalCount = computed(() => filteredTasks.value.length)
const completionRate = computed(() => totalCount.value > 0 ? Math.round((completedCount.value / totalCount.value) * 100) : 0)

const isPastDate = computed(() => selectedDate.value < todayStr)
const isFutureDate = computed(() => selectedDate.value > todayStr)

const displayDateStatus = computed(() => {
  if (selectedDate.value === todayStr) {
    return '今日'
  } else if (isPastDate.value) {
    const diff = Math.floor((new Date(todayStr) - new Date(selectedDate.value)) / (1000 * 60 * 60 * 24))
    if (diff === 1) return '昨天'
    if (diff === 2) return '前天'
    return `${diff}天前`
  } else {
    const diff = Math.floor((new Date(selectedDate.value) - new Date(todayStr)) / (1000 * 60 * 60 * 24))
    if (diff === 1) return '明天'
    return `${diff}天后`
  }
})

const monthStr = computed(() => {
  const date = new Date(selectedDate.value)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  return `${year}年${month}月`
})

const weekRangeStr = computed(() => {
  const date = new Date(selectedDate.value)
  const dayOfWeek = date.getDay()
  const monday = new Date(date)
  monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  
  const mondayMonth = monday.getMonth() + 1
  const mondayDay = monday.getDate()
  const sundayMonth = sunday.getMonth() + 1
  const sundayDay = sunday.getDate()
  
  if (mondayMonth === sundayMonth) {
    return `${mondayMonth}月${mondayDay}-${sundayDay}日`
  } else {
    return `${mondayMonth}月${mondayDay}日-${sundayMonth}月${sundayDay}日`
  }
})

function getDayButtonClass(day) {
  const classes = []
  
  if (day.isSelected) {
    classes.push('bg-lime-500 text-white')
    if (day.isPerfect) {
      classes.push('ring-2 ring-purple-500')
    }
  } else if (day.isToday) {
    classes.push('bg-gray-100 text-gray-800')
    if (day.isPerfect) {
      classes.push('ring-2 ring-purple-500')
    }
  } else if (day.isFuture) {
    classes.push('text-gray-700')
    if (day.isPerfect) {
      classes.push('bg-purple-50 text-purple-600')
    }
  } else {
    classes.push('hover:bg-gray-50 text-gray-700')
    if (day.isPerfect) {
      classes.push('bg-purple-50 text-purple-600')
    }
  }
  
  return classes.join(' ')
}

function getCalendarDayClass(day) {
  if (!day.date) return 'opacity-0'
  
  const classes = []
  
  if (day.isSelected) {
    classes.push('bg-lime-500 text-white')
    if (day.isPerfect) {
      classes.push('ring-2 ring-purple-500')
    }
  } else if (day.isToday) {
    classes.push('bg-gray-100 text-gray-800')
    if (day.isPerfect) {
      classes.push('ring-2 ring-purple-500')
    }
  } else if (day.isFuture) {
    classes.push('text-gray-700')
    if (day.isPerfect) {
      classes.push('bg-purple-50 text-purple-600')
    }
  } else {
    classes.push('hover:bg-gray-50 text-gray-700')
    if (day.isPerfect) {
      classes.push('bg-purple-50 text-purple-600')
    }
  }
  
  if (day.isPerfect && !day.isSelected && !day.isToday) {
    classes.push('bg-purple-50')
  }
  
  return classes.join(' ')
}

function getFilterCount(filterValue) {
  switch (filterValue) {
    case 'completed':
      return filteredTasks.value.filter(t => isCompleted(t.id, selectedDate.value)).length
    case 'todo':
      return filteredTasks.value.filter(t => !isCompleted(t.id, selectedDate.value)).length
    default:
      return filteredTasks.value.length
  }
}

function selectDate(dateStr) {
  selectedDate.value = dateStr
  if (showCalendar.value) {
    showCalendar.value = false
  }
}

function prevWeek() {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() - 7)
  selectedDate.value = date.toISOString().split('T')[0]
}

function nextWeek() {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() + 7)
  selectedDate.value = date.toISOString().split('T')[0]
}

function prevMonth() {
  const date = new Date(selectedDate.value)
  date.setMonth(date.getMonth() - 1)
  selectedDate.value = date.toISOString().split('T')[0]
}

function nextMonth() {
  const date = new Date(selectedDate.value)
  date.setMonth(date.getMonth() + 1)
  selectedDate.value = date.toISOString().split('T')[0]
}

function goToToday() {
  selectedDate.value = todayStr
  showDatePicker.value = false
}

function toggleComplete(task) {
  if (isFutureDate.value) return
  if (isCompleted(task.id, selectedDate.value)) {
    uncheckIn(task.id, selectedDate.value)
  } else {
    checkIn(task.id, '', selectedDate.value)
  }
}

function getTaskCardClass(taskId) {
  if (isCompleted(taskId, selectedDate.value)) {
    return 'bg-green-50 border-l-4 border-green-500'
  }
  if (isPastDate.value) {
    return 'bg-yellow-50 border-l-4 border-yellow-500'
  }
  return 'bg-white border-l-4 border-gray-300'
}

function getTaskButtonClass(taskId) {
  if (isCompleted(taskId, selectedDate.value)) {
    return 'bg-green-500 border-green-500'
  }
  if (isFutureDate.value) {
    return 'border-gray-200 text-gray-300 cursor-not-allowed'
  }
  if (isPastDate.value) {
    return 'border-yellow-400 hover:bg-yellow-50'
  }
  return 'border-gray-300 hover:border-primary-500'
}

function openTaskDetail(task) {
  emit('openDetail', task.id)
}

watch(showYearMonthPicker, async (newVal) => {
  if (newVal) {
    await nextTick()
    await nextTick()
    
    if (yearListRef.value) {
      const yearIndex = availableYears.value.indexOf(currentYear.value)
      if (yearIndex !== -1) {
        const firstItem = yearListRef.value.querySelector('div')
        const itemHeight = firstItem ? firstItem.offsetHeight : 36
        const containerHeight = yearListRef.value.clientHeight
        const scrollTop = yearIndex * itemHeight - (containerHeight / 2) + (itemHeight / 2)
        yearListRef.value.scrollTop = Math.max(0, scrollTop)
      }
    }
    
    if (monthListRef.value) {
      const firstItem = monthListRef.value.querySelector('div')
      const itemHeight = firstItem ? firstItem.offsetHeight : 36
      const containerHeight = monthListRef.value.clientHeight
      const scrollTop = (currentMonth.value - 1) * itemHeight - (containerHeight / 2) + (itemHeight / 2)
      monthListRef.value.scrollTop = Math.max(0, scrollTop)
    }
    
    setTimeout(() => {
      document.addEventListener('click', closeYearMonthPicker)
    }, 0)
  } else {
    document.removeEventListener('click', closeYearMonthPicker)
  }
})

function closeYearMonthPicker(e) {
  const picker = document.querySelector('.year-month-picker')
  if (picker && !picker.contains(e.target)) {
    showYearMonthPicker.value = false
  }
}

function selectYear(year) {
  const date = new Date(selectedDate.value)
  date.setFullYear(year)
  selectedDate.value = date.toISOString().split('T')[0]
  showYearMonthPicker.value = false
}

function selectMonth(month) {
  const date = new Date(selectedDate.value)
  date.setMonth(month - 1)
  selectedDate.value = date.toISOString().split('T')[0]
  showYearMonthPicker.value = false
}
</script>