<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
    <div v-if="appState.isLoading" class="flex items-center justify-center py-16">
      <div class="flex flex-col items-center">
        <Loader2 class="w-8 h-8 text-blue-500 animate-spin" />
        <p class="text-gray-500 mt-3">加载中...</p>
      </div>
    </div>
    
    <div v-else-if="!user.isLoggedIn" class="flex flex-col items-center justify-center py-16">
      <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 text-center border border-white/50">
        <div class="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus class="w-8 h-8 text-blue-500" />
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">请先登录</h3>
        <p class="text-gray-500 mb-4">登录后才能查看任务详情</p>
      </div>
    </div>
    
    <div v-else>
    <div class="bg-white/90 backdrop-blur-sm shadow-xl">
      <div class="flex items-center justify-between px-5 py-4">
        <button @click="$emit('back')" class="p-2.5 rounded-xl hover:bg-gradient-to-r from-blue-50 to-purple-50 transition-all duration-200">
          <ChevronLeft class="w-6 h-6 text-gray-600" />
        </button>
        <h1 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">任务详情</h1>
        <div class="w-10"></div>
      </div>
    </div>

    <div v-if="task" class="px-5 py-6">
      <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-5 border border-white/50">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-4">
            <div
              class="w-5 h-5 rounded-full flex-shrink-0 shadow-sm"
              :style="{ backgroundColor: task.color }"
            ></div>
            <h2 class="text-2xl font-bold text-gray-800">{{ task.name }}</h2>
          </div>
        </div>

        <p class="text-gray-600 mb-6 leading-relaxed">{{ task.description }}</p>

        <div class="flex items-center gap-4 text-sm text-gray-500">
          <span class="flex items-center bg-gray-50 px-4 py-2 rounded-2xl">
            <Calendar class="w-4 h-4 mr-2" />
            {{ formatDate(task.startDate) }} - {{ task.endDate ? formatDate(task.endDate) : '长期' }}
          </span>
        </div>
      </div>

      <div
        class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-5 border border-white/50"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-gray-800 text-lg">近7天打卡</h3>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex-1 flex gap-3">
            <div
              v-for="day in lastSevenDays"
              :key="day.date"
              class="flex flex-col items-center"
            >
              <span class="text-xs font-medium text-gray-500 mb-2">{{ day.weekDay }}</span>
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
                :class="getDayStatusClass(day)"
              >
                <Check v-if="day.completed" class="w-6 h-6 text-white" />
                <span v-else class="text-base text-gray-500 font-semibold">{{ day.day }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-5 border border-white/50">
        <h3 class="font-bold text-gray-800 text-lg mb-5">任务设置</h3>

        <div class="space-y-4">
          <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl overflow-hidden transition-all duration-300">
            <div
              @click="expandedSection = expandedSection === 'name' ? null : 'name'"
              class="flex items-center justify-between p-4 cursor-pointer hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
            >
              <label class="text-sm font-medium text-gray-600">任务名称</label>
              <div class="flex items-center gap-2">
                <span class="text-gray-800 font-medium">{{ task.name }}</span>
                <ChevronRight class="w-4 h-4 text-gray-400 transition-transform duration-300" :class="{ 'rotate-90': expandedSection === 'name' }" />
              </div>
            </div>
            <div v-if="expandedSection === 'name'" class="p-4 pt-0">
              <input
                v-model="editForm.name"
                class="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                placeholder="请输入任务名称"
                @keyup.enter="saveName"
              />
              <div class="flex gap-2 mt-3">
                <button @click="expandedSection = null" class="flex-1 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-all duration-200">
                  取消
                </button>
                <button @click="saveName" class="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200">
                  保存
                </button>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl overflow-hidden transition-all duration-300">
            <div
              @click="expandedSection = expandedSection === 'description' ? null : 'description'"
              class="flex items-center justify-between p-4 cursor-pointer hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
            >
              <label class="text-sm font-medium text-gray-600">任务描述</label>
              <div class="flex items-center gap-2">
                <span class="text-gray-800 truncate max-w-[150px] font-medium">{{ task.description || '暂无' }}</span>
                <ChevronRight class="w-4 h-4 text-gray-400 transition-transform duration-300" :class="{ 'rotate-90': expandedSection === 'description' }" />
              </div>
            </div>
            <div v-if="expandedSection === 'description'" class="p-4 pt-0">
              <textarea
                v-model="editForm.description"
                class="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none"
                rows="3"
                placeholder="请输入任务描述"
              ></textarea>
              <div class="flex gap-2 mt-3">
                <button @click="expandedSection = null" class="flex-1 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-all duration-200">
                  取消
                </button>
                <button @click="saveDescription" class="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200">
                  保存
                </button>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl overflow-hidden transition-all duration-300">
            <div
              @click="expandedSection = expandedSection === 'startDate' ? null : 'startDate'"
              class="flex items-center justify-between p-4 cursor-pointer hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
            >
              <label class="text-sm font-medium text-gray-600">开始日期</label>
              <div class="flex items-center gap-2">
                <span class="text-gray-800 font-medium">{{ formatDate(task.startDate) }}</span>
                <ChevronRight class="w-4 h-4 text-gray-400 transition-transform duration-300" :class="{ 'rotate-90': expandedSection === 'startDate' }" />
              </div>
            </div>
            <div v-if="expandedSection === 'startDate'" class="p-4 pt-0">
              <div v-if="dateError" class="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                {{ dateError }}
              </div>
              <div class="bg-white rounded-xl p-5 mb-3">
                <div class="grid grid-cols-3 gap-4">
                  <div class="text-center">
                    <div class="text-sm text-gray-600 font-semibold mb-3">年</div>
                    <div ref="startDateYearList" class="h-36 overflow-y-auto scrollbar-hide rounded-xl bg-gray-50">
                      <div
                        v-for="year in availableYears"
                        :key="year"
                        @click="selectStartDateYear(year)"
                        class="h-11 flex items-center justify-center text-lg cursor-pointer transition-all duration-200 rounded-lg"
                        :class="startDateYear === year ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-md' : 'hover:bg-gray-100 text-gray-700'"
                      >
                        {{ year }}
                      </div>
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="text-sm text-gray-600 font-semibold mb-3">月</div>
                    <div ref="startDateMonthList" class="h-36 overflow-y-auto scrollbar-hide rounded-xl bg-gray-50">
                      <div
                        v-for="month in 12"
                        :key="month"
                        @click="selectStartDateMonth(month)"
                        class="h-11 flex items-center justify-center text-lg cursor-pointer transition-all duration-200 rounded-lg"
                        :class="startDateMonth === month ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-md' : 'hover:bg-gray-100 text-gray-700'"
                      >
                        {{ month }}
                      </div>
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="text-sm text-gray-600 font-semibold mb-3">日</div>
                    <div ref="startDateDayList" class="h-36 overflow-y-auto scrollbar-hide rounded-xl bg-gray-50">
                      <div
                        v-for="day in getDaysInMonth(startDateYear, startDateMonth)"
                        :key="day"
                        @click="selectStartDateDay(day)"
                        class="h-11 flex items-center justify-center text-lg cursor-pointer transition-all duration-200 rounded-lg"
                        :class="startDateDay === day ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-md' : 'hover:bg-gray-100 text-gray-700'"
                      >
                        {{ day }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                <button @click="expandedSection = null" class="flex-1 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-all duration-200">
                  取消
                </button>
                <button @click="saveStartDate" class="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200">
                  保存
                </button>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl overflow-hidden transition-all duration-300">
            <div
              @click="expandedSection = expandedSection === 'endDate' ? null : 'endDate'"
              class="flex items-center justify-between p-4 cursor-pointer hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
            >
              <label class="text-sm font-medium text-gray-600">结束日期</label>
              <div class="flex items-center gap-2">
                <span class="text-gray-800 font-medium">{{ task.endDate ? formatDate(task.endDate) : '长期' }}</span>
                <ChevronRight class="w-4 h-4 text-gray-400 transition-transform duration-300" :class="{ 'rotate-90': expandedSection === 'endDate' }" />
              </div>
            </div>
            <div v-if="expandedSection === 'endDate'" class="p-4 pt-0">
              <div v-if="dateError" class="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                {{ dateError }}
              </div>
              <div class="mb-3">
                <button
                  @click="endDateIsLongTerm = !endDateIsLongTerm"
                  class="w-full px-4 py-2 rounded-xl font-medium transition-all duration-200 mb-3"
                  :class="endDateIsLongTerm 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                >
                  设为长期
                </button>
                <div class="bg-white rounded-xl p-5" :class="{ 'opacity-50': endDateIsLongTerm }">
                  <div class="grid grid-cols-3 gap-4">
                    <div class="text-center">
                      <div class="text-sm text-gray-600 font-semibold mb-3">年</div>
                      <div ref="endDateYearList" class="h-36 overflow-y-auto scrollbar-hide rounded-xl bg-gray-50">
                        <div
                          v-for="year in availableYears"
                          :key="year"
                          @click="selectEndDateYear(year)"
                          class="h-11 flex items-center justify-center text-lg cursor-pointer transition-all duration-200 rounded-lg"
                          :class="endDateYear === year ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-md' : 'hover:bg-gray-100 text-gray-700'"
                        >
                          {{ year }}
                        </div>
                      </div>
                    </div>
                    <div class="text-center">
                      <div class="text-sm text-gray-600 font-semibold mb-3">月</div>
                      <div ref="endDateMonthList" class="h-36 overflow-y-auto scrollbar-hide rounded-xl bg-gray-50">
                        <div
                          v-for="month in 12"
                          :key="month"
                          @click="selectEndDateMonth(month)"
                          class="h-11 flex items-center justify-center text-lg cursor-pointer transition-all duration-200 rounded-lg"
                          :class="endDateMonth === month ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-md' : 'hover:bg-gray-100 text-gray-700'"
                        >
                          {{ month }}
                        </div>
                      </div>
                    </div>
                    <div class="text-center">
                      <div class="text-sm text-gray-600 font-semibold mb-3">日</div>
                      <div ref="endDateDayList" class="h-36 overflow-y-auto scrollbar-hide rounded-xl bg-gray-50">
                        <div
                          v-for="day in getDaysInMonth(endDateYear, endDateMonth)"
                          :key="day"
                          @click="selectEndDateDay(day)"
                          class="h-11 flex items-center justify-center text-lg cursor-pointer transition-all duration-200 rounded-lg"
                          :class="endDateDay === day ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-md' : 'hover:bg-gray-100 text-gray-700'"
                        >
                          {{ day }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                <button @click="expandedSection = null" class="flex-1 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-all duration-200">
                  取消
                </button>
                <button @click="saveEndDate" class="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200">
                  保存
                </button>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl overflow-hidden transition-all duration-300">
            <div
              @click="expandedSection = expandedSection === 'color' ? null : 'color'"
              class="flex items-center justify-between p-4 cursor-pointer hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
            >
              <label class="text-sm font-medium text-gray-600">任务颜色</label>
              <div class="flex items-center gap-3">
                <div
                  class="w-7 h-7 rounded-full shadow-sm"
                  :style="{ backgroundColor: task.color }"
                ></div>
                <ChevronRight class="w-4 h-4 text-gray-400 transition-transform duration-300" :class="{ 'rotate-90': expandedSection === 'color' }" />
              </div>
            </div>
            <div v-if="expandedSection === 'color'" class="p-4 pt-0">
              <div class="flex flex-wrap gap-3 mb-3">
                <button
                  v-for="color in colors"
                  :key="color"
                  @click="editForm.color = color"
                  class="w-10 h-10 rounded-full transition-all duration-200 hover:scale-110"
                  :class="editForm.color === color ? 'ring-4 ring-offset-2 ring-blue-400 scale-110' : ''"
                  :style="{ backgroundColor: color }"
                ></button>
              </div>
              <div class="flex gap-2">
                <button @click="expandedSection = null" class="flex-1 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-all duration-200">
                  取消
                </button>
                <button @click="saveColor" class="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200">
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        @click="showCommentPage = true"
        class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/50"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-gray-800 text-lg">留言</h3>
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-500 font-medium">{{ comments.length }} 条</span>
            <ChevronRight class="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div v-if="comments.length === 0" class="text-center py-8 bg-gray-50 rounded-2xl">
          <div class="text-gray-400">暂无留言</div>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="comment in recentComments"
            :key="comment.timestamp"
            class="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-gray-500 font-medium">{{ formatDateTime(comment.timestamp) }}</span>
            </div>
            <p class="text-sm text-gray-800 leading-relaxed">{{ comment.comment }}</p>
          </div>
          <div v-if="comments.length > 2" class="text-center text-sm text-gray-400 py-2">
            查看全部 {{ comments.length }} 条留言
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCommentPage" class="fixed inset-0 bg-white z-50">
      <div class="bg-white shadow-sm sticky top-0 z-10">
        <div class="flex items-center justify-between px-4 py-3">
          <button @click="showCommentPage = false" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft class="w-6 h-6 text-gray-600" />
          </button>
          <h1 class="text-lg font-semibold text-gray-800">历史留言</h1>
          <div class="w-10"></div>
        </div>
      </div>

      <div class="px-4 py-4">
        <div v-if="comments.length === 0" class="text-center py-12">
          <div class="text-gray-400">暂无留言</div>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="p-4 bg-gray-50 rounded-xl"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-500">{{ formatDateTime(comment.timestamp) }}</span>
            </div>
            <p class="text-gray-800">{{ comment.comment }}</p>
          </div>
        </div>
      </div>

      <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div class="flex items-center gap-3">
          <input
            v-model="newComment"
            class="flex-1 input-field"
            placeholder="输入留言..."
            @keyup.enter="submitComment"
          />
          <button
            @click="submitComment"
            :disabled="!newComment.trim()"
            class="btn-primary px-6"
          >
            发送
          </button>
        </div>
      </div>
    </div>




    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { ChevronLeft, ChevronRight, Calendar, Check, X, Loader2, Plus } from 'lucide-vue-next'
import { tasks, records, updateTask, getTaskComments, checkIn, addComment, isCompleted, commentUpdateTrigger, appState } from '../stores/taskStore'
import { user } from '../stores/userStore'

const props = defineProps({
  taskId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['back', 'updated'])

const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

const showCommentPage = ref(false)
const expandedSection = ref(null)

const newComment = ref('')

const editForm = ref({
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  color: '#3b82f6'
})

const currentYear = new Date().getFullYear()
const availableYears = computed(() => {
  const years = []
  for (let y = currentYear - 20; y <= currentYear + 20; y++) {
    years.push(y)
  }
  return years
})

const startDateYear = ref(currentYear)
const startDateMonth = ref(1)
const startDateDay = ref(1)
const endDateYear = ref(currentYear)
const endDateMonth = ref(1)
const endDateDay = ref(1)
const endDateIsLongTerm = ref(false)

const startDateYearList = ref(null)
const startDateMonthList = ref(null)
const startDateDayList = ref(null)
const endDateYearList = ref(null)
const endDateMonthList = ref(null)
const endDateDayList = ref(null)
const dateError = ref('')

const task = computed(() => {
  return tasks.find(t => t.id === props.taskId)
})

const comments = computed(() => {
  const _ = commentUpdateTrigger.value
  return getTaskComments(props.taskId)
})

const recentComments = computed(() => {
  return comments.value.slice(0, 2)
})

const lastSevenDays = computed(() => {
  const result = []
  const today = new Date()
  const weekDayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const dayRecord = records[dateStr]?.[props.taskId]

    result.push({
      date: dateStr,
      day: date.getDate(),
      weekDay: weekDayNames[date.getDay()],
      completed: dayRecord?.completed || false,
      hasRecord: !!dayRecord
    })
  }

  return result
})

watch(expandedSection, async (newSection) => {
  dateError.value = ''
  
  if (newSection && task.value) {
    editForm.value = {
      name: task.value.name,
      description: task.value.description,
      startDate: task.value.startDate,
      endDate: task.value.endDate || '',
      color: task.value.color
    }

    if (newSection === 'startDate') {
      const date = new Date(editForm.value.startDate)
      startDateYear.value = date.getFullYear()
      startDateMonth.value = date.getMonth() + 1
      startDateDay.value = date.getDate()

      await nextTick()
      await nextTick()

      const yearOptions = availableYears.value
      scrollToCenter(startDateYearList.value, startDateYear.value, yearOptions)

      const monthOptions = Array.from({length: 12}, (_, i) => i + 1)
      scrollToCenter(startDateMonthList.value, startDateMonth.value, monthOptions)

      const dayCount = getDaysInMonth(startDateYear.value, startDateMonth.value)
      const dayOptions = Array.from({length: dayCount}, (_, i) => i + 1)
      scrollToCenter(startDateDayList.value, startDateDay.value, dayOptions)

    } else if (newSection === 'endDate' && editForm.value.endDate) {
      const date = new Date(editForm.value.endDate)
      endDateYear.value = date.getFullYear()
      endDateMonth.value = date.getMonth() + 1
      endDateDay.value = date.getDate()
      endDateIsLongTerm.value = false

      await nextTick()
      await nextTick()

      const yearOptions = availableYears.value
      scrollToCenter(endDateYearList.value, endDateYear.value, yearOptions)

      const monthOptions = Array.from({length: 12}, (_, i) => i + 1)
      scrollToCenter(endDateMonthList.value, endDateMonth.value, monthOptions)

      const dayCount = getDaysInMonth(endDateYear.value, endDateMonth.value)
      const dayOptions = Array.from({length: dayCount}, (_, i) => i + 1)
      scrollToCenter(endDateDayList.value, endDateDay.value, dayOptions)

    } else if (newSection === 'endDate') {
      endDateIsLongTerm.value = true
      const date = new Date()
      endDateYear.value = date.getFullYear()
      endDateMonth.value = date.getMonth() + 1
      endDateDay.value = date.getDate()

      await nextTick()
      await nextTick()

      const yearOptions = availableYears.value
      scrollToCenter(endDateYearList.value, endDateYear.value, yearOptions)

      const monthOptions = Array.from({length: 12}, (_, i) => i + 1)
      scrollToCenter(endDateMonthList.value, endDateMonth.value, monthOptions)

      const dayCount = getDaysInMonth(endDateYear.value, endDateMonth.value)
      const dayOptions = Array.from({length: dayCount}, (_, i) => i + 1)
      scrollToCenter(endDateDayList.value, endDateDay.value, dayOptions)
    }
  }
})

function getDayStatusClass(day) {
  if (day.completed) {
    return 'bg-green-500'
  }
  return 'bg-gray-100'
}

function saveName() {
  if (!editForm.value.name.trim()) return
  updateTask(props.taskId, { name: editForm.value.name })
  expandedSection.value = null
  emit('updated')
}

function saveDescription() {
  updateTask(props.taskId, { description: editForm.value.description })
  expandedSection.value = null
  emit('updated')
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

function scrollToCenter(element, value, options) {
  if (!element) return
  const index = options.indexOf(value)
  if (index !== -1) {
    const itemHeight = 44
    const containerHeight = element.clientHeight
    const scrollTop = index * itemHeight - (containerHeight / 2) + (itemHeight / 2)
    element.scrollTop = Math.max(0, scrollTop)
  }
}

function selectStartDateYear(year) {
  dateError.value = ''
  startDateYear.value = year
  const maxDay = getDaysInMonth(startDateYear.value, startDateMonth.value)
  if (startDateDay.value > maxDay) {
    startDateDay.value = maxDay
  }
}

function selectStartDateMonth(month) {
  dateError.value = ''
  startDateMonth.value = month
  const maxDay = getDaysInMonth(startDateYear.value, startDateMonth.value)
  if (startDateDay.value > maxDay) {
    startDateDay.value = maxDay
  }
}

function selectStartDateDay(day) {
  dateError.value = ''
  startDateDay.value = day
}

function selectEndDateYear(year) {
  dateError.value = ''
  endDateIsLongTerm.value = false
  endDateYear.value = year
  const maxDay = getDaysInMonth(endDateYear.value, endDateMonth.value)
  if (endDateDay.value > maxDay) {
    endDateDay.value = maxDay
  }
}

function selectEndDateMonth(month) {
  dateError.value = ''
  endDateIsLongTerm.value = false
  endDateMonth.value = month
  const maxDay = getDaysInMonth(endDateYear.value, endDateMonth.value)
  if (endDateDay.value > maxDay) {
    endDateDay.value = maxDay
  }
}

function selectEndDateDay(day) {
  dateError.value = ''
  endDateIsLongTerm.value = false
  endDateDay.value = day
}

function setEndDateEmpty() {
  dateError.value = ''
  endDateIsLongTerm.value = true
}

function validateDates() {
  dateError.value = ''
  if (endDateIsLongTerm.value) {
    return true
  }
  
  const startDate = new Date(startDateYear.value, startDateMonth.value - 1, startDateDay.value)
  const endDate = new Date(endDateYear.value, endDateMonth.value - 1, endDateDay.value)
  
  if (endDate < startDate) {
    dateError.value = '结束日期不能早于开始日期'
    return false
  }
  
  return true
}

function saveStartDate() {
  if (!validateDates()) {
    return
  }
  
  const year = startDateYear.value
  const month = String(startDateMonth.value).padStart(2, '0')
  const day = String(startDateDay.value).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`
  updateTask(props.taskId, { startDate: dateStr })
  expandedSection.value = null
  emit('updated')
}

function saveEndDate() {
  if (!validateDates()) {
    return
  }
  
  if (endDateIsLongTerm.value) {
    updateTask(props.taskId, { endDate: null })
  } else {
    const year = endDateYear.value
    const month = String(endDateMonth.value).padStart(2, '0')
    const day = String(endDateDay.value).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    updateTask(props.taskId, { endDate: dateStr })
  }
  expandedSection.value = null
  emit('updated')
}



function saveColor() {
  updateTask(props.taskId, { color: editForm.value.color })
  expandedSection.value = null
  emit('updated')
}

function submitComment() {
  if (!newComment.value.trim()) return
  const today = new Date().toISOString().split('T')[0]
  if (isCompleted(props.taskId, today)) {
    addComment(props.taskId, newComment.value, today)
  } else {
    checkIn(props.taskId, newComment.value, today)
  }
  newComment.value = ''
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDateTime(timestamp) {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

onMounted(() => {
  if (task.value) {
    editForm.value = {
      id: task.value.id,
      name: task.value.name,
      description: task.value.description,
      startDate: task.value.startDate,
      endDate: task.value.endDate || '',
      color: task.value.color
    }
  }
})
</script>
